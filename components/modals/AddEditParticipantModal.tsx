import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal } from './Modal';
import type { Participant, Desa } from '../../types';
import { determineCategory, calculateAge, getCategoryLabel } from '../../utils/helpers';
import { useToast } from '../../contexts/ToastContext';

interface AddEditParticipantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (participant: Omit<Participant, '__backendId' | 'createdAt'>, id?: string) => Promise<boolean>;
    participantToEdit: Participant | null;
    existingNiks: string[];
    userDesa: string | null;
    posyanduSession: string | null;
    initialRegistrationQueue?: Partial<Participant>[];
}

const desaOptions: Desa[] = ['Kupu', 'Ketanggungan', 'Lawatan', 'Pengarasan', 'Sidakaton', 'Sidapurna', 'Dukuhturi'];
const riwayatPenyakitOrtuOptions = ['Diabetes', 'Hipertensi', 'Penyakit Jantung', 'Stroke', 'Kanker', 'Thalasemia (Transfusi Darah)'];
const riwayatPenyakitIndividuOptions = ['Diabetes', 'Hipertensi', 'Penyakit Jantung', 'Stroke', 'Asma', 'Kanker', 'Cholesterol tinggi', 'PPOK', 'Thalasemia (Transfusi Darah)', 'Lupus', 'Gangguan Penglihatan', 'Katarak', 'Gangguan Pendengaran', 'Gangguan Mental', 'Gangguan Emosional'];

const posyanduOptionsByDesa: Record<Desa, string[]> = {
    'Kupu': ['Saadiyah 1', 'Saadiyah 2', 'Saadiyah 3', 'Saadiyah 4'],
    'Ketanggungan': ['Jaya Sakti 1', 'Jaya Sakti 2', 'Jaya Sakti 3', 'Jaya Sakti 4'],
    'Pengarasan': ['Santika', 'Santoso', 'Nusa Indah', 'Kartika'],
    'Lawatan': ['Fajar 1', 'Fajar 2', 'Fajar 3', 'Fajar 4'],
    'Sidakaton': ['Sida Makmur', 'Sida Sehat', 'Sida Mukti', 'Sida Maju', 'Sampang', 'Sidarukun', 'Mekarmulya', 'Sidamulya 1', 'Sidamulya 2'],
    'Sidapurna': ['Sida Maju 1', 'Sida Maju 2', 'Sida Maju 3', 'Sida Maju 4', 'Sida Maju 5'],
    'Dukuhturi': ['Warga Sehat', 'Warga Sejahtera', 'Warga Mulya', 'Warga Jaya', 'Sida Maju 6', 'Sida Maju 7']
};

const initialState: Partial<Participant> = {
    nama: '',
    nik: '',
    tanggal_lahir: '',
    jenis_kelamin: 'Laki-laki',
    alamat: undefined,
    rt: '',
    rw: '',
    nama_posyandu: '',
    no_telepon: '',
    status_hamil: false,
    anak_ke: '',
    berat_lahir: undefined,
    panjang_lahir: undefined,
    nama_ibu: '',
    nik_ibu: '',
    status_pernikahan: undefined,
    riwayat_penyakit_ortu: [],
    riwayat_penyakit_individu: [],
};

const inputStyle = "mt-1 w-full border border-gray-300 p-2 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 shadow-sm";

const CheckboxGroup: React.FC<{ title: string; options: string[]; selected: string[]; name: keyof Participant; onChange: (name: keyof Participant, value: string) => void; }> = ({ title, options, selected, name, onChange }) => (
    <div>
        <h4 className="font-semibold text-gray-800 border-b pb-2 mb-3">{title}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {options.map(option => (
                <label key={option} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 cursor-pointer">
                    <input
                        type="checkbox"
                        value={option}
                        checked={selected.includes(option)}
                        onChange={() => onChange(name, option)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                </label>
            ))}
        </div>
    </div>
);


export const AddEditParticipantModal: React.FC<AddEditParticipantModalProps> = ({ isOpen, onClose, onSave, participantToEdit, existingNiks, userDesa, posyanduSession, initialRegistrationQueue = [] }) => {
    const [participant, setParticipant] = useState<Partial<Participant>>(initialState);
    const [nikError, setNikError] = useState('');
    const [registrationQueue, setRegistrationQueue] = useState<Partial<Participant>[]>([]);
    const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
    const modalContentRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();

    const getInitialState = useCallback(() => {
        const initial = { ...initialState };
        if (userDesa && userDesa !== 'Semua') {
            initial.alamat = userDesa as Desa;
        }
        if (posyanduSession) {
            initial.nama_posyandu = posyanduSession;
        }
        return initial;
    }, [userDesa, posyanduSession]);
    
    useEffect(() => {
        if (isOpen) {
            if (initialRegistrationQueue.length > 0) {
                setRegistrationQueue(initialRegistrationQueue);
                setCurrentQueueIndex(0);
            } else if (participantToEdit) {
                setParticipant({
                    ...participantToEdit,
                    riwayat_penyakit_ortu: participantToEdit.riwayat_penyakit_ortu || [],
                    riwayat_penyakit_individu: participantToEdit.riwayat_penyakit_individu || [],
                });
            } else {
                setParticipant(getInitialState());
            }
        } else {
            setParticipant(getInitialState());
            setNikError('');
            setRegistrationQueue([]);
            setCurrentQueueIndex(0);
        }
    }, [isOpen, participantToEdit, initialRegistrationQueue, getInitialState]);

    useEffect(() => {
        if (isOpen && registrationQueue.length > 0 && currentQueueIndex < registrationQueue.length) {
            const currentPerson = registrationQueue[currentQueueIndex];
            const baseState = getInitialState();
            setParticipant({ ...baseState, ...currentPerson });
            setNikError('');

            setTimeout(() => {
                modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        }
    }, [registrationQueue, currentQueueIndex, isOpen, getInitialState]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        const updatedParticipant = { ...participant };

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            (updatedParticipant as any)[name] = checked;
        } else if (name === 'nama') {
            (updatedParticipant as any)[name] = value.toUpperCase();
        } else {
            (updatedParticipant as any)[name] = value;
        }

        if (name === 'alamat') {
            updatedParticipant.nama_posyandu = '';
        }

        if (['tanggal_lahir', 'jenis_kelamin', 'status_pernikahan'].includes(name)) {
            const age = updatedParticipant.tanggal_lahir ? calculateAge(updatedParticipant.tanggal_lahir) : 0;
            const canBePregnant = age >= 18 && updatedParticipant.jenis_kelamin === 'Perempuan' && updatedParticipant.status_pernikahan === 'Menikah';
            if (!canBePregnant) {
                updatedParticipant.status_hamil = false;
            }
        }
        
        setParticipant(updatedParticipant);

        if (name === 'nik') {
            validateNik(value);
        }
    };
    
    const handleCheckboxGroupChange = (name: keyof Participant, value: string) => {
        setParticipant(prev => {
            const currentValues = (prev[name] as string[] || []);
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [name]: newValues };
        });
    };
    
    const validateNik = (nik: string) => {
        if (!nik) {
            setNikError('NIK tidak boleh kosong.');
            return false;
        }
        if (nik.length !== 16 || !/^\d{16}$/.test(nik)) {
            setNikError('NIK harus 16 digit angka.');
            return false;
        }
        const isDuplicate = existingNiks.some(existingNik => existingNik === nik && nik !== participantToEdit?.nik);
        if (isDuplicate) {
            setNikError('NIK sudah terdaftar.');
            addToast(`NIK ${nik} sudah terdaftar.`, 'error');
            return false;
        }
        setNikError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateNik(participant.nik || '')) return;

        const category = determineCategory(participant.tanggal_lahir!, participant.status_hamil);
        
        const finalParticipant: Omit<Participant, '__backendId' | 'createdAt'> = {
            nama: participant.nama!,
            nik: participant.nik!,
            tanggal_lahir: participant.tanggal_lahir!,
            jenis_kelamin: participant.jenis_kelamin!,
            alamat: participant.alamat!,
            rt: participant.rt!,
            rw: participant.rw!,
            kategori: category,
            nama_posyandu: participant.nama_posyandu,
            no_telepon: participant.no_telepon,
            anak_ke: participant.anak_ke,
            berat_lahir: participant.berat_lahir ? parseFloat(participant.berat_lahir as any) : undefined,
            panjang_lahir: participant.panjang_lahir ? parseFloat(participant.panjang_lahir as any) : undefined,
            nama_ibu: participant.nama_ibu,
            nik_ibu: participant.nik_ibu,
            status_pernikahan: participant.status_pernikahan,
            status_hamil: participant.status_hamil,
            riwayat_penyakit_ortu: participant.riwayat_penyakit_ortu,
            riwayat_penyakit_individu: participant.riwayat_penyakit_individu,
            riwayatPengukuran: participant.riwayatPengukuran || [],
            riwayatKunjunganRumah: participant.riwayatKunjunganRumah || [],
        };
        const success = await onSave(finalParticipant, participantToEdit?.__backendId);

        if (success) {
            if (registrationQueue.length > 0) {
                const nextIndex = currentQueueIndex + 1;
                if (nextIndex < registrationQueue.length) {
                    setCurrentQueueIndex(nextIndex);
                } else {
                    onClose();
                }
            } else {
                onClose();
            }
        }
    };

    const getModalTitle = () => {
        if (participantToEdit) return 'Edit Data Peserta';
        if (registrationQueue.length > 0) {
            return `Tambah Data Baru (${currentQueueIndex + 1}/${registrationQueue.length})`;
        }
        return 'Tambah Data Peserta';
    };

    const age = participant.tanggal_lahir ? calculateAge(participant.tanggal_lahir) : 0;
    const category = participant.tanggal_lahir ? determineCategory(participant.tanggal_lahir, participant.status_hamil) : undefined;
    const isDesaDisabled = (userDesa && userDesa !== 'Semua') || registrationQueue.length > 0;
    const isPosyanduDisabled = (!!posyanduSession && !participantToEdit) || registrationQueue.length > 0;


    const renderBalitaFields = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-900">Anak Ke</label><input type="number" name="anak_ke" value={participant.anak_ke || ''} onChange={handleChange} className={inputStyle} /></div>
                <div><label className="block text-sm font-medium text-gray-900">Nama Ibu</label><input type="text" name="nama_ibu" value={participant.nama_ibu || ''} onChange={handleChange} className={inputStyle} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><label className="block text-sm font-medium text-gray-900">Berat Lahir (kg)</label><input type="number" step="0.1" name="berat_lahir" value={participant.berat_lahir || ''} onChange={handleChange} className={inputStyle} /></div>
                <div><label className="block text-sm font-medium text-gray-900">Panjang Lahir (cm)</label><input type="number" step="0.1" name="panjang_lahir" value={participant.panjang_lahir || ''} onChange={handleChange} className={inputStyle} /></div>
            </div>
        </>
    );

    const renderDewasaFields = () => {
        const showHamilCheckbox = age >= 18 && participant.jenis_kelamin === 'Perempuan' && participant.status_pernikahan === 'Menikah';

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {age >= 18 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Status Pernikahan</label>
                            <select name="status_pernikahan" value={participant.status_pernikahan || ''} onChange={handleChange} className={inputStyle}>
                                <option value="">Pilih...</option>
                                <option value="Belum Menikah">Belum Menikah</option>
                                <option value="Menikah">Menikah</option>
                                <option value="Cerai Hidup">Cerai Hidup</option>
                                <option value="Cerai Mati">Cerai Mati</option>
                            </select>
                        </div>
                    )}
                    {showHamilCheckbox && (
                        <div className="flex items-end">
                            <label className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-300 shadow-sm w-full cursor-pointer hover:bg-gray-50">
                                <input type="checkbox" name="status_hamil" checked={participant.status_hamil || false} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm font-medium text-gray-800">Sedang Hamil</span>
                            </label>
                        </div>
                    )}
                </div>
                {age >= 18 && (
                    <div className="pt-4 space-y-6">
                        <CheckboxGroup
                            title="Riwayat Penyakit Orang Tua"
                            options={riwayatPenyakitOrtuOptions}
                            selected={participant.riwayat_penyakit_ortu || []}
                            name="riwayat_penyakit_ortu"
                            onChange={handleCheckboxGroupChange}
                        />
                        <CheckboxGroup
                            title="Riwayat Penyakit Pribadi"
                            options={riwayatPenyakitIndividuOptions}
                            selected={participant.riwayat_penyakit_individu || []}
                            name="riwayat_penyakit_individu"
                            onChange={handleCheckboxGroupChange}
                        />
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <Modal ref={modalContentRef} isOpen={isOpen} onClose={onClose} title={getModalTitle()} maxWidth="max-w-3xl">
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Nama Lengkap <span className="text-red-500">*</span></label>
                                <input type="text" name="nama" value={participant.nama || ''} onChange={handleChange} required className={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">NIK <span className="text-red-500">*</span></label>
                                <input type="text" name="nik" value={participant.nik || ''} onChange={handleChange} required className={inputStyle} />
                                {nikError && <p className="text-xs text-red-500 mt-1">{nikError}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Tanggal Lahir <span className="text-red-500">*</span></label>
                                <input type="date" name="tanggal_lahir" value={participant.tanggal_lahir || ''} onChange={handleChange} required className={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Jenis Kelamin <span className="text-red-500">*</span></label>
                                <select name="jenis_kelamin" value={participant.jenis_kelamin || 'Laki-laki'} onChange={handleChange} required className={inputStyle}>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Desa <span className="text-red-500">*</span></label>
                                <select 
                                    name="alamat" 
                                    value={participant.alamat || ''} 
                                    onChange={handleChange} 
                                    required 
                                    disabled={isDesaDisabled}
                                    className={`${inputStyle} disabled:bg-gray-200 disabled:cursor-not-allowed`}
                                >
                                    <option value="" disabled>Pilih Desa...</option>
                                    {desaOptions.map(desa => <option key={desa} value={desa}>{desa}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Nama Posyandu <span className="text-red-500">*</span></label>
                                <select 
                                    name="nama_posyandu" 
                                    value={participant.nama_posyandu || ''} 
                                    onChange={handleChange} 
                                    required 
                                    disabled={!participant.alamat || isPosyanduDisabled}
                                    className={`${inputStyle} disabled:bg-gray-200 disabled:cursor-not-allowed`}
                                >
                                    <option value="" disabled>Pilih Posyandu...</option>
                                    {participant.alamat && posyanduOptionsByDesa[participant.alamat] &&
                                        posyanduOptionsByDesa[participant.alamat].map(posyandu => (
                                            <option key={posyandu} value={posyandu}>{posyandu}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">RT <span className="text-red-500">*</span></label>
                                    <input type="text" name="rt" placeholder="001" value={participant.rt || ''} onChange={handleChange} required className={inputStyle} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">RW <span className="text-red-500">*</span></label>
                                    <input type="text" name="rw" placeholder="001" value={participant.rw || ''} onChange={handleChange} required className={inputStyle} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">No. Telepon</label>
                                <input type="tel" name="no_telepon" value={participant.no_telepon || ''} onChange={handleChange} className={inputStyle} />
                            </div>
                        </div>
                    </div>
                    
                    { category &&
                        <div className="pt-4 space-y-4">
                            <h4 className="font-semibold text-gray-800 border-b pb-2">Data Tambahan (kategori: {getCategoryLabel(category)})</h4>
                            {category === 'balita' && renderBalitaFields()}
                            {category !== 'balita' && renderDewasaFields()}
                        </div>
                    }
                    
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Batal</button>
                        <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                            {registrationQueue.length > 0 ? `Simpan & Lanjutkan (${currentQueueIndex + 1}/${registrationQueue.length})` : 'Simpan'}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};