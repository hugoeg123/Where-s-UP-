import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface TranslatedTextProps {
    children: string;
    // Fix: Replaced `keyof JSX.IntrinsicElements` with `React.ElementType` to resolve namespace error.
    as?: React.ElementType;
    className?: string;
}

const TranslatedText: React.FC<TranslatedTextProps> = ({ children, as: Component = 'span', className }) => {
    const { translatedText, isLoading } = useTranslation(children);

    // Render nothing if the original text is null, undefined, or an empty string
    if (!children) {
        return null;
    }

    return (
        <Component className={`${className || ''} ${isLoading ? 'opacity-50 transition-opacity' : ''}`}>
            {translatedText}
        </Component>
    );
};

export default TranslatedText;
