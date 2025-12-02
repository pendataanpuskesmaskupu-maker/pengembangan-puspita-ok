import React, { useState, useMemo } from 'react';
import type { Participant } from '../../types';
import { usePosyanduData } from '../../hooks/usePosyanduData';
import { getCategoryLabel, formatDate, formatDetailedAge, getCategoryTheme } from '../../utils/helpers';
import { HomeVisitIcon } from '../icons';

interface HomeVisitViewProps {
    data: ReturnType<typeof usePosyanduData>;
    onEdit: (participant: Participant) => void;
    onAddNew: () => void;
    onImport: () => void;
    onRecordVisit: (participant: Participant) => void;
}

const EmptyTableState: React.FC<{ message: string; subMessage: string }> = ({ message, subMessage }) => (
    <tr>
        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
            <div className="flex flex-col items-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                </svg>
                <p className="text-lg font-medium text-gray-400 mb-2">{message}</p>
                <p className="text-sm text-gray-400">{subMessage}</p>
            </div>
        </td>
    </tr>
);

export const HomeVisitView: React.FC<HomeVisitViewProps> = ({ data, onEdit, onAddNew, onImport, onRecordVisit }) => {
    const { participants, deleteParticipant } = data;
    const [searchQuery, setSearchQuery] = useState('');

    const filteredParticipants = useMemo(() => {
        if (!searchQuery.trim()) {
            return participants;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return participants.filter(p =>
            p.nama.toLowerCase().includes(lowercasedQuery) ||
            p.nik.toLowerCase().includes(lowercasedQuery)
        );
    }, [participants, searchQuery]);

    const todayString = new Date().toISOString().split('T')[0];

    return (
        <div className="step-content opacity-100 transform-none space-y-8">
            <div className="bg-white rounded-xl p-4 md:p-8 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg mr-4 flex-shrink-0">
                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Kunjungan Rumah</h3>
                        <p className="text-gray-600 mt-1 text-sm md:text-base">Kelola dan lihat data peserta untuk program kunjungan rumah.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                     <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={onAddNew} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110 2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                             <span className="hidden sm:inline">Tambah Data</span>
                             <span className="sm:hidden">Tambah</span>
                        </button>
                        <button onClick={onImport} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            Import
                        </button>
                    </div>

                    <div className="relative w-full md:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                        </div>
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama atau NIK..." className="pl-10 pr-4 py-2.5 w-full md:w-80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-gray-900" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold hidden md:table-cell">No</th>
                                    <th className="px-6 py-4 text-left font-semibold">Nama</th>
                                    <th className="px-6 py-4 text-left font-semibold hidden md:table-cell">Kategori</th>
                                    <th className="px-6 py-4 text-left font-semibold hidden md:table-cell">Usia</th>
                                    <th className="px-6 py-4 text-left font-semibold hidden md:table-cell">Alamat</th>
                                    <th className="px-6 py-4 text-center font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredParticipants.length > 0 ? (
                                    filteredParticipants.map((p, index) => {
                                        const hasBeenVisitedToday = p.riwayatKunjunganRumah.some(visit => visit.tanggal_kunjungan === todayString);
                                        return (
                                            <tr key={p.__backendId} className="bg-white border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 hidden md:table-cell">{index + 1}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                    {p.nama}
                                                    <div className="md:hidden text-xs text-gray-500">{`${p.alamat}, RT ${p.rt}/${p.rw}`}</div>
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryTheme(p.kategori).badge}`}>{getCategoryLabel(p.kategori)}</span></td>
                                                <td className="px-6 py-4 text-sm text-gray-600 font-medium hidden md:table-cell">{formatDetailedAge(p.tanggal_lahir)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{`${p.alamat}, RT ${p.rt}/${p.rw}`}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                                         {hasBeenVisitedToday ? (
                                                            <button disabled className="flex items-center justify-center gap-1 text-sm bg-gray-400 text-white px-3 py-1.5 rounded-md cursor-not-allowed">
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                                                <span className="hidden sm:inline">Sudah Dikunjungi</span>
                                                            </button>
                                                         ) : (
                                                            <button onClick={() => onRecordVisit(p)} className="flex items-center justify-center gap-1 text-sm bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-md transition-colors">
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                                                                <span className="hidden sm:inline">Catat Kunjungan</span>
                                                            </button>
                                                         )}
                                                        <button onClick={() => onEdit(p)} className="flex items-center justify-center gap-1 text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md transition-colors">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                                            <span className="hidden sm:inline">Edit</span>
                                                        </button>
                                                        <button onClick={() => deleteParticipant(p.__backendId)} className="flex items-center justify-center gap-1 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md transition-colors">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                            <span className="hidden sm:inline">Hapus</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <EmptyTableState 
                                      message={searchQuery ? 'Data tidak ditemukan' : 'Belum ada data peserta'} 
                                      subMessage={searchQuery ? 'Coba kata kunci lain' : 'Klik "Tambah Data Peserta" untuk memulai'}
                                    />
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};