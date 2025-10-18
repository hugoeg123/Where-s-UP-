import React from 'react';
import { User, PrivateChat } from '../types';
import { UserCircleIcon, EnvelopeIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface PeopleCarouselProps {
    allUsers: User[];
    checkedInUserIds: string[];
    currentUser: User;
    onSendInvite: (recipient: User) => void;
    privateChats: PrivateChat[];
}

const PeopleCarousel: React.FC<PeopleCarouselProps> = ({ allUsers, checkedInUserIds, currentUser, onSendInvite, privateChats }) => {
    const { t } = useLanguage();
    const checkedInUsers = checkedInUserIds
        .map(id => {
            const foundUser = allUsers.find(u => u.id === id);
            if (foundUser) return foundUser;
            // Handle legacy or guest users who might not be in the main user list
            const sessionUser = JSON.parse(sessionStorage.getItem('wheresup_user') || '{}');
            if (sessionUser.id === id) return sessionUser;
            return { id, name: `Guest-${id.slice(-4)}`, authType: 'guest' } as User;
        })
        .filter(Boolean) as User[];

    return (
        <div>
            <h3 className="text-xl font-bold text-white mb-3">{t('peopleHere', 'People Here')}</h3>
            <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4">
                {checkedInUsers.map(user => {
                    const isCurrentUser = user.id === currentUser.id;
                    const canInvite = currentUser.authType === 'registered' && user.authType === 'registered' && !isCurrentUser;
                    
                    const existingChat = privateChats.find(c => {
                        const participants = Object.keys(c.participants);
                        return participants.length === 2 && participants.includes(currentUser.id) && participants.includes(user.id);
                    });

                    const isPending = existingChat && existingChat.status === 'pending';


                    return (
                        <div key={user.id} className="flex-shrink-0 w-32 flex flex-col items-center text-center bg-brand-tertiary p-3 rounded-lg">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full mb-2"/>
                            ) : (
                                <UserCircleIcon className="w-16 h-16 text-brand-text-secondary mb-2"/>
                            )}
                            <p className="font-semibold text-sm text-white truncate w-full">{user.name}</p>
                            <p className="text-xs text-brand-text-secondary">{user.authType === 'guest' ? t('guest', 'Guest') : t('member', 'Member')}</p>
                            {canInvite && (
                                isPending ? (
                                    <button
                                        disabled
                                        className="mt-2 w-full flex justify-center items-center gap-1 bg-brand-tertiary text-brand-text-secondary text-xs font-bold py-1 px-2 rounded-md cursor-not-allowed"
                                    >
                                        <span>{t('requestSent', 'Request Sent')}</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onSendInvite(user)}
                                        className="mt-2 w-full flex justify-center items-center gap-1 bg-brand-neon/20 text-brand-neon text-xs font-bold py-1 px-2 rounded-md hover:bg-opacity-80 transition-colors"
                                    >
                                        <EnvelopeIcon className="w-4 h-4" />
                                        <span>{t('dm', 'DM')}</span>
                                    </button>
                                )
                            )}
                            {isCurrentUser && <div className="mt-2 text-xs font-bold py-1 px-2">{t('thisIsYou', 'This is you')}</div>}
                        </div>
                    );
                })}
                 {checkedInUsers.length === 0 && (
                    <p className="text-brand-text-secondary text-sm">{t('noOneCheckedIn', 'No one is checked in yet.')}</p>
                )}
            </div>
        </div>
    );
};

export default PeopleCarousel;