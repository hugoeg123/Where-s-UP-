import React, { useState, useEffect } from 'react';
import { Filters } from './EventList';
import { useLanguage } from '../contexts/LanguageContext';
import { RATING_CATEGORIES, RatingCategory } from '../types';
import { XMarkIcon, StarIcon } from './Icons';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFilters: Filters;
    onApplyFilters: (filters: Filters) => void;
}

const initialFilters: Filters = {
    minRating: 0,
    minCheckIns: 0,
    minAvgCrowd: 0,
    specificRatings: {
        music: 0,
        ambiance: 0,
        crowd: 0,
        capacity: 0,
        service: 0
    }
};

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, currentFilters, onApplyFilters }) => {
    const { t } = useLanguage();
    const [localFilters, setLocalFilters] = useState<Filters>(currentFilters);

    useEffect(() => {
        setLocalFilters(currentFilters);
    }, [currentFilters, isOpen]);

    if (!isOpen) return null;

    const handleApply = () => {
        onApplyFilters(localFilters);
        onClose();
    };

    const handleClear = () => {
        setLocalFilters(initialFilters);
        onApplyFilters(initialFilters);
        onClose();
    };
    
    const setSpecificRating = (category: RatingCategory, value: number) => {
        setLocalFilters(prev => ({
            ...prev,
            specificRatings: {
                ...prev.specificRatings,
                [category]: value
            }
        }));
    };

    return (
        <div className="fixed inset-0 bg-brand-primary/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn" onClick={onClose}>
            <div className="bg-brand-secondary p-6 rounded-lg shadow-2xl border border-brand-tertiary w-full max-w-md relative transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-white">{t('advancedFilters', 'Advanced Filters')}</h3>
                    <button onClick={onClose} className="text-brand-text-secondary hover:text-white">
                        <XMarkIcon className="w-6 h-6"/>
                    </button>
                </div>
                
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Minimum Rating */}
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t('minRating', 'Minimum Rating')}</label>
                        <div className="flex items-center gap-1">
                             {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setLocalFilters(f => ({ ...f, minRating: star === f.minRating ? 0 : star}))}>
                                    <StarIcon className={`w-8 h-8 transition-colors ${star <= localFilters.minRating ? 'text-brand-neon' : 'text-brand-tertiary hover:text-brand-neon/50'}`} />
                                </button>
                            ))}
                            <span className="ml-2 font-bold text-brand-text">{localFilters.minRating.toFixed(1)}</span>
                        </div>
                    </div>
                     {/* Number Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="minCheckIns" className="block text-sm font-medium text-brand-text-secondary mb-1">{t('minCheckIns', 'Minimum Check-ins')}</label>
                           <input id="minCheckIns" type="number" min="0" value={localFilters.minCheckIns || ''} onChange={(e) => setLocalFilters(f => ({...f, minCheckIns: parseInt(e.target.value, 10) || 0}))} className="w-full bg-brand-tertiary border border-brand-tertiary/50 rounded-md p-2 text-brand-text focus:ring-2 focus:ring-brand-neon focus:border-brand-neon outline-none transition" />
                        </div>
                         <div>
                           <label htmlFor="minAvgCrowd" className="block text-sm font-medium text-brand-text-secondary mb-1">{t('avgCrowdEstimate', 'Avg. Crowd Estimate')}</label>
                           <input id="minAvgCrowd" type="number" min="0" value={localFilters.minAvgCrowd || ''} onChange={(e) => setLocalFilters(f => ({...f, minAvgCrowd: parseInt(e.target.value, 10) || 0}))} className="w-full bg-brand-tertiary border border-brand-tertiary/50 rounded-md p-2 text-brand-text focus:ring-2 focus:ring-brand-neon focus:border-brand-neon outline-none transition" />
                        </div>
                    </div>

                    {/* Specific Ratings */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2">{t('specificRatings', 'Specific Ratings')}</h4>
                        <div className="space-y-4">
                            {RATING_CATEGORIES.map(category => (
                                <div key={category}>
                                    <div className="flex justify-between items-center mb-1">
                                        <label htmlFor={category} className="capitalize text-brand-text-secondary">{t(category, category)}</label>
                                        <span className="font-bold text-brand-neon">{localFilters.specificRatings[category].toFixed(1)}</span>
                                    </div>
                                    <input id={category} type="range" min="0" max="5" step="0.5" value={localFilters.specificRatings[category]} onChange={(e) => setSpecificRating(category, parseFloat(e.target.value))} className="w-full h-2 bg-brand-tertiary rounded-lg appearance-none cursor-pointer accent-brand-neon" />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                <div className="flex justify-between gap-3 pt-6 border-t border-brand-tertiary mt-6">
                    <button onClick={handleClear} className="px-6 py-2 bg-brand-tertiary text-brand-text font-semibold rounded-md hover:bg-opacity-80 transition-colors">
                        {t('clearFilters', 'Clear Filters')}
                    </button>
                    <button onClick={handleApply} className="px-8 py-2 bg-brand-neon text-brand-primary font-bold rounded-md hover:bg-opacity-90 transition-colors">
                        {t('applyFilters', 'Apply Filters')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
