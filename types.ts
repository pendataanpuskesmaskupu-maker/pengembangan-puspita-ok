
export type View = 'home' | '1' | '2' | '3' | '4' | '5' | 'laporan';

export type Category = 'ibu-hamil' | 'balita' | 'anak-remaja' | 'dewasa' | 'lansia';

export type Desa = 'Kupu' | 'Ketanggungan' | 'Lawatan' | 'Pengarasan' | 'Sidakaton' | 'Sidapurna' | 'Dukuhturi';

export type PhbsClassification = 'PHBS Pratama' | 'PHBS Madya' | 'PHBS Utama' | 'PHBS Paripurna';

export type ReportType = string;

export interface SkriningMerokok {
    merokok: boolean;
    terpapar: boolean;
}

export interface SkriningTBC {
    batuk: boolean;
    demam: boolean;
    beratBadan: boolean;
    kontak: boolean;
}

export interface SkriningIndera {
    penglihatanKanan: 'Normal' | 'Gangguan' | '';
    penglihatanKiri: 'Normal' | 'Gangguan' | '';
    pendengaran: 'Normal' | 'Gangguan' | '';
}

// New Interfaces for Mental Health
export interface SkriningPHQ2 {
    q1: number; // 0-3
    q2: number; // 0-3
    score: number;
    interpretation: string;
}

export interface SkriningGAD2 {
    q1: number; // 0-3
    q2: number; // 0-3
    score: number;
    interpretation: string;
}

export interface SkriningEPDS {
    answers: number[]; // Array of 10 answers (0-3)
    score: number;
    interpretation: string;
}

export interface MeasurementRecord {
    tanggal_pengukuran: string;
    berat_badan?: number;
    tinggi_badan?: number;
    lingkar_kepala?: number;
    lila?: number;
    lingkar_perut?: number;
    tensi?: string;
    catatan_pengukuran?: string;
    status_bb_u?: string;
    status_tb_u?: string;
    status_bb_tb?: string;
    status_bmi?: string;
    status_kategori_bmi?: string;
    status_lila?: string;
    status_kenaikan_berat?: 'Naik' | 'Tidak Naik' | 'Baru Ditimbang' | 'O';
    pemeriksaanHB?: number;
    kesimpulan_hb?: string;
    // Data Pelayanan yang Disimpan Historis
    imunisasi?: string[];
    vitaminA?: 'Biru' | 'Merah';
    obatCacing?: boolean;
    sudahPKAT?: boolean;
    catatan_pelayanan?: string;
    gigi_caries?: boolean; 
    tfu?: number;
    djj?: number;
    presentasi?: 'Kepala' | 'Sungsang' | 'Lintang';
    
    // Historical Mental Health Data
    skriningPHQ2?: SkriningPHQ2;
    skriningGAD2?: SkriningGAD2;
    skriningEPDS?: SkriningEPDS;
}

export interface HomeVisitRecord {
    tanggal_kunjungan: string;
    catatan: string;
}

export interface SurveiKeluarga {
    // Sesi 1
    namaKepalaKeluarga?: string;
    nomorKartuKeluarga?: string;
    jumlahKKMenetap?: number;
    jumlahAnggotaKeluargaMenetap?: number;
    // Sesi 2
    sumberAirUtama?: 'PAMSIMAS' | 'Sumur bor dengan pompa listrik' | 'Sumur bor dengan pompa tangan' | 'Sumur gali terlindungi' | 'Sumur gali tak terlindungi';
    sumberAirMinumUtama?: 'PAMSIMAS' | 'Sumur bor dengan pompa listrik' | 'Sumur bor dengan pompa tangan' | 'Sumur gali terlindungi' | 'Sumur gali tak terlindungi' | 'Air eceran yang dibeli (menunggu pedangan datang)' | 'Air eceran yang dibeli (mendatangi penjual)' | 'Air kemasan' | 'Air isi ulang';
    caraKonsumsiAir?: string[];
    simpanAirMinumTertutup?: boolean;
    panganTertutup?: boolean;
    panganDekatBahanBerbahaya?: boolean;
    praktikPenangananPangan?: string[];
    tersediaJambanKeluarga?: boolean;
    babDiJamban?: boolean;
    bangunanBawahJamban?: 'Tangki septik disedot < 5 thn / SPALD' | 'Tangki septik tidak pernah disedot / > 5 thn' | 'Cubluk / Lubang Tanah' | 'Dibuang langsung ke lingkungan';
    sampahBerserakan?: boolean;
    tempatSampahTertutup?: boolean;
    buangSampahPadaTempatnya?: boolean;
    sampahDibakarDibuangSembarangan?: boolean;
    pemilahanSampah?: boolean;
    genanganAirLimbah?: boolean;
    saluranLimbahTertutup?: boolean;
    terhubungSumurResapan?: boolean;
    ventilasiCukup?: boolean;
    cahayaMatahariMasuk?: boolean;
    pencemaranAsapDapur?: boolean;
    merokokDalamRumah?: boolean;
    saranaCTPS?: boolean;
    cuciTanganPakaiSabun?: boolean;
    waktuKritisCTPS?: string[];
    jentikNyamuk?: boolean;
    // Sesi 3
    adaGangguanJiwaBerat?: boolean;
    namaPenderitaGangguanJiwa?: string;
    minumObatJiwa?: boolean;
    minumObatGangguanJiwa?: boolean;
    adaKeluargaDipasung?: boolean;
    konsumsiGiziSeimbang?: boolean;
    aktivitasFisik?: boolean;
    punyaJKN?: boolean;
    cekKesehatanBerkala?: boolean;
    gosokGigi?: boolean;
    garamBeryodium?: boolean;
    adaRiwayatTBC?: boolean;
    namaPenderitaTBC?: string;
    minumObatTBC?: boolean;
    adaGejalaTBC?: boolean;
    adaRiwayatHipertensi?: boolean;
    namaPenderitaHipertensi?: string;
    minumObatHipertensi?: boolean;
    adaRiwayatDM?: boolean;
    namaPenderitaDM?: string;
    minumObatDM?: boolean;
    sedangHamil?: boolean;
    pemeriksaanKehamilan6Kali?: boolean;
    ikutProgramKB?: 'Ya' | 'Tidak' | 'Gangguan reproduksi' | 'Masih menginginkan anak dan jumlah kurang dari <=2' | 'Sudah menopause';
    adaBayi_0_11_bln?: boolean;
    bersalinDiFaskes?: boolean;
    adaBalita_7_23_bln?: boolean;
    asiEksklusif?: boolean;
    imunisasiLengkapBayi?: boolean;
    pemantauanPertumbuhan_7_23_bln?: boolean;
    alasanTidakTimbang_7_23_bln?: string;
    adaBalita_2_5_thn?: boolean;
    pemantauanPertumbuhan_2_5_thn?: boolean;
    alasanTidakTimbang_2_5_thn?: string;
    adaRemajaPutri_10_18_thn?: boolean;
    remajaPutriMinumTTD?: boolean;
}


export interface Participant {
    __backendId: string;
    createdAt: string;
    nama: string;
    nik: string;
    tanggal_lahir: string;
    jenis_kelamin: 'Laki-laki' | 'Perempuan';
    alamat: Desa;
    rt: string;
    rw: string;
    kategori: Category;
    nama_posyandu?: string;
    no_telepon?: string;
    anak_ke?: string;
    berat_lahir?: number;
    panjang_lahir?: number;
    nama_ibu?: string;
    nik_ibu?: string;
    status_pernikahan?: 'Belum Menikah' | 'Menikah' | 'Cerai Hidup' | 'Cerai Mati';
    status_hamil?: boolean;
    riwayat_penyakit_ortu?: string[];
    riwayat_penyakit_individu?: string[];
    riwayatPengukuran: MeasurementRecord[];
    riwayatKunjunganRumah: HomeVisitRecord[];
    surveiKeluarga?: SurveiKeluarga;

    // Latest measurement/service data flattened for easy access
    tanggal_pengukuran?: string;
    berat_badan?: number;
    tinggi_badan?: number;
    lingkar_kepala?: number;
    lila?: number;
    lingkar_perut?: number;
    tensi?: string;
    catatan_pengukuran?: string;
    status_bb_u?: string;
    status_tb_u?: string;
    status_bb_tb?: string;
    status_bmi?: string;
    status_kategori_bmi?: string;
    status_lila?: string;
    status_kenaikan_berat?: 'Naik' | 'Tidak Naik' | 'Baru Ditimbang' | 'O';
    pemeriksaanHB?: number;
    kesimpulan_hb?: string;
    gds?: number;
    kesimpulan_gds?: string;
    kolesterol?: number;
    kesimpulan_kolesterol?: string;
    asamUrat?: number;
    kesimpulan_asam_urat?: string;
    kesimpulan_tensi?: string;

    // Latest service data
    tanggal_pelayanan?: string;
    imunisasi?: string[];
    vitaminA?: 'Biru' | 'Merah';
    obatCacing?: boolean;
    asiEksklusif?: boolean;
    sudahPKAT?: boolean;
    catatan_pelayanan?: string;
    gigi_caries?: boolean;
    kb?: string;
    skriningMerokok?: SkriningMerokok;
    skriningTBC?: SkriningTBC;
    skriningIndera?: SkriningIndera;
    
    // Updated Mental Health fields
    skriningJiwa?: boolean; // General flag
    skriningPHQ2?: SkriningPHQ2;
    skriningGAD2?: SkriningGAD2;
    skriningEPDS?: SkriningEPDS;

    tingkatKemandirian?: 'A' | 'B' | 'C';
    tfu?: number;
    djj?: number;
    presentasi?: 'Kepala' | 'Sungsang' | 'Lintang';

    // Survey data
    phbsScore?: number;
    phbsClassification?: PhbsClassification;
    
    // Growth check history
    riwayatPerkembangan?: Record<string, boolean>;
}

export interface QueueItem extends Participant {
    queueNumber: number;
    status: 'waiting' | 'served';
    queuedAt: string;
    completedAt?: string;
}

export interface HealthNotification {
    id: string;
    participantId: string;
    participantName: string;
    type: 'stunting' | 'underweight' | 'overweight' | 'anemia' | 'hypertension' | 'diabetes' | 'kek';
    message: string;
    createdAt: string;
}

// -- Report Template Types --
export interface ReportColumnDefinition {
    id: string;
    label: string;
    group: 'Identitas' | 'Pengukuran' | 'Pelayanan' | 'Survei' | 'Lainnya';
}

export interface ReportIndicatorDefinition {
    id: string;
    label: string;
    group: string;
}

export interface ReportTemplate {
    id: string;
    name: string;
    defaultCategory: Category | 'semua' | 'ptm';
    format: 'detail' | 'summary';
    selectedColumns: string[]; // IDs of ReportColumnDefinition OR ReportIndicatorDefinition
}
