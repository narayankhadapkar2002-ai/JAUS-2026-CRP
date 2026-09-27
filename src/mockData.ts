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
  BuildingWing,
  ReceiptTemplate
} from './types';

export const initialOrgSettings: OrgSettings = {
  samitiName: "Jai Ambe Utsav Samiti",
  shortName: "JAUS 2026",
  registrationNumber: "MAH/MUM/1988/2026",
  foundedYear: 1988,
  seasonYear: 2026,
  address: "Shree Ambe Dham Ground, SV Road, Borivali West, Mumbai - 400092",
  contactMobile: "+91 98201 12233",
  contactEmail: "contact@jaus2026.org",
  receiptHeader: "JAI AMBE UTSAV SAMITI (REGD. NO. MAH/MUM/1988)",
  receiptFooterNote: "Thank you for your generous contribution towards Navratri Mahotsav 2026. May Maa Ambe shower blessings of health and prosperity upon your family.",
  enableBiometric: true,
  defaultPin: "1234"
};

export const initialMembers: Member[] = [
  {
    id: "JAUS26-CM-001",
    fullName: "Anand Varma",
    mobile: "9820112233",
    email: "anand.varma@jaus2026.org",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    dob: "1978-04-12",
    gender: "Male",
    address: "B-402, Gokul Horizon, Borivali West, Mumbai",
    category: "CM", // Committee Member -> Admin access
    requestedCategory: "CM",
    categoryApprovalStatus: "Approved",
    status: "Active",
    assignedTeams: ["team-finance", "team-cultural"],
    responsibilities: ["Samiti President", "General Trustee"],
    isTreasurer: false,
    pin: "1234",
    joinedDate: "2010-08-15",
    activityHistory: [
      { id: "act-1", action: "Approved Campaign", timestamp: "2026-08-20 10:15 AM", details: "Approved Gokul Horizon Vargani Campaign", type: "approval" },
      { id: "act-2", action: "System Login", timestamp: "2026-09-06 08:30 AM", details: "Logged in via Mobile OTP verification", type: "login" }
    ]
  },
  {
    id: "JAUS26-SB-002",
    fullName: "Rajesh Patel",
    mobile: "9820445566",
    email: "rajesh.patel@jaus2026.org",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    dob: "1982-11-05",
    gender: "Male",
    address: "C-101, Shanti Niketan, Borivali West, Mumbai",
    category: "SB", // Sabhasad
    requestedCategory: "SB",
    categoryApprovalStatus: "Approved",
    status: "Active",
    assignedTeams: ["team-finance"],
    responsibilities: ["Designated Treasurer", "Accounts In-Charge"],
    isTreasurer: true, // Designated Treasurer by Admin! Can approve pending cash collections (Rule 6: separate from category)
    pin: "1234",
    joinedDate: "2015-07-10",
    activityHistory: [
      { id: "act-3", action: "Approved Cash Collection", timestamp: "2026-09-05 06:40 PM", details: "Verified cash receipt JAUS26-VG-0001 (₹5,100)", type: "approval" }
    ]
  },
  {
    id: "JAUS26-KY-003",
    fullName: "Sunita Sharma",
    mobile: "9820778899",
    email: "sunita.sharma@jaus2026.org",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    dob: "1990-09-18",
    gender: "Female",
    address: "A-203, Gokul Horizon, Borivali West, Mumbai",
    category: "KY", // Karyakarta
    requestedCategory: "KY",
    categoryApprovalStatus: "Approved",
    status: "Active",
    assignedTeams: ["team-finance", "team-prasad"],
    responsibilities: ["Collection Lead - Gokul Horizon", "Women Wing Coordinator"],
    isTreasurer: false,
    pin: "1234",
    joinedDate: "2019-03-22",
    activityHistory: [
      { id: "act-4", action: "Recorded Donation", timestamp: "2026-09-05 05:20 PM", details: "Collected ₹2,100 from Flat 201 (UPI)", type: "collection" }
    ]
  },
  {
    id: "JAUS26-YK-004",
    fullName: "Vikram Deshmukh",
    mobile: "9820991122",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    dob: "2003-01-25",
    gender: "Male",
    address: "D-12, Sai Kripa Society, Borivali West, Mumbai",
    category: "YK", // Yuva Karyakarta
    requestedCategory: "YK",
    categoryApprovalStatus: "Approved",
    status: "Active",
    assignedTeams: ["team-security", "team-cultural"],
    responsibilities: ["Youth Volunteer", "Sound & Stage Assistant"],
    isTreasurer: false,
    pin: "1234",
    joinedDate: "2022-09-01",
    activityHistory: [
      { id: "act-5", action: "Completed Task", timestamp: "2026-09-04 04:00 PM", details: "Sound check equipment setup completed", type: "task" }
    ]
  },
  {
    id: "JAUS26-KY-005",
    fullName: "Mahesh Chauhan",
    mobile: "9820334455",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    dob: "1988-06-30",
    gender: "Male",
    address: "Shop 4, Market Road, Borivali West, Mumbai",
    category: "KY",
    requestedCategory: "KY",
    categoryApprovalStatus: "Approved",
    status: "Suspended", // Test suspended member
    assignedTeams: ["team-security"],
    responsibilities: ["Ex-Security Coordinator"],
    isTreasurer: false,
    pin: "1234",
    joinedDate: "2018-02-14",
    activityHistory: [
      { id: "act-6", action: "Account Suspended", timestamp: "2026-08-10 11:00 AM", details: "Administrative suspension pending enquiry", type: "profile_update" }
    ]
  },
  {
    id: "JAUS26-SB-006",
    fullName: "Meena Kulkarni",
    mobile: "9820667788",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    dob: "1985-03-14",
    gender: "Female",
    address: "Flat 502, Navkar Heights, Borivali West, Mumbai",
    category: "SB",
    requestedCategory: "SB",
    categoryApprovalStatus: "Approved",
    status: "Active",
    assignedTeams: ["team-prasad"],
    responsibilities: ["Maha Prasad Committee Head"],
    isTreasurer: false,
    pin: "1234",
    joinedDate: "2016-05-19",
    activityHistory: []
  },
  {
    id: "JAUS26-REG-007",
    fullName: "Rohan Joshi",
    mobile: "9820551122",
    email: "rohan.joshi@gmail.com",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    dob: "1986-08-14",
    gender: "Male",
    address: "Flat 401, Building 2, Shivam Enclave, Borivali West, Mumbai",
    category: "KY", // Provisional category until reviewed
    requestedCategory: "CM", // User requested Committee Member during registration
    categoryApprovalStatus: "Pending", // Awaiting Admin/CM review
    status: "Active",
    assignedTeams: ["team-cultural"],
    responsibilities: ["Applicant - Registered Volunteer"],
    isTreasurer: false,
    pin: "1234",
    joinedDate: "2026-09-25",
    activityHistory: [
      {
        id: "act-7",
        action: "Self-Registration Submitted",
        timestamp: "2026-09-25 11:15 AM",
        details: "Self-registered online. Requested Category: Committee Member (CM). Awaiting Admin Review.",
        type: "profile_update"
      }
    ]
  },
  {
    id: "JAUS26-REG-008",
    fullName: "Pooja Nair",
    mobile: "9820448833",
    email: "pooja.nair@outlook.com",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    dob: "1992-12-04",
    gender: "Female",
    address: "B-104, Sai Sadan, Borivali West, Mumbai",
    category: "KY", // Provisional category until reviewed
    requestedCategory: "SB", // User requested Sabhasad during registration
    categoryApprovalStatus: "Pending", // Awaiting Admin/CM review
    status: "Active",
    assignedTeams: ["team-cultural"],
    responsibilities: ["Applicant - Registered Volunteer"],
    isTreasurer: false,
    pin: "1234",
    joinedDate: "2026-09-26",
    activityHistory: [
      {
        id: "act-8",
        action: "Self-Registration Submitted",
        timestamp: "2026-09-26 02:40 PM",
        details: "Self-registered online. Requested Category: Sabhasad (SB). Awaiting Admin Review.",
        type: "profile_update"
      }
    ]
  }
];

export const initialTeams: Team[] = [
  {
    id: "team-finance",
    name: "Vargani & Finance Department",
    description: "Responsible for campaign configuration, receipt books, digital UPI verification and cash audits.",
    leaders: ["JAUS26-CM-001", "JAUS26-SB-002"],
    departmentHeads: ["JAUS26-SB-002"],
    memberIds: ["JAUS26-CM-001", "JAUS26-SB-002", "JAUS26-KY-003"],
    isActive: true,
    createdAt: "2026-07-01"
  },
  {
    id: "team-cultural",
    name: "Cultural & Garba Event Committee",
    description: "Coordinates 9 nights of Raas Garba, sound systems, orchestra artists, and dignitary reception.",
    leaders: ["JAUS26-CM-001"],
    departmentHeads: ["JAUS26-CM-001"],
    memberIds: ["JAUS26-CM-001", "JAUS26-YK-004"],
    isActive: true,
    createdAt: "2026-07-01"
  },
  {
    id: "team-prasad",
    name: "Maha Prasad & Food Management",
    description: "Handles daily Bhog preparation, distribution logistics, and Maha Prasad on Ashtami day.",
    leaders: ["JAUS26-SB-006"],
    departmentHeads: ["JAUS26-SB-006"],
    memberIds: ["JAUS26-SB-006", "JAUS26-KY-003"],
    isActive: true,
    createdAt: "2026-07-05"
  },
  {
    id: "team-security",
    name: "Security & Crowd Control Team",
    description: "Ensures volunteer presence at gates, queue management, fire safety, and CCTV surveillance coordination.",
    leaders: ["JAUS26-YK-004"],
    departmentHeads: ["JAUS26-YK-004"],
    memberIds: ["JAUS26-YK-004", "JAUS26-KY-005"],
    isActive: true,
    createdAt: "2026-07-10"
  }
];

export const initialTasks: Task[] = [
  {
    id: "tsk-1",
    title: "Verify Gokul Horizon Wing A Floor Structure",
    description: "Check flat occupancy and confirm building layout before collection starts.",
    assignedToType: "member",
    assignedToId: "JAUS26-KY-003",
    assignedToName: "Sunita Sharma",
    dueDate: "2026-09-10",
    status: "Completed",
    createdBy: "JAUS26-CM-001",
    createdAt: "2026-09-01",
    completedAt: "2026-09-04 11:30 AM"
  },
  {
    id: "tsk-2",
    title: "Collect QR Standees & Receipt Books from Head Office",
    description: "Distribute official JAUS 2026 QR standees to all designated building collectors.",
    assignedToType: "team",
    assignedToId: "team-finance",
    assignedToName: "Vargani & Finance Department",
    dueDate: "2026-09-12",
    status: "In Progress",
    createdBy: "JAUS26-SB-002",
    createdAt: "2026-09-03"
  },
  {
    id: "tsk-3",
    title: "Stage Sound System Inspection & Generator Backup Check",
    description: "Conduct load test on 125 KVA silent generator and test audio monitors for stage.",
    assignedToType: "member",
    assignedToId: "JAUS26-YK-004",
    assignedToName: "Vikram Deshmukh",
    dueDate: "2026-09-15",
    status: "To Do",
    createdBy: "JAUS26-CM-001",
    createdAt: "2026-09-05"
  }
];

// Helper to generate a realistic building with Wings, Floors, Flats, Shops
export function generateBuildingUnits(
  wingName: string, 
  floors: number, 
  flatsPerFloor: number, 
  shopsOnGround: number = 0
) {
  const units = [];

  // Ground Floor Shops
  if (shopsOnGround > 0) {
    for (let s = 1; s <= shopsOnGround; s++) {
      units.push({
        id: `unit-${wingName.replace(/\s+/g, '')}-G-S${s}`,
        wingName,
        wing: wingName.replace(/^Wing\s*/i, ''),
        floor: 'G' as const,
        unitNumber: `Shop ${s}`,
        type: 'Shop' as const,
        unitType: 'Shop' as const,
        collectionStatus: 'Not Yet Visited' as const
      });
    }
  }

  // Residential Floors
  for (let f = 1; f <= floors; f++) {
    for (let fl = 1; fl <= flatsPerFloor; fl++) {
      const flatNum = `${f}${fl < 10 ? '0' + fl : fl}`;
      units.push({
        id: `unit-${wingName.replace(/\s+/g, '')}-f${f}-${flatNum}`,
        wingName,
        wing: wingName.replace(/^Wing\s*/i, ''),
        floor: f,
        unitNumber: `Flat ${flatNum}`,
        type: 'Flat' as const,
        unitType: 'Flat' as const,
        collectionStatus: 'Not Yet Visited' as const
      });
    }
  }

  return units;
}

// Preset pre-filled units for Gokul Horizon with realistic states
const gokulWingAUnits = generateBuildingUnits("Wing A", 4, 3, 2);
// Set some unit statuses for realistic demo
if (gokulWingAUnits[0]) {
  gokulWingAUnits[0].collectionStatus = 'Collection Received';
  gokulWingAUnits[0].donorName = 'Manoj Sharma (Shop 1 - Medical)';
  gokulWingAUnits[0].donorMobile = '9820011122';
  gokulWingAUnits[0].donationId = 'don-1';
}
if (gokulWingAUnits[1]) {
  gokulWingAUnits[1].collectionStatus = 'Payment Pending — Donor Will Pay Later';
  gokulWingAUnits[1].donorName = 'Kirit Bhai (Shop 2 - Kirana)';
  gokulWingAUnits[1].donorMobile = '9820022233';
}
if (gokulWingAUnits[2]) {
  // Flat 101
  gokulWingAUnits[2].collectionStatus = 'Collection Received';
  gokulWingAUnits[2].donorName = 'Harish Mehta';
  gokulWingAUnits[2].donorMobile = '9820033344';
  gokulWingAUnits[2].donationId = 'don-2';
}
if (gokulWingAUnits[3]) {
  // Flat 102
  gokulWingAUnits[3].collectionStatus = 'House Closed / Nobody Available';
}
if (gokulWingAUnits[4]) {
  // Flat 103
  gokulWingAUnits[4].collectionStatus = 'Non-Cooperative / Refused';
}
if (gokulWingAUnits[5] && gokulWingAUnits[6]) {
  // Flat 201 and 202 same family!
  gokulWingAUnits[5].collectionStatus = 'Collection Received';
  gokulWingAUnits[5].donorName = 'Pankaj & Rakesh Shah (Joint Family)';
  gokulWingAUnits[5].donorMobile = '9820044455';
  gokulWingAUnits[5].linkedFamilyUnitIds = [gokulWingAUnits[6].id];
  gokulWingAUnits[5].donationId = 'don-3';

  gokulWingAUnits[6].collectionStatus = 'Multiple Flats/Units — Same Family';
  gokulWingAUnits[6].donorName = 'Pankaj & Rakesh Shah (Joint Family)';
  gokulWingAUnits[6].donorMobile = '9820044455';
  gokulWingAUnits[6].linkedFamilyUnitIds = [gokulWingAUnits[5].id];
  gokulWingAUnits[6].notes = 'Donation collected combined under Flat 201';
}

const gokulWingBUnits = generateBuildingUnits("Wing B", 4, 3, 0);

export const initialCampaigns: VarganiCampaign[] = [
  {
    id: "camp-gokul",
    name: "Gokul Horizon Residency",
    type: "Building-Based",
    targetAmount: 150000,
    year: 2026,
    startDate: "2026-09-01",
    endDate: "2026-09-25",
    status: "Open",
    teamLeadId: "JAUS26-KY-003",
    teamLeadName: "Sunita Sharma",
    targetNotes: "Prestigious 2-wing complex on SV Road. High voluntary participation expected.",
    buildingConfig: {
      societyName: "Gokul Horizon Co-op Housing Society",
      isConfirmed: true,
      confirmedBy: "Sunita Sharma",
      confirmedAt: "2026-09-02 11:00 AM",
      wings: [
        {
          id: "wing-a",
          name: "Wing A",
          floors: 4,
          hasGroundFloor: true,
          flatsPerFloor: 3,
          shopsOnGround: 2,
          units: gokulWingAUnits
        },
        {
          id: "wing-b",
          name: "Wing B",
          floors: 4,
          hasGroundFloor: false,
          flatsPerFloor: 3,
          shopsOnGround: 0,
          units: gokulWingBUnits
        }
      ]
    },
    createdAt: "2026-08-25"
  },
  {
    id: "camp-navkar",
    name: "Navkar Heights Society",
    type: "Building-Based",
    targetAmount: 200000,
    year: 2026,
    startDate: "2026-09-10",
    endDate: "2026-09-28",
    status: "Draft", // In draft! Shows team lead review & building configuration workflow
    teamLeadId: "JAUS26-SB-006",
    teamLeadName: "Meena Kulkarni",
    targetNotes: "New 7-storey building with 2 wings. Structure needs confirmation by Meena before collection starts.",
    buildingConfig: {
      societyName: "Navkar Heights",
      isConfirmed: false,
      wings: [
        {
          id: "wing-c1",
          name: "Wing C-1",
          floors: 5,
          hasGroundFloor: true,
          flatsPerFloor: 4,
          shopsOnGround: 3,
          units: generateBuildingUnits("Wing C-1", 5, 4, 3)
        }
      ]
    },
    createdAt: "2026-09-04"
  },
  {
    id: "camp-individual",
    name: "General Merchants & Patron Donors 2026",
    type: "Individual-Based",
    targetAmount: 500000,
    year: 2026,
    startDate: "2026-08-20",
    endDate: "2026-10-02",
    status: "Open",
    teamLeadId: "JAUS26-CM-001",
    teamLeadName: "Anand Varma",
    targetNotes: "Direct voluntary patron donations from local business owners, well-wishers, and life members.",
    createdAt: "2026-08-20"
  }
];

export const initialDonations: DonationRecord[] = [
  {
    id: "don-1",
    receiptNumber: "JAUS26-VG-0001",
    campaignId: "camp-gokul",
    campaignName: "Gokul Horizon Residency",
    campaignType: "Building-Based",
    unitId: "unit-WingA-G-S1",
    unitDetails: "Gokul Horizon, Wing A, Ground Floor, Shop 1",
    donorName: "Manoj Sharma",
    donorMobile: "9820011122",
    amount: 5100,
    paymentMethod: "Cash",
    financialStatus: "Approved", // Approved by Treasurer Rajesh Patel
    collectorId: "JAUS26-KY-003",
    collectorName: "Sunita Sharma",
    collectedAt: "2026-09-05 11:30 AM",
    approvedBy: "JAUS26-SB-002",
    approvedByName: "Rajesh Patel (Treasurer)",
    approvedAt: "2026-09-05 06:40 PM",
    whatsappSent: true,
    whatsappSentAt: "2026-09-05 11:32 AM",
    auditTrail: [
      {
        id: "aud-1",
        timestamp: "2026-09-05 11:30 AM",
        userId: "JAUS26-KY-003",
        userName: "Sunita Sharma",
        action: "Created Cash Donation Receipt",
        newValue: "₹5,100 (Status: Pending Approval)",
        authMethod: "4-digit PIN"
      },
      {
        id: "aud-2",
        timestamp: "2026-09-05 06:40 PM",
        userId: "JAUS26-SB-002",
        userName: "Rajesh Patel (Treasurer)",
        action: "Approved Cash Collection",
        previousValue: "Pending",
        newValue: "Approved",
        authMethod: "4-digit PIN"
      }
    ]
  },
  {
    id: "don-2",
    receiptNumber: "JAUS26-VG-0002",
    campaignId: "camp-gokul",
    campaignName: "Gokul Horizon Residency",
    campaignType: "Building-Based",
    unitId: "unit-WingA-f1-101",
    unitDetails: "Gokul Horizon, Wing A, Floor 1, Flat 101",
    donorName: "Harish Mehta",
    donorMobile: "9820033344",
    amount: 2100,
    paymentMethod: "UPI / Online",
    transactionId: "UPI/260905/887192841",
    transactionProofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80",
    financialStatus: "Completed",
    collectorId: "JAUS26-KY-003",
    collectorName: "Sunita Sharma",
    collectedAt: "2026-09-05 05:20 PM",
    whatsappSent: true,
    whatsappSentAt: "2026-09-05 05:22 PM",
    auditTrail: [
      {
        id: "aud-3",
        timestamp: "2026-09-05 05:20 PM",
        userId: "JAUS26-KY-003",
        userName: "Sunita Sharma",
        action: "Created UPI Donation (UTR: UPI/260905/887192841)",
        newValue: "₹2,100 (Completed)",
        authMethod: "Biometric"
      }
    ]
  },
  {
    id: "don-3",
    receiptNumber: "JAUS26-VG-0003",
    campaignId: "camp-gokul",
    campaignName: "Gokul Horizon Residency",
    campaignType: "Building-Based",
    unitId: "unit-WingA-f2-201",
    unitDetails: "Gokul Horizon, Wing A, Floor 2, Flat 201 & 202",
    donorName: "Pankaj & Rakesh Shah (Joint Family)",
    donorMobile: "9820044455",
    amount: 11000,
    paymentMethod: "Cash",
    financialStatus: "Pending", // PENDING CASH APPROVAL! To show Treasurer approval queue
    collectorId: "JAUS26-KY-003",
    collectorName: "Sunita Sharma",
    collectedAt: "2026-09-06 09:15 AM",
    whatsappSent: true,
    whatsappSentAt: "2026-09-06 09:16 AM",
    auditTrail: [
      {
        id: "aud-4",
        timestamp: "2026-09-06 09:15 AM",
        userId: "JAUS26-KY-003",
        userName: "Sunita Sharma",
        action: "Created Cash Donation Receipt (Combined for Flat 201 & 202)",
        newValue: "₹11,000 (Awaiting Treasurer Cash Approval)",
        authMethod: "4-digit PIN"
      }
    ]
  },
  {
    id: "don-4",
    receiptNumber: "JAUS26-VG-0004",
    campaignId: "camp-individual",
    campaignName: "General Merchants & Patron Donors 2026",
    campaignType: "Individual-Based",
    donorName: "Bhagwati Jewellers (Prop: Ramesh Soni)",
    donorMobile: "9820055566",
    amount: 25000,
    paymentMethod: "UPI / Online",
    transactionId: "HDFC9928172648",
    transactionProofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80",
    financialStatus: "Completed",
    collectorId: "JAUS26-CM-001",
    collectorName: "Anand Varma",
    collectedAt: "2026-09-04 02:00 PM",
    whatsappSent: true,
    whatsappSentAt: "2026-09-04 02:05 PM",
    auditTrail: [
      {
        id: "aud-5",
        timestamp: "2026-09-04 02:00 PM",
        userId: "JAUS26-CM-001",
        userName: "Anand Varma",
        action: "Direct Patron Donation via NEFT/UPI",
        newValue: "₹25,000 (Completed)",
        authMethod: "4-digit PIN"
      }
    ]
  },
  {
    id: "don-5",
    receiptNumber: "JAUS26-VG-0005",
    campaignId: "camp-gokul",
    campaignName: "Gokul Horizon Residency",
    campaignType: "Building-Based",
    unitId: "unit-WingA-f3-304",
    unitDetails: "Gokul Horizon, Wing A, Floor 3, Flat 304",
    donorName: "Vikas Deshmukh",
    donorMobile: "9820066677",
    amount: 5100,
    paymentMethod: "Cash",
    financialStatus: "Pending",
    collectorId: "JAUS26-KY-003",
    collectorName: "Sunita Sharma",
    collectedAt: "2026-09-06 11:20 AM",
    whatsappSent: true,
    whatsappSentAt: "2026-09-06 11:22 AM",
    auditTrail: [
      {
        id: "aud-6",
        timestamp: "2026-09-06 11:20 AM",
        userId: "JAUS26-KY-003",
        userName: "Sunita Sharma",
        action: "Created Cash Donation Receipt (Wing A / 304)",
        newValue: "₹5,100 (Awaiting Treasurer Cash Approval)",
        authMethod: "4-digit PIN"
      }
    ]
  },
  {
    id: "don-6",
    receiptNumber: "JAUS26-VG-0006",
    campaignId: "camp-gokul",
    campaignName: "Gokul Horizon Residency",
    campaignType: "Building-Based",
    unitId: "unit-WingA-f5-502",
    unitDetails: "Gokul Horizon, Wing A, Floor 5, Flat 502",
    donorName: "Anil & Kavita Kadam",
    donorMobile: "9820077788",
    amount: 2500,
    paymentMethod: "Cash",
    financialStatus: "Pending",
    collectorId: "JAUS26-KY-003",
    collectorName: "Sunita Sharma",
    collectedAt: "2026-09-06 01:40 PM",
    whatsappSent: true,
    whatsappSentAt: "2026-09-06 01:41 PM",
    auditTrail: [
      {
        id: "aud-7",
        timestamp: "2026-09-06 01:40 PM",
        userId: "JAUS26-KY-003",
        userName: "Sunita Sharma",
        action: "Created Cash Donation Receipt (Wing A / 502)",
        newValue: "₹2,500 (Awaiting Treasurer Cash Approval)",
        authMethod: "4-digit PIN"
      }
    ]
  }
];

// Pending payment commitments (donor promised to pay later)
export const initialPendingPayments: DonationRecord[] = [
  {
    id: "pend-1",
    receiptNumber: "JAUS26-PEND-0001",
    campaignId: "camp-gokul",
    campaignName: "Gokul Horizon Residency",
    campaignType: "Building-Based",
    unitId: "unit-WingA-G-S2",
    unitDetails: "Gokul Horizon, Wing A, Ground Floor, Shop 2",
    donorName: "Kirit Bhai (Shop 2 - Kirana)",
    donorMobile: "9820022233",
    amount: 3100,
    paymentMethod: "Cash",
    financialStatus: "Pending",
    isPendingPaymentCommitment: true,
    promisedPaymentDate: "2026-09-15",
    collectorId: "JAUS26-KY-003",
    collectorName: "Sunita Sharma",
    collectedAt: "2026-09-05 12:45 PM",
    whatsappSent: true,
    whatsappSentAt: "2026-09-05 12:47 PM",
    auditTrail: [
      {
        id: "aud-pend-1",
        timestamp: "2026-09-05 12:45 PM",
        userId: "JAUS26-KY-003",
        userName: "Sunita Sharma",
        action: "Issued Pending Payment Receipt (Commitment)",
        newValue: "Promised ₹3,100 on 2026-09-15",
        authMethod: "4-digit PIN"
      }
    ]
  }
];

export const initialEvents: NavratriEvent[] = [
  {
    id: "evt-1",
    name: "Ghatasthapana & Akhand Jyot Sthapana",
    date: "2026-10-03",
    startTime: "07:30",
    endTime: "10:30",
    venue: "Shree Ambe Dham Main Mandap, SV Road Ground, Borivali West",
    description: "Sacred invocation of Maa Ambe with traditional Vedic chanting by 11 pandits, Kalash Sthapana, and lighting of Akhand Jyoti.",
    posterUrl: "https://images.unsplash.com/photo-1609137144822-26164223f66a?w=600&auto=format&fit=crop&q=80",
    status: "Published",
    importantInstructions: "All volunteers to arrive in traditional Kurta/Saree attire by 06:45 AM. Prasad distribution begins at 10:00 AM.",
    chiefGuest: "Shri Mangal Prabhat Lodha & Local Samiti Dignitaries",
    createdBy: "JAUS26-CM-001",
    createdAt: "2026-08-15"
  },
  {
    id: "evt-2",
    name: "Grand Garba & Dandiya Raas Night (Day 3)",
    date: "2026-10-05",
    startTime: "20:00",
    endTime: "23:59",
    venue: "Main Ground Arena, Borivali West",
    description: "Featuring live orchestra with renowned Gujarati folk singer troupe, traditional 3-Taali and Dodhiyo Garba competitions.",
    posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    status: "Published",
    importantInstructions: "Strict dress code: Traditional Garba attire mandatory. QR passes scanned at South Gate.",
    chiefGuest: "Renowned Folk Artistes & Ward Corporator",
    createdBy: "JAUS26-CM-001",
    createdAt: "2026-08-20"
  },
  {
    id: "evt-3",
    name: "Youth Garba Workshop & Aarti Practice",
    date: "2026-10-05", // Same day as evt-2, deliberately overlapping partially to test overlap alert!
    startTime: "19:00",
    endTime: "20:30", // Overlaps with 20:00
    venue: "Mini Hall & Stage Side, Borivali West",
    description: "Orientation session and choreography practice for youth volunteers.",
    status: "Draft",
    importantInstructions: "Carry your own dandiya sticks.",
    createdBy: "JAUS26-CM-001",
    createdAt: "2026-08-22"
  },
  {
    id: "evt-4",
    name: "Maha Ashtami Havan & Chandi Path",
    date: "2026-10-10",
    startTime: "09:00",
    endTime: "13:30",
    venue: "Yagya Shala, Shree Ambe Dham, Borivali West",
    description: "Sacred Durga Saptashati Havan with Poornahuti at 12:30 PM followed by Kanya Pujan of 108 Kanyas.",
    status: "Published",
    importantInstructions: "Families registered for Havan yajman seating to occupy designated asanas by 08:30 AM.",
    chiefGuest: "Mahant Swami Vishwanand Ji",
    createdBy: "JAUS26-CM-001",
    createdAt: "2026-08-25"
  },
  {
    id: "evt-5",
    name: "Maha Prasad Distribution (5000+ Devotees)",
    date: "2026-10-10",
    startTime: "13:00",
    endTime: "17:00",
    venue: "Annakshetra Hall, Borivali West",
    description: "Community feast organized for all residents, donors, and devotees.",
    status: "Draft",
    importantInstructions: "Team Prasad volunteers on active duty across all 6 serving queues.",
    createdBy: "JAUS26-CM-001",
    createdAt: "2026-09-01"
  },
  {
    id: "evt-6",
    name: "Ravan Dahan & Visarjan Shobhayatra",
    date: "2026-10-12",
    startTime: "17:30",
    endTime: "22:00",
    venue: "Ground to Gorai Beach Route",
    description: "Grand farewell procession with Nashik Dhol, flower showers, and symbolic effigy burning.",
    status: "Published",
    importantInstructions: "Police escort coordination required at SV Road junction.",
    createdBy: "JAUS26-CM-001",
    createdAt: "2026-09-02"
  },
  {
    id: "evt-7",
    name: "Mandal Sthapana & Mandap Bhoomi Pujan",
    date: "2026-09-28",
    startTime: "08:00",
    endTime: "11:00",
    venue: "SV Road Ground, Borivali West",
    description: "Inaugural Bhoomi Pujan for Navratri Mandap and lighting of auspicious flame with core committee.",
    status: "Completed",
    importantInstructions: "All ritual samagri arranged by Puja department.",
    chiefGuest: "Local Corporator & Samiti Elders",
    createdBy: "JAUS26-CM-001",
    createdAt: "2026-09-01"
  },
  {
    id: "evt-8",
    name: "Outdoor Celebrity Dandiya Night (Rain Contingency)",
    date: "2026-10-08",
    startTime: "20:30",
    endTime: "23:30",
    venue: "Open Lawns Ground, Borivali West",
    description: "Special celebrity dandiya performance scheduled for outdoor lawns.",
    status: "Cancelled",
    importantInstructions: "Cancelled due to heavy rainfall advisory issued by BMC. Devotees redirected to Main Covered Dome Mandap.",
    createdBy: "JAUS26-CM-001",
    createdAt: "2026-09-05"
  }
];

export const initialBroadcastTemplates: BroadcastTemplate[] = [
  {
    id: "tmpl-1",
    title: "Navratri Mahaprasad Invitation / महाप्रसाद निमंत्रण",
    category: "Event",
    language: "Marathi",
    content: {
      marathi: "जय माता दी! 🙏\n\nसस्नेह जय अंबे,\nजय अंबे उत्सव समिती (JAUS २०२६) तर्फे आपणांस व आपल्या परिवारास महाअष्टमी हवन आणि महाप्रसादाचे आदरपूर्वक निमंत्रण.\n\n📍 स्थळ: श्री अंबे धाम मैदान, एस. व्ही. रोड, बोरिवली (प.)\n📅 दिनांक: शनिवार, १० ऑक्टोबर २०२६\n⏰ हवन: सकाळी ९:०० वाजता | महाप्रसाद: दुपारी १:०० वाजता\n\nआई जगदंबेची कृपा आपल्या परिवारावर सदैव राहो!\n— व्यवस्थापक समिती, जय अंबे उत्सव समिती २०२६",
      hindi: "जय माता दी! 🙏\n\nसादर जय अम्बे,\nजय अम्बे उत्सव समिति (JAUS 2026) की ओर से आपको एवं आपके परिवार को महाअष्टमी हवन एवं महाप्रसाद का हार्दिक निमंत्रण।\n\n📍 स्थान: श्री अम्बे धाम मैदान, एस. वी. रोड, बोरिवली (प.)\n📅 दिनांक: शनिवार, 10 अक्टूबर 2026\n⏰ हवन: सुबह 9:00 बजे | महाप्रसाद: दोपहर 1:00 बजे से\n\nमाँ अम्बे की कृपा आप सभी पर बनी रहे!\n— प्रबंध समिति, जय अम्बे उत्सव समिति 2026",
      english: "Jai Mata Di! 🙏\n\nRespected Donor / Resident,\nJai Ambe Utsav Samiti (JAUS 2026) cordially invites you and your family to the auspicious Maha Ashtami Havan & Mahaprasad.\n\n📍 Venue: Shree Ambe Dham Ground, SV Road, Borivali (West)\n📅 Date: Saturday, 10th October 2026\n⏰ Havan: 9:00 AM | Mahaprasad: 1:00 PM onwards\n\nMay Maa Ambe shower health, peace, and prosperity on your home!\n— Managing Committee, Jai Ambe Utsav Samiti 2026"
    }
  },
  {
    id: "tmpl-2",
    title: "Vargani Contribution Gratitude / वर्गणी पावती व आभार",
    category: "Donation",
    language: "Marathi",
    content: {
      marathi: "जय माता दी! 🙏\n\nआदरणीय देणगीदार,\nजय अंबे उत्सव समिती (JAUS २०२६) नवरात्र महोत्सवासाठी आपल्या स्वेच्छा वर्गणी योगदानाबद्दल आपले मनःपूर्वक आभार मानते. आपली अधिकृत डिजिटल पावती व्हॉट्सअ‍ॅपवर पाठवण्यात आली आहे.\n\nआपल्या सहकार्यामुळे धार्मिक व सांस्कृतिक परंपरा यशस्वीरित्या संपन्न होत आहेत.\n\nआई अंबे आपणांस सुख-समृद्धी लाभो!\n— जय अंबे उत्सव समिती २०२६",
      hindi: "जय माता दी! 🙏\n\nआदरणीय दानदाता,\nजय अम्बे उत्सव समिति (JAUS 2026) नवरात्रि महोत्सव हेतु आपके स्वैच्छिक वर्गणी योगदान के लिए हार्दिक आभार व्यक्त करती है। आपकी आधिकारिक डिजिटल रसीद प्रेषित कर दी गई है।\n\nमाँ जगदम्बा आपके परिवार में सुख, शांति एवं समृद्धि प्रदान करें!\n— जय अम्बे उत्सव समिति 2026",
      english: "Jai Mata Di! 🙏\n\nRespected Donor,\nJai Ambe Utsav Samiti (JAUS 2026) expresses deep gratitude for your generous voluntary Vargani contribution towards Navratri Mahotsav 2026.\n\nYour patronage supports our cultural heritage, daily rituals, and community service.\n\nMay Maa Ambe bless you and your family!\n— Jai Ambe Utsav Samiti 2026"
    }
  },
  {
    id: "tmpl-3",
    title: "Maha Aarti & Dandiya Schedule / महाआरती व दांडिया वेळापत्रक",
    category: "Schedule",
    language: "Marathi",
    content: {
      marathi: "जय माता दी! ✨\n\nसर्व रहिवासी व भाविकांसाठी नवरात्र महोत्सवाचे अधिकृत वेळापत्रक जाहीर करण्यात आले आहे.\n\n✨ दैनिक महाआरती: रात्री ८:०० वाजता\n💃 पारंपरिक गरबा व दांडिया रास: रात्री ८:३० ते ११:३० वा.\n\nप्रवेश पास व नियमावलीसाठी आपल्या विंगच्या समन्वयकांशी संपर्क साधावा.\n— जय अंबे उत्सव समिती २०२६",
      hindi: "जय माता दी! ✨\n\nसभी निवासियों एवं भक्तों के लिए नवरात्रि महोत्सव का आधिकारिक कार्यक्रम घोषित किया गया है।\n\n✨ दैनिक महाआरती: रात्रि 8:00 बजे\n💃 पारंपरिक गरबा व डांडिया रास: रात्रि 8:30 से 11:30 बजे\n\nप्रवेश पास व दिशानिर्देशों हेतु अपने विंग समन्वयक से संपर्क करें।\n— जय अम्बे उत्सव समिति 2026",
      english: "Jai Mata Di! ✨\n\nOfficial schedule for Navratri Utsav 2026 is announced for all residents and patrons:\n\n✨ Daily Maha Aarti: 8:00 PM\n💃 Traditional Garba & Dandiya Raas: 8:30 PM to 11:30 PM\n\nPlease connect with your wing volunteer for entry pass guidelines.\n— Jai Ambe Utsav Samiti 2026"
    }
  }
];

export const initialBroadcasts: PublicBroadcast[] = [
  {
    id: "bc-1",
    title: "Ghatasthapana Official Invitation to Gokul Horizon",
    message: "जय माता दी! 🙏 गोकुळ होरायझन मधील सर्व रहिवासी व देणगीदारांना ३ ऑक्टोबर रोजी सकाळी ७:३० वाजता घटस्थापना पूजनाचे आदरपूर्वक निमंत्रण. स्थळ: एस. व्ही. रोड मैदान.",
    language: "Marathi",
    content: {
      marathi: "जय माता दी! 🙏 गोकुळ होरायझन मधील सर्व रहिवासी व देणगीदारांना ३ ऑक्टोबर रोजी सकाळी ७:३० वाजता घटस्थापना पूजनाचे आदरपूर्वक निमंत्रण. स्थळ: एस. व्ही. रोड मैदान.",
      hindi: "जय माता दी! 🙏 गोकुल होराइजन के सभी निवासियों एवं दानदाताओं को 3 अक्टूबर सुबह 7:30 बजे घटस्थापना पूजन का सादर निमंत्रण। स्थान: एस. वी. रोड मैदान।",
      english: "Jai Mata Di! 🙏 Warm invitation to all residents and donors of Gokul Horizon for Ghatasthapana on 3rd October at 7:30 AM at SV Road Ground."
    },
    mediaType: "none",
    audienceType: "by_building",
    filterValue: "Gokul Horizon Residency",
    filterDescription: "Building: Gokul Horizon Residency",
    targetCount: 48,
    deliveryChannel: "WhatsApp only",
    scheduleType: "immediate",
    status: "Sent",
    sentAt: "2026-09-04 10:00 AM",
    createdAt: "2026-09-04",
    createdBy: "Anand Varma",
    stats: {
      sent: 48,
      delivered: 46,
      failed: 2
    }
  },
  {
    id: "bc-2",
    title: "Weekly Navratri Preparations Reminder",
    message: "जय माता दी! नवरात्र महोत्सवाची तयारी जोरात सुरू आहे. सर्व देणगीदारांना रविवार संध्याकाळी ५:०० वाजता स्वयंसेवक आढावा बैठकीची माहिती.",
    language: "Marathi",
    content: {
      marathi: "जय माता दी! नवरात्र महोत्सवाची तयारी जोरात सुरू आहे. सर्व देणगीदारांना रविवार संध्याकाळी ५:०० वाजता स्वयंसेवक आढावा बैठकीची माहिती.",
      hindi: "जय माता दी! नवरात्रि महोत्सव की तैयारियां पूर्ण गति से जारी हैं। सभी दानदाताओं को रविवार शाम 5:00 बजे की समीक्षा बैठक की सूचना।",
      english: "Jai Mata Di! Navratri preparations are in full swing. Notice to all donors regarding volunteer review meeting this Sunday at 5:00 PM."
    },
    mediaType: "none",
    audienceType: "all_donors",
    filterDescription: "All Registered Donors",
    targetCount: 120,
    deliveryChannel: "WhatsApp only",
    scheduleType: "recurring",
    recurringInterval: "weekly",
    scheduledDate: "2026-09-13",
    scheduledTime: "11:00",
    status: "Scheduled",
    createdAt: "2026-09-05",
    createdBy: "Anand Varma",
    stats: {
      sent: 0,
      delivered: 0,
      failed: 0
    }
  }
];

export const initialReceiptTemplates: ReceiptTemplate[] = [
  {
    id: "rcpt-std-1",
    name: "Official Navratri 2026 Standard Receipt",
    isDefault: true,
    headerTitle: "JAI AMBE UTSAV SAMITI",
    subHeader: "Shree Ambe Dham Ground, SV Road, Borivali West, Mumbai - 400092",
    registrationText: "Public Trust Regn. No. MAH/MUM/1988/2026",
    footerBlessing: "Thank you for your noble contribution. May Maa Ambe bless you and your family with health, peace, and prosperity.",
    signatoryTitle: "Designated Treasurer / Trustee",
    showQrCode: true,
    accentColor: "#d97706",
    createdAt: "2026-08-01"
  },
  {
    id: "rcpt-gold-2",
    name: "VIP / Corporate Patron Certificate Receipt",
    isDefault: false,
    headerTitle: "JAI AMBE UTSAV SAMITI — GRAND PATRON RECEIPT",
    subHeader: "Executive Committee & Trustee Board — Navratri Mahotsav 2026",
    registrationText: "Charitable Trust Regn. No. MAH/MUM/1988/2026 | IT 80G Compliant",
    footerBlessing: "With deepest gratitude from the JAUS 2026 Organizing Committee for patronizing our grand festivities.",
    signatoryTitle: "President & General Treasurer",
    showQrCode: true,
    accentColor: "#4f46e5",
    createdAt: "2026-08-15"
  }
];
