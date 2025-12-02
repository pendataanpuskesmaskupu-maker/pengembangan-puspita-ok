import React, { useState } from 'react';
import { Modal } from './Modal';
import { useToast } from '../../contexts/ToastContext';

interface FamilyLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (nik: string, dob: string) => void;
}

export const FamilyLoginModal: React.FC<FamilyLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
    const [nik, setNik] = useState('');
    const [dob, setDob] = useState('');
    const { addToast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nik || !dob) {
            addToast("NIK dan Tanggal Lahir harus diisi.", "error");
            return;
        }
        onLogin(nik, dob);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800">Portal Keluarga (Buku KIA Digital)</h3>
                <p className="text-gray-600 mt-2 mb-6">
                    Masukkan NIK dan Tanggal Lahir anak Anda untuk melihat riwayat kesehatan.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="family-nik" className="block text-sm font-medium text-gray-700">
                        NIK Anak
                    </label>
                    <input
                        id="family-nik"
                        type="text"
                        value={nik}
                        onChange={(e) => setNik(e.target.value)}
                        required
                        className="mt-1 w-full border border-gray-300 p-2 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="Masukkan 16 digit NIK"
                    />
                </div>
                <div>
                    <label htmlFor="family-dob" className="block text-sm font-medium text-gray-700">
                        Tanggal Lahir Anak
                    </label>
                    <input
                        id="family-dob"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                        className="mt-1 w-full border border-gray-300 p-2 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Batal
                    </button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Lihat Data
                    </button>
                </div>
            </form>
        </Modal>
    );
};