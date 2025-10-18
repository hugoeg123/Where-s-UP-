import React from 'react';
import { Ratings, User, HypeLevel } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HypeRaterProps {
    ratings: Ratings;
    currentUser: User;
    isUserCheckedIn: boolean;
    onRateHype: (level: HypeLevel) => void;
}

const HypeRater: React.FC<HypeRaterProps> = ({ ratings, currentUser, isUserCheckedIn, onRateHype }) => {
    const { t } = useLanguage();
    const currentUserHype = ratings.hype.find(h => h.userId === currentUser.id);

    const hypeLevels: { level: HypeLevel; label: string; }[] = [
        { level: 'run_here', label: t('hypeRunHere', "Run here now!") },
        { level: 'popping', label: t('hypePopping', "Popping") },
        { level: 'good_vibe', label: t('hypeGoodVibe', "Good Vibe") },
        { level: 'chill', label: t('hypeChill', "Chill") },
        { level: 'save_yourself', label: t('hypeSaveYourself', "Save yourself") },
    ];

    return (
        <div className={!isUserCheckedIn ? 'opacity-50' : ''}>
            <h3 className="text-xl font-bold text-white mb-2">{t('whatsTheHype', "What's the Hype?")}</h3>
            <p className="text-brand-text-secondary mb-4">{t('hypeRaterDescription', 'Let everyone know the current energy level.')}</p>
            <div className="flex flex-wrap gap-2 justify-center">
                {hypeLevels.map(({level, label}) => {
                    const hasVotedForThis = currentUserHype?.level === level;
                    return (
                        <button
                            key={level}
                            onClick={() => onRateHype(level)}
                            disabled={!isUserCheckedIn}
                            className={`px-4 py-2 rounded-full font-semibold transition-all text-sm
                                ${hasVotedForThis 
                                    ? 'bg-brand-neon text-brand-primary ring-2 ring-offset-2 ring-offset-brand-secondary ring-brand-neon' 
                                    : 'bg-brand-tertiary hover:bg-brand-tertiary/70 text-brand-text'}
                                disabled:cursor-not-allowed`}
                        >
                            {label}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default HypeRater;