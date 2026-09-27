import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Member, 
  Team, 
  Task, 
  VarganiCampaign, 
  DonationRecord, 
  NavratriEvent, 
  PublicBroadcast, 
  BroadcastTemplate,
  OrgSettings,
  AuditEntry,
  CollectionSituationStatus,
  MemberCategory,
  CategoryApprovalStatus,
  MemberActivity,
  MemberStatus,
  TaskStatus,
  CampaignStatus,
  EventStatus,
  PaymentMethod,
  ReceiptTemplate,
  BroadcastLanguage
} from '../types';
import { 
  initialMembers, 
  initialTeams, 
  initialTasks, 
  initialCampaigns, 
  initialDonations, 
  initialPendingPayments, 
  initialEvents, 
  initialBroadcastTemplates, 
  initialBroadcasts, 
  initialOrgSettings,
  initialReceiptTemplates
} from '../mockData';

interface PinPromptState {
  isOpen: boolean;
  title: string;
  description: string;
  requiredRole?: 'Admin' | 'Treasurer' | 'Collector';
  actionName: string;
  resolve?: (success: boolean) => void;
}

interface AppContextType {
  currentUser: Member | null;
  isLoggedIn: boolean;
  loginWithMobileOtp: (mobile: string, otp: string) => { success: boolean; message: string };
  switchUser: (memberId: string) => void;
  logout: () => void;
  selfRegister: (data: Omit<Member, 'id' | 'joinedDate' | 'activityHistory'>) => { success: boolean; member?: Member; message: string };
  
  // Security & Pin Verification
  requestPinAuth: (options: { title: string; description: string; actionName: string; requiredRole?: 'Admin' | 'Treasurer' | 'Collector' }) => Promise<boolean>;
  pinPrompt: PinPromptState;
  submitPin: (pin: string, isBiometric?: boolean) => boolean;
  cancelPin: () => void;

  // Data collections
  members: Member[];
  teams: Team[];
  tasks: Task[];
  campaigns: VarganiCampaign[];
  donations: DonationRecord[];
  pendingPayments: DonationRecord[];
  events: NavratriEvent[];
  broadcasts: PublicBroadcast[];
  templates: BroadcastTemplate[];
  settings: OrgSettings;
  auditLogs: AuditEntry[];

  // Modals
  activeReceipt: DonationRecord | null;
  setActiveReceipt: (receipt: DonationRecord | null) => void;
  activeWhatsApp: { 
    phone: string; 
    text: string; 
    title: string; 
    receiptNumber?: string;
    multilingual?: {
      marathi: string;
      hindi: string;
      english: string;
    };
    initialLanguage?: BroadcastLanguage;
  } | null;
  setActiveWhatsApp: (msg: { 
    phone: string; 
    text: string; 
    title: string; 
    receiptNumber?: string;
    multilingual?: {
      marathi: string;
      hindi: string;
      english: string;
    };
    initialLanguage?: BroadcastLanguage;
  } | null) => void;

  // Navigation
  currentView: string;
  setCurrentView: (view: string) => void;

  // Member Actions
  addMemberByAdmin: (data: Omit<Member, 'id' | 'joinedDate' | 'activityHistory'>) => Member;
  updateMemberProfile: (memberId: string, partial: Partial<Member>) => void;
  changeMemberCategory: (memberId: string, newCategory: MemberCategory) => void;
  changeMemberStatus: (memberId: string, newStatus: MemberStatus) => void;
  reviewMemberCategory: (
    memberId: string, 
    decision: 'approve' | 'change' | 'reject', 
    newCategory?: MemberCategory, 
    reviewNotes?: string
  ) => { success: boolean; message: string };
  toggleTreasurerDesignation: (memberId: string, isTreasurer: boolean) => void;
  designateTreasurer: (memberId: string, isTreasurer: boolean) => void;
  assignMemberToTeam: (memberId: string, teamId: string) => void;
  removeMemberFromTeam: (memberId: string, teamId: string) => void;
  updateMemberResponsibilities: (memberId: string, responsibilities: string[]) => void;

  // Teams & Tasks
  createTeam: (team: Omit<Team, 'id' | 'createdAt'>) => void;
  updateTeam: (id: string, partial: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  taskStatuses: string[];
  addTaskStatus: (status: string) => void;
  removeTaskStatus: (status: string) => void;

  // Vargani Campaigns & Building Configuration
  createCampaign: (campaign: Omit<VarganiCampaign, 'id' | 'createdAt'>) => VarganiCampaign;
  updateCampaignStatus: (campaignId: string, status: CampaignStatus) => void;
  updateCampaignTeamLead: (campaignId: string, teamLeadId: string, teamLeadName: string) => void;
  updateBuildingStructure: (campaignId: string, wings: any[]) => void;
  confirmBuildingLayout: (campaignId: string) => void;
  updateUnitStatus: (
    campaignId: string, 
    wingId: string, 
    unitId: string, 
    status: CollectionSituationStatus, 
    donorName?: string, 
    donorMobile?: string, 
    notes?: string,
    linkedUnitIds?: string[]
  ) => void;

  // Donations & Payments
  submitDonation: (data: {
    campaignId: string;
    unitId?: string;
    unitDetails?: string;
    donorName: string;
    donorMobile: string;
    amount: number;
    paymentMethod: 'Cash' | 'UPI / Online';
    transactionId?: string;
    transactionProofUrl?: string;
    authMethod: '4-digit PIN' | 'Biometric';
  }) => DonationRecord;
  
  submitPendingPaymentCommitment: (data: {
    campaignId: string;
    unitId?: string;
    unitDetails?: string;
    donorName: string;
    donorMobile: string;
    amount: number;
    promisedDate: string;
    notes?: string;
  }) => DonationRecord;

  convertPendingToCompleted: (pendingRecordId: string, data: {
    paymentMethod: 'Cash' | 'UPI / Online';
    transactionId?: string;
    authMethod: '4-digit PIN' | 'Biometric';
  }) => DonationRecord;

  convertPendingPaymentToDonation: (
    pendingRecordId: string,
    paymentMethod: PaymentMethod | string,
    transactionId?: string,
    authMethod?: '4-digit PIN' | 'Biometric'
  ) => DonationRecord;

  approveCashDonation: (donationId: string) => { success: boolean; message: string };
  requestDonationCorrection: (donationId: string, reason: string, newValues: Partial<DonationRecord>) => void;
  reviewDonationCorrection: (donationId: string, approved: boolean) => void;
  cancelDonationRecord: (donationId: string, reason: string) => void;

  // Events & Navratri
  createEvent: (event: Omit<NavratriEvent, 'id' | 'createdAt'>) => NavratriEvent;
  updateEvent: (eventId: string, partial: Partial<NavratriEvent>) => void;
  deleteEvent: (eventId: string) => void;
  updateEventStatus: (eventId: string, status: EventStatus) => void;
  checkEventOverlap: (date: string, startTime: string, endTime: string, excludeId?: string) => NavratriEvent[];
  broadcastEventToMembers: (
    eventId: string, 
    customMessage?: string, 
    channels?: { whatsapp?: boolean; inApp?: boolean },
    language?: BroadcastLanguage
  ) => void;

  // Public Broadcasts
  createPublicBroadcast: (data: Omit<PublicBroadcast, 'id' | 'stats'>) => PublicBroadcast;
  sendPublicBroadcast: (data: any) => PublicBroadcast;
  updateScheduledBroadcast: (id: string, partial: Partial<PublicBroadcast>) => void;
  cancelScheduledBroadcast: (id: string) => void;
  resendBroadcast: (id: string) => void;
  saveTemplate: (template: Omit<BroadcastTemplate, 'id'>) => void;
  deleteTemplate: (id: string) => void;

  // Org Settings & Receipt Templates
  updateOrgSettings: (partial: Partial<OrgSettings>) => void;
  updateSettings: (partial: Partial<OrgSettings>) => void;
  receiptTemplates: ReceiptTemplate[];
  addReceiptTemplate: (template: Omit<ReceiptTemplate, 'id' | 'createdAt' | 'showQrCode' | 'accentColor'> & { showQrCode?: boolean; accentColor?: string }) => ReceiptTemplate;
  updateReceiptTemplate: (id: string, partial: Partial<ReceiptTemplate>) => void;
  deleteReceiptTemplate: (id: string) => void;
  setDefaultReceiptTemplate: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Members & Auth
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('jaus26_members');
    return saved ? JSON.parse(saved) : initialMembers;
  });

  const [currentUser, setCurrentUser] = useState<Member | null>(() => {
    const saved = localStorage.getItem('jaus26_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialMembers[0]; // Anand Varma default
      }
    }
    return initialMembers[0]; // Anand Varma (CM / Admin)
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Teams & Tasks
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('jaus26_teams');
    return saved ? JSON.parse(saved) : initialTeams;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('jaus26_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  // Campaigns & Building Config
  const [campaigns, setCampaigns] = useState<VarganiCampaign[]>(() => {
    const saved = localStorage.getItem('jaus26_campaigns');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => ({
          ...c,
          targetAmount: c.targetAmount || (c.id === 'camp-gokul' ? 150000 : c.id === 'camp-navkar' ? 200000 : 500000),
          year: c.year || 2026
        }));
      } catch (e) {
        return initialCampaigns;
      }
    }
    return initialCampaigns;
  });

  // Donations & Payments
  const [donations, setDonations] = useState<DonationRecord[]>(() => {
    const saved = localStorage.getItem('jaus26_donations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((d: any) => ({ ...d, amount: Number(d.amount) || 0 }));
      } catch (e) {
        return initialDonations;
      }
    }
    return initialDonations;
  });

  const [pendingPayments, setPendingPayments] = useState<DonationRecord[]>(() => {
    const saved = localStorage.getItem('jaus26_pending_payments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((p: any) => ({ ...p, amount: Number(p.amount) || 0 }));
      } catch (e) {
        return initialPendingPayments;
      }
    }
    return initialPendingPayments;
  });

  // Events & Navratri
  const [events, setEvents] = useState<NavratriEvent[]>(() => {
    const saved = localStorage.getItem('jaus26_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  // Public Broadcasts & Templates
  const [broadcasts, setBroadcasts] = useState<PublicBroadcast[]>(() => {
    const saved = localStorage.getItem('jaus26_broadcasts');
    return saved ? JSON.parse(saved) : initialBroadcasts;
  });

  const [templates, setTemplates] = useState<BroadcastTemplate[]>(() => {
    const saved = localStorage.getItem('jaus26_templates');
    return saved ? JSON.parse(saved) : initialBroadcastTemplates;
  });

  // Task statuses & receipt templates
  const [taskStatuses, setTaskStatuses] = useState<string[]>(() => {
    const saved = localStorage.getItem('jaus26_task_statuses');
    return saved ? JSON.parse(saved) : ['To Do', 'In Progress', 'Under Review', 'Completed'];
  });

  const [receiptTemplates, setReceiptTemplates] = useState<ReceiptTemplate[]>(() => {
    const saved = localStorage.getItem('jaus26_receipt_templates');
    return saved ? JSON.parse(saved) : initialReceiptTemplates;
  });

  // Settings
  const [settings, setSettings] = useState<OrgSettings>(() => {
    const saved = localStorage.getItem('jaus26_settings');
    return saved ? JSON.parse(saved) : initialOrgSettings;
  });

  // Consolidated audit logs
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(() => {
    const saved = localStorage.getItem('jaus26_audit_logs');
    if (saved) return JSON.parse(saved);
    // Combine initial audits
    const logs: AuditEntry[] = [];
    initialDonations.forEach(d => logs.push(...d.auditTrail));
    return logs;
  });

  // Modals state
  const [activeReceipt, setActiveReceipt] = useState<DonationRecord | null>(null);
  const [activeWhatsApp, setActiveWhatsApp] = useState<{ 
    phone: string; 
    text: string; 
    title: string; 
    receiptNumber?: string;
    multilingual?: {
      marathi: string;
      hindi: string;
      english: string;
    };
    initialLanguage?: BroadcastLanguage;
  } | null>(null);

  // Global Navigation state
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // PIN / Biometric prompt state
  const [pinPrompt, setPinPrompt] = useState<PinPromptState>({
    isOpen: false,
    title: '',
    description: '',
    actionName: ''
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('jaus26_members', JSON.stringify(members));
  }, [members]);
  useEffect(() => {
    localStorage.setItem('jaus26_teams', JSON.stringify(teams));
  }, [teams]);
  useEffect(() => {
    localStorage.setItem('jaus26_tasks', JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem('jaus26_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);
  useEffect(() => {
    localStorage.setItem('jaus26_donations', JSON.stringify(donations));
  }, [donations]);
  useEffect(() => {
    localStorage.setItem('jaus26_pending_payments', JSON.stringify(pendingPayments));
  }, [pendingPayments]);
  useEffect(() => {
    localStorage.setItem('jaus26_events', JSON.stringify(events));
  }, [events]);
  useEffect(() => {
    localStorage.setItem('jaus26_broadcasts', JSON.stringify(broadcasts));
  }, [broadcasts]);
  useEffect(() => {
    localStorage.setItem('jaus26_templates', JSON.stringify(templates));
  }, [templates]);
  useEffect(() => {
    localStorage.setItem('jaus26_settings', JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem('jaus26_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem('jaus26_task_statuses', JSON.stringify(taskStatuses));
  }, [taskStatuses]);
  useEffect(() => {
    localStorage.setItem('jaus26_receipt_templates', JSON.stringify(receiptTemplates));
  }, [receiptTemplates]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('jaus26_current_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Cross-Platform & Cross-Device Sync: Listen to storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageSync = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        if (e.key === 'jaus26_members') setMembers(JSON.parse(e.newValue));
        if (e.key === 'jaus26_teams') setTeams(JSON.parse(e.newValue));
        if (e.key === 'jaus26_tasks') setTasks(JSON.parse(e.newValue));
        if (e.key === 'jaus26_campaigns') setCampaigns(JSON.parse(e.newValue));
        if (e.key === 'jaus26_donations') setDonations(JSON.parse(e.newValue));
        if (e.key === 'jaus26_pending_payments') setPendingPayments(JSON.parse(e.newValue));
        if (e.key === 'jaus26_events') setEvents(JSON.parse(e.newValue));
        if (e.key === 'jaus26_broadcasts') setBroadcasts(JSON.parse(e.newValue));
        if (e.key === 'jaus26_templates') setTemplates(JSON.parse(e.newValue));
        if (e.key === 'jaus26_settings') setSettings(JSON.parse(e.newValue));
        if (e.key === 'jaus26_audit_logs') setAuditLogs(JSON.parse(e.newValue));
        if (e.key === 'jaus26_task_statuses') setTaskStatuses(JSON.parse(e.newValue));
        if (e.key === 'jaus26_receipt_templates') setReceiptTemplates(JSON.parse(e.newValue));
      } catch (err) {
        console.error('Storage sync error:', err);
      }
    };

    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  // Record audit log helper
  const addAuditEntry = (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
    };
    setAuditLogs(prev => [newEntry, ...prev]);
    return newEntry;
  };

  // Switch User (Demo switcher)
  const switchUser = (memberId: string) => {
    const user = members.find(m => m.id === memberId);
    if (user) {
      if (user.status === 'Inactive' || user.status === 'Suspended') {
        alert(`Cannot switch to ${user.fullName}: Account is ${user.status}.`);
        return;
      }
      setCurrentUser(user);
      setIsLoggedIn(true);
      // Log login activity
      const activity = {
        id: `act-${Date.now()}`,
        action: 'Switched Active Session',
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
        details: `Active profile set to ${user.fullName} (${user.category})`,
        type: 'login' as const
      };
      setMembers(prev => prev.map(m => m.id === user.id ? { ...m, activityHistory: [activity, ...m.activityHistory] } : m));
    }
  };

  const loginWithMobileOtp = (mobile: string, otp: string): { success: boolean; message: string } => {
    const cleanPhone = mobile.replace(/\D/g, '');
    const user = members.find(m => m.mobile.replace(/\D/g, '') === cleanPhone);

    if (!user) {
      return { success: false, message: 'No registered member found with this mobile number. Please self-register.' };
    }

    if (user.status === 'Inactive' || user.status === 'Suspended') {
      return { success: false, message: `Account is ${user.status}. Active login is blocked. Please contact Samiti Committee.` };
    }

    // Demo OTP is 123456 or any 6-digit number
    if (otp !== '123456' && otp.length !== 6) {
      return { success: false, message: 'Invalid OTP. Please enter 123456 for demo verification.' };
    }

    setCurrentUser(user);
    setIsLoggedIn(true);
    addAuditEntry({
      userId: user.id,
      userName: user.fullName,
      action: 'User Login',
      newValue: `Logged in via Mobile OTP (${mobile})`,
      authMethod: 'System'
    });
    return { success: true, message: `Welcome back, ${user.fullName}!` };
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('jaus26_current_user');
  };

  // Helper to format category title
  const getCategoryLabel = (cat: MemberCategory): string => {
    switch (cat) {
      case 'CM': return 'Committee Member';
      case 'SB': return 'Sabhasad';
      case 'KY': return 'Karyakarta';
      case 'YK': return 'Yuva Karyakarta';
      default: return cat;
    }
  };

  // Self Registration with Requested Category & Review Workflow (Section 2 & 3)
  const selfRegister = (data: Omit<Member, 'id' | 'joinedDate' | 'activityHistory'>) => {
    // Generate next sequence
    const count = members.length + 1;
    const seq = count < 10 ? `00${count}` : count < 100 ? `0${count}` : `${count}`;
    const newId = `JAUS26-${data.category}-${seq}`;

    // Selected category during self-registration is a REQUESTED category (Section 2)
    const requestedCat = data.category;
    // Provisional category: If applicant requested CM or SB, provisional role is Karyakarta until approved
    const provisionalCategory: MemberCategory = (requestedCat === 'CM' || requestedCat === 'SB') ? 'KY' : requestedCat;

    const newMember: Member = {
      ...data,
      id: newId,
      category: provisionalCategory, // Provisional category until reviewed
      requestedCategory: requestedCat, // User's requested category
      categoryApprovalStatus: 'Pending', // Awaiting Admin/Committee Member review
      status: 'Active',
      isTreasurer: false, // Rule 6: Category and special designations are strictly separate
      pin: data.pin || '1234',
      joinedDate: new Date().toISOString().split('T')[0],
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          action: 'Self Registration Submitted',
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
          details: `Requested category: ${getCategoryLabel(requestedCat)} (Pending Admin Review). Provisional category: ${getCategoryLabel(provisionalCategory)}.`,
          type: 'login'
        }
      ]
    };

    setMembers(prev => [newMember, ...prev]);
    setCurrentUser(newMember);
    setIsLoggedIn(true);

    addAuditEntry({
      userId: newMember.id,
      userName: newMember.fullName,
      action: 'Member Self-Registration',
      newValue: `Requested: ${getCategoryLabel(requestedCat)} (Provisional: ${getCategoryLabel(provisionalCategory)}, Pending Review)`,
      authMethod: 'System'
    });

    return { 
      success: true, 
      member: newMember, 
      message: `Registration successful! Your Member ID is ${newId}. Requested Category: ${getCategoryLabel(requestedCat)} (Pending Committee Review).` 
    };
  };

  // Admin registers a member (Section 4: Committee Members created directly by Admin, pre-approved)
  const addMemberByAdmin = (data: Omit<Member, 'id' | 'joinedDate' | 'activityHistory'>) => {
    const count = members.length + 1;
    const seq = count < 10 ? `00${count}` : count < 100 ? `0${count}` : `${count}`;
    const newId = `JAUS26-${data.category}-${seq}`;
    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });

    const newMember: Member = {
      ...data,
      id: newId,
      category: data.category,
      requestedCategory: data.category,
      categoryApprovalStatus: 'Approved', // Pre-approved directly by Admin
      reviewedBy: currentUser?.fullName || 'Admin',
      reviewedAt: timestamp,
      status: 'Active',
      pin: data.pin || '1234',
      joinedDate: new Date().toISOString().split('T')[0],
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          action: 'Account Created by Admin / Committee Member',
          timestamp,
          details: `Direct appointment as ${getCategoryLabel(data.category)} by ${currentUser?.fullName || 'Admin'}`,
          type: 'profile_update'
        }
      ]
    };

    setMembers(prev => [newMember, ...prev]);
    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: 'Admin Created Member Account',
      newValue: `Created ${newMember.fullName} as ${getCategoryLabel(newMember.category)} (${newMember.id})`,
      authMethod: '4-digit PIN'
    });
    return newMember;
  };

  const updateMemberProfile = (memberId: string, partial: Partial<Member>) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const updated = { ...m, ...partial };
        if (currentUser?.id === memberId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return m;
    }));
    addAuditEntry({
      userId: currentUser?.id || 'System',
      userName: currentUser?.fullName || 'System',
      action: 'Updated Member Profile',
      fieldChanged: Object.keys(partial).join(', '),
      authMethod: 'System'
    });
  };

  // Category Changes After Registration (Section 5)
  // Keeps the same account ID, same identity, same history, and updates category
  const changeMemberCategory = (memberId: string, newCategory: MemberCategory) => {
    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    const reviewerName = currentUser?.fullName || 'Admin';

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const newAct: MemberActivity = {
          id: `act-${Date.now()}`,
          action: 'Category Changed by Admin',
          timestamp,
          details: `Category changed from ${getCategoryLabel(m.category)} to ${getCategoryLabel(newCategory)} by ${reviewerName}. Account ID and history preserved.`,
          type: 'profile_update'
        };

        const updated: Member = {
          ...m,
          category: newCategory,
          categoryApprovalStatus: 'Approved',
          reviewedBy: reviewerName,
          reviewedAt: timestamp,
          activityHistory: [newAct, ...m.activityHistory]
        };

        if (currentUser?.id === memberId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return m;
    }));

    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: reviewerName,
      action: 'Changed Member Category',
      previousValue: members.find(m => m.id === memberId)?.category || 'Unknown',
      newValue: newCategory,
      authMethod: '4-digit PIN'
    });
  };

  // Member Category Review by Admin / Committee Member (Section 3)
  const reviewMemberCategory = (
    memberId: string, 
    decision: 'approve' | 'change' | 'reject', 
    newCategory?: MemberCategory, 
    reviewNotes?: string
  ): { success: boolean; message: string } => {
    const member = members.find(m => m.id === memberId);
    if (!member) return { success: false, message: 'Member record not found' };

    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    const reviewerName = currentUser?.fullName || 'Committee Member (Admin)';

    let finalCategory: MemberCategory = member.category;
    let statusUpdate: CategoryApprovalStatus = 'Approved';
    let activityAction = '';
    let details = '';

    if (decision === 'approve') {
      finalCategory = member.requestedCategory || member.category;
      statusUpdate = 'Approved';
      activityAction = 'Approved Requested Category';
      details = `Approved requested category "${getCategoryLabel(finalCategory)}" by ${reviewerName}.${reviewNotes ? ` Notes: ${reviewNotes}` : ''}`;
    } else if (decision === 'change') {
      finalCategory = newCategory || 'KY';
      statusUpdate = 'Changed';
      activityAction = 'Changed Member Category';
      details = `Category adjusted to "${getCategoryLabel(finalCategory)}" (Requested was: ${getCategoryLabel(member.requestedCategory || member.category)}) by ${reviewerName}.${reviewNotes ? ` Notes: ${reviewNotes}` : ''}`;
    } else if (decision === 'reject') {
      // RULE (Section 3): If a requested higher category is rejected, the member MUST be assigned: Karyakarta
      // Do NOT delete the member's account when a requested category is rejected.
      finalCategory = 'KY';
      statusUpdate = 'Rejected';
      activityAction = 'Rejected Higher Category — Assigned Karyakarta';
      details = `Requested higher category "${getCategoryLabel(member.requestedCategory || member.category)}" was rejected by ${reviewerName}. Member assigned as Karyakarta. Account preserved and active.${reviewNotes ? ` Reason: ${reviewNotes}` : ''}`;
    }

    const newActivity: MemberActivity = {
      id: `act-${Date.now()}`,
      action: activityAction,
      timestamp,
      details,
      type: 'profile_update'
    };

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const updated: Member = {
          ...m,
          category: finalCategory,
          categoryApprovalStatus: statusUpdate,
          reviewedBy: reviewerName,
          reviewedAt: timestamp,
          reviewNotes: reviewNotes || undefined,
          activityHistory: [newActivity, ...m.activityHistory]
        };
        if (currentUser?.id === memberId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return m;
    }));

    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: reviewerName,
      action: `Member Category Review: ${decision.toUpperCase()}`,
      previousValue: member.category,
      newValue: `${finalCategory} (${statusUpdate})`,
      authMethod: '4-digit PIN'
    });

    return {
      success: true,
      message: `Member ${member.fullName} is now confirmed as ${getCategoryLabel(finalCategory)}.`
    };
  };

  const changeMemberStatus = (memberId: string, newStatus: MemberStatus) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        addAuditEntry({
          userId: currentUser?.id || 'Admin',
          userName: currentUser?.fullName || 'Admin',
          action: 'Changed Member Status',
          previousValue: m.status,
          newValue: newStatus,
          authMethod: '4-digit PIN'
        });
        // If current logged in user is suspended or deactivated, terminate session
        if (currentUser?.id === memberId && (newStatus === 'Inactive' || newStatus === 'Suspended')) {
          logout();
        }
        return { ...m, status: newStatus };
      }
      return m;
    }));
  };

  const toggleTreasurerDesignation = (memberId: string, isTreasurer: boolean) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        addAuditEntry({
          userId: currentUser?.id || 'Admin',
          userName: currentUser?.fullName || 'Admin',
          action: isTreasurer ? 'Designated as Treasurer' : 'Revoked Treasurer Designation',
          previousValue: m.isTreasurer ? 'Yes' : 'No',
          newValue: isTreasurer ? 'Yes' : 'No',
          authMethod: '4-digit PIN'
        });
        return { ...m, isTreasurer };
      }
      return m;
    }));
  };

  // PIN / Biometric Request Modal Hook
  const requestPinAuth = (options: {
    title: string;
    description: string;
    actionName: string;
    requiredRole?: 'Admin' | 'Treasurer' | 'Collector';
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setPinPrompt({
        isOpen: true,
        title: options.title,
        description: options.description,
        actionName: options.actionName,
        requiredRole: options.requiredRole,
        resolve
      });
    });
  };

  const submitPin = (pin: string, isBiometric: boolean = false): boolean => {
    if (!currentUser) return false;

    // Check specific role requirement if any
    if (pinPrompt.requiredRole === 'Treasurer') {
      if (!currentUser.isTreasurer && currentUser.category !== 'CM') {
        alert('Access Denied: Only a designated Treasurer (or Committee Member) can perform this approval.');
        return false;
      }
    }
    if (pinPrompt.requiredRole === 'Admin') {
      if (currentUser.category !== 'CM') {
        alert('Access Denied: Only Committee Members / Admins can perform this action.');
        return false;
      }
    }

    // Default valid PIN is '1234' or the user's specific PIN
    const isValid = isBiometric || pin === currentUser.pin || pin === '1234' || pin === settings.defaultPin;

    if (isValid) {
      if (pinPrompt.resolve) {
        pinPrompt.resolve(true);
      }
      setPinPrompt(prev => ({ ...prev, isOpen: false }));
      return true;
    } else {
      return false;
    }
  };

  const cancelPin = () => {
    if (pinPrompt.resolve) {
      pinPrompt.resolve(false);
    }
    setPinPrompt(prev => ({ ...prev, isOpen: false }));
  };

  // Teams & Tasks
  const createTeam = (teamData: Omit<Team, 'id' | 'createdAt'>) => {
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTeams(prev => [...prev, newTeam]);
    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: 'Created New Team/Department',
      newValue: newTeam.name,
      authMethod: '4-digit PIN'
    });
  };

  const updateTeam = (id: string, partial: Partial<Team>) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, ...partial } : t));
    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: 'Updated Team Details',
      fieldChanged: Object.keys(partial).join(', '),
      authMethod: 'System'
    });
  };

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `tsk-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [newTask, ...prev]);
    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: 'Assigned New Task',
      newValue: `${newTask.title} to ${newTask.assignedToName}`,
      authMethod: 'System'
    });
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const completedAt = status === 'Completed' ? new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : undefined;
        // Also log in user's activity history if assigned to member
        if (status === 'Completed' && t.assignedToType === 'member') {
          const act = {
            id: `act-${Date.now()}`,
            action: 'Completed Task',
            timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
            details: `Task: ${t.title}`,
            type: 'task' as const
          };
          setMembers(mList => mList.map(m => m.id === t.assignedToId ? { ...m, activityHistory: [act, ...m.activityHistory] } : m));
        }
        return { ...t, status, completedAt };
      }
      return t;
    }));
  };

  const deleteTeam = (id: string) => {
    setTeams(prev => prev.filter(t => t.id !== id));
    setMembers(prev => prev.map(m => ({
      ...m,
      assignedTeams: m.assignedTeams.filter(tId => tId !== id)
    })));
    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: 'Deactivated/Deleted Department',
      newValue: `Team ${id} removed`,
      authMethod: '4-digit PIN'
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: 'Deleted Task',
      newValue: `Task ${id} removed`,
      authMethod: 'System'
    });
  };

  const assignMemberToTeam = (memberId: string, teamId: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId && !m.assignedTeams.includes(teamId)) {
        return { ...m, assignedTeams: [...m.assignedTeams, teamId] };
      }
      return m;
    }));
    setTeams(prev => prev.map(t => {
      if (t.id === teamId && !t.memberIds.includes(memberId)) {
        return { ...t, memberIds: [...t.memberIds, memberId] };
      }
      return t;
    }));
  };

  const removeMemberFromTeam = (memberId: string, teamId: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return { ...m, assignedTeams: m.assignedTeams.filter(id => id !== teamId) };
      }
      return m;
    }));
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          memberIds: t.memberIds.filter(id => id !== memberId),
          leaders: t.leaders.filter(id => id !== memberId),
          departmentHeads: t.departmentHeads.filter(id => id !== memberId)
        };
      }
      return t;
    }));
  };

  const updateMemberResponsibilities = (memberId: string, responsibilities: string[]) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return { ...m, responsibilities };
      }
      return m;
    }));
  };

  const addTaskStatus = (status: string) => {
    const trimmed = status.trim();
    if (!trimmed || taskStatuses.includes(trimmed)) return;
    setTaskStatuses(prev => [...prev, trimmed]);
  };

  const removeTaskStatus = (status: string) => {
    setTaskStatuses(prev => prev.filter(s => s !== status));
  };

  // Campaigns & Buildings
  const createCampaign = (campaignData: Omit<VarganiCampaign, 'id' | 'createdAt'>): VarganiCampaign => {
    const newCamp: VarganiCampaign = {
      ...campaignData,
      id: `camp-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCampaigns(prev => [newCamp, ...prev]);
    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: 'Created Vargani Campaign',
      newValue: `${newCamp.name} (${newCamp.type})`,
      authMethod: '4-digit PIN'
    });
    return newCamp;
  };

  const updateCampaignStatus = (campaignId: string, status: CampaignStatus) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        addAuditEntry({
          userId: currentUser?.id || 'Admin',
          userName: currentUser?.fullName || 'Admin',
          action: 'Updated Campaign Status',
          previousValue: c.status,
          newValue: status,
          authMethod: '4-digit PIN'
        });
        return { ...c, status };
      }
      return c;
    }));
  };

  const updateCampaignTeamLead = (campaignId: string, teamLeadId: string, teamLeadName: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        addAuditEntry({
          userId: currentUser?.id || 'Admin',
          userName: currentUser?.fullName || 'Admin',
          action: 'Reassigned Campaign Team Lead',
          previousValue: c.teamLeadName,
          newValue: teamLeadName,
          authMethod: '4-digit PIN'
        });
        return { ...c, teamLeadId, teamLeadName };
      }
      return c;
    }));
  };

  const updateBuildingStructure = (campaignId: string, wings: any[]) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const buildingConfig = c.buildingConfig || {
          societyName: c.name,
          wings: [],
          isConfirmed: false
        };
        return {
          ...c,
          buildingConfig: {
            ...buildingConfig,
            wings,
            isConfirmed: false // requires review when modified
          }
        };
      }
      return c;
    }));
  };

  const confirmBuildingLayout = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId && c.buildingConfig) {
        const confirmedAt = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
        const confirmedBy = currentUser?.fullName || 'Team Lead';
        addAuditEntry({
          userId: currentUser?.id || 'TeamLead',
          userName: confirmedBy,
          action: 'Confirmed Building Structure Layout',
          newValue: `${c.buildingConfig.societyName} structure locked for collection`,
          authMethod: '4-digit PIN'
        });
        return {
          ...c,
          status: 'Open', // Unlock campaign to open for collection
          buildingConfig: {
            ...c.buildingConfig,
            isConfirmed: true,
            confirmedBy,
            confirmedAt
          }
        };
      }
      return c;
    }));
  };

  const updateUnitStatus = (
    campaignId: string, 
    wingId: string, 
    unitId: string, 
    status: CollectionSituationStatus, 
    donorName?: string, 
    donorMobile?: string, 
    notes?: string,
    linkedUnitIds?: string[]
  ) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId && c.buildingConfig) {
        const updatedWings = c.buildingConfig.wings.map(w => {
          if (w.id === wingId || w.name === wingId) {
            const updatedUnits = w.units.map(u => {
              if (u.id === unitId) {
                return {
                  ...u,
                  collectionStatus: status,
                  donorName: donorName || u.donorName,
                  donorMobile: donorMobile || u.donorMobile,
                  notes: notes !== undefined ? notes : u.notes,
                  linkedFamilyUnitIds: linkedUnitIds || u.linkedFamilyUnitIds,
                  lastVisitedAt: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
                  lastVisitedBy: currentUser?.fullName
                };
              }
              // Also update linked family units if specified
              if (linkedUnitIds && linkedUnitIds.includes(u.id)) {
                return {
                  ...u,
                  collectionStatus: 'Multiple Flats/Units — Same Family',
                  donorName: donorName || u.donorName,
                  donorMobile: donorMobile || u.donorMobile,
                  notes: `Linked with unit ${unitId}`,
                  linkedFamilyUnitIds: [unitId],
                  lastVisitedAt: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
                  lastVisitedBy: currentUser?.fullName
                };
              }
              return u;
            });
            return { ...w, units: updatedUnits };
          }
          return w;
        });
        return {
          ...c,
          buildingConfig: {
            ...c.buildingConfig,
            wings: updatedWings
          }
        };
      }
      return c;
    }));
  };

  // Submit Donation (Common to Building & Individual)
  const submitDonation = (data: {
    campaignId: string;
    unitId?: string;
    unitDetails?: string;
    donorName: string;
    donorMobile: string;
    amount: number;
    paymentMethod: 'Cash' | 'UPI / Online';
    transactionId?: string;
    transactionProofUrl?: string;
    authMethod: '4-digit PIN' | 'Biometric';
  }): DonationRecord => {
    const campaign = campaigns.find(c => c.id === data.campaignId);
    const campaignName = campaign?.name || 'Navratri Vargani 2026';
    const campaignType = campaign?.type || 'Building-Based';

    // Sequence generator: YEAR-CAMPAIGN-SEQUENCE e.g. JAUS26-VG-0005
    const totalCount = donations.length + 1;
    const seq = totalCount < 10 ? `000${totalCount}` : totalCount < 100 ? `00${totalCount}` : `${totalCount}`;
    const receiptNumber = `JAUS26-VG-${seq}`;

    // Status: Cash is 'Pending' (needs Treasurer approval), UPI is 'Completed'
    const financialStatus = data.paymentMethod === 'Cash' ? 'Pending' : 'Completed';

    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    const collectorId = currentUser?.id || 'Unknown';
    const collectorName = currentUser?.fullName || 'Volunteer';

    const auditEntry: AuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp,
      userId: collectorId,
      userName: collectorName,
      action: `Recorded ${data.paymentMethod} Donation Receipt (${receiptNumber})`,
      newValue: `₹${(data.amount || 0).toLocaleString('en-IN')} (${financialStatus})`,
      authMethod: data.authMethod
    };

    const newDonation: DonationRecord = {
      id: `don-${Date.now()}`,
      receiptNumber,
      campaignId: data.campaignId,
      campaignName,
      campaignType,
      unitId: data.unitId,
      unitDetails: data.unitDetails,
      donorName: data.donorName,
      donorMobile: data.donorMobile,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      transactionProofUrl: data.transactionProofUrl,
      financialStatus,
      collectorId,
      collectorName,
      collectedAt: timestamp,
      whatsappSent: true,
      whatsappSentAt: timestamp,
      auditTrail: [auditEntry]
    };

    setDonations(prev => [newDonation, ...prev]);
    setAuditLogs(prev => [auditEntry, ...prev]);

    // Update member activity history
    const act = {
      id: `act-${Date.now()}`,
      action: 'Collected Vargani Donation',
      timestamp,
      details: `Collected ₹${(data.amount || 0).toLocaleString('en-IN')} from ${data.donorName} (${receiptNumber})`,
      type: 'collection' as const
    };
    if (currentUser) {
      setMembers(mList => mList.map(m => m.id === currentUser.id ? { ...m, activityHistory: [act, ...m.activityHistory] } : m));
    }

    // Also update unit in campaign if unitId is provided
    if (data.unitId && campaign?.buildingConfig) {
      for (const wing of campaign.buildingConfig.wings) {
        const u = wing.units.find(un => un.id === data.unitId);
        if (u) {
          updateUnitStatus(campaign.id, wing.id, data.unitId, 'Collection Received', data.donorName, data.donorMobile);
          break;
        }
      }
    }

    // Set active receipt modal
    setActiveReceipt(newDonation);

    return newDonation;
  };

  // Submit Pending Payment Commitment
  const submitPendingPaymentCommitment = (data: {
    campaignId: string;
    unitId?: string;
    unitDetails?: string;
    donorName: string;
    donorMobile: string;
    amount: number;
    promisedDate: string;
    notes?: string;
  }): DonationRecord => {
    const campaign = campaigns.find(c => c.id === data.campaignId);
    const campaignName = campaign?.name || 'Navratri Vargani 2026';
    const campaignType = campaign?.type || 'Building-Based';

    const count = pendingPayments.length + 1;
    const seq = count < 10 ? `000${count}` : count < 100 ? `00${count}` : `${count}`;
    const receiptNumber = `JAUS26-PEND-${seq}`;

    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    const collectorId = currentUser?.id || 'Unknown';
    const collectorName = currentUser?.fullName || 'Volunteer';

    const auditEntry: AuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp,
      userId: collectorId,
      userName: collectorName,
      action: `Created Pending Payment Commitment (${receiptNumber})`,
      newValue: `Promised ₹${(data.amount || 0).toLocaleString('en-IN')} by ${data.promisedDate}`,
      authMethod: '4-digit PIN'
    };

    const newRecord: DonationRecord = {
      id: `pend-${Date.now()}`,
      receiptNumber,
      campaignId: data.campaignId,
      campaignName,
      campaignType,
      unitId: data.unitId,
      unitDetails: data.unitDetails,
      donorName: data.donorName,
      donorMobile: data.donorMobile,
      amount: data.amount,
      paymentMethod: 'Cash',
      financialStatus: 'Pending',
      isPendingPaymentCommitment: true,
      promisedPaymentDate: data.promisedDate,
      collectorId,
      collectorName,
      collectedAt: timestamp,
      whatsappSent: true,
      whatsappSentAt: timestamp,
      auditTrail: [auditEntry]
    };

    setPendingPayments(prev => [newRecord, ...prev]);
    setAuditLogs(prev => [auditEntry, ...prev]);

    // If unitId, update unit status to 'Payment Pending — Donor Will Pay Later'
    if (data.unitId && campaign?.buildingConfig) {
      for (const wing of campaign.buildingConfig.wings) {
        const u = wing.units.find(un => un.id === data.unitId);
        if (u) {
          updateUnitStatus(campaign.id, wing.id, data.unitId, 'Payment Pending — Donor Will Pay Later', data.donorName, data.donorMobile, data.notes);
          break;
        }
      }
    }

    setActiveReceipt(newRecord);
    return newRecord;
  };

  // Convert Pending Payment to Completed Paid Donation
  const convertPendingToCompleted = (pendingRecordId: string, data: {
    paymentMethod: 'Cash' | 'UPI / Online';
    transactionId?: string;
    authMethod: '4-digit PIN' | 'Biometric';
  }): DonationRecord => {
    const pendingItem = pendingPayments.find(p => p.id === pendingRecordId);
    if (!pendingItem) throw new Error('Pending record not found');

    // Remove from pending
    setPendingPayments(prev => prev.filter(p => p.id !== pendingRecordId));

    // Create actual paid donation record
    const totalCount = donations.length + 1;
    const seq = totalCount < 10 ? `000${totalCount}` : totalCount < 100 ? `00${totalCount}` : `${totalCount}`;
    const receiptNumber = `JAUS26-VG-${seq}`;
    const financialStatus = data.paymentMethod === 'Cash' ? 'Pending' : 'Completed';
    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });

    const auditEntry: AuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp,
      userId: currentUser?.id || 'Unknown',
      userName: currentUser?.fullName || 'Collector',
      action: `Completed Pending Payment -> Final Receipt (${receiptNumber})`,
      newValue: `₹${(pendingItem.amount || 0).toLocaleString('en-IN')} via ${data.paymentMethod} (${financialStatus})`,
      authMethod: data.authMethod
    };

    const newDonation: DonationRecord = {
      ...pendingItem,
      id: `don-${Date.now()}`,
      receiptNumber,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      financialStatus,
      isPendingPaymentCommitment: false,
      collectedAt: timestamp,
      auditTrail: [...(pendingItem.auditTrail || []), auditEntry]
    };

    setDonations(prev => [newDonation, ...prev]);
    setAuditLogs(prev => [auditEntry, ...prev]);

    // Update unit status to 'Collection Received'
    if (newDonation.unitId && newDonation.campaignId) {
      const camp = campaigns.find(c => c.id === newDonation.campaignId);
      if (camp?.buildingConfig) {
        for (const wing of camp.buildingConfig.wings) {
          const u = wing.units.find(un => un.id === newDonation.unitId);
          if (u) {
            updateUnitStatus(camp.id, wing.id, newDonation.unitId, 'Collection Received', newDonation.donorName, newDonation.donorMobile);
            break;
          }
        }
      }
    }

    setActiveReceipt(newDonation);
    return newDonation;
  };

  const convertPendingPaymentToDonation = (
    pendingRecordId: string,
    paymentMethod: PaymentMethod | string,
    transactionId?: string,
    authMethod: '4-digit PIN' | 'Biometric' = '4-digit PIN'
  ): DonationRecord => {
    return convertPendingToCompleted(pendingRecordId, {
      paymentMethod: paymentMethod === 'Cash' ? 'Cash' : 'UPI / Online',
      transactionId,
      authMethod
    });
  };

  // Treasurer Cash Approval Workflow
  const approveCashDonation = (donationId: string): { success: boolean; message: string } => {
    const donation = donations.find(d => d.id === donationId);
    if (!donation) return { success: false, message: 'Donation record not found' };

    // Self-approval check: Collector CANNOT approve own cash collection!
    if (donation.collectorId === currentUser?.id) {
      return { success: false, message: 'Violation: A collector cannot approve their own cash collection. Only another designated Treasurer or Committee Member can approve.' };
    }

    // Role check: Only designated Treasurer (or Committee Member)
    if (!currentUser?.isTreasurer && currentUser?.category !== 'CM') {
      return { success: false, message: 'Only an authorized Treasurer or Committee Member can approve cash transactions.' };
    }

    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });

    const auditEntry: AuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp,
      userId: currentUser.id,
      userName: `${currentUser.fullName} (${currentUser.isTreasurer ? 'Treasurer' : 'Committee Member'})`,
      action: `Approved Cash Collection (${donation.receiptNumber})`,
      previousValue: 'Pending',
      newValue: 'Approved',
      authMethod: '4-digit PIN'
    };

    setDonations(prev => prev.map(d => {
      if (d.id === donationId) {
        return {
          ...d,
          financialStatus: 'Approved',
          approvedBy: currentUser.id,
          approvedByName: `${currentUser.fullName} (${currentUser.isTreasurer ? 'Treasurer' : 'Committee Member'})`,
          approvedAt: timestamp,
          auditTrail: [...d.auditTrail, auditEntry]
        };
      }
      return d;
    }));

    setAuditLogs(prev => [auditEntry, ...prev]);

    // Record in approver activity history
    const act = {
      id: `act-${Date.now()}`,
      action: 'Approved Cash Collection',
      timestamp,
      details: `Verified ₹${donation.amount.toLocaleString('en-IN')} for ${donation.receiptNumber}`,
      type: 'approval' as const
    };
    setMembers(mList => mList.map(m => m.id === currentUser.id ? { ...m, activityHistory: [act, ...m.activityHistory] } : m));

    return { success: true, message: `Cash donation ${donation.receiptNumber} approved successfully!` };
  };

  // Correction Workflow
  const requestDonationCorrection = (donationId: string, reason: string, newValues: Partial<DonationRecord>) => {
    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    const auditEntry: AuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp,
      userId: currentUser?.id || 'Unknown',
      userName: currentUser?.fullName || 'Collector',
      action: 'Submitted Donation Correction Request',
      newValue: `Reason: ${reason}`,
      authMethod: '4-digit PIN'
    };

    setDonations(prev => prev.map(d => {
      if (d.id === donationId) {
        return {
          ...d,
          correctionRequest: {
            requestedBy: currentUser?.id || '',
            requestedByName: currentUser?.fullName || '',
            requestedAt: timestamp,
            reason,
            newValues,
            status: 'Pending'
          },
          auditTrail: [...d.auditTrail, auditEntry]
        };
      }
      return d;
    }));
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  const reviewDonationCorrection = (donationId: string, approved: boolean) => {
    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    const donation = donations.find(d => d.id === donationId);
    if (!donation || !donation.correctionRequest) return;

    const auditEntry: AuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp,
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: approved ? 'Approved Donation Correction' : 'Rejected Donation Correction',
      newValue: approved ? JSON.stringify(donation.correctionRequest.newValues) : 'Correction request rejected',
      authMethod: '4-digit PIN'
    };

    setDonations(prev => prev.map(d => {
      if (d.id === donationId && d.correctionRequest) {
        if (approved) {
          return {
            ...d,
            ...d.correctionRequest.newValues,
            correctionRequest: {
              ...d.correctionRequest,
              status: 'Approved',
              approvedBy: currentUser?.fullName,
              approvedAt: timestamp
            },
            auditTrail: [...d.auditTrail, auditEntry]
          };
        } else {
          return {
            ...d,
            correctionRequest: {
              ...d.correctionRequest,
              status: 'Rejected',
              approvedBy: currentUser?.fullName,
              approvedAt: timestamp
            },
            auditTrail: [...d.auditTrail, auditEntry]
          };
        }
      }
      return d;
    }));
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // Cancellation/Reversal (Admin Only)
  const cancelDonationRecord = (donationId: string, reason: string) => {
    if (currentUser?.category !== 'CM') {
      alert('Only Committee Members / Admins can cancel financial records.');
      return;
    }

    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    const auditEntry: AuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp,
      userId: currentUser.id,
      userName: currentUser.fullName,
      action: 'Cancelled/Reversed Financial Donation Record',
      previousValue: 'Active',
      newValue: `Cancelled (Reason: ${reason})`,
      authMethod: '4-digit PIN'
    };

    setDonations(prev => prev.map(d => {
      if (d.id === donationId) {
        return {
          ...d,
          financialStatus: 'Cancelled',
          cancelledBy: currentUser.fullName,
          cancelledAt: timestamp,
          cancellationReason: reason,
          auditTrail: [...d.auditTrail, auditEntry]
        };
      }
      return d;
    }));
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // Events & Navratri Management
  const createEvent = (eventData: Omit<NavratriEvent, 'id' | 'createdAt'>): NavratriEvent => {
    const newEvent: NavratriEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setEvents(prev => [...prev, newEvent]);
    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: 'Created Navratri Event',
      newValue: `${newEvent.name} on ${newEvent.date}`,
      authMethod: 'System'
    });
    return newEvent;
  };

  const updateEvent = (eventId: string, partial: Partial<NavratriEvent>) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        addAuditEntry({
          userId: currentUser?.id || 'Admin',
          userName: currentUser?.fullName || 'Admin',
          action: 'Updated Navratri Event',
          newValue: `${e.name} (${Object.keys(partial).join(', ')})`,
          authMethod: 'System'
        });
        return { ...e, ...partial };
      }
      return e;
    }));
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: 'Deleted Event',
      newValue: `Event ${eventId} removed`,
      authMethod: 'System'
    });
  };

  const updateEventStatus = (eventId: string, status: EventStatus) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        addAuditEntry({
          userId: currentUser?.id || 'Admin',
          userName: currentUser?.fullName || 'Admin',
          action: 'Updated Event Status',
          previousValue: e.status,
          newValue: status,
          authMethod: 'System'
        });
        return { ...e, status };
      }
      return e;
    }));
  };

  const checkEventOverlap = (date: string, startTime: string, endTime: string, excludeId?: string): NavratriEvent[] => {
    return events.filter(e => {
      if (e.id === excludeId) return false;
      if (e.status === 'Cancelled') return false;
      if (e.date !== date) return false;

      // Overlap logic
      const startA = startTime;
      const endA = endTime;
      const startB = e.startTime;
      const endB = e.endTime;

      return (startA < endB && endA > startB);
    });
  };

  const broadcastEventToMembers = (
    eventId: string, 
    customMessage?: string,
    channels?: { whatsapp?: boolean; inApp?: boolean },
    language: BroadcastLanguage = 'Marathi'
  ) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const marathiMsg = `जय माता दी! 🙏\nजय अंबे उत्सव समिती (JAUS २०२६) — अधिकृत कार्यक्रम सूचना\n\n🌺 *${event.name.toUpperCase()}* 🌺\n📅 दिनांक: ${event.date}\n⏰ वेळ: ${event.startTime} ते ${event.endTime}\n📍 स्थळ: ${event.venue}\n${event.chiefGuest ? `⭐ विशेष पाहुणे: ${event.chiefGuest}\n` : ''}${event.importantInstructions ? `⚠️ सूचना: ${event.importantInstructions}\n` : ''}\n${event.description}\n\nसर्व सन्माननीय सदस्यांनी वेळेवर उपस्थित राहावे.\n— जय अंबे उत्सव समिती २०२६`;

    const hindiMsg = `जय माता दी! 🙏\nजय अम्बे उत्सव समिति (JAUS 2026) — आधिकारिक कार्यक्रम सूचना\n\n🌺 *${event.name.toUpperCase()}* 🌺\n📅 दिनांक: ${event.date}\n⏰ समय: ${event.startTime} से ${event.endTime}\n📍 स्थान: ${event.venue}\n${event.chiefGuest ? `⭐ विशेष अतिथि: ${event.chiefGuest}\n` : ''}${event.importantInstructions ? `⚠️ निर्देश: ${event.importantInstructions}\n` : ''}\n${event.description}\n\nसभी पंजीकृत सदस्यों से समय पर उपस्थिति का आग्रह है।\n— जय अम्बे उत्सव समिति 2026`;

    const englishMsg = `Jai Mata Di! 🙏\nJai Ambe Utsav Samiti (JAUS 2026) — Official Member Event Notice\n\n🌺 *${event.name.toUpperCase()}* 🌺\n📅 Date: ${event.date}\n⏰ Time: ${event.startTime} - ${event.endTime}\n📍 Venue: ${event.venue}\n${event.chiefGuest ? `⭐ Chief Guest: ${event.chiefGuest}\n` : ''}${event.importantInstructions ? `⚠️ Instructions: ${event.importantInstructions}\n` : ''}\n${event.description}\n\nAll registered members & volunteers are requested to join punctually.\n— JAUS 2026 Committee`;

    const defaultMsg = language === 'Marathi' ? marathiMsg : language === 'Hindi' ? hindiMsg : englishMsg;
    const message = customMessage || defaultMsg;

    setActiveWhatsApp({
      phone: `All Registered Members (${members.length} Members)`,
      text: message,
      title: `Event Broadcast: ${event.name}`,
      multilingual: {
        marathi: marathiMsg,
        hindi: hindiMsg,
        english: englishMsg
      },
      initialLanguage: language
    });

    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: 'Broadcasted Navratri Event to Members',
      newValue: `${event.name} (${channels?.whatsapp ? 'WhatsApp' : ''} ${channels?.inApp ? 'In-App' : ''})`,
      authMethod: 'System'
    });
  };

  // Public Broadcasts
  const createPublicBroadcast = (data: Omit<PublicBroadcast, 'id' | 'stats'>): PublicBroadcast => {
    const newBroadcast: PublicBroadcast = {
      ...data,
      id: `bc-${Date.now()}`,
      stats: {
        sent: data.scheduleType === 'immediate' ? data.targetCount : 0,
        delivered: data.scheduleType === 'immediate' ? Math.max(0, data.targetCount - 1) : 0,
        failed: data.scheduleType === 'immediate' ? 1 : 0
      },
      sentAt: data.scheduleType === 'immediate' ? new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : undefined,
      status: data.scheduleType === 'immediate' ? 'Sent' : 'Scheduled'
    };

    setBroadcasts(prev => [newBroadcast, ...prev]);
    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: 'Created Public WhatsApp Broadcast',
      newValue: `${newBroadcast.title} (Target: ${newBroadcast.targetCount} donors)`,
      authMethod: 'System'
    });

    if (data.scheduleType === 'immediate') {
      setActiveWhatsApp({
        phone: `Filtered Audience (${data.targetCount} Donors)`,
        text: data.message,
        title: `Public Broadcast: ${data.title}`,
        multilingual: data.content,
        initialLanguage: data.language
      });
    }

    return newBroadcast;
  };

  const updateScheduledBroadcast = (id: string, partial: Partial<PublicBroadcast>) => {
    setBroadcasts(prev => prev.map(b => b.id === id ? { ...b, ...partial } : b));
  };

  const cancelScheduledBroadcast = (id: string) => {
    setBroadcasts(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
  };

  const resendBroadcast = (id: string) => {
    setBroadcasts(prev => prev.map(b => {
      if (b.id === id) {
        return {
          ...b,
          stats: {
            sent: b.targetCount,
            delivered: b.targetCount,
            failed: 0
          },
          sentAt: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
          status: 'Sent'
        };
      }
      return b;
    }));
  };

  const saveTemplate = (templateData: Omit<BroadcastTemplate, 'id'>) => {
    const newTmpl: BroadcastTemplate = {
      ...templateData,
      id: `tmpl-${Date.now()}`
    };
    setTemplates(prev => [...prev, newTmpl]);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const updateOrgSettings = (partial: Partial<OrgSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: 'Updated Samiti Organization Settings',
      newValue: Object.keys(partial).join(', '),
      authMethod: '4-digit PIN'
    });
  };

  // Receipt Template Management
  const addReceiptTemplate = (templateData: Omit<ReceiptTemplate, 'id' | 'createdAt' | 'showQrCode' | 'accentColor'> & { showQrCode?: boolean; accentColor?: string }): ReceiptTemplate => {
    const newTmpl: ReceiptTemplate = {
      showQrCode: true,
      accentColor: '#b45309',
      ...templateData,
      id: `rcpt-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    if (newTmpl.isDefault) {
      setReceiptTemplates(prev => prev.map(t => ({ ...t, isDefault: false })).concat(newTmpl));
    } else {
      setReceiptTemplates(prev => [...prev, newTmpl]);
    }
    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: 'Added Receipt Template',
      newValue: newTmpl.name,
      authMethod: '4-digit PIN'
    });
    return newTmpl;
  };

  const updateReceiptTemplate = (id: string, partial: Partial<ReceiptTemplate>) => {
    setReceiptTemplates(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, ...partial };
      }
      if (partial.isDefault) {
        return { ...t, isDefault: false };
      }
      return t;
    }));
    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: 'Updated Receipt Template',
      newValue: `Template ${id} updated`,
      authMethod: '4-digit PIN'
    });
  };

  const deleteReceiptTemplate = (id: string) => {
    setReceiptTemplates(prev => prev.filter(t => t.id !== id));
    addAuditEntry({
      userId: currentUser?.id || 'Admin',
      userName: currentUser?.fullName || 'Admin',
      action: 'Deleted Receipt Template',
      newValue: `Template ${id} deleted`,
      authMethod: '4-digit PIN'
    });
  };

  const setDefaultReceiptTemplate = (id: string) => {
    setReceiptTemplates(prev => prev.map(t => ({
      ...t,
      isDefault: t.id === id
    })));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        loginWithMobileOtp,
        switchUser,
        logout,
        selfRegister,
        requestPinAuth,
        pinPrompt,
        submitPin,
        cancelPin,
        members,
        teams,
        tasks,
        campaigns,
        donations,
        pendingPayments,
        events,
        broadcasts,
        templates,
        settings,
        auditLogs,
        activeReceipt,
        setActiveReceipt,
        activeWhatsApp,
        setActiveWhatsApp,
        currentView,
        setCurrentView,
        addMemberByAdmin,
        updateMemberProfile,
        changeMemberCategory,
        changeMemberStatus,
        reviewMemberCategory,
        toggleTreasurerDesignation,
        designateTreasurer: toggleTreasurerDesignation,
        assignMemberToTeam,
        removeMemberFromTeam,
        updateMemberResponsibilities,
        createTeam,
        updateTeam,
        deleteTeam,
        createTask,
        updateTaskStatus,
        deleteTask,
        taskStatuses,
        addTaskStatus,
        removeTaskStatus,
        createCampaign,
        updateCampaignStatus,
        updateCampaignTeamLead,
        updateBuildingStructure,
        confirmBuildingLayout,
        updateUnitStatus,
        submitDonation,
        submitPendingPaymentCommitment,
        convertPendingToCompleted,
        convertPendingPaymentToDonation,
        approveCashDonation,
        requestDonationCorrection,
        reviewDonationCorrection,
        cancelDonationRecord,
        createEvent,
        updateEvent,
        deleteEvent,
        updateEventStatus,
        checkEventOverlap,
        broadcastEventToMembers,
        createPublicBroadcast,
        sendPublicBroadcast: createPublicBroadcast,
        updateScheduledBroadcast,
        cancelScheduledBroadcast,
        resendBroadcast,
        saveTemplate,
        deleteTemplate,
        updateOrgSettings,
        updateSettings: updateOrgSettings,
        receiptTemplates,
        addReceiptTemplate,
        updateReceiptTemplate,
        deleteReceiptTemplate,
        setDefaultReceiptTemplate
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
