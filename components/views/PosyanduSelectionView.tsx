import React, { useState, useMemo } from 'react';
import type { Desa } from '../../types';
import { LogoutIcon, PuskesmasLogo } from '../icons';

// This map must be kept in sync with the one in AddEditParticipantModal
const posyanduOptionsByDesa: Record<Desa, string[]> = {
    'Kupu': ['Saadiyah 1', 'Saadiyah 2', 'Saadiyah 3', 'Saadiyah 4'],
    'Ketanggungan': ['Jaya Sakti 1', 'Jaya Sakti 2', 'Jaya Sakti 3', 'Jaya Sakti 4'],
    'Pengarasan': ['Santika', 'Santoso', 'Nusa Indah', 'Kartika'],
    'Lawatan': ['Fajar 1', 'Fajar 2', 'Fajar 3', 'Fajar 4'],
    'Sidakaton': ['Sida Makmur', 'Sida Sehat', 'Sida Mukti', 'Sida Maju', 'Sampang', 'Sidarukun', 'Mekarmulya', 'Sidamulya 1', 'Sidamulya 2'],
    'Sidapurna': ['Sida Maju 1', 'Sida Maju 2', 'Sida Maju 3', 'Sida Maju 4', 'Sida Maju 5'],
    'Dukuhturi': ['Warga Sehat', 'Warga Sejahtera', 'Warga Mulya', 'Warga Jaya', 'Sida Maju 6', 'Sida Maju 7']
};

interface PosyanduSelectionViewProps {
    userDesa: string;
    onSelect: (posyanduName: string) => void;
    onLogout: () => void;
}

export const PosyanduSelectionView: React.FC<PosyanduSelectionViewProps> = ({ userDesa, onSelect, onLogout }) => {
    const availablePosyandus = useMemo(() => {
        return posyanduOptionsByDesa[userDesa as Desa] || [];
    }, [userDesa]);

    const [selectedPosyandu, setSelectedPosyandu] = useState<string>(availablePosyandus[0] || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPosyandu) {
            onSelect(selectedPosyandu);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 space-y-8">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <PuskesmasLogo />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Mulai Sesi Pelayanan</h1>
                    <p className="text-gray-600">
                        Anda login untuk desa <span className="font-bold text-blue-600">{userDesa}</span>.
                        <br />
                        Pilih Posyandu tempat Anda bertugas hari ini untuk memulai.
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="posyandu-selection"
                            className="text-sm font-medium text-gray-700 block mb-2"
                        >
                            Pilih Lokasi Posyandu
                        </label>
                        <select
                            id="posyandu-selection"
                            value={selectedPosyandu}
                            onChange={(e) => setSelectedPosyandu(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-lg"
                        >
                            {availablePosyandus.length > 0 ? (
                                availablePosyandus.map(posyandu => (
                                    <option key={posyandu} value={posyandu}>{posyandu}</option>
                                ))
                            ) : (
                                <option disabled>Tidak ada Posyandu terdaftar untuk desa ini.</option>
                            )}
                        </select>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                         <button
                            type="button"
                            onClick={onLogout}
                            className="w-full sm:w-auto flex items-center justify-center py-3 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                        >
                            <div className="w-5 h-5 mr-2">
                                <LogoutIcon />
                            </div>
                            Logout
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedPosyandu}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                        >
                            Mulai Sesi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};