import React from 'react';
import type { HealthNotification } from '../../types';
import { AlertTriangleIcon, DropletIcon, HeartbeatIcon, StethoscopeIcon } from '../icons';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: HealthNotification[];
    readNotificationIds: Set<string>;
    onMarkAllAsRead: () => void;
}

const NotificationIcon: React.FC<{ type: HealthNotification['type'] }> = ({ type }) => {
    const iconMap: Record<HealthNotification['type'], { icon: React.ReactNode; color: string }> = {
        stunting: { icon: <AlertTriangleIcon />, color: 'text-orange-500' },
        underweight: { icon: <AlertTriangleIcon />, color: 'text-yellow-500' },
        overweight: { icon: <AlertTriangleIcon />, color: 'text-red-500' },
        anemia: { icon: <DropletIcon />, color: 'text-red-500' },
        hypertension: { icon: <HeartbeatIcon />, color: 'text-red-600' },
        diabetes: { icon: <StethoscopeIcon />, color: 'text-purple-500' },
        kek: { icon: <AlertTriangleIcon />, color: 'text-pink-500' },
    };
    const { icon, color } = iconMap[type] || { icon: <AlertTriangleIcon />, color: 'text-gray-500' };
    return <div className={`w-6 h-6 ${color}`}>{icon}</div>;
};

const typeLabels: Record<HealthNotification['type'], string> = {
    stunting: 'Risiko Stunting/Gagal Tumbuh',
    underweight: 'Risiko Gizi Kurang/Buruk',
    overweight: 'Risiko Gizi Lebih',
    anemia: 'Risiko Anemia',
    hypertension: 'Risiko Hipertensi',
    diabetes: 'Risiko Diabetes',
    kek: 'Risiko KEK (Ibu Hamil)',
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, notifications, readNotificationIds, onMarkAllAsRead }) => {
    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !readNotificationIds.has(n.id)).length;

    return (
        <div className="fixed inset-0 z-40" onClick={onClose}>
            <div
                className="absolute top-20 right-4 sm:right-6 lg:right-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 origin-top-right scale-95 opacity-0 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Peringatan Kesehatan</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllAsRead}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                            Tandai semua dibaca
                        </button>
                    )}
                </div>
                {notifications.length === 0 ? (
                    <div className="p-16 text-center text-gray-500">
                        <p>Tidak ada peringatan saat ini.</p>
                    </div>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto">
                        {notifications.map(notification => {
                            const isUnread = !readNotificationIds.has(notification.id);
                            return (
                                <div key={notification.id} className={`p-4 border-b flex items-start gap-4 ${isUnread ? 'bg-blue-50' : 'bg-white'}`}>
                                    <div className="flex-shrink-0 mt-1">
                                        <NotificationIcon type={notification.type} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800">{notification.participantName}</p>
                                        <p className="text-xs font-medium text-gray-500 mb-1">{typeLabels[notification.type]}</p>
                                        <p className="text-sm text-gray-700">{notification.message}</p>
                                    </div>
                                    {isUnread && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" title="Belum Dibaca"></div>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
             <style>{`
                @keyframes scale-in {
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
            `}</style>
        </div>
    );
};