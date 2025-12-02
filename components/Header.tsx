import React, { useRef } from 'react';
import { UserProfileIcon, LogoutIcon, EditIcon, LoginIcon, BellIcon } from './icons';

interface HeaderProps {
    isSidebarCollapsed: boolean;
    setSidebarCollapsed: (isCollapsed: boolean) => void;
    onLogout: () => void;
    username: string | null;
    userProfilePic: string | null;
    onSetProfilePic: (picDataUrl: string) => void;
    posyanduSession: string | null;
    isPublicView?: boolean;
    onLoginClick?: () => void;
    notificationCount: number;
    onNotificationClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed, setSidebarCollapsed, onLogout, username, userProfilePic, onSetProfilePic, posyanduSession, isPublicView, onLoginClick, notificationCount, onNotificationClick }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onSetProfilePic(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };
    
    return (
        <header className="bg-white/90 backdrop-blur-xl shadow-lg shadow-blue-500/5 sticky top-0 z-30">
            <div className="max-w-full mx-auto px-6 lg:px-10">
                <div className="flex items-center justify-between h-20 gap-4">
                    {/* Left Section: Hamburger & Title */}
                    <div className="flex items-center gap-4 min-w-0">
                        <button 
                            id="sidebar-toggle" 
                            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                            className="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 flex-shrink-0"
                            aria-label="Toggle Menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        
                        <div className="flex flex-col items-start min-w-0">
                            <h1 id="main-title" className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-tight truncate">
                               PUSPITA
                            </h1>
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs text-gray-500 truncate hidden xs:inline">
                                    Posyandu Semua Periode Hidup Terintegrasi
                                </p>
                                { !isPublicView && posyanduSession && (
                                    <>
                                        <span className="text-xs text-gray-400 hidden sm:inline">|</span>
                                        <span className="text-xs sm:text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md truncate">{posyanduSession}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Actions and User */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        {isPublicView ? (
                            <button
                                onClick={onLoginClick}
                                className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
                                aria-label="Masuk"
                                title="Masuk"
                            >
                                <div className="w-5 h-5">
                                    <LoginIcon />
                                </div>
                                <span className="hidden sm:inline">Masuk</span>
                            </button>
                        ) : (
                             <div className="flex items-center gap-3">
                                 <button onClick={onNotificationClick} className="relative p-2.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors" aria-label="Notifikasi" title="Notifikasi">
                                    <div className="w-6 h-6"><BellIcon /></div>
                                    {notificationCount > 0 && (
                                        <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 border-2 border-white"></span>
                                    )}
                                </button>
                                <div className="text-right hidden sm:block">
                                    <p className="font-semibold text-gray-800 text-sm capitalize">{username}</p>
                                    <p className="text-xs text-gray-500">Online</p>
                                </div>
                                 <div className="relative group">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleProfilePicChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        aria-label="Menu Pengguna"
                                        title="Profil Pengguna"
                                        onClick={triggerFileInput}
                                    >
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-indigo-400 transition">
                                            <UserProfileIcon username={username} profilePic={userProfilePic} />
                                        </div>
                                    </button>
                                    <div 
                                        onClick={triggerFileInput}
                                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        title="Ubah Foto Profil"
                                    >
                                        <div className="w-5 h-5 text-white">
                                            <EditIcon />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="p-2.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    aria-label="Logout"
                                    title="Logout"
                                 >
                                    <div className="w-6 h-6">
                                        <LogoutIcon />
                                    </div>
                                 </button>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};