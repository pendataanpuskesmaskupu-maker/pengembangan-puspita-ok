import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Participant, QueueItem, MeasurementRecord, Desa } from '../types';

// GANTI URL INI DENGAN URL WEB APP DARI GOOGLE APPS SCRIPT ANDA
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby9BidZOg0oHuQ7L-15hOTtS69DYLUvwFAUH-6iTPYZ9nn9CIkYfpCLtHnA-GGeLYzf/exec';
const POLLING_INTERVAL = 5000; // Increased interval
const DEBOUNCE_SAVE_DELAY = 2000;
const SAVE_COOLDOWN_PERIOD = POLLING_INTERVAL * 2; // e.g., 10 seconds

// Type definition for the per-desa data structure
interface PosyanduData {
    participants: Participant[];
    queue: QueueItem[];
    serviceQueue: QueueItem[];
    educationQueue: QueueItem[];
}

const initialState: PosyanduData = {
    participants: [],
    queue: [],
    serviceQueue: [],
    educationQueue: [],
};

// Custom hook for debouncing
function useDebounce(value: any, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

const sanitizeIdentifier = (str: string | null | undefined): string | undefined => {
    if (typeof str !== 'string') return undefined;
    return str.replace(/[\s\uFEFF\u00A0]+/g, ' ').trim();
}

// Helper to check if a date string matches "today" in local time
const isToday = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};


export const usePosyanduData = (userDesa: string | null, posyanduSession: string | null, isAdmin: boolean): UsePosyanduDataResult => {
    const [data, setData] = useState<PosyanduData>(initialState);
    const [loading, setLoading] = useState(true);
    
    const isFetching = useRef(false);
    const isDirty = useRef(false);
    const saveInProgress = useRef(false);
    const lastActionTimestamp = useRef(0); // For cooldown
    const stateRef = useRef(data);
    stateRef.current = data;

    const { participants, queue, serviceQueue, educationQueue } = data;

    const markAsDirty = () => {
        isDirty.current = true;
    };

    const setParticipants: React.Dispatch<React.SetStateAction<Participant[]>> = (updater) => {
        markAsDirty();
        setData(prev => ({ ...prev, participants: typeof updater === 'function' ? updater(prev.participants) : updater }));
    };
    const setQueue: React.Dispatch<React.SetStateAction<QueueItem[]>> = (updater) => {
        markAsDirty();
        setData(prev => ({ ...prev, queue: typeof updater === 'function' ? updater(prev.queue) : updater }));
    };
    const setServiceQueue: React.Dispatch<React.SetStateAction<QueueItem[]>> = (updater) => {
        markAsDirty();
        setData(prev => ({ ...prev, serviceQueue: typeof updater === 'function' ? updater(prev.serviceQueue) : updater }));
    };
    const setEducationQueue: React.Dispatch<React.SetStateAction<QueueItem[]>> = (updater) => {
        markAsDirty();
        setData(prev => ({ ...prev, educationQueue: typeof updater === 'function' ? updater(prev.educationQueue) : updater }));
    };

    const fetchData = useCallback(async (isRefetch = false) => {
        if (!userDesa || isFetching.current) return;

        isFetching.current = true;
        if (!isRefetch) setLoading(true);

        try {
            const response = await fetch(`${APPS_SCRIPT_URL}?desa=${encodeURIComponent(userDesa)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const fetchedData = await response.json();
            if (fetchedData.error) throw new Error(fetchedData.error);
            
            if (isRefetch && isDirty.current) {
                console.warn("Blocking server update to protect local unsaved changes.");
                return;
            }

            const sanitizeParticipant = <T extends Participant | QueueItem>(p: T): T => ({
                ...p,
                alamat: sanitizeIdentifier(p.alamat) as Desa | undefined,
                nama_posyandu: sanitizeIdentifier(p.nama_posyandu),
            });
            
            // Use local date filtering logic
            setData({
                participants: (fetchedData.participants || []).map(sanitizeParticipant),
                queue: (fetchedData.queue || []).map(sanitizeParticipant).filter((p: QueueItem) => isToday(p.queuedAt)),
                serviceQueue: (fetchedData.serviceQueue || []).map(sanitizeParticipant).filter((p: QueueItem) => isToday(p.queuedAt)),
                educationQueue: (fetchedData.educationQueue || []).map(sanitizeParticipant).filter((p: QueueItem) => isToday(p.queuedAt)),
            });

        } catch (error) {
            console.error("Failed to fetch data:", error);
            // Don't throw error here to avoid breaking the UI, just log it.
        } finally {
            isFetching.current = false;
            if (!isRefetch) setLoading(false);
        }
    }, [userDesa]);

    useEffect(() => {
        if (userDesa) {
            isDirty.current = false;
            saveInProgress.current = false;
            fetchData(false);
        } else {
            setData(initialState);
            setLoading(false);
        }
    }, [userDesa, fetchData]);

    useEffect(() => {
        if (!userDesa) return;

        const intervalId = setInterval(() => {
            if (Date.now() - lastActionTimestamp.current < SAVE_COOLDOWN_PERIOD) {
                return;
            }

            if (!isDirty.current && !saveInProgress.current) {
                fetchData(true);
            }
        }, POLLING_INTERVAL);

        return () => clearInterval(intervalId);
    }, [userDesa, fetchData]);

    const debouncedData = useDebounce(data, DEBOUNCE_SAVE_DELAY);

    useEffect(() => {
        if (isAdmin || !userDesa || userDesa.toLowerCase() === 'semua' || loading || !isDirty.current || saveInProgress.current) {
            return;
        }

        const saveData = async () => {
            saveInProgress.current = true; 
            try {
                const response = await fetch(APPS_SCRIPT_URL, {
                    method: 'POST',
                    redirect: 'follow',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        desa: userDesa,
                        data: debouncedData,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Gagal menyimpan data. Server merespon dengan status: ${response.status}`);
                }
                
                isDirty.current = false;
                lastActionTimestamp.current = Date.now();
                
            } catch (error) {
                console.error("Failed to save data:", error);
                // We don't re-throw here to avoid showing an error toast for background saves
            } finally {
                saveInProgress.current = false; 
            }
        };

        saveData();

    }, [debouncedData, userDesa, loading, isAdmin]);

    const performAdminAction = useCallback(async (participant: Participant, action: 'save' | 'delete') => {
        saveInProgress.current = true;
        lastActionTimestamp.current = Date.now();
        try {
            const targetDesa = participant.alamat;
            if (!targetDesa) throw new Error("Peserta tidak memiliki 'desa' (alamat). Data tidak dapat disimpan.");
            
            const response = await fetch(`${APPS_SCRIPT_URL}?desa=${encodeURIComponent(targetDesa)}`);
            if (!response.ok) throw new Error(`Tidak dapat mengambil data untuk desa ${targetDesa}.`);
            
            const desaData = await response.json();
            if (desaData.error) throw new Error(desaData.error);

            let dataToSave;
            if (action === 'save') {
                const participantExists = (desaData.participants || []).some((p: Participant) => p.__backendId === participant.__backendId);
                let updatedParticipants;
                if (participantExists) {
                    updatedParticipants = (desaData.participants || []).map((p: Participant) => p.__backendId === participant.__backendId ? participant : p);
                } else {
                    updatedParticipants = [...(desaData.participants || []), participant];
                }
                dataToSave = { ...desaData, participants: updatedParticipants };
            } else { // delete
                 dataToSave = { 
                    ...desaData, 
                    participants: (desaData.participants || []).filter((p: Participant) => p.__backendId !== participant.__backendId),
                    queue: (desaData.queue || []).filter((p: QueueItem) => p.__backendId !== participant.__backendId),
                    serviceQueue: (desaData.serviceQueue || []).filter((p: QueueItem) => p.__backendId !== participant.__backendId),
                    educationQueue: (desaData.educationQueue || []).filter((p: QueueItem) => p.__backendId !== participant.__backendId),
                };
            }
            
            const saveResponse = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                redirect: 'follow',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ desa: targetDesa, data: dataToSave }),
            });

            if (!saveResponse.ok) throw new Error(`Gagal menyimpan perubahan admin untuk desa ${targetDesa}`);
        } catch (error) {
            console.error(`Gagal ${action} sebagai admin:`, error);
            await fetchData(true); // Revert UI on failure
            throw error;
        } finally {
            saveInProgress.current = false;
        }
    }, [fetchData]);

    const addOrUpdateParticipant = useCallback(async (participantData: Omit<Participant, '__backendId' | 'createdAt'>, id?: string): Promise<Participant | undefined> => {
        let newOrUpdatedParticipant: Participant | undefined;

        if (id) {
            const originalParticipant = stateRef.current.participants.find(p => p.__backendId === id);
            if (!originalParticipant) throw new Error("Peserta yang akan diupdate tidak ditemukan.");
            newOrUpdatedParticipant = { ...originalParticipant, ...participantData };
        } else {
            newOrUpdatedParticipant = {
                ...participantData,
                __backendId: new Date().toISOString() + Math.random(),
                createdAt: new Date().toISOString(),
                riwayatPengukuran: [],
                riwayatKunjunganRumah: []
            };
        }
        
        // Optimistic UI update
        setParticipants(prev => {
            if (id) {
                return prev.map(p => (p.__backendId === id ? newOrUpdatedParticipant! : p));
            } else {
                return [...prev, newOrUpdatedParticipant!];
            }
        });

        if (isAdmin) {
            await performAdminAction(newOrUpdatedParticipant, 'save');
        } else {
            markAsDirty();
            lastActionTimestamp.current = Date.now();
        }
        
        return newOrUpdatedParticipant;
    }, [isAdmin, performAdminAction]);

    const deleteParticipant = useCallback(async (participantId: string) => {
        const participantToDelete = stateRef.current.participants.find(p => p.__backendId === participantId);
        if (!participantToDelete) throw new Error("Gagal menghapus: Peserta tidak ditemukan.");

        // Optimistic UI update
        setData(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p.__backendId !== participantId),
            queue: prev.queue.filter(p => p.__backendId !== participantId),
            serviceQueue: prev.serviceQueue.filter(p => p.__backendId !== participantId),
            educationQueue: prev.educationQueue.filter(p => p.__backendId !== participantId),
        }));

        if (isAdmin) {
            await performAdminAction(participantToDelete, 'delete');
        } else {
            markAsDirty();
            lastActionTimestamp.current = Date.now();
        }
    }, [isAdmin, performAdminAction]);

    const updateParticipant = useCallback(async (participantId: string, updateData: Partial<Participant>, options: { addToServiceQueue?: boolean } = { addToServiceQueue: true }) => {
        // Find the original participant from the current state.
        const originalParticipant = stateRef.current.participants.find(p => p.__backendId === participantId);
        if (!originalParticipant) {
            throw new Error("Peserta yang akan diupdate tidak ditemukan.");
        }

        // 1. Create the fully updated participant object first.
        const newlyUpdatedParticipant = { ...originalParticipant, ...updateData };
        
        // Handle history update within this new object
        const originalHistory = originalParticipant.riwayatPengukuran || [];
        if (updateData.tanggal_pengukuran && (updateData.berat_badan !== undefined || updateData.tinggi_badan !== undefined || updateData.pemeriksaanHB !== undefined || updateData.lila !== undefined || updateData.lingkar_kepala !== undefined || updateData.lingkar_perut !== undefined)) {
            newlyUpdatedParticipant.riwayatPengukuran = [...originalHistory, { ...updateData } as MeasurementRecord];
        }

        // 2. Perform all state updates using this new, consistent object.
        setData(prev => {
            // Update the main participants list
            const newParticipants = prev.participants.map(p => 
                p.__backendId === participantId ? newlyUpdatedParticipant : p
            );

            let newQueue = prev.queue;
            let newServiceQueue = prev.serviceQueue;

            if (options.addToServiceQueue) {
                let movingItem = prev.queue.find(p => p.__backendId === participantId);
                
                // Fallback: If not in queue (e.g. filtered out or state lost), but we want to move it to service
                if (!movingItem) {
                     // Check if already in service queue to avoid duplicates
                     if (!prev.serviceQueue.some(sq => sq.__backendId === participantId)) {
                         // Construct a virtual queue item from participant data
                         // Calculate next queue number if needed, or reuse existing logic if available
                         const maxQueue = Math.max(0, ...[...prev.queue, ...prev.serviceQueue].map(q => q.queueNumber));
                         
                         movingItem = {
                             ...newlyUpdatedParticipant, 
                             nama_posyandu: posyanduSession || newlyUpdatedParticipant.nama_posyandu || '',
                             queueNumber: maxQueue + 1, // Assign new number if we lost track
                             queuedAt: new Date().toISOString(),
                             status: 'waiting' as const
                         } as QueueItem;
                     }
                }

                if (movingItem) {
                    newQueue = prev.queue.filter(p => p.__backendId !== participantId);
                    
                    const itemForServiceQueue: QueueItem = {
                        ...newlyUpdatedParticipant, // Use the fully updated object
                        queueNumber: movingItem.queueNumber,
                        queuedAt: movingItem.queuedAt,
                        status: 'waiting' as const // Ensure correct status
                    };

                    // Prevent duplicates in Service Queue just in case
                    if (!prev.serviceQueue.some(p => p.__backendId === participantId)) {
                        newServiceQueue = [...prev.serviceQueue, itemForServiceQueue].sort((a, b) => a.queueNumber - b.queueNumber);
                    }
                }
            }

            return {
                ...prev,
                participants: newParticipants,
                queue: newQueue,
                serviceQueue: newServiceQueue,
            };
        });

        // 3. Handle admin actions or marking as dirty.
        if (isAdmin) {
            await performAdminAction(newlyUpdatedParticipant, 'save');
        } else {
            markAsDirty();
            lastActionTimestamp.current = Date.now();
        }
    }, [isAdmin, performAdminAction, posyanduSession]);


    const addToQueue = useCallback((participantId: string) => {
        if (!posyanduSession) {
            throw new Error("Sesi Posyandu belum dipilih. Silakan logout dan login kembali.");
        }
        const participant = stateRef.current.participants.find(p => p.__backendId === participantId);
        if (participant) {
            const { queue, serviceQueue, educationQueue } = stateRef.current;
            
            const isAlreadyInAnyQueue = 
                queue.some(p => p.__backendId === participantId) ||
                serviceQueue.some(p => p.__backendId === participantId) ||
                educationQueue.some(p => p.__backendId === participantId);

            if (isAlreadyInAnyQueue) {
                throw new Error("Peserta ini sudah terdaftar dalam antrian.");
            }
            
            // Use local date checking for queue numbering to be consistent
            const allTodaysQueueNumbers = [...queue, ...serviceQueue, ...educationQueue]
                .filter(p => isToday(p.queuedAt))
                .map(p => p.queueNumber);

            const nextQueueNumber = (allTodaysQueueNumbers.length > 0 ? Math.max(0, ...allTodaysQueueNumbers) : 0) + 1;

            setQueue(prev => {
                const newQueueItem: QueueItem = {
                    ...participant,
                    nama_posyandu: posyanduSession,
                    queueNumber: nextQueueNumber,
                    status: 'waiting',
                    queuedAt: new Date().toISOString(),
                };
                return [...prev, newQueueItem];
            });
        }
    }, [posyanduSession]);

    const sessionFilteredData = useMemo(() => {
        const sortedParticipants = [...participants].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        if (!posyanduSession || isAdmin) {
            return { participants: sortedParticipants, queue, serviceQueue, educationQueue };
        }
        const lowercasedSession = posyanduSession.toLowerCase();
        return {
            participants: sortedParticipants.filter(p => p.nama_posyandu?.toLowerCase() === lowercasedSession),
            queue: queue.filter(p => p.nama_posyandu?.toLowerCase() === lowercasedSession),
            serviceQueue: serviceQueue.filter(p => p.nama_posyandu?.toLowerCase() === lowercasedSession),
            educationQueue: educationQueue.filter(p => p.nama_posyandu?.toLowerCase() === lowercasedSession)
        };
    }, [participants, queue, serviceQueue, educationQueue, posyanduSession, isAdmin]);

    return {
        loading,
        participants: sessionFilteredData.participants,
        queue: sessionFilteredData.queue,
        serviceQueue: sessionFilteredData.serviceQueue,
        educationQueue: sessionFilteredData.educationQueue,
        setParticipants,
        setQueue,
        setServiceQueue,
        setEducationQueue,
        addOrUpdateParticipant,
        deleteParticipant,
        updateParticipant,
        addToQueue,
    };
};

export type UsePosyanduDataResult = {
    loading: boolean;
    participants: Participant[];
    queue: QueueItem[];
    serviceQueue: QueueItem[];
    educationQueue: QueueItem[];
    setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
    setQueue: React.Dispatch<React.SetStateAction<QueueItem[]>>;
    setServiceQueue: React.Dispatch<React.SetStateAction<QueueItem[]>>;
    setEducationQueue: React.Dispatch<React.SetStateAction<QueueItem[]>>;
    addOrUpdateParticipant: (participantData: Omit<Participant, '__backendId' | 'createdAt'>, id?: string) => Promise<Participant | undefined>;
    deleteParticipant: (participantId: string) => Promise<void>;
    updateParticipant: (participantId: string, updateData: Partial<Participant>, options?: { addToServiceQueue?: boolean }) => Promise<void>;
    addToQueue: (participantId: string) => void;
};