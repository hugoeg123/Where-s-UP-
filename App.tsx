

import React, { useState, useEffect, useCallback } from 'react';
import { Event, View, User, PrivateChat, PrivateChatMessage } from './types';
import { initialEvents, mockUsers } from './services/mockData';
import EventList from './components/EventList';
import EventDetail from './components/EventDetail';
import CreateEventForm from './components/CreateEventForm';
import Header from './components/Header';
import { PlusIcon } from './components/Icons';
import Login from './components/Login';
import MapView from './components/MapView';
import Profile from './components/Profile';
import DirectMessages from './components/DirectMessages';

// Initialize mock user DB in localStorage if it doesn't exist
const initializeUserDB = () => {
    if (!localStorage.getItem('wheresup_users')) {
        // In a real app, passwords would be hashed and never stored in plaintext.
        // We are initializing the DB without passwords for better security practice.
        localStorage.setItem('wheresup_users', JSON.stringify(mockUsers));
    }
};
initializeUserDB();

const EVENTS_STORAGE_KEY = 'wheresup_events';
const PRIVATE_CHATS_STORAGE_KEY = 'wheresup_private_chats';

const loadEventsFromStorage = (): Event[] => {
    try {
        const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
        if (storedEvents) {
            const parsedEvents = JSON.parse(storedEvents);
            if (!Array.isArray(parsedEvents)) {
                console.error("Stored events are not an array, resetting.");
                localStorage.removeItem(EVENTS_STORAGE_KEY);
                return initialEvents;
            }

            return parsedEvents.map((event: any): Event => {
                const defaultRatings = { music: [], ambiance: [], crowd: [], capacity: [], service: [], hype: [] };
                
                // Ensure chat messages have a valid user object and other required fields
                const sanitizedChat = (event.chat || []).map((msg: any) => ({
                    id: msg.id || `msg-${Date.now()}`,
                    text: msg.text || '',
                    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                    votesToKick: msg.votesToKick || {},
                    user: msg.user && msg.user.id ? msg.user : {id: 'unknown', name: 'Unknown', authType: 'guest'},
                    embedUrl: msg.embedUrl,
                    imageUrl: msg.imageUrl,
                }));

                // Ensure polls have required fields
                const sanitizedPolls = (event.polls || []).map((p: any) => ({
                    id: p.id || `poll-${Date.now()}`,
                    question: p.question || 'No question',
                    options: p.options || {},
                    voters: p.voters || {},
                }));

                return {
                    id: event.id || `evt-${Date.now()}`,
                    name: event.name || 'Untitled Event',
                    description: event.description || '',
                    location: event.location || 'Unknown location',
                    coordinates: event.coordinates,
                    isAnonymous: event.isAnonymous ?? false,
                    createdBy: event.createdBy || 'Anonymous',
                    createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
                    visibility: event.visibility || 'public',
                    capacity: event.capacity ?? null,
                    checkedInUsers: event.checkedInUsers || [],
                    kickedUsers: event.kickedUsers || [],
                    ratings: { ...defaultRatings, ...(event.ratings || {}) },
                    polls: sanitizedPolls,
                    chat: sanitizedChat,
                    crowdEstimates: (event.crowdEstimates || []).map((est: any) => ({
                        ...est,
                        timestamp: est.timestamp ? new Date(est.timestamp) : new Date(),
                    })),
                };
            });
        }
        // If no events in storage, initialize with mock data and save it.
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(initialEvents));
        return initialEvents;
    } catch (error) {
        console.error("Failed to load or parse events from localStorage", error);
        localStorage.removeItem(EVENTS_STORAGE_KEY); // Clear corrupted data
        return initialEvents;
    }
};

const loadPrivateChatsFromStorage = (): PrivateChat[] => {
    try {
        const storedChats = localStorage.getItem(PRIVATE_CHATS_STORAGE_KEY);
        if (storedChats) {
            const parsedChats = JSON.parse(storedChats);
            if (!Array.isArray(parsedChats)) {
                console.error("Stored private chats are not an array, resetting.");
                localStorage.removeItem(PRIVATE_CHATS_STORAGE_KEY);
                return [];
            }
            
            return parsedChats.map((chat: any): PrivateChat | null => {
                if (!chat || !chat.id || !chat.participants || !chat.status) {
                    return null; // Skip malformed chat objects
                }
                return {
                    id: chat.id,
                    participants: chat.participants,
                    status: chat.status,
                    initiatedBy: chat.initiatedBy,
                    unreadCount: chat.unreadCount || {},
                    messages: (chat.messages || []).map((msg: any): PrivateChatMessage | null => {
                        if (!msg || !msg.id || !msg.senderId || !msg.text || !msg.timestamp) {
                            return null;
                        }
                        return {
                            ...msg,
                            timestamp: new Date(msg.timestamp)
                        };
                    }).filter((msg): msg is PrivateChatMessage => msg !== null),
                };
            }).filter((chat): chat is PrivateChat => chat !== null);
        }
        return [];
    } catch (error) {
        console.error("Failed to load or parse private chats from localStorage", error);
        localStorage.removeItem(PRIVATE_CHATS_STORAGE_KEY);
        return [];
    }
};


const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(loadEventsFromStorage);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.LIST);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>(loadPrivateChatsFromStorage);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Effect to persist events to localStorage
  useEffect(() => {
    try {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
        console.error("Failed to save events to localStorage", error);
    }
  }, [events]);
  
  // Effect to persist private chats to localStorage
  useEffect(() => {
    try {
        localStorage.setItem(PRIVATE_CHATS_STORAGE_KEY, JSON.stringify(privateChats));
    } catch (error) {
        console.error("Failed to save private chats to localStorage", error);
    }
  }, [privateChats]);


  // Effect to load user data on mount
  useEffect(() => {
    try {
        const usersInDb = JSON.parse(localStorage.getItem('wheresup_users') || '[]');
        // Defensively filter out any malformed entries from localStorage
        setAllUsers(usersInDb.filter((u: any) => u && typeof u === 'object'));
    } catch(e) {
        console.error("Failed to parse users from localStorage. Clearing data.", e);
        localStorage.removeItem('wheresup_users');
        setAllUsers([]);
    }


    // Check for user in session storage for persistence across reloads
    try {
        const storedUser = sessionStorage.getItem('wheresup_user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
    } catch (e) {
        console.error("Failed to parse user from sessionStorage. Clearing data.", e);
        sessionStorage.removeItem('wheresup_user');
        setCurrentUser(null);
    }
  }, []);
  
  const handleBackToList = useCallback(() => {
    setSelectedEvent(null);
    setCurrentView(View.LIST);
    if (window.location.hash) {
        window.location.hash = '';
    }
  }, []);

  // Effect for hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#event/')) {
        const eventId = hash.substring(7);
        const event = events.find(e => e.id === eventId);
        if (event) {
          setSelectedEvent(event);
          setCurrentView(View.DETAIL);
        } else {
           window.location.hash = ''; // Not found, clear hash
        }
      } else if (hash.startsWith('#profile')) {
          setCurrentView(View.PROFILE);
      } else if (hash.startsWith('#dms')) {
          setCurrentView(View.DMS);
      } else if (hash === '') {
        handleBackToList();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check on initial load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [events, handleBackToList]);

  // Simulate real-time event expiration
  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(prevEvents => prevEvents.filter(event => {
        const hoursPassed = (new Date().getTime() - new Date(event.createdAt).getTime()) / (1000 * 60 * 60);
        return hoursPassed < 24;
      }));
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleAuth = (user: User) => {
    // The user object received here should NOT have a password.
    sessionStorage.setItem('wheresup_user', JSON.stringify(user));
    setCurrentUser(user);

    // Add social users to DB if they don't exist
    let usersInDb: User[];
    try {
        usersInDb = JSON.parse(localStorage.getItem('wheresup_users') || '[]');
    } catch (e) {
        console.error("Failed to parse users from localStorage in handleAuth. Resetting user DB.", e);
        localStorage.removeItem('wheresup_users');
        usersInDb = [];
    }

    const safeUsers = usersInDb.filter((u: any) => u && typeof u === 'object');

    if (user.authType === 'registered' && !safeUsers.some((dbUser: User) => dbUser.id === user.id)) {
        const updatedUsers = [...safeUsers, user];
        localStorage.setItem('wheresup_users', JSON.stringify(updatedUsers));
        setAllUsers(updatedUsers);
    } else {
        setAllUsers(safeUsers);
    }
  };
  
  const handleLogout = () => {
      sessionStorage.removeItem('wheresup_user');
      setCurrentUser(null);
      handleBackToList();
  };


  const handleSelectEvent = (event: Event) => {
    window.location.hash = `event/${event.id}`;
  };
  
  const handleViewChange = (view: View.LIST | View.MAP | View.PROFILE | View.DMS) => {
    if (view === View.PROFILE) {
        window.location.hash = 'profile';
    } else if (view === View.DMS) {
        window.location.hash = 'dms';
    } else if (window.location.hash) {
      window.location.hash = '';
    }
    setCurrentView(view);
  };

  const handleShowCreateForm = () => {
    setCurrentView(View.CREATE);
  };

  const handleCreateEvent = (newEventData: Omit<Event, 'id' | 'createdAt' | 'checkedInUsers' | 'kickedUsers' | 'chat' | 'ratings' | 'polls' | 'crowdEstimates'>) => {
    if (!currentUser) return;

    if (currentUser.authType === 'guest') {
        const guestEvents = JSON.parse(localStorage.getItem('wheresup_guest_events') || '[]');
        const now = Date.now();
        const last24hEvents = guestEvents.filter((ts: number) => now - ts < 24 * 60 * 60 * 1000);
        if (last24hEvents.length >= 2) {
            alert("Guests can only create 2 events per day. Please register to create more.");
            return;
        }
        localStorage.setItem('wheresup_guest_events', JSON.stringify([...last24hEvents, now]));
    }

    const event: Event = {
      id: `evt-${Date.now()}`,
      createdAt: new Date(),
      checkedInUsers: [currentUser.id], // Creator is automatically checked in
      kickedUsers: [],
      chat: [],
      ratings: { music: [], ambiance: [], crowd: [], capacity: [], service: [], hype: [] },
      polls: [],
      crowdEstimates: [],
      ...newEventData,
    };
    setEvents([event, ...events]);
    handleSelectEvent(event); // Go to the new event detail page
  };
  
  const updateEvent = (updatedEvent: Event) => {
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    if (selectedEvent && selectedEvent.id === updatedEvent.id) {
        setSelectedEvent(updatedEvent);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    handleBackToList();
  };

  const handleDeleteAccount = () => {
    if (!currentUser) return;

    const userId = currentUser.id;

    // 1. Remove events created by the user
    setEvents(prevEvents => prevEvents.filter(event => event.createdBy !== userId));

    // 2. Remove private chats involving the user
    setPrivateChats(prevChats => prevChats.filter(chat => !Object.keys(chat.participants).includes(userId)));
    
    // 3. Remove user from the user database in localStorage
    try {
        const usersInDb = JSON.parse(localStorage.getItem('wheresup_users') || '[]');
        const updatedUsers = usersInDb.filter((u: User) => u.id !== userId);
        localStorage.setItem('wheresup_users', JSON.stringify(updatedUsers));
        setAllUsers(updatedUsers);
    } catch (e) {
        console.error("Failed to update user DB after deletion", e);
    }

    // 4. Log the user out
    handleLogout();
  };


  const handleSendPrivateChatInvite = (recipient: User) => {
      if (!currentUser || currentUser.id === recipient.id || currentUser.authType !== 'registered') return;
      
      const participants = [currentUser.id, recipient.id];
      const existingChat = privateChats.find(c => {
          const chatP = Object.keys(c.participants);
          return chatP.length === 2 && chatP.includes(participants[0]) && chatP.includes(participants[1]);
      });

      if (existingChat) {
          // The UI will now handle showing a "pending" state, so no alert is needed here.
          return;
      }

      alert("Chat request sent!");

      const newChat: PrivateChat = {
          id: `dm-${Date.now()}`,
          participants: {
              [currentUser.id]: currentUser.name,
              [recipient.id]: recipient.name,
          },
          status: 'pending',
          messages: [],
          initiatedBy: currentUser.id,
          unreadCount: { [currentUser.id]: 0, [recipient.id]: 0 }
      };
      setPrivateChats([...privateChats, newChat]);
  };
  
  const handleRespondToInvite = (chatId: string, response: 'active' | 'declined') => {
      setPrivateChats(privateChats.map(c => c.id === chatId ? { ...c, status: response } : c));
  };

  const handleCancelPrivateChatInvite = (chatId: string) => {
    setPrivateChats(privateChats.filter(c => c.id !== chatId));
  };
  
  const handleSendPrivateMessage = (chatId: string, text: string) => {
      if (!currentUser) return;
      setPrivateChats(privateChats.map(c => {
          if (c.id === chatId) {
              const newMessage: PrivateChatMessage = {
                  id: `dm-msg-${Date.now()}`,
                  senderId: currentUser.id,
                  text,
                  timestamp: new Date()
              };
              const recipientId = Object.keys(c.participants).find(pId => pId !== currentUser.id);
              const updatedUnreadCount = { ...c.unreadCount };
              if(recipientId) {
                updatedUnreadCount[recipientId] = (updatedUnreadCount[recipientId] || 0) + 1;
              }
              return { ...c, messages: [...c.messages, newMessage], unreadCount: updatedUnreadCount };
          }
          return c;
      }));
  };

  const handleReadChat = (chatId: string) => {
      if (!currentUser) return;
      setPrivateChats(privateChats.map(c => {
          if (c.id === chatId) {
              const updatedUnreadCount = { ...c.unreadCount, [currentUser.id]: 0 };
              return { ...c, unreadCount: updatedUnreadCount };
          }
          return c;
      }));
  };

  const renderContent = () => {
    if (!currentUser) {
      return <Login onAuth={handleAuth} />;
    }
    
    switch (currentView) {
      case View.DETAIL:
        return selectedEvent && <EventDetail 
            event={selectedEvent} 
            onBack={handleBackToList} 
            onUpdateEvent={updateEvent}
            onDeleteEvent={handleDeleteEvent} 
            currentUser={currentUser}
            allUsers={allUsers}
            onSendPrivateChatInvite={handleSendPrivateChatInvite}
            privateChats={privateChats}
        />;
      case View.CREATE:
        return <CreateEventForm onBack={handleBackToList} onCreate={handleCreateEvent} currentUser={currentUser}/>;
      case View.MAP:
        return <MapView events={events} onSelectEvent={handleSelectEvent} onListView={() => handleViewChange(View.LIST)} />;
      case View.PROFILE:
        return <Profile 
            currentUser={currentUser} 
            events={events.filter(e => e.createdBy === currentUser.id)} 
            onSelectEvent={handleSelectEvent} 
            onBack={handleBackToList}
            onDeleteAccount={handleDeleteAccount}
        />;
      case View.DMS:
        return <DirectMessages 
            privateChats={privateChats.filter(c => Object.keys(c.participants).includes(currentUser.id))}
            currentUser={currentUser}
            onRespondToInvite={handleRespondToInvite}
            onSendMessage={handleSendPrivateMessage}
            onReadChat={handleReadChat}
            onBack={handleBackToList}
            onCancelInvite={handleCancelPrivateChatInvite}
          />
      case View.LIST:
      default:
        return <EventList events={events} onSelectEvent={handleSelectEvent} onMapView={() => handleViewChange(View.MAP)} />;
    }
  };

  if (!currentUser) {
    return <Login onAuth={handleAuth} />;
  }
  
  const notificationCount = privateChats.reduce((count, chat) => {
      if (chat.status === 'pending' && chat.initiatedBy !== currentUser?.id && Object.keys(chat.participants).includes(currentUser?.id ?? '')) {
          return count + 1;
      }
      if (chat.status === 'active' && currentUser.id in chat.unreadCount && chat.unreadCount[currentUser.id] > 0) {
          return count + chat.unreadCount[currentUser.id];
      }
      return count;
  }, 0);


  return (
    <div className="min-h-screen bg-brand-primary font-sans">
      <Header 
        onTitleClick={handleBackToList} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onProfileClick={() => handleViewChange(View.PROFILE)} 
        onDmsClick={() => handleViewChange(View.DMS)}
        notificationCount={notificationCount} 
      />
      <main className="container mx-auto p-4 max-w-2xl relative">
        {renderContent()}
      </main>
       {(currentView === View.LIST || currentView === View.MAP) && (
        <button
          onClick={handleShowCreateForm}
          className="fixed bottom-6 right-6 bg-brand-neon text-brand-primary p-4 rounded-full shadow-lg shadow-brand-neon/30 hover:scale-110 transition-transform duration-300 z-50 animate-fadeIn"
          aria-label="Create new event"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      )}
    </div>
  );
};

export default App;