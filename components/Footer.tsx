import React from 'react';
import { PhoneIcon, EmailIcon, LocationIcon, WhatsappIcon } from './icons';

interface FooterProps {
    className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
    return (
        <footer className={`bg-gray-800 text-white pt-16 pb-8 mt-16 ${className || ''}`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Column 1: Logo & About */}
                    <div className="lg:col-span-2">
                        <h3 className="text-xl font-bold">PUSPITA</h3>
                        <p className="text-sm text-gray-300 mb-4">Posyandu Semua Periode Hidup Terintegrasi</p>
                        <p className="text-gray-400 max-w-md">
                            Memberikan pelayanan kesehatan dasar yang berkualitas, mudah diakses, dan terjangkau untuk seluruh siklus hidup masyarakat.
                        </p>
                    </div>
                    {/* Column 2: Contact */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4 tracking-wide">Kontak Kami</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-start gap-3">
                                <span className="w-5 h-5 mt-1 flex-shrink-0"><LocationIcon /></span>
                                <span>Jl. Desa Kupu RT 01 RW 01, Kecamatan Dukuhturi, Kabupaten Tegal</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-5 h-5"><PhoneIcon /></span>
                                <span>(0823) 311432</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <span className="w-5 h-5"><WhatsappIcon /></span>
                                <span>085174477112</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-5 h-5"><EmailIcon /></span>
                                <span>puskesmas.kupu123@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 border-t border-gray-700 pt-8 text-center">
                    <p id="footer-text" className="text-gray-500">© {new Date().getFullYear()} PUSPITA by Puskesmas Kupu. Kerja Cerdas Pelayanan Berkualitas.</p>
                </div>
            </div>
        </footer>
    );
};