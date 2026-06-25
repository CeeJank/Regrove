// This code identifies the roles of the users from social worker and child.
// Each role will be granted different abilities in the website

export type UserRole = 'social_worker' | 'child';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  dateOfBirth?: string;
  avatarUrl?: string;
}

export interface Child extends User {
  role: 'child';
  dateOfBirth: string;
  assignedWorkerId: string;
  riskLevel: RiskLevel;
}

export interface SocialWorker extends User {
  role: 'social_worker';
  assignedChildIds: string[];
  recentChildIds: string[];
}

export interface CheckIn {
  id: string;
  childId: string;
  timestamp: string;
  mood: 1 | 2 | 3 | 4 | 5;
  events: string;
  // Wellbeing questions
  q1_sleep?: string;
  q2_safe?: string;
  q3_support?: string;
  q4_worry?: string;
  q5_proud?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'ai_summary';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  organizerId: string;
  workerIds: string[];
  childIds: string[];
  status: 'pending' | 'confirmed' | 'declined';
  inviteStatuses?: Record<string, 'pending' | 'accepted' | 'declined'>;
}

export interface Referral {
  id: string;
  fromWorkerId: string;
  toWorkerId: string;
  childId: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
}

export interface ActiveCase {
  id: string;
  childId: string;
  workerId: string;
  name: string;          // youth's full name, returned directly from API
  age?: number | null;
  school?: string | null;
  category?: string | null;
  riskLevel: RiskLevel;
  notes: string;
  aiSummary: string;
  lastUpdated: string;
  checkIns: CheckIn[];
  notesHistory?: Array<{
    id: string;
    noteText: string;
    createdAt: string;
  }>;
}

export interface CANSItem {
  id: string;
  domain: string;
  item: string;
  rating: 0 | 1 | 2 | 3;
  caseNotes: string;
  actions: string;
}

export interface ChildDocumentation {
  id: string;
  childId: string;
  fullName: string;
  nricLast4: string;
  dateOfBirth: string;
  gender: string;
  race: string;
  nationality: string;
  address: string;
  parentContact: string;
  school: string;
  level: string;
  hobbies: string;
  cansItems: CANSItem[];
  lastUpdated: string;
  summary?: string;
  extraNotes?: string;
}

export interface UnifiedHubEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  associatedChild: string | null;
  origin: 'manual';
  extraContext: {
    description?: string;
  } | null;
}

export interface ChatSession {
  id: string;
  childId: string;
  title: string;
  createdAt: string;
  messages: BotMessage[];
}

export interface BotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
