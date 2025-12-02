import React from 'react';
import type { ToastMessage } from '../../contexts/ToastContext';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '../icons';

const toastIcons: Record<ToastMessage['type'], React.ReactNode> = {
  success: <CheckCircleIcon />,
  error: <XCircleIcon />,
  info: <InformationCircleIcon />,
};

const toastStyles: Record<ToastMessage['type'], string> = {
  success: 'bg-green-100 border-green-500 text-green-800',
  error: 'bg-red-100 border-red-500 text-red-800',
  info: 'bg-blue-100 border-blue-500 text-blue-800',
};

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="fixed top-24 right-4 z-[100] space-y-2 w-full max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast-item flex items-start p-4 w-full rounded-lg shadow-lg border-l-4 ${toastStyles[toast.type]}`}
          role="alert"
        >
          <div className="flex-shrink-0 w-6 h-6 mr-3">{toastIcons[toast.type]}</div>
          <div className="flex-1 text-sm font-medium">{toast.message}</div>
        </div>
      ))}
      <style>{`
        @keyframes toast-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .toast-item {
          animation: toast-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};