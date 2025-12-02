import React, { useMemo } from 'react';
import type { Participant } from '../../types';
import { Chart } from '../Chart';
import { weightForAge, heightForAge, weightForHeight } from '../../utils/who-growth-standards';
import { calculateAgeInMonths, formatDetailedAge, formatDate, getImmunizationStatus } from '../../utils/helpers';
import { ChartIcon, LogoutIcon, PuskesmasLogo } from '../icons';

interface FamilyPortalViewProps {
    participant: Participant;
    onLogout: () => void;
    customLogo: string | null;
}

const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800 text-lg">{value}</p>
    </div>
);

export const FamilyPortalView: React.FC<FamilyPortalViewProps> = ({ participant, onLogout, customLogo }) => {
    
    const chartData = useMemo(() => {
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

    const immunizationStatus = useMemo(() => getImmunizationStatus(participant), [participant]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10">
            <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                         {customLogo ? (
                           <img src={customLogo} alt="Logo Kustom" className="w-12 h-12 rounded-full object-cover" />
                       ) : (
                           <PuskesmasLogo />
                       )}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">PUSPITA</h1>
                        <p className="text-sm text-gray-600">Posyandu Semua Periode Hidup Terintegrasi</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                    <div className="w-5 h-5"><LogoutIcon /></div>
                    <span className="hidden sm:inline">Keluar</span>
                </button>
            </header>

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Buku KIA Digital</h2>
            </div>

            <main className="max-w-5xl mx-auto space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-bold text-blue-600 mb-4">{participant.nama}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <InfoCard label="Usia Saat Ini" value={formatDetailedAge(participant.tanggal_lahir)} />
                        <InfoCard label="Tanggal Lahir" value={formatDate(participant.tanggal_lahir)} />
                        <InfoCard label="Jenis Kelamin" value={participant.jenis_kelamin} />
                        <InfoCard label="Posyandu" value={participant.nama_posyandu || '-'} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><div className="w-6 h-6 text-green-600"><ChartIcon /></div>Grafik Pertumbuhan (Standar WHO)</h3>
                     {chartData.length > 0 ? (
                        <div className="space-y-12">
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
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                            <p className="font-semibold">Data pengukuran tidak ditemukan.</p>
                            <p className="text-sm">Silakan kunjungi Posyandu untuk mendapatkan data pertumbuhan anak Anda.</p>
                        </div>
                     )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Status Imunisasi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-semibold text-green-600 mb-3">✅ Imunisasi Diterima</h4>
                            {immunizationStatus.completed.length > 0 ? (
                                <ul className="space-y-2">
                                    {immunizationStatus.completed.map((item, index) => (
                                        <li key={index} className="flex justify-between items-center bg-green-50 p-2 rounded">
                                            <span className="font-medium text-green-800">{item.name}</span>
                                            <span className="text-xs text-green-700">{item.date}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-gray-500">Belum ada data imunisasi.</p>}
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-600 mb-3">➡️ Imunisasi Berikutnya</h4>
                             {immunizationStatus.upcoming.length > 0 ? (
                                <ul className="space-y-2">
                                    {immunizationStatus.upcoming.map((item, index) => (
                                        <li key={index} className="flex justify-between items-center bg-blue-50 p-2 rounded">
                                            <span className="font-medium text-blue-800">{item.name}</span>
                                            <span className="text-xs text-blue-700">Jadwal: {item.age}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-gray-500">Semua imunisasi dasar sudah terjadwal/diberikan.</p>}
                        </div>
                    </div>
                </div>

                 <div className="text-center pt-4">
                     <p className="text-sm text-gray-500">Jadwal Posyandu berikutnya adalah awal bulan depan. Jangan lupa datang, ya!</p>
                 </div>
            </main>
        </div>
    );
};