import React, { useState, useEffect } from 'react';
import { Event, Poll, ChatMessage, RatingCategory, User, CrowdEstimate, HypeLevel, PrivateChat } from '../types';
import { calculateTimeLeft } from '../utils/helpers';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, MapPinIcon, ChartBarIcon, ArrowRightOnRectangleIcon, UserGroupIcon, ShareIcon, QrCodeIcon, LockClosedIcon, ChatBubbleIcon, BoltIcon, UsersIcon, SVGProps, TrashIcon } from './Icons';
import Chat from './Chat';
import Ratings from './Ratings';
import Polls from './Polls';
import CrowdEstimator from './CrowdEstimator';
import QrScanner from './QrScanner';
import PeopleCarousel from './PeopleCarousel';
import HypeRater from './HypeRater';
import ConfirmationModal from './ConfirmationModal';
import { useLanguage } from '../contexts/LanguageContext';
import TranslatedText from './TranslatedText';

type Tab = 'chat' | 'crowd' | 'ratings' | 'polls';

interface EventDetailProps {
  event: Event;
  currentUser: User;
  allUsers: User[];
  onBack: () => void;
  onUpdateEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onSendPrivateChatInvite: (recipient: User) => void;
  privateChats: PrivateChat[];
}

const EventDetail: React.FC<EventDetailProps> = (props) => {
  const { event, currentUser, allUsers, onBack, onUpdateEvent, onDeleteEvent, onSendPrivateChatInvite, privateChats } = props;
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(event.createdAt));
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { t, language } = useLanguage();

  const isUserCheckedIn = (event.checkedInUsers || []).includes(currentUser.id);
  const isCreator = event.createdBy === currentUser.id;
  const eventUrl = window.location.href;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(event.createdAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [event.createdAt]);

  const handleCheckInToggle = () => {
    let updatedCheckedInUsers = [...(event.checkedInUsers || [])];
    let updatedPolls = [...(event.polls || [])];

    if (isUserCheckedIn) {
      // Check out
      updatedCheckedInUsers = updatedCheckedInUsers.filter(id => id !== currentUser.id);
      const hasCheckoutPoll = (event.polls || []).some(p => p.id === 'checkout-poll');
      if (!hasCheckoutPoll) {
        const checkoutPoll: Poll = {
            id: 'checkout-poll',
            question: t('whyDidYouLeave', 'Why did you leave?'),
            options: { 
                [t('notMyVibe', 'Not my vibe')]: 0, 
                [t('tooCrowded', 'Too crowded')]: 0, 
                [t('endOfNight', 'End of night')]: 0, 
                [t('somethingElse', 'Something else')]: 0 
            },
            voters: {},
        };
        updatedPolls.push(checkoutPoll);
      }
    } else {
      updatedCheckedInUsers.push(currentUser.id);
    }
    onUpdateEvent({ ...event, checkedInUsers: updatedCheckedInUsers, polls: updatedPolls });
  };
  
  const handleScan = (data: string | null) => {
    setIsScanning(false);
    if (data && data === eventUrl) {
        setScanResult({ type: 'success', message: t('validInvite', 'Valid Invite! Access Granted.') });
    } else {
        setScanResult({ type: 'error', message: t('invalidInvite', 'Invalid or incorrect QR code.') });
    }
    setTimeout(() => setScanResult(null), 5000);
  };


  const handleVote = (pollId: string, option: string) => {
    const updatedPolls = (event.polls || []).map(p => {
      if (p.id === pollId) {
        const newOptions = { ...p.options };
        const newVoters = { ...p.voters };
        const previousVote = p.voters[currentUser.id];
        if (previousVote) {
          newOptions[previousVote] = Math.max(0, newOptions[previousVote] - 1);
        }
        newOptions[option] = (newOptions[option] || 0) + 1;
        newVoters[currentUser.id] = option;
        return { ...p, options: newOptions, voters: newVoters };
      }
      return p;
    });
    onUpdateEvent({ ...event, polls: updatedPolls });
  };

  const handleAddMessage = (text: string, options?: { embedUrl?: string; imageUrl?: string }) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      user: currentUser,
      text,
      timestamp: new Date(),
      votesToKick: {},
      embedUrl: options?.embedUrl,
      imageUrl: options?.imageUrl,
    };
    onUpdateEvent({ ...event, chat: [...(event.chat || []), newMessage] });
  };

  
  const handleRate = (category: RatingCategory, rating: number) => {
    const currentRatings = event.ratings || { music: [], ambiance: [], crowd: [], capacity: [], service: [], hype: [] };
    const categoryRatings = currentRatings[category] || [];

    onUpdateEvent({
      ...event,
      ratings: {
        ...currentRatings,
        [category]: [...categoryRatings, rating],
      },
    });
  };

  const handleRateHype = (level: HypeLevel) => {
    const currentRatings = event.ratings || { music: [], ambiance: [], crowd: [], capacity: [], service: [], hype: [] };
    const otherHypeRatings = (currentRatings.hype || []).filter(h => h && h.userId !== currentUser.id);
    const newHypeRatings = [...otherHypeRatings, { userId: currentUser.id, level }];
    onUpdateEvent({ ...event, ratings: { ...currentRatings, hype: newHypeRatings } });
  };

  const handleVoteToKick = (messageId: string) => {
    if (!event.chat) return;

    const updatedChat = event.chat.map(msg => {
      if (msg.id === messageId) return { ...msg, votesToKick: { ...msg.votesToKick, [currentUser.id]: true } };
      return msg;
    });

    const targetMessage = updatedChat.find(msg => msg.id === messageId);
    if (!targetMessage) return;

    const voteCount = Object.keys(targetMessage.votesToKick).length;
    const requiredVotes = Math.ceil((event.checkedInUsers || []).length * 0.6);
    let updatedKickedUsers = [...(event.kickedUsers || [])];
    
    if (voteCount >= requiredVotes && !updatedKickedUsers.includes(targetMessage.user.id)) {
      updatedKickedUsers.push(targetMessage.user.id);
    }
    onUpdateEvent({ ...event, chat: updatedChat, kickedUsers: updatedKickedUsers });
  };

  const handleCrowdEstimate = (estimate: number) => {
    const newEstimate: CrowdEstimate = { userId: currentUser.id, estimate, timestamp: new Date() };
    const otherEstimates = (event.crowdEstimates || []).filter(e => e && e.userId !== currentUser.id);
    onUpdateEvent({ ...event, crowdEstimates: [...otherEstimates, newEstimate] });
  };

  const handleCreatePoll = (question: string, options: string[]) => {
      const newPoll: Poll = {
        id: `poll-${Date.now()}`,
        question,
        options: options.reduce((acc, opt) => ({...acc, [opt]: 0}), {}),
        voters: {}
      };
      onUpdateEvent({...event, polls: [...(event.polls || []), newPoll]});
  };

  // Provide a default empty ratings object if it's missing to prevent crashes in child components.
  const safeRatings = event.ratings || { music: [], ambiance: [], crowd: [], capacity: [], service: [], hype: [] };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat': return <Chat messages={event.chat || []} onAddMessage={handleAddMessage} currentUser={currentUser} onVoteToKick={handleVoteToKick} checkedInUsersCount={(event.checkedInUsers || []).length} kickedUsers={event.kickedUsers || []} isUserCheckedIn={isUserCheckedIn} onSendPrivateChatInvite={onSendPrivateChatInvite} privateChats={privateChats} />;
      case 'crowd': return (
        <div>
            <PeopleCarousel 
              allUsers={allUsers}
              checkedInUserIds={event.checkedInUsers || []}
              currentUser={currentUser}
              onSendInvite={onSendPrivateChatInvite}
              privateChats={privateChats}
            />
            <div className="my-6 border-b border-brand-tertiary"></div>
            <CrowdEstimator estimates={event.crowdEstimates || []} onEstimate={handleCrowdEstimate} isUserCheckedIn={isUserCheckedIn} currentUser={currentUser} />
        </div>
      );
      case 'ratings': return (
        <div>
          <HypeRater ratings={safeRatings} onRateHype={handleRateHype} isUserCheckedIn={isUserCheckedIn} currentUser={currentUser} />
          <div className="my-6 border-b border-brand-tertiary"></div>
          <Ratings ratings={safeRatings} onRate={handleRate} isUserCheckedIn={isUserCheckedIn} />
        </div>
      );
      case 'polls': return <Polls polls={event.polls || []} onVote={handleVote} onCreatePoll={handleCreatePoll} currentUser={currentUser} isUserCheckedIn={isUserCheckedIn} />;
      default: return null;
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(eventUrl)}`;

  return (
    <div className="animate-slideInUp">
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
            onDeleteEvent(event.id);
            setIsDeleteModalOpen(false);
        }}
        title={t('confirmDeleteEventTitle', 'Delete Event')}
        message={t('confirmDeleteEventMessage', "Are you sure you want to permanently delete this event? This action cannot be undone.")}
        confirmText={t('deleteEvent', 'Delete Event')}
      />
      {isScanning && <QrScanner onScan={handleScan} onClose={() => setIsScanning(false)} />}
      <button onClick={onBack} className="flex items-center gap-2 text-brand-text-secondary hover:text-white mb-4">
        <ArrowLeftIcon className="w-5 h-5"/> {t('backToList', 'Back to list')}
      </button>
      
       {scanResult && (
            <div className={`p-4 rounded-md mb-4 text-center font-bold animate-fadeIn ${scanResult.type === 'success' ? 'bg-brand-neon/20 text-brand-neon' : 'bg-brand-tertiary text-brand-text-secondary'}`}>
                {scanResult.message}
            </div>
        )}

      <div className="bg-brand-secondary rounded-lg p-5 mb-4 border border-brand-tertiary">
        <div className="flex justify-between items-start">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">{event.visibility === 'private' && <LockClosedIcon className="w-6 h-6 text-brand-text-secondary" />} <TranslatedText>{event.name}</TranslatedText></h2>
            {isCreator && (
                <button onClick={() => setIsDeleteModalOpen(true)} className="text-brand-text-secondary hover:text-red-500 transition-colors" title={t('deleteEvent', 'Delete Event')}>
                    <TrashIcon className="w-6 h-6" />
                </button>
            )}
        </div>
        <p className="text-brand-text-secondary mt-1 flex items-center gap-2"><MapPinIcon className="w-4 h-4"/> <TranslatedText>{event.location}</TranslatedText></p>
        <p className="text-gray-400 mt-2"><TranslatedText>{event.description}</TranslatedText></p>
        <div className="mt-4 flex flex-wrap gap-4 justify-between items-center">
            <button onClick={handleCheckInToggle} className={`font-bold py-2 px-6 rounded-full flex items-center gap-2 hover:scale-105 transition-transform ${isUserCheckedIn ? 'bg-brand-tertiary text-white' : 'bg-brand-neon text-brand-primary'}`}>
              {isUserCheckedIn ? <ArrowRightOnRectangleIcon className="w-5 h-5"/> : <CheckCircleIcon className="w-5 h-5"/>}
              {isUserCheckedIn ? t('checkOut', 'Check Out') : t('checkIn', 'Check In')}
            </button>
            <div className="text-brand-text-secondary flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5"/>
                <span>{t('currentlyHere', '{count} currently here').replace('{count}', (event.checkedInUsers || []).length.toString())} {event.capacity && `/ ${event.capacity}`}</span>
            </div>
        </div>
      </div>
      
      {event.visibility === 'private' && (
        <div className="bg-brand-secondary rounded-lg p-5 mb-4 border border-brand-tertiary">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ShareIcon className="w-6 h-6"/> {t('sharePrivateEvent', 'Share Private Event')}</h3>
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="bg-white p-2 rounded-md">
                    <img src={qrCodeUrl} alt="Event QR Code" className="w-32 h-32"/>
                </div>
                <div className="flex-1">
                    <p className="text-brand-text-secondary mb-2">{t('sharePrivateEventDescription', 'Share this QR code or link to invite others. This event is not visible on the public list.')}</p>
                    <input type="text" readOnly value={eventUrl} className="w-full bg-brand-tertiary p-2 rounded-md border border-brand-tertiary/50 text-brand-text"/>
                    {isCreator && (
                        <button onClick={() => setIsScanning(true)} className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-brand-tertiary text-brand-text-secondary font-semibold rounded-md hover:bg-brand-tertiary/50 transition-colors">
                            <QrCodeIcon className="w-5 h-5"/>
                            <span>{t('scanInvites', 'Scan Invites')}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

      {event.coordinates && (
        <div className="bg-brand-secondary rounded-lg mb-4 border border-brand-tertiary overflow-hidden h-64">
           <iframe
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${event.coordinates.lat},${event.coordinates.lng}&z=15&output=embed&hl=${language}`}
            ></iframe>
        </div>
      )}
      
      <div className="bg-brand-secondary rounded-lg border border-brand-tertiary">
        <div className="flex border-b border-brand-tertiary overflow-x-auto">
            <TabButton icon={<ChatBubbleIcon />} label={t('chat','Chat')} isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
            <TabButton icon={<UsersIcon />} label={t('crowd', 'Crowd')} isActive={activeTab === 'crowd'} onClick={() => setActiveTab('crowd')} />
            <TabButton icon={<BoltIcon />} label={t('ratings', 'Ratings')} isActive={activeTab === 'ratings'} onClick={() => setActiveTab('ratings')} />
            <TabButton icon={<ChartBarIcon />} label={t('polls', 'Polls')} isActive={activeTab === 'polls'} onClick={() => setActiveTab('polls')} />
        </div>
        <div className="p-4 min-h-[300px]">
            {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

interface TabButtonProps {
    icon: React.ReactElement<SVGProps>;
    label: string;
    isActive: boolean;
    onClick: () => void;
    notificationCount?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick, notificationCount = 0 }) => (
    <button
        onClick={onClick}
        className={`relative flex-1 shrink-0 flex justify-center items-center gap-2 p-4 font-semibold transition-colors ${
            isActive ? 'text-brand-neon bg-brand-tertiary/50' : 'text-brand-text-secondary hover:bg-brand-tertiary/30'
        }`}
    >
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
        <span>{label}</span>
        {notificationCount > 0 && (
            <span className="absolute top-2 right-2 flex justify-center items-center h-5 w-5 rounded-full bg-brand-neon text-brand-primary text-xs font-bold">
                {notificationCount}
            </span>
        )}
    </button>
);


export default EventDetail;