import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import type { Participant } from '../../types';
import { getCategoryLabel, getCategoryTheme, formatDetailedAge, calculateAge, calculateBalitaStatus, calculateBMIStatus, calculateLansiaStatus, calculateIbuHamilStatus, calculateWeightGainStatus, calculateRemajaStatus, getStatusColor } from '../../utils/helpers';

interface MeasurementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (participantId: string, measurementData: Partial<Participant>) => void;
    participantToMeasure: Participant | null;
}

interface WeightGainStatus {
    status: 'Naik' | 'Tidak Naik' | 'Baru Ditimbang' | 'O';
    diff: number | null;
}

const initialState = {
    berat_badan: '',
    tinggi_badan: '',
    lingkar_kepala: '',
    lila: '',
    lingkar_perut: '',
    catatan_pengukuran: ''
};

const inputStyle = "mt-1 w-full border border-gray-300 p-2 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 shadow-sm";

export const MeasurementModal: React.FC<MeasurementModalProps> = ({ isOpen, onClose, onSave, participantToMeasure }) => {
    const [measurements, setMeasurements] = useState(initialState);
    const [statusKesimpulan, setStatusKesimpulan] = useState<Record<string, {value: string; color: string}>>({});
    const [weightGainStatus, setWeightGainStatus] = useState<WeightGainStatus | null>(null);

    useEffect(() => {
        if (isOpen && participantToMeasure) {
            const currentMonth = new Date().toISOString().slice(0, 7); // Format "YYYY-MM"
            
            const measurementThisMonth = participantToMeasure.riwayatPengukuran
                .find(record => record.tanggal_pengukuran.startsWith(currentMonth));

            if (measurementThisMonth) {
                setMeasurements({
                    berat_badan: measurementThisMonth.berat_badan?.toString() || '',
                    tinggi_badan: measurementThisMonth.tinggi_badan?.toString() || '',
                    lingkar_kepala: measurementThisMonth.lingkar_kepala?.toString() || '',
                    lila: measurementThisMonth.lila?.toString() || '',
                    lingkar_perut: measurementThisMonth.lingkar_perut?.toString() || '',
                    catatan_pengukuran: measurementThisMonth.catatan_pengukuran || '',
                });
            } else {
                setMeasurements(initialState);
            }
        } else {
            setMeasurements(initialState);
            setStatusKesimpulan({});
            setWeightGainStatus(null);
        }
    }, [participantToMeasure, isOpen]);

    useEffect(() => {
        if (!participantToMeasure) return;

        const berat = parseFloat(measurements.berat_badan);
        const tinggi = parseFloat(measurements.tinggi_badan);
        const lila = parseFloat(measurements.lila);
        const { kategori, tanggal_lahir, jenis_kelamin, riwayatPengukuran } = participantToMeasure;

        let newStatus: Record<string, {value: string; color: string}> = {};

        switch (kategori) {
            case 'ibu-hamil':
                const ibuHamilStatus = lila > 0 ? calculateIbuHamilStatus(lila) : {};
                const bmiStatus = (berat > 0 && tinggi > 0) ? calculateBMIStatus(berat, tinggi) : {};
                newStatus = { ...ibuHamilStatus, ...bmiStatus };
                break;
            case 'balita':
                if (berat > 0 && tinggi > 0) {
                    newStatus = calculateBalitaStatus(berat, tinggi, tanggal_lahir, jenis_kelamin);
                }
                break;
            case 'anak-remaja':
                 if (berat > 0 && tinggi > 0) {
                    newStatus = calculateRemajaStatus(berat, tinggi);
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
            default:
                newStatus = {};
        }
        setStatusKesimpulan(newStatus);
        
        if (kategori === 'balita' && berat > 0) {
            const currentDate = new Date().toISOString().split('T')[0];
            const gainStatus = calculateWeightGainStatus(
                berat,
                currentDate,
                tanggal_lahir,
                riwayatPengukuran
            );
            setWeightGainStatus(gainStatus);
        } else {
            setWeightGainStatus(null);
        }

    }, [measurements.berat_badan, measurements.tinggi_badan, measurements.lila, participantToMeasure]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setMeasurements(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!participantToMeasure) return;
        
        const dataToSave: Partial<Participant> = {
            berat_badan: parseFloat(measurements.berat_badan) || undefined,
            tinggi_badan: parseFloat(measurements.tinggi_badan) || undefined,
            lingkar_kepala: parseFloat(measurements.lingkar_kepala) || undefined,
            lila: parseFloat(measurements.lila) || undefined,
            lingkar_perut: parseFloat(measurements.lingkar_perut) || undefined,
            catatan_pengukuran: measurements.catatan_pengukuran || undefined,
            tanggal_pengukuran: new Date().toISOString(),
            status_bb_tb: (statusKesimpulan['BB/TB'] || statusKesimpulan['BB/PB'])?.value,
            status_bb_u: statusKesimpulan['BB/U']?.value,
            status_tb_u: (statusKesimpulan['TB/U'] || statusKesimpulan['PB/U'])?.value,
            status_bmi: statusKesimpulan['BMI']?.value,
            status_kategori_bmi: statusKesimpulan['Kategori']?.value,
            status_lila: statusKesimpulan['Status LILA']?.value,
            status_kenaikan_berat: weightGainStatus?.status,
        };

        onSave(participantToMeasure.__backendId, dataToSave);
    };

    const renderFormFields = () => {
        if (!participantToMeasure) return null;
        
        const commonFields = (
            <>
                <div><label className="block text-sm font-medium text-gray-700">Berat Badan (kg) <span className="text-red-500">*</span></label><input type="number" step="0.1" name="berat_badan" value={measurements.berat_badan} onChange={handleChange} required className={inputStyle} /></div>
                <div><label className="block text-sm font-medium text-gray-700">Tinggi Badan (cm) <span className="text-red-500">*</span></label><input type="number" step="0.1" name="tinggi_badan" value={measurements.tinggi_badan} onChange={handleChange} required className={inputStyle} /></div>
            </>
        );

        switch (participantToMeasure.kategori) {
            case 'ibu-hamil':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {commonFields}
                        <div><label className="block text-sm font-medium text-gray-700">LILA (cm)</label><input type="number" step="0.1" name="lila" value={measurements.lila} onChange={handleChange} className={inputStyle} /></div>
                    </div>
                );
            case 'balita':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {commonFields}
                        <div><label className="block text-sm font-medium text-gray-700">Lingkar Kepala (cm)</label><input type="number" step="0.1" name="lingkar_kepala" value={measurements.lingkar_kepala} onChange={handleChange} className={inputStyle} /></div>
                        <div><label className="block text-sm font-medium text-gray-700">LILA (cm)</label><input type="number" step="0.1" name="lila" value={measurements.lila} onChange={handleChange} className={inputStyle} /></div>
                    </div>
                );
            case 'anak-remaja':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {commonFields}
                        <div><label className="block text-sm font-medium text-gray-700">Lingkar Perut (cm)</label><input type="number" step="0.1" name="lingkar_perut" value={measurements.lingkar_perut} onChange={handleChange} className={inputStyle} /></div>
                        <div><label className="block text-sm font-medium text-gray-700">LILA (cm)</label><input type="number" step="0.1" name="lila" value={measurements.lila} onChange={handleChange} className={inputStyle} /></div>
                    </div>
                );
            case 'dewasa':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {commonFields}
                        <div><label className="block text-sm font-medium text-gray-700">Lingkar Perut (cm)</label><input type="number" step="0.1" name="lingkar_perut" value={measurements.lingkar_perut} onChange={handleChange} className={inputStyle} /></div>
                    </div>
                );
            case 'lansia':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {commonFields}
                        <div><label className="block text-sm font-medium text-gray-700">Lingkar Perut (cm)</label><input type="number" step="0.1" name="lingkar_perut" value={measurements.lingkar_perut} onChange={handleChange} className={inputStyle} /></div>
                        <div><label className="block text-sm font-medium text-gray-700">LILA (cm)</label><input type="number" step="0.1" name="lila" value={measurements.lila} onChange={handleChange} className={inputStyle} /></div>
                    </div>
               );
            default:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {commonFields}
                    </div>
                );
        }
    }

    if (!participantToMeasure) return null;
    const theme = getCategoryTheme(participantToMeasure.kategori);
    const age = calculateAge(participantToMeasure.tanggal_lahir);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pengukuran Antropometri" maxWidth="max-w-3xl">
            <div className={`${theme.bg} border ${theme.border} rounded-lg p-4 mb-6`}>
                <h4 className={`font-semibold ${theme.text} mb-3 flex items-center`}>👤 <span className="ml-2">Informasi Peserta</span></h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-black">
                    <div><span className="font-medium">Nama:</span> <span className="ml-2 font-semibold">{participantToMeasure.nama}</span></div>
                    <div><span className="font-medium">NIK:</span> <span className="ml-2 font-mono">{participantToMeasure.nik}</span></div>
                    <div><span className="font-medium">Usia:</span> <span className="ml-2 font-semibold">{formatDetailedAge(participantToMeasure.tanggal_lahir)} ({age} tahun)</span></div>
                    <div>
                      <span className="font-medium">Kategori:</span> 
                      <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${theme.badge}`}>{getCategoryLabel(participantToMeasure.kategori)}</span>
                    </div>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Hasil Pengukuran</h4>
                    {renderFormFields()}
                </div>
                
                {(Object.keys(statusKesimpulan).length > 0 || weightGainStatus) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center">📊 <span className="ml-2">Kesimpulan Status Gizi & Pertumbuhan</span></h4>
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
                            {weightGainStatus && (
                                <div className="bg-white p-3 rounded border text-center">
                                    <div className="text-gray-600 font-medium mb-1">Kenaikan Berat</div>
                                    <div className={`font-bold text-lg ${
                                        weightGainStatus.status === 'Naik' ? 'text-green-600' :
                                        weightGainStatus.status === 'Tidak Naik' ? 'text-red-600' : 
                                        weightGainStatus.status === 'O' ? 'text-orange-600' : 'text-blue-600'
                                    }`}>
                                        {weightGainStatus.status === 'O' ? 'Tidak Ditimbang Bulan Lalu (O)' : weightGainStatus.status}
                                    </div>
                                    {weightGainStatus.diff !== null && (
                                        <div className="text-xs text-gray-500">
                                            ({weightGainStatus.diff >= 0 ? '+' : ''}{weightGainStatus.diff} gr)
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                 <div>
                    <label className="block text-sm font-medium text-gray-700">Catatan Tambahan</label>
                    <textarea name="catatan_pengukuran" value={measurements.catatan_pengukuran} onChange={handleChange} rows={2} className={inputStyle}></textarea>
                </div>
                 <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Batal</button>
                    <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Simpan Hasil</button>
                </div>
            </form>
        </Modal>
    );
};