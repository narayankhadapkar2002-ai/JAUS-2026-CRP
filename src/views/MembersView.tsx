import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Shield, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Edit3, 
  ChevronRight, 
  X,
  History,
  Briefcase,
  Lock,
  Check,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  Member, 
  MemberCategory, 
  MemberStatus, 
  Gender, 
  MEMBER_HIERARCHY, 
  CategoryApprovalStatus 
} from '../types';

export const MembersView: React.FC = () => {
  const { 
    members, 
    currentUser, 
    teams, 
    addMemberByAdmin, 
    updateMemberProfile, 
    changeMemberCategory, 
    changeMemberStatus,
    reviewMemberCategory,
    toggleTreasurerDesignation,
    requestPinAuth
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [isCreatingMember, setIsCreatingMember] = useState(false);

  // Review modal state
  const [reviewingMember, setReviewingMember] = useState<Member | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'change' | 'reject'>('approve');
  const [reviewSelectedCategory, setReviewSelectedCategory] = useState<MemberCategory>('KY');
  const [reviewNotes, setReviewNotes] = useState('');

  // New member form (Admin direct creation)
  const [newFullName, setNewFullName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDob, setNewDob] = useState('1990-01-01');
  const [newGender, setNewGender] = useState<Gender>('Male');
  const [newAddress, setNewAddress] = useState('');
  const [newCategory, setNewCategory] = useState<MemberCategory>('CM');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newPin, setNewPin] = useState('1234');
  const [newTeam, setNewTeam] = useState<string>('team-finance');

  const isAdmin = currentUser?.category === 'CM';

  // Members awaiting category review
  const pendingReviewMembers = members.filter(
    m => m.categoryApprovalStatus === 'Pending'
  );

  // Filter members
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.mobile.includes(search) ||
      m.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesApproval = 
      selectedApprovalStatus === 'all' || 
      (selectedApprovalStatus === 'Pending' && m.categoryApprovalStatus === 'Pending') ||
      (selectedApprovalStatus === 'Approved' && (!m.categoryApprovalStatus || m.categoryApprovalStatus === 'Approved')) ||
      (selectedApprovalStatus === 'Rejected' && m.categoryApprovalStatus === 'Rejected') ||
      (selectedApprovalStatus === 'Changed' && m.categoryApprovalStatus === 'Changed');
    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesApproval && matchesStatus;
  });

  const getCategoryMeta = (cat: MemberCategory) => {
    return MEMBER_HIERARCHY.find(h => h.category === cat) || {
      category: cat,
      name: cat,
      rank: 4,
      description: 'Member',
      accessLevel: 'Standard',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
    };
  };

  const handleOpenReviewModal = (member: Member, initialDecision: 'approve' | 'change' | 'reject') => {
    setReviewingMember(member);
    setReviewDecision(initialDecision);
    setReviewSelectedCategory(
      initialDecision === 'approve'
        ? (member.requestedCategory || member.category)
        : initialDecision === 'reject'
        ? 'KY'
        : (member.requestedCategory || member.category)
    );
    setReviewNotes('');
  };

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingMember) return;

    if (!isAdmin) {
      alert('Access Denied: Only Committee Members / Admins can review requested categories.');
      return;
    }

    const decisionLabel = 
      reviewDecision === 'approve' ? `Approve as ${getCategoryMeta(reviewingMember.requestedCategory || reviewingMember.category).name}` :
      reviewDecision === 'reject' ? 'Reject Higher Category (Assign as Karyakarta)' :
      `Change Category to ${getCategoryMeta(reviewSelectedCategory).name}`;

    const authed = await requestPinAuth({
      title: 'Review Member Category',
      description: `Authorize decision for ${reviewingMember.fullName}: ${decisionLabel}.`,
      actionName: 'Member Category Review',
      requiredRole: 'Admin'
    });

    if (!authed) return;

    const res = reviewMemberCategory(
      reviewingMember.id,
      reviewDecision,
      reviewDecision === 'change' ? reviewSelectedCategory : undefined,
      reviewNotes.trim() || undefined
    );

    if (res.success) {
      // Update active member if viewing
      if (activeMember?.id === reviewingMember.id) {
        const updated = members.find(m => m.id === reviewingMember.id);
        if (updated) setActiveMember(updated);
      }
      setReviewingMember(null);
    } else {
      alert(res.message);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Only Committee Members / Admins can create official members directly.');
      return;
    }

    const clean = newMobile.replace(/\D/g, '');
    if (clean.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    // Require PIN auth for sensitive admin action
    const authenticated = await requestPinAuth({
      title: 'Admin Member Provisioning',
      description: `Authorize direct appointment of ${newFullName} as ${getCategoryMeta(newCategory).name}. Committee Members created directly by Admin are pre-approved immediately.`,
      actionName: 'Admin Created Member',
      requiredRole: 'Admin'
    });

    if (!authenticated) return;

    addMemberByAdmin({
      fullName: newFullName,
      mobile: clean,
      email: newEmail || undefined,
      dob: newDob,
      gender: newGender,
      address: newAddress,
      category: newCategory,
      status: 'Active',
      assignedTeams: [newTeam],
      responsibilities: [newResponsibility || (newCategory === 'CM' ? 'Committee Member' : 'Volunteer')],
      pin: newPin || '1234'
    });

    setIsCreatingMember(false);
    // Reset
    setNewFullName('');
    setNewMobile('');
    setNewAddress('');
    setNewResponsibility('');
  };

  // Category changes after registration (Section 5)
  // Keeps the same member account, same identity, same history, NOT creating a new account.
  const handleCategoryChange = async (member: Member, nextCat: MemberCategory) => {
    if (!isAdmin) {
      alert('Only Committee Members / Admins can change member hierarchy category.');
      return;
    }

    const authed = await requestPinAuth({
      title: 'Change Member Hierarchy',
      description: `Change organizational category of ${member.fullName} from ${getCategoryMeta(member.category).name} to ${getCategoryMeta(nextCat).name}. Account ID (${member.id}) and all records will be preserved.`,
      actionName: 'Category Change',
      requiredRole: 'Admin'
    });

    if (authed) {
      changeMemberCategory(member.id, nextCat);
      if (activeMember?.id === member.id) {
        setActiveMember(prev => prev ? { ...prev, category: nextCat, categoryApprovalStatus: 'Approved' } : null);
      }
    }
  };

  const handleToggleTreasurer = async (member: Member) => {
    if (!isAdmin) {
      alert('Only Committee Members / Admins can designate official Treasurers.');
      return;
    }
    const nextVal = !member.isTreasurer;
    const authed = await requestPinAuth({
      title: 'Designate Official Treasurer',
      description: `${nextVal ? 'Grant' : 'Revoke'} physical cash verification authority for ${member.fullName}. Note: Sabhasad does not automatically imply Treasurer.`,
      actionName: 'Treasurer Designation',
      requiredRole: 'Admin'
    });
    if (authed) {
      toggleTreasurerDesignation(member.id, nextVal);
      if (activeMember?.id === member.id) {
        setActiveMember(prev => prev ? { ...prev, isTreasurer: nextVal } : null);
      }
    }
  };

  const handleStatusChange = async (member: Member, nextStatus: MemberStatus) => {
    if (!isAdmin) {
      alert('Only Committee Members / Admins can deactivate or suspend members.');
      return;
    }
    const authed = await requestPinAuth({
      title: 'Change Member Status',
      description: `Set account status of ${member.fullName} to ${nextStatus}`,
      actionName: 'Status Change',
      requiredRole: 'Admin'
    });
    if (authed) {
      changeMemberStatus(member.id, nextStatus);
      if (activeMember?.id === member.id) {
        setActiveMember(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Hierarchy Sequence */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
              JAUS 2026 — Member Hierarchy & Selection
            </h1>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-indigo-200">
              {members.length} Members
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Official 4-tier organizational hierarchy: Committee Member → Sabhasad → Karyakarta → Yuva Karyakarta
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsCreatingMember(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md shadow-sm flex items-center justify-center gap-2 transition-colors self-start sm:self-auto uppercase tracking-wider"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member / Committee (Admin)</span>
          </button>
        )}
      </div>

      {/* 2. Visual Hierarchy Overview Cards (Exact Order) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {MEMBER_HIERARCHY.map((tier, idx) => (
          <div 
            key={tier.category}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-indigo-300 transition-colors"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Tier {tier.rank} of 4
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${tier.badgeClass}`}>
                  {tier.category}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>{tier.name}</span>
                {idx < 3 && <ArrowRight className="w-3 h-3 text-slate-300 hidden lg:inline ml-auto" />}
              </h3>
              <p className="text-[11px] text-slate-500 leading-snug">
                {tier.description}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-700">{tier.accessLevel}</span>
              {tier.intendedAge ? (
                <span className="text-amber-800 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Age: 18–35 (Guideline)
                </span>
              ) : (
                <span className="text-slate-400 font-mono">
                  {members.filter(m => m.category === tier.category).length} active
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Official Selection Flow Visualizer */}
      <div className="bg-slate-900 text-white rounded-xl p-3.5 sm:p-4 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Official Member Selection & Approval Flow</span>
                <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                  JAUS 2026 Protocol
                </span>
              </h4>
              <p className="text-[10px] text-slate-400">
                Self-Registration → Select Requested Category → Admin / Committee Member Review → Final Category Assignment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 font-mono self-start md:self-auto text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>If rejected: <strong>Rejected Higher Category → Karyakarta</strong> (Account preserved)</span>
          </div>
        </div>

        {/* Step pills */}
        <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-5 gap-2 text-[10px]">
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block font-bold uppercase text-[9px]">Step 1</span>
            <span className="font-semibold text-slate-200">Self-Registration</span>
            <span className="block text-slate-400 text-[9px] mt-0.5">Mobile OTP + profile details</span>
          </div>

          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block font-bold uppercase text-[9px]">Step 2</span>
            <span className="font-semibold text-slate-200">Select Requested Category</span>
            <span className="block text-slate-400 text-[9px] mt-0.5">CM / SB / KY / YK preference</span>
          </div>

          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <span className="text-amber-400 block font-bold uppercase text-[9px]">Step 3</span>
            <span className="font-semibold text-amber-200">Admin Review</span>
            <span className="block text-slate-400 text-[9px] mt-0.5">Admin / CM verifies applicant</span>
          </div>

          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block font-bold uppercase text-[9px]">Step 4: Decisions</span>
            <span className="font-semibold text-emerald-300">Approve</span> • <span className="font-semibold text-indigo-300">Change</span> • <span className="font-semibold text-rose-300">Reject</span>
            <span className="block text-slate-400 text-[9px] mt-0.5">3 administrative options</span>
          </div>

          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block font-bold uppercase text-[9px]">Step 5: Outcome</span>
            <span className="font-semibold text-slate-200">Final Member Category</span>
            <span className="block text-rose-300 text-[9px] mt-0.5">Rejection assigns Karyakarta</span>
          </div>
        </div>
      </div>

      {/* 3. Section 3 Review Queue: Pending Category Approvals (Admin/CM View) */}
      {isAdmin && pendingReviewMembers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-xl border-2 border-amber-300 shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-amber-950 text-sm uppercase tracking-wide flex items-center gap-2">
                  <span>Pending Category Approvals</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900 border border-amber-300">
                    {pendingReviewMembers.length} {pendingReviewMembers.length === 1 ? 'Applicant' : 'Applicants'}
                  </span>
                </h3>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Review self-registered applicants requesting organizational categories. Approve, change, or reject.
                </p>
              </div>
            </div>
            <div className="text-[10px] text-amber-900 bg-white/70 px-3 py-1.5 rounded-lg border border-amber-200 font-medium">
              ⚖️ Rule: Rejected higher categories assign the member to <strong>Karyakarta</strong> (account is never deleted).
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingReviewMembers.map(applicant => {
              const reqMeta = getCategoryMeta(applicant.requestedCategory || applicant.category);
              return (
                <div 
                  key={applicant.id}
                  className="bg-white rounded-lg border border-amber-200 p-4 shadow-2xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <span>{applicant.fullName}</span>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1 rounded">
                          {applicant.id}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {applicant.joinedDate}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-500">Requested Category:</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${reqMeta.badgeClass}`}>
                        {reqMeta.name} ({reqMeta.category})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • Current Provisional: <strong>{getCategoryMeta(applicant.category).name}</strong>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-center gap-3">
                      <span>📱 {applicant.mobile}</span>
                      <span>📍 {applicant.address}</span>
                    </div>
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal(applicant, 'approve')}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs transition-colors"
                      title="Approve as requested category"
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve ({applicant.requestedCategory || applicant.category})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal(applicant, 'change')}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs transition-colors"
                      title="Change category to a different tier"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Change Category</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal(applicant, 'reject')}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                      title="Reject higher category — Assigns member to Karyakarta (Account preserved)"
                    >
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span>Reject → Assign KY</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Filter & Search Controls */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name, Mobile, Member ID..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Category Filter (Strict Hierarchy Order) */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
            >
              <option value="all">All Categories (Hierarchy 1–4)</option>
              <option value="CM">1. Committee Member (CM - Admin)</option>
              <option value="SB">2. Sabhasad (SB)</option>
              <option value="KY">3. Karyakarta (KY)</option>
              <option value="YK">4. Yuva Karyakarta (YK)</option>
            </select>
          </div>

          {/* Category Approval Review Filter */}
          <div>
            <select
              value={selectedApprovalStatus}
              onChange={(e) => setSelectedApprovalStatus(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
            >
              <option value="all">All Category Statuses</option>
              <option value="Pending">Pending Review ({pendingReviewMembers.length})</option>
              <option value="Approved">Approved Categories</option>
              <option value="Rejected">Rejected Higher Category (Assigned KY)</option>
              <option value="Changed">Modified by Admin</option>
            </select>
          </div>

          {/* Account Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
            >
              <option value="all">All Account Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended (Blocked)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Members Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Member ID & Name</th>
                <th className="py-3 px-4">Organizational Category (Hierarchy)</th>
                <th className="py-3 px-4">Special Designation (Rule 6)</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4">Mobile & Address</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map(member => {
                const catMeta = getCategoryMeta(member.category);
                return (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0">
                          {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full object-cover rounded" />
                          ) : (
                            member.fullName.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            <span>{member.fullName}</span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">{member.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Organizational Category */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${catMeta.badgeClass}`}>
                          {catMeta.rank}. {catMeta.name} ({catMeta.category})
                        </span>
                        {member.requestedCategory && member.requestedCategory !== member.category && (
                          <div className="text-[9px] text-amber-700 font-medium">
                            Requested: {getCategoryMeta(member.requestedCategory).name}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Special Designation (Rule 6: Separate Concept) */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {member.isTreasurer && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] rounded font-bold uppercase border border-emerald-300">
                            <Award className="w-2.5 h-2.5 text-emerald-600" />
                            Official Treasurer
                          </span>
                        )}
                        <div className="text-[10px] text-slate-600 truncate max-w-[150px] font-medium">
                          {member.responsibilities[0] || (member.isTreasurer ? 'Treasurer Sign-off' : 'Volunteer')}
                        </div>
                      </div>
                    </td>

                    {/* Category Review Approval Status */}
                    <td className="py-3 px-4">
                      {member.categoryApprovalStatus === 'Pending' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                          Pending Review
                        </span>
                      ) : member.categoryApprovalStatus === 'Rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase bg-rose-50 text-rose-700 border border-rose-200" title="Requested higher category was rejected; assigned as Karyakarta">
                          Assigned KY
                        </span>
                      ) : member.categoryApprovalStatus === 'Changed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase bg-purple-50 text-purple-700 border border-purple-200">
                          Admin Modified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Approved
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-medium text-slate-800">{member.mobile}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{member.address}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                        member.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        member.status === 'Inactive' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {member.status === 'Active' && <CheckCircle2 className="w-3 h-3" />}
                        {member.status === 'Suspended' && <XCircle className="w-3 h-3" />}
                        <span>{member.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdmin && member.categoryApprovalStatus === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(member, 'approve')}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[10px] uppercase tracking-wider transition-colors shadow-2xs"
                            title="Review Category"
                          >
                            Review
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setActiveMember(member)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded text-[10px] border border-indigo-100 uppercase tracking-wider transition-colors"
                        >
                          Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Category Review & Decision Modal (Section 3) */}
      {reviewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider">
                    Member Selection & Category Review
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    JAUS 2026 Admin Category Approval Workflow
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewingMember(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReview} className="p-5 space-y-4 text-xs">
              {/* Applicant Card Summary */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{reviewingMember.fullName}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">{reviewingMember.id} • {reviewingMember.mobile}</p>
                  </div>
                  <span className="text-[10px] text-slate-500">Applied on {reviewingMember.joinedDate}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Requested Category:
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${getCategoryMeta(reviewingMember.requestedCategory || reviewingMember.category).badgeClass}`}>
                    {getCategoryMeta(reviewingMember.requestedCategory || reviewingMember.category).name} ({reviewingMember.requestedCategory || reviewingMember.category})
                  </span>
                </div>
              </div>

              {/* Review Options (Section 3: Approve / Change / Reject) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Select Administrative Decision *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReviewDecision('approve');
                      setReviewSelectedCategory(reviewingMember.requestedCategory || reviewingMember.category);
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                      reviewDecision === 'approve'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">1. Approve</span>
                      <Check className={`w-3.5 h-3.5 ${reviewDecision === 'approve' ? 'text-emerald-700' : 'text-slate-300'}`} />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">
                      Approve requested ({reviewingMember.requestedCategory || reviewingMember.category})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('change')}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                      reviewDecision === 'change'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">2. Change</span>
                      <Edit3 className={`w-3.5 h-3.5 ${reviewDecision === 'change' ? 'text-indigo-700' : 'text-slate-300'}`} />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">
                      Assign different category
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReviewDecision('reject');
                      setReviewSelectedCategory('KY');
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                      reviewDecision === 'reject'
                        ? 'bg-rose-50 border-rose-500 text-rose-950 ring-1 ring-rose-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">3. Reject</span>
                      <XCircle className={`w-3.5 h-3.5 ${reviewDecision === 'reject' ? 'text-rose-700' : 'text-slate-300'}`} />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">
                      Assign to Karyakarta
                    </span>
                  </button>
                </div>
              </div>

              {/* Conditional Controls based on Decision */}
              {reviewDecision === 'change' && (
                <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200 space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-900">
                    Select New Assigned Category (Exact Hierarchy 1–4) *
                  </label>
                  <select
                    value={reviewSelectedCategory}
                    onChange={(e) => setReviewSelectedCategory(e.target.value as MemberCategory)}
                    className="w-full p-2 bg-white border border-indigo-300 rounded-md text-xs font-bold outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="CM">1. Committee Member (CM - Admin Access)</option>
                    <option value="SB">2. Sabhasad (SB - Council Member)</option>
                    <option value="KY">3. Karyakarta (KY - Core Volunteer)</option>
                    <option value="YK">4. Yuva Karyakarta (YK - Youth Wing, Age 18–35)</option>
                  </select>
                </div>
              )}

              {reviewDecision === 'reject' && (
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Mandatory Rule (Section 3): Member Assigned as Karyakarta</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    When a requested higher category is rejected, the member is automatically categorized as <strong>Karyakarta (KY)</strong>. The member's account, identity, and access remain active and will <strong>not</strong> be deleted.
                  </p>
                </div>
              )}

              {/* Optional Review Remarks */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Admin Review Remarks / Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Approved based on volunteer track record; or reassigned to youth wing..."
                  rows={2}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md text-xs outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Requires 4-Digit Security PIN</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setReviewingMember(null)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Lock className="w-3 h-3 text-indigo-200" />
                    <span>Confirm Decision</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Member Profile Drawer / Modal (Sections 5 & 6) */}
      {activeMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-xs">
                  {activeMember.avatarUrl ? (
                    <img src={activeMember.avatarUrl} alt={activeMember.fullName} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    activeMember.fullName.charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base uppercase tracking-tight">{activeMember.fullName}</h3>
                    <span className="px-1.5 py-0.5 bg-indigo-500/30 text-indigo-300 text-[10px] font-mono rounded font-bold">
                      {activeMember.id}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">
                    {getCategoryMeta(activeMember.category).name} • {activeMember.responsibilities.join(' • ')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveMember(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* If member is pending review, show banner */}
              {isAdmin && activeMember.categoryApprovalStatus === 'Pending' && (
                <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Pending Category Review</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      Requested: {getCategoryMeta(activeMember.requestedCategory || activeMember.category).name}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    This self-registered member is operating provisionally as <strong>{getCategoryMeta(activeMember.category).name}</strong>. Please review their requested category.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal(activeMember, 'approve')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold uppercase tracking-wider"
                    >
                      Approve Requested
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal(activeMember, 'change')}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold uppercase tracking-wider"
                    >
                      Change Category
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal(activeMember, 'reject')}
                      className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded text-[10px] font-bold uppercase tracking-wider border border-rose-300"
                    >
                      Reject → Assign KY
                    </button>
                  </div>
                </div>
              )}

              {/* Status Banner */}
              {activeMember.status !== 'Active' && (
                <div className="p-3 bg-rose-50 border-l-4 border-l-rose-500 border border-slate-200 rounded-lg text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Account {activeMember.status}:</strong> This user cannot log in and active sessions have been terminated.
                  </span>
                </div>
              )}

              {/* Category & Hierarchy Badge Strip */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Current Organizational Category</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`px-2 py-0.5 rounded font-bold text-xs uppercase border ${getCategoryMeta(activeMember.category).badgeClass}`}>
                      Tier {getCategoryMeta(activeMember.category).rank}: {getCategoryMeta(activeMember.category).name} ({activeMember.category})
                    </span>
                    {activeMember.categoryApprovalStatus && (
                      <span className="text-[10px] font-medium text-slate-500">
                        ({activeMember.categoryApprovalStatus})
                      </span>
                    )}
                  </div>
                </div>
                {activeMember.reviewedBy && (
                  <div className="text-right text-[10px] text-slate-500">
                    <span>Reviewed by: <strong className="text-slate-700">{activeMember.reviewedBy}</strong></span>
                    <span className="block text-[9px] text-slate-400">{activeMember.reviewedAt}</span>
                  </div>
                )}
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Mobile</span>
                  <span className="font-mono font-bold text-slate-800">{activeMember.mobile}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Date of Birth</span>
                  <span className="font-medium text-slate-800">{activeMember.dob || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Gender</span>
                  <span className="font-medium text-slate-800">{activeMember.gender}</span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Residential Address</span>
                  <span className="font-medium text-slate-800">{activeMember.address}</span>
                </div>
              </div>

              {/* Section 6: Special Designations vs Category (Rule 6) */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-amber-950 text-xs uppercase tracking-wider">
                      Special Designations (Distinct from Category)
                    </span>
                  </div>
                  <span className="text-[9px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-mono font-bold">
                    Rule 6 Compliance
                  </span>
                </div>

                <p className="text-[11px] text-amber-900 leading-snug">
                  <strong>Important Rule:</strong> Organizational category (CM / SB / KY / YK) and special designations are strictly separate concepts. For example, <em>Sabhasad does not automatically mean Treasurer</em>.
                </p>

                <div className="bg-white p-3 rounded-md border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Official Treasurer Designation</span>
                    <span className="text-[10px] text-slate-500">
                      Authorizes physical cash collection approvals and treasury sign-off.
                    </span>
                  </div>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => handleToggleTreasurer(activeMember)}
                      className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                        activeMember.isTreasurer
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {activeMember.isTreasurer ? 'Designated Treasurer (Active)' : 'Grant Treasurer Role'}
                    </button>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      activeMember.isTreasurer ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {activeMember.isTreasurer ? 'Treasurer' : 'Not Designated'}
                    </span>
                  )}
                </div>
              </div>

              {/* Section 5: Category Changes After Registration (Admin Only) */}
              {isAdmin && (
                <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                        Category Modification (Section 5)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Keeps same account ID ({activeMember.id}), same identity, and all history intact.
                      </span>
                    </div>
                    <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider">Requires PIN</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Change Category (Exact Hierarchy 1–4)
                      </label>
                      <select
                        value={activeMember.category}
                        onChange={(e) => handleCategoryChange(activeMember, e.target.value as MemberCategory)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs font-semibold outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="CM">1. Committee Member (CM - Admin Access)</option>
                        <option value="SB">2. Sabhasad (SB - Council Member)</option>
                        <option value="KY">3. Karyakarta (KY - Core Volunteer)</option>
                        <option value="YK">4. Yuva Karyakarta (YK - Youth Wing, Age 18–35)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Account Access Status
                      </label>
                      <select
                        value={activeMember.status}
                        onChange={(e) => handleStatusChange(activeMember, e.target.value as MemberStatus)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs font-semibold outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Active">Active (Permit Login)</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended (Block Login)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity History */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Activity & Audit Trail</span>
                </h4>
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {activeMember.activityHistory && activeMember.activityHistory.length > 0 ? (
                    activeMember.activityHistory.map((act) => (
                      <div key={act.id} className="p-2.5 rounded-md border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-2 border-l-2 border-l-slate-300">
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{act.action}</div>
                          <div className="text-[11px] text-slate-500">{act.details}</div>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono shrink-0 uppercase">{act.timestamp}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-center py-4 italic text-xs">No activity recorded yet</div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveMember(null)}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Admin Direct Member Creation Modal (Section 4) */}
      {isCreatingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  Direct Appointment / Member Provisioning (Admin)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingMember(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="p-5 space-y-3.5 text-xs">
              <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-950 text-[11px] leading-snug">
                <strong>Section 4 Compliance:</strong> Committee Member accounts are created directly by an existing Admin/Committee Member and do not require the normal self-registration approval process. They are pre-approved immediately.
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Anand Varma"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    placeholder="98200 12345"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Organizational Category (Hierarchy 1–4) *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MemberCategory)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="CM">1. Committee Member (CM - Admin Level)</option>
                    <option value="SB">2. Sabhasad (SB - Council Member)</option>
                    <option value="KY">3. Karyakarta (KY - Core Volunteer)</option>
                    <option value="YK">4. Yuva Karyakarta (YK - Youth Wing, Age 18–35)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Assigned Department</label>
                  <select
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Special Designation / Role</label>
                  <input
                    type="text"
                    value={newResponsibility}
                    onChange={(e) => setNewResponsibility(e.target.value)}
                    placeholder="e.g. Joint Secretary / Event Lead"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Residential Address *</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Borivali West, Mumbai"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Default 4-Digit Security PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden font-mono tracking-widest text-center focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="official@jaus2026.org"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingMember(false)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authorize & Create Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
