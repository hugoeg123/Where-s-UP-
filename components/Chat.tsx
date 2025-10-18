import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User, PrivateChat } from '../types';
import { PaperAirplaneIcon, FlagIcon, PhotoIcon, EnvelopeIcon, UserCircleIcon } from './Icons';
import { linkify, parseForEmbed } from '../utils/helpers';
import EmbedPreview from './EmbedPreview';
import { useTranslation } from '../hooks/useTranslation';

interface ChatProps {
  messages: ChatMessage[];
  currentUser: User;
  kickedUsers: string[];
  checkedInUsersCount: number;
  isUserCheckedIn: boolean;
  onAddMessage: (text: string, options?: { embedUrl?: string, imageUrl?: string }) => void;
  onVoteToKick: (messageId: string) => void;
  onSendPrivateChatInvite: (recipient: User) => void;
  privateChats: PrivateChat[];
}

const MessageText: React.FC<{ text: string }> = ({ text }) => {
    const { translatedText, isLoading } = useTranslation(text);
    const content = linkify(translatedText);
    return <p className={`text-md break-words ${isLoading ? 'opacity-50' : ''}`}>{content}</p>;
};


const Chat: React.FC<ChatProps> = ({ messages, currentUser, kickedUsers, checkedInUsersCount, isUserCheckedIn, onAddMessage, onVoteToKick, onSendPrivateChatInvite, privateChats }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<null | HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const visibleMessages = messages.filter(msg => !kickedUsers.includes(msg.user.id));

  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages.length]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && isUserCheckedIn) {
      const embedUrl = currentUser.authType === 'registered' ? parseForEmbed(newMessage.trim()) : undefined;
      onAddMessage(newMessage.trim(), { embedUrl });
      setNewMessage('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const imageUrl = loadEvent.target?.result as string;
        onAddMessage('', { imageUrl });
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const requiredVotes = Math.ceil(checkedInUsersCount * 0.6);
  const canEmbed = currentUser.authType === 'registered';

  return (
    <div className="flex flex-col h-full max-h-[400px]">
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {visibleMessages.map((msg) => {
            const isCurrentUser = msg.user.id === currentUser.id;
            const hasVoted = msg.votesToKick[currentUser.id];
            const canInvite = currentUser.authType === 'registered' && msg.user.authType === 'registered' && !isCurrentUser;

            const existingChat = privateChats.find(c => {
                const participants = Object.keys(c.participants);
                return participants.length === 2 && participants.includes(currentUser.id) && participants.includes(msg.user.id);
            });

            const isPending = existingChat && existingChat.status === 'pending';

            return (
              <div key={msg.id} className={`flex gap-3 group ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                   <div>
                        {msg.user.avatarUrl ? (
                            <img src={msg.user.avatarUrl} alt={msg.user.name} className="w-8 h-8 rounded-full"/>
                        ) : (
                            <UserCircleIcon className="w-8 h-8 text-brand-tertiary" />
                        )}
                   </div>
                  <div className={`flex flex-col items-stretch ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                      <div className={`p-3 rounded-lg max-w-xs ${isCurrentUser ? 'bg-brand-neon text-brand-primary' : 'bg-brand-tertiary'}`}>
                          <div className="flex justify-between items-center gap-2">
                            <p className="font-bold text-sm">{msg.user.name}</p>
                            {canInvite && (
                                <button
                                    onClick={() => onSendPrivateChatInvite(msg.user)}
                                    title={isPending ? `Invite sent to ${msg.user.name}` : `Send private message to ${msg.user.name}`}
                                    className={`text-brand-text-secondary opacity-0 group-hover:opacity-100 transition-all ${isPending ? 'cursor-not-allowed' : 'hover:text-brand-neon'}`}
                                    disabled={isPending}
                                >
                                    <EnvelopeIcon className="w-5 h-5"/>
                                </button>
                            )}
                          </div>
                          {msg.text && <MessageText text={msg.text} />}
                          {msg.imageUrl && <img src={msg.imageUrl} alt="User upload" className="mt-2 rounded-lg max-h-48"/>}
                          {msg.embedUrl && <EmbedPreview url={msg.embedUrl} />}
                          <p className="text-xs opacity-70 mt-1 text-right">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                       {!isCurrentUser && isUserCheckedIn && (
                         <button 
                            onClick={() => onVoteToKick(msg.id)}
                            disabled={hasVoted}
                            className="text-xs flex items-center gap-1 mt-1 px-2 py-1 rounded text-brand-text-secondary opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Vote to kick ${msg.user.name}`}
                         >
                            <FlagIcon className="w-3 h-3"/> 
                            Vote to Kick ({Object.keys(msg.votesToKick).length}/{requiredVotes})
                         </button>
                       )}
                  </div>
              </div>
            )
        })}
         <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 items-center">
        {isUserCheckedIn && (
            <>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-brand-text-secondary hover:text-brand-neon transition-colors" title="Upload an image">
                    <PhotoIcon className="w-6 h-6" />
                </button>
            </>
        )}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isUserCheckedIn ? "Join the conversation..." : "Check in to chat"}
          disabled={!isUserCheckedIn}
          className="flex-grow w-full bg-brand-tertiary border border-brand-tertiary/50 rounded-full py-2 px-4 text-brand-text focus:ring-2 focus:ring-brand-neon focus:border-brand-neon outline-none transition disabled:opacity-50"
        />
        <button type="submit" disabled={!isUserCheckedIn || !newMessage.trim()} className="bg-brand-neon text-brand-primary p-3 rounded-full hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>
       {!canEmbed && isUserCheckedIn && (
            <p className="text-xs text-brand-text-secondary text-center mt-2">Sign in to embed content from social media.</p>
        )}
    </div>
  );
};

export default Chat;