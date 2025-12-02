import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Participant, QueueItem } from '../../types';
import type { UsePosyanduDataResult } from '../../hooks/usePosyanduData';
import { getCategoryLabel, formatDate, formatDetailedAge, getCategoryTheme, getPhbsTheme, calculateDetailedAge, getDueImmunization } from '../../utils/helpers';
import { HomeVisitIcon, EditIcon, QueueIcon, TrashIcon, SurveyIcon, CameraIcon } from '../icons';
import { extractIdentityData } from '../../utils/ocr';
import { Modal } from '../modals/Modal';
import { useToast } from '../../contexts/ToastContext';

interface RegistrationViewProps {
    data: UsePosyanduDataResult;
    onEdit: (participant: Participant) => void;
    onAddNew: () => void;
    onImport: () => void;
    onRecordVisit: (participant: Participant) => void;
    onSurvey: (participant: Participant) => void;
    isAdmin: boolean;
    onDelete: (participantId: string) => void;
    onRegisterScanned: (participantsToRegister: Partial<Participant>[]) => void;
    onOpenGrowthCheck: (participant: Participant) => void;
    apiKey: string | null; // Receive the API key as a prop
}

const EmptyTableState: React.FC<{ message: string; subMessage: string }> = ({ message, subMessage }) => (
    <tr>
        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
            <div className="flex flex-col items-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                </svg>
                <p className="text-lg font-medium text-gray-400 mb-2">{message}</p>
                <p className="text-sm text-gray-400">{subMessage}</p>
            </div>
        </td>
    </tr>
);

type ScanCandidate = {
    data: Partial<Participant>;
    status: 'ready_to_queue' | 'in_queue' | 'ready_to_register' | 'already_registered';
    participantId?: string;
};

export const RegistrationView: React.FC<RegistrationViewProps> = ({ data, onEdit, onAddNew, onImport, onRecordVisit, onSurvey, isAdmin, onDelete, onRegisterScanned, onOpenGrowthCheck, apiKey }) => {
    const { participants, queue, serviceQueue, educationQueue, addToQueue } = data;
    const { addToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPosyandu, setSelectedPosyandu] = useState('semua');
    const [currentPage, setCurrentPage] = useState(1);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{ isOpen: boolean; candidates: ScanCandidate[] }>({ isOpen: false, candidates: [] });
    const [selectedCandidates, setSelectedCandidates] = useState<Partial<Participant>[]>([]);
    
    const scanInputRef = useRef<HTMLInputElement>(null);
    const itemsPerPage = 10;
    
    if (!Array.isArray(participants)) {
        return (
            <div className="bg-white rounded-xl p-4 md:p-8 shadow-lg border border-gray-100">
                <p className="text-center text-gray-500">Memuat data peserta...</p>
            </div>
        );
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    const availablePosyandus = useMemo(() => {
        const posyanduSet = new Set<string>();
        participants.forEach(p => {
            if (p.nama_posyandu) {
                posyanduSet.add(p.nama_posyandu);
            }
        });
        return Array.from(posyanduSet).sort();
    }, [participants]);

    const filteredParticipants = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        const lowercasedSelectedPosyandu = selectedPosyandu.toLowerCase();
        
        return participants.filter(p => {
            const searchMatch = !lowercasedQuery ||
                p.nama.toLowerCase().includes(lowercasedQuery) ||
                p.nik.toLowerCase().includes(lowercasedQuery);
            
            const posyanduMatch = selectedPosyandu === 'semua' || p.nama_posyandu?.toLowerCase() === lowercasedSelectedPosyandu;

            return searchMatch && posyanduMatch;
        });
    }, [participants, searchQuery, selectedPosyandu]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedPosyandu]);
    
    const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
    const paginatedParticipants = useMemo(() => {
        return filteredParticipants.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredParticipants, currentPage, itemsPerPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const isFiltering = searchQuery.trim().length > 0 || selectedPosyandu !== 'semua';
    
    const allTodaysParticipants = useMemo(() => {
        const participantMap = new Map<string, QueueItem>();
        [...queue, ...serviceQueue, ...educationQueue].forEach(p => {
            participantMap.set(p.__backendId, p);
        });
        return Array.from(participantMap.values()).sort((a, b) => a.queueNumber - b.queueNumber);
    }, [queue, serviceQueue, educationQueue]);

    const queueStats = useMemo(() => {
        const totalAntrian = allTodaysParticipants.length;
        const selesai = allTodaysParticipants.filter(q => q.status === 'served').length;
        const sedangDilayani = totalAntrian - selesai;
        return { total: totalAntrian, served: selesai, serving: sedangDilayani };
    }, [allTodaysParticipants]);

    const getParticipantStatus = (participant: QueueItem) => {
        if (educationQueue.some(p => p.__backendId === participant.__backendId && p.status === 'served')) {
            return { text: 'Selesai', color: 'bg-green-100 text-green-800' };
        }
        if (educationQueue.some(p => p.__backendId === participant.__backendId)) {
            return { text: 'Menunggu Edukasi', color: 'bg-purple-100 text-purple-800' };
        }
        if (serviceQueue.some(p => p.__backendId === participant.__backendId)) {
            return { text: 'Menunggu Pelayanan', color: 'bg-yellow-100 text-yellow-800' };
        }
        if (queue.some(p => p.__backendId === participant.__backendId)) {
            return { text: 'Menunggu Pengukuran', color: 'bg-blue-100 text-blue-800' };
        }
        return { text: 'Terdaftar', color: 'bg-gray-100 text-gray-800' };
    };

    const handleSmartScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!apiKey) {
            addToast("Kunci API untuk fitur scan belum siap. Coba lagi sesaat.", "error");
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                const base64Data = base64String.split(',')[1];
                
                try {
                    const extractedDataArray = await extractIdentityData(base64Data, file.type, apiKey);
                    
                    if (extractedDataArray.length === 0 || !extractedDataArray[0]?.nik) {
                        addToast("Data tidak dapat terbaca dari gambar. Silakan coba lagi.", 'error');
                        setIsScanning(false);
                        return;
                    }
                    
                    if (extractedDataArray.length === 1) {
                        const extracted = extractedDataArray[0];
                        const foundParticipant = participants.find(p => p.nik === extracted.nik);
                        
                        if (foundParticipant) {
                            try {
                                addToQueue(foundParticipant.__backendId);
                                addToast(`Kehadiran ${foundParticipant.nama} berhasil dicatat.`, 'success');
                                setSearchQuery(foundParticipant.nama);
                            } catch (queueError) {
                                addToast((queueError as Error).message, 'error');
                            }
                        } else {
                            addToast(`Peserta baru terdeteksi. Membuka formulir pendaftaran...`, 'info');
                            onRegisterScanned([extracted]);
                        }
                    } else { // Multiple people from KK
                        const candidates: ScanCandidate[] = extractedDataArray.map(extracted => {
                            if (!extracted.nik || !extracted.nama) return { data: extracted, status: 'already_registered' }; // Invalid data, make it unselectable

                            const foundParticipant = participants.find(p => p.nik === extracted.nik);
                            if (!foundParticipant) {
                                return { data: extracted, status: 'ready_to_register' };
                            }

                            const isAlreadyInQueue = allTodaysParticipants.some(q => q.__backendId === foundParticipant.__backendId);
                            if (isAlreadyInQueue) {
                                return { data: extracted, status: 'in_queue', participantId: foundParticipant.__backendId };
                            }
                            
                            return { data: extracted, status: 'ready_to_queue', participantId: foundParticipant.__backendId };
                        });
                        
                        setSelectedCandidates(candidates.filter(c => c.status === 'ready_to_queue' || c.status === 'ready_to_register').map(c => c.data));
                        setScanResult({ isOpen: true, candidates });
                    }
                } catch (error) {
                    addToast(`Gagal memproses gambar: ${(error as Error).message}`, 'error');
                } finally {
                    setIsScanning(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            setIsScanning(false);
            addToast(`Error: ${(error as Error).message}`, 'error');
        }
        e.target.value = '';
    };

    const handleConfirmScanResult = () => {
        if (selectedCandidates.length === 0) {
            addToast("Tidak ada peserta yang dipilih.", 'info');
            return;
        }

        const toQueue: string[] = [];
        const toRegister: Partial<Participant>[] = [];

        selectedCandidates.forEach(selected => {
            const candidate = scanResult.candidates.find(c => c.data.nik === selected.nik);
            if (candidate?.status === 'ready_to_queue' && candidate.participantId) {
                toQueue.push(candidate.participantId);
            } else if (candidate?.status === 'ready_to_register') {
                toRegister.push(candidate.data);
            }
        });

        let queueSuccessCount = 0;
        toQueue.forEach(id => {
            try {
                addToQueue(id);
                queueSuccessCount++;
            } catch (e) {
                addToast((e as Error).message, 'error');
            }
        });

        if (queueSuccessCount > 0) {
            addToast(`${queueSuccessCount} peserta berhasil dicatat kehadirannya.`, 'success');
        }
        
        if (toRegister.length > 0) {
            addToast(`${toRegister.length} peserta baru akan didaftarkan.`, 'info');
            onRegisterScanned(toRegister);
        }
        
        setScanResult({ isOpen: false, candidates: [] });
    };

    return (
        <div className="step-content opacity-100 transform-none space-y-8">
            <div className="bg-white rounded-xl p-4 md:p-8 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg mr-4 flex-shrink-0">1</div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800">{isAdmin ? 'Data Sasaran' : 'Pendaftaran'}</h3>
                        <p className="text-gray-600 mt-1 text-sm md:text-base">Registrasi dan kelola peserta posyandu.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                    {!isAdmin && (
                        <div className="flex flex-wrap gap-4">
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment" 
                                ref={scanInputRef} 
                                className="hidden"
                                onChange={handleSmartScan}
                            />
                            <button 
                                onClick={() => scanInputRef.current?.click()} 
                                disabled={isScanning || !apiKey}
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                                title={!apiKey ? "Fitur scan sedang dimuat..." : "Scan KTP/KIA/KK"}
                            >
                                {isScanning ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-5 h-5 mr-2"><CameraIcon /></div>
                                        <span>Scan Cerdas</span>
                                    </>
                                )}
                            </button>
                            <button onClick={onAddNew} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                Tambah Manual
                            </button>
                            <button onClick={onImport} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                Import
                            </button>
                        </div>
                    )}

                    <div className={`flex flex-col md:flex-row gap-4 ${isAdmin ? 'md:ml-auto' : ''}`}>
                        <div className="flex-1">
                             <label htmlFor="posyandu-filter" className="sr-only">Filter berdasarkan Posyandu</label>
                             <select
                                id="posyandu-filter"
                                value={selectedPosyandu}
                                onChange={(e) => setSelectedPosyandu(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-gray-900"
                            >
                                <option value="semua">Semua Posyandu</option>
                                {availablePosyandus.map(posyandu => (
                                    <option key={posyandu} value={posyandu}>{posyandu}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                            </div>
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama atau NIK..." className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-gray-900" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold hidden md:table-cell">No</th>
                                    <th className="px-6 py-4 text-left font-semibold">Nama</th>
                                    <th className="px-6 py-4 text-left font-semibold hidden md:table-cell">Posyandu</th>
                                    <th className="px-6 py-4 text-left font-semibold hidden md:table-cell">NIK</th>
                                    <th className="px-6 py-4 text-left font-semibold hidden md:table-cell">Usia</th>
                                    <th className="px-6 py-4 text-left font-semibold hidden md:table-cell">Status</th>
                                    <th className="px-6 py-4 text-center font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedParticipants.length > 0 ? (
                                    paginatedParticipants.map((p, index) => {
                                        const isAlreadyInQueue = allTodaysParticipants.some(q => q.__backendId === p.__backendId);

                                        const hasBeenServedThisMonth = isAlreadyInQueue ||
                                                                       p.tanggal_pelayanan?.startsWith(currentMonth) ||
                                                                       p.riwayatKunjunganRumah.some(visit => visit.tanggal_kunjungan.startsWith(currentMonth));

                                        const showSurveyButton = !isAdmin && (p.kategori === 'dewasa' || p.kategori === 'lansia' || p.kategori === 'ibu-hamil');
                                        
                                        const genderClass = p.jenis_kelamin === 'Perempuan' ? 'bg-pink-50 hover:bg-pink-100' : 'bg-blue-50 hover:bg-blue-100';

                                        const ageDetails = calculateDetailedAge(p.tanggal_lahir);
                                        const ageInMonths = ageDetails.years * 12 + ageDetails.months;
                                        const showPkatReminder = p.kategori === 'balita' && ageInMonths === 5;
                                        const dueImmunization = getDueImmunization(p);

                                        return (
                                            <tr key={p.__backendId} className={`border-b last:border-b-0 transition-colors duration-200 ${genderClass}`}>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 hidden md:table-cell">{((currentPage - 1) * itemsPerPage) + index + 1}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                    <span>{p.nama}</span>
                                                    {showPkatReminder && (
                                                        <span className="text-xs font-semibold text-yellow-800 bg-yellow-200 px-2 py-0.5 rounded-full whitespace-nowrap">PKAT Bulan Depan</span>
                                                    )}
                                                     {dueImmunization && (
                                                        <span className="text-xs font-semibold text-blue-800 bg-blue-200 px-2 py-0.5 rounded-full whitespace-nowrap">Jadwal Imunisasi: {dueImmunization}</span>
                                                    )}
                                                  </div>
                                                  <div className="md:hidden text-xs text-gray-500 font-semibold">{p.nama_posyandu || '-'}</div>
                                                  <div className="md:hidden text-xs text-gray-500">{p.nik}</div>
                                                  <div className="md:hidden text-xs text-gray-500">{formatDetailedAge(p.tanggal_lahir)}</div>
                                                  <div className="md:hidden mt-1 flex flex-col items-start gap-1">
                                                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryTheme(p.kategori).badge}`}>{getCategoryLabel(p.kategori)}</span>
                                                      {p.phbsClassification && <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPhbsTheme(p.phbsClassification).badge}`}>{p.phbsClassification}</span>}
                                                  </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{p.nama_posyandu || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 font-mono hidden md:table-cell">{p.nik}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 font-medium hidden md:table-cell">{formatDetailedAge(p.tanggal_lahir)}</td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getCategoryTheme(p.kategori).badge}`}>{getCategoryLabel(p.kategori)}</span>
                                                        {p.phbsClassification ? (
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getPhbsTheme(p.phbsClassification).badge}`}>{p.phbsClassification}</span>
                                                        ) : (
                                                            <span className="text-xs">-</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-4 md:px-6">
                                                     {isAdmin ? (
                                                        <div className="flex flex-wrap items-center justify-center gap-2">
                                                            <button onClick={() => onEdit(p)} className="flex items-center justify-center gap-1 text-sm bg-green-500 hover:bg-green-600 text-white p-2 md:px-3 rounded-lg transition-colors" title="Edit Data Peserta" aria-label="Edit Data Peserta">
                                                                <div className="w-4 h-4"><EditIcon /></div>
                                                                <span className="hidden md:inline">Edit</span>
                                                            </button>
                                                            <button onClick={() => onDelete(p.__backendId)} className="flex items-center justify-center gap-1 text-sm bg-red-500 hover:bg-red-600 text-white p-2 md:px-3 rounded-lg transition-colors" title="Hapus Data Peserta" aria-label="Hapus Data Peserta">
                                                                <div className="w-4 h-4"><TrashIcon /></div>
                                                                <span className="hidden md:inline">Hapus</span>
                                                            </button>
                                                        </div>
                                                     ) : (
                                                        <div className="text-right space-y-2">
                                                            <div className="inline-flex items-center gap-2">
                                                                {hasBeenServedThisMonth ? (
                                                                    <button className="flex items-center justify-center gap-1 text-sm bg-gray-500 text-white p-2 md:px-3 rounded-lg cursor-not-allowed" disabled title={isAlreadyInQueue ? "Sudah terdaftar dalam antrian" : "Sudah terlayani bulan ini"}>
                                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                                        <span className="hidden md:inline">{isAlreadyInQueue ? 'Terdaftar' : 'Terlayani'}</span>
                                                                    </button>
                                                                ) : (
                                                                    <button onClick={() => {
                                                                        if (p.kategori === 'balita') {
                                                                            onOpenGrowthCheck(p);
                                                                        } else {
                                                                            try {
                                                                                addToQueue(p.__backendId);
                                                                                addToast(`${p.nama} berhasil ditambahkan ke antrian.`, 'success');
                                                                            } catch (e) {
                                                                                addToast((e as Error).message, 'error');
                                                                            }
                                                                        }
                                                                    }} className="flex items-center justify-center gap-1 text-sm bg-blue-500 hover:bg-blue-600 text-white p-2 md:px-3 rounded-lg transition-colors" title="Daftarkan ke antrian" aria-label="Daftarkan ke antrian">
                                                                        <div className="w-4 h-4"><QueueIcon /></div>
                                                                        <span className="hidden md:inline">Daftar</span>
                                                                    </button>
                                                                )}
                                                                <button onClick={() => onRecordVisit(p)} disabled={hasBeenServedThisMonth} title={hasBeenServedThisMonth ? "Peserta sudah terlayani bulan ini" : "Catat Kunjungan Rumah"} aria-label={hasBeenServedThisMonth ? "Peserta sudah terlayani bulan ini" : "Catat Kunjungan Rumah"} className="flex items-center justify-center gap-1 text-sm bg-purple-500 hover:bg-purple-600 text-white p-2 md:px-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                                                    <div className="w-4 h-4"><HomeVisitIcon /></div>
                                                                    <span className="hidden md:inline">Kunjungan</span>
                                                                </button>
                                                                {showSurveyButton && (
                                                                    <button onClick={() => onSurvey(p)} title="Isi Survei Keluarga" aria-label="Isi Survei Keluarga" className="flex items-center justify-center gap-1 text-sm bg-teal-500 hover:bg-teal-600 text-white p-2 md:px-3 rounded-lg transition-colors">
                                                                        <div className="w-4 h-4"><SurveyIcon /></div>
                                                                        <span className="hidden md:inline">Survei</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="inline-flex items-center gap-2">
                                                                <button onClick={() => onEdit(p)} className="flex items-center justify-center gap-1 text-sm bg-green-500 hover:bg-green-600 text-white p-2 md:px-3 rounded-lg transition-colors" title="Edit Data Peserta" aria-label="Edit Data Peserta">
                                                                    <div className="w-4 h-4"><EditIcon /></div>
                                                                    <span className="hidden md:inline">Edit</span>
                                                                </button>
                                                                <button onClick={() => onDelete(p.__backendId)} className="flex items-center justify-center gap-1 text-sm bg-red-500 hover:bg-red-600 text-white p-2 md:px-3 rounded-lg transition-colors" title="Hapus Data Peserta" aria-label="Hapus Data Peserta">
                                                                    <div className="w-4 h-4"><TrashIcon /></div>
                                                                    <span className="hidden md:inline">Hapus</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                     )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <EmptyTableState 
                                      message={isFiltering ? 'Data tidak ditemukan' : 'Belum ada data peserta'} 
                                      subMessage={isFiltering ? 'Coba kata kunci atau filter lain.' : 'Klik "Tambah Manual" atau "Scan Cerdas" untuk memulai.'}
                                    />
                                )}
                            </tbody>
                        </table>
                    </div>
                     {totalPages > 1 && (
                       <div className="flex justify-center items-center gap-4 p-4 border-t bg-gray-50">
                           <button
                               onClick={() => handlePageChange(currentPage - 1)}
                               disabled={currentPage === 1}
                               className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                               Sebelumnya
                           </button>
                           <span className="text-sm text-gray-700">
                               Halaman {currentPage} dari {totalPages}
                           </span>
                           <button
                               onClick={() => handlePageChange(currentPage + 1)}
                               disabled={currentPage === totalPages}
                               className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                               Berikutnya
                           </button>
                       </div>
                   )}
                </div>
            </div>
            
            {!isAdmin && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4">
                        <h3 className="text-xl font-bold text-white">Daftar Hadir Peserta Posyandu</h3>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-3 gap-4">
                           <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl text-center border border-blue-200">
                              <div className="text-xl font-bold text-blue-600 mb-1">{queueStats.total}</div>
                              <div className="text-xs text-blue-700 font-medium">Total Hadir Hari Ini</div>
                           </div>
                           <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl text-center border border-purple-200">
                              <div className="text-xl font-bold text-purple-600 mb-1">{queueStats.serving}</div>
                              <div className="text-xs text-purple-700 font-medium">Dalam Proses</div>
                           </div>
                           <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl text-center border-b-2 border-green-200">
                              <div className="text-xl font-bold text-green-600 mb-1">{queueStats.served}</div>
                              <div className="text-xs text-green-700 font-medium">Selesai Dilayani</div>
                           </div>
                        </div>
                    </div>
                     <div className="overflow-x-auto max-h-[400px]">
                         <table className="w-full">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">No.</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">Kategori</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Tahapan</th>
                                </tr>
                            </thead>
                             <tbody>
                                {allTodaysParticipants.length > 0 ? (
                                    allTodaysParticipants.map(p => {
                                        const status = getParticipantStatus(p);
                                        const genderClass = p.jenis_kelamin === 'Perempuan' ? 'hover:bg-pink-50' : 'hover:bg-blue-50';
                                        return (
                                            <tr key={p.__backendId} className={`border-b ${genderClass}`}>
                                                <td className="px-4 py-3 font-bold text-gray-800">{p.queueNumber}</td>
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {p.nama}
                                                    <div className="sm:hidden text-xs mt-1">
                                                        <span className={`px-2 py-1 font-semibold rounded-full ${getCategoryTheme(p.kategori).badge}`}>{getCategoryLabel(p.kategori)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 hidden sm:table-cell">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryTheme(p.kategori).badge}`}>{getCategoryLabel(p.kategori)}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>{status.text}</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                            <p>Belum ada peserta yang hadir hari ini.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <Modal isOpen={scanResult.isOpen} onClose={() => setScanResult({ isOpen: false, candidates: [] })} title="Hasil Scan Cerdas" maxWidth="max-w-2xl">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Pilih peserta yang ingin Anda proses dari hasil scan. Anda bisa mendaftarkan kehadiran peserta yang sudah ada, atau mendaftarkan peserta baru.</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                        {scanResult.candidates.map((candidate, i) => {
                            const isSelected = selectedCandidates.some(c => c.nik === candidate.data.nik);
                            const isDisabled = candidate.status === 'in_queue' || candidate.status === 'already_registered';
                            const statusMap = {
                                ready_to_queue: { text: 'Siap Hadir', color: 'bg-blue-100 text-blue-800' },
                                in_queue: { text: 'Sudah di Antrian', color: 'bg-gray-100 text-gray-800' },
                                ready_to_register: { text: 'Daftar Baru', color: 'bg-green-100 text-green-800' },
                                already_registered: { text: 'NIK Sudah Ada', color: 'bg-yellow-100 text-yellow-800' }
                            };
                            return (
                                <label key={i} className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${isDisabled ? 'bg-gray-50 opacity-60' : 'cursor-pointer hover:bg-gray-50'} ${isSelected ? 'bg-blue-50 border-blue-400' : 'bg-white'}`}>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        disabled={isDisabled}
                                        onChange={() => {
                                            setSelectedCandidates(prev => {
                                                if (isSelected) {
                                                    return prev.filter(c => c.nik !== candidate.data.nik);
                                                } else {
                                                    return [...prev, candidate.data];
                                                }
                                            });
                                        }}
                                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{candidate.data.nama}</p>
                                        <p className="text-xs text-gray-500 font-mono">{candidate.data.nik}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusMap[candidate.status].color}`}>{statusMap[candidate.status].text}</span>
                                </label>
                            )
                        })}
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button type="button" onClick={() => setScanResult({ isOpen: false, candidates: [] })} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Batal</button>
                        <button type="button" onClick={handleConfirmScanResult} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Konfirmasi</button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};