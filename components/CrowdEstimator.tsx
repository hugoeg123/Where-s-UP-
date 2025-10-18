import React, { useState, useMemo } from 'react';
import { CrowdEstimate, User } from '../types';
import { getAverageCrowdEstimate } from '../utils/helpers';
import { useLanguage } from '../contexts/LanguageContext';

interface CrowdEstimatorProps {
    estimates: CrowdEstimate[];
    currentUser: User;
    isUserCheckedIn: boolean;
    onEstimate: (estimate: number) => void;
}

// Maps a slider value (0-100) to an exponential crowd estimate up to 10,000
const mapSliderValueToEstimate = (sliderValue: number): number => {
    if (sliderValue === 0) return 1;
    if (sliderValue === 100) return 10000;
    // A more aggressive exponential curve to reach 10,000
    // The curve is y = a * e^(b*x) where we solve for a and b to fit points (0,1) and (100, 10000)
    const estimate = Math.floor(Math.pow(10000, sliderValue / 100));
    return Math.max(1, estimate);
};

// Maps a crowd estimate back to the closest slider value
const mapEstimateToSliderValue = (estimate: number): number => {
    if (estimate <= 1) return 0;
    if (estimate >= 10000) return 100;
    // Inverse of the exponential function: x = 100 * log(y) / log(10000)
    const sliderValue = Math.round(100 * Math.log(estimate) / Math.log(10000));
    return sliderValue;
};


const CrowdEstimator: React.FC<CrowdEstimatorProps> = ({ estimates, currentUser, isUserCheckedIn, onEstimate }) => {
    const { t } = useLanguage();
    const currentUserEstimate = estimates.find(e => e.userId === currentUser.id);
    const initialSliderValue = currentUserEstimate ? mapEstimateToSliderValue(currentUserEstimate.estimate) : 30;

    const [sliderValue, setSliderValue] = useState(initialSliderValue);
    
    const crowdData = useMemo(() => getAverageCrowdEstimate(estimates), [estimates]);
    const currentEstimate = mapSliderValueToEstimate(sliderValue);

    const handleSubmit = () => {
        onEstimate(currentEstimate);
    };

    return (
        <div className={!isUserCheckedIn ? 'opacity-50' : ''}>
            <h3 className="text-xl font-bold text-white mb-2">{t('howsTheCrowd', "How's the Crowd?")}</h3>
            <p className="text-brand-text-secondary mb-4">{t('crowdEstimatorDescription', 'Help others know the vibe. Move the slider to estimate how many people are here.')}</p>
            
            <div className="text-center my-6">
                <p className="text-5xl font-bold text-brand-neon">{currentEstimate.toLocaleString()}</p>
                <p className="text-brand-text-secondary">{t('estimatedPeople', 'Estimated People')}</p>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm font-bold w-8 text-center">1</span>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={(e) => setSliderValue(parseInt(e.target.value, 10))}
                    disabled={!isUserCheckedIn}
                    className="w-full h-2 bg-brand-tertiary rounded-lg appearance-none cursor-pointer accent-brand-neon"
                />
                <span className="text-sm font-bold w-12 text-center">10,000+</span>
            </div>

            <button
                onClick={handleSubmit}
                disabled={!isUserCheckedIn}
                className="w-full mt-6 bg-brand-neon text-brand-primary font-bold py-3 px-4 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {currentUserEstimate ? t('updateMyEstimate', 'Update My Estimate') : t('submitMyEstimate', 'Submit My Estimate')}
            </button>

            <div className="mt-6 text-center text-sm text-brand-text-secondary">
                {crowdData.average > 0 ? (
                    <>
                        <p>{t('averageEstimate', 'Average estimate is ~{average} people.').replace('{average}', Math.round(crowdData.average).toString())}</p>
                        {crowdData.latest && <p>{t('lastUpdatedAt', 'Last updated at {time}.').replace('{time}', new Date(crowdData.latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}</p>}
                    </>
                ) : (
                    <p>{t('beFirstToEstimate', 'Be the first to estimate the crowd!')}</p>
                )}
            </div>
             {!isUserCheckedIn && <p className="text-center text-yellow-400 mt-4">{t('checkInToEstimate', 'You must be checked in to submit an estimate.')}</p>}
        </div>
    );
};

export default CrowdEstimator;