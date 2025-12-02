import React, { useMemo } from 'react';
import type { Participant } from '../../types';
import type { UsePosyanduDataResult } from '../../hooks/usePosyanduData';
import { getCategoryLabel, formatDate, getCategoryTheme, formatDetailedAge } from '../../utils/helpers';

interface RecordingViewProps {
    data: UsePosyanduDataResult;
    onViewHistory: (participant: Participant) => void;
}

export const RecordingView: React.FC<RecordingViewProps> = ({ data, onViewHistory }) => {
    // Sort by queue number descending to show newest first
    const participantsInServiceQueue = useMemo(() => 
        [...data.serviceQueue].sort((a, b) => b.queueNumber - a.queueNumber),
        [data.serviceQueue]
    );

    return (
        <div className="step-content opacity-100 transform-none">
            <div className="bg-white rounded-xl p-4 md:p-8 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg mr-4 flex-shrink-0">3</div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Pencatatan</h3>
                        <p className="text-gray-600 mt-1 text-sm md:text-base">Peserta yang telah diukur dan siap untuk pelayanan selanjutnya.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold hidden sm:table-cell">No. Antrian</th>
                                    <th className="px-6 py-4 text-left font-semibold">Nama &amp; Status Gizi</th>
                                    <th className="px-6 py-4 text-left font-semibold hidden sm:table-cell">Kategori</th>
                                    <th className="px-6 py-4 text-left font-semibold hidden sm:table-cell">Status BB/U</th>
                                    <th className="px-6 py-4 text-left font-semibold hidden sm:table-cell">Status TB/U</th>
                                    <th className="px-6 py-4 text-left font-semibold hidden sm:table-cell">Status BB/TB</th>
                                    <th className="px-6 py-4 text-left font-semibold hidden sm:table-cell">Kenaikan BB</th>
                                    <th className="px-6 py-4 text-left font-semibold hidden sm:table-cell">BMI/IMT</th>
                                    <th className="px-6 py-4 text-center font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participantsInServiceQueue.length > 0 ? (
                                    participantsInServiceQueue.map((p) => {
                                        const genderClass = p.jenis_kelamin === 'Perempuan' ? 'bg-pink-50 hover:bg-pink-100' : 'bg-blue-50 hover:bg-blue-100';
                                        const statusKenaikan = p.status_kenaikan_berat;
                                        const statusColor = statusKenaikan === 'Naik' ? 'text-green-600' : statusKenaikan === 'Tidak Naik' ? 'text-red-600' : 'text-blue-600';
                                        return (
                                            <tr key={p.__backendId} className={`border-b ${genderClass}`}>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 hidden sm:table-cell">{p.queueNumber}</td>
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    <div className="font-semibold text-gray-900">{p.nama}</div>
                                                    <div className="text-xs text-gray-500 font-normal">{formatDetailedAge(p.tanggal_lahir)}</div>
                                                    <div className="sm:hidden mt-2 space-y-1 text-xs text-black">
                                                        <div><span className="font-medium text-gray-700">No:</span> {p.queueNumber}</div>
                                                        <div>
                                                            <span className="font-medium text-gray-700">Kategori:</span> 
                                                            <span className={`ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full ${getCategoryTheme(p.kategori).badge}`}>{getCategoryLabel(p.kategori)}</span>
                                                        </div>
                                                        <div><span className="font-medium text-gray-700">BB/U:</span> {p.status_bb_u || '-'}</div>
                                                        <div><span className="font-medium text-gray-700">TB/U:</span> {p.status_tb_u || '-'}</div>
                                                        <div><span className="font-medium text-gray-700">BB/TB:</span> {p.status_bb_tb || '-'}</div>
                                                        {statusKenaikan && <div><span className="font-medium text-gray-700">Kenaikan BB:</span> <span className={`font-bold ${statusColor}`}>{statusKenaikan}</span></div>}
                                                        <div><span className="font-medium text-gray-700">BMI/IMT:</span> {p.status_bmi ? `${p.status_bmi} (${p.status_kategori_bmi || 'N/A'})` : (p.status_kategori_bmi || '-')}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden sm:table-cell"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryTheme(p.kategori).badge}`}>{getCategoryLabel(p.kategori)}</span></td>
                                                <td className="px-6 py-4 text-sm text-black hidden sm:table-cell">{p.status_bb_u || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-black hidden sm:table-cell">{p.status_tb_u || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-black hidden sm:table-cell">{p.status_bb_tb || '-'}</td>
                                                <td className={`px-6 py-4 text-sm font-semibold hidden sm:table-cell ${statusColor}`}>{statusKenaikan || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-black hidden sm:table-cell">
                                                    {p.status_bmi ? `${p.status_bmi} (${p.status_kategori_bmi || 'N/A'})` : (p.status_kategori_bmi || '-')}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => onViewHistory(p)} className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-md transition-colors">
                                                        Lihat Riwayat
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                            <p>Belum ada peserta yang diukur bulan ini.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};