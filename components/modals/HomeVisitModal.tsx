import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import type { Participant, HomeVisitRecord, Category, SkriningPHQ2, SkriningGAD2, SkriningEPDS, MeasurementRecord } from '../../types';
import { getCategoryLabel, getCategoryTheme, formatDetailedAge, calculateAge, calculateBalitaStatus, calculateBMIStatus, calculateLansiaStatus, calculateIbuHamilStatus, calculateAgeInMonths, calculateHealthServiceStatus, getStatusColor, PHQ2_QUESTIONS, GAD2_QUESTIONS, EPDS_QUESTIONS, calculatePHQ2Score, calculateGAD2Score, calculateEPDSScore } from '../../utils/helpers';
import { useToast } from '../../contexts/ToastContext';

interface HomeVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (participantId: string, visitUpdateData: Partial<Participant>, visitRecord: HomeVisitRecord) => void;
    participant: Participant | null;
}

const balitaImmunizations = [
    'HB0', 'BCG', 'OPV 1', 'DPT-HB-Hib 1', 'OPV 2', 'PCV 1', 'RV 1',
    'DPT-HB-Hib 2', 'OPV 3', 'PCV 2', 'RV 2', 'DPT-HB-Hib 3', 'OPV 4',
    'IPV 1', 'RV 3', 'MR 1', 'IPV 2', 'JE', 'PCV 3',
    'DPT-HB-Hib 4', 'MR 2'
];

const kbOptions = ['Tidak Menggunakan', 'Pil KB', 'Suntik KB', 'IUD (Spiral)', 'Implan (Susuk)', 'Kondom', 'MOW (Steril Wanita)', 'MOP (Steril Pria)'];

const standardMentalOptions = [
    { label: "Tidak pernah", value: 0 },
    { label: "Beberapa hari", value: 1 },
    { label: "Lebih dari separuh waktu", value: 2 },
    { label: "Hampir setiap hari", value: 3 }
];

// Deskripsi Pilihan Jawaban EPDS dengan Skornya
const EPDS_OPTIONS_DETAILS = [
    // Q1: Tertawa (Reverse: 0=Best)
    [
        { label: "Sama seperti biasanya", score: 0 },
        { label: "Tidak terlalu banyak", score: 1 },
        { label: "Hanya sedikit", score: 2 },
        { label: "Tidak sama sekali", score: 3 }
    ],
    // Q2: Menantikan hal (Reverse: 0=Best)
    [
        { label: "Sama seperti biasanya", score: 0 },
        { label: "Agak kurang dari biasanya", score: 1 },
        { label: "Jauh kurang dari biasanya", score: 2 },
        { label: "Hampir tidak sama sekali", score: 3 }
    ],
    // Q3: Menyalahkan diri
    [
        { label: "Ya, sering sekali", score: 3 },
        { label: "Ya, kadang-kadang", score: 2 },
        { label: "Jarang", score: 1 },
        { label: "Tidak pernah", score: 0 }
    ],
    // Q4: Cemas
    [
        { label: "Tidak sama sekali", score: 0 },
        { label: "Jarang", score: 1 },
        { label: "Kadang-kadang", score: 2 },
        { label: "Sering", score: 3 }
    ],
    // Q5: Takut/Panik
    [
        { label: "Ya, sering sekali", score: 3 },
        { label: "Ya, kadang-kadang", score: 2 },
        { label: "Jarang", score: 1 },
        { label: "Tidak sama sekali", score: 0 }
    ],
    // Q6: Kewalahan
    [
        { label: "Ya, hampir setiap saat", score: 3 },
        { label: "Ya, kadang-kadang", score: 2 },
        { label: "Jarang", score: 1 },
        { label: "Tidak, saya bisa mengatasinya", score: 0 }
    ],
    // Q7: Sulit tidur
    [
        { label: "Ya, sering sekali", score: 3 },
        { label: "Ya, kadang-kadang", score: 2 },
        { label: "Jarang", score: 1 },
        { label: "Tidak pernah", score: 0 }
    ],
    // Q8: Sedih/Menderita
    [
        { label: "Ya, sering sekali", score: 3 },
        { label: "Ya, kadang-kadang", score: 2 },
        { label: "Jarang", score: 1 },
        { label: "Tidak pernah", score: 0 }
    ],
    // Q9: Menangis
    [
        { label: "Ya, sering sekali", score: 3 },
        { label: "Ya, kadang-kadang", score: 2 },
        { label: "Jarang", score: 1 },
        { label: "Tidak pernah", score: 0 }
    ],
    // Q10: Menyakiti diri
    [
        { label: "Ya, cukup sering", score: 3 },
        { label: "Kadang-kadang", score: 2 },
        { label: "Jarang", score: 1 },
        { label: "Tidak pernah", score: 0 }
    ]
];


const initialVisitState = {
    // Measurement
    berat_badan: '',
    tinggi_badan: '',
    lingkar_kepala: '',
    lila: '',
    lingkar_perut: '',
    sistolik: '',
    diastolik: '',
    // Service
    imunisasi: [] as string[],
    vitaminA: '' as 'Biru' | 'Merah' | '',
    obatCacing: false,
    asiEksklusif: false,
    skriningMerokok: { merokok: false, terpapar: false },
    skriningTBC: { batuk: false, demam: false, beratBadan: false, kontak: false },
    pemeriksaanHB: '',
    skriningIndera: { penglihatanKanan: '' as 'Normal' | 'Gangguan' | '', penglihatanKiri: '' as 'Normal' | 'Gangguan' | '', pendengaran: '' as 'Normal' | 'Gangguan' | '' },
    // skriningJiwa: false, // Removed check

    // Mental Health
    phq2Answers: [0, 0],
    gad2Answers: [0, 0],
    epdsAnswers: Array(10).fill(0),

    gds: '',
    kolesterol: '',
    asamUrat: '',
    kb: '',
    tingkatKemandirian: '' as '' | 'A' | 'B' | 'C',
    gigi_caries: false,
    // Visit specific
    tanggal_kunjungan: '',
    catatan_kunjungan: '',
    // Pregnancy
    tfu: '',
    djj: '',
    presentasi: '',
};

const inputStyle = "mt-1 w-full border border-gray-300 p-2 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 shadow-sm";

const Checkbox: React.FC<{name: string; label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; nested?: boolean}> = ({ name, label, checked, onChange, nested = false }) => (
    <label className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${nested ? 'bg-gray-100' : 'bg-gray-50 border border-gray-200'} hover:bg-gray-100`}>
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <span className="text-sm font-medium text-gray-800">{label}</span>
    </label>
);

export const HomeVisitModal: React.FC<HomeVisitModalProps> = ({ isOpen, onClose, onSave, participant }) => {
    const [visitData, setVisitData] = useState(initialVisitState);
    const [statusKesimpulan, setStatusKesimpulan] = useState<Record<string, {value: string; color: string}>>({});
    const [healthConclusions, setHealthConclusions] = useState<ReturnType<typeof calculateHealthServiceStatus>>({});

    const { addToast } = useToast();
    
    const age = useMemo(() => participant ? calculateAge(participant.tanggal_lahir) : 0, [participant]);
    const ageInMonths = useMemo(() => participant ? calculateAgeInMonths(participant.tanggal_lahir) : 0, [participant]);

    const tbcSymptomCount = useMemo(() => {
        if (!visitData.skriningTBC) return 0;
        return Object.values(visitData.skriningTBC).filter(value => value === true).length;
    }, [visitData.skriningTBC]);

    useEffect(() => {
        if (isOpen && participant) {
            setVisitData({
                ...initialVisitState,
                tanggal_kunjungan: new Date().toISOString().split('T')[0],
            });
            setStatusKesimpulan({});
            setHealthConclusions({});
        }
    }, [isOpen, participant]);

    useEffect(() => {
        if (!participant) return;

        const berat = parseFloat(visitData.berat_badan);
        const tinggi = parseFloat(visitData.tinggi_badan);
        const lila = parseFloat(visitData.lila);
        const { kategori, tanggal_lahir, jenis_kelamin } = participant;

        let newStatus: Record<string, {value: string; color: string}> = {};
        
        switch (kategori) {
            case 'ibu-hamil':
                if (lila > 0 || (berat > 0 && tinggi > 0)) {
                    const ibuHamilStatus = lila > 0 ? calculateIbuHamilStatus(lila) : {};
                    const bmiStatus = (berat > 0 && tinggi > 0) ? calculateBMIStatus(berat, tinggi) : {};
                    newStatus = { ...ibuHamilStatus, ...bmiStatus };
                }
                break;
            case 'balita':
                if (berat > 0 && tinggi > 0) {
                    newStatus = calculateBalitaStatus(berat, tinggi, tanggal_lahir, jenis_kelamin);
                }
                break;
            case 'anak-remaja':
                 if (berat > 0 && tinggi > 0) {
                    const bmiResult = calculateBMIStatus(berat, tinggi);
                    let lilaStatus: Record<string, any> = {};
                    if (lila > 0) {
                        lilaStatus['Status LILA'] = {value: lila < 23.5 ? 'Kurang Gizi' : 'Normal', color: getStatusColor(lila < 23.5 ? 'Kurang Gizi' : 'Normal')};
                    }
                    newStatus = {...bmiResult, ...lilaStatus};
                }
                break;
            case 'dewasa':
                 if (berat > 0 && tinggi > 0) {
                    newStatus = calculateBMIStatus(berat, tinggi);
                }
                break;
            case 'lansia':
                if (berat > 0 && tinggi > 0) {
                    newStatus = calculateLansiaStatus(berat, tinggi, lila > 0 ? lila : undefined);
                }
                break;
        }
        
        setStatusKesimpulan(newStatus);
    }, [visitData.berat_badan, visitData.tinggi_badan, visitData.lila, participant]);

    useEffect(() => {
        if (!participant) return;

        const healthData = {
            sistolik: parseFloat(visitData.sistolik),
            diastolik: parseFloat(visitData.diastolik),
            gds: parseFloat(visitData.gds),
            kolesterol: parseFloat(visitData.kolesterol),
            asamUrat: parseFloat(visitData.asamUrat),
            pemeriksaanHB: parseFloat(visitData.pemeriksaanHB),
            jenis_kelamin: participant.jenis_kelamin,
            age: calculateAge(participant.tanggal_lahir),
            kategori: participant.kategori
        };
        const newConclusions = calculateHealthServiceStatus(healthData);
        setHealthConclusions(newConclusions);
    }, [
        visitData.sistolik,
        visitData.diastolik,
        visitData.gds,
        visitData.kolesterol,
        visitData.asamUrat,
        visitData.pemeriksaanHB,
        participant
    ]);
    
    const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setVisitData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleNestedChange = <T extends keyof typeof initialVisitState>(group: T, field: keyof (typeof initialVisitState)[T], value: any) => {
        setVisitData(prev => ({
            ...prev,
            [group]: {
                ...(prev[group] as object),
                [field]: value,
            },
        }));
    };

    const handleImmunizationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setVisitData(prev => {
            const currentImmunizations = prev.imunisasi;
            if (checked) {
                return { ...prev, imunisasi: [...currentImmunizations, value] };
            } else {
                return { ...prev, imunisasi: currentImmunizations.filter(item => item !== value) };
            }
        });
    };

     // --- Mental Health Handlers ---
    const handleMentalScoreChange = (type: 'phq2' | 'gad2' | 'epds', index: number, value: number) => {
        setVisitData(prev => {
            if (type === 'phq2') {
                const newAnswers = [...prev.phq2Answers];
                newAnswers[index] = value;
                return { ...prev, phq2Answers: newAnswers };
            } else if (type === 'gad2') {
                 const newAnswers = [...prev.gad2Answers];
                newAnswers[index] = value;
                return { ...prev, gad2Answers: newAnswers };
            } else { // epds
                 const newAnswers = [...prev.epdsAnswers];
                newAnswers[index] = value;
                return { ...prev, epdsAnswers: newAnswers };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!participant) return;

        if (age >= 60 && !visitData.tingkatKemandirian) {
            addToast('Tingkat Kemandirian wajib diisi untuk peserta Lansia.', 'error');
            return;
        }
        
        const { sistolik, diastolik, phq2Answers, gad2Answers, epdsAnswers, ...restOfVisitData } = visitData;
        
         // Calculate Mental Health Scores
        let skriningPHQ2: SkriningPHQ2 | undefined;
        let skriningGAD2: SkriningGAD2 | undefined;
        let skriningEPDS: SkriningEPDS | undefined;

        if (participant.kategori === 'ibu-hamil') {
             skriningEPDS = calculateEPDSScore(epdsAnswers);
        } else if (participant.kategori !== 'balita') {
             skriningPHQ2 = calculatePHQ2Score(phq2Answers[0], phq2Answers[1]);
             skriningGAD2 = calculateGAD2Score(gad2Answers[0], gad2Answers[1]);
        }

        const visitUpdateData: Partial<Participant> = {
            berat_badan: parseFloat(restOfVisitData.berat_badan) || undefined,
            tinggi_badan: parseFloat(restOfVisitData.tinggi_badan) || undefined,
            lingkar_kepala: parseFloat(restOfVisitData.lingkar_kepala) || undefined,
            lila: parseFloat(restOfVisitData.lila) || undefined,
            lingkar_perut: parseFloat(restOfVisitData.lingkar_perut) || undefined,
            tensi: sistolik && diastolik ? `${sistolik}/${diastolik}` : undefined,
            tanggal_pengukuran: restOfVisitData.tanggal_kunjungan,
            catatan_pengukuran: restOfVisitData.catatan_kunjungan,
            status_bb_tb: (statusKesimpulan['BB/TB'] || statusKesimpulan['BB/PB'])?.value,
            status_bb_u: statusKesimpulan['BB/U']?.value,
            status_tb_u: (statusKesimpulan['TB/U'] || statusKesimpulan['PB/U'])?.value,
            status_bmi: statusKesimpulan['BMI']?.value,
            status_kategori_bmi: statusKesimpulan['Kategori']?.value,
            status_lila: statusKesimpulan['Status LILA']?.value,
            imunisasi: restOfVisitData.imunisasi,
            vitaminA: restOfVisitData.vitaminA as 'Biru' | 'Merah' | undefined,
            obatCacing: restOfVisitData.obatCacing,
            asiEksklusif: restOfVisitData.asiEksklusif,
            skriningMerokok: restOfVisitData.skriningMerokok,
            skriningTBC: restOfVisitData.skriningTBC,
            pemeriksaanHB: restOfVisitData.pemeriksaanHB ? parseFloat(restOfVisitData.pemeriksaanHB) : undefined,
            skriningIndera: restOfVisitData.skriningIndera,
            skriningJiwa: restOfVisitData.skriningJiwa,
            gds: restOfVisitData.gds ? parseFloat(restOfVisitData.gds) : undefined,
            kolesterol: restOfVisitData.kolesterol ? parseFloat(restOfVisitData.kolesterol) : undefined,
            asamUrat: restOfVisitData.asamUrat ? parseFloat(restOfVisitData.asamUrat) : undefined,
            kb: restOfVisitData.kb,
            tingkatKemandirian: restOfVisitData.tingkatKemandirian as 'A' | 'B' | 'C' || undefined,
            tanggal_pelayanan: restOfVisitData.tanggal_kunjungan,
            catatan_pelayanan: restOfVisitData.catatan_kunjungan,
            tfu: restOfVisitData.tfu ? parseFloat(restOfVisitData.tfu) : undefined,
            djj: restOfVisitData.djj ? parseFloat(restOfVisitData.djj) : undefined,
            presentasi: restOfVisitData.presentasi as 'Kepala' | 'Sungsang' | 'Lintang' || undefined,
            gigi_caries: restOfVisitData.gigi_caries,
            skriningPHQ2,
            skriningGAD2,
            skriningEPDS,
            ...healthConclusions,
        };

        // Create a measurement record if relevant data is present
        const measurementRecord: Partial<MeasurementRecord> = {
            tanggal_pengukuran: visitUpdateData.tanggal_pelayanan, // Use visit date
            berat_badan: visitUpdateData.berat_badan,
            tinggi_badan: visitUpdateData.tinggi_badan,
            lila: visitUpdateData.lila,
            lingkar_kepala: visitUpdateData.lingkar_kepala,
            lingkar_perut: visitUpdateData.lingkar_perut,
            tensi: visitUpdateData.tensi,
            pemeriksaanHB: visitUpdateData.pemeriksaanHB,
            kesimpulan_hb: visitUpdateData.kesimpulan_hb,
            imunisasi: visitUpdateData.imunisasi,
            vitaminA: visitUpdateData.vitaminA,
            obatCacing: visitUpdateData.obatCacing,
            catatan_pelayanan: visitUpdateData.catatan_pelayanan,
            gigi_caries: visitUpdateData.gigi_caries,
            skriningPHQ2,
            skriningGAD2,
            skriningEPDS,
        };
        
        if (participant.riwayatPengukuran) {
             visitUpdateData.riwayatPengukuran = [...participant.riwayatPengukuran, measurementRecord as MeasurementRecord];
        } else {
             visitUpdateData.riwayatPengukuran = [measurementRecord as MeasurementRecord];
        }

        const visitRecord: HomeVisitRecord = {
            tanggal_kunjungan: visitData.tanggal_kunjungan,
            catatan: visitData.catatan_kunjungan,
        };

        onSave(participant.__backendId, visitUpdateData, visitRecord);
    };
    
    if (!participant) return null;
    const theme = getCategoryTheme(participant.kategori);
    const category: Category | null = participant?.kategori || null;
    const isMarried = participant.status_pernikahan === 'Menikah';
    
    const renderMeasurementFields = () => {
        const commonFields = (
             <>
                <div><label className="block text-sm font-medium text-gray-700">Berat Badan (kg)</label><input type="number" step="0.1" name="berat_badan" value={visitData.berat_badan} onChange={handleSimpleChange} className={inputStyle} /></div>
                <div><label className="block text-sm font-medium text-gray-700">Tinggi Badan (cm)</label><input type="number" step="0.1" name="tinggi_badan" value={visitData.tinggi_badan} onChange={handleSimpleChange} className={inputStyle} /></div>
            </>
        );
    
        if (category === 'ibu-hamil') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {commonFields}
                    <div><label className="block text-sm font-medium text-gray-700">LILA (cm)</label><input type="number" step="0.1" name="lila" value={visitData.lila} onChange={handleSimpleChange} className={inputStyle} /></div>
                </div>
            );
        } else if (category === 'balita') {
            return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{commonFields}<div><label className="block text-sm font-medium text-gray-700">Lingkar Kepala (cm)</label><input type="number" step="0.1" name="lingkar_kepala" value={visitData.lingkar_kepala} onChange={handleSimpleChange} className={inputStyle} /></div><div><label className="block text-sm font-medium text-gray-700">LILA (cm)</label><input type="number" step="0.1" name="lila" value={visitData.lila} onChange={handleSimpleChange} className={inputStyle} /></div></div>;
        } else if (category === 'anak-remaja') {
            return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{commonFields}<div><label className="block text-sm font-medium text-gray-700">LILA (cm)</label><input type="number" step="0.1" name="lila" value={visitData.lila} onChange={handleSimpleChange} className={inputStyle} /></div><div><label className="block text-sm font-medium text-gray-700">Lingkar Perut (cm)</label><input type="number" step="0.1" name="lingkar_perut" value={visitData.lingkar_perut} onChange={handleSimpleChange} className={inputStyle} /></div></div>;
        } else if (category === 'dewasa') {
            return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{commonFields}<div><label className="block text-sm font-medium text-gray-700">Lingkar Perut (cm)</label><input type="number" step="0.1" name="lingkar_perut" value={visitData.lingkar_perut} onChange={handleSimpleChange} className={inputStyle} /></div></div>;
        } else if (category === 'lansia') {
            return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{commonFields}<div><label className="block text-sm font-medium text-gray-700">Lingkar Perut (cm)</label><input type="number" step="0.1" name="lingkar_perut" value={visitData.lingkar_perut} onChange={handleSimpleChange} className={inputStyle} /></div><div><label className="block text-sm font-medium text-gray-700">LILA (cm)</label><input type="number" step="0.1" name="lila" value={visitData.lila} onChange={handleSimpleChange} className={inputStyle} /></div></div>;
        }
        return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{commonFields}</div>
    }

    const renderServiceFields = () => {
        if (age <= 5 && category === 'balita') {
             return (
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Imunisasi</h4>
                        <div className="columns-2 lg:columns-3 gap-x-4">
                            {balitaImmunizations.map(imun => (
                                <label key={imun} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 break-inside-avoid-column mb-2">
                                    <input type="checkbox" value={imun} checked={visitData.imunisasi.includes(imun)} onChange={handleImmunizationChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                    <span className="text-sm font-medium text-gray-800">{imun}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Suplementasi & Status</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="vitaminA" value="Biru" checked={visitData.vitaminA === 'Biru'} onChange={handleSimpleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm text-gray-900">Vitamin A Biru</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="vitaminA" value="Merah" checked={visitData.vitaminA === 'Merah'} onChange={handleSimpleChange} className="h-4 w-4 text-red-600 focus:ring-red-500" />
                                    <span className="text-sm text-gray-900">Vitamin A Merah</span>
                                </label>
                            </div>
                           <Checkbox name="obatCacing" label="Obat Cacing" checked={visitData.obatCacing} onChange={handleSimpleChange} />
                           {ageInMonths <= 6 && (
                                <Checkbox name="asiEksklusif" label="ASI Eksklusif" checked={visitData.asiEksklusif} onChange={handleSimpleChange} />
                           )}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Skrining TBC</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Checkbox nested name="batuk" label="Batuk terus menerus" checked={visitData.skriningTBC.batuk} onChange={e => handleNestedChange('skriningTBC', 'batuk', e.target.checked)} />
                            <Checkbox nested name="demam" label="Demam ≥ 2 minggu" checked={visitData.skriningTBC.demam} onChange={e => handleNestedChange('skriningTBC', 'demam', e.target.checked)} />
                            <Checkbox nested name="beratBadan" label="BB turun/tidak naik" checked={visitData.skriningTBC.beratBadan} onChange={e => handleNestedChange('skriningTBC', 'beratBadan', e.target.checked)} />
                            <Checkbox nested name="kontak" label="Kontak erat pasien TBC" checked={visitData.skriningTBC.kontak} onChange={e => handleNestedChange('skriningTBC', 'kontak', e.target.checked)} />
                        </div>
                        {tbcSymptomCount >= 2 && (
                            <div className="mt-3 bg-red-100 border-l-4 border-red-500 text-red-800 p-3 rounded-r-lg" role="alert">
                                <p className="font-bold">Perhatian!</p>
                                <p className="text-sm">Ditemukan 2 atau lebih gejala TBC. Segera rujuk peserta ke Puskesmas untuk pemeriksaan lebih lanjut.</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return <div className="space-y-6"><div><h4 className="font-semibold text-gray-800 mb-2">Skrining Merokok</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div className="space-y-2 p-2 bg-gray-100 rounded-lg"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="merokok-status" checked={visitData.skriningMerokok?.merokok === true} onChange={() => handleNestedChange('skriningMerokok', 'merokok', true)} className="h-4 w-4 text-blue-600 focus:ring-blue-500" /><span className="text-sm font-medium text-gray-800">Merokok</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="merokok-status" checked={visitData.skriningMerokok?.merokok === false} onChange={() => handleNestedChange('skriningMerokok', 'merokok', false)} className="h-4 w-4 text-blue-600 focus:ring-blue-500" /><span className="text-sm font-medium text-gray-800">Tidak Merokok</span></label></div><Checkbox nested name="terpapar" label="Terpapar Asap Rokok" checked={visitData.skriningMerokok?.terpapar} onChange={e => handleNestedChange('skriningMerokok', 'terpapar', e.target.checked)} /></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><div className="grid grid-cols-2 gap-2"><div><label className="block text-sm font-medium text-gray-700">Sistolik (mmHg)</label><input type="number" name="sistolik" value={visitData.sistolik} onChange={handleSimpleChange} className={inputStyle} placeholder="120" /></div><div><label className="block text-sm font-medium text-gray-700">Diastolik (mmHg)</label><input type="number" name="diastolik" value={visitData.diastolik} onChange={handleSimpleChange} className={inputStyle} placeholder="80" /></div></div>{healthConclusions.kesimpulan_tensi && <p className={`text-xs font-semibold mt-1 ${getStatusColor(healthConclusions.kesimpulan_tensi)}`}>{healthConclusions.kesimpulan_tensi}</p>}</div>{(category === 'ibu-hamil' || category === 'anak-remaja') && (<div><label className="block text-sm font-medium text-gray-700">Pemeriksaan HB</label><input type="number" step="0.1" name="pemeriksaanHB" value={visitData.pemeriksaanHB} onChange={handleSimpleChange} className={inputStyle} placeholder="Contoh: 12.5" /> {healthConclusions.kesimpulan_hb && <p className={`text-xs font-semibold mt-1 ${getStatusColor(healthConclusions.kesimpulan_hb)}`}>{healthConclusions.kesimpulan_hb}</p>} </div>)}</div>{category === 'ibu-hamil' && <div><h4 className="font-semibold text-gray-800 mb-2">Pemeriksaan Kehamilan</h4><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="block text-sm font-medium text-gray-700">TFU (cm)</label><input type="number" step="1" name="tfu" value={visitData.tfu} onChange={handleSimpleChange} className={inputStyle} /></div><div><label className="block text-sm font-medium text-gray-700">DJJ (bpm)</label><input type="number" step="1" name="djj" value={visitData.djj} onChange={handleSimpleChange} className={inputStyle} /></div><div><label className="block text-sm font-medium text-gray-700">Presentasi Janin</label><select name="presentasi" value={visitData.presentasi} onChange={handleSimpleChange} className={inputStyle}><option value="">Pilih...</option><option value="Kepala">Kepala</option><option value="Sungsang">Sungsang</option><option value="Lintang">Lintang</option></select></div></div></div>}{ (category === 'anak-remaja' || age >= 15) && (<div><h4 className="font-semibold text-gray-800 mb-2">Pemeriksaan Lab Sederhana</h4><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="block text-sm font-medium text-gray-700">GDS (mg/dL)</label><input type="number" step="1" name="gds" value={visitData.gds} onChange={handleSimpleChange} className={inputStyle} /> {healthConclusions.kesimpulan_gds && <p className={`text-xs font-semibold mt-1 ${getStatusColor(healthConclusions.kesimpulan_gds)}`}>{healthConclusions.kesimpulan_gds}</p>} </div>{ age >= 15 && <><div><label className="block text-sm font-medium text-gray-700">Kolesterol (mg/dL)</label><input type="number" step="1" name="kolesterol" value={visitData.kolesterol} onChange={handleSimpleChange} className={inputStyle} /> {healthConclusions.kesimpulan_kolesterol && <p className={`text-xs font-semibold mt-1 ${getStatusColor(healthConclusions.kesimpulan_kolesterol)}`}>{healthConclusions.kesimpulan_kolesterol}</p>} </div><div><label className="block text-sm font-medium text-gray-700">Asam Urat (mg/dL)</label><input type="number" step="0.1" name="asamUrat" value={visitData.asamUrat} onChange={handleSimpleChange} className={inputStyle} /> {healthConclusions.kesimpulan_asam_urat && <p className={`text-xs font-semibold mt-1 ${getStatusColor(healthConclusions.kesimpulan_asam_urat)}`}>{healthConclusions.kesimpulan_asam_urat}</p>} </div></>}</div></div>)}{category === 'anak-remaja' && (<div><h4 className="font-semibold text-gray-800 mb-2">Skrining Kesehatan Gigi</h4><Checkbox name="gigi_caries" label="Gigi Caries (berlubang/rusak)" checked={visitData.gigi_caries} onChange={handleSimpleChange} /></div>)}<div><h4 className="font-semibold text-gray-800 mb-2">Skrining TBC</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Checkbox nested name="batuk" label="Batuk terus menerus" checked={visitData.skriningTBC?.batuk} onChange={e => handleNestedChange('skriningTBC', 'batuk', e.target.checked)} /><Checkbox nested name="demam" label="Demam ≥ 2 minggu" checked={visitData.skriningTBC?.demam} onChange={e => handleNestedChange('skriningTBC', 'demam', e.target.checked)} /><Checkbox nested name="beratBadan" label="BB turun/tidak naik" checked={visitData.skriningTBC?.beratBadan} onChange={e => handleNestedChange('skriningTBC', 'beratBadan', e.target.checked)} /><Checkbox nested name="kontak" label="Kontak erat pasien TBC" checked={visitData.skriningTBC?.kontak} onChange={e => handleNestedChange('skriningTBC', 'kontak', e.target.checked)} /></div>{tbcSymptomCount >= 2 && ( <div className="mt-3 bg-red-100 border-l-4 border-red-500 text-red-800 p-3 rounded-r-lg" role="alert"><p className="font-bold">Perhatian!</p><p className="text-sm">Ditemukan 2 atau lebih gejala TBC. Segera rujuk peserta ke Puskesmas untuk pemeriksaan lebih lanjut.</p></div>)}</div><div><h4 className="font-semibold text-gray-800 mb-2">Skrining Indera</h4><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="block text-sm font-medium text-gray-700">Penglihatan (Kanan)</label><select name="penglihatanKanan" value={visitData.skriningIndera?.penglihatanKanan} onChange={e => handleNestedChange('skriningIndera', 'penglihatanKanan', e.target.value)} className={inputStyle}><option value="">Pilih...</option><option value="Normal">Normal</option><option value="Gangguan">Gangguan</option></select></div><div><label className="block text-sm font-medium text-gray-700">Penglihatan (Kiri)</label><select name="penglihatanKiri" value={visitData.skriningIndera?.penglihatanKiri} onChange={e => handleNestedChange('skriningIndera', 'penglihatanKiri', e.target.value)} className={inputStyle}><option value="">Pilih...</option><option value="Normal">Normal</option><option value="Gangguan">Gangguan</option></select></div><div><label className="block text-sm font-medium text-gray-700">Pendengaran</label><select name="pendengaran" value={visitData.skriningIndera?.pendengaran} onChange={e => handleNestedChange('skriningIndera', 'pendengaran', e.target.value)} className={inputStyle}><option value="">Pilih...</option><option value="Normal">Normal</option><option value="Gangguan">Gangguan</option></select></div></div></div>

            {/* Mental Health Screening - Always shown if applicable */}
            {participant.kategori !== 'balita' && (
                <div className="mt-4 border-t pt-4">
                    <div className="mb-4">
                        <h4 className="font-semibold text-gray-800">Skrining Kesehatan Jiwa</h4>
                    </div>
                    
                    <div className="space-y-6 bg-purple-50 p-4 rounded-lg border border-purple-100">
                         {participant.kategori === 'ibu-hamil' ? (
                            <div>
                                <h5 className="font-bold text-purple-800 mb-2">Edinburgh Postnatal Depression Scale (EPDS)</h5>
                                <p className="text-xs text-gray-600 mb-4">Jawab berdasarkan perasaan Anda selama 7 hari terakhir.</p>
                                <div className="space-y-4">
                                    {EPDS_QUESTIONS.map((q, i) => (
                                        <div key={i} className="bg-white p-4 rounded border border-gray-200">
                                            <p className="font-medium text-sm mb-3 text-gray-900">{q}</p>
                                            <div className="flex flex-col gap-2">
                                                {EPDS_OPTIONS_DETAILS[i].map((option) => (
                                                    <label key={option.score} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors">
                                                        <input 
                                                            type="radio" 
                                                            name={`epds-visit-${i}`} 
                                                            checked={visitData.epdsAnswers[i] === option.score} 
                                                            onChange={() => handleMentalScoreChange('epds', i, option.score)}
                                                            className="text-purple-600 focus:ring-purple-500 h-4 w-4"
                                                        />
                                                        <span className="text-gray-900 font-medium text-sm">{option.label} <span className="text-gray-400 text-xs">({option.score})</span></span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 p-3 bg-white rounded text-sm font-semibold text-purple-800 border border-purple-200">
                                    Interpretasi Sementara: {calculateEPDSScore(visitData.epdsAnswers).interpretation}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h5 className="font-bold text-purple-800 mb-2">PHQ-2 (Depresi)</h5>
                                    <div className="space-y-3">
                                        {PHQ2_QUESTIONS.map((q, i) => (
                                            <div key={i} className="bg-white p-3 rounded border border-gray-200">
                                                <p className="font-medium text-sm mb-2 text-gray-900">{q}</p>
                                                <select value={visitData.phq2Answers[i]} onChange={(e) => handleMentalScoreChange('phq2', i, parseInt(e.target.value))} className="w-full p-2 border rounded text-sm text-gray-900 bg-white">
                                                    {standardMentalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 p-2 bg-white rounded text-xs font-semibold text-purple-800 border border-purple-200">
                                        Hasil: {calculatePHQ2Score(visitData.phq2Answers[0], visitData.phq2Answers[1]).interpretation}
                                    </div>
                                </div>
                                <div>
                                    <h5 className="font-bold text-purple-800 mb-2">GAD-2 (Kecemasan)</h5>
                                    <div className="space-y-3">
                                        {GAD2_QUESTIONS.map((q, i) => (
                                            <div key={i} className="bg-white p-3 rounded border border-gray-200">
                                                <p className="font-medium text-sm mb-2 text-gray-900">{q}</p>
                                                <select value={visitData.gad2Answers[i]} onChange={(e) => handleMentalScoreChange('gad2', i, parseInt(e.target.value))} className="w-full p-2 border rounded text-sm text-gray-900 bg-white">
                                                    {standardMentalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 p-2 bg-white rounded text-xs font-semibold text-purple-800 border border-purple-200">
                                        Hasil: {calculateGAD2Score(visitData.gad2Answers[0], visitData.gad2Answers[1]).interpretation}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-4 items-end mt-4">{age >= 18 && age <= 59 && isMarried && category !== 'ibu-hamil' && (<div className="flex-1 min-w-[150px]"><label className="block text-sm font-medium text-gray-700">Status KB</label><select name="kb" value={visitData.kb} onChange={handleSimpleChange} className={inputStyle}><option value="">Pilih...</option>{kbOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>)}{age >= 60 && (<div className="flex-1 min-w-[200px]"><label className="block text-sm font-medium text-gray-700">Tingkat Kemandirian {age >= 60 && <span className="text-red-500">*</span>}</label><select name="tingkatKemandirian" value={visitData.tingkatKemandirian} onChange={handleSimpleChange} className={inputStyle} required={age >= 60}><option value="">Pilih...</option><option value="A">A (Mandiri)</option><option value="B">B (Bantuan Sebagian)</option><option value="C">C (Ketergantungan Penuh)</option></select></div>)}</div></div>;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Catat Data Kunjungan Rumah" maxWidth="max-w-4xl">
             <div className={`${theme.bg} border ${theme.border} rounded-lg p-4 mb-6`}>
                 <h4 className={`font-semibold ${theme.text} mb-3 flex items-center`}>👤 <span className="ml-2">Informasi Peserta</span></h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-black">
                    <div><span className="font-medium">Nama:</span> <span className="ml-2 font-semibold">{participant.nama}</span></div>
                    <div><span className="font-medium">Usia:</span> <span className="ml-2 font-semibold">{formatDetailedAge(participant.tanggal_lahir)}</span></div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Kunjungan</label>
                    <input type="date" name="tanggal_kunjungan" value={visitData.tanggal_kunjungan} onChange={handleSimpleChange} required className={inputStyle} />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">Hasil Pengukuran</h4>
                    {renderMeasurementFields()}
                </div>

                 {Object.keys(statusKesimpulan).length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center">📊 <span className="ml-2">Kesimpulan Status Gizi (Otomatis)</span></h4>
                        <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 text-sm`}>
                            {Object.keys(statusKesimpulan).map((key) => {
                                const result = statusKesimpulan[key];
                                return (
                                <div key={key} className="bg-white p-3 rounded border text-center">
                                    <div className="text-gray-600 font-medium mb-1">{key}</div>
                                    <div className={`font-bold text-lg ${result.color}`}>{result.value}</div>
                                </div>
                            );
                            })}
                        </div>
                    </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">Pencatatan Pelayanan</h4>
                    {renderServiceFields()}
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Catatan Kunjungan</label>
                    <textarea name="catatan_kunjungan" value={visitData.catatan_kunjungan} onChange={handleSimpleChange} rows={3} className={inputStyle} placeholder="Jelaskan kondisi peserta, temuan, dan tindak lanjut..."></textarea>
                </div>
                
                <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                    <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Batal</button>
                    <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Simpan Kunjungan</button>
                </div>
            </form>
        </Modal>
    );
};