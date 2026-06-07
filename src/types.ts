/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Lang = 'no' | 'pl' | 'en';
export type UserRole = 'guest' | 'member' | 'volunteer' | 'board' | 'admin';

export type MemberType = 'individual' | 'youth' | 'supporting' | 'family';
export type MemberStatus =
  | 'new_applicant'
  | 'waiting_approval'
  | 'active'
  | 'inactive'
  | 'supporting'
  | 'volunteer'
  | 'board'
  | 'former';

export type PaymentStatus = 'paid' | 'unpaid' | 'pending' | 'exempt' | 'overdue';
export type PaymentMethod = 'vipps' | 'bank' | 'cash' | 'donation' | 'other';

export interface Member {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  preferredLanguage: Lang;
  address?: string;
  memberType: MemberType;
  status: MemberStatus;
  dateJoined: string;
  paymentStatus: PaymentStatus;
  lastPaymentDate?: string;
  notes?: string; // Board/Admin only
  consentPrivacy: boolean; // Personvern samtykke
  consentPhoto: boolean; // Bilde samtykke
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  activityHistory: {
    date: string;
    description: string;
    points: number;
    hours?: number;
  }[];
}

export type EventCategory =
  | 'cleanup'
  | 'education'
  | 'member_meeting'
  | 'board_meeting'
  | 'annual_meeting'
  | 'training'
  | 'community'
  | 'volunteer_work'
  | 'smaland_activity'
  | 'equipment';

export type ParticipantRole = 'organizer' | 'volunteer' | 'diver' | 'shore_support' | 'member' | 'guest';
export type ParticipantStatus = 'registered' | 'attended' | 'absent' | 'cancelled';

export interface ParticipantRegistration {
  memberId: string;
  memberName: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  registeredAt: string;
}

export interface Event {
  id: string;
  title: string;
  date: string; // ISO String or YYYY-MM-DD HH:mm
  location: string;
  description: string;
  category: EventCategory;
  maxParticipants?: number;
  registrations: ParticipantRegistration[];
  safetyNotes?: string;
  requiredEquipment?: string;
  internalNotes?: string; // Board/Admin only
  pointsValue: number;
}

export type DocumentCategory =
  | 'statutes'
  | 'annual_meeting'
  | 'minutes'
  | 'protocols'
  | 'bronnøysund'
  | 'frivillighet'
  | 'project'
  | 'grant'
  | 'safety'
  | 'privacy'
  | 'consent'
  | 'educational';

export interface DocumentMeta {
  id: string;
  title: string;
  category: DocumentCategory;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  lang: Lang;
  isPrivate: boolean; // true = board/admin only, false = all members
  description?: string;
}

export type ProjectStatus = 'planned' | 'active' | 'completed' | 'paused';

export interface ProjectTask {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  assignedTo?: string; // Member Name/ID
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  responsiblePerson: string;
  budget: number;
  fundingSource: string;
  sponsors: string[];
  documents: string[]; // Document Meta IDs
  tasks: ProjectTask[];
  deadlines: string[];
  volunteerList: string[]; // Member IDs/Names
  progressNotes: string;
  finalReport?: string;
}

export type MessageType =
  | 'normal'
  | 'announcement'
  | 'event_reminder'
  | 'fee_reminder'
  | 'volunteer_request'
  | 'board_decision'
  | 'project_update';

export type MessageModule =
  | 'general'
  | 'board_only'
  | 'event'
  | 'project'
  | 'volunteer'
  | 'announcement'
  | 'direct';

export interface MessageTranslation {
  no: string;
  pl: string;
  en: string;
}

export interface Message {
  id: string;
  module: MessageModule;
  relatedId?: string; // eventId, projectId, or recipientMemberId for direct message
  type: MessageType;
  senderId: string;
  senderName: string;
  originalLang: Lang;
  originalText: string;
  translations: MessageTranslation;
  isAutoTranslated: boolean;
  date: string; // ISO string
  readBy: string[]; // memberIds who read it
  visibility: 'members_all' | 'board_only' | 'direct';
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
  author: string;
  isPrivate: boolean; // board/admin only
  lang: Lang;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface PhotoConsent {
  consentGiven: boolean;
  consentDate?: string;
  revokedDate?: string;
  useOnMembershipCardOnly: boolean;
  useInPublicMaterial: boolean;
  useInEventDocumentation: boolean;
}

export type MembershipFeeStatus = 'paid' | 'pending' | 'unpaid' | 'exempt';

export interface MembershipCard {
  memberId: string;
  fullName: string;
  role: UserRole;
  memberStatus: MemberStatus;
  membershipYear: number;
  feeStatus: MembershipFeeStatus;
  feeAmount: number;
  currency: string;
  issueDate: string;
  validUntil: string;
  organisationName: string;
  organisationNumber: string;
  photoUrl?: string;
  photoConsent?: PhotoConsent;
  memberIdFormatted: string;
}

