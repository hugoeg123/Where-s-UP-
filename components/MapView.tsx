import React, { useState } from 'react';
import { Event } from '../types';
import EventCard from './EventCard';
import { ListBulletIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface MapViewProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onListView: () => void;
}

const MapView: React.FC<MapViewProps> = ({ events, onSelectEvent, onListView }) => {
  const publicEvents = events.filter(e => e.visibility === 'public' && e.coordinates);
  const [focusedEvent, setFocusedEvent] = useState<Event | null>(publicEvents[0] || null);
  const { t, language } = useLanguage();

  const handleFocusEvent = (event: Event) => {
    setFocusedEvent(event);
  };

  // Center map on focused event, or first event, or default to a world view.
  const center = focusedEvent?.coordinates || (publicEvents[0]?.coordinates || { lat: 34.0522, lng: -118.2437 });
  const zoom = focusedEvent ? 15 : (publicEvents.length > 0 ? 12 : 2);


  return (
    <div className="animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">{t('mapView', 'Map View')}</h2>
             <button 
                onClick={onListView}
                className="flex items-center gap-2 px-4 py-2 bg-brand-secondary hover:bg-brand-tertiary rounded-full text-brand-neon transition-colors text-sm font-semibold">
                <ListBulletIcon className="w-5 h-5" />
                <span>{t('listView', 'List View')}</span>
            </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)]">
            <div className="flex-1 md:flex-[2_2_0%] rounded-lg overflow-hidden border border-brand-tertiary">
                 <iframe
                    key={focusedEvent?.id || 'default'} // Key forces iframe to re-render when focused event changes
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${center.lat},${center.lng}&z=${zoom}&output=embed&hl=${language}`}
                ></iframe>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                 {publicEvents.length > 0 ? (
                    publicEvents.map(event => {
                        const isFocused = focusedEvent?.id === event.id;
                        return (
                            <div 
                                key={event.id} 
                                onClick={() => handleFocusEvent(event)} 
                                className={`rounded-lg transition-all cursor-pointer ${isFocused ? 'ring-2 ring-brand-neon shadow-lg shadow-brand-neon/20' : ''}`}
                            >
                               <EventCard 
                                   event={event} 
                                   onSelectEvent={onSelectEvent} 
                                   isMapMode={true}
                                   isFocused={isFocused}
                                />
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-20 bg-brand-secondary rounded-lg">
                        <p className="text-brand-text-secondary">No public events with location data.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default MapView;