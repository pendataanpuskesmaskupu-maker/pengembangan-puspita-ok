import React, { Fragment, useState } from 'react';
import type { UsePosyanduDataResult } from '../../hooks/usePosyanduData';
import { getCategoryLabel, getCategoryTheme, formatDetailedAge, getStatusColor } from '../../utils/helpers';
import type { Participant } from '../../types';

interface EducationViewProps {
    data: UsePosyanduDataResult;
}

const SummaryItem: React.FC<{ label: string; value?: string | number | null; children?: React.ReactNode; className?: string }> = ({ label, value, children, className }) => (
    <div className={className}>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className="text-sm font-semibold text-gray-800 break-words">{children || value || '-'}</div>
    </div>
);

const ResultSummary: React.FC<{ participant: Participant }> = ({ participant }) => {
    const { kategori } = participant;

    const renderBalitaSummary = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
            <SummaryItem label="Berat Badan" value={`${participant.berat_badan || '-'} kg`} />
            <SummaryItem label="Tinggi Badan" value={`${participant.tinggi_badan || '-'} cm`} />
            <SummaryItem label="Lingkar Kepala" value={participant.lingkar_kepala ? `${participant.lingkar_kepala} cm` : '-'} />
            <SummaryItem label="Status BB/U" value={participant.status_bb_u} />
            <SummaryItem label="Status TB/U" value={participant.status_tb_u} />
            <SummaryItem label="Status BB/TB" value={participant.status_bb_tb} />
            <SummaryItem label="Imunisasi" value={participant.imunisasi?.join(', ')} />
            <SummaryItem label="Vitamin A">
                <span className={`font-semibold`}>
                    {participant.vitaminA || 'Tidak'}
                </span>
            </SummaryItem>
            <SummaryItem label="Obat Cacing">
                 <span className={`font-semibold`}>
                    {participant.obatCacing ? 'Ya' : 'Tidak'}
                </span>
            </SummaryItem>
        </div>
    );

    const renderAdultSummary = () => (
         <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
            <SummaryItem label="Berat Badan" value={`${participant.berat_badan || '-'} kg`} />
            <SummaryItem label="Tinggi Badan" value={`${participant.tinggi_badan || '-'} cm`} />
            <SummaryItem label="Status BMI" value={participant.status_kategori_bmi} />
            <SummaryItem label="Tensi">
                {participant.tensi || '-'}
                {participant.kesimpulan_tensi && <span className={`font-semibold ml-1 ${getStatusColor(participant.kesimpulan_tensi)}`}>({participant.kesimpulan_tensi})</span>}
            </SummaryItem>
            <SummaryItem label="Lingkar Perut" value={participant.lingkar_perut ? `${participant.lingkar_perut} cm` : '-'} />
            <SummaryItem label="GDS">
                {participant.gds ? `${participant.gds} mg/dL ` : '-'}
                {participant.kesimpulan_gds && <span className={`font-semibold ml-1 ${getStatusColor(participant.kesimpulan_gds)}`}>({participant.kesimpulan_gds})</span>}
            </SummaryItem>
            <SummaryItem label="Kolesterol">
                {participant.kolesterol ? `${participant.kolesterol} mg/dL ` : '-'}
                {participant.kesimpulan_kolesterol && <span className={`font-semibold ml-1 ${getStatusColor(participant.kesimpulan_kolesterol)}`}>({participant.kesimpulan_kolesterol})</span>}
            </SummaryItem>
            <SummaryItem label="Asam Urat">
                {participant.asamUrat ? `${participant.asamUrat} mg/dL ` : '-'}
                {participant.kesimpulan_asam_urat && <span className={`font-semibold ml-1 ${getStatusColor(participant.kesimpulan_asam_urat)}`}>({participant.kesimpulan_asam_urat})</span>}
            </SummaryItem>
        </div>
    );
    
    const renderIbuHamilSummary = () => (
         <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
            <SummaryItem label="Berat Badan" value={`${participant.berat_badan || '-'} kg`} />
            <SummaryItem label="Tinggi Badan" value={`${participant.tinggi_badan || '-'} cm`} />
            <SummaryItem label="IMT" value={participant.status_bmi} />
            <SummaryItem label="Kategori IMT" value={participant.status_kategori_bmi} />
            <SummaryItem label="LILA" value={participant.lila ? `${participant.lila} cm` : '-'} />
            <SummaryItem label="Status LILA" value={participant.status_lila} />
             <SummaryItem label="Tensi">
                {participant.tensi || '-'}
                {participant.kesimpulan_tensi && <span className={`font-semibold ml-1 ${getStatusColor(participant.kesimpulan_tensi)}`}>({participant.kesimpulan_tensi})</span>}
            </SummaryItem>
            <SummaryItem label="Pemeriksaan HB">
                {participant.pemeriksaanHB ? `${participant.pemeriksaanHB} g/dL` : '-'}{' '}
                {participant.kesimpulan_hb && <span className={`font-semibold ml-1 ${getStatusColor(participant.kesimpulan_hb)}`}>({participant.kesimpulan_hb})</span>}
            </SummaryItem>
            <SummaryItem label="TFU" value={participant.tfu ? `${participant.tfu} cm` : '-'} />
            <SummaryItem label="DJJ" value={participant.djj ? `${participant.djj} bpm` : '-'} />
            <SummaryItem label="Presentasi" value={participant.presentasi} />
        </div>
    );
    
    const renderRemajaSummary = () => (
         <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
            <SummaryItem label="Berat Badan" value={`${participant.berat_badan || '-'} kg`} />
            <SummaryItem label="Tinggi Badan" value={`${participant.tinggi_badan || '-'} cm`} />
            <SummaryItem label="LILA" value={participant.lila ? `${participant.lila} cm` : '-'} />
            <SummaryItem label="Status BMI" value={participant.status_kategori_bmi} />
             <SummaryItem label="Tensi">
                {participant.tensi || '-'}
                {participant.kesimpulan_tensi && <span className={`font-semibold ml-1 ${getStatusColor(participant.kesimpulan_tensi)}`}>({participant.kesimpulan_tensi})</span>}
            </SummaryItem>
            <SummaryItem label="Pemeriksaan HB">
                 {participant.pemeriksaanHB ? `${participant.pemeriksaanHB} g/dL` : '-'}{' '}
                 {participant.kesimpulan_hb && <span className={`font-semibold ml-1 ${getStatusColor(participant.kesimpulan_hb)}`}>({participant.kesimpulan_hb})</span>}
            </SummaryItem>
            <SummaryItem label="Gigi Caries">
                 <span className={`font-semibold`}>
                    {participant.gigi_caries ? 'Ya' : 'Tidak'}
                </span>
            </SummaryItem>
         </div>
    );

    let summaryContent;
    switch (kategori) {
        case 'balita':
            summaryContent = renderBalitaSummary();
            break;
        case 'ibu-hamil':
            summaryContent = renderIbuHamilSummary();
            break;
        case 'anak-remaja':
            summaryContent = renderRemajaSummary();
            break;
        case 'dewasa':
        case 'lansia':
            summaryContent = renderAdultSummary();
            break;
        default:
            summaryContent = <p className="text-sm text-gray-500">Tidak ada ringkasan spesifik untuk kategori ini.</p>;
    }

    return (
        <div className="bg-white p-4">
            {summaryContent}
            {(participant.catatan_pengukuran || participant.catatan_pelayanan) && (
                <div className="mt-3 pt-3 border-t">
                    {participant.catatan_pengukuran && <SummaryItem label="Catatan Pengukuran" value={participant.catatan_pengukuran} className="col-span-full" />}
                    {participant.catatan_pelayanan && <SummaryItem label="Catatan Pelayanan" value={participant.catatan_pelayanan} className="col-span-full mt-2" />}
                </div>
            )}
        </div>
    );
};


export const EducationView: React.FC<EducationViewProps> = ({ data }) => {
    const { educationQueue, setEducationQueue } = data;
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleFinishEducation = (participantId: string) => {
        const newQueue = educationQueue.map(p => 
            p.__backendId === participantId ? { ...p, status: 'served' as const, completedAt: new Date().toISOString() } : p
        );
        setEducationQueue(newQueue);
    };
    
    // Sort queue to show waiting participants first, then served ones (newest served first).
    const sortedEducationQueue = [...educationQueue].sort((a, b) => {
        const aIsServed = a.status === 'served';
        const bIsServed = b.status === 'served';

        if (aIsServed && !bIsServed) return 1; // a (served) goes after b (waiting)
        if (!aIsServed && bIsServed) return -1; // a (waiting) goes before b (served)

        if (aIsServed && bIsServed) {
            // Both are served, sort by completedAt descending (newest first)
            return (b.completedAt || '').localeCompare(a.completedAt || '');
        }

        // Both are waiting, sort by queueNumber ascending
        return a.queueNumber - b.queueNumber;
    });
    
    // Pagination logic
    const totalItems = sortedEducationQueue.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const paginatedItems = sortedEducationQueue.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };


    return (
        <div className="step-content opacity-100 transform-none space-y-8">
            <div className="bg-white rounded-xl p-4 md:p-8 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg mr-4 flex-shrink-0">5</div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Edukasi & Laporan Akhir</h3>
                        <p className="text-gray-600 mt-1 text-sm md:text-base">Berikan konseling dan lihat rekapitulasi pelayanan hari ini.</p>
                    </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-4 sm:px-6 py-4">
                        <h3 className="text-xl font-bold text-white text-center sm:text-left">Daftar Peserta Selesai & Menunggu Edukasi</h3>
                    </div>

                    {/* DESKTOP TABLE VIEW */}
                    <div className="overflow-x-auto hidden md:block max-h-[60vh]">
                        <table className="w-full">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">No.</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Kategori</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Aksi</th>
                                </tr>
                            </thead>
                             <tbody>
                                {paginatedItems.length > 0 ? (
                                    paginatedItems.map(item => {
                                        const genderClass = item.jenis_kelamin === 'Perempuan' ? 'bg-pink-50' : 'bg-blue-50';
                                        const isServed = item.status === 'served';
                                        return (
                                            <Fragment key={item.__backendId}>
                                                <tr className={`${isServed ? 'bg-green-50' : genderClass} border-t`}>
                                                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{item.queueNumber}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                        {item.nama}
                                                        <div className="text-xs text-gray-500 font-normal">{formatDetailedAge(item.tanggal_lahir)}</div>
                                                    </td>
                                                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryTheme(item.kategori).badge}`}>{getCategoryLabel(item.kategori)}</span></td>
                                                    <td className="px-4 py-3 text-center">
                                                         {isServed ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Selesai</span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                         <button 
                                                            onClick={() => handleFinishEducation(item.__backendId)} 
                                                            disabled={isServed}
                                                            className='bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
                                                         >
                                                            {isServed ? 'Telah Selesai' : 'Selesaikan'}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {isServed && (
                                                    <tr className="border-b border-green-200">
                                                        <td colSpan={5} className="p-0">
                                                            <ResultSummary participant={item} />
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            <p>Tidak ada peserta dalam antrian edukasi.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE CARD VIEW */}
                    <div className="md:hidden p-4 space-y-4 bg-gray-50">
                        {paginatedItems.length > 0 ? (
                            paginatedItems.map(item => {
                                const isServed = item.status === 'served';
                                const theme = getCategoryTheme(item.kategori);
                                return (
                                    <div key={item.__backendId} className="bg-white rounded-lg shadow-md border overflow-hidden">
                                        <div className={`p-4 border-b relative ${isServed ? 'bg-green-50' : 'bg-white'}`}>
                                            <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full ${isServed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {isServed ? 'Selesai' : 'Menunggu'}
                                            </span>

                                            <div className="flex items-center">
                                                <div className={`flex-shrink-0 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-4 ${isServed ? 'bg-green-500' : 'bg-blue-500'}`}>
                                                    {item.queueNumber}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-lg">{item.nama}</p>
                                                    <p className="text-sm text-gray-600">{formatDetailedAge(item.tanggal_lahir)}</p>
                                                    <span className={`mt-1 inline-block px-2 py-1 text-xs font-semibold rounded-full ${theme.badge}`}>
                                                        {getCategoryLabel(item.kategori)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {isServed ? (
                                            <ResultSummary participant={item} />
                                        ) : (
                                            <div className="p-4 bg-gray-50">
                                                <button
                                                    onClick={() => handleFinishEducation(item.__backendId)}
                                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                >
                                                    Selesaikan Edukasi
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p>Tidak ada peserta dalam antrian edukasi.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
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
        </div>
    );
};