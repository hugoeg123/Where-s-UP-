export enum View {
  LIST = 'LIST',
  DETAIL = 'DETAIL',
  CREATE = 'CREATE',
  MAP = 'MAP',
  PROFILE = 'PROFILE',
  DMS = 'DMS',
}

export interface User {
  id: string;
  name: string;
  authType: 'guest' | 'registered';
  password?: string; // For registered user accounts
  avatarUrl?: string; // For social logins
}

export type RatingCategory = 'music' | 'ambiance' | 'crowd' | 'capacity' | 'service';

export const RATING_CATEGORIES: RatingCategory[] = ['music', 'ambiance', 'crowd', 'capacity', 'service'];

export type HypeLevel = 'run_here' | 'popping' | 'good_vibe' | 'chill' | 'save_yourself';

export interface Ratings {
  music: number[];
  ambiance: number[];
  crowd: number[];
  capacity: number[];
  service: number[];
  hype: { userId: string, level: HypeLevel }[];
}

export interface Poll {
  id: string;
  question: string;
  options: Record<string, number>;
  voters: Record<User['id'], string>; // Tracks which user voted for which option
}

export interface ChatMessage {
  id: string;
  user: User;
  text: string;
  timestamp: Date;
  votesToKick: Record<User['id'], boolean>;
  embedUrl?: string;
  imageUrl?: string;
}

export interface CrowdEstimate {
    userId: User['id'];
    estimate: number;
    timestamp: Date;
}

export interface PrivateChatMessage {
  id: string;
  senderId: User['id'];
  text: string;
  timestamp: Date;
}

export interface PrivateChat {
  id: string;
  participants: Record<User['id'], string>; // Storing { userId: userName }
  status: 'pending' | 'active' | 'declined';
  messages: PrivateChatMessage[];
  initiatedBy: User['id'];
  unreadCount: Record<User['id'], number>;
}


export interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  isAnonymous: boolean;
  createdBy: User['id'] | 'Anonymous';
  createdAt: Date;
  visibility: 'public' | 'private';
  capacity: number | null;
  checkedInUsers: User['id'][];
  kickedUsers: User['id'][];
  ratings: Ratings;
  polls: Poll[];
  chat: ChatMessage[];
  crowdEstimates: CrowdEstimate[];
}