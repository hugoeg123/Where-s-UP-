import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const useTranslation = (originalText: string) => {
    const { language, translateUGC } = useLanguage();
    const [translatedText, setTranslatedText] = useState(originalText);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (language === 'en' || !originalText) {
            setTranslatedText(originalText);
            return;
        }

        let isMounted = true;
        const translate = async () => {
            setIsLoading(true);
            const result = await translateUGC(originalText);
            if (isMounted) {
                setTranslatedText(result);
                setIsLoading(false);
            }
        };

        translate();

        return () => { isMounted = false; };
    }, [originalText, language, translateUGC]);

    return { translatedText, isLoading };
};
