

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Event, RatingCategory, RATING_CATEGORIES } from '../types';
import EventCard from './EventCard';
import { MapPinIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import FilterModal from './FilterModal';
import { getOverallAverageRating, getAverageRating, getAverageCrowdEstimate } from '../utils/helpers';

interface EventListProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onMapView: () => void;
}

export interface Filters {
  minRating: number;
  minCheckIns: number;
  minAvgCrowd: number;
  specificRatings: Record<RatingCategory, number>;
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

const EventList: React.FC<EventListProps> = ({ events, onSelectEvent, onMapView }) => {
  const publicEvents = events.filter(e => e.visibility === 'public');
  const { t } = useLanguage();
  
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible]);
  
  const isFilterActive = useMemo(() => {
    return filters.minRating > 0 ||
           filters.minCheckIns > 0 ||
           filters.minAvgCrowd > 0 ||
           // Fix: Cast `r` to number to resolve TypeScript error `Operator '>' cannot be applied to types 'unknown' and 'number'`.
           Object.values(filters.specificRatings).some(r => (r as number) > 0);
  }, [filters]);

  const filteredEvents = useMemo(() => {
    return publicEvents.filter(event => {
        // Search term filter
        const matchesSearch = searchTerm.trim() === '' ||
            event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        // Advanced filters
        if (filters.minRating > 0) {
            const overallRating = getOverallAverageRating(event.ratings);
            if (overallRating < filters.minRating) return false;
        }

        if (event.checkedInUsers.length < filters.minCheckIns) return false;

        if (filters.minAvgCrowd > 0) {
            const avgCrowd = getAverageCrowdEstimate(event.crowdEstimates).average;
            if (avgCrowd < filters.minAvgCrowd) return false;
        }

        for (const cat of RATING_CATEGORIES) {
            const category = cat as RatingCategory;
            if (filters.specificRatings[category] > 0) {
                 const avgCategoryRating = getAverageRating(event.ratings[category]);
                 if (avgCategoryRating < filters.specificRatings[category]) return false;
            }
        }

        return true;
    });
  }, [publicEvents, searchTerm, filters]);

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
  };


  return (
    <div className="animate-fadeIn">
        <FilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            currentFilters={filters}
            onApplyFilters={handleApplyFilters}
        />
        <div className="flex justify-between items-center mb-6 min-h-[48px]">
            <div className="flex-1">
                {!isSearchVisible && (
                    <h2 className="text-3xl font-bold text-white animate-fadeIn">{t('liveNow', 'Live Now')}</h2>
                )}
                {isSearchVisible && (
                    <div className="relative w-full animate-fadeIn">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary">
                            <MagnifyingGlassIcon className="w-5 h-5"/>
                        </span>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onBlur={() => { if (!searchTerm) setIsSearchVisible(false); }}
                            placeholder={t('searchPlaceholder', 'Search by name or location...')}
                            className="w-full bg-brand-secondary border border-brand-tertiary rounded-full py-2 pl-10 pr-4 text-brand-text focus:ring-2 focus:ring-brand-neon focus:border-brand-neon outline-none"
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 pl-4">
                {!isSearchVisible && (
                    <button
                        onClick={() => {setIsSearchVisible(true);}}
                        className="p-2 text-brand-text-secondary hover:text-white"
                        aria-label={t('search', 'Search')}
                    >
                        <MagnifyingGlassIcon className="w-6 h-6" />
                    </button>
                )}
                <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className="p-2 text-brand-text-secondary hover:text-white relative"
                    aria-label={t('filter', 'Filter')}
                >
                    <AdjustmentsHorizontalIcon className="w-6 h-6" />
                    {isFilterActive && (
                        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-brand-neon ring-2 ring-brand-primary" />
                    )}
                </button>
                <button 
                    onClick={onMapView}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-secondary hover:bg-brand-tertiary rounded-full text-brand-text-secondary hover:text-brand-neon transition-colors text-sm font-semibold">
                    <MapPinIcon className="w-5 h-5" />
                    <span>{t('mapView', 'Map View')}</span>
                </button>
            </div>
        </div>
        
        {filteredEvents.length > 0 ? (
            <div className="space-y-4">
                {filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} onSelectEvent={onSelectEvent} />
                ))}
            </div>
        ) : (
            <div className="text-center py-20">
                <p className="text-brand-text-secondary text-lg">{t('noResultsFound', 'No events match your search.')}</p>
                <p className="text-brand-text-secondary">{t('tryDifferentFilters', 'Try adjusting your search or filters.')}</p>
            </div>
        )}
    </div>
  );
};

export default EventList;
