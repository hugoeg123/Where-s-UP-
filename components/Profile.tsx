import React, { useState } from 'react';
import { User, Event } from '../types';
import { ArrowLeftIcon, UserCircleIcon, TrashIcon } from './Icons';
import EventCard from './EventCard';
import ConfirmationModal from './ConfirmationModal';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileProps {
    currentUser: User;
    events: Event[];
    onSelectEvent: (event: Event) => void;
    onBack: () => void;
    onDeleteAccount: () => void;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, events, onSelectEvent, onBack, onDeleteAccount }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { t } = useLanguage();

    return (
        <div className="animate-slideInUp">
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={onDeleteAccount}
                title={t('deleteAccountTitle', 'Delete Account')}
                message={t('deleteAccountConfirmation', "Are you sure? This will permanently delete your account, all events you've created, and your private chats. This action is irreversible.")}
                confirmText={t('deleteAccountConfirm', 'Yes, delete my account')}
            />
            <button onClick={onBack} className="flex items-center gap-2 text-brand-text-secondary hover:text-white mb-6">
                <ArrowLeftIcon className="w-5 h-5"/> {t('back', 'Back')}
            </button>

            <div className="bg-brand-secondary p-8 rounded-lg border border-brand-tertiary mb-6 flex flex-col items-center text-center">
                {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-24 h-24 rounded-full mb-4"/>
                ) : (
                    <UserCircleIcon className="w-24 h-24 text-brand-neon mb-4"/>
                )}
                <h2 className="text-4xl font-bold text-white">{currentUser.name}</h2>
                <p className={`mt-2 text-sm font-semibold px-3 py-1 rounded-full ${currentUser.authType === 'registered' ? 'bg-brand-neon/20 text-brand-neon' : 'bg-brand-tertiary text-brand-text-secondary'}`}>
                    {currentUser.authType === 'registered' ? t('registeredUser', 'Registered User') : t('guest', 'Guest')}
                </p>
            </div>
            
            <div className="mb-8">
                 <h3 className="text-2xl font-bold text-white mb-4">{t('myEvents', 'My Events')}</h3>
                 {events.length > 0 ? (
                    <div className="space-y-4">
                        {events.map(event => (
                            <EventCard key={event.id} event={event} onSelectEvent={onSelectEvent} />
                        ))}
                    </div>
                 ) : (
                    <div className="text-center py-10 bg-brand-secondary rounded-lg border border-brand-tertiary">
                        <p className="text-brand-text-secondary">{t('noCreatedEvents', "You haven't created any events yet.")}</p>
                    </div>
                 )}
            </div>

            <div className="border-t border-red-500/30 pt-6">
                <h3 className="text-xl font-bold text-red-500 mb-2">{t('dangerZone', 'Danger Zone')}</h3>
                <p className="text-brand-text-secondary mb-4">{t('deleteAccountWarning', 'Deleting your account is permanent. All your data will be removed and you will not be able to recover it.')}</p>
                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 font-semibold rounded-md border border-red-500/50 hover:bg-red-600 hover:text-white transition-colors"
                >
                    <TrashIcon className="w-5 h-5"/>
                    {t('deleteMyAccount', 'Delete My Account')}
                </button>
            </div>
        </div>
    );
};

export default Profile;