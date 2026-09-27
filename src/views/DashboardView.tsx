import React from 'react';
import { 
  HandHeart, 
  Coins, 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Send, 
  Zap, 
  Building, 
  ShieldAlert,
  MessageSquare,
  FileCheck2,
  CalendarDays,
  CheckSquare,
  QrCode,
  Sparkles,
  PhoneCall,
  Megaphone,
  UserCheck,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    currentUser, 
    donations, 
    pendingPayments, 
    members, 
    events, 
    campaigns, 
    tasks,
    teams,
    setActiveReceipt,
    setActiveWhatsApp
  } = useApp();

  const userCategory = currentUser?.category || 'SB';
  const isAdmin = userCategory === 'CM';
  const isVolunteer = userCategory === 'KY' || userCategory === 'YK';
  const isSabhasad = userCategory === 'SB';

  // Overall metrics (Admin/CM)
  const totalCollected = donations
    .filter(d => d.financialStatus !== 'Cancelled')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const pendingCashTransactions = donations.filter(
    d => d.paymentMethod === 'Cash' && d.financialStatus === 'Pending'
  );
  const pendingCashTotal = pendingCashTransactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalDonorsCount = donations.length;
  const pendingPaymentsCount = pendingPayments.length;
  const pendingPaymentsAmount = pendingPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Volunteer specific data
  const myAssignedTasks = tasks.filter(t => 
    (t.assignedToType === 'member' && t.assignedToId === currentUser?.id) ||
    (t.assignedToType === 'team' && currentUser?.assignedTeams?.includes(t.assignedToId))
  );
  const myCollections = donations.filter(d => d.collectorId === currentUser?.id);
  const myTotalCollected = myCollections.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Sabhasad specific data
  const myReceipts = donations.filter(d => 
    d.donorMobile === currentUser?.mobile || 
    d.donorName.toLowerCase().includes(currentUser?.fullName?.toLowerCase() || '')
  );
  const myTotalDonated = myReceipts.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Upcoming published events
  const upcomingEvents = events.filter(e => e.status === 'Published').slice(0, 3);
  const recentDonations = [...donations].slice(0, 5);

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'CM': return 'Committee Member (Admin)';
      case 'SB': return 'Sabhasad (Patron Devotee)';
      case 'KY': return 'Karyakarta (Field Volunteer)';
      case 'YK': return 'Yuva Karyakarta (Youth Wing)';
      default: return 'Active Member';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. WELCOME BANNER (Required: Member name + Member ID + Category) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30 mb-2.5">
            <span>JAUS 2026 Home</span>
            <span>•</span>
            <span>Navratri Mahotsav Season 39</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Welcome, {currentUser?.fullName}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-300">
                <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-amber-300 font-bold">
                  Member ID: {currentUser?.id}
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 bg-amber-600/30 text-amber-200 rounded font-bold">
                  {getCategoryTitle(userCategory)}
                </span>
                {currentUser?.responsibilities[0] && (
                  <>
                    <span>•</span>
                    <span className="text-slate-300">⭐ {currentUser?.responsibilities[0]}</span>
                  </>
                )}
                {currentUser?.isTreasurer && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold border border-emerald-500/30">
                    Treasurer Authorization
                  </span>
                )}
              </div>
            </div>

            {/* Cross-Platform Device Sync Status Badge */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-xs text-slate-200 self-start md:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Unified Data Synced (PC / Android / iOS)</span>
            </div>
          </div>

          {/* 2. QUICK ACCESS BUTTONS (Required: Vargani, Events, Teams/Members) */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Quick Access Modules
            </span>
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('vargani-collection')}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-2"
              >
                <HandHeart className="w-4 h-4 text-amber-200" />
                <span>Vargani</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('events-schedule')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
              >
                <CalendarDays className="w-4 h-4 text-amber-400" />
                <span>Events</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('org-members')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Teams & Members</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('user-info')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>My Information</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. IMPORTANT INFORMATION & CURRENT NOTICES */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-900 rounded-xl shrink-0 mt-0.5 sm:mt-0">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                Navratri 2026 Season Schedule & Vargani Guidelines Published
              </span>
              <span className="px-2 py-0.2 bg-amber-200 text-amber-900 rounded text-[10px] font-bold">
                Mandal Notice
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Daily Maha Aarti will commence promptly at 7:30 PM. All Building Vargani collections are tracked with instantaneous WhatsApp receipts.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('events-schedule')}
          className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition-colors shrink-0 flex items-center gap-1"
        >
          <span>View 9-Day Calendar</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. ROLE-BASED OVERVIEW SECTIONS */}

      {/* A) COMMITTEE MEMBER / ADMIN VIEW */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Treasurer Cash Approval Banner (if cash pending) */}
          {pendingCashTransactions.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 border-l-4 border-l-rose-500 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 bg-rose-100 text-rose-800 rounded-xl shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {pendingCashTransactions.length} Cash Donation{pendingCashTransactions.length > 1 ? 's' : ''} Awaiting Treasurer Verification
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    ₹{pendingCashTotal.toLocaleString('en-IN')} physical cash collected by volunteers waiting for physical sign-off & PIN confirmation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('vargani-approvals')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
              >
                <span>Verify Cash Queue</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Admin KPI Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs border-t-3 border-t-amber-600">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Total Vargani Collected</span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
                ₹{totalCollected.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                From {totalDonorsCount} official receipts
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs border-t-3 border-t-amber-500">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Pending Cash In-Hand</span>
                <Coins className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-amber-900 font-mono">
                ₹{pendingCashTotal.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {pendingCashTransactions.length} receipts awaiting sign-off
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs border-t-3 border-t-slate-400">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Pending Commitments</span>
                <Clock className="w-4 h-4 text-slate-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
                ₹{pendingPaymentsAmount.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {pendingPaymentsCount} donors will pay later
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs border-t-3 border-t-emerald-600">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Active Volunteers & Members</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
                {members.filter(m => m.status === 'Active').length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                CM, Sabhasad, Karyakarta, Youth
              </p>
            </div>
          </div>
        </div>
      )}

      {/* B) KARYAKARTA & YUVA KARYAKARTA (VOLUNTEER) VIEW */}
      {isVolunteer && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs border-t-3 border-t-amber-600">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>My Total Collections</span>
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
                ₹{myTotalCollected.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {myCollections.length} receipts issued by you
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs border-t-3 border-t-indigo-600">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>My Assigned Duties</span>
                <CheckSquare className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
                {myAssignedTasks.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {myAssignedTasks.filter(t => t.status !== 'Completed').length} tasks pending action
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs border-t-3 border-t-emerald-600">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>My Teams</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-base font-bold text-slate-900 truncate">
                {currentUser?.assignedTeams && currentUser.assignedTeams.length > 0 ? (
                  teams.find(t => t.id === currentUser.assignedTeams[0])?.name || 'Assigned Wing'
                ) : 'General Volunteer'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Ready for Navratri 2026 operations
              </p>
            </div>
          </div>

          {/* Volunteer Assigned Tasks List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">My Active Tasks & Duties</h3>
                <p className="text-xs text-slate-500">Your assigned responsibility checklist for the festival</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('org-tasks')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
              >
                <span>All Tasks</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {myAssignedTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No active tasks currently assigned specifically to you. Check with your Team Leader!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {myAssignedTasks.map(t => (
                  <div key={t.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <h5 className="font-bold text-slate-800">{t.title}</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">{t.description}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">Due: {t.dueDate}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      t.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* C) SABHASAD (GENERAL MEMBER / RESIDENT) VIEW */}
      {isSabhasad && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs border-t-3 border-t-amber-600">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>My Vargani Contribution</span>
                <HandHeart className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
                ₹{myTotalDonated.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {myReceipts.length} official receipts issued
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs border-t-3 border-t-indigo-600">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>My Premises</span>
                <Building className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900 truncate">
                {currentUser?.address || 'Borivali Premises'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Registered Society Resident
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs border-t-3 border-t-emerald-600">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Samiti Delegate Pass</span>
                <QrCode className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-sm font-bold text-emerald-800">
                Verified Sabhasad
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Valid for Navratri 2026 Garba & Aarti
              </p>
            </div>
          </div>

          {/* Sabhasad Receipts Stream */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">My Official Donation Receipts</h3>
                <p className="text-xs text-slate-500">View or download authentic Jai Ambe Utsav Samiti receipts</p>
              </div>
            </div>

            {myReceipts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No receipts recorded under your mobile number yet. Volunteer will issue receipt during building collection!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {myReceipts.map(r => (
                  <div key={r.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <h5 className="font-bold text-slate-800">{r.receiptNumber}</h5>
                      <p className="text-[11px] text-slate-500">{r.campaignName} • {r.collectedAt}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900">₹{r.amount.toLocaleString('en-IN')}</span>
                      <button
                        type="button"
                        onClick={() => setActiveReceipt(r)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded"
                        title="View Receipt"
                      >
                        <FileCheck2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. LIVE RECENT VARGANI FEED (For Admins & Volunteers) & UPCOMING EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Vargani Collections Feed (If authorized) */}
        {!isSabhasad && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Live Vargani Collection Feed</h3>
                <p className="text-[11px] text-slate-500">Recent collections recorded across buildings and patrons</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('vargani-records')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
              >
                <span>View Ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {recentDonations.map(donation => (
                <div key={donation.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 border ${
                      donation.paymentMethod === 'Cash' 
                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    }`}>
                      {donation.paymentMethod === 'Cash' ? 'CASH' : 'UPI'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 truncate">
                          {donation.donorName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {donation.receiptNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {donation.unitDetails || donation.campaignName} • By {donation.collectorName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2.5">
                    <div>
                      <div className="font-mono font-bold text-slate-900">
                        ₹{(donation.amount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="mt-0.5">
                        {donation.financialStatus === 'Approved' || donation.financialStatus === 'Completed' ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            {donation.financialStatus}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Pending Approval
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveReceipt(donation)}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 rounded"
                      title="View Receipt"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Col: Navratri 2026 Schedule Highlights */}
        <div className={`${isSabhasad ? 'lg:col-span-3' : 'lg:col-span-1'} bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col`}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Upcoming Navratri Programs</h3>
              <p className="text-[11px] text-slate-500">Maha Aarti & Garba sessions</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('events-schedule')}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
            >
              <span>Schedule</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3.5 space-y-2.5 flex-1">
            {upcomingEvents.map(evt => (
              <div key={evt.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-800 mb-1">
                  <span>📅 Day {evt.dayNumber} • {evt.date}</span>
                  <span className="font-mono text-slate-500">{evt.startTime} - {evt.endTime}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{evt.name}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{evt.venue}</p>
                {evt.chiefGuest && (
                  <div className="mt-1 text-[10px] text-slate-700 font-medium bg-slate-200/60 px-1.5 py-0.2 rounded inline-block">
                    Guest: {evt.chiefGuest}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => onNavigate('events-schedule')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Open Full Navratri Itinerary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
