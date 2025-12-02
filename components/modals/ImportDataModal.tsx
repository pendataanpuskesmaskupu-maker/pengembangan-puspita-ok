import React, { useState } from 'react';
import { Modal } from './Modal';
import type { Participant, Desa } from '../../types';
import { determineCategory, getCategoryLabel, normalizeDateString, getCategoryTheme } from '../../utils/helpers';
import { useToast } from '../../contexts/ToastContext';

interface ImportDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (participants: Omit<Participant, '__backendId' | 'createdAt'>[]) => void;
    existingNiks: string[];
}

type PreviewData = Omit<Participant, '__backendId' | 'createdAt'> & {
    isValid: boolean;
    errors: string[];
};

export const ImportDataModal: React.FC<ImportDataModalProps> = ({ isOpen, onClose, onImport, existingNiks }) => {
    const [step, setStep] = useState(1);
    const [url, setUrl] = useState('');
    const [previewData, setPreviewData] = useState<PreviewData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const handleClose = () => {
        setStep(1);
        setUrl('');
        setPreviewData([]);
        onClose();
    };

    const handlePreview = async () => {
        if (!url) {
            addToast('Masukkan URL Google Sheets.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const sheetIdMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
            if (!sheetIdMatch) throw new Error("URL tidak valid. Pastikan formatnya benar.");
            
            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetIdMatch[1]}/export?format=csv`;
            const response = await fetch(csvUrl);
            if (!response.ok) throw new Error("Gagal mengambil data. Pastikan link dapat diakses oleh siapa saja.");
            
            const text = await response.text();
            const rows = text.split('\n').slice(1);
            
            const data = rows.map(row => {
                const [
                    nama, nik, tanggal_lahir_raw, jenis_kelamin_raw, alamat, rt, rw,
                    nama_posyandu, no_telepon, nama_ibu, nik_ibu, anak_ke,
                    berat_lahir_raw, panjang_lahir_raw
                ] = row.split(',').map(s => s.trim().replace(/\r/g, ""));
                
                const errors: string[] = [];

                let jenis_kelamin: 'Laki-laki' | 'Perempuan' = 'Laki-laki';
                const jkUpper = jenis_kelamin_raw?.toUpperCase();
                if (jkUpper?.startsWith('P')) {
                    jenis_kelamin = 'Perempuan';
                } else if (jkUpper && !jkUpper.startsWith('L')) {
                    errors.push("Jenis Kelamin tidak valid (gunakan L/P)");
                }

                const tanggal_lahir = normalizeDateString(tanggal_lahir_raw);
                if (!tanggal_lahir) errors.push("Tgl Lahir tidak valid");
                
                if (!nama) errors.push("Nama kosong");
                if (!nik || !/^\d{16}$/.test(nik)) errors.push("NIK tidak valid");
                if (existingNiks.includes(nik)) errors.push("NIK sudah ada");
                if (!alamat) errors.push("Alamat (Desa) kosong");
                if (!rt) errors.push("RT kosong");
                if (!rw) errors.push("RW kosong");

                const berat_lahir = berat_lahir_raw ? parseFloat(berat_lahir_raw) : undefined;
                if (berat_lahir_raw && isNaN(berat_lahir!)) errors.push("Berat Lahir tidak valid");

                const panjang_lahir = panjang_lahir_raw ? parseFloat(panjang_lahir_raw) : undefined;
                if (panjang_lahir_raw && isNaN(panjang_lahir!)) errors.push("Panjang Lahir tidak valid");
                
                const participant: PreviewData = {
                    nama, nik, tanggal_lahir: tanggal_lahir || '', jenis_kelamin, 
                    alamat: alamat as Desa, rt, rw,
                    kategori: determineCategory(tanggal_lahir || ''),
                    nama_posyandu: nama_posyandu || undefined,
                    no_telepon: no_telepon || undefined,
                    nama_ibu: nama_ibu || undefined,
                    nik_ibu: nik_ibu || undefined,
                    anak_ke: anak_ke || undefined,
                    berat_lahir,
                    panjang_lahir,
                    riwayatPengukuran: [],
                    riwayatKunjunganRumah: [],
                    isValid: errors.length === 0,
                    errors
                };
                return participant;
            }).filter(p => p.nama && p.nik);

            setPreviewData(data);
            setStep(2);
            addToast(`Pratinjau data berhasil. Ditemukan ${data.length} baris.`, 'info');

        } catch (error: any) {
            addToast(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirmImport = () => {
        const validData = previewData.filter(p => p.isValid);
        onImport(validData);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Import Data dari Google Sheets" maxWidth="max-w-4xl">
            {step === 1 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Link Google Sheets</label>
                    <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="mt-1 w-full border border-gray-300 p-2 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 shadow-sm" placeholder="https://docs.google.com/spreadsheets/d/..."/>
                    <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-3 rounded-lg">
                        <p className="font-semibold mb-1">Pastikan urutan kolom sesuai:</p>
                        <ol className="list-decimal list-inside">
                            <li>Nama</li>
                            <li>NIK (16 digit)</li>
                            <li>Tgl Lahir (DD/MM/YYYY atau YYYY-MM-DD)</li>
                            <li>Jenis Kelamin (L/P)</li>
                            <li>Alamat (Nama Desa)</li>
                            <li>RT</li>
                            <li>RW</li>
                            <li>Nama Posyandu (Opsional)</li>
                            <li>No Telepon (Opsional)</li>
                            <li>Nama Ibu (Opsional)</li>
                            <li>NIK Ibu (Opsional)</li>
                            <li>Anak Ke (Opsional)</li>
                            <li>Berat Lahir (kg) (Opsional)</li>
                            <li>Panjang Lahir (cm) (Opsional)</li>
                        </ol>
                    </div>
                    <div className="flex justify-end gap-4 mt-4">
                        <button onClick={handlePreview} disabled={isLoading} className="px-4 py-2 bg-blue-500 text-white rounded-md">{isLoading ? 'Memuat...' : 'Pratinjau'}</button>
                    </div>
                </div>
            )}
            {step === 2 && (
                <div>
                    <div className="overflow-x-auto max-h-[50vh]">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="p-2 text-left font-semibold text-gray-700">Status</th>
                                    <th className="p-2 text-left font-semibold text-gray-700">Nama</th>
                                    <th className="p-2 text-left font-semibold text-gray-700">NIK</th>
                                    <th className="p-2 text-left font-semibold text-gray-700">Kategori</th>
                                    <th className="p-2 text-left font-semibold text-gray-700">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((p, i) => (
                                    <tr key={i} className="bg-white border-b last:border-b-0">
                                        <td className="p-2 text-black">{p.isValid ? '✅' : '❌'}</td>
                                        <td className="p-2 text-black">{p.nama}</td>
                                        <td className="p-2 text-black">{p.nik}</td>
                                        <td className="p-2 text-black"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getCategoryTheme(p.kategori).badge}`}>{getCategoryLabel(p.kategori)}</span></td>
                                        <td className="p-2 text-red-600 text-xs">{p.errors.join(', ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="flex justify-end gap-4 mt-4">
                        <button type="button" onClick={() => setStep(1)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Kembali</button>
                        <button onClick={handleConfirmImport} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Import Data Valid</button>
                    </div>
                </div>
            )}
        </Modal>
    );
};