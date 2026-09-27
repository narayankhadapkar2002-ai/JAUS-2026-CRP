export type MemberCategory = 'CM' | 'SB' | 'KY' | 'YK';

export type CategoryApprovalStatus = 'Pending' | 'Approved' | 'Changed' | 'Rejected';

export interface HierarchyTier {
  category: MemberCategory;
  name: string;
  rank: number;
  description: string;
  intendedAge?: string;
  accessLevel: string;
  badgeClass: string;
}

// Strict hierarchy order: Committee Member → Sabhasad → Karyakarta → Yuva Karyakarta
export const MEMBER_HIERARCHY: HierarchyTier[] = [
  {
    category: 'CM',
    name: 'Committee Member',
    rank: 1,
    description: 'Highest organizational category. Committee Members have Admin-level access.',
    accessLevel: 'Admin Access',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  {
    category: 'SB',
    name: 'Sabhasad',
    rank: 2,
    description: 'Second organizational category.',
    accessLevel: 'Council Access',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    category: 'KY',
    name: 'Karyakarta',
    rank: 3,
    description: 'Third organizational category.',
    accessLevel: 'Field Volunteer Access',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    category: 'YK',
    name: 'Yuva Karyakarta',
    rank: 4,
    description: 'Fourth organizational category. Intended age range: 18–35 years (no strict automatic age restriction).',
    intendedAge: 'Intended age: 18–35 years (not strictly enforced)',
    accessLevel: 'Youth Wing Access',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200'
  }
];

export type MemberStatus = 'Active' | 'Inactive' | 'Suspended';

export type Gender = 'Male' | 'Female' | 'Other';

export interface Member {
  id: string; // e.g., JAUS26-CM-001
  fullName: string;
  mobile: string;
  email?: string;
  avatarUrl?: string;
  dob: string;
  gender: Gender;
  address: string;
  category: MemberCategory; // CM: Committee Member, SB: Sabhasad, KY: Karyakarta, YK: Yuva Karyakarta
  requestedCategory?: MemberCategory; // Category selected during self-registration
  categoryApprovalStatus?: CategoryApprovalStatus; // Pending review, Approved, Changed, or Rejected
  reviewedBy?: string; // Admin / Committee Member who reviewed
  reviewedAt?: string; // Timestamp of review
  reviewNotes?: string; // Review remarks or rejection reason
  status: MemberStatus;
  assignedTeams: string[]; // Team IDs
  responsibilities: string[]; // Designations (e.g., 'President', 'Treasurer', 'Youth Head')
  isTreasurer?: boolean; // Designated by Admin for cash approval (Rule 6: separate from category)
  pin: string; // 4-digit security PIN
  joinedDate: string;
  preferredLanguage?: BroadcastLanguage; // Marathi (default) | Hindi | English
  activityHistory: MemberActivity[];
}

export interface MemberActivity {
  id: string;
  action: string;
  timestamp: string;
  details: string;
  type: 'login' | 'collection' | 'approval' | 'task' | 'profile_update' | 'event';
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leaders: string[]; // Member IDs
  departmentHeads: string[]; // Member IDs
  memberIds: string[];
  isActive: boolean;
  createdAt: string;
}

export type TaskStatus = string;

export interface ReceiptTemplate {
  id: string;
  name: string;
  isDefault: boolean;
  headerTitle: string;
  subHeader: string;
  registrationText: string;
  footerBlessing: string;
  signatoryTitle: string;
  taxExemptionNote?: string;
  showQrCode: boolean;
  accentColor: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToType: 'member' | 'team';
  assignedToId: string; // Member ID or Team ID
  assignedToName: string;
  dueDate: string;
  status: TaskStatus;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

export type CampaignType = 'Building-Based' | 'Individual-Based';
export type CampaignStatus = 'Draft' | 'Open' | 'Closed';

export interface VarganiCampaign {
  id: string;
  name: string;
  description?: string;
  type: CampaignType;
  targetAmount?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  status: CampaignStatus;
  teamLeadId?: string;
  teamLeadName?: string;
  targetNotes?: string;
  suggestedTiers?: number[];
  buildingConfig?: any;
  buildingUnits?: BuildingUnit[];
  createdAt?: string;
}

export interface BuildingWing {
  id: string;
  name: string; // e.g., "Wing A", "Wing B", "Wing C-2"
  floors: number; // e.g. 7
  hasGroundFloor: boolean;
  flatsPerFloor: number; // e.g. 4
  shopsOnGround: number; // e.g. 2
  units: BuildingUnit[];
}

export interface BuildingConfig {
  societyName: string;
  wings: BuildingWing[];
  isConfirmed: boolean;
  confirmedBy?: string;
  confirmedAt?: string;
}

export type UnitType = 'Flat' | 'Shop';

export type CollectionSituationStatus = 
  | 'Not Yet Visited'
  | 'Collection Received'
  | 'Payment Pending — Donor Will Pay Later'
  | 'House Closed / Nobody Available'
  | 'Non-Cooperative / Refused'
  | 'Multiple Flats/Units — Same Family';

export interface BuildingUnit {
  id: string; // unique unit id e.g. unit-wA-f1-101
  wingName?: string;
  wing?: string;
  floor?: number | 'G';
  unitNumber: string; // e.g. "101", "Shop 1"
  type?: UnitType;
  unitType?: UnitType;
  buildingName?: string;
  residentName?: string;
  contactNumber?: string;
  status?: string;
  collectionStatus?: CollectionSituationStatus;
  donorName?: string;
  donorMobile?: string;
  linkedFamilyUnitIds?: string[]; // Multiple flats linked to same donor family
  notes?: string;
  lastVisitedAt?: string;
  lastVisitedBy?: string;
  donationId?: string;
}

export type FinancialDonationStatus = 'Pending' | 'Approved' | 'Completed' | 'Cancelled' | 'Corrected';
export type FinancialStatus = FinancialDonationStatus;

export type PaymentMethod = 'Cash' | 'UPI' | 'UPI / Online';

export interface DonationRecord {
  id: string;
  receiptNumber: string; // e.g. JAUS26-VG-0001
  campaignId: string;
  campaignName: string;
  campaignType: CampaignType;
  unitId?: string;
  unitDetails?: string; // e.g. "Gokul Horizon, Wing A, Flat 402"
  donorName: string;
  donorMobile: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string; // UTR for UPI
  transactionProofUrl?: string;
  financialStatus: FinancialDonationStatus;
  isPendingPaymentCommitment?: boolean; // If donor committed to pay later
  promisedPaymentDate?: string;
  collectorId: string;
  collectorName: string;
  collectedAt: string;
  
  // Cash approval details (approved by Treasurer)
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  
  // Cancellation details
  cancelledBy?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  
  // Correction workflow
  correctionRequest?: {
    requestedBy: string;
    requestedByName: string;
    requestedAt: string;
    reason: string;
    newValues: Partial<DonationRecord>;
    status: 'Pending' | 'Approved' | 'Rejected';
    approvedBy?: string;
    approvedAt?: string;
  };
  
  // WhatsApp dispatch tracking
  whatsappSent: boolean;
  whatsappSentAt?: string;
  preferredLanguage?: BroadcastLanguage; // Marathi (default) | Hindi | English
  
  // Audit log for this record
  auditTrail: AuditEntry[];
}

export type PendingPayment = DonationRecord;

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  fieldChanged?: string;
  previousValue?: string;
  newValue?: string;
  authMethod: '4-digit PIN' | 'Biometric' | 'System';
}

export type EventStatus = 'Draft' | 'Published' | 'Completed' | 'Cancelled';

export interface NavratriEvent {
  id: string;
  name: string;
  dayNumber?: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: string;
  description: string;
  posterUrl?: string;
  status: EventStatus;
  importantInstructions?: string;
  chiefGuest?: string;
  volunteerIds?: string[];
  createdBy: string;
  createdAt: string;
}

export type BroadcastLanguage = 'Marathi' | 'Hindi' | 'English';

export interface MultilingualMessage {
  marathi: string;
  hindi: string;
  english: string;
}

export type BroadcastAudienceFilter = 
  | 'all_donors'
  | 'members'
  | 'by_campaign'
  | 'by_building'
  | 'by_donation_status'
  | 'by_payment_status';

export type BroadcastTarget = BroadcastAudienceFilter | 'all_members' | 'category' | 'team' | 'campaign_donors';

export interface BroadcastTemplate {
  id: string;
  title: string;
  category: string;
  message?: string;
  language?: BroadcastLanguage;
  content: {
    marathi: string;
    hindi: string;
    english: string;
  };
}

export type BroadcastScheduleType = 'immediate' | 'scheduled' | 'recurring';
export type RecurringInterval = 'daily' | 'weekly' | 'monthly';
export type BroadcastDeliveryStatus = 'Sent' | 'Delivered' | 'Failed';

export interface PublicBroadcast {
  id: string;
  title: string;
  message: string;
  language: BroadcastLanguage;
  content?: {
    marathi: string;
    hindi: string;
    english: string;
  };
  mediaType?: 'none' | 'image' | 'document';
  mediaUrl?: string;
  mediaName?: string;
  audienceType?: BroadcastAudienceFilter;
  targetType?: BroadcastTarget;
  filterValue?: string;
  filterDescription?: string;
  targetFilter?: string;
  targetCount: number;
  deliveredCount?: number;
  deliveryChannel: 'WhatsApp only';
  scheduleType: BroadcastScheduleType;
  scheduledFor?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  recurringInterval?: RecurringInterval;
  status: 'Draft' | 'Scheduled' | 'Sent' | 'Failed' | 'Cancelled';
  sentAt?: string;
  createdAt: string;
  createdBy: string;
  stats: {
    sent: number;
    delivered: number;
    failed: number;
  };
}

export interface OrgSettings {
  samitiName: string;
  shortName: string;
  registrationNumber: string;
  foundedYear: number;
  seasonYear: number;
  address: string;
  contactMobile: string;
  contactEmail: string;
  receiptHeader: string;
  receiptFooterNote: string;
  enableBiometric: boolean;
  defaultPin: string;
  upiId?: string;
}
