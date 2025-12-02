import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import type { Participant, Category, MeasurementRecord, SkriningPHQ2, SkriningGAD2, SkriningEPDS } from '../../types';
import { getCategoryLabel, getCategoryTheme, formatDetailedAge, calculateAge, formatDate, calculateHealthServiceStatus, calculateAgeInMonths, getStatusColor, PHQ2_QUESTIONS, GAD2_QUESTIONS, EPDS_QUESTIONS, EPDS_OPTIONS_DETAILS, calculatePHQ2Score, calculateGAD2Score, calculateEPDSScore } from '../../utils/helpers';
import { useToast } from '../../contexts/ToastContext';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (participantId: string, serviceData: Partial<Participant>) => void;
    participantToServe: Participant | null;
}

const balitaImmunizations = [
    'HB0', 'BCG', 'OPV 1', 'DPT-HB-Hib 1', 'OPV 2', 'PCV 1', 'RV 1',
    'DPT-HB-Hib 2', 'OPV 3', 'PCV 2', 'RV 2', 'DPT-HB-Hib 3', 'OPV 4',
    'IPV 1', 'RV 3', 'MR 1', 'IPV 2', 'JE', 'PCV 3',
    'DPT-HB-Hib 4', 'MR 2'
];

const kbOptions = ['Tidak Menggunakan', 'Pil KB', 'Suntik KB', 'IUD (Spiral)', 'Implan (Susuk)', 'Kondom', 'MOW (Steril Wanita)', 'MOP (Steril Pria)'];

// Standard options for PHQ-2/GAD-2
const standardMentalOptions = [
    { label: "Tidak pernah", value: 0 },
    { label: "Beberapa hari", value: 1 },
    { label: "Lebih dari separuh waktu", value: 2 },
    { label: "Hampir setiap hari", value: 3 }
];

const initialServiceState = {
    imunisasi: [] as string[],
    vitaminA: '' as 'Biru' | 'Merah' | '',
    obatCacing: false,
    asiEksklusif: false,
    skriningMerokok: { merokok: false, terpapar: false },
    sistolik: '',
    diastolik: '',
    skriningTBC: { batuk: false, demam: false, beratBadan: false, kontak: false },
    pemeriksaanHB: '',
    skriningIndera: { penglihatanKanan: '' as 'Normal' | 'Gangguan' | '', penglihatanKiri: '' as 'Normal' | 'Gangguan' | '', pendengaran: '' as 'Normal' | 'Gangguan' | '' },
    
    // New State for Mental Health Answers
    phq2Answers: [0, 0],
    gad2Answers: [0, 0],
    epdsAnswers: Array(10).fill(0),

    catatan_pelayanan: '',
    gds: '',
    kolesterol: '',
    asamUrat: '',
    kb: '',
    tingkatKemandirian: '' as '' | 'A' | 'B' | 'C',
    sudahPKAT: false,
    gigi_caries: false,
    lila: '',
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

const InfoItem: React.FC<{ label: string; value?: string | number | null; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <div className="font-semibold text-gray-800 break-words">{children || value || '-'}</div>
    </div>
);


export const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, onSave, participantToServe }) => {
    const [serviceData, setServiceData] = useState(initialServiceState);
    const [conclusions, setConclusions] = useState<ReturnType<typeof calculateHealthServiceStatus>>({});
    const { addToast } = useToast();

    const ageInMonths = useMemo(() => participantToServe ? calculateAgeInMonths(participantToServe.tanggal_lahir) : 0, [participantToServe]);

    const tbcSymptomCount = useMemo(() => {
        if (!serviceData.skriningTBC) return 0;
        return Object.values(serviceData.skriningTBC).filter(value => value === true).length;
    }, [serviceData.skriningTBC]);

    useEffect(() => {
        if (isOpen && participantToServe) {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const lastServiceThisMonth = participantToServe.tanggal_pelayanan?.startsWith(currentMonth);
            const [sistolik, diastolik] = participantToServe.tensi?.split('/') || ['', ''];

            if (lastServiceThisMonth) {
                setServiceData({
                    imunisasi: participantToServe.imunisasi || [],
                    vitaminA: participantToServe.vitaminA || '',
                    obatCacing: participantToServe.obatCacing || false,
                    asiEksklusif: participantToServe.asiEksklusif || false,
                    skriningMerokok: participantToServe.skriningMerokok ?? { merokok: false, terpapar: false },
                    sistolik,
                    diastolik,
                    skriningTBC: participantToServe.skriningTBC ?? { batuk: false, demam: false, beratBadan: false, kontak: false },
                    pemeriksaanHB: participantToServe.pemeriksaanHB?.toString() || '',
                    skriningIndera: participantToServe.skriningIndera ?? { penglihatanKanan: '', penglihatanKiri: '', pendengaran: '' },
                    // skriningJiwa: participantToServe.skriningJiwa || false, // Removed
                    // Load existing mental health data if available
                    phq2Answers: participantToServe.skriningPHQ2 ? [participantToServe.skriningPHQ2.q1, participantToServe.skriningPHQ2.q2] : [0, 0],
                    gad2Answers: participantToServe.skriningGAD2 ? [participantToServe.skriningGAD2.q1, participantToServe.skriningGAD2.q2] : [0, 0],
                    epdsAnswers: participantToServe.skriningEPDS ? participantToServe.skriningEPDS.answers : Array(10).fill(0),

                    catatan_pelayanan: participantToServe.catatan_pelayanan || '',
                    gds: participantToServe.gds?.toString() || '',
                    kolesterol: participantToServe.kolesterol?.toString() || '',
                    asamUrat: participantToServe.asamUrat?.toString() || '',
                    kb: participantToServe.kb || '',
                    tingkatKemandirian: participantToServe.tingkatKemandirian || '',
                    sudahPKAT: participantToServe.sudahPKAT || false,
                    gigi_caries: participantToServe.gigi_caries || false,
                    lila: participantToServe.lila?.toString() || '',
                    tfu: participantToServe.tfu?.toString() || '',
                    djj: participantToServe.djj?.toString() || '',
                    presentasi: participantToServe.presentasi || '',
                });
            } else {
                setServiceData(initialServiceState);
            }
            setConclusions({});
        } else {
            setServiceData(initialServiceState);
            setConclusions({});
        }
    }, [participantToServe, isOpen]);
    
    useEffect(() => {
        if (!participantToServe) return;

        const healthData = {
            sistolik: parseFloat(serviceData.sistolik),
            diastolik: parseFloat(serviceData.diastolik),
            gds: parseFloat(serviceData.gds),
            kolesterol: parseFloat(serviceData.kolesterol),
            asamUrat: parseFloat(serviceData.asamUrat),
            pemeriksaanHB: parseFloat(serviceData.pemeriksaanHB),
            jenis_kelamin: participantToServe.jenis_kelamin,
            age: calculateAge(participantToServe.tanggal_lahir),
            kategori: participantToServe.kategori
        };
        const newConclusions = calculateHealthServiceStatus(healthData);
        setConclusions(newConclusions);
    }, [
        serviceData.sistolik,
        serviceData.diastolik,
        serviceData.gds,
        serviceData.kolesterol,
        serviceData.asamUrat,
        serviceData.pemeriksaanHB,
        participantToServe
    ]);

    const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setServiceData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleNestedChange = <T extends keyof typeof initialServiceState>(group: T, field: keyof (typeof initialServiceState)[T], value: any) => {
        setServiceData(prev => ({
            ...prev,
            [group]: {
                ...(prev[group] as object),
                [field]: value,
            },
        }));
    };

    // --- Mental Health Handlers ---
    const handleMentalScoreChange = (type: 'phq2' | 'gad2' | 'epds', index: number, value: number) => {
        setServiceData(prev => {
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

    const handleImmunizationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setServiceData(prev => {
            const currentImmunizations = prev.imunisasi;
            if (checked) {
                return { ...prev, imunisasi: [...currentImmunizations, value] };
            } else {
                return { ...prev, imunisasi: currentImmunizations.filter(item => item !== value) };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!participantToServe) return;

        const age = calculateAge(participantToServe.tanggal_lahir);
        if (age >= 60 && !serviceData.tingkatKemandirian) {
            addToast('Tingkat Kemandirian wajib diisi untuk peserta Lansia.', 'error');
            return;
        }

        const { sistolik, diastolik, phq2Answers, gad2Answers, epdsAnswers, ...restOfServiceData } = serviceData;
        const today = new Date().toISOString();

        // Calculate Mental Health Scores - Always calculate if answers are present
        let skriningPHQ2: SkriningPHQ2 | undefined;
        let skriningGAD2: SkriningGAD2 | undefined;
        let skriningEPDS: SkriningEPDS | undefined;

        if (participantToServe.kategori === 'ibu-hamil') {
             skriningEPDS = calculateEPDSScore(epdsAnswers);
        } else if (participantToServe.kategori !== 'balita') {
             skriningPHQ2 = calculatePHQ2Score(phq2Answers[0], phq2Answers[1]);
             skriningGAD2 = calculateGAD2Score(gad2Answers[0], gad2Answers[1]);
        }


        const dataToSave: Partial<Participant> = {
            ...restOfServiceData,
            ...conclusions,
            tensi: sistolik && diastolik ? `${sistolik}/${diastolik}` : undefined,
            skriningIndera: {
                penglihatanKanan: serviceData.skriningIndera.penglihatanKanan || undefined,
                penglihatanKiri: serviceData.skriningIndera.penglihatanKiri || undefined,
                pendengaran: serviceData.skriningIndera.pendengaran || undefined,
            },
            pemeriksaanHB: serviceData.pemeriksaanHB ? parseFloat(serviceData.pemeriksaanHB) : undefined,
            gds: serviceData.gds ? parseFloat(serviceData.gds) : undefined,
            kolesterol: serviceData.kolesterol ? parseFloat(serviceData.kolesterol) : undefined,
            asamUrat: serviceData.asamUrat ? parseFloat(serviceData.asamUrat) : undefined,
            kb: serviceData.kb,
            asiEksklusif: serviceData.asiEksklusif,
            tingkatKemandirian: serviceData.tingkatKemandirian as 'A' | 'B' | 'C' || undefined,
            tanggal_pelayanan: today,
            sudahPKAT: ageInMonths >= 6 && ageInMonths < 8 ? serviceData.sudahPKAT : participantToServe.sudahPKAT,
            gigi_caries: serviceData.gigi_caries,
            lila: serviceData.lila ? parseFloat(serviceData.lila) : undefined,
            tfu: serviceData.tfu ? parseFloat(serviceData.tfu) : undefined,
            djj: serviceData.djj ? parseFloat(serviceData.djj) : undefined,
            presentasi: serviceData.presentasi as 'Kepala' | 'Sungsang' | 'Lintang' || undefined,
            // skriningJiwa: serviceData.skriningJiwa, // Removed
            skriningPHQ2,
            skriningGAD2,
            skriningEPDS,
            vitaminA: serviceData.vitaminA || undefined,
        };
        
        const serviceDataProvided =
            dataToSave.imunisasi?.length ||
            dataToSave.vitaminA ||
            dataToSave.obatCacing === true ||
            dataToSave.sudahPKAT === true ||
            !!dataToSave.pemeriksaanHB ||
            !!dataToSave.catatan_pelayanan ||
            dataToSave.gigi_caries !== undefined ||
            !!dataToSave.lila ||
            !!dataToSave.tfu;

        if (serviceDataProvided) {
            const measurementRecord: Partial<MeasurementRecord> = {
                tanggal_pengukuran: today,
                pemeriksaanHB: dataToSave.pemeriksaanHB,
                kesimpulan_hb: dataToSave.kesimpulan_hb,
                imunisasi: dataToSave.imunisasi,
                vitaminA: dataToSave.vitaminA,
                obatCacing: dataToSave.obatCacing,
                sudahPKAT: dataToSave.sudahPKAT,
                catatan_pelayanan: dataToSave.catatan_pelayanan,
                gigi_caries: dataToSave.gigi_caries,
                lila: dataToSave.lila,
                tfu: dataToSave.tfu,
                djj: dataToSave.djj,
                presentasi: dataToSave.presentasi,
                skriningPHQ2,
                skriningGAD2,
                skriningEPDS,
            };
            dataToSave.riwayatPengukuran = [...(participantToServe.riwayatPengukuran || []), measurementRecord as MeasurementRecord];
        }

        onSave(participantToServe.__backendId, dataToSave);
    };

    const renderMentalHealthScreening = () => {
        if (!participantToServe) return null;
        // Only for non-balita
        if (participantToServe.kategori === 'balita') return null;

        const isBumil = participantToServe.kategori === 'ibu-hamil';

        return (
            <div className="mt-4 border-t pt-4">
                <div className="mb-4">
                    <h4 className="font-semibold text-gray-800">Skrining Kesehatan Jiwa</h4>
                </div>

                {/* Checkbox removed, content always shown */}
                <div className="space-y-6 bg-purple-50 p-4 rounded-lg border border-purple-100">
                    {isBumil ? (
                        // EPDS for Pregnant Women
                        <div>
                            <h5 className="font-bold text-purple-800 mb-2">Edinburgh Postnatal Depression Scale (EPDS)</h5>
                            <p className="text-xs text-gray-600 mb-4">Jawab berdasarkan perasaan Anda selama 7 hari terakhir.</p>
                            <div className="space-y-4">
                                {EPDS_QUESTIONS.map((q, i) => (
                                    <div key={i} className="bg-white p-4 rounded border border-gray-200">
                                        <p className="font-medium text-sm mb-3 text-gray-900">{q}</p>
                                        {/* CHANGE: Use flex-col instead of flex-row for vertical list */}
                                        <div className="flex flex-col gap-2">
                                            {EPDS_OPTIONS_DETAILS[i].map((option) => (
                                                <label key={option.score} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors">
                                                    <input 
                                                        type="radio" 
                                                        name={`epds-${i}`} 
                                                        checked={serviceData.epdsAnswers[i] === option.score} 
                                                        onChange={() => handleMentalScoreChange('epds', i, option.score)}
                                                        className="text-purple-600 focus:ring-purple-500 h-4 w-4"
                                                    />
                                                    {/* CHANGE: Display text and score in parentheses */}
                                                    <span className="text-gray-900 font-medium text-sm">{option.label} <span className="text-gray-400 text-xs">({option.score})</span></span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 p-2 bg-white rounded text-sm font-semibold text-purple-800 border border-purple-200">
                                Interpretasi Sementara: {calculateEPDSScore(serviceData.epdsAnswers).interpretation}
                            </div>
                        </div>
                    ) : (
                        // PHQ-2 & GAD-2 for General
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* PHQ-2 */}
                            <div>
                                <h5 className="font-bold text-purple-800 mb-2">PHQ-2 (Depresi)</h5>
                                <div className="space-y-3">
                                    {PHQ2_QUESTIONS.map((q, i) => (
                                        <div key={i} className="bg-white p-3 rounded border border-gray-200">
                                            <p className="font-medium text-sm mb-2 text-gray-900">{q}</p>
                                            <select 
                                                value={serviceData.phq2Answers[i]} 
                                                onChange={(e) => handleMentalScoreChange('phq2', i, parseInt(e.target.value))}
                                                className="w-full p-2 border rounded text-sm text-gray-900 bg-white"
                                            >
                                                {standardMentalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 p-2 bg-white rounded text-xs font-semibold text-purple-800 border border-purple-200">
                                    Hasil: {calculatePHQ2Score(serviceData.phq2Answers[0], serviceData.phq2Answers[1]).interpretation}
                                </div>
                            </div>

                            {/* GAD-2 */}
                            <div>
                                <h5 className="font-bold text-purple-800 mb-2">GAD-2 (Kecemasan)</h5>
                                <div className="space-y-3">
                                    {GAD2_QUESTIONS.map((q, i) => (
                                        <div key={i} className="bg-white p-3 rounded border border-gray-200">
                                            <p className="font-medium text-sm mb-2 text-gray-900">{q}</p>
                                                <select 
                                                value={serviceData.gad2Answers[i]} 
                                                onChange={(e) => handleMentalScoreChange('gad2', i, parseInt(e.target.value))}
                                                className="w-full p-2 border rounded text-sm text-gray-900 bg-white"
                                            >
                                                {standardMentalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 p-2 bg-white rounded text-xs font-semibold text-purple-800 border border-purple-200">
                                    Hasil: {calculateGAD2Score(serviceData.gad2Answers[0], serviceData.gad2Answers[1]).interpretation}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };
    
    if (!participantToServe) return null;
    const theme = getCategoryTheme(participantToServe.kategori);
    const age = calculateAge(participantToServe.tanggal_lahir);
    const category: Category | null = participantToServe?.kategori || null;
    const isMarried = participantToServe.status_pernikahan === 'Menikah';

    const renderServiceHistory = () => {
        // ... (remains the same)
        const { skriningMerokok, tensi, skriningTBC, pemeriksaanHB, skriningIndera, gds, kolesterol, asamUrat, kb, tingkatKemandirian, imunisasi, vitaminA, obatCacing, asiEksklusif } = participantToServe;
        
        const tbcSymptoms = skriningTBC ? Object.entries(skriningTBC)
            .filter(([, value]) => value)
            .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
            .join(', ') : '';
        
        return (
            <>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InfoItem label="Imunisasi" value={imunisasi?.join(', ')} />
                    <InfoItem label="Vitamin A" value={vitaminA} />
                    <InfoItem label="Obat Cacing" value={obatCacing ? 'Ya' : 'Tidak'} />
                    {asiEksklusif !== undefined && <InfoItem label="ASI Eksklusif" value={asiEksklusif ? 'Ya' : 'Tidak'} />}
                    <InfoItem label="Tensi" value={tensi} />
                    <InfoItem label="Pemeriksaan HB" value={pemeriksaanHB ? `${pemeriksaanHB} g/dL` : null} />
                    <InfoItem label="GDS" value={gds ? `${gds} mg/dL` : null} />
                    <InfoItem label="Kolesterol" value={kolesterol ? `${kolesterol} mg/dL` : null} />
                    <InfoItem label="Asam Urat" value={asamUrat ? `${asamUrat} mg/dL` : null} />
                    {kb && <InfoItem label="Status KB" value={kb} />}
                    {tingkatKemandirian && <InfoItem label="Tingkat Kemandirian" value={tingkatKemandirian} />}
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t mt-4">
                     <InfoItem label="Skrining Merokok">
                        <ul className="text-sm list-disc list-inside">
                            {skriningMerokok?.merokok && <li>Merokok</li>}
                            {skriningMerokok?.terpapar && <li>Terpapar Asap Rokok</li>}
                            {!skriningMerokok?.merokok && !skriningMerokok?.terpapar && <li>-</li>}
                        </ul>
                     </InfoItem>
                     <InfoItem label="Gejala TBC Terdeteksi" value={tbcSymptoms} />
                     <InfoItem label="Skrining Indera">
                        <ul className="text-sm list-disc list-inside">
                            <li>Kanan: {skriningIndera?.penglihatanKanan || '-'}</li>
                            <li>Kiri: {skriningIndera?.penglihatanKiri || '-'}</li>
                            <li>Dengar: {skriningIndera?.pendengaran || '-'}</li>
                        </ul>
                     </InfoItem>
                 </div>
            </>
        )
    }
    // ... (rest of render functions remain the same)
    const renderBalitaServices = () => (
        <div className="space-y-4">
            {ageInMonths >= 6 && ageInMonths < 8 && (
                <div>
                     <h4 className="font-semibold text-gray-800 mb-2">Skrining Perkembangan (PKAT)</h4>
                     <Checkbox name="sudahPKAT" label="Sudah melakukan skrining PKAT?" checked={serviceData.sudahPKAT} onChange={handleSimpleChange} />
                </div>
            )}
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Imunisasi</h4>
                <div className="columns-2 lg:columns-3 gap-x-4">
                    {balitaImmunizations.map(imun => (
                         <label key={imun} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 break-inside-avoid-column mb-2">
                             <input type="checkbox" value={imun} checked={serviceData.imunisasi.includes(imun)} onChange={handleImmunizationChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
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
                            <input type="radio" name="vitaminA" value="Biru" checked={serviceData.vitaminA === 'Biru'} onChange={handleSimpleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm text-gray-900">Vitamin A Biru</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="vitaminA" value="Merah" checked={serviceData.vitaminA === 'Merah'} onChange={handleSimpleChange} className="h-4 w-4 text-red-600 focus:ring-red-500" />
                            <span className="text-sm text-gray-900">Vitamin A Merah</span>
                        </label>
                    </div>
                   <Checkbox name="obatCacing" label="Obat Cacing" checked={serviceData.obatCacing} onChange={handleSimpleChange} />
                   {ageInMonths <= 6 && (
                        <Checkbox name="asiEksklusif" label="ASI Eksklusif" checked={serviceData.asiEksklusif} onChange={handleSimpleChange} />
                   )}
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Skrining TBC</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Checkbox nested name="batuk" label="Batuk terus menerus" checked={serviceData.skriningTBC.batuk} onChange={e => handleNestedChange('skriningTBC', 'batuk', e.target.checked)} />
                    <Checkbox nested name="demam" label="Demam ≥ 2 minggu" checked={serviceData.skriningTBC.demam} onChange={e => handleNestedChange('skriningTBC', 'demam', e.target.checked)} />
                    <Checkbox nested name="beratBadan" label="BB turun/tidak naik" checked={serviceData.skriningTBC.beratBadan} onChange={e => handleNestedChange('skriningTBC', 'beratBadan', e.target.checked)} />
                    <Checkbox nested name="kontak" label="Kontak erat pasien TBC" checked={serviceData.skriningTBC.kontak} onChange={e => handleNestedChange('skriningTBC', 'kontak', e.target.checked)} />
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
    
    const renderAdultServices = () => (
        <div className="space-y-6">
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Skrining Merokok</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2 p-2 bg-gray-100 rounded-lg">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="merokok-status" checked={serviceData.skriningMerokok?.merokok === true} onChange={() => handleNestedChange('skriningMerokok', 'merokok', true)} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm font-medium text-gray-800">Merokok</span>
                        </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="merokok-status" checked={serviceData.skriningMerokok?.merokok === false} onChange={() => handleNestedChange('skriningMerokok', 'merokok', false)} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm font-medium text-gray-800">Tidak Merokok</span>
                        </label>
                    </div>
                    <Checkbox nested name="terpapar" label="Terpapar Asap Rokok" checked={serviceData.skriningMerokok?.terpapar} onChange={e => handleNestedChange('skriningMerokok', 'terpapar', e.target.checked)} />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sistolik (mmHg)</label>
                            <input type="number" name="sistolik" value={serviceData.sistolik} onChange={handleSimpleChange} className={inputStyle} placeholder="120" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Diastolik (mmHg)</label>
                            <input type="number" name="diastolik" value={serviceData.diastolik} onChange={handleSimpleChange} className={inputStyle} placeholder="80" />
                        </div>
                    </div>
                     {conclusions.kesimpulan_tensi && (
                        <div className={`text-sm font-semibold mt-1 ${getStatusColor(conclusions.kesimpulan_tensi)}`}>
                            Kesimpulan: {conclusions.kesimpulan_tensi}
                        </div>
                    )}
                </div>
                {(category === 'ibu-hamil' || category === 'anak-remaja') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pemeriksaan HB</label>
                        <input type="number" step="0.1" name="pemeriksaanHB" value={serviceData.pemeriksaanHB} onChange={handleSimpleChange} className={inputStyle} placeholder="Contoh: 12.5" />
                        {conclusions.kesimpulan_hb && (
                            <div className={`text-sm font-semibold mt-1 ${getStatusColor(conclusions.kesimpulan_hb)}`}>
                                Kesimpulan: {conclusions.kesimpulan_hb}
                            </div>
                        )}
                    </div>
                )}
            </div>

            { category === 'ibu-hamil' && (
                 <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Pemeriksaan Kehamilan</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">TFU (cm)</label>
                            <input type="number" step="1" name="tfu" value={serviceData.tfu} onChange={handleSimpleChange} className={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">DJJ (bpm)</label>
                            <input type="number" step="1" name="djj" value={serviceData.djj} onChange={handleSimpleChange} className={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Presentasi Janin</label>
                            <select name="presentasi" value={serviceData.presentasi} onChange={handleSimpleChange} className={inputStyle}>
                                <option value="">Pilih...</option>
                                <option value="Kepala">Kepala</option>
                                <option value="Sungsang">Sungsang</option>
                                <option value="Lintang">Lintang</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            { (category === 'anak-remaja' || age >= 15) && (
                <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Pemeriksaan Lab Sederhana</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">GDS (mg/dL)</label>
                            <input type="number" step="1" name="gds" value={serviceData.gds} onChange={handleSimpleChange} className={inputStyle} />
                            {conclusions.kesimpulan_gds && <p className={`text-xs font-semibold mt-1 ${getStatusColor(conclusions.kesimpulan_gds)}`}>{conclusions.kesimpulan_gds}</p>}
                        </div>
                        { age >= 15 && <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kolesterol (mg/dL)</label>
                            <input type="number" step="1" name="kolesterol" value={serviceData.kolesterol} onChange={handleSimpleChange} className={inputStyle} />
                             {conclusions.kesimpulan_kolesterol && <p className={`text-xs font-semibold mt-1 ${getStatusColor(conclusions.kesimpulan_kolesterol)}`}>{conclusions.kesimpulan_kolesterol}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Asam Urat (mg/dL)</label>
                            <input type="number" step="0.1" name="asamUrat" value={serviceData.asamUrat} onChange={handleSimpleChange} className={inputStyle} />
                            {conclusions.kesimpulan_asam_urat && <p className={`text-xs font-semibold mt-1 ${getStatusColor(conclusions.kesimpulan_asam_urat)}`}>{conclusions.kesimpulan_asam_urat}</p>}
                        </div>
                        </>}
                    </div>
                </div>
            )}
             {category === 'anak-remaja' && (
                 <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Skrining Kesehatan Gigi</h4>
                    <Checkbox name="gigi_caries" label="Gigi Caries (berlubang/rusak)" checked={serviceData.gigi_caries} onChange={handleSimpleChange} />
                </div>
            )}

            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Skrining TBC</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Checkbox nested name="batuk" label="Batuk terus menerus" checked={serviceData.skriningTBC?.batuk} onChange={e => handleNestedChange('skriningTBC', 'batuk', e.target.checked)} />
                    <Checkbox nested name="demam" label="Demam ≥ 2 minggu" checked={serviceData.skriningTBC?.demam} onChange={e => handleNestedChange('skriningTBC', 'demam', e.target.checked)} />
                    <Checkbox nested name="beratBadan" label="BB turun/tidak naik" checked={serviceData.skriningTBC?.beratBadan} onChange={e => handleNestedChange('skriningTBC', 'beratBadan', e.target.checked)} />
                    <Checkbox nested name="kontak" label="Kontak erat pasien TBC" checked={serviceData.skriningTBC?.kontak} onChange={e => handleNestedChange('skriningTBC', 'kontak', e.target.checked)} />
                </div>
                 {tbcSymptomCount >= 2 && (
                    <div className="mt-3 bg-red-100 border-l-4 border-red-500 text-red-800 p-3 rounded-r-lg" role="alert">
                        <p className="font-bold">Perhatian!</p>
                        <p className="text-sm">Ditemukan 2 atau lebih gejala TBC. Segera rujuk peserta ke Puskesmas untuk pemeriksaan lebih lanjut.</p>
                    </div>
                )}
            </div>
            
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Skrining Indera</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Penglihatan (Kanan)</label>
                        <select name="penglihatanKanan" value={serviceData.skriningIndera?.penglihatanKanan} onChange={e => handleNestedChange('skriningIndera', 'penglihatanKanan', e.target.value)} className={inputStyle}>
                            <option value="">Pilih...</option><option value="Normal">Normal</option><option value="Gangguan">Gangguan</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Penglihatan (Kiri)</label>
                        <select name="penglihatanKiri" value={serviceData.skriningIndera?.penglihatanKiri} onChange={e => handleNestedChange('skriningIndera', 'penglihatanKiri', e.target.value)} className={inputStyle}>
                            <option value="">Pilih...</option><option value="Normal">Normal</option><option value="Gangguan">Gangguan</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Pendengaran</label>
                        <select name="pendengaran" value={serviceData.skriningIndera?.pendengaran} onChange={e => handleNestedChange('skriningIndera', 'pendengaran', e.target.value)} className={inputStyle}>
                            <option value="">Pilih...</option><option value="Normal">Normal</option><option value="Gangguan">Gangguan</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 items-end mt-4">
                {age >= 18 && age <= 59 && isMarried && category !== 'ibu-hamil' && (
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-sm font-medium text-gray-700">Status KB</label>
                        <select name="kb" value={serviceData.kb} onChange={handleSimpleChange} className={inputStyle}>
                            <option value="">Pilih...</option>
                            {kbOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                )}
                {age >= 60 && (
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700">
                            Tingkat Kemandirian {age >= 60 && <span className="text-red-500">*</span>}
                        </label>
                        <select 
                            name="tingkatKemandirian" 
                            value={serviceData.tingkatKemandirian} 
                            onChange={handleSimpleChange} 
                            className={inputStyle}
                            required={age >= 60}
                        >
                            <option value="">Pilih...</option>
                            <option value="A">A (Mandiri)</option>
                            <option value="B">B (Bantuan Sebagian)</option>
                            <option value="C">C (Ketergantungan Penuh)</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Mental Health Screening */}
             {participantToServe.kategori !== 'balita' && (
                <div className="mt-4 border-t pt-4">
                    <div className="mb-4">
                        <h4 className="font-semibold text-gray-800">Skrining Kesehatan Jiwa</h4>
                    </div>
                    
                    <div className="space-y-6 bg-purple-50 p-4 rounded-lg border border-purple-100">
                         {participantToServe.kategori === 'ibu-hamil' ? (
                            <div>
                                <h5 className="font-bold text-purple-800 mb-2">Edinburgh Postnatal Depression Scale (EPDS)</h5>
                                <p className="text-xs text-gray-600 mb-4">Jawab berdasarkan perasaan Anda selama 7 hari terakhir.</p>
                                <div className="space-y-4">
                                    {EPDS_QUESTIONS.map((q, i) => (
                                    <div key={i} className="bg-white p-4 rounded border border-gray-200">
                                        <p className="font-medium text-sm mb-3 text-gray-900">{q}</p>
                                        {/* CHANGE: Use flex-col instead of flex-row for vertical list */}
                                        <div className="flex flex-col gap-2">
                                            {EPDS_OPTIONS_DETAILS[i].map((option) => (
                                                <label key={option.score} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors">
                                                    <input 
                                                        type="radio" 
                                                        name={`epds-${i}`} 
                                                        checked={serviceData.epdsAnswers[i] === option.score} 
                                                        onChange={() => handleMentalScoreChange('epds', i, option.score)}
                                                        className="text-purple-600 focus:ring-purple-500 h-4 w-4"
                                                    />
                                                    {/* CHANGE: Display text and score in parentheses */}
                                                    <span className="text-gray-900 font-medium text-sm">{option.label} <span className="text-gray-400 text-xs">({option.score})</span></span>
                                                </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 p-2 bg-white rounded text-sm font-semibold text-purple-800 border border-purple-200">
                                    Interpretasi Sementara: {calculateEPDSScore(serviceData.epdsAnswers).interpretation}
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
                                                <select value={serviceData.phq2Answers[i]} onChange={(e) => handleMentalScoreChange('phq2', i, parseInt(e.target.value))} className="w-full p-2 border rounded text-sm text-gray-900 bg-white">
                                                    {standardMentalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 p-2 bg-white rounded text-xs font-semibold text-purple-800 border border-purple-200">
                                        Hasil: {calculatePHQ2Score(serviceData.phq2Answers[0], serviceData.phq2Answers[1]).interpretation}
                                    </div>
                                </div>
                                <div>
                                    <h5 className="font-bold text-purple-800 mb-2">GAD-2 (Kecemasan)</h5>
                                    <div className="space-y-3">
                                        {GAD2_QUESTIONS.map((q, i) => (
                                            <div key={i} className="bg-white p-3 rounded border border-gray-200">
                                                <p className="font-medium text-sm mb-2 text-gray-900">{q}</p>
                                                <select value={serviceData.gad2Answers[i]} onChange={(e) => handleMentalScoreChange('gad2', i, parseInt(e.target.value))} className="w-full p-2 border rounded text-sm text-gray-900 bg-white">
                                                    {standardMentalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 p-2 bg-white rounded text-xs font-semibold text-purple-800 border border-purple-200">
                                        Hasil: {calculateGAD2Score(serviceData.gad2Answers[0], serviceData.gad2Answers[1]).interpretation}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pemberian Pelayanan" maxWidth="max-w-3xl">
            {/* ... rest of modal content */}
             <div className={`${theme.bg} border ${theme.border} rounded-lg p-4 mb-6`}>
                <h4 className={`font-semibold ${theme.text} mb-3 flex items-center`}>👤 <span className="ml-2">Informasi Peserta</span></h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-black">
                    <div><span className="font-medium">Nama:</span> <span className="ml-2 font-semibold">{participantToServe.nama}</span></div>
                    <div><span className="font-medium">NIK:</span> <span className="ml-2 font-mono">{participantToServe.nik}</span></div>
                    <div><span className="font-medium">Usia:</span> <span className="ml-2 font-semibold">{formatDetailedAge(participantToServe.tanggal_lahir)}</span></div>
                    <div>
                      <span className="font-medium">Kategori:</span> 
                      <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${theme.badge}`}>{getCategoryLabel(participantToServe.kategori)}</span>
                    </div>
                </div>
            </div>

            {participantToServe.tanggal_pelayanan && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <h5 className="font-semibold text-yellow-800 mb-3">Riwayat Pelayanan Terakhir</h5>
                    <p className="text-xs text-gray-500 mb-3">Tanggal: {formatDate(participantToServe.tanggal_pelayanan)}</p>
                    {renderServiceHistory()}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {age <= 5 && category === 'balita' ? renderBalitaServices() : renderAdultServices()}
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Catatan Tambahan Pelayanan</label>
                    <textarea name="catatan_pelayanan" value={serviceData.catatan_pelayanan} onChange={handleSimpleChange} rows={2} className={inputStyle}></textarea>
                </div>
                
                <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                    <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Batal</button>
                    <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Simpan Pelayanan</button>
                </div>
            </form>
        </Modal>
    );
};