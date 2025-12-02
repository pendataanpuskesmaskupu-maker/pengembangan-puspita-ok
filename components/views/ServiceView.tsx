import React, { useMemo, useState, Fragment } from 'react';
import type { Participant } from '../../types';
import type { UsePosyanduDataResult } from '../../hooks/usePosyanduData';
import { getCategoryLabel, formatDetailedAge, getCategoryTheme, formatDate, getDueImmunization, calculateDetailedAge } from '../../utils/helpers';

interface ServiceViewProps {
    data: UsePosyanduDataResult;
    onServe: (participant: Participant) => void;
}

const BalitaServiceSummary: React.FC<{ participant: Participant }> = ({ participant }) => {
    const tbcSymptoms = participant.skriningTBC ? Object.entries(participant.skriningTBC)
        .filter(([, value]) => value)
        .map(([key]) => {
            if (key === 'beratBadan') return 'BB Turun';
            return key.charAt(0).toUpperCase() + key.slice(1);
        })
        .join(', ') : '';

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <div><span className="font-medium text-gray-600">Imunisasi:</span> <span className="text-gray-900">{participant.imunisasi?.join(', ') || '-'}</span></div>
            <div><span className="font-medium text-gray-600">Vitamin A:</span> <span className="text-gray-900">{participant.vitaminA || 'Tidak'}</span></div>
            <div><span className="font-medium text-gray-600">Obat Cacing:</span> <span className="text-gray-900">{participant.obatCacing ? 'Ya' : 'Tidak'}</span></div>
            {participant.asiEksklusif !== undefined && (
                <div><span className="font-medium text-gray-600">ASI Eksklusif:</span> <span className="text-gray-900">{participant.asiEksklusif ? 'Ya' : 'Tidak'}</span></div>
            )}
            {tbcSymptoms && (
                <div className="col-span-full md:col-span-2"><span className="font-medium text-gray-600">Skrining TBC:</span> <span className="text-red-600 font-semibold">{tbcSymptoms}</span></div>
            )}
            {participant.catatan_pelayanan && <div className="col-span-full"><span className="font-medium text-gray-600">Catatan:</span> <span className="text-gray-900">{participant.catatan_pelayanan}</span></div>}
        </div>
    );
};

const AdultServiceSummary: React.FC<{ participant: Participant }> = ({ participant }) => {
    const { skriningMerokok, tensi, skriningTBC, pemeriksaanHB, skriningIndera, gds, kolesterol, asamUrat, kb, tingkatKemandirian, catatan_pelayanan } = participant;
    
    const tbcSymptoms = skriningTBC ? Object.entries(skriningTBC)
        .filter(([, value]) => value)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
        .join(', ') : '';

    return (
        <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                <div><span className="font-medium text-gray-600">Tensi:</span> <span className="text-gray-900">{tensi || '-'} {participant.kesimpulan_tensi && <span className="font-bold">({participant.kesimpulan_tensi})</span>}</span></div>
                {pemeriksaanHB && <div><span className="font-medium text-gray-600">HB:</span> <span className="text-gray-900">{pemeriksaanHB} g/dL {participant.kesimpulan_hb && <span className="font-bold">({participant.kesimpulan_hb})</span>}</span></div>}
                {gds && <div><span className="font-medium text-gray-600">GDS:</span> <span className="text-gray-900">{gds} mg/dL {participant.kesimpulan_gds && <span className="font-bold">({participant.kesimpulan_gds})</span>}</span></div>}
                {kolesterol && <div><span className="font-medium text-gray-600">Kolesterol:</span> <span className="text-gray-900">{kolesterol} mg/dL {participant.kesimpulan_kolesterol && <span className="font-bold">({participant.kesimpulan_kolesterol})</span>}</span></div>}
                {asamUrat && <div><span className="font-medium text-gray-600">Asam Urat:</span> <span className="text-gray-900">{asamUrat} mg/dL {participant.kesimpulan_asam_urat && <span className="font-bold">({participant.kesimpulan_asam_urat})</span>}</span></div>}
                {kb && <div><span className="font-medium text-gray-600">Status KB:</span> <span className="text-gray-900 font-semibold">{kb}</span></div>}
                {tingkatKemandirian && <div><span className="font-medium text-gray-600">Kemandirian:</span> <span className="text-gray-900">{tingkatKemandirian}</span></div>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t mt-2">
                <div>
                    <span className="font-medium text-gray-600">Skrining Merokok:</span>
                    <ul className="text-gray-900 list-disc list-inside">
                        {skriningMerokok?.merokok && <li>Merokok</li>}
                        {skriningMerokok?.terpapar && <li>Terpapar Asap</li>}
                        {!skriningMerokok?.merokok && !skriningMerokok?.terpapar && <li>-</li>}
                    </ul>
                </div>
                <div><span className="font-medium text-gray-600">Gejala TBC:</span> <span className="text-red-600 font-semibold">{tbcSymptoms || '-'}</span></div>
                <div>
                    <span className="font-medium text-gray-600">Skrining Indera:</span>
                    <ul className="text-gray-900 list-disc list-inside">
                        <li>Kanan: {skriningIndera?.penglihatanKanan || '-'}</li>
                        <li>Kiri: {skriningIndera?.penglihatanKiri || '-'}</li>
                        <li>Dengar: {skriningIndera?.pendengaran || '-'}</li>
                    </ul>
                </div>
            </div>
            {catatan_pelayanan && <div className="pt-2 border-t mt-2"><span className="font-medium text-gray-600">Catatan:</span> <span className="text-gray-900">{catatan_pelayanan}</span></div>}
        </div>
    );
};


export const ServiceView: React.FC<ServiceViewProps> = ({ data, onServe }) => {
    const { serviceQueue, educationQueue } = data;
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    const toggleHistory = (id: string) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const serviceQueueFiltered = useMemo(() => {
        return serviceQueue.filter(item => item.status !== 'served');
    }, [serviceQueue]);

    return (
        <div className="step-content opacity-100 transform-none">
            <div className="bg-white rounded-xl p-4 md:p-8 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg mr-4 flex-shrink-0">4</div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Pelayanan Kesehatan</h3>
                        <p className="text-gray-600 mt-1 text-sm md:text-base">Pemberian imunisasi, vitamin, dan pelayanan kesehatan dasar lainnya.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="text-xl font-bold text-white text-center sm:text-left">Antrian Pelayanan</h3>
                    </div>
                    <div className="overflow-x-auto max-h-[400px]">
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
                                {serviceQueueFiltered.length > 0 ? (
                                    serviceQueueFiltered.map(item => {
                                        const isInEducationQueue = educationQueue.some(p => p.__backendId === item.__backendId);
                                        const isExpanded = expandedRows[item.__backendId];
                                        const genderClass = item.jenis_kelamin === 'Perempuan' ? 'bg-pink-50 hover:bg-pink-100' : 'bg-blue-50 hover:bg-blue-100';
                                        const dueImmunization = getDueImmunization(item);

                                        // Calculate age details to determine if PKAT reminder is needed
                                        const ageDetails = calculateDetailedAge(item.tanggal_lahir);
                                        const ageInMonths = ageDetails.years * 12 + ageDetails.months;
                                        const showPkatReminder = item.kategori === 'balita' && ageInMonths === 5;

                                        return (
                                            <Fragment key={item.__backendId}>
                                                <tr className={genderClass}>
                                                    <td className="px-4 py-3 text-sm font-bold">
                                                         <button onClick={() => toggleHistory(item.__backendId)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                                                            {item.queueNumber}
                                                            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                        {item.nama}
                                                        <div className="text-xs text-gray-500 font-normal">{formatDetailedAge(item.tanggal_lahir)}</div>
                                                        {dueImmunization && (
                                                            <div className="text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap mt-1 inline-block mr-1">Jadwal Imunisasi: {dueImmunization}</div>
                                                        )}
                                                        {showPkatReminder && (
                                                            <div className="text-xs font-semibold text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full whitespace-nowrap mt-1 inline-block">PKAT Bulan Depan</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 hidden sm:table-cell"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryTheme(item.kategori).badge}`}>{getCategoryLabel(item.kategori)}</span></td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {isInEducationQueue ? (
                                                            <button disabled className='bg-gray-400 text-white px-3 py-1 rounded text-xs font-medium cursor-not-allowed'>
                                                                Selesai
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => onServe(item)} className='bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors'>
                                                                Layani
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className={item.jenis_kelamin === 'Perempuan' ? 'bg-pink-100' : 'bg-blue-100'}>
                                                        <td colSpan={5} className={`p-4 border-l-4 ${item.jenis_kelamin === 'Perempuan' ? 'border-pink-500' : 'border-blue-500'}`}>
                                                            {item.tanggal_pelayanan ? (
                                                                <>
                                                                    <h5 className="font-semibold text-blue-800 mb-2">Riwayat Pelayanan Terakhir ({formatDate(item.tanggal_pelayanan)})</h5>
                                                                    {item.kategori === 'balita'
                                                                        ? <BalitaServiceSummary participant={item} />
                                                                        : <AdultServiceSummary participant={item} />
                                                                    }
                                                                </>
                                                            ) : (
                                                                <p className="text-sm text-gray-600">Belum ada riwayat pelayanan tercatat untuk peserta ini.</p>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            <p>Belum ada antrian pelayanan.</p>
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