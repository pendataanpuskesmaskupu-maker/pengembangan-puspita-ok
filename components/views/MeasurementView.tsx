import React from 'react';
import type { Participant } from '../../types';
import type { UsePosyanduDataResult } from '../../hooks/usePosyanduData';
import { getCategoryLabel, formatDetailedAge, getCategoryTheme, getDueImmunization } from '../../utils/helpers';

interface MeasurementViewProps {
    data: UsePosyanduDataResult;
    onMeasure: (participant: Participant) => void;
}

export const MeasurementView: React.FC<MeasurementViewProps> = ({ data, onMeasure }) => {
    const { queue } = data;
    const currentMonth = new Date().toISOString().slice(0, 7); // Format "YYYY-MM"

    return (
        <div className="step-content opacity-100 transform-none">
            <div className="bg-white rounded-xl p-4 md:p-8 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg mr-4 flex-shrink-0">2</div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Pengukuran</h3>
                        <p className="text-gray-600 mt-1 text-sm md:text-base">Lakukan pengukuran antropometri pada peserta.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                        <h3 className="text-xl font-bold text-white">Antrian Pengukuran</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">No.</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">Kategori</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {queue.length > 0 ? (
                                    queue.map(item => {
                                        // Cek apakah pengukuran terakhir dilakukan di bulan ini
                                        const lastMeasurementThisMonth = item.riwayatPengukuran
                                            .some(record => record.tanggal_pengukuran.startsWith(currentMonth));
                                        
                                        const genderClass = item.jenis_kelamin === 'Perempuan' ? 'bg-pink-50 hover:bg-pink-100' : 'bg-blue-50 hover:bg-blue-100';
                                        const dueImmunization = getDueImmunization(item);

                                        return (
                                            <tr key={item.__backendId} className={`border-b ${genderClass}`}>
                                                <td className="px-4 py-3 text-sm font-bold text-gray-900">{item.queueNumber}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                    {item.nama}
                                                    <div className="text-xs text-gray-500 font-normal">{formatDetailedAge(item.tanggal_lahir)}</div>
                                                     {dueImmunization && (
                                                        <div className="text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap mt-1 inline-block">Jadwal Imunisasi: {dueImmunization}</div>
                                                    )}
                                                     <div className="sm:hidden text-xs mt-1">
                                                        <span className={`px-2 py-1 font-semibold rounded-full ${getCategoryTheme(item.kategori).badge}`}>{getCategoryLabel(item.kategori)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 hidden sm:table-cell"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryTheme(item.kategori).badge}`}>{getCategoryLabel(item.kategori)}</span></td>
                                                <td className="px-4 py-3 text-center">
                                                    {lastMeasurementThisMonth ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Sudah Diukur</span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {lastMeasurementThisMonth ? (
                                                        <button onClick={() => onMeasure(item)} className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md transition-colors">
                                                            <span className="sm:hidden">Edit</span>
                                                            <span className="hidden sm:inline">Lihat/Edit Hasil</span>
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => onMeasure(item)} className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md transition-colors">
                                                            <span className="sm:hidden">Ukur</span>
                                                            <span className="hidden sm:inline">Ukur Sekarang</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <p>Belum ada peserta dalam antrian pengukuran.</p>
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