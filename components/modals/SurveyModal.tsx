import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { Participant, SurveiKeluarga } from '../../types';
import { getCategoryTheme, formatDetailedAge } from '../../utils/helpers';

interface SurveyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (participantId: string, surveyData: SurveiKeluarga) => void;
    participant: Participant | null;
}

const inputStyle = "mt-1 w-full border border-gray-300 p-2 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 shadow-sm";

// --- Options ---
const sumberAirUtamaOptions: SurveiKeluarga['sumberAirUtama'][] = [
    'PAMSIMAS', 'Sumur bor dengan pompa listrik', 'Sumur bor dengan pompa tangan', 'Sumur gali terlindungi', 'Sumur gali tak terlindungi'
];
const sumberAirMinumUtamaOptions: SurveiKeluarga['sumberAirMinumUtama'][] = [
    'PAMSIMAS', 'Sumur bor dengan pompa listrik', 'Sumur bor dengan pompa tangan', 'Sumur gali terlindungi', 'Sumur gali tak terlindungi',
    'Air eceran yang dibeli (menunggu pedangan datang)',
    'Air eceran yang dibeli (mendatangi penjual)',
    'Air kemasan',
    'Air isi ulang'
];
const caraKonsumsiAirOptions = [
    'Melalui proses pengolahan (misal : merebus, klorin cair/klorin padat, UV, sodis, Filtrasi, keramik filter, RO)',
    'Jika air baku keruh, melakukan pengolahan seperti : pengendapan atau penyaringan'
];
const praktikPanganOptions = [
    'Menjaga pangan pada suhu aman',
    'Memasak dengan benar',
    'Memisahkan pangan matang dari pangan mentah',
    'Menjaga kebersihan',
    'Menggunakan air dan bahan baku yang aman'
];
const bangunanBawahJambanOptions: SurveiKeluarga['bangunanBawahJamban'][] = [
    'Tangki septik disedot < 5 thn / SPALD',
    'Tangki septik tidak pernah disedot / > 5 thn',
    'Cubluk / Lubang Tanah',
    'Dibuang langsung ke lingkungan'
];
const waktuKritisCTPSOptions = [
    'Sebelum makan',
    'Sebelum mengolah dan menghidangkan makanan',
    'Sebelum menyusui anak, memberi makan bayi / balita',
    'Setelah buang air besar / buang air kecil'
];
const kbOptions: NonNullable<SurveiKeluarga['ikutProgramKB']>[] = [
    'Ya',
    'Tidak',
    'Gangguan reproduksi',
    'Masih menginginkan anak dan jumlah kurang dari <=2',
    'Sudah menopause'
];

// --- Helper Components ---
const RadioGroup: React.FC<{ options: (string | undefined)[], selected: string | undefined, name: keyof SurveiKeluarga, onChange: (name: keyof SurveiKeluarga, value: string) => void, required?: boolean }> = ({ options, selected, name, onChange, required }) => (
    <div className="space-y-2 mt-2">
        {options.map((option, index) => option && (
            <label key={option} className="flex items-center gap-3 p-2 bg-white rounded-md border border-gray-200 hover:bg-gray-100 cursor-pointer">
                <input type="radio" name={name} value={option} checked={selected === option} onChange={() => onChange(name, option)} required={required} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-900">{option}</span>
            </label>
        ))}
    </div>
);

const CheckboxGroup: React.FC<{ options: string[], selected: string[] | undefined, name: keyof SurveiKeluarga, onChange: (name: keyof SurveiKeluarga, value: string) => void }> = ({ options, selected = [], name, onChange }) => (
    <div className="space-y-2 mt-2">
        {options.map(option => (
            <label key={option} className="flex items-center gap-3 p-2 bg-white rounded-md border border-gray-200 hover:bg-gray-100 cursor-pointer">
                <input type="checkbox" value={option} checked={selected.includes(option)} onChange={() => onChange(name, option)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-900">{option}</span>
            </label>
        ))}
    </div>
);

const YesNoRadioGroup: React.FC<{ value: boolean | undefined, name: keyof SurveiKeluarga, onChange: (name: keyof SurveiKeluarga, value: boolean) => void, required?: boolean }> = ({ value, name, onChange, required }) => (
    <div className="flex gap-4 mt-2">
        <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name={name} checked={value === true} onChange={() => onChange(name, true)} required={required} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-900">Ya</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name={name} checked={value === false} onChange={() => onChange(name, false)} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-900">Tidak</span>
        </label>
    </div>
);

const Question: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-900">
            {text} <span className="text-red-500">*</span>
        </label>
        {children}
    </div>
);

export const SurveyModal: React.FC<SurveyModalProps> = ({ isOpen, onClose, onSave, participant }) => {
    const [surveyData, setSurveyData] = useState<SurveiKeluarga>({});

    useEffect(() => {
        if (isOpen && participant) {
            setSurveyData({
                caraKonsumsiAir: [],
                praktikPenangananPangan: [],
                waktuKritisCTPS: [],
                ...participant.surveiKeluarga
            });
        } else {
            setSurveyData({});
        }
    }, [participant, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setSurveyData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value ? Number(value) : undefined) : value,
        }));
    };
    
    const handleRadioChange = (name: keyof SurveiKeluarga, value: string) => {
        setSurveyData(prev => ({ ...prev, [name]: value as any }));
    };

    const handleCheckboxChange = (name: keyof SurveiKeluarga, value: string) => {
        setSurveyData(prev => {
            const currentValues = (prev[name] as string[] || []);
            const newValues = currentValues.includes(value) ? currentValues.filter(v => v !== value) : [...currentValues, value];
            return { ...prev, [name]: newValues };
        });
    };

    const handleYesNoChange = (name: keyof SurveiKeluarga, value: boolean) => {
        setSurveyData(prev => {
            const newData = { ...prev, [name]: value };

            // Reset logic when parent question changes
            if (name === 'adaGangguanJiwaBerat') {
                delete newData.namaPenderitaGangguanJiwa;
                delete newData.minumObatGangguanJiwa;
                delete newData.adaKeluargaDipasung;
            }
            if (name === 'adaRiwayatTBC') {
                delete newData.namaPenderitaTBC;
                delete newData.minumObatTBC;
                delete newData.adaGejalaTBC;
            }
            if (name === 'adaRiwayatHipertensi') {
                delete newData.namaPenderitaHipertensi;
                delete newData.minumObatHipertensi;
            }
            if (name === 'adaRiwayatDM') {
                delete newData.namaPenderitaDM;
                delete newData.minumObatDM;
            }
             if (name === 'sedangHamil') {
                delete newData.pemeriksaanKehamilan6Kali;
                delete newData.ikutProgramKB;
            }
            if (name === 'adaBayi_0_11_bln') {
                delete newData.bersalinDiFaskes;
            }
            if (name === 'adaBalita_7_23_bln') {
                delete newData.asiEksklusif;
                delete newData.imunisasiLengkapBayi;
                delete newData.pemantauanPertumbuhan_7_23_bln;
                delete newData.alasanTidakTimbang_7_23_bln;
            }
            if (name === 'pemantauanPertumbuhan_7_23_bln' && value === true) {
                delete newData.alasanTidakTimbang_7_23_bln;
            }
            if (name === 'adaBalita_2_5_thn') {
                delete newData.pemantauanPertumbuhan_2_5_thn;
                delete newData.alasanTidakTimbang_2_5_thn;
            }
            if (name === 'pemantauanPertumbuhan_2_5_thn' && value === true) {
                delete newData.alasanTidakTimbang_2_5_thn;
            }
            if (name === 'adaRemajaPutri_10_18_thn') {
                delete newData.remajaPutriMinumTTD;
            }
            return newData;
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!participant) return;

        const form = e.currentTarget;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Manual check for checkbox groups
        if (!surveyData.caraKonsumsiAir || surveyData.caraKonsumsiAir.length === 0) {
            alert('Mohon pilih setidaknya satu opsi untuk pertanyaan: "Bagaimana mengonsumsi air?"');
            return;
        }
        if (!surveyData.praktikPenangananPangan || surveyData.praktikPenangananPangan.length === 0) {
            alert('Mohon pilih setidaknya satu opsi untuk pertanyaan: "Praktik Penanganan Pangan..."');
            return;
        }
        if (!surveyData.waktuKritisCTPS || surveyData.waktuKritisCTPS.length === 0) {
            alert('Mohon pilih setidaknya satu opsi untuk pertanyaan: "Waktu-waktu kritis cuci tangan..."');
            return;
        }

        onSave(participant.__backendId, surveyData);
        onClose();
    };

    if (!participant) return null;
    const theme = getCategoryTheme(participant.kategori);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Survei Keluarga & Lingkungan" maxWidth="max-w-3xl">
             <div className={`${theme.bg} border ${theme.border} rounded-lg p-4 mb-6`}>
                <h4 className={`font-semibold ${theme.text} mb-3 flex items-center`}>👤 <span className="ml-2">Informasi Peserta</span></h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-black">
                    <div><span className="font-medium">Nama:</span> <span className="ml-2 font-semibold">{participant.nama}</span></div>
                    <div><span className="font-medium">Usia:</span> <span className="ml-2 font-semibold">{formatDetailedAge(participant.tanggal_lahir)}</span></div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Sesi 1 */}
                <fieldset className="bg-gray-50 p-4 rounded-lg border">
                    <legend className="font-semibold text-gray-800 text-lg mb-3">Sesi 1: Pengenalan Keluarga</legend>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Nama Kepala Keluarga <span className="text-red-500">*</span></label>
                                <input type="text" name="namaKepalaKeluarga" value={surveyData.namaKepalaKeluarga || ''} onChange={handleChange} required className={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Nomor Kartu Keluarga <span className="text-red-500">*</span></label>
                                <input type="text" name="nomorKartuKeluarga" value={surveyData.nomorKartuKeluarga || ''} onChange={handleChange} required className={inputStyle} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Jumlah KK dalam 1 rumah <span className="text-red-500">*</span></label>
                                <input type="number" name="jumlahKKMenetap" value={surveyData.jumlahKKMenetap || ''} onChange={handleChange} required className={inputStyle} min="1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Jumlah Anggota Keluarga dalam 1 rumah <span className="text-red-500">*</span></label>
                                <input type="number" name="jumlahAnggotaKeluargaMenetap" value={surveyData.jumlahAnggotaKeluargaMenetap || ''} onChange={handleChange} required className={inputStyle} min="1" />
                            </div>
                        </div>
                    </div>
                </fieldset>

                {/* Sesi 2 */}
                <fieldset className="bg-gray-50 p-4 rounded-lg border">
                    <legend className="font-semibold text-gray-800 text-lg mb-3">Sesi 2: Survei Lingkungan</legend>
                    <div className="space-y-4">
                        <Question text="Apakah jenis sumber air yang UTAMA digunakan untuk keperluan mandi, masak, mencuci dan keperluan higiene lainnya?"><RadioGroup options={sumberAirUtamaOptions} selected={surveyData.sumberAirUtama} name="sumberAirUtama" onChange={handleRadioChange} required /></Question>
                        <Question text="Apakah jenis sumber air yang UTAMA digunakan untuk keperluan air minum?"><RadioGroup options={sumberAirMinumUtamaOptions} selected={surveyData.sumberAirMinumUtama} name="sumberAirMinumUtama" onChange={handleRadioChange} required /></Question>
                        <Question text="Bagaimana mengonsumsi air? (Pilih salah satu atau semua sesuai kondisi)"><CheckboxGroup options={caraKonsumsiAirOptions} selected={surveyData.caraKonsumsiAir} name="caraKonsumsiAir" onChange={handleCheckboxChange} /></Question>
                        <Question text="Apakah menyimpan air minum di dalam wadah yang tertutup rapat, kuat, terbuat dari bahan stainless steel, keramik, kaca  dan diambil dengan cara yang aman (tidak tersentuh tangan atau mulut)?"><YesNoRadioGroup value={surveyData.simpanAirMinumTertutup} name="simpanAirMinumTertutup" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah pangan tertutup dengan baik dengan penutup yang bersih?"><YesNoRadioGroup value={surveyData.panganTertutup} name="panganTertutup" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah Pangan Berdekatan Bahan berbahaya dan Beracun (Deterjen, Pestisida, Cairan Obat Nyamuk, dan sejenisnya)?"><YesNoRadioGroup value={surveyData.panganDekatBahanBerbahaya} name="panganDekatBahanBerbahaya" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah dapat melakukan Praktik Penanganan Pangan Yang Baik dan benar, Sesuai 5 Kunci Keamanan Pangan?"><CheckboxGroup options={praktikPanganOptions} selected={surveyData.praktikPenangananPangan} name="praktikPenangananPangan" onChange={handleCheckboxChange} /></Question>
                        <Question text="Apakah tersedia jamban keluarga?"><YesNoRadioGroup value={surveyData.tersediaJambanKeluarga} name="tersediaJambanKeluarga" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah saudara dan anggota keluarga terbiasa buang air besar di jamban?"><YesNoRadioGroup value={surveyData.babDiJamban} name="babDiJamban" onChange={handleYesNoChange} required /></Question>
                        <Question text="Bangunan bawah jamban berupa apa?"><RadioGroup options={bangunanBawahJambanOptions} selected={surveyData.bangunanBawahJamban} name="bangunanBawahJamban" onChange={handleRadioChange} required /></Question>
                        <Question text="Apakah ada sampah berserakan di lingkungan sekitar rumah?"><YesNoRadioGroup value={surveyData.sampahBerserakan} name="sampahBerserakan" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah ada tempat sampah yang tertutup, kuat dan mudah dibersihkan?"><YesNoRadioGroup value={surveyData.tempatSampahTertutup} name="tempatSampahTertutup" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah seluruh anggota keluarga terbiasa membuang sampah di tempatnya?"><YesNoRadioGroup value={surveyData.buangSampahPadaTempatnya} name="buangSampahPadaTempatnya" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah sampah dibakar, dibuang ke sungai/kebun/saluran drainase/ tempat terbuka?"><YesNoRadioGroup value={surveyData.sampahDibakarDibuangSembarangan} name="sampahDibakarDibuangSembarangan" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah telah melakukan pemilahan sampah?"><YesNoRadioGroup value={surveyData.pemilahanSampah} name="pemilahanSampah" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah terlihat genangan air di sekitar rumah karena limbah cair rumah tangga?"><YesNoRadioGroup value={surveyData.genanganAirLimbah} name="genanganAirLimbah" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah ada saluran pembuangan limbah cair rumah tangga (non kakus) yang kedap dan tertutup?"><YesNoRadioGroup value={surveyData.saluranLimbahTertutup} name="saluranLimbahTertutup" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah terhubung dengan sumur resapan dan atau sistem pengolahan limbah?"><YesNoRadioGroup value={surveyData.terhubungSumurResapan} name="terhubungSumurResapan" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah rumah memiliki ventilasi yang cukup (30% dari luas lantai) sehingga memungkinkan terjadinya pertukaran udara yang sehat?"><YesNoRadioGroup value={surveyData.ventilasiCukup} name="ventilasiCukup" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah Ada cahaya matahari yang masuk ke dalam rumah?"><YesNoRadioGroup value={surveyData.cahayaMatahariMasuk} name="cahayaMatahariMasuk" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah ada pencemaran dari asap dapur di rumah?"><YesNoRadioGroup value={surveyData.pencemaranAsapDapur} name="pencemaranAsapDapur" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah saudara atau anggota keluarga terbiasa merokok di dalam rumah?"><YesNoRadioGroup value={surveyData.merokokDalamRumah} name="merokokDalamRumah" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah memiliki sarana CTPS dengan air mengalir dilengkapi dengan sabun?"><YesNoRadioGroup value={surveyData.saranaCTPS} name="saranaCTPS" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah Anda dan anggota keluarga terbiasa mencuci tangan dengan sabun?"><YesNoRadioGroup value={surveyData.cuciTanganPakaiSabun} name="cuciTanganPakaiSabun" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah mengetahui waktu-waktu kritis cuci tangan pakai sabun? (Minimal dapat menjawab 3 waktu kritis)"><CheckboxGroup options={waktuKritisCTPSOptions} selected={surveyData.waktuKritisCTPS} name="waktuKritisCTPS" onChange={handleCheckboxChange} /></Question>
                        <Question text="Apakah ditemukan jentik nyamuk di sekitar rumah?"><YesNoRadioGroup value={surveyData.jentikNyamuk} name="jentikNyamuk" onChange={handleYesNoChange} required /></Question>
                    </div>
                </fieldset>

                {/* Sesi 3 */}
                <fieldset className="bg-gray-50 p-4 rounded-lg border">
                    <legend className="font-semibold text-gray-800 text-lg mb-3">Sesi 3: Survei Keluarga</legend>
                    <div className="space-y-4">
                        <Question text="Apakah ada ART yang pernah didiagnosis menderita gangguan jiwa berat (Schizoprenia)?">
                            <YesNoRadioGroup value={surveyData.adaGangguanJiwaBerat} name="adaGangguanJiwaBerat" onChange={handleYesNoChange} required />
                        </Question>
                        {surveyData.adaGangguanJiwaBerat === true && (
                            <div className="pl-6 border-l-2 border-blue-200 space-y-4 ml-2 py-2">
                                <Question text="Sebutkan nama anggota keluarga yang menderita gangguan jiwa berat">
                                    <input type="text" name="namaPenderitaGangguanJiwa" value={surveyData.namaPenderitaGangguanJiwa || ''} onChange={handleChange} required className={inputStyle} />
                                </Question>
                                <Question text="Apakah selama ini ART tersebut meminum obat gangguan jiwa berat secara teratur?">
                                    <YesNoRadioGroup value={surveyData.minumObatGangguanJiwa} name="minumObatGangguanJiwa" onChange={handleYesNoChange} required />
                                </Question>
                            </div>
                        )}
                        {surveyData.adaGangguanJiwaBerat === false && (
                            <div className="pl-6 border-l-2 border-gray-200 space-y-4 ml-2 py-2">
                                <Question text="Apakah ada anggota keluarga yang dipasung?">
                                    <YesNoRadioGroup value={surveyData.adaKeluargaDipasung} name="adaKeluargaDipasung" onChange={handleYesNoChange} required />
                                </Question>
                            </div>
                        )}

                        <Question text="Apakah seluruh anggota keluarga terbiasa mengkonsumsi makanan dengan gizi seimbang?"><YesNoRadioGroup value={surveyData.konsumsiGiziSeimbang} name="konsumsiGiziSeimbang" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah Anda dan anggota keluarga terbiasa melakukan aktifitas fisik / berolahraga?"><YesNoRadioGroup value={surveyData.aktivitasFisik} name="aktivitasFisik" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah seluruh anggota keluarga mempunyai kartu jaminan kesehatan atau JKN?"><YesNoRadioGroup value={surveyData.punyaJKN} name="punyaJKN" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah seluruh anggota keluarga melakukan cek kesehatan di fasilitas kesehatan secara berkala?"><YesNoRadioGroup value={surveyData.cekKesehatanBerkala} name="cekKesehatanBerkala" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah Anda dan anggota keluarga terbiasa menggosok gigi 2 kali sehari?"><YesNoRadioGroup value={surveyData.gosokGigi} name="gosokGigi" onChange={handleYesNoChange} required /></Question>
                        <Question text="Apakah Anda dan anggota keluarga terbiasa menggunakan garam yang mengandung yodium untuk memasak setiap harinya?"><YesNoRadioGroup value={surveyData.garamBeryodium} name="garamBeryodium" onChange={handleYesNoChange} required /></Question>
                        
                        <Question text="Apakah saudara atau anggota keluarga pernah didiagnosis menderita tuberkulosis (TB) paru?">
                            <YesNoRadioGroup value={surveyData.adaRiwayatTBC} name="adaRiwayatTBC" onChange={handleYesNoChange} required />
                        </Question>
                        {surveyData.adaRiwayatTBC === true && (
                            <div className="pl-6 border-l-2 border-blue-200 space-y-4 ml-2 py-2">
                                <Question text="Sebutkan nama anggota keluarga yang menderita Tuberkulosis (TB) paru">
                                    <input type="text" name="namaPenderitaTBC" value={surveyData.namaPenderitaTBC || ''} onChange={handleChange} required className={inputStyle} />
                                </Question>
                                <Question text="Apakah meminum obat TBC secara teratur (selama 6 bulan)?">
                                    <YesNoRadioGroup value={surveyData.minumObatTBC} name="minumObatTBC" onChange={handleYesNoChange} required />
                                </Question>
                            </div>
                        )}
                        {surveyData.adaRiwayatTBC === false && (
                            <div className="pl-6 border-l-2 border-gray-200 space-y-4 ml-2 py-2">
                                <Question text="Apakah saudara atau anggota keluarga pernah menderita batuk berdahak ≥ 2 minggu disertai satu atau lebih gejala (dahak campur darah, BB turun, keringat malam, demam > 1 bulan)?">
                                    <YesNoRadioGroup value={surveyData.adaGejalaTBC} name="adaGejalaTBC" onChange={handleYesNoChange} required />
                                </Question>
                            </div>
                        )}

                        <Question text="Apakah saudara atau anggota keluarga pernah didiagnosis menderita tekanan darah tinggi / hipertensi?">
                            <YesNoRadioGroup value={surveyData.adaRiwayatHipertensi} name="adaRiwayatHipertensi" onChange={handleYesNoChange} required />
                        </Question>
                        {surveyData.adaRiwayatHipertensi === true && (
                            <div className="pl-6 border-l-2 border-blue-200 space-y-4 ml-2 py-2">
                                <Question text="Sebutkan nama anggota keluarga yang menderita Tekanan darah tinggi">
                                    <input type="text" name="namaPenderitaHipertensi" value={surveyData.namaPenderitaHipertensi || ''} onChange={handleChange} required className={inputStyle} />
                                </Question>
                                <Question text="Apakah selama ini meminum obat tekanan darah tinggi / hipertensi secara teratur?">
                                    <YesNoRadioGroup value={surveyData.minumObatHipertensi} name="minumObatHipertensi" onChange={handleYesNoChange} required />
                                </Question>
                            </div>
                        )}

                        <Question text="Apakah saudara atau anggota keluarga pernah didiagnosis menderita kencing manis?">
                            <YesNoRadioGroup value={surveyData.adaRiwayatDM} name="adaRiwayatDM" onChange={handleYesNoChange} required />
                        </Question>
                        {surveyData.adaRiwayatDM === true && (
                            <div className="pl-6 border-l-2 border-blue-200 space-y-4 ml-2 py-2">
                                <Question text="Sebutkan nama anggota keluarga yang menderita Kencing manis">
                                    <input type="text" name="namaPenderitaDM" value={surveyData.namaPenderitaDM || ''} onChange={handleChange} required className={inputStyle} />
                                </Question>
                                <Question text="Apakah selama ini meminum obat kencing manis secara teratur?">
                                    <YesNoRadioGroup value={surveyData.minumObatDM} name="minumObatDM" onChange={handleYesNoChange} required />
                                </Question>
                            </div>
                        )}
                        
                        {/* New Questions Start Here */}
                        <Question text="Apakah saudara atau anggota keluarga sedang Hamil?">
                            <YesNoRadioGroup value={surveyData.sedangHamil} name="sedangHamil" onChange={handleYesNoChange} required />
                        </Question>
                        {surveyData.sedangHamil === true && (
                            <div className="pl-6 border-l-2 border-blue-200 space-y-4 ml-2 py-2">
                                <Question text="Apakah Ibu hamil melakukan pemeriksaan kehamilan minimal 6 kali selama masa kehamilan?">
                                    <YesNoRadioGroup value={surveyData.pemeriksaanKehamilan6Kali} name="pemeriksaanKehamilan6Kali" onChange={handleYesNoChange} required />
                                </Question>
                            </div>
                        )}
                        {surveyData.sedangHamil === false && (
                            <div className="pl-6 border-l-2 border-gray-200 space-y-4 ml-2 py-2">
                                <Question text="Apakah saudara atau (Istri / suami) menggunakan alat kontrasepsi atau ikut program Keluarga Berencana?">
                                    <RadioGroup options={kbOptions} selected={surveyData.ikutProgramKB} name="ikutProgramKB" onChange={handleRadioChange} required />
                                </Question>
                            </div>
                        )}
                        
                        <Question text="Apakah ada anggota keluarga yang berusia < 12 bulan / 1 tahun?">
                            <YesNoRadioGroup value={surveyData.adaBayi_0_11_bln} name="adaBayi_0_11_bln" onChange={handleYesNoChange} required />
                        </Question>
                        {surveyData.adaBayi_0_11_bln === true && (
                            <div className="pl-6 border-l-2 border-blue-200 space-y-4 ml-2 py-2">
                                <Question text="Apakah Ibu bersalin di fasilitas pelayanan kesehatan?">
                                    <YesNoRadioGroup value={surveyData.bersalinDiFaskes} name="bersalinDiFaskes" onChange={handleYesNoChange} required />
                                </Question>
                            </div>
                        )}

                        <Question text="Apakah ada anggota keluarga yang berusia 7 - 23 bulan (< 2 tahun)?">
                            <YesNoRadioGroup value={surveyData.adaBalita_7_23_bln} name="adaBalita_7_23_bln" onChange={handleYesNoChange} required />
                        </Question>
                        {surveyData.adaBalita_7_23_bln === true && (
                            <div className="pl-6 border-l-2 border-blue-200 space-y-4 ml-2 py-2">
                                <Question text="Apakah pada waktu usia 0-6 bulan anak hanya diberi ASI eksklusif?">
                                    <YesNoRadioGroup value={surveyData.asiEksklusif} name="asiEksklusif" onChange={handleYesNoChange} required />
                                </Question>
                                <Question text="Apakah selama bayi usia 0-11 bulan diberikan imunisasi lengkap? (HB0, BCG, DPT-HB1, DPT-HB2, DPT-HB3, Polio1, Polio2, Polio3, Polio4, Campak)?">
                                    <YesNoRadioGroup value={surveyData.imunisasiLengkapBayi} name="imunisasiLengkapBayi" onChange={handleYesNoChange} required />
                                </Question>
                                <Question text="Apakah dalam 1 bulan terakhir dilakukan pemantauan pertumbuhan balita?">
                                    <YesNoRadioGroup value={surveyData.pemantauanPertumbuhan_7_23_bln} name="pemantauanPertumbuhan_7_23_bln" onChange={handleYesNoChange} required />
                                </Question>
                                {surveyData.pemantauanPertumbuhan_7_23_bln === false && (
                                    <div className="pl-6 border-l-2 border-gray-200 space-y-4 ml-2 py-2">
                                        <Question text="Alasan tidak menimbang?">
                                            <input type="text" name="alasanTidakTimbang_7_23_bln" value={surveyData.alasanTidakTimbang_7_23_bln || ''} onChange={handleChange} required className={inputStyle} />
                                        </Question>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <Question text="Apakah ada anggota keluarga yang berusia 2 - 5 tahun?">
                           <YesNoRadioGroup value={surveyData.adaBalita_2_5_thn} name="adaBalita_2_5_thn" onChange={handleYesNoChange} required />
                        </Question>
                        {surveyData.adaBalita_2_5_thn === true && (
                            <div className="pl-6 border-l-2 border-blue-200 space-y-4 ml-2 py-2">
                                <Question text="Apakah dalam 1 bulan terakhir dilakukan pemantauan pertumbuhan balita?">
                                   <YesNoRadioGroup value={surveyData.pemantauanPertumbuhan_2_5_thn} name="pemantauanPertumbuhan_2_5_thn" onChange={handleYesNoChange} required />
                                </Question>
                                {surveyData.pemantauanPertumbuhan_2_5_thn === false && (
                                     <div className="pl-6 border-l-2 border-gray-200 space-y-4 ml-2 py-2">
                                        <Question text="Alasan tidak menimbang?">
                                            <input type="text" name="alasanTidakTimbang_2_5_thn" value={surveyData.alasanTidakTimbang_2_5_thn || ''} onChange={handleChange} required className={inputStyle} />
                                        </Question>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <Question text="Apakah ada anggota keluarga yang merupakan remaja putri (10 - 18 tahun)?">
                            <YesNoRadioGroup value={surveyData.adaRemajaPutri_10_18_thn} name="adaRemajaPutri_10_18_thn" onChange={handleYesNoChange} required />
                        </Question>
                        {surveyData.adaRemajaPutri_10_18_thn === true && (
                            <div className="pl-6 border-l-2 border-blue-200 space-y-4 ml-2 py-2">
                                <Question text="Apakah remaja putri minum tablet tambah darah satu kali setiap minggu?">
                                    <YesNoRadioGroup value={surveyData.remajaPutriMinumTTD} name="remajaPutriMinumTTD" onChange={handleYesNoChange} required />
                                </Question>
                            </div>
                        )}
                    </div>
                </fieldset>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Batal</button>
                    <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Simpan Survei</button>
                </div>
            </form>
        </Modal>
    );
};