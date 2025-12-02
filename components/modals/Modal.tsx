import React, { forwardRef } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
    maxWidth?: string;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(({ isOpen, onClose, children, title, maxWidth = "max-w-xl" }, ref) => {
    if (!isOpen) return null;

    return (
        <div 
            className="modal fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                ref={ref}
                className={`modal-content bg-white rounded-xl shadow-2xl p-6 sm:p-8 m-4 w-full ${maxWidth} max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 opacity-0 animate-scale-in`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                {children}
            </div>
            <style>{`
                @keyframes scale-in {
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
            `}</style>
        </div>
    );
});