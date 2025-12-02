import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import type { Participant, MeasurementRecord, HomeVisitRecord } from '../../types';
import { getCategoryLabel, getCategoryTheme, formatDetailedAge, formatDate, calculateAgeInMonths } from '../../utils/helpers';
import { Chart } from '../Chart';
import { weightForAge, heightForAge, weightForHeight } from '../../utils/who-growth-standards';
import { ChartIcon } from '../icons';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    participant: Participant | null;
}

const GrowthChartSection: React.FC<{ participant: Participant }> = ({ participant }) => {
    const [isChartVisible, setIsChartVisible] = useState(true);

    const chartData = useMemo(() => {
        if (!participant || !participant.riwayatPengukuran) return [];

        return participant.riwayatPengukuran
            .map(record => ({
                age: calculateAgeInMonths(participant.tanggal_lahir, record.tanggal_pengukuran),
                weight: record.berat_badan,
                height: record.tinggi_badan
            }))
            .filter(d => d.age != null && (d.weight != null || d.height != null))
            .sort((a, b) => a.age - b.age);
    }, [participant]);

    const weightChartPoints = useMemo(() => chartData.filter(d => d.weight).map(d => ({ x: d.age, y: d.weight! })), [chartData]);
    const heightChartPoints = useMemo(() => chartData.filter(d => d.height).map(d => ({ x: d.age, y: d.height! })), [chartData]);
    const wfhChartPoints = useMemo(() => chartData.filter(d => d.weight && d.height).map(d => ({ x: d.height!, y: d.weight! })).sort((a, b) => a.x - b.x), [chartData]);

    const standards = useMemo(() => {
        return participant.jenis_kelamin === 'Laki-laki' 
            ? { weight: weightForAge.boys, height: heightForAge.boys, wfh: weightForHeight.boys }
            : { weight: weightForAge.girls, height: heightForAge.girls, wfh: weightForHeight.girls };
    }, [participant.jenis_kelamin]);

    return (
        <div className="bg-gray-50 p-4 rounded-lg border">
            <button onClick={() => setIsChartVisible(!isChartVisible)} className="w-full flex justify-between items-center text-left font-semibold text-gray-800 mb-3">
                <span className="flex items-center gap-2">
                    <div className="w-5 h-5 text-green-600"><ChartIcon /></div>
                    Grafik Pertumbuhan Anak (Standar WHO)
                </span>
                <svg className={`w-5 h-5 transition-transform ${isChartVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isChartVisible && (
                <div className="mt-4 space-y-8">
                    {chartData.length > 0 ? (
                        <>
                            <Chart
                                title={`Berat Badan menurut Umur (${participant.jenis_kelamin})`}
                                participantData={weightChartPoints}
                                standardsData={standards.weight}
                                yAxisLabel="Berat Badan (kg)"
                                xAxisLabel="Umur (Bulan)"
                                maxX={60}
                                maxY={28}
                                chartType="wfa"
                            />
                            <Chart
                                title={`Panjang/Tinggi Badan menurut Umur (${participant.jenis_kelamin})`}
                                participantData={heightChartPoints}
                                standardsData={standards.height}
                                yAxisLabel="Panjang/Tinggi Badan (cm)"
                                xAxisLabel="Umur (Bulan)"
                                maxX={60}
                                maxY={130}
                                chartType="hfa"
                            />
                            <Chart
                                title={`Berat Badan menurut Panjang/Tinggi Badan (${participant.jenis_kelamin})`}
                                participantData={wfhChartPoints}
                                standardsData={standards.wfh}
                                yAxisLabel="Berat Badan (kg)"
                                xAxisLabel="Panjang/Tinggi Badan (cm)"
                                maxX={120}
                                maxY={28}
                                chartType="wfh"
                            />
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>Belum ada data pengukuran yang cukup untuk menampilkan grafik.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, participant }) => {
    if (!participant) return null;

    const theme = getCategoryTheme(participant.kategori);
    const historyToDisplay = participant.riwayatPengukuran?.slice().reverse() || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Riwayat Peserta" maxWidth="max-w-4xl">
            <div className={`${theme.bg} border ${theme.border} rounded-lg p-4 mb-6`}>
                <h4 className={`font-semibold ${theme.text} mb-3 flex items-center`}>👤 <span className="ml-2">Informasi Peserta</span></h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-sm text-black">
                    <div><span className="font-medium">Nama:</span> <span className="ml-2 font-semibold">{participant.nama}</span></div>
                    <div><span className="font-medium">Usia:</span> <span className="ml-2 font-semibold">{formatDetailedAge(participant.tanggal_lahir)}</span></div>
                    <div>
                      <span className="font-medium">Kategori:</span> 
                      <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${theme.badge}`}>{getCategoryLabel(participant.kategori)}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h5 className="font-semibold text-gray-800 mb-3">Riwayat Pengukuran</h5>
                    <div className="overflow-x-auto max-h-[40vh]">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-200 sticky top-0">
                                <tr>
                                    <th className="p-2 text-left font-medium text-gray-600">Tanggal</th>
                                    <th className="p-2 text-left font-medium text-gray-600">Pengukuran &amp; Status</th>
                                    <th className="p-2 text-left font-medium text-gray-600 hidden sm:table-cell">Kenaikan BB</th>
                                    <th className="p-2 text-left font-medium text-gray-600 hidden sm:table-cell">Status BB/U</th>
                                    <th className="p-2 text-left font-medium text-gray-600 hidden sm:table-cell">Status TB/U</th>
                                    <th className="p-2 text-left font-medium text-gray-600 hidden sm:table-cell">Status BB/TB</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyToDisplay.length > 0 ? historyToDisplay.map((record, index) => {
                                    const statusKenaikan = record.status_kenaikan_berat;
                                    const statusColor = statusKenaikan === 'Naik' ? 'text-green-600' : statusKenaikan === 'Tidak Naik' ? 'text-red-600' : 'text-blue-600';
                                    return (
                                        <tr key={index} className="border-b last:border-0 hover:bg-gray-100">
                                            <td className="p-2 font-semibold text-gray-900 align-top">{formatDate(record.tanggal_pengukuran)}</td>
                                            <td className="p-2 text-gray-900 align-top">
                                                <div>{record.berat_badan || '-'} kg / {record.tinggi_badan || '-'} cm</div>
                                                <div className="sm:hidden mt-2 space-y-1 text-xs">
                                                    {statusKenaikan && <div><span className="font-medium text-gray-500">Kenaikan BB:</span> <span className={`font-bold ${statusColor}`}>{statusKenaikan}</span></div>}
                                                    <div><span className="font-medium text-gray-500">BB/U:</span> {record.status_bb_u || '-'}</div>
                                                    <div><span className="font-medium text-gray-500">TB/U:</span> {record.status_tb_u || '-'}</div>
                                                    <div><span className="font-medium text-gray-500">BB/TB:</span> {record.status_bb_tb || '-'}</div>
                                                </div>
                                            </td>
                                            <td className={`p-2 font-semibold hidden sm:table-cell ${statusColor}`}>{statusKenaikan || '-'}</td>
                                            <td className="p-2 text-gray-900 hidden sm:table-cell">{record.status_bb_u || '-'}</td>
                                            <td className="p-2 text-gray-900 hidden sm:table-cell">{record.status_tb_u || '-'}</td>
                                            <td className="p-2 text-gray-900 hidden sm:table-cell">{record.status_bb_tb || '-'}</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={6} className="text-center p-4 text-gray-500">Belum ada riwayat pengukuran.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {participant.kategori === 'balita' && <GrowthChartSection participant={participant} />}
            </div>
            
             <div className="flex justify-end gap-4 pt-4 mt-6 border-t">
                <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Tutup</button>
            </div>
        </Modal>
    );
};