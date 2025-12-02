
import React, { useRef, useState } from 'react';
import { HomeIcon, RegistrationIcon, MeasurementIcon, RecordingIcon, ServiceIcon, EducationIcon, ReportIcon, PuskesmasLogo, EditIcon, TrashIcon, ContactIcon } from './icons';
import type { View, ReportType, ReportTemplate } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isCollapsed: boolean;
  setCollapsed: (isCollapsed: boolean) => void;
  customLogo: string | null;
  setCustomLogo: (logo: string | null) => void;
  isAdmin: boolean;
  isPublicView?: boolean;
  onContactClick?: () => void;
  reportType?: ReportType;
  setReportType?: (type: ReportType) => void;
  reportTemplates?: ReportTemplate[]; // Pass templates to sidebar
}

interface SidebarItemProps {
    view: View;
    label: string;
    icon: React.ReactNode;
    activeView: View;
    onClick: (view: View) => void;
    isCollapsed: boolean;
    hasSubMenu?: boolean;
    isSubMenuOpen?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ view, label, icon, activeView, onClick, isCollapsed, hasSubMenu, isSubMenuOpen }) => (
    <button 
        className={`sidebar-item w-full flex items-center px-4 py-3 text-white rounded-lg hover:bg-white hover:bg-opacity-20 
            ${activeView === view && !hasSubMenu ? 'active bg-white bg-opacity-20 border-l-4 border-white' : ''} 
            ${isCollapsed ? 'md:justify-center' : ''}`}
        onClick={() => onClick(view)}
    >
        <div className="flex-shrink-0 w-5 h-5">{icon}</div>
        <span className={`font-medium ml-4 whitespace-nowrap transition-opacity duration-200 flex-1 text-left ${isCollapsed ? 'md:hidden' : ''}`}>
            {label}
        </span>
        {hasSubMenu && !isCollapsed && (
             <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${isSubMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        )}
    </button>
);

const SubMenuItem: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left pl-12 pr-4 py-2 text-sm transition-colors duration-150 rounded-lg
            ${isActive ? 'text-white bg-white bg-opacity-10 font-medium' : 'text-blue-200 hover:text-white hover:bg-white hover:bg-opacity-5'}`}
    >
        {label}
    </button>
);


export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, setCollapsed, customLogo, setCustomLogo, isAdmin, isPublicView, onContactClick, reportType, setReportType, reportTemplates = [] }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);

    const handleItemClick = (view: View) => {
        if (view === 'laporan') {
            if (isCollapsed) {
                // If collapsed, clicking icon generally just activates the main view or expands.
                // Here we expand sidebar to show submenus
                setCollapsed(false);
                setIsReportMenuOpen(true);
            } else {
                setIsReportMenuOpen(!isReportMenuOpen);
            }
        } else {
            setActiveView(view);
            if (window.innerWidth < 768) { // Mobile auto-collapse
                setCollapsed(true);
            }
        }
    };
    
    const handleSubMenuClick = (type: ReportType) => {
        if (setReportType) setReportType(type);
        setActiveView('laporan');
        if (window.innerWidth < 768) {
            setCollapsed(true);
        }
    };

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Silakan pilih file gambar.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div id="sidebar" className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-600 to-indigo-700 shadow-2xl z-40 transform transition-all duration-300 ${isCollapsed ? 'w-64 md:w-20 -translate-x-full md:translate-x-0' : 'w-64 translate-x-0'} flex flex-col`}>
            <div className={`p-6 transition-all duration-300 overflow-hidden flex-shrink-0 ${isCollapsed ? 'md:p-3' : 'p-6'}`}>
                <div className="flex flex-col items-center text-center mb-8">
                    <div className={`relative group flex-shrink-0 mb-4 ${isCollapsed ? 'md:mx-auto' : ''}`}>
                       {customLogo ? (
                           <img src={customLogo} alt="Logo Kustom" className="w-12 h-12 rounded-full object-cover" />
                       ) : (
                           <PuskesmasLogo />
                       )}
                        {isAdmin && !isPublicView && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleLogoChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-1.5 rounded-full text-white hover:bg-white/30"
                                    title="Ubah Logo"
                                >
                                    <div className="w-5 h-5"><EditIcon /></div>
                                </button>
                                {customLogo && (
                                    <button
                                        onClick={() => setCustomLogo(null)}
                                        className="p-1.5 rounded-full text-white hover:bg-white/30"
                                        title="Hapus Logo"
                                    >
                                        <div className="w-5 h-5"><TrashIcon /></div>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <div className={isCollapsed ? 'md:hidden' : ''}>
                        <h2 className="text-white font-bold text-lg whitespace-nowrap">PUSPITA</h2>
                        <p className="text-blue-200 text-sm leading-tight">Posyandu Semua Periode Hidup Terintegrasi</p>
                    </div>
                </div>

                <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
                    {isPublicView ? (
                         <>
                            <SidebarItem view="home" label="Beranda" icon={<HomeIcon />} activeView={activeView} onClick={handleItemClick} isCollapsed={isCollapsed} />
                             <button 
                                onClick={() => { 
                                    onContactClick?.();
                                    if (window.innerWidth < 768) setCollapsed(true);
                                }}
                                className={`sidebar-item w-full flex items-center px-4 py-3 text-white rounded-lg hover:bg-white hover:bg-opacity-20 ${isCollapsed ? 'md:justify-center' : ''}`}
                            >
                                <div className="flex-shrink-0 w-5 h-5"><ContactIcon /></div>
                                <span className={`font-medium ml-4 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'md:hidden' : ''}`}>Kontak Kami</span>
                            </button>
                        </>
                    ) : isAdmin ? (
                        <>
                            <SidebarItem view="home" label="Beranda" icon={<HomeIcon />} activeView={activeView} onClick={handleItemClick} isCollapsed={isCollapsed} />
                            <SidebarItem view="1" label="Data Sasaran" icon={<RegistrationIcon />} activeView={activeView} onClick={handleItemClick} isCollapsed={isCollapsed} />
                            <div>
                                <SidebarItem 
                                    view="laporan" 
                                    label="Laporan" 
                                    icon={<ReportIcon />} 
                                    activeView={activeView} 
                                    onClick={handleItemClick} 
                                    isCollapsed={isCollapsed}
                                    hasSubMenu={true}
                                    isSubMenuOpen={isReportMenuOpen}
                                />
                                {isReportMenuOpen && !isCollapsed && (
                                    <div className="mt-1 space-y-1 animate-slide-down">
                                        {reportTemplates.map(template => (
                                            <SubMenuItem 
                                                key={template.id}
                                                label={template.name} 
                                                isActive={activeView === 'laporan' && reportType === template.id} 
                                                onClick={() => handleSubMenuClick(template.id)} 
                                            />
                                        ))}
                                        {reportTemplates.length === 0 && (
                                            <div className="px-4 py-2 text-xs text-blue-300 italic">Tidak ada template</div>
                                        )}
                                        <SubMenuItem label="Laporan Individual Anak" isActive={activeView === 'laporan' && reportType === 'individual'} onClick={() => handleSubMenuClick('individual')} />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <SidebarItem view="home" label="Beranda" icon={<HomeIcon />} activeView={activeView} onClick={handleItemClick} isCollapsed={isCollapsed} />
                            <div className="space-y-1">
                                <div className={`px-4 py-2 text-blue-200 text-sm font-semibold uppercase tracking-wide transition-opacity duration-200 ${isCollapsed ? 'md:hidden' : ''}`}>
                                    Pelayanan Posyandu
                                </div>
                                <SidebarItem view="1" label="Pendaftaran" icon={<RegistrationIcon />} activeView={activeView} onClick={handleItemClick} isCollapsed={isCollapsed} />
                                <SidebarItem view="2" label="Pengukuran" icon={<MeasurementIcon />} activeView={activeView} onClick={handleItemClick} isCollapsed={isCollapsed} />
                                <SidebarItem view="3" label="Pencatatan" icon={<RecordingIcon />} activeView={activeView} onClick={handleItemClick} isCollapsed={isCollapsed} />
                                <SidebarItem view="4" label="Pelayanan" icon={<ServiceIcon />} activeView={activeView} onClick={handleItemClick} isCollapsed={isCollapsed} />
                                <SidebarItem view="5" label="Edukasi" icon={<EducationIcon />} activeView={activeView} onClick={handleItemClick} isCollapsed={isCollapsed} />
                            </div>
                            <div>
                                <SidebarItem 
                                    view="laporan" 
                                    label="Laporan" 
                                    icon={<ReportIcon />} 
                                    activeView={activeView} 
                                    onClick={handleItemClick} 
                                    isCollapsed={isCollapsed}
                                    hasSubMenu={true}
                                    isSubMenuOpen={isReportMenuOpen}
                                />
                                {isReportMenuOpen && !isCollapsed && (
                                    <div className="mt-1 space-y-1 animate-slide-down">
                                        {reportTemplates.map(template => (
                                            <SubMenuItem 
                                                key={template.id}
                                                label={template.name} 
                                                isActive={activeView === 'laporan' && reportType === template.id} 
                                                onClick={() => handleSubMenuClick(template.id)} 
                                            />
                                        ))}
                                        <SubMenuItem label="Laporan Individual Anak" isActive={activeView === 'laporan' && reportType === 'individual'} onClick={() => handleSubMenuClick('individual')} />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </nav>
            </div>
            <style>{`
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-10px); max-height: 0; }
                    to { opacity: 1; transform: translateY(0); max-height: 500px; }
                }
                .animate-slide-down {
                    animation: slide-down 0.3s ease-out forwards;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};
