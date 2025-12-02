import React, { useState, useEffect } from 'react';
import { SurveyIcon } from '../icons';

const TALLY_URL_KEY = 'posyandu-tally-embed-url';
const DEFAULT_TALLY_URL = 'https://tally.so/embed/w54jAj?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1';

export const SurveyView: React.FC = () => {
    const [tallyUrl, setTallyUrl] = useState(() => {
        return localStorage.getItem(TALLY_URL_KEY) || DEFAULT_TALLY_URL;
    });
    const [inputUrl, setInputUrl] = useState(tallyUrl);

    useEffect(() => {
        localStorage.setItem(TALLY_URL_KEY, tallyUrl);
    }, [tallyUrl]);

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputUrl(e.target.value);
    };

    const handleSetUrl = () => {
        // Simple validation to ensure it's a Tally embed URL
        if (inputUrl.startsWith('https://tally.so/embed/')) {
            setTallyUrl(inputUrl);
        } else {
            alert('URL tidak valid. Harap masukkan URL embed dari Tally.so yang valid, contoh: https://tally.so/embed/xxxxxx');
        }
    };

    return (
        <div className="step-content opacity-100 transform-none space-y-8">
            <div className="bg-white rounded-xl p-4 md:p-8 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg mr-4 flex-shrink-0">
                        <div className="w-6 h-6 md:w-8 md:h-8"><SurveyIcon /></div>
                    </div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Survei & Formulir</h3>
                        <p className="text-gray-600 mt-1 text-sm md:text-base">Tampilkan formulir eksternal dari Tally.so untuk survei atau pengumpulan data lainnya.</p>
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 space-y-2">
                    <label htmlFor="tally-url-input" className="block text-sm font-medium text-gray-900">
                        URL Embed Formulir Tally
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            id="tally-url-input"
                            type="url"
                            value={inputUrl}
                            onChange={handleUrlChange}
                            placeholder="https://tally.so/embed/xxxxxx"
                            className="flex-grow w-full border border-gray-300 p-2 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                        <button
                            onClick={handleSetUrl}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold transition-colors duration-300 shadow-md"
                        >
                            Tampilkan Formulir
                        </button>
                    </div>
                     <p className="text-xs text-gray-500">
                        Buka formulir Anda di Tally, klik 'Share' -&gt; 'Embed' -&gt; 'Standard', lalu salin link dari `src="..."` dan tempel di sini.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[800px]">
                    <iframe
                        src={tallyUrl}
                        className="w-full h-full min-h-[800px] border-0"
                        title="Formulir Tally"
                        loading="lazy"
                    >
                    </iframe>
                </div>
            </div>
        </div>
    );
};
