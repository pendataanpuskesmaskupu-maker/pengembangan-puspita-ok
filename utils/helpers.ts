
// ... (existing imports)
import type { Category, MeasurementRecord, SurveiKeluarga, PhbsClassification, Participant, SkriningPHQ2, SkriningGAD2, SkriningEPDS } from '../types';
import { wfaBoys, wfaGirls, hfaBoys, hfaGirls, wfhBoys, wfhGirls, lfaBoys, lfaGirls, wflBoys, wflGirls } from './z-score-standards';

// ... (previous helper functions remain the same until calculateHealthServiceStatus)
// [KEEP ALL PREVIOUS FUNCTIONS: calculateAge, calculateDetailedAge, formatDetailedAge, formatDate, normalizeDateString, determineCategory, getCategoryLabel, getCategoryTheme, getPhbsTheme, calculatePhbsScore, getStatusColor, interpolate, getReferenceValues, calculateBalitaStatus, calculateBMIStatus, calculateIbuHamilStatus, calculateRemajaStatus, calculateLansiaStatus, calculateAgeInMonths, calculateWeightGainStatus]

export const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

export const calculateDetailedAge = (birthDate: string, targetDateStr?: string): { years: number; months: number; days: number } => {
    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const birth = new Date(birthDate);
    
    let years = targetDate.getFullYear() - birth.getFullYear();
    let months = targetDate.getMonth() - birth.getMonth();
    let days = targetDate.getDate() - birth.getDate();
    
    if (days < 0) {
        months--;
        const lastMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
        days += lastMonth.getDate();
    }
    
    if (months < 0) {
        years--;
        months += 12;
    }
    
    return { years, months, days };
};

export const formatDetailedAge = (birthDate: string, targetDateStr?: string): string => {
    const { years, months } = calculateDetailedAge(birthDate, targetDateStr);
    if (years === 0) {
        return months === 0 ? "Kurang dari 1 bulan" : `${months} bulan`;
    }
    return `${years} tahun ${months > 0 ? `${months} bulan` : ''}`.trim();
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

export const normalizeDateString = (dateString: string): string | null => {
    if (!dateString) return null;

    const dmyParts = dateString.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmyParts) {
        const day = parseInt(dmyParts[1], 10);
        const month = parseInt(dmyParts[2], 10);
        const year = parseInt(dmyParts[3], 10);
        
        if (month > 0 && month <= 12 && day > 0 && day <= 31) {
             const date = new Date(Date.UTC(year, month - 1, day));
             if (!isNaN(date.getTime()) && date.getUTCDate() === day) {
                return date.toISOString().split('T')[0];
             }
        }
    }

    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        if (date.getFullYear() > 1900 && date.getFullYear() < 2100) {
            const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            return utcDate.toISOString().split('T')[0];
        }
    }
    
    return null; 
};


export const determineCategory = (birthDate: string, isPregnant?: boolean): Category => {
    if (isPregnant) {
        return 'ibu-hamil';
    }
    
    const { years, months } = calculateDetailedAge(birthDate);
    const totalMonths = years * 12 + months;

    if (totalMonths < 60) { 
        return 'balita';
    }
    if (years < 18) { 
        return 'anak-remaja';
    }
    if (years < 60) {
        return 'dewasa';
    }
    return 'lansia';
};

export const getCategoryLabel = (kategori: Category): string => {
    const labels: Record<Category, string> = {
        'ibu-hamil': 'Ibu Hamil',
        'balita': 'Bayi & Balita',
        'anak-remaja': 'Anak & Remaja',
        'dewasa': 'Dewasa',
        'lansia': 'Lansia',
    };
    return labels[kategori] || 'Tidak Diketahui';
};

export const getCategoryTheme = (kategori: Category) => {
    const themes: Record<Category, { badge: string; text: string; bg: string; border: string }> = {
        'ibu-hamil': { badge: 'bg-yellow-100 text-yellow-800', text: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-200' },
        'balita': { badge: 'bg-blue-100 text-blue-800', text: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-200' },
        'anak-remaja': { badge: 'bg-purple-100 text-purple-800', text: 'text-purple-800', bg: 'bg-purple-50', border: 'border-purple-200' },
        'dewasa': { badge: 'bg-green-100 text-green-800', text: 'text-green-800', bg: 'bg-green-50', border: 'border-green-200' },
        'lansia': { badge: 'bg-pink-100 text-pink-800', text: 'text-pink-800', bg: 'bg-pink-50', border: 'border-pink-200' },
    };
    return themes[kategori] || themes['balita'];
};

export const getPhbsTheme = (classification?: string) => {
    switch (classification) {
        case 'PHBS Pratama':
            return { badge: 'bg-red-100 text-red-800' };
        case 'PHBS Madya':
            return { badge: 'bg-yellow-100 text-yellow-800' };
        case 'PHBS Utama':
            return { badge: 'bg-blue-100 text-blue-800' };
        case 'PHBS Paripurna':
            return { badge: 'bg-green-100 text-green-800' };
        default:
            return { badge: 'bg-gray-100 text-gray-800' };
    }
};

export const calculatePhbsScore = (survey: SurveiKeluarga): { score: number; classification: PhbsClassification } => {
    let score = 0;
    if (survey.sedangHamil === false || survey.pemeriksaanKehamilan6Kali === true) score++;
    if (survey.adaBayi_0_11_bln === false || survey.bersalinDiFaskes === true) score++;
    if (survey.adaBalita_7_23_bln === false || survey.asiEksklusif === true) score++;
    const has7_23 = survey.adaBalita_7_23_bln === true;
    const has2_5 = survey.adaBalita_2_5_thn === true;
    if (!has7_23 && !has2_5) {
        score++;
    } else {
        const monitored7_23 = !has7_23 || survey.pemantauanPertumbuhan_7_23_bln === true;
        const monitored2_5 = !has2_5 || survey.pemantauanPertumbuhan_2_5_thn === true;
        if (monitored7_23 && monitored2_5) score++;
    }
    if (survey.konsumsiGiziSeimbang === true) score++;
    if (survey.adaRemajaPutri_10_18_thn === false || survey.remajaPutriMinumTTD === true) score++;
    if (survey.garamBeryodium === true) score++;
    const safeWaterSources = ['PAMSIMAS', 'Sumur bor dengan pompa listrik', 'Sumur bor dengan pompa tangan', 'Sumur gali terlindungi'];
    if (survey.sumberAirUtama && safeWaterSources.includes(survey.sumberAirUtama)) score++;
    if (survey.bangunanBawahJamban && survey.bangunanBawahJamban !== 'Cubluk / Lubang Tanah' && survey.bangunanBawahJamban !== 'Dibuang langsung ke lingkungan') score++;
    if (survey.buangSampahPadaTempatnya === true) score++;
    if (survey.aktivitasFisik === true) score++;
    if (survey.merokokDalamRumah === false) score++;
    if (survey.cuciTanganPakaiSabun === true) score++;
    if (survey.gosokGigi === true) score++;
    if (survey.cekKesehatanBerkala === true) score++;
    if (survey.jentikNyamuk === false) score++;
    
    let classification: PhbsClassification;
    if (score <= 5) classification = 'PHBS Pratama';
    else if (score <= 10) classification = 'PHBS Madya';
    else if (score <= 15) classification = 'PHBS Utama';
    else classification = 'PHBS Paripurna';

    return { score, classification };
};


export const getStatusColor = (status?: string | null): string => {
    if (!status) return 'text-gray-800';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'normal' || lowerStatus === 'gizi baik (normal)' || lowerStatus === 'naik') {
        return 'text-green-600';
    }
    if (status === 'Tinggi') {
        return 'text-gray-800';
    }
    const riskKeywords = [
        'lebih', 'overweight', 'risiko', 'berisiko', 'kurang', 'underweight',
        'stunting', 'pendek', 'buruk', 'wasted', 'kek', 'anemia', 'obesitas',
        'hipertensi', 'hipotensi', 'diabetes', 'tinggi', 'rendah', 'tidak naik', 'o'
    ];
    if (status === 'O' || lowerStatus.includes('(o)')) return 'text-orange-600';
    if (riskKeywords.some(keyword => lowerStatus.includes(keyword))) {
        return 'text-red-600';
    }
    return 'text-gray-800';
};

const interpolate = (x: number, x0: number, y0: number, x1: number, y1: number): number => {
    if (x1 === x0) return y0;
    return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
};

const getReferenceValues = (table: Record<string, any>, key: number): any => {
    const keyFloored = Math.floor(key);
    const exactMatch = table[keyFloored];
    if (exactMatch && Math.abs(key - keyFloored) < 0.001) return exactMatch;

    const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
    let lowerKey = keys[0];
    let upperKey = keys[keys.length - 1];

    for (let i = 0; i < keys.length; i++) {
        if (keys[i] <= key) {
            lowerKey = keys[i];
        }
        if (keys[i] >= key) {
            upperKey = keys[i];
            break;
        }
    }
    
    if (lowerKey === upperKey) return table[lowerKey];

    const lowerValues = table[lowerKey];
    const upperValues = table[upperKey];
    const interpolatedValues: Record<string, number> = {};

    for (const sdKey in lowerValues) {
        interpolatedValues[sdKey] = interpolate(key, lowerKey, lowerValues[sdKey], upperKey, upperValues[sdKey]);
    }
    return interpolatedValues;
};

export const calculateBalitaStatus = (berat: number, tinggi: number, birthDate: string, jenis_kelamin: 'Laki-laki' | 'Perempuan') => {
    const ageInMonths = calculateAgeInMonths(birthDate);
    const results: Record<string, { value: string, color: string }> = {};

    const wfaTable = jenis_kelamin === 'Laki-laki' ? wfaBoys : wfaGirls;
    const wfaRef = getReferenceValues(wfaTable, ageInMonths);
    let status_bb_u = 'N/A';
    if (wfaRef) {
        if (berat > wfaRef.sd1) status_bb_u = 'Risiko berat badan lebih';
        else if (berat >= wfaRef.sd2neg) status_bb_u = 'Normal';
        else if (berat >= wfaRef.sd3neg) status_bb_u = 'Berat badan kurang';
        else status_bb_u = 'Berat badan sangat kurang';
    }
    results['BB/U'] = { value: status_bb_u, color: getStatusColor(status_bb_u) };

    const usePB = ageInMonths <= 24;
    const heightStatusLabel = usePB ? 'PB/U' : 'TB/U';
    
    const heightTable = usePB
        ? (jenis_kelamin === 'Laki-laki' ? lfaBoys : lfaGirls)
        : (jenis_kelamin === 'Laki-laki' ? hfaBoys : hfaGirls);

    const keyForHeightLookup = usePB ? ageInMonths : Math.max(24, ageInMonths);
    const heightRef = getReferenceValues(heightTable, keyForHeightLookup);
    
    let status_tb_u = 'N/A';
    if (heightRef) {
        if (tinggi > heightRef.sd3) {
            status_tb_u = 'Tinggi';
        } else if (tinggi >= heightRef.sd2neg) { 
            status_tb_u = 'Normal';
        } else if (tinggi >= heightRef.sd3neg) { 
            status_tb_u = 'Pendek (stunted)';
        } else {
            status_tb_u = 'Sangat pendek (severely stunted)';
        }
    }
    results[heightStatusLabel] = { value: status_tb_u, color: getStatusColor(status_tb_u) };
    
    const useWFL = ageInMonths <= 24;
    const weightForHeightStatusLabel = useWFL ? 'BB/PB' : 'BB/TB';
    const weightForHeightTable = useWFL
        ? (jenis_kelamin === 'Laki-laki' ? wflBoys : wflGirls)
        : (jenis_kelamin === 'Laki-laki' ? wfhBoys : wfhGirls);

    const wfhRef = getReferenceValues(weightForHeightTable, tinggi);
    let status_bb_tb = 'N/A';
    if (wfhRef) {
        if (berat > wfhRef.sd3) status_bb_tb = 'Obesitas';
        else if (berat > wfhRef.sd2) status_bb_tb = 'Gizi lebih (overweight)';
        else if (berat > wfhRef.sd1) status_bb_tb = 'Berisiko gizi lebih';
        else if (berat >= wfhRef.sd2neg) status_bb_tb = 'Gizi baik (normal)';
        else if (berat >= wfhRef.sd3neg) status_bb_tb = 'Gizi kurang (wasted)';
        else status_bb_tb = 'Gizi buruk (severely wasted)';
    }
    results[weightForHeightStatusLabel] = { value: status_bb_tb, color: getStatusColor(status_bb_tb) };

    return results;
};

export const calculateBMIStatus = (berat: number, tinggi: number) => {
    const tinggiM = tinggi / 100;
    const bmi = (berat / (tinggiM * tinggiM)).toFixed(1);
    let status_kategori_bmi = 'Normal';
    if (+bmi < 18.5) status_kategori_bmi = 'Berat Badan Kurang';
    else if (+bmi >= 25 && +bmi < 30) status_kategori_bmi = 'Berat Badan Lebih';
    else if (+bmi >= 30) status_kategori_bmi = 'Obesitas';
    return {
        'BMI': { value: bmi, color: getStatusColor(status_kategori_bmi) },
        'Kategori': { value: status_kategori_bmi, color: getStatusColor(status_kategori_bmi) },
    };
};

export const calculateIbuHamilStatus = (lila?: number) => {
    let lilaStatus = { value: '-', color: 'text-gray-800' };
    if (lila) {
        const status = lila < 23.5 ? 'KEK (Kurang Energi Kronis)' : 'Normal';
        lilaStatus = { value: status, color: getStatusColor(status) };
    }
    return { 'Status LILA': lilaStatus };
}

export const calculateRemajaStatus = (berat: number, tinggi: number) => {
    const bmiResult = calculateBMIStatus(berat, tinggi);
    return { ...bmiResult };
}

export const calculateLansiaStatus = (berat: number, tinggi: number, lila?: number) => {
    const bmiResult = calculateBMIStatus(berat, tinggi);
    let lilaStatus = { value: '-', color: 'text-gray-800' };
    if (lila) {
        const status = lila < 23.5 ? 'Kurang Gizi' : 'Normal';
        lilaStatus = { value: status, color: getStatusColor(status) };
    }
    return { ...bmiResult, 'Status LILA': lilaStatus };
}

export const calculateAgeInMonths = (birthDate: string, measurementDate?: string): number => {
    if (!birthDate) return 0;
    const { years, months, days } = calculateDetailedAge(birthDate, measurementDate);
    return years * 12 + months + days / 30.44; 
};

export const calculateWeightGainStatus = (
    currentWeight: number,
    currentDate: string,
    birthDate: string,
    history: readonly MeasurementRecord[]
): { status: 'Naik' | 'Tidak Naik' | 'Baru Ditimbang' | 'O'; diff: number | null } => {
    const sortedHistory = [...history].sort((a, b) => new Date(b.tanggal_pengukuran).getTime() - new Date(a.tanggal_pengukuran).getTime());
    const previousMeasurementAny = sortedHistory.find(
        record => new Date(record.tanggal_pengukuran) < new Date(currentDate) && record.berat_badan != null
    );

    if (!previousMeasurementAny || previousMeasurementAny.berat_badan == null) {
        return { status: 'Baru Ditimbang', diff: null };
    }

    const currentDt = new Date(currentDate);
    const prevDt = new Date(previousMeasurementAny.tanggal_pengukuran);
    const monthDiff = (currentDt.getFullYear() - prevDt.getFullYear()) * 12 + (currentDt.getMonth() - prevDt.getMonth());
    
    if (monthDiff > 1) {
         return { status: 'O', diff: null };
    }

    const ageInMonths = calculateAgeInMonths(birthDate, currentDate);
    const ageInMonthsInteger = Math.floor(ageInMonths);
    const weightDifferenceGrams = (currentWeight - previousMeasurementAny.berat_badan) * 1000;

    let kbm = 0; 
    if (ageInMonthsInteger < 1) kbm = 800;
    else if (ageInMonthsInteger <= 2) kbm = 900;
    else if (ageInMonthsInteger <= 3) kbm = 800;
    else if (ageInMonthsInteger <= 4) kbm = 600;
    else if (ageInMonthsInteger <= 5) kbm = 500;
    else if (ageInMonthsInteger <= 6) kbm = 400;
    else if (ageInMonthsInteger <= 12) kbm = 300;
    else if (ageInMonthsInteger <= 24) kbm = 200;
    else {
        return { status: weightDifferenceGrams > 0 ? 'Naik' : 'Tidak Naik', diff: Math.round(weightDifferenceGrams) };
    }

    return { status: weightDifferenceGrams >= kbm ? 'Naik' : 'Tidak Naik', diff: Math.round(weightDifferenceGrams) };
};

export const calculateHealthServiceStatus = (
    data: {
        sistolik?: number;
        diastolik?: number;
        gds?: number;
        kolesterol?: number;
        asamUrat?: number;
        pemeriksaanHB?: number;
        jenis_kelamin: 'Laki-laki' | 'Perempuan';
        age: number;
        kategori: Category;
    }
): {
    kesimpulan_tensi?: string;
    kesimpulan_gds?: string;
    kesimpulan_kolesterol?: string;
    kesimpulan_asam_urat?: string;
    kesimpulan_hb?: string;
} => {
    const conclusions: {
        kesimpulan_tensi?: string;
        kesimpulan_gds?: string;
        kesimpulan_kolesterol?: string;
        kesimpulan_asam_urat?: string;
        kesimpulan_hb?: string;
    } = {};

    if (data.sistolik && data.diastolik) {
        const sis = data.sistolik;
        const dia = data.diastolik;
        if (sis < 90 && dia < 60) {
            conclusions.kesimpulan_tensi = 'Hipotensi';
        } else if (sis < 120 && dia < 80) {
            conclusions.kesimpulan_tensi = 'Normal';
        } else if ((sis >= 120 && sis <= 139) || (dia >= 80 && dia <= 89)) {
            conclusions.kesimpulan_tensi = 'Pra-Hipertensi';
        } else if ((sis >= 140 && sis <= 159) || (dia >= 90 && dia <= 99)) {
            conclusions.kesimpulan_tensi = 'Hipertensi Tahap 1';
        } else if (sis >= 160 || dia >= 100) {
            conclusions.kesimpulan_tensi = 'Hipertensi Tahap 2';
        }
    }

    if (data.gds) {
        if (data.gds < 140) {
            conclusions.kesimpulan_gds = 'Normal';
        } else if (data.gds >= 140 && data.gds < 200) {
            conclusions.kesimpulan_gds = 'Pra-Diabetes';
        } else if (data.gds >= 200) {
            conclusions.kesimpulan_gds = 'Tinggi (Diabetes)';
        }
    }
    
    if (data.kolesterol) {
        if (data.kolesterol < 200) {
            conclusions.kesimpulan_kolesterol = 'Normal';
        } else if (data.kolesterol >= 200 && data.kolesterol < 240) {
            conclusions.kesimpulan_kolesterol = 'Batas Tinggi';
        } else if (data.kolesterol >= 240) {
            conclusions.kesimpulan_kolesterol = 'Kolesterol Tinggi';
        }
    }

    if (data.asamUrat) {
        const isMale = data.jenis_kelamin === 'Laki-laki';
        const highThreshold = isMale ? 7.0 : 5.7;
        const lowThreshold = isMale ? 3.4 : 2.4;

        if (data.asamUrat > highThreshold) {
            conclusions.kesimpulan_asam_urat = 'Asam Urat Tinggi';
        } else if (data.asamUrat < lowThreshold) {
            conclusions.kesimpulan_asam_urat = 'Asam Urat Rendah';
        } else {
            conclusions.kesimpulan_asam_urat = 'Normal';
        }
    }

    if (data.pemeriksaanHB) {
        const hb = data.pemeriksaanHB;
        let kesimpulan = '';
        if (data.kategori === 'ibu-hamil') {
            kesimpulan = hb < 11.0 ? 'Anemia' : 'Normal';
        } else if (data.kategori === 'balita' || data.kategori === 'anak-remaja') {
            if (data.age < 5) {
                kesimpulan = hb < 11.0 ? 'Anemia' : 'Normal';
            } 
            else if (data.age >= 5 && data.age <= 11) {
                kesimpulan = hb < 11.5 ? 'Anemia' : 'Normal';
            } 
            else if (data.age >= 12 && data.age <= 14) {
                kesimpulan = hb < 12.0 ? 'Anemia' : 'Normal';
            } 
            else if (data.age >= 15) {
                if (data.jenis_kelamin === 'Laki-laki') {
                    kesimpulan = hb < 13.0 ? 'Anemia' : 'Normal';
                } else { 
                    kesimpulan = hb < 12.0 ? 'Anemia' : 'Normal';
                }
            }
        }
        if (kesimpulan) {
            conclusions.kesimpulan_hb = kesimpulan;
        }
    }

    return conclusions;
};

export const getDevelopmentalMilestones = (ageInMonths: number): { milestones: string[], bracketEnd: number, ageGroup: string } => {
    // ... (keep existing logic)
    const age = Math.floor(ageInMonths);
    if (age <= 3) return { milestones: ["Mengangkat kepala setinggi 45° saat tengkurap.", "Menggerakkan kepala dari kiri/kanan ke tengah.", "Melihat dan menatap wajah Anda.", "Mengoceh spontan atau bereaksi dengan mengoceh."], bracketEnd: 3, ageGroup: "0-3 Bulan" };
    if (age <= 6) return { milestones: ["Berbalik dari telungkup ke telentang.", "Mengangkat kepala setinggi 90°.", "Meraih benda yang ada di dekatnya.", "Menirukan bunyi."], bracketEnd: 6, ageGroup: "3-6 Bulan" };
    if (age <= 9) return { milestones: ["Duduk tanpa pegangan.", "Merangkak meraih mainan atau mendekati seseorang.", "Memindahkan benda dari satu tangan ke tangan lainnya.", "Mengeluarkan suara seperti 'ma-ma', 'da-da'."], bracketEnd: 9, ageGroup: "6-9 Bulan" };
    if (age <= 12) return { milestones: ["Mengangkat badan ke posisi berdiri tanpa bantuan.", "Berjalan dengan dituntun.", "Menggenggam erat pensil.", "Menirukan kata."], bracketEnd: 12, ageGroup: "9-12 Bulan" };
    if (age <= 18) return { milestones: ["Berdiri sendiri tanpa berpegangan.", "Berjalan mundur.", "Menumpuk 2 kubus.", "Mengucapkan 5-10 kata."], bracketEnd: 18, ageGroup: "12-18 Bulan" };
    if (age <= 24) return { milestones: ["Berjalan sendiri dengan baik.", "Naik tangga atau memanjat kursi.", "Menumpuk 4 kubus.", "Mengucapkan kalimat 2 kata."], bracketEnd: 24, ageGroup: "18-24 Bulan" };
    if (age <= 36) return { milestones: ["Berdiri dengan satu kaki selama 2-3 detik.", "Mencoret-coret pensil pada kertas.", "Mengenal 2-4 warna.", "Mengenakan pakaian sendiri."], bracketEnd: 36, ageGroup: "2-3 Tahun" };
    if (age <= 48) return { milestones: ["Berdiri dengan satu kaki selama 6 detik.", "Mengayuh sepeda roda tiga.", "Menggambar lingkaran.", "Bermain bersama teman."], bracketEnd: 48, ageGroup: "3-4 Tahun" };
    if (age <= 60) return { milestones: ["Melompat dengan satu kaki.", "Menggambar bentuk persegi.", "Menjawab pertanyaan sederhana.", "Berpakaian sendiri tanpa bantuan."], bracketEnd: 60, ageGroup: "4-5 Tahun" };
    return { milestones: ["Tidak ada data perkembangan untuk usia ini."], bracketEnd: 72, ageGroup: "5+ Tahun" };
};


export const generateParticipantReportHTML = (participant: Participant): string => {
    // ... (keep existing logic)
    const history = participant.riwayatPengukuran?.slice().sort((a, b) => new Date(a.tanggal_pengukuran).getTime() - new Date(b.tanggal_pengukuran).getTime()) || [];
    const tableRows = history.map(record => {
        const ageAtMeasurement = formatDetailedAge(participant.tanggal_lahir, record.tanggal_pengukuran);
        return `<tr><td>${formatDate(record.tanggal_pengukuran)}</td><td>${ageAtMeasurement}</td><td>${record.berat_badan ?? '-'}</td><td>${record.tinggi_badan ?? '-'}</td><td>${record.lila ?? '-'}</td><td>${record.lingkar_kepala ?? '-'}</td><td>${record.status_bb_u ?? '-'}</td><td>${record.status_tb_u ?? '-'}</td><td>${record.status_bb_tb ?? '-'}</td><td>${record.status_kenaikan_berat ?? '-'}</td><td>${record.imunisasi?.join(', ') || '-'}</td><td>${record.vitaminA || '-'}</td><td>${record.obatCacing ? 'Ya' : '-'}</td><td>${record.sudahPKAT ? 'Ya' : record.sudahPKAT === false ? 'Tidak' : '-'}</td><td>${record.gigi_caries ? 'Ya' : record.gigi_caries === false ? 'Tidak' : '-'}</td><td>${record.catatan_pelayanan || record.catatan_pengukuran || ''}</td></tr>`;
    }).join('');
    return `<html><head><title>Laporan Riwayat ${participant.nama}</title><style>body { font-family: sans-serif; margin: 2rem; } table { width: 100%; border-collapse: collapse; font-size: 0.8rem; } th, td { border: 1px solid #ccc; padding: 8px; }</style></head><body><h1>Laporan Riwayat ${participant.nama}</h1><table><thead><tr><th>Tanggal</th><th>Usia</th><th>Berat</th><th>Tinggi</th><th>LILA</th><th>LiKa</th><th>BB/U</th><th>TB/U</th><th>BB/TB</th><th>Naik/Turun</th><th>Imunisasi</th><th>Vit A</th><th>Obat Cacing</th><th>PKAT</th><th>Gigi</th><th>Catatan</th></tr></thead><tbody>${tableRows}</tbody></table></body></html>`;
};

export const getImmunizationStatus = (participant: Participant): { completed: { name: string, date: string }[], upcoming: { name: string, age: string }[] } => {
    // ... (keep existing logic)
    const schedule = [{ name: 'HB0', age: 0, label: 'Saat Lahir (<24 jam)' }, { name: 'BCG', age: 1, label: '1 Bulan' }, { name: 'OPV 1', age: 1, label: '1 Bulan' }, { name: 'DPT-HB-Hib 1', age: 2, label: '2 Bulan' }, { name: 'OPV 2', age: 2, label: '2 Bulan' }, { name: 'PCV 1', age: 2, label: '2 Bulan' }, { name: 'RV 1', age: 2, label: '2 Bulan' }, { name: 'DPT-HB-Hib 2', age: 3, label: '3 Bulan' }, { name: 'OPV 3', age: 3, label: '3 Bulan' }, { name: 'PCV 2', age: 3, label: '3 Bulan' }, { name: 'RV 2', age: 3, label: '3 Bulan' }, { name: 'DPT-HB-Hib 3', age: 4, label: '4 Bulan' }, { name: 'OPV 4', age: 4, label: '4 Bulan' }, { name: 'IPV 1', age: 4, label: '4 Bulan' }, { name: 'RV 3', age: 4, label: '4 Bulan' }, { name: 'MR 1', age: 9, label: '9 Bulan' }, { name: 'IPV 2', age: 9, label: '9 Bulan' }, { name: 'JE', age: 9, label: '9 Bulan' }, { name: 'PCV 3', age: 12, label: '12 Bulan' }, { name: 'DPT-HB-Hib 4', age: 18, label: '18 Bulan' }, { name: 'MR 2', age: 18, label: '18 Bulan' }];
    const completed: { name: string, date: string }[] = [];
    const givenImmunizations = new Set<string>();
    participant.riwayatPengukuran.forEach(record => { record.imunisasi?.forEach(imun => { if (!givenImmunizations.has(imun)) { completed.push({ name: imun, date: formatDate(record.tanggal_pengukuran) }); givenImmunizations.add(imun); } }); });
    const childAgeInMonths = Math.floor(calculateAgeInMonths(participant.tanggal_lahir));
    const upcoming = schedule.filter(item => { if (givenImmunizations.has(item.name)) { const countGiven = completed.filter(c => c.name === item.name).length; const countScheduled = schedule.filter(s => s.name === item.name && s.age <= item.age).length; if (countGiven >= countScheduled) return false; } return item.age >= childAgeInMonths; }).map(item => ({ name: item.name, age: item.label }));
    const upcomingUnique = Array.from(new Map(upcoming.map(item => [`${item.name}-${item.age}`, item])).values());
    return { completed, upcoming: upcomingUnique };
};

export const getDueImmunization = (participant: Participant): string | null => {
    // ... (keep existing logic)
    if (participant.kategori !== 'balita') return null;
    const schedule = [{ name: 'HB0', age: 0 }, { name: 'BCG', age: 1 }, { name: 'OPV 1', age: 1 }, { name: 'DPT-HB-Hib 1', age: 2 }, { name: 'OPV 2', age: 2 }, { name: 'PCV 1', age: 2 }, { name: 'RV 1', age: 2 }, { name: 'DPT-HB-Hib 2', age: 3 }, { name: 'OPV 3', age: 3 }, { name: 'PCV 2', age: 3 }, { name: 'RV 2', age: 3 }, { name: 'DPT-HB-Hib 3', age: 4 }, { name: 'OPV 4', age: 4 }, { name: 'IPV 1', age: 4 }, { name: 'RV 3', age: 4 }, { name: 'MR 1', age: 9 }, { name: 'IPV 2', age: 9 }, { name: 'JE', age: 9 }, { name: 'PCV 3', age: 12 }, { name: 'DPT-HB-Hib 4', age: 18 }, { name: 'MR 2', age: 18 }];
    const givenImmunizations = new Set<string>();
    participant.riwayatPengukuran.forEach(record => { record.imunisasi?.forEach(imun => givenImmunizations.add(imun)); });
    const childAgeInMonths = Math.floor(calculateAgeInMonths(participant.tanggal_lahir));
    for (const item of schedule) { if (!givenImmunizations.has(item.name) && childAgeInMonths >= item.age) return item.name; }
    return null;
};

// ==================================================================================
// MENTAL HEALTH SCREENING HELPERS (NEW)
// ==================================================================================

export const PHQ2_QUESTIONS = [
    "Selama 2 minggu terakhir, apakah Anda merasa kurang berminat atau bergairah dalam melakukan apapun?",
    "Selama 2 minggu terakhir, apakah Anda merasa murung, sedih, atau putus asa?"
];

export const GAD2_QUESTIONS = [
    "Selama 2 minggu terakhir, apakah Anda merasa gelisah, cemas, atau khawatir yang berlebihan?",
    "Selama 2 minggu terakhir, apakah Anda merasa tidak mampu menghentikan atau mengendalikan rasa cemas?"
];

export const EPDS_QUESTIONS = [
    "1. Saya mampu tertawa dan melihat sisi lucunya dari suatu hal.", // Reverse Scored (0,1,2,3) -> Normal (0) is "As much as I always could"
    "2. Saya menantikan hal-hal yang menyenangkan dengan perasaan gembira.", // Reverse Scored
    "3. Saya menyalahkan diri sendiri secara berlebihan ketika ada yang salah.", // Normal
    "4. Saya merasa cemas atau khawatir tanpa alasan yang jelas.", // Normal
    "5. Saya merasa takut atau panik tanpa alasan yang jelas.", // Normal
    "6. Saya merasa kewalahan (semua hal terasa terlalu berat).", // Normal
    "7. Saya merasa sangat tidak bahagia sehingga saya sulit tidur.", // Normal
    "8. Saya merasa sedih atau menderita.", // Normal
    "9. Saya merasa sangat tidak bahagia sehingga saya menangis.", // Normal
    "10. Pikiran untuk menyakiti diri sendiri pernah muncul dalam benak saya." // Normal
];

// --- Scoring Logic ---

export const calculatePHQ2Score = (q1: number, q2: number): SkriningPHQ2 => {
    const score = q1 + q2;
    // Interpretation: Score >= 3 suggests major depressive disorder is likely.
    const interpretation = score >= 3 
        ? "Positif: Kemungkinan Depresi. Perlu pemeriksaan lanjutan (PHQ-9)." 
        : "Negatif: Kemungkinan kecil mengalami gangguan depresi.";
    
    return { q1, q2, score, interpretation };
};

export const calculateGAD2Score = (q1: number, q2: number): SkriningGAD2 => {
    const score = q1 + q2;
    // Interpretation: Score >= 3 suggests generalized anxiety disorder is likely.
    const interpretation = score >= 3 
        ? "Positif: Kemungkinan Gangguan Cemas. Perlu pemeriksaan lanjutan (GAD-7)." 
        : "Negatif: Kemungkinan kecil mengalami gangguan cemas.";
    
    return { q1, q2, score, interpretation };
};

export const calculateEPDSScore = (answers: number[]): SkriningEPDS => {
    // Standard EPDS Scoring usually 0,1,2,3.
    // Typically Q1, Q2, Q4 are reverse scored in terms of "Positive Feelings" = 0 score.
    // But here we assume the input `answers` array ALREADY contains the correct 0-3 value based on the selected radio button.
    // The UI should map the text options to 0, 1, 2, 3 correctly.
    
    // Assuming the UI passes 0 for "best" and 3 for "worst" for ALL questions for simplicity in this calculation helper.
    // Note: If the UI provides raw indices, we'd need mapping logic here.
    // Let's assume the UI sends the calculated score for each question (0 to 3).
    
    const score = answers.reduce((a, b) => a + b, 0);
    
    let interpretation = "Normal: Risiko depresi rendah.";
    if (score >= 13) {
        interpretation = "Positif: Kemungkinan Depresi Postpartum Berat. Segera rujuk.";
    } else if (score >= 10) {
        interpretation = "Borderline: Risiko Depresi. Perlu pemantauan.";
    }
    
    // Specific check for self-harm (Question 10)
    if (answers[9] > 0) {
        interpretation += " PERHATIAN: Ada risiko menyakiti diri sendiri.";
    }

    return { answers, score, interpretation };
};
