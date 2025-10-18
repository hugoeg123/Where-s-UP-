import React from 'react';
import { Ratings as RatingsType, RatingCategory, RATING_CATEGORIES } from '../types';
import { StarIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface RatingsProps {
  ratings: RatingsType;
  isUserCheckedIn: boolean;
  onRate: (category: RatingCategory, rating: number) => void;
}

const Ratings: React.FC<RatingsProps> = ({ ratings, onRate, isUserCheckedIn }) => {
    const { t } = useLanguage();
    const getAverageRating = (category: RatingCategory) => {
        const categoryRatings = ratings[category];
        if (categoryRatings.length === 0) return 0;
        const sum = categoryRatings.reduce((a, b) => a + b, 0);
        return sum / categoryRatings.length;
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-2">{t('detailedRatings', 'Detailed Ratings')}</h3>
            {RATING_CATEGORIES.map(category => (
                <div key={category} className={!isUserCheckedIn ? 'opacity-50' : ''}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="capitalize text-brand-text-secondary">{t(category, category)}</span>
                        <span className="font-bold text-brand-neon">{getAverageRating(category).toFixed(1)}/5</span>
                    </div>
                    <div className="w-full bg-brand-tertiary rounded-full h-2.5">
                        <div className="bg-brand-neon h-2.5 rounded-full" style={{ width: `${getAverageRating(category) / 5 * 100}%` }}></div>
                    </div>
                    <div className="flex justify-center space-x-2 mt-3">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => onRate(category, star)} disabled={!isUserCheckedIn} className="group disabled:cursor-not-allowed">
                                <StarIcon className="w-8 h-8 text-brand-tertiary group-hover:text-brand-neon transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>
            ))}
            {!isUserCheckedIn && (
                 <p className="text-center text-sm text-brand-text-secondary pt-4">
                    {t('checkInToRate', 'You must be checked in to rate this event.')}
                 </p>
            )}
        </div>
    );
};

export default Ratings;