import { Event, User } from '../types';

export const mockUsers: User[] = [
    { id: 'user-1', name: 'SynthwaveFan', authType: 'registered' },
    { id: 'user-2', name: 'RooftopChiller', authType: 'guest' },
    { id: 'user-3', name: 'TechnoHead', authType: 'registered' },
    { id: 'user-4', name: 'JazzCat', authType: 'registered' },
    { id: 'user-5', name: 'IndieSleeze', authType: 'registered' },
    { id: 'user-42', name: 'User42', authType: 'guest' },
    { id: 'user-88', name: 'User88', authType: 'guest' },
    { id: 'user-12', name: 'User12', authType: 'guest' },
];


export const initialEvents: Event[] = [
  {
    id: 'evt-1',
    name: 'Neon Nights @ The Underground',
    description: 'Dive into a sea of neon lights and synthwave beats. A night for dreamers and dancers. Dress code: 80s retro-futurism. All data from this event will self-destruct in 24 hours.',
    location: '123 Main St, Downtown, New York, NY',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    isAnonymous: false,
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    visibility: 'public',
    capacity: null,
    checkedInUsers: ['user-1', 'user-42', 'user-88', 'user-2', 'user-3', 'user-4', 'user-5'],
    kickedUsers: [],
    ratings: {
      music: [5, 5, 4, 5, 5],
      ambiance: [5, 4, 4, 5],
      crowd: [4, 3, 4, 4],
      capacity: [3, 2, 3],
      service: [4, 4, 5, 3],
      hype: [
        { userId: 'user-1', level: 'run_here' },
        { userId: 'user-42', level: 'run_here' },
        { userId: 'user-88', level: 'popping' },
      ]
    },
    polls: [
      { id: 'poll1', question: 'Song of the night?', options: { 'Blinding Lights': 2, 'Midnight City': 1, 'Resonance': 1 }, voters: {'user-42': 'Blinding Lights', 'user-88':'Blinding Lights', 'user-1':'Midnight City', 'user-2':'Resonance'} },
    ],
    chat: [
      { id: 'msg1', user: {id: 'user-42', name: 'User42', authType: 'guest'}, text: 'This place is electric!', timestamp: new Date(Date.now() - 1000 * 60 * 30), votesToKick: {} },
      { id: 'msg-img', user: {id: 'user-2', name: 'RooftopChiller', authType: 'guest'}, text: 'The lights here are amazing!', timestamp: new Date(Date.now() - 1000 * 60 * 20), votesToKick: {}, imageUrl: 'https://images.unsplash.com/photo-1571833358342-4223e3194a34?w=500' },
      { id: 'msg2', user: {id: 'user-88', name: 'User88', authType: 'guest'}, text: 'DJ is on fire tonight 🔥', timestamp: new Date(Date.now() - 1000 * 60 * 15), votesToKick: {} },
      { id: 'msg-embed', user: {id: 'user-1', name: 'SynthwaveFan', authType: 'registered'}, text: 'Check out this vibe: https://www.instagram.com/p/C2N8z2_S1sC/', timestamp: new Date(Date.now() - 1000 * 60 * 10), votesToKick: {}, embedUrl: 'https://www.instagram.com/p/C2N8z2_S1sC/' },
    ],
    crowdEstimates: [
        { userId: 'user-1', estimate: 75, timestamp: new Date(Date.now() - 1000 * 60 * 10) },
        { userId: 'user-42', estimate: 100, timestamp: new Date(Date.now() - 1000 * 60 * 5) }
    ]
  },
  {
    id: 'evt-2',
    name: 'Rooftop Sunset Session',
    description: 'Chill vibes, deep house, and a perfect sunset view. Limited spots available. Enjoy the moment before it vanishes.',
    location: 'Rooftop Bar, 45 Sky Ave, Miami, FL',
    coordinates: { lat: 25.7617, lng: -80.1918 },
    isAnonymous: true,
    createdBy: 'Anonymous',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    visibility: 'public',
    capacity: null,
    checkedInUsers: ['user-2', 'user-12'],
    kickedUsers: [],
    ratings: {
      music: [4, 4, 5],
      ambiance: [5, 5, 5, 5, 5],
      crowd: [5, 4, 5],
      capacity: [4, 5, 4],
      service: [4, 4, 3],
      hype: [
        { userId: 'user-2', level: 'good_vibe' },
        { userId: 'user-12', level: 'chill' },
      ]
    },
    polls: [
        { id: 'poll2', question: 'Next drink?', options: { 'Mojito': 1, 'Old Fashioned': 1, 'Craft Beer': 0 }, voters: {'user-12': 'Mojito', 'user-2': 'Old Fashioned'} },
    ],
    chat: [
       { id: 'msg3', user: {id: 'user-12', name: 'User12', authType: 'guest'}, text: 'The view is insane!', timestamp: new Date(Date.now() - 1000 * 60 * 60), votesToKick: {} },
    ],
    crowdEstimates: []
  },
  {
    id: 'evt-secret',
    name: 'Speakeasy Session (Invite Only)',
    description: 'Secret location. Jazz and cocktails. This event is private and only accessible via a direct link or QR code.',
    location: 'Somewhere behind a bookshelf',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    isAnonymous: false,
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
    visibility: 'private',
    capacity: 50,
    checkedInUsers: ['user-1'],
    kickedUsers: [],
    ratings: { music: [], ambiance: [], crowd: [], capacity: [], service: [], hype: [] },
    polls: [],
    chat: [],
    crowdEstimates: []
  },
];