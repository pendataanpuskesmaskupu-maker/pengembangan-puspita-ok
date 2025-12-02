import React, { useState } from 'react';
import { PuskesmasLogo, EyeIcon, EyeSlashIcon, CloseIcon } from '../icons';

interface LoginViewProps {
    onLogin: (username: string, password: string) => Promise<string | null>;
    customLogo: string | null;
    onCancel: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, customLogo, onCancel }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const loginError = await onLogin(username, password);
        if (loginError) {
            setError(loginError);
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 px-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Tutup"
                >
                    <div className="w-6 h-6">
                        <CloseIcon />
                    </div>
                </button>
                 <div className="space-y-4">
                    <div className="flex justify-center">
                        {customLogo ? (
                           <img src={customLogo} alt="Logo Kustom" className="w-20 h-20 rounded-full object-cover shadow-md" />
                       ) : (
                           <PuskesmasLogo />
                       )}
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-800">
                            PUSPITA
                            <span className="block font-bold text-gray-700 mt-1">Puskesmas Kupu</span>
                        </h1>
                        <p className="text-gray-500 mt-2">Silakan masuk untuk melanjutkan</p>
                    </div>
                </div>
                
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                        <p>{error}</p>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="username"
                            className="text-sm font-medium text-gray-700 block mb-2"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-gray-700 block mb-2"
                        >
                            Password
                        </label>
                         <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                            />
                             <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                            >
                                <div className="w-5 h-5">
                                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                                </div>
                            </button>
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                        >
                            {isLoading ? (
                                <div className="spinner h-5 w-5 border-white border-t-transparent"></div>
                            ) : (
                                'Masuk'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};