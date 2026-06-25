<<<<<<< HEAD
// This code identifies the roles of the users from social worker and child.
// Each role will be granted different abilities in the website

export type UserRole = 'social_worker' | 'child';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
=======
// This code indentifies the roles of the users from social worker and child.
// Each roles will be granted different abilties in the website

export type UserRole = 'social_worker' | 'child';
<<<<<<< HEAD
export type RiskLevel = 'high' | 'medium' | 'low';
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
=======
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
>>>>>>> 110c6d7 (updated schema and seed sql to CJ's mocks and started dashboard MVC)

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
<<<<<<< HEAD
  recentChildIds: string[];
=======
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
}

export interface CheckIn {
  id: string;
  childId: string;
  timestamp: string;
  mood: 1 | 2 | 3 | 4 | 5;
  events: string;
<<<<<<< HEAD
  // Wellbeing questions
  q1_sleep: string;
  q2_safe: string;
  q3_support: string;
  q4_worry: string;
  q5_proud: string;
=======
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
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
<<<<<<< HEAD
  inviteStatuses?: Record<string, 'pending' | 'accepted' | 'declined'>;
=======
}

export interface Referral {
  id: string;
  fromWorkerId: string;
  toWorkerId: string;
  childId: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
}

export interface ActiveCase {
  id: string;
  childId: string;
  workerId: string;
<<<<<<< HEAD
=======
  name: string;          // youth's full name, returned directly from API
<<<<<<< HEAD
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
=======
  age: number | null;    // from youth_profiles
  school: string | null; // from youth_profiles
  category: string | null; // case category e.g. 'Intensive Support'
>>>>>>> 110c6d7 (updated schema and seed sql to CJ's mocks and started dashboard MVC)
  riskLevel: RiskLevel;
  notes: string;
  aiSummary: string;
  lastUpdated: string;
  checkIns: CheckIn[];
<<<<<<< HEAD
  recentWorkerIds: string[];
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
  /** Child Catalog summary — a brief overview written by the SW */
  summary?: string;
  /** Extra notes auto-populated from meetup sessions and messages */
  extraNotes?: string;
}

export interface MeetupSession {
  id: string;
  childId: string;
  workerId: string;
  startTime: string;
  endTime?: string;
  aiTranscript: string;
  aiSummary: string;
  status: 'active' | 'ended';
=======
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
