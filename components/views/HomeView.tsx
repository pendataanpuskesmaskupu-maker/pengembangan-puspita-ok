import React, { useState, useMemo, Fragment } from 'react';
import type { UsePosyanduDataResult } from '../../hooks/usePosyanduData';
import type { Category, Desa, Participant, MeasurementRecord } from '../../types';
import { getCategoryLabel, calculateHealthServiceStatus, calculateBMIStatus } from '../../utils/helpers';
import { ChartIcon, UsersIcon, BookOpenIcon } from '../icons';
import { TrendChart } from '../TrendChart';

// --- Start of in-file components ---

const AccordionSection: React.FC<{ title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode, icon?: React.ReactNode }> = ({ title, isOpen, onToggle, children, icon }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <button onClick={onToggle} className="w-full p-6 text-left flex justify-between items-center bg-gray-50 hover:bg-gray-100 focus:outline-none">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                {icon}
                {title}
            </h3>
            <svg className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        {isOpen && (
            <div className="p-6">
                {children}
            </div>
        )}
    </div>
);

const ProgressBar: React.FC<{ value: number; color: string; label: string }> = ({ value, color, label }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className={`text-sm font-bold ${color}`}>{value.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

const DonutChart: React.FC<{ naik: number; tidakNaik: number }> = ({ naik, tidakNaik }) => {
    const total = naik + tidakNaik;
    const naikPercentage = total > 0 ? (naik / total) * 100 : 0;
    const strokeDasharray = `${naikPercentage} ${100 - naikPercentage}`;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-red-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="text-green-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={strokeDasharray} strokeDashoffset="25" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-800">{naik}</span>
                </div>
            </div>
            <p className="text-sm font-semibold text-gray-700 mt-2">BB Naik</p>
            <p className="text-xs text-gray-500">dari {total} balita</p>
        </div>
    );
};

const IndicatorCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <h4 className="font-bold text-gray-800 mb-4 text-center">{title}</h4>
        {children}
    </div>
);

// --- End of in-file components ---

const statusHeaders: Record<string, [string, string]> = {
    // Gizi
    'Berat badan sangat kurang': ['Sangat', 'Kurang'],
    'Berat badan kurang': ['BB', 'Kurang'],
    'Risiko berat badan lebih': ['Risiko', 'Lebih'],
    'Sangat pendek (severely stunted)': ['Sangat', 'Pendek'],
    'Pendek (stunted)': ['Pendek', ''],
    'Tinggi': ['Tinggi', ''],
    'Gizi buruk (severely wasted)': ['Gizi', 'Buruk'],
    'Gizi kurang (wasted)': ['Gizi', 'Kurang'],
    'Gizi baik (normal)': ['Gizi', 'Baik'],
    'Berisiko gizi lebih': ['Risiko Gizi', 'Lebih'],
    'Gizi lebih (overweight)': ['Gizi', 'Lebih'],
    'Naik': ['Naik', ''],
    'Tidak Naik': ['Tidak', 'Naik'],
    'Baru Ditimbang': ['Baru', 'Ditimbang'],
    // Pemeriksaan
    "Hipotensi": ["Hipo", "tensi"],
    "Normal": ["Normal", ""],
    "Pra-Hipertensi": ["Pra-", "Hipertensi"],
    "Hipertensi Tahap 1": ["HT", "Tahap 1"],
    "Hipertensi Tahap 2": ["HT", "Tahap 2"],
    "Pra-Diabetes": ["Pra-", "Diabetes"],
    "Tinggi (Diabetes)": ["Tinggi", "(DM)"],
    "Berat Badan Kurang": ["BB", "Kurang"],
    "Berat Badan Lebih": ["BB", "Lebih"],
    "Obesitas": ["Obesitas", ""],
    "KEK / Kurang Gizi": ["KEK/", "Kr. Gizi"],
    "KEK": ["KEK", ""],
    "A": ["A", "(Mandiri)"],
    "B": ["B", "(Bantuan)"],
    "C": ["C", "(Total)"],
    "KEK (Kurang Energi Kronis)": ["KEK", ""],
    "Anemia": ["Anemia", ""],
};

interface HomeViewProps {
  data: UsePosyanduDataResult;
  userDesa: string | null;
  onFamilyPortalClick: () => void;
  isPublicView: boolean; // This prop is crucial
}

const giziTrendOptions = {
    'Stunting': (record: MeasurementRecord) => record.status_tb_u?.includes('pendek'),
    'Berat Badan Sangat Kurang': (record: MeasurementRecord) => record.status_bb_u === 'Berat badan sangat kurang',
    'Gizi Kurang (wasted)': (record: MeasurementRecord) => record.status_bb_tb === 'Gizi kurang (wasted)',
    'Gizi Buruk (severely wasted)': (record: MeasurementRecord) => record.status_bb_tb === 'Gizi buruk (severely wasted)',
    'Gizi Lebih (overweight)': (record: MeasurementRecord) => record.status_bb_tb === 'Gizi lebih (overweight)',
    'Obesitas': (record: MeasurementRecord) => record.status_bb_tb === 'Obesitas',
};

const ptmTrendOptions = {
    'Hipertensi': (record: MeasurementRecord, p: Participant) => {
        if (p.kategori !== 'dewasa' && p.kategori !== 'lansia') return false;
        if (!record.tensi) return false;
        const [sistolik, diastolik] = record.tensi.split('/').map(Number);
        if (isNaN(sistolik) || isNaN(diastolik)) return false;
        const conclusion = calculateHealthServiceStatus({ sistolik, diastolik, jenis_kelamin: p.jenis_kelamin, age: 0, kategori: p.kategori });
        return conclusion.kesimpulan_tensi?.includes('Hipertensi') || false;
    },
    'Obesitas': (record: MeasurementRecord, p: Participant) => (p.kategori === 'dewasa' || p.kategori === 'lansia') && record.status_kategori_bmi === 'Obesitas',
    'Berat Badan Kurang (Dewasa)': (record: MeasurementRecord, p: Participant) => (p.kategori === 'dewasa' || p.kategori === 'lansia') && record.status_kategori_bmi === 'Berat Badan Kurang',
    'Anemia (Remaja)': (record: MeasurementRecord, p: Participant) => p.kategori === 'anak-remaja' && record.kesimpulan_hb === 'Anemia',
};

const bumilTrendOptions = {
    'KEK (Kurang Energi Kronis)': (record: MeasurementRecord, p: Participant) => p.kategori === 'ibu-hamil' && record.status_lila?.includes('KEK'),
    'Anemia (Ibu Hamil)': (record: MeasurementRecord, p: Participant) => p.kategori === 'ibu-hamil' && record.kesimpulan_hb === 'Anemia',
};

export const HomeView: React.FC<HomeViewProps> = ({ data, userDesa, onFamilyPortalClick, isPublicView }) => {
    const participants = (data.participants as Participant[]) || [];
    const [openSection, setOpenSection] = useState<string | null>(null);
    const [selectedGiziIndicator, setSelectedGiziIndicator] = useState<keyof typeof giziTrendOptions>('Stunting');
    const [selectedPtmIndicator, setSelectedPtmIndicator] = useState<keyof typeof ptmTrendOptions>('Hipertensi');
    const [selectedBumilIndicator, setSelectedBumilIndicator] = useState<keyof typeof bumilTrendOptions>('KEK (Kurang Energi Kronis)');

    const toggleSection = (section: string) => {
        setOpenSection(prev => (prev === section ? null : section));
    };

    const currentMonth = new Date().toISOString().slice(0, 7);

    const dsTrendData = useMemo(() => {
        const months: { month: string, S: number, D: number }[] = [];
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = date.toISOString().substring(0, 7);
            
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
            
            const S = participants.filter(p => p.kategori === 'balita' && new Date(p.createdAt) <= endOfMonth).length;

            const balitaThisMonth = participants.filter(p => p.kategori === 'balita' && new Date(p.createdAt) <= endOfMonth);
            const weighedParticipantIds = new Set<string>();
            balitaThisMonth.forEach(p => {
                const wasWeighed = p.riwayatPengukuran.some(record => 
                    record.tanggal_pengukuran.startsWith(monthKey) && record.berat_badan != null
                );
                if (wasWeighed) {
                    weighedParticipantIds.add(p.__backendId);
                }
            });
            const D = weighedParticipantIds.size;
            
            months.push({ month: monthKey, S, D });
        }
        
        return months.map(({ month, S, D }) => ({
            month,
            count: S > 0 ? (D / S) * 100 : 0,
        }));
    }, [participants]);

    const keyHealthIndicators = useMemo(() => {
        const balitaThisMonth = participants.filter(p => p.kategori === 'balita' && (p.tanggal_pengukuran?.startsWith(currentMonth) || p.tanggal_pelayanan?.startsWith(currentMonth)));
        const bumilThisMonth = participants.filter(p => p.kategori === 'ibu-hamil' && (p.tanggal_pengukuran?.startsWith(currentMonth) || p.tanggal_pelayanan?.startsWith(currentMonth)));
        const dewasaLansiaThisMonth = participants.filter(p => (p.kategori === 'dewasa' || p.kategori === 'lansia') && p.tanggal_pelayanan?.startsWith(currentMonth));
        
        const stuntingCount = balitaThisMonth.filter(p => p.status_tb_u?.includes('pendek')).length;
        const giziKurangCount = balitaThisMonth.filter(p => p.status_bb_tb?.includes('kurang') || p.status_bb_tb?.includes('buruk')).length;
        const bbNaikCount = balitaThisMonth.filter(p => p.status_kenaikan_berat === 'Naik').length;
        const bbTidakNaikCount = balitaThisMonth.filter(p => p.status_kenaikan_berat === 'Tidak Naik').length;

        const anemiaCount = bumilThisMonth.filter(p => p.kesimpulan_hb === 'Anemia').length;
        const kekCount = bumilThisMonth.filter(p => p.status_lila?.includes('KEK')).length;

        const hipertensiCount = dewasaLansiaThisMonth.filter(p => p.kesimpulan_tensi?.includes('Hipertensi')).length;
        const diabetesCount = dewasaLansiaThisMonth.filter(p => p.kesimpulan_gds?.includes('Diabetes')).length;
        
        return {
            balita: {
                total: balitaThisMonth.length,
                stuntingPercentage: balitaThisMonth.length > 0 ? (stuntingCount / balitaThisMonth.length) * 100 : 0,
                giziKurangPercentage: balitaThisMonth.length > 0 ? (giziKurangCount / balitaThisMonth.length) * 100 : 0,
                bbNaikCount,
                bbTidakNaikCount,
            },
            bumil: {
                total: bumilThisMonth.length,
                anemiaPercentage: bumilThisMonth.length > 0 ? (anemiaCount / bumilThisMonth.length) * 100 : 0,
                kekPercentage: bumilThisMonth.length > 0 ? (kekCount / bumilThisMonth.length) * 100 : 0,
            },
            ptm: {
                total: dewasaLansiaThisMonth.length,
                hipertensiPercentage: dewasaLansiaThisMonth.length > 0 ? (hipertensiCount / dewasaLansiaThisMonth.length) * 100 : 0,
                diabetesPercentage: dewasaLansiaThisMonth.length > 0 ? (diabetesCount / dewasaLansiaThisMonth.length) * 100 : 0,
            }
        };
    }, [participants, currentMonth]);

    const trendData = useMemo(() => {
        const monthlyStats: { [month: string]: { [key: string]: Set<string> } } = {};
        const monthsToShow = 12;

        const today = new Date();
        for (let i = 0; i < monthsToShow; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = date.toISOString().substring(0, 7);
            monthlyStats[monthKey] = {};
        }

        const addCase = (month: string, indicator: string, participantId: string) => {
            if (!monthlyStats[month]) return;
            if (!monthlyStats[month][indicator]) {
                monthlyStats[month][indicator] = new Set();
            }
            monthlyStats[month][indicator].add(participantId);
        };
        
        participants.forEach(p => {
            p.riwayatPengukuran.forEach(record => {
                const month = record.tanggal_pengukuran.substring(0, 7);
                
                // Gizi (Balita)
                if (p.kategori === 'balita') {
                    for (const key in giziTrendOptions) {
                        if (giziTrendOptions[key as keyof typeof giziTrendOptions](record)) {
                            addCase(month, key, p.__backendId);
                        }
                    }
                }

                // Ibu Hamil
                if (p.kategori === 'ibu-hamil') {
                     for (const key in bumilTrendOptions) {
                        if (bumilTrendOptions[key as keyof typeof bumilTrendOptions](record, p)) {
                            addCase(month, key, p.__backendId);
                        }
                    }
                }

                // Pemeriksaan Kesehatan (Dewasa, Lansia, Remaja for Anemia)
                if (p.kategori === 'dewasa' || p.kategori === 'lansia' || p.kategori === 'anak-remaja') {
                    if (record.berat_badan && record.tinggi_badan) { // Pre-calculate BMI status if available
                        const bmiStatus = calculateBMIStatus(record.berat_badan, record.tinggi_badan);
                        record.status_kategori_bmi = bmiStatus['Kategori'].value;
                    }
                    for (const key in ptmTrendOptions) {
                        if (ptmTrendOptions[key as keyof typeof ptmTrendOptions](record, p)) {
                            addCase(month, key, p.__backendId);
                        }
                    }
                }
            });
        });

        const sortedMonths = Object.keys(monthlyStats).sort();
        
        const generateTrend = (indicator: string) => {
            return sortedMonths.map(month => ({
                month,
                count: monthlyStats[month][indicator]?.size || 0,
            }));
        };

        return {
            giziTrend: generateTrend(selectedGiziIndicator),
            ptmTrend: generateTrend(selectedPtmIndicator),
            bumilTrend: generateTrend(selectedBumilIndicator),
        };
    }, [participants, selectedGiziIndicator, selectedPtmIndicator, selectedBumilIndicator]);

     const nutritionalStatusData = useMemo(() => {
        const isUserScopedToDesa = userDesa && userDesa !== 'Semua';
        const aggregationKey: 'nama_posyandu' | 'alamat' = isUserScopedToDesa ? 'nama_posyandu' : 'alamat';
        const headerLabel = isUserScopedToDesa ? 'Posyandu' : 'Desa';

        const groups = Array.from(new Set(participants.map(p => p[aggregationKey])))
            .filter((value): value is string => typeof value === 'string')
            .sort();

        const statusGroups: Record<string, string[]> = {
            'BB/U': ['Berat badan sangat kurang', 'Berat badan kurang', 'Normal', 'Risiko berat badan lebih'],
            'TB/U': ['Sangat pendek (severely stunted)', 'Pendek (stunted)', 'Normal', 'Tinggi'],
            'BB/TB': ['Gizi buruk (severely wasted)', 'Gizi kurang (wasted)', 'Gizi baik (normal)', 'Berisiko gizi lebih', 'Gizi lebih (overweight)', 'Obesitas'],
            'Kenaikan BB': ['Naik', 'Tidak Naik', 'Baru Ditimbang'],
        };

        const allStatuses: { group: string; status: string }[] = [];
        Object.keys(statusGroups).forEach((group) => {
            const statuses = statusGroups[group];
            statuses.forEach(status => allStatuses.push({ group, status }));
        });

        const dataByGroup = groups.map(groupName => {
            const counts: Record<string, number> = {};
            allStatuses.forEach(({ group, status }) => {
                counts[`${group}__${status}`] = 0;
            });

            const groupParticipants = participants.filter(p => p[aggregationKey]?.toLowerCase() === groupName.toLowerCase());

            groupParticipants.forEach(p => {
                if (p.status_bb_u && counts.hasOwnProperty(`BB/U__${p.status_bb_u}`)) {
                    counts[`BB/U__${p.status_bb_u}`]++;
                }
                if (p.status_tb_u && counts.hasOwnProperty(`TB/U__${p.status_tb_u}`)) {
                    counts[`TB/U__${p.status_tb_u}`]++;
                }
                if (p.status_bb_tb && counts.hasOwnProperty(`BB/TB__${p.status_bb_tb}`)) {
                    counts[`BB/TB__${p.status_bb_tb}`]++;
                }
                if (p.kategori === 'balita' && p.status_kenaikan_berat && counts.hasOwnProperty(`Kenaikan BB__${p.status_kenaikan_berat}`)) {
                    counts[`Kenaikan BB__${p.status_kenaikan_berat}`]++;
                }
            });
            return { group: groupName, counts };
        });

        const totals: Record<string, number> = {};
        allStatuses.forEach(({ group, status }) => {
            const key = `${group}__${status}`;
            totals[key] = dataByGroup.reduce((sum, item) => sum + (item.counts[key] || 0), 0);
        });

        return { statusGroups, allStatuses, dataByGroup, totals, headerLabel };
    }, [participants, userDesa]);

    const healthCheckData = useMemo(() => {
        const isUserScopedToDesa = userDesa && userDesa !== 'Semua';
        const aggregationKey: 'nama_posyandu' | 'alamat' = isUserScopedToDesa ? 'nama_posyandu' : 'alamat';
        const headerLabel = isUserScopedToDesa ? 'Posyandu' : 'Desa';

        const groups = Array.from(new Set(participants.map(p => p[aggregationKey])))
            .filter((value): value is string => typeof value === 'string')
            .sort();

        const statusGroups: Record<string, string[]> = {
            'Tensi': ["Hipotensi", "Normal", "Pra-Hipertensi", "Hipertensi Tahap 1", "Hipertensi Tahap 2"],
            'GDS': ["Normal", "Pra-Diabetes", "Tinggi (Diabetes)"],
            'IMT': ["Berat Badan Kurang", "Normal", "Berat Badan Lebih", "Obesitas"],
            'Kemandirian': ["A", "B", "C"],
        };

        const allStatuses: { group: string; status: string }[] = [];
        Object.keys(statusGroups).forEach((group) => {
            const statuses = statusGroups[group];
            statuses.forEach(status => allStatuses.push({ group, status }));
        });

        const dataByGroup = groups.map(groupName => {
            const counts: Record<string, number> = {};
            allStatuses.forEach(({ group, status }) => {
                counts[`${group}__${status}`] = 0;
            });

            const groupParticipants = participants.filter(p => p[aggregationKey]?.toLowerCase() === groupName.toLowerCase());

            groupParticipants.forEach(p => {
                if (p.kesimpulan_tensi && counts.hasOwnProperty(`Tensi__${p.kesimpulan_tensi}`)) {
                    counts[`Tensi__${p.kesimpulan_tensi}`]++;
                }
                if (p.kesimpulan_gds && p.kesimpulan_gds === 'Normal' && counts.hasOwnProperty('GDS__Normal')) {
                     counts['GDS__Normal']++;
                }
                if (p.kesimpulan_gds && p.kesimpulan_gds !== 'Normal' && counts.hasOwnProperty(`GDS__${p.kesimpulan_gds}`)) {
                    counts[`GDS__${p.kesimpulan_gds}`]++;
                }
                if (p.status_kategori_bmi && p.status_kategori_bmi === 'Normal' && counts.hasOwnProperty('IMT__Normal')) {
                    counts['IMT__Normal']++;
                }
                if (p.status_kategori_bmi && p.status_kategori_bmi !== 'Normal' && counts.hasOwnProperty(`IMT__${p.status_kategori_bmi}`)) {
                    counts[`IMT__${p.status_kategori_bmi}`]++;
                }
                if (p.tingkatKemandirian && counts.hasOwnProperty(`Kemandirian__${p.tingkatKemandirian}`)) {
                    counts[`Kemandirian__${p.tingkatKemandirian}`]++;
                }
            });
            return { group: groupName, counts };
        });

        const totals: Record<string, number> = {};
        allStatuses.forEach(({ group, status }) => {
            const key = `${group}__${status}`;
            totals[key] = dataByGroup.reduce((sum, item) => sum + (item.counts[key] || 0), 0);
        });

        return { statusGroups, allStatuses, dataByGroup, totals, headerLabel };
    }, [participants, userDesa]);

    const ibuHamilRemajaStatusData = useMemo(() => {
        const isUserScopedToDesa = userDesa && userDesa !== 'Semua';
        const aggregationKey: 'nama_posyandu' | 'alamat' = isUserScopedToDesa ? 'nama_posyandu' : 'alamat';
        const headerLabel = isUserScopedToDesa ? 'Posyandu' : 'Desa';

        const groups = Array.from(new Set(participants.map(p => p[aggregationKey])))
            .filter((value): value is string => typeof value === 'string')
            .sort();

        const statusGroups: Record<string, string[]> = {
            'Ibu Hamil (LILA)': ['KEK', 'Normal'],
            'Ibu Hamil (HB)': ['Anemia', 'Normal'],
            'Remaja (HB)': ['Anemia', 'Normal'],
        };

        const allStatuses: { group: string; status: string }[] = [];
        Object.keys(statusGroups).forEach((group) => {
            const statuses = statusGroups[group];
            statuses.forEach(status => allStatuses.push({ group, status }));
        });

        const dataByGroup = groups.map(groupName => {
            const counts: Record<string, number> = {};
            allStatuses.forEach(({ group, status }) => {
                counts[`${group}__${status}`] = 0;
            });

            const groupParticipants = participants.filter(p => p[aggregationKey]?.toLowerCase() === groupName.toLowerCase());

            groupParticipants.forEach(p => {
                if (p.kategori === 'ibu-hamil' && p.status_lila) {
                    if (p.status_lila.includes('KEK')) counts['Ibu Hamil (LILA)__KEK']++;
                    else if (p.status_lila === 'Normal') counts['Ibu Hamil (LILA)__Normal']++;
                }
                if (p.kategori === 'ibu-hamil' && p.kesimpulan_hb) {
                    if (p.kesimpulan_hb === 'Anemia') counts['Ibu Hamil (HB)__Anemia']++;
                    else if (p.kesimpulan_hb === 'Normal') counts['Ibu Hamil (HB)__Normal']++;
                }
                if (p.kategori === 'anak-remaja' && p.kesimpulan_hb) {
                    if (p.kesimpulan_hb === 'Anemia') counts['Remaja (HB)__Anemia']++;
                    else if (p.kesimpulan_hb === 'Normal') counts['Remaja (HB)__Normal']++;
                }
            });
            return { group: groupName, counts };
        });

        const totals: Record<string, number> = {};
        allStatuses.forEach(({ group, status }) => {
            const key = `${group}__${status}`;
            totals[key] = dataByGroup.reduce((sum, item) => sum + (item.counts[key] || 0), 0);
        });

        return { statusGroups, allStatuses, dataByGroup, totals, headerLabel };
    }, [participants, userDesa]);


    return (
        <div className="step-content opacity-100 transform-none space-y-12">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Selamat Datang di PUSPITA</h2>
                <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mt-2">(Posyandu Semua Periode Hidup Terintegrasi)</p>
                <p className="text-xl md:text-2xl font-semibold text-gray-700 mt-1">Puskesmas Kupu</p>
                <p className="text-md text-gray-500 max-w-4xl mx-auto leading-relaxed mt-4 italic">"Posyandu adalah wadah pemeliharaan kesehatan yang dikelola dan diselenggarakan dari, oleh, untuk dan bersama masyarakat."</p>
            </div>
            
             {isPublicView && (
                <div className="text-center">
                    <button
                        onClick={onFamilyPortalClick}
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="w-6 h-6"><BookOpenIcon /></div>
                        <span>Portal Keluarga (Buku KIA Digital)</span>
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-blue-100 border border-blue-200 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{participants.length}</div>
                    <div className="text-sm font-medium text-blue-800">Total Peserta</div>
                </div>
                <div className="bg-yellow-100 border border-yellow-200 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-600">{participants.filter(p => p.kategori === 'ibu-hamil').length}</div>
                    <div className="text-sm font-medium text-yellow-800">Ibu Hamil</div>
                </div>
                <div className="bg-sky-100 border border-sky-200 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-sky-600">{participants.filter(p => p.kategori === 'balita').length}</div>
                    <div className="text-sm font-medium text-sky-800">Bayi & Balita</div>
                </div>
                 <div className="bg-purple-100 border border-purple-200 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">{participants.filter(p => p.kategori === 'anak-remaja').length}</div>
                    <div className="text-sm font-medium text-purple-800">Anak & Remaja</div>
                </div>
                <div className="bg-teal-100 border border-teal-200 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-teal-600">{participants.filter(p => p.kategori === 'dewasa').length}</div>
                    <div className="text-sm font-medium text-teal-800">Dewasa</div>
                </div>
                <div className="bg-pink-100 border border-pink-200 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-pink-600">{participants.filter(p => p.kategori === 'lansia').length}</div>
                    <div className="text-sm font-medium text-pink-800">Lansia</div>
                </div>
            </div>

             <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200">
                <TrendChart
                    title="Rasio D/S (Partisipasi Penimbangan Balita)"
                    data={dsTrendData}
                    lineColor="#3b82f6" 
                    labelY="Partisipasi (%)"
                    yMaxOverride={100}
                    yAxisLabelSuffix="%"
                />
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200">
                <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">Indikator Kesehatan Utama (Bulan Ini)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <IndicatorCard title="Status Gizi Balita">
                        <div className="space-y-4">
                            <ProgressBar value={keyHealthIndicators.balita.stuntingPercentage} color="text-orange-500" label="Risiko Stunting" />
                            <ProgressBar value={keyHealthIndicators.balita.giziKurangPercentage} color="text-red-500" label="Gizi Kurang/Buruk" />
                        </div>
                    </IndicatorCard>
                     <IndicatorCard title="Tren Kenaikan BB Balita">
                        <DonutChart naik={keyHealthIndicators.balita.bbNaikCount} tidakNaik={keyHealthIndicators.balita.bbTidakNaikCount} />
                    </IndicatorCard>
                    <IndicatorCard title="Kesehatan Ibu Hamil">
                        <div className="space-y-4">
                            <ProgressBar value={keyHealthIndicators.bumil.anemiaPercentage} color="text-red-500" label="Risiko Anemia" />
                            <ProgressBar value={keyHealthIndicators.bumil.kekPercentage} color="text-yellow-500" label="Risiko KEK" />
                        </div>
                    </IndicatorCard>
                    <IndicatorCard title="Penyakit Tidak Menular">
                         <div className="space-y-4">
                            <ProgressBar value={keyHealthIndicators.ptm.hipertensiPercentage} color="text-purple-500" label="Risiko Hipertensi" />
                            <ProgressBar value={keyHealthIndicators.ptm.diabetesPercentage} color="text-indigo-500" label="Risiko Diabetes" />
                        </div>
                    </IndicatorCard>
                </div>
            </div>

            <div className="space-y-8">
                <AccordionSection 
                    title="Grafik Tren Kesehatan (12 Bulan Terakhir)" 
                    isOpen={openSection === 'tren'} 
                    onToggle={() => toggleSection('tren')}
                    icon={<div className="w-6 h-6 text-indigo-600"><ChartIcon /></div>}
                >
                    <div className="space-y-8">
                        <div className="border rounded-lg p-4 bg-gray-50/50">
                             <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                                <label htmlFor="gizi-indicator" className="font-semibold text-black flex-shrink-0">Grafik Status Gizi:</label>
                                <select 
                                    id="gizi-indicator"
                                    value={selectedGiziIndicator}
                                    onChange={(e) => setSelectedGiziIndicator(e.target.value as keyof typeof giziTrendOptions)}
                                    className="p-2 border border-gray-300 rounded-md bg-white shadow-sm w-full sm:w-auto text-black"
                                >
                                    {Object.keys(giziTrendOptions).map(key => <option key={key} value={key}>{key}</option>)}
                                </select>
                            </div>
                            <TrendChart 
                                title={`Tren Kasus ${selectedGiziIndicator} (Balita)`}
                                data={trendData.giziTrend}
                                lineColor="#ef4444" // red-500
                                labelY="Jumlah Kasus"
                            />
                        </div>

                        <div className="border rounded-lg p-4 bg-gray-50/50">
                             <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                                <label htmlFor="ptm-indicator" className="font-semibold text-black flex-shrink-0">Grafik Pemeriksaan Kesehatan:</label>
                                <select 
                                    id="ptm-indicator"
                                    value={selectedPtmIndicator}
                                    onChange={(e) => setSelectedPtmIndicator(e.target.value as keyof typeof ptmTrendOptions)}
                                    className="p-2 border border-gray-300 rounded-md bg-white shadow-sm w-full sm:w-auto text-black"
                                >
                                    {Object.keys(ptmTrendOptions).map(key => <option key={key} value={key}>{key}</option>)}
                                </select>
                            </div>
                            <TrendChart 
                                title={`Tren Kasus ${selectedPtmIndicator}`}
                                data={trendData.ptmTrend}
                                lineColor="#8b5cf6" // violet-500
                                labelY="Jumlah Kasus"
                            />
                        </div>

                        <div className="border rounded-lg p-4 bg-gray-50/50">
                             <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                                <label htmlFor="bumil-indicator" className="font-semibold text-black flex-shrink-0">Grafik Kesehatan Ibu Hamil:</label>
                                <select 
                                    id="bumil-indicator"
                                    value={selectedBumilIndicator}
                                    onChange={(e) => setSelectedBumilIndicator(e.target.value as keyof typeof bumilTrendOptions)}
                                    className="p-2 border border-gray-300 rounded-md bg-white shadow-sm w-full sm:w-auto text-black"
                                >
                                    {Object.keys(bumilTrendOptions).map(key => <option key={key} value={key}>{key}</option>)}
                                </select>
                            </div>
                             <TrendChart 
                                title={`Tren Kasus ${selectedBumilIndicator}`}
                                data={trendData.bumilTrend}
                                lineColor="#f59e0b" // amber-500
                                labelY="Jumlah Kasus"
                            />
                        </div>

                    </div>
                </AccordionSection>

                <AccordionSection title={`Rekapitulasi Status Gizi Balita per ${nutritionalStatusData.headerLabel}`} isOpen={openSection === 'gizi'} onToggle={() => toggleSection('gizi')}>
                    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="text-xs text-gray-800 uppercase bg-gray-50">
                                <tr>
                                    <th rowSpan={2} className="p-3 sticky left-0 bg-gray-100 z-10 border-b border-r border-gray-200 align-middle text-center">{nutritionalStatusData.headerLabel}</th>
                                    {Object.keys(nutritionalStatusData.statusGroups).map((group) => {
                                        const statuses = nutritionalStatusData.statusGroups[group];
                                        return (
                                            <th key={group} colSpan={statuses.length} className="py-2 px-6 text-center border-b border-l border-gray-200 align-middle">{group}</th>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    {nutritionalStatusData.allStatuses.map(({ group, status }) => {
                                        const headerLines = statusHeaders[status] || [status, ''];
                                        return <th key={status + group} className="p-1 font-medium text-center border-b border-l border-gray-200 bg-gray-100 align-middle w-16 min-w-16"><div className="flex flex-col justify-center h-full"><span className="text-[10px] leading-tight font-semibold">{headerLines[0]}</span><span className="text-[10px] leading-tight">{headerLines[1]}</span></div></th>;
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {nutritionalStatusData.dataByGroup.map(({ group, counts }) => (
                                    <tr key={group} className="bg-white border-b hover:bg-gray-50">
                                        <th className="p-3 font-semibold text-gray-900 sticky left-0 bg-white hover:bg-gray-50 z-10 border-r">{group}</th>
                                        {nutritionalStatusData.allStatuses.map(({ group: statusGroup, status }) => (
                                            <td key={`${group}-${statusGroup}-${status}`} className="py-3 px-1 text-center border-l border-gray-200 text-gray-900 w-16 min-w-16">{counts[`${statusGroup}__${status}`] || 0}</td>
                                        ))}
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 font-bold"><th className="p-3 sticky left-0 bg-gray-100 z-10 border-r text-gray-900">Total</th>
                                    {nutritionalStatusData.allStatuses.map(({ group, status }) => (
                                        <td key={`total-${group}-${status}`} className="py-3 px-1 text-center border-l border-gray-200 text-gray-900 w-16 min-w-16">{nutritionalStatusData.totals[`${group}__${status}`] || 0}</td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </AccordionSection>

                <AccordionSection title={`Rekapitulasi Pemeriksaan Kesehatan per ${healthCheckData.headerLabel}`} isOpen={openSection === 'kesehatan'} onToggle={() => toggleSection('kesehatan')}>
                     <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="text-xs text-gray-800 uppercase bg-gray-50">
                                <tr>
                                    <th rowSpan={2} className="p-3 sticky left-0 bg-gray-100 z-10 border-b border-r border-gray-200 align-middle text-center">{healthCheckData.headerLabel}</th>
                                    {Object.keys(healthCheckData.statusGroups).map((group) => {
                                        const statuses = healthCheckData.statusGroups[group];
                                        return (
                                            <th key={group} colSpan={statuses.length} className="py-2 px-6 text-center border-b border-l border-gray-200 align-middle">{group}</th>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    {healthCheckData.allStatuses.map(({ group, status }) => {
                                        const headerLines = statusHeaders[status] || [status, ''];
                                        return <th key={status + group} className="p-1 font-medium text-center border-b border-l border-gray-200 bg-gray-100 align-middle w-16 min-w-16"><div className="flex flex-col justify-center h-full"><span className="text-[10px] leading-tight font-semibold">{headerLines[0]}</span><span className="text-[10px] leading-tight">{headerLines[1]}</span></div></th>;
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {healthCheckData.dataByGroup.map(({ group, counts }) => (
                                    <tr key={group} className="bg-white border-b hover:bg-gray-50">
                                        <th className="p-3 font-semibold text-gray-900 sticky left-0 bg-white hover:bg-gray-50 z-10 border-r">{group}</th>
                                        {healthCheckData.allStatuses.map(({ group: statusGroup, status }) => (
                                            <td key={`${group}-${statusGroup}-${status}`} className="py-3 px-1 text-center border-l border-gray-200 text-gray-900 w-16 min-w-16">{counts[`${statusGroup}__${status}`] || 0}</td>
                                        ))}
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 font-bold"><th className="p-3 sticky left-0 bg-gray-100 z-10 border-r text-gray-900">Total</th>
                                    {healthCheckData.allStatuses.map(({ group, status }) => (
                                        <td key={`total-${group}-${status}`} className="py-3 px-1 text-center border-l border-gray-200 text-gray-900 w-16 min-w-16">{healthCheckData.totals[`${group}__${status}`] || 0}</td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </AccordionSection>

                <AccordionSection title={`Rekapitulasi Status Kesehatan Ibu Hamil & Remaja per ${ibuHamilRemajaStatusData.headerLabel}`} isOpen={openSection === 'bumil'} onToggle={() => toggleSection('bumil')}>
                     <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="text-xs text-gray-800 uppercase bg-gray-50">
                                <tr>
                                    <th rowSpan={2} className="p-3 sticky left-0 bg-gray-100 z-10 border-b border-r border-gray-200 align-middle text-center">{ibuHamilRemajaStatusData.headerLabel}</th>
                                    {Object.keys(ibuHamilRemajaStatusData.statusGroups).map((group) => {
                                        const statuses = ibuHamilRemajaStatusData.statusGroups[group];
                                        return (
                                            <th key={group} colSpan={statuses.length} className="py-2 px-6 text-center border-b border-l border-gray-200 align-middle">{group}</th>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    {ibuHamilRemajaStatusData.allStatuses.map(({ group, status }) => {
                                        const headerLines = statusHeaders[status] || [status, ''];
                                        return <th key={status + group} className="p-1 font-medium text-center border-b border-l border-gray-200 bg-gray-100 align-middle w-16 min-w-16"><div className="flex flex-col justify-center h-full"><span className="text-[10px] leading-tight font-semibold">{headerLines[0]}</span><span className="text-[10px] leading-tight">{headerLines[1]}</span></div></th>;
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {ibuHamilRemajaStatusData.dataByGroup.map(({ group, counts }) => (
                                    <tr key={group} className="bg-white border-b hover:bg-gray-50">
                                        <th className="p-3 font-semibold text-gray-900 sticky left-0 bg-white hover:bg-gray-50 z-10 border-r">{group}</th>
                                        {ibuHamilRemajaStatusData.allStatuses.map(({ group: statusGroup, status }) => (
                                            <td key={`${group}-${statusGroup}-${status}`} className="py-3 px-1 text-center border-l border-gray-200 text-gray-900 w-16 min-w-16">{counts[`${statusGroup}__${status}`] || 0}</td>
                                        ))}
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 font-bold"><th className="p-3 sticky left-0 bg-gray-100 z-10 border-r text-gray-900">Total</th>
                                    {ibuHamilRemajaStatusData.allStatuses.map(({ group, status }) => (
                                        <td key={`total-${group}-${status}`} className="py-3 px-1 text-center border-l border-gray-200 text-gray-900 w-16 min-w-16">{ibuHamilRemajaStatusData.totals[`${group}__${status}`] || 0}</td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </AccordionSection>
            </div>
        </div>
    );
};