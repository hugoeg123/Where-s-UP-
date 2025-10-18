import React from 'react';
import { Event } from '../types';
import { calculateTimeLeft, getHypeLevel, getAverageCrowdEstimate, getOverallAverageRating } from '../utils/helpers';
import { ClockIcon, UserGroupIcon, MapPinIcon, StarIcon, ArrowRightOnRectangleIcon } from './Icons';
import TranslatedText from './TranslatedText';
import { useLanguage } from '../contexts/LanguageContext';

interface EventCardProps {
  event: Event;
  onSelectEvent: (event: Event) => void;
  isMapMode?: boolean;
  isFocused?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onSelectEvent, isMapMode = false, isFocused = false }) => {
  const { hours, minutes } = calculateTimeLeft(event.createdAt);
  const hype = getHypeLevel(event.ratings);
  const crowdEstimate = getAverageCrowdEstimate(event.crowdEstimates);
  const overallRating = getOverallAverageRating(event.ratings);
  const { t } = useLanguage();

  return (
    <div
      className={`bg-brand-secondary rounded-lg p-5 shadow-lg border border-brand-tertiary transition-all duration-300 ${!isMapMode ? 'cursor-pointer hover:bg-brand-tertiary transform hover:-translate-y-1' : ''}`}
      onClick={!isMapMode ? () => onSelectEvent(event) : undefined}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="text-xl font-bold text-white"><TranslatedText>{event.name}</TranslatedText></h3>
          <p className="text-sm text-brand-text-secondary flex items-center gap-1 mt-1">
            <MapPinIcon className="w-4 h-4" /> 
            <TranslatedText>{event.location}</TranslatedText>
          </p>
        </div>
        <div className={`text-sm font-bold px-3 py-1 rounded-full shrink-0 ${hype.color}`}>
            {hype.text}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 justify-between items-center text-sm text-brand-text-secondary">
        <div className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5"/>
            <span>{event.checkedInUsers.length} {t('checkedIn', 'checked in')}</span>
             {crowdEstimate.average > 0 && <span className="text-white font-semibold">(~{Math.round(crowdEstimate.average)})</span>}
        </div>
        {overallRating > 0 && (
            <div className="flex items-center gap-1 text-brand-neon">
                <StarIcon className="w-5 h-5"/>
                <span className="font-bold">{overallRating.toFixed(1)}</span>
            </div>
        )}
        <div className="flex items-center gap-2 text-brand-text-secondary font-semibold">
          <ClockIcon className="w-5 h-5"/>
          <span>{t('expiresIn', 'Expires in {hours}h {minutes}m').replace('{hours}', hours.toString()).replace('{minutes}', minutes.toString())}</span>
        </div>
      </div>
       {isMapMode && isFocused && (
            <div className="mt-4 border-t border-brand-tertiary pt-3 animate-fadeIn">
                <button 
                    onClick={() => onSelectEvent(event)}
                    className="w-full flex items-center justify-center gap-2 text-center bg-brand-neon text-brand-primary font-bold py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 transform rotate-180" />
                    {t('viewDetails', 'View Details')}
                </button>
            </div>
        )}
    </div>
  );
};

export default EventCard;