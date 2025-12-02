import type { ReportColumnDefinition, ReportIndicatorDefinition, Participant } from '../types';
import { getCategoryLabel, formatDate, calculateAge } from './helpers';

const toYesNo = (val: boolean | undefined | null) => (val === true ? 'Ya' : val === false ? 'Tidak' : '');
const toArray = (val: string[] | undefined | null) => (val || []).join('; ');

export const AVAILABLE_COLUMNS: ReportColumnDefinition[] = [
    // Identitas
    { id: 'nama', label: 'Nama', group: 'Identitas' },
    { id: 'nik', label: 'NIK', group: 'Identitas' },
    { id: 'kategori', label: 'Kategori', group: 'Identitas' },
    { id: 'tanggal_lahir', label: 'Tgl Lahir', group: 'Identitas' },
    { id: 'jenis_kelamin', label: 'Jenis Kelamin', group: 'Identitas' },
    { id: 'alamat', label: 'Alamat (Desa)', group: 'Identitas' },
    { id: 'rt', label: 'RT', group: 'Identitas' },
    { id: 'rw', label: 'RW', group: 'Identitas' },
    { id: 'nama_posyandu', label: 'Posyandu', group: 'Identitas' },
    { id: 'no_telepon', label: 'No HP', group: 'Identitas' },
    { id: 'nama_ibu', label: 'Nama Ibu', group: 'Identitas' },
    { id: 'status_pernikahan', label: 'Status Pernikahan', group: 'Identitas' },
    { id: 'status_hamil', label: 'Status Hamil', group: 'Identitas' },

    // Pengukuran
    { id: 'tanggal_pengukuran', label: 'Tgl Ukur/Layanan', group: 'Pengukuran' },
    { id: 'berat_badan', label: 'BB (kg)', group: 'Pengukuran' },
    { id: 'tinggi_badan', label: 'TB (cm)', group: 'Pengukuran' },
    { id: 'lila', label: 'LILA (cm)', group: 'Pengukuran' },
    { id: 'lingkar_kepala', label: 'LiKa (cm)', group: 'Pengukuran' },
    { id: 'lingkar_perut', label: 'Lingkar Perut (cm)', group: 'Pengukuran' },
    { id: 'status_bb_u', label: 'Status BB/U', group: 'Pengukuran' },
    { id: 'status_tb_u', label: 'Status TB/U', group: 'Pengukuran' },
    { id: 'status_bb_tb', label: 'Status BB/TB', group: 'Pengukuran' },
    { id: 'status_kenaikan_berat', label: 'Status Kenaikan BB', group: 'Pengukuran' },
    { id: 'status_bmi', label: 'IMT', group: 'Pengukuran' },
    { id: 'status_kategori_bmi', label: 'Kategori IMT', group: 'Pengukuran' },
    { id: 'status_lila', label: 'Status LILA', group: 'Pengukuran' },

    // Pelayanan
    { id: 'imunisasi', label: 'Imunisasi', group: 'Pelayanan' },
    { id: 'vitaminA', label: 'Vitamin A', group: 'Pelayanan' },
    { id: 'obatCacing', label: 'Obat Cacing', group: 'Pelayanan' },
    { id: 'asiEksklusif', label: 'ASI Eksklusif', group: 'Pelayanan' },
    { id: 'sudahPKAT', label: 'PKAT', group: 'Pelayanan' },
    { id: 'gigi_caries', label: 'Gigi Karies', group: 'Pelayanan' },
    { id: 'tensi', label: 'Tensi', group: 'Pelayanan' },
    { id: 'kesimpulan_tensi', label: 'Kesimpulan Tensi', group: 'Pelayanan' },
    { id: 'pemeriksaanHB', label: 'HB (g/dL)', group: 'Pelayanan' },
    { id: 'kesimpulan_hb', label: 'Kesimpulan HB', group: 'Pelayanan' },
    { id: 'gds', label: 'GDS (mg/dL)', group: 'Pelayanan' },
    { id: 'kesimpulan_gds', label: 'Kesimpulan GDS', group: 'Pelayanan' },
    { id: 'kolesterol', label: 'Kolesterol', group: 'Pelayanan' },
    { id: 'kesimpulan_kolesterol', label: 'Kesimpulan Kolesterol', group: 'Pelayanan' },
    { id: 'asamUrat', label: 'Asam Urat', group: 'Pelayanan' },
    { id: 'kesimpulan_asam_urat', label: 'Kesimpulan Asam Urat', group: 'Pelayanan' },
    { id: 'kb', label: 'Status KB', group: 'Pelayanan' },
    { id: 'tingkatKemandirian', label: 'Tingkat Kemandirian', group: 'Pelayanan' },
    { id: 'tfu', label: 'TFU (cm)', group: 'Pelayanan' },
    { id: 'djj', label: 'DJJ (bpm)', group: 'Pelayanan' },
    { id: 'presentasi', label: 'Presentasi Janin', group: 'Pelayanan' },
    
    // Skrining
    { id: 'skriningMerokok_merokok', label: 'Skrining: Merokok', group: 'Pelayanan' },
    { id: 'skriningMerokok_terpapar', label: 'Skrining: Terpapar Asap', group: 'Pelayanan' },
    { id: 'skriningTBC_batuk', label: 'Skrining TBC: Batuk', group: 'Pelayanan' },
    { id: 'skriningTBC_demam', label: 'Skrining TBC: Demam', group: 'Pelayanan' },
    { id: 'skriningTBC_beratBadan', label: 'Skrining TBC: BB Turun', group: 'Pelayanan' },
    { id: 'skriningTBC_kontak', label: 'Skrining TBC: Kontak', group: 'Pelayanan' },
    { id: 'skriningIndera_kanan', label: 'Skrining Indera: Kanan', group: 'Pelayanan' },
    { id: 'skriningIndera_kiri', label: 'Skrining Indera: Kiri', group: 'Pelayanan' },
    { id: 'skriningIndera_dengar', label: 'Skrining Indera: Dengar', group: 'Pelayanan' },
    { id: 'skriningJiwa', label: 'Skrining Jiwa', group: 'Pelayanan' },

    // Survei
    { id: 'phbsClassification', label: 'Strata PHBS', group: 'Survei' },
    { id: 'phbsScore', label: 'Skor PHBS', group: 'Survei' },
    { id: 'survei_namaKepalaKeluarga', label: 'Survei: Nama KK', group: 'Survei' },
    { id: 'survei_nomorKartuKeluarga', label: 'Survei: No KK', group: 'Survei' },
    { id: 'survei_sumberAirUtama', label: 'Survei: Sumber Air Utama', group: 'Survei' },
    { id: 'survei_sumberAirMinumUtama', label: 'Survei: Sumber Air Minum', group: 'Survei' },
    { id: 'survei_tersediaJambanKeluarga', label: 'Survei: Ada Jamban', group: 'Survei' },
    { id: 'survei_bangunanBawahJamban', label: 'Survei: Bangunan Bawah Jamban', group: 'Survei' },
    { id: 'survei_tempatSampahTertutup', label: 'Survei: Tempat Sampah Tertutup', group: 'Survei' },
    { id: 'survei_merokokDalamRumah', label: 'Survei: Merokok Dalam Rumah', group: 'Survei' },
    { id: 'survei_jentikNyamuk', label: 'Survei: Ada Jentik', group: 'Survei' },
    { id: 'survei_punyaJKN', label: 'Survei: Punya JKN', group: 'Survei' },
];

export const AVAILABLE_INDICATORS: ReportIndicatorDefinition[] = [
    { id: 'jumlah_peserta', label: 'Total Peserta (N)', group: 'Umum' },
    { id: 'jumlah_hadir', label: 'Jumlah Hadir (D)', group: 'Umum' },
    { id: 'stunting', label: 'Stunting (Pendek/Sangat Pendek)', group: 'Gizi Balita' },
    { id: 'wasted', label: 'Gizi Kurang/Buruk (Wasted)', group: 'Gizi Balita' },
    { id: 'underweight', label: 'BB Kurang/Sangat Kurang', group: 'Gizi Balita' },
    { id: 'overweight', label: 'Gizi Lebih/Obesitas', group: 'Gizi Balita' },
    { id: 'naik_bb', label: 'Berat Badan Naik (N)', group: 'Pertumbuhan Balita' },
    { id: 'tidak_naik_bb', label: 'Berat Badan Tidak Naik (T)', group: 'Pertumbuhan Balita' },
    { id: '2t', label: 'Tidak Naik 2x Berturut (2T)', group: 'Pertumbuhan Balita' }, // New Indicator
    { id: 'baru_ditimbang', label: 'Baru Ditimbang (B)', group: 'Pertumbuhan Balita' },
    { id: 'bumil_kek', label: 'Ibu Hamil KEK', group: 'Kesehatan Ibu' },
    { id: 'bumil_anemia', label: 'Ibu Hamil Anemia', group: 'Kesehatan Ibu' },
    { id: 'bumil_risti', label: 'Ibu Hamil Risiko Tinggi (Usia/Lainnya)', group: 'Kesehatan Ibu' },
    { id: 'hipertensi', label: 'Hipertensi', group: 'Penyakit Tidak Menular' },
    { id: 'diabetes', label: 'Diabetes Melitus', group: 'Penyakit Tidak Menular' },
    { id: 'obesitas_dewasa', label: 'Obesitas (Dewasa)', group: 'Penyakit Tidak Menular' },
    { id: 'merokok', label: 'Perokok Aktif', group: 'Faktor Risiko' },
    { id: 'phbs_kurang', label: 'PHBS Pratama/Madya', group: 'PHBS' },
];

// Define age groups for Gizi Report
export const AGE_GROUPS = [
    { label: '0-6 bln', min: 0, max: 6 },
    { label: '7-11 bln', min: 7, max: 11 },
    { label: '12-23 bln', min: 12, max: 23 },
    { label: '24-59 bln', min: 24, max: 59 },
];

export const getColumnValue = (p: any, columnId: string): string => {
    // Handling nested properties manually or flattened in Participant object
    
    // Direct Access for common fields
    if (p.hasOwnProperty(columnId) && typeof p[columnId] !== 'object') {
        const val = p[columnId];
        if (columnId === 'kategori') return getCategoryLabel(val);
        if (columnId.includes('tanggal')) return formatDate(val);
        if (typeof val === 'boolean') return toYesNo(val);
        if (columnId === 'nik') return `'${val}`; // Force string for excel
        return val ?? '';
    }

    // Special handlers for nested or specific logic
    if (columnId === 'imunisasi') return toArray(p.imunisasi);
    if (columnId === 'status_hamil') return toYesNo(p.status_hamil);
    if (columnId === 'obatCacing') return toYesNo(p.obatCacing);
    if (columnId === 'asiEksklusif') return toYesNo(p.asiEksklusif);
    if (columnId === 'sudahPKAT') return toYesNo(p.sudahPKAT);
    if (columnId === 'gigi_caries') return toYesNo(p.gigi_caries);
    if (columnId === 'skriningJiwa') return toYesNo(p.skriningJiwa);

    // Skrining flattened access
    if (columnId === 'skriningMerokok_merokok') return toYesNo(p.skriningMerokok?.merokok);
    if (columnId === 'skriningMerokok_terpapar') return toYesNo(p.skriningMerokok?.terpapar);
    if (columnId === 'skriningTBC_batuk') return toYesNo(p.skriningTBC?.batuk);
    if (columnId === 'skriningTBC_demam') return toYesNo(p.skriningTBC?.demam);
    if (columnId === 'skriningTBC_beratBadan') return toYesNo(p.skriningTBC?.beratBadan);
    if (columnId === 'skriningTBC_kontak') return toYesNo(p.skriningTBC?.kontak);
    if (columnId === 'skriningIndera_kanan') return p.skriningIndera?.penglihatanKanan || '';
    if (columnId === 'skriningIndera_kiri') return p.skriningIndera?.penglihatanKiri || '';
    if (columnId === 'skriningIndera_dengar') return p.skriningIndera?.pendengaran || '';

    // Survei access (usually inside p.surveiKeluarga)
    if (columnId.startsWith('survei_')) {
        const key = columnId.replace('survei_', '');
        const s = p.surveiKeluarga || {};
        const val = s[key];
        if (typeof val === 'boolean') return toYesNo(val);
        if (Array.isArray(val)) return toArray(val);
        return val ?? '';
    }

    return '';
};

export const checkIndicator = (p: any, indicatorId: string): boolean => {
    // Note: 'p' here is usually a 'hybrid' participant object constructed in report view
    // containing the relevant measurement data for the selected period.

    switch (indicatorId) {
        case 'jumlah_peserta':
            return true;
        case 'jumlah_hadir':
            // Logic: Had measurement or service data
            return !!p.tanggal_pengukuran || !!p.tanggal_pelayanan;
        case 'stunting':
            return p.kategori === 'balita' && (p.status_tb_u?.includes('pendek') || p.status_tb_u?.includes('stunted'));
        case 'wasted':
            return p.kategori === 'balita' && (p.status_bb_tb?.includes('Gizi kurang') || p.status_bb_tb?.includes('Gizi buruk'));
        case 'underweight':
            return p.kategori === 'balita' && (p.status_bb_u?.includes('sangat kurang') || p.status_bb_u === 'Berat badan kurang');
        case 'overweight':
            return p.kategori === 'balita' && (p.status_bb_tb?.includes('lebih') || p.status_bb_tb?.includes('Obesitas') || p.status_bb_u?.includes('lebih'));
        case 'naik_bb':
            return p.kategori === 'balita' && p.status_kenaikan_berat === 'Naik';
        case 'tidak_naik_bb':
            return p.kategori === 'balita' && p.status_kenaikan_berat === 'Tidak Naik';
        case '2t':
            // Logic for 2T: Not rising in the current month AND previous month
            if (p.kategori !== 'balita' || p.status_kenaikan_berat !== 'Tidak Naik') return false;
            
            // Check previous measurement history
            if (!p.riwayatPengukuran || p.riwayatPengukuran.length < 2) return false;
            
            // Sort history descending by date
            const sortedHistory = [...p.riwayatPengukuran].sort((a: any, b: any) => new Date(b.tanggal_pengukuran).getTime() - new Date(a.tanggal_pengukuran).getTime());
            
            // The current measurement is likely index 0 (or the one being reported on).
            // We need to find the one BEFORE it.
            // Assuming 'p' holds the 'current' measurement state in its top-level properties or index 0.
            
            // If this report is generating data for a specific month, `p` has that month's data.
            // We need to find the immediately preceding measurement.
            if (sortedHistory.length >= 2) {
                // Index 0 is current (Triggered "Tidak Naik")
                // Index 1 is previous
                const prev = sortedHistory[1];
                return prev.status_kenaikan_berat === 'Tidak Naik';
            }
            return false;
        case 'baru_ditimbang':
            return p.kategori === 'balita' && p.status_kenaikan_berat === 'Baru Ditimbang';
        case 'bumil_kek':
            return p.kategori === 'ibu-hamil' && p.status_lila?.includes('KEK');
        case 'bumil_anemia':
            return p.kategori === 'ibu-hamil' && p.kesimpulan_hb === 'Anemia';
        case 'bumil_risti':
            if (p.kategori !== 'ibu-hamil') return false;
            const age = calculateAge(p.tanggal_lahir);
            return age < 20 || age > 35 || (p.tensi && p.kesimpulan_tensi?.includes('Hipertensi'));
        case 'hipertensi':
            return p.kesimpulan_tensi?.includes('Hipertensi') || false;
        case 'diabetes':
            return p.kesimpulan_gds?.includes('Diabetes') || false;
        case 'obesitas_dewasa':
            return (p.kategori === 'dewasa' || p.kategori === 'lansia') && p.status_kategori_bmi === 'Obesitas';
        case 'merokok':
            return p.skriningMerokok?.merokok === true;
        case 'phbs_kurang':
            return p.phbsClassification === 'PHBS Pratama' || p.phbsClassification === 'PHBS Madya';
        default:
            return false;
    }
};