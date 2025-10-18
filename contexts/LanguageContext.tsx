import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { translateText } from '../services/geminiService';

export const languages = {
    en: { nativeName: 'English' },
    es: { nativeName: 'Español' },
    pt: { nativeName: 'Português' },
};

export type LanguageCode = keyof typeof languages;

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (language: LanguageCode) => void;
    t: (key: string, fallback?: string) => string;
    translateUGC: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translationCache = new Map<string, string>();

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<LanguageCode>(() => {
        const storedLang = localStorage.getItem('wheresup_language');
        return (storedLang && languages[storedLang as LanguageCode]) ? storedLang as LanguageCode : 'en';
    });
    const [translations, setTranslations] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const response = await fetch(`/translations/${language}.json`);
                if (!response.ok) {
                    throw new Error(`Could not fetch translations for ${language}`);
                }
                const data = await response.json();
                setTranslations(data);
            } catch (error) {
                console.error(`Could not load translations for ${language}, falling back to English.`, error);
                try {
                    const fallbackResponse = await fetch(`/translations/en.json`);
                    if (!fallbackResponse.ok) {
                        throw new Error(`Could not fetch fallback English translations`);
                    }
                    const fallbackData = await fallbackResponse.json();
                    setTranslations(fallbackData);
                } catch (fallbackError) {
                    console.error('Failed to load fallback English translations.', fallbackError);
                    setTranslations({}); // Set to empty if fallback fails
                }
            }
        };

        loadTranslations();
    }, [language]);

    const setLanguage = (lang: LanguageCode) => {
        localStorage.setItem('wheresup_language', lang);
        translationCache.clear(); // Clear UGC cache on language change
        setLanguageState(lang);
    };

    const t = useCallback((key: string, fallback?: string): string => {
        return translations[key] || fallback || key;
    }, [translations]);

    const translateUGC = useCallback(async (text: string): Promise<string> => {
        if (language === 'en' || !text) {
            return text;
        }
        const cacheKey = `${language}:${text}`;
        if (translationCache.has(cacheKey)) {
            return translationCache.get(cacheKey)!;
        }

        const translated = await translateText(text, language);
        if (translated !== text) { // Only cache successful translations
            translationCache.set(cacheKey, translated);
        }
        return translated;
    }, [language]);
    

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, translateUGC }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
