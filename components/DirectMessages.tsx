

import React, { useState, useRef, useEffect } from 'react';
import { PrivateChat, User } from '../types';
import { PaperAirplaneIcon, ArrowLeftIcon, LockClosedIcon, XCircleIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface DirectMessagesProps {
    privateChats: PrivateChat[];
    currentUser: User;
    onRespondToInvite: (chatId: string, response: 'active' | 'declined') => void;
    onSendMessage: (chatId: string, text: string) => void;
    onReadChat: (chatId: string) => void;
    onBack: () => void;
    onCancelInvite: (chatId: string) => void;
}

const DirectMessages: React.FC<DirectMessagesProps> = (props) => {
    const { privateChats, currentUser, onRespondToInvite, onSendMessage, onReadChat, onBack, onCancelInvite } = props;
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const { t } = useLanguage();

    const pendingInvites = privateChats.filter(c => c.status === 'pending' && c.initiatedBy !== currentUser.id);
    const sentInvites = privateChats.filter(c => c.status === 'pending' && c.initiatedBy === currentUser.id);
    const activeChats = privateChats.filter(c => c.status === 'active');
    
    const handleSelectChat = (chat: PrivateChat) => {
        if(chat.unreadCount[currentUser.id] > 0) {
            onReadChat(chat.id);
        }
        setActiveChatId(chat.id);
    };

    const activeChat = activeChatId ? privateChats.find(c => c.id === activeChatId) : null;

    if (activeChat) {
        return <PrivateChatWindow chat={activeChat} currentUser={currentUser} onSendMessage={onSendMessage} onBack={() => setActiveChatId(null)} />;
    }

    return (
        <div className="animate-slideInUp">
             <button onClick={onBack} className="flex items-center gap-2 text-brand-text-secondary hover:text-white mb-4">
                <ArrowLeftIcon className="w-5 h-5"/> {t('back', 'Back')}
            </button>
            <h2 className="text-3xl font-bold text-white mb-6">{t('directMessages', 'Direct Messages')}</h2>

            {pendingInvites.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{t('pendingInvites', 'Pending Invites')}</h3>
                    <div className="space-y-2">
                        {pendingInvites.map(chat => {
                            const otherUserId = Object.keys(chat.participants).find(id => id !== currentUser.id);
                            if (!otherUserId) return null;
                            const otherUserName = chat.participants[otherUserId];

                            return (
                                <div key={chat.id} className="bg-brand-tertiary/50 p-3 rounded-lg flex justify-between items-center">
                                    <p><span className="font-bold text-brand-neon">{otherUserName}</span> wants to chat.</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => onRespondToInvite(chat.id, 'active')} className="bg-brand-neon text-brand-primary px-3 py-1 rounded-md text-sm font-semibold">Accept</button>
                                        <button onClick={() => onRespondToInvite(chat.id, 'declined')} className="bg-brand-tertiary text-white px-3 py-1 rounded-md text-sm font-semibold">Decline</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {sentInvites.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{t('sentRequests', 'Sent Requests')}</h3>
                    <div className="space-y-2">
                        {sentInvites.map(chat => {
                            const otherUserId = Object.keys(chat.participants).find(id => id !== currentUser.id);
                            if (!otherUserId) return null;
                            const otherUserName = chat.participants[otherUserId];

                            return (
                                <div key={chat.id} className="bg-brand-tertiary/50 p-3 rounded-lg flex justify-between items-center">
                                    <p>{t('inviteSentTo', 'Invite sent to')} <span className="font-bold text-brand-neon">{otherUserName}</span></p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-brand-text-secondary font-semibold">{t('pending', 'PENDING')}</span>
                                        <button onClick={() => onCancelInvite(chat.id)} title={t('cancelRequest', 'Cancel')} className="text-red-400 p-1 rounded-full text-sm font-semibold hover:bg-red-500/20">
                                            <XCircleIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-xl font-bold text-white mb-2">{t('conversations', 'Conversations')}</h3>
                {activeChats.length > 0 ? (
                    <div className="space-y-2">
                        {activeChats.map(chat => {
                             const otherUserId = Object.keys(chat.participants).find(id => id !== currentUser.id);
                             if (!otherUserId) return null;
                             const otherUserName = chat.participants[otherUserId];
                             const lastMessage = chat.messages[chat.messages.length - 1];
                             const unreadCount = chat.unreadCount[currentUser.id] || 0;
                             return (
                                <button key={chat.id} onClick={() => handleSelectChat(chat)} className="w-full text-left bg-brand-tertiary/50 hover:bg-brand-tertiary p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-white">{otherUserName}</p>
                                        <p className={`text-sm ${unreadCount > 0 ? 'text-white font-bold' : 'text-brand-text-secondary'} truncate`}>{lastMessage ? `${lastMessage.senderId === currentUser.id ? 'You: ' : ''}${lastMessage.text}` : 'No messages yet.'}</p>
                                    </div>
                                    {unreadCount > 0 && (
                                        <span className="flex justify-center items-center h-6 w-6 rounded-full bg-brand-neon text-brand-primary text-xs font-bold">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                             )
                        })}
                    </div>
                ) : (
                    <p className="text-brand-text-secondary text-center py-4">No active conversations. Send an invite from the 'Crowd' tab in an event to get started!</p>
                )}
            </div>
        </div>
    );
};


interface PrivateChatWindowProps {
    chat: PrivateChat;
    currentUser: User;
    onSendMessage: (chatId: string, text: string) => void;
    onBack: () => void;
}

const PrivateChatWindow: React.FC<PrivateChatWindowProps> = ({ chat, currentUser, onSendMessage, onBack }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const otherParticipantId = Object.keys(chat.participants).find(id => id !== currentUser.id);
    const otherParticipantName = otherParticipantId ? chat.participants[otherParticipantId] : 'Unknown User';
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat.messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(chat.id, newMessage.trim());
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-250px)]">
            <div className="flex items-center mb-4">
                <button onClick={onBack} className="flex items-center gap-2 text-brand-text-secondary hover:text-white mr-4">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold text-white">Chat with {otherParticipantName}</h3>
            </div>
             <div className="flex-grow overflow-y-auto pr-2 space-y-3">
                <div className="text-center text-xs text-brand-text-secondary my-2 flex items-center justify-center gap-1">
                    <LockClosedIcon className="w-3 h-3" />
                    <span>End-to-end encrypted. Messages disappear in 24 hours.</span>
                </div>
                {chat.messages.map(msg => {
                    const isCurrentUser = msg.senderId === currentUser.id;
                    return (
                        <div key={msg.id} className={`flex flex-col items-stretch ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            <div className={`p-3 rounded-lg max-w-xs ${isCurrentUser ? 'bg-brand-neon text-brand-primary' : 'bg-brand-tertiary'}`}>
                                <p className="text-md break-words">{msg.text}</p>
                                {msg.timestamp && <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                            </div>
                        </div>
                    );
                })}
                 <div ref={messagesEndRef} />
             </div>
             <form onSubmit={handleSend} className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type an encrypted message..."
                    className="flex-grow w-full bg-brand-tertiary border border-brand-tertiary/50 rounded-full py-2 px-4 text-brand-text focus:ring-2 focus:ring-brand-neon focus:border-brand-neon outline-none transition"
                />
                <button type="submit" disabled={!newMessage.trim()} className="bg-brand-neon text-brand-primary p-3 rounded-full hover:scale-110 transition-transform disabled:opacity-50">
                    <PaperAirplaneIcon className="w-5 h-5" />
                </button>
             </form>
        </div>
    );
}

export default DirectMessages;