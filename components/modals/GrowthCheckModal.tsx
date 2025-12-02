

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import type { Participant } from '../../types';
import { formatDetailedAge, getDevelopmentalMilestones, calculateAgeInMonths } from '../../utils/helpers';

interface GrowthCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (participantId: string, checkedMilestones: Record<string, boolean>) => void;
    participant: Participant | null;
}

export const GrowthCheckModal: React.FC<GrowthCheckModalProps> = ({ isOpen, onClose, onConfirm, participant }) => {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    const { milestones, bracketEnd, ageGroup } = useMemo(() => {
        if (!participant) return { milestones: [], bracketEnd: 0, ageGroup: '' };
        const ageInMonths = calculateAgeInMonths(participant.tanggal_lahir);
        return getDevelopmentalMilestones(ageInMonths);
    }, [participant]);

    const ageInMonths = useMemo(() => participant ? calculateAgeInMonths(participant.tanggal_lahir) : 0, [participant]);

    useEffect(() => {
        if (participant && isOpen) {
            const initialChecks: Record<string, boolean> = {};
            milestones.forEach(milestone => {
                initialChecks[milestone] = participant.riwayatPerkembangan?.[milestone] || false;
            });
            setCheckedItems(initialChecks);
        }
    }, [participant, milestones, isOpen]);

    if (!participant) return null;

    const handleCheckboxChange = (milestone: string) => {
        setCheckedItems(prev => ({
            ...prev,
            [milestone]: !prev[milestone],
        }));
    };

    const handleConfirm = () => {
        onConfirm(participant.__backendId, checkedItems);
    };
    
    const handleSkip = () => {
        onConfirm(participant.__backendId, {}); // Send empty object to not save changes
    };

    const hasUnmetMilestones = milestones.some(m => !checkedItems[m]);
    const isPastBracketEnd = Math.floor(ageInMonths) >= bracketEnd;
    const showRujukWarning = isPastBracketEnd && hasUnmetMilestones;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cek Perkembangan Balita" maxWidth="max-w-2xl">
            <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Informasi Peserta</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-black">
                        <div><span className="font-medium">Nama:</span> <span className="ml-2 font-semibold">{participant.nama}</span></div>
                        <div><span className="font-medium">Usia:</span> <span className="ml-2 font-semibold">{formatDetailedAge(participant.tanggal_lahir)}</span></div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-800 text-lg mb-3">Stimulasi Perkembangan (Kelompok Umur: {ageGroup})</h4>
                    <p className="text-sm text-gray-600 mb-4">
                        Tanyakan atau amati apakah anak sudah bisa melakukan hal-hal berikut. Centang jika "Ya".
                    </p>
                    <div className="space-y-3">
                        {milestones.map((milestone, index) => (
                            <label key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={checkedItems[milestone] || false}
                                    onChange={() => handleCheckboxChange(milestone)}
                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                                />
                                <span className="text-sm text-black">{milestone}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {showRujukWarning && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 mt-4 rounded-r-lg" role="alert">
                        <p className="font-bold">Perhatian!</p>
                        <p className="text-sm">Anak telah melewati batas usia untuk kelompok stimulasi ini namun belum semua pencapaian terpenuhi. Lakukan stimulasi lebih intensif dan pertimbangkan untuk merujuk ke Puskesmas jika tidak ada kemajuan.</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={handleSkip} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Lewati
                    </button>
                    <button type="button" onClick={handleConfirm} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Lanjutkan ke Antrian
                    </button>
                </div>
            </div>
        </Modal>
    );
};