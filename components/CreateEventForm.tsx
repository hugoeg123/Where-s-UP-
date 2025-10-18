import React, { useState } from 'react';
import { Event, User } from '../types';
import { ArrowLeftIcon, XCircleIcon, MapPinIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface CreateEventFormProps {
  currentUser: User;
  onBack: () => void;
  onCreate: (newEventData: Omit<Event, 'id' | 'createdAt' | 'checkedInUsers' | 'kickedUsers' | 'chat' | 'ratings' | 'polls' | 'crowdEstimates'>) => void;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onBack, onCreate, currentUser }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [capacity, setCapacity] = useState<string>('');
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !location) {
      setError(t('errorFillAllFields', 'Please fill out all fields.'));
      return;
    }
    setError('');
    onCreate({
      name,
      description,
      location,
      isAnonymous,
      createdBy: isAnonymous ? 'Anonymous' : currentUser.id,
      visibility,
      capacity: capacity ? parseInt(capacity, 10) : null,
    });
  };

  return (
    <div className="animate-slideInUp max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-brand-text-secondary hover:text-white mb-4">
        <ArrowLeftIcon className="w-5 h-5"/> {t('cancel', 'Cancel')}
      </button>
      <div className="bg-brand-secondary p-8 rounded-lg border border-brand-tertiary">
        <h2 className="text-3xl font-bold text-white mb-6">{t('createEvent', 'Create an Event')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t('eventType', 'Event Type')}</label>
            <div className="flex gap-2 rounded-lg bg-brand-tertiary p-1">
                <button type="button" onClick={() => setVisibility('public')} className={`flex-1 p-2 rounded-md font-semibold text-sm transition ${visibility === 'public' ? 'bg-brand-neon text-brand-primary' : 'hover:bg-brand-tertiary/50'}`}>{t('public', 'Public')}</button>
                <button type="button" onClick={() => setVisibility('private')} className={`flex-1 p-2 rounded-md font-semibold text-sm transition ${visibility === 'private' ? 'bg-brand-neon text-brand-primary' : 'hover:bg-brand-tertiary/50'}`}>{t('private', 'Private')}</button>
            </div>
             <p className="text-xs text-brand-text-secondary mt-2">{visibility === 'public' ? t('publicEventDescription', 'Visible to everyone on the main list.') : t('privateEventDescription', 'Only accessible via a direct link or QR code.')}</p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-brand-text-secondary mb-1">{t('description', 'Description')}</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-brand-tertiary border border-brand-tertiary/50 rounded-md p-2 text-brand-text focus:ring-2 focus:ring-brand-neon focus:border-brand-neon outline-none transition" rows={3} placeholder={t('descriptionPlaceholder', "What's the vibe? e.g., 'Chill rooftop sunset session...'")} />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brand-text-secondary mb-1">{t('eventName', 'Event Name')}</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-brand-tertiary border border-brand-tertiary/50 rounded-md p-2 text-brand-text focus:ring-2 focus:ring-brand-neon focus:border-brand-neon outline-none transition" placeholder={t('eventNamePlaceholder', "e.g., Sunset Sessions")} />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-brand-text-secondary mb-1">{t('location', 'Location')}</label>
            <div className="flex flex-col gap-2">
                <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-brand-tertiary border border-brand-tertiary/50 rounded-md p-2 text-brand-text focus:ring-2 focus:ring-brand-neon focus:border-brand-neon outline-none transition" placeholder={t('locationPlaceholder', "e.g., Rooftop Bar, 45 Sky Ave")} />
                <button type="button" disabled className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-brand-tertiary text-brand-text-secondary font-semibold rounded-md disabled:opacity-50 cursor-not-allowed">
                    <MapPinIcon className="w-5 h-5" />
                    <span>{t('importFromGoogle', 'Import from Google (Coming Soon)')}</span>
                </button>
            </div>
          </div>

          {visibility === 'private' && (
             <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-brand-text-secondary mb-1">{t('capacityOptional', 'Capacity (Optional)')}</label>
                <input id="capacity" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full bg-brand-tertiary border border-brand-tertiary/50 rounded-md p-2 text-brand-text focus:ring-2 focus:ring-brand-neon focus:border-brand-neon outline-none transition" placeholder={t('capacityPlaceholder', "e.g., 50")} />
            </div>
          )}

          <div className="flex items-center">
            <input id="isAnonymous" type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-brand-neon focus:ring-brand-neon" />
            <label htmlFor="isAnonymous" className="ml-2 block text-sm text-brand-text-secondary">{t('createAnonymously', 'Create Anonymously')}</label>
          </div>
           {error && (
            <div className="bg-brand-tertiary/50 text-brand-text-secondary text-sm p-3 rounded-md flex items-center gap-2">
              <XCircleIcon className="w-5 h-5" />
              <span>{error}</span>
            </div>
           )}
          <button type="submit" className="w-full bg-brand-neon text-brand-primary font-bold py-3 px-4 rounded-md hover:bg-opacity-90 transition-colors">{t('launchEvent', 'Launch Event')}</button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventForm;