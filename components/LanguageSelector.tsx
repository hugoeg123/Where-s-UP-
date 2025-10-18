import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, languages, LanguageCode } from '../contexts/LanguageContext';
import { GlobeAltIcon } from './Icons';

const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (langCode: LanguageCode) => {
        setLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="text-brand-text-secondary hover:text-white transition-colors"
                aria-label="Select language"
            >
                <GlobeAltIcon className="w-8 h-8"/>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-brand-secondary rounded-md shadow-lg border border-brand-tertiary z-50 animate-fadeIn">
                    <ul className="py-1">
                        {Object.entries(languages).map(([code, { nativeName }]) => (
                            <li key={code}>
                                <button 
                                    onClick={() => handleSelect(code as LanguageCode)}
                                    className={`w-full text-left px-4 py-2 text-sm ${language === code ? 'bg-brand-neon text-brand-primary' : 'text-brand-text hover:bg-brand-tertiary'}`}
                                >
                                    {nativeName}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
