import React, { useState, useMemo } from 'react';
import type { usePosyanduData } from '../../hooks/usePosyanduData';
import type { Participant } from '../../types';
import { Chart } from '../Chart';
import { weightForAge, heightForAge, weightForHeight } from '../../utils/who-growth-standards';
import { calculateAgeInMonths } from '../../utils/helpers';
import { ChartIcon } from '../icons';

interface GrowthChartViewProps {
  data: ReturnType<typeof usePosyanduData>;
}

export const GrowthChartView: React.FC<GrowthChartViewProps> = ({ data }) => {
    const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
    
    const balitaParticipants = useMemo(() => {
        return data.participants.filter(p => p.kategori === 'balita');
    }, [data.participants]);

    const selectedParticipant = useMemo(() => {
        return balitaParticipants.find(p => p.__backendId === selectedParticipantId);
    }, [selectedParticipantId, balitaParticipants]);

    const chartData = useMemo(() => {
        if (!selectedParticipant || !selectedParticipant.riwayatPengukuran) return [];

        return selectedParticipant.riwayatPengukuran
            .map(record => ({
                age: calculateAgeInMonths(selectedParticipant.tanggal_lahir, record.tanggal_pengukuran),
                weight: record.berat_badan,
                height: record.tinggi_badan
            }))
            .filter(d => d.age != null && (d.weight != null || d.height != null))
            .sort((a, b) => a.age - b.age);
    }, [selectedParticipant]);

    const weightChartPoints = useMemo(() => chartData.filter(d => d.weight).map(d => ({ x: d.age, y: d.weight! })), [chartData]);
    const heightChartPoints = useMemo(() => chartData.filter(d => d.height).map(d => ({ x: d.age, y: d.height! })), [chartData]);

    const wfhChartPoints = useMemo(() => {
        if (!selectedParticipant || !selectedParticipant.riwayatPengukuran) return [];

        return selectedParticipant.riwayatPengukuran
            .map(record => ({
                x: record.tinggi_badan,
                y: record.berat_badan
            }))
            .filter(d => d.x != null && d.y != null)
            .sort((a, b) => a.x! - b.x!);
    }, [selectedParticipant]);


    const standards = useMemo(() => {
        if (!selectedParticipant) return null;
        return selectedParticipant.jenis_kelamin === 'Laki-laki' 
            ? { weight: weightForAge.boys, height: heightForAge.boys, wfh: weightForHeight.boys }
            : { weight: weightForAge.girls, height: heightForAge.girls, wfh: weightForHeight.girls };
    }, [selectedParticipant]);


    return (
        <div className="step-content opacity-100 transform-none space-y-8">
            <div className="bg-white rounded-xl p-4 md:p-8 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg mr-4 flex-shrink-0">
                        <div className="w-6 h-6 md:w-8 md:h-8"><ChartIcon /></div>
                    </div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Grafik Pertumbuhan Anak</h3>
                        <p className="text-gray-600 mt-1 text-sm md:text-base">Visualisasi pertumbuhan anak 0-5 tahun berdasarkan standar WHO.</p>
                    </div>
                </div>

                <div className="mb-8 max-w-md">
                    <label htmlFor="participant-select" className="block text-sm font-medium text-gray-700 mb-2">Pilih Anak:</label>
                    <select
                        id="participant-select"
                        value={selectedParticipantId}
                        onChange={(e) => setSelectedParticipantId(e.target.value)}
                        className="w-full border border-gray-300 p-2.5 rounded-lg bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                        <option value="">-- Pilih seorang anak --</option>
                        {balitaParticipants.map(p => (
                            <option key={p.__backendId} value={p.__backendId}>{p.nama} (NIK: {p.nik})</option>
                        ))}
                    </select>
                </div>

                {selectedParticipant && standards ? (
                    <div className="space-y-12">
                         {(chartData.length > 0) ? (
                            <>
                                <Chart
                                    title={`Berat Badan menurut Umur (${selectedParticipant.jenis_kelamin})`}
                                    participantData={weightChartPoints}
                                    standardsData={standards.weight}
                                    yAxisLabel="Berat Badan (kg)"
                                    xAxisLabel="Umur (Bulan)"
                                    maxX={60}
                                    maxY={28}
                                    chartType="wfa"
                                />
                                <Chart
                                    title={`Panjang/Tinggi Badan menurut Umur (${selectedParticipant.jenis_kelamin})`}
                                    participantData={heightChartPoints}
                                    standardsData={standards.height}
                                    yAxisLabel="Panjang/Tinggi Badan (cm)"
                                    xAxisLabel="Umur (Bulan)"
                                    maxX={60}
                                    maxY={130}
                                    chartType="hfa"
                                />
                                 <Chart
                                    title={`Berat Badan menurut Panjang/Tinggi Badan (${selectedParticipant.jenis_kelamin})`}
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
                             <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                                <p className="font-semibold">Data pengukuran tidak ditemukan.</p>
                                <p className="text-sm">Silakan tambahkan data pengukuran untuk anak ini untuk melihat grafiknya.</p>
                             </div>
                         )}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                        <p className="font-semibold">Silakan pilih anak dari daftar di atas untuk menampilkan grafik pertumbuhannya.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
