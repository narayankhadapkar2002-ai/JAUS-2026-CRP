import React, { useState } from 'react';
import { 
  Home,
  User, 
  Users, 
  HandHeart, 
  CalendarDays, 
  Send, 
  Settings, 
  ChevronRight, 
  ChevronDown,
  Building,
  CreditCard,
  Clock,
  FileText,
  Layers,
  BarChart3,
  Calendar,
  Radio,
  History,
  Shield,
  Sliders,
  CheckCircle2,
  FolderKanban,
  Zap,
  Building2,
  ShieldCheck,
  Megaphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

interface NavSection {
  id: string;
  label: string;
  icon: any;
  badge?: number | string;
  badgeColor?: string;
  subItems?: { id: string; label: string; badge?: number | string; badgeColor?: string }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isMobileDrawer = false,
  onCloseMobile
}) => {
  const { currentUser, donations, pendingPayments, tasks } = useApp();

  const isAdmin = currentUser?.category === 'CM';
  const isTreasurerOrAdmin = currentUser?.isTreasurer || isAdmin;

  const pendingCashCount = isTreasurerOrAdmin 
    ? donations.filter(d => d.paymentMethod === 'Cash' && d.financialStatus === 'Pending').length 
    : 0;

  const pendingPaymentsCount = pendingPayments.length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    teams: true,
    vargani: true,
    events: true,
    broadcast: false,
    settings: false
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const handleItemClick = (viewId: string) => {
    onNavigate(viewId);
    if (isMobileDrawer && onCloseMobile) {
      onCloseMobile();
    }
  };

  // 5 PRIMARY TOP-LEVEL SECTIONS (HOME, USER INFORMATION, TEAMS/MEMBERS, VARGANI, EVENTS)
  const primaryNavSections: { key: string; section: NavSection }[] = [
    // 1. Home
    {
      key: 'home',
      section: {
        id: 'dashboard',
        label: 'Home',
        icon: Home
      }
    },
    // 2. User Information
    {
      key: 'userInfo',
      section: {
        id: 'user-info',
        label: 'User Information',
        icon: User
      }
    },
    // 3. Teams / Members
    {
      key: 'teams',
      section: {
        id: 'org-members',
        label: 'Teams / Members',
        icon: Users,
        subItems: [
          { id: 'org-members', label: 'Members Directory' },
          { id: 'org-teams', label: 'Teams & Departments' },
          { 
            id: 'org-tasks', 
            label: 'Tasks & Duties', 
            badge: pendingTasksCount || undefined 
          },
          ...(isAdmin ? [{ id: 'org-reports', label: 'Member Reports' }] : [])
        ]
      }
    },
    // 4. Vargani
    {
      key: 'vargani',
      section: {
        id: 'vargani-hub',
        label: 'Vargani',
        icon: HandHeart,
        badge: pendingCashCount > 0 ? `${pendingCashCount} Cash` : undefined,
        badgeColor: 'bg-rose-500/30 text-rose-300 border-rose-500/40',
        subItems: [
          { id: 'vargani-hub', label: '🏠 Central Hub' },
          { id: 'vargani-collection', label: '⚡ Fast Collection' },
          { id: 'vargani-campaigns', label: '🏢 Building-Based Campaigns' },
          { id: 'vargani-pending', label: 'Pending Payments', badge: pendingPaymentsCount || undefined },
          { id: 'vargani-records', label: 'Donation & Audit Ledger' },
          ...(isTreasurerOrAdmin ? [{ 
            id: 'vargani-approvals', 
            label: 'Treasurer Approvals', 
            badge: pendingCashCount || undefined,
            badgeColor: 'bg-rose-500 text-white' 
          }] : []),
          { id: 'vargani-summary', label: 'Reports & Reconciliation' }
        ]
      }
    },
    // 5. Events
    {
      key: 'events',
      section: {
        id: 'events-schedule',
        label: 'Events',
        icon: CalendarDays,
        subItems: [
          { id: 'events-schedule', label: 'Navratri Schedule (9 Days)' },
          { id: 'events-list', label: 'All Programs & Events' },
          { id: 'events-broadcast', label: 'Event Member Broadcast' }
        ]
      }
    }
  ];

  // Secondary administrative tools (Admin only)
  const adminNavSections: { key: string; section: NavSection }[] = isAdmin ? [
    {
      key: 'broadcast',
      section: {
        id: 'broadcast-create',
        label: 'Public Broadcast',
        icon: Megaphone,
        subItems: [
          { id: 'broadcast-create', label: 'Create WhatsApp Broadcast' },
          { id: 'broadcast-scheduled', label: 'Scheduled Broadcasts' },
          { id: 'broadcast-templates', label: 'Broadcast Templates' },
          { id: 'broadcast-history', label: 'Delivery History' }
        ]
      }
    },
    {
      key: 'settings',
      section: {
        id: 'settings-org',
        label: 'Settings',
        icon: Settings,
        subItems: [
          { id: 'settings-org', label: 'Samiti Profile' },
          { id: 'settings-treasurers', label: 'Treasurer Permissions' },
          { id: 'settings-receipts', label: 'Receipt Templates' },
          { id: 'settings-security', label: 'Security & Audit Logs' }
        ]
      }
    }
  ] : [];

  return (
    <aside className={`w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 select-none border-r border-slate-800 h-full overflow-hidden ${
      isMobileDrawer ? 'w-full' : 'hidden lg:flex'
    }`}>
      {/* Current User Quick Identity Profile Header - Fixed at top */}
      <div 
        onClick={() => handleItemClick('user-info')}
        className="p-4 border-b border-slate-800 flex items-center gap-3 cursor-pointer hover:bg-slate-800/60 transition-colors group shrink-0 bg-slate-900 sticky top-0 z-10"
        title="View My Information"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-sm shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
          {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
          ) : (
            currentUser?.fullName?.charAt(0) || 'U'
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
            {currentUser?.fullName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-slate-800 text-amber-400 rounded">
              {currentUser?.category}
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              {currentUser?.responsibilities[0] || (currentUser?.category === 'CM' ? 'Admin Access' : 'Volunteer')}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
      </div>

      {/* Main 5 Navigation Sections List - Scrolls separately from main */}
      <nav className="flex-1 overflow-y-auto overscroll-contain sidebar-scroll p-3 space-y-1 text-xs">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Navigation
        </div>

        {primaryNavSections.map(({ key, section }) => {
          const Icon = section.icon;
          const hasSub = section.subItems && section.subItems.length > 0;
          const isSectionOpen = openSections[key];
          
          const isDirectActive = currentView === section.id || 
            (key === 'home' && (currentView === 'home' || currentView === 'dashboard')) ||
            (key === 'userInfo' && (currentView === 'user-info' || currentView === 'profile'));
          
          const isSubActive = section.subItems?.some(s => s.id === currentView) ||
            (key === 'teams' && currentView.startsWith('org')) ||
            (key === 'vargani' && (currentView.startsWith('vargani') || currentView.startsWith('donation'))) ||
            (key === 'events' && currentView.startsWith('events'));

          return (
            <div key={key} className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  if (hasSub) {
                    toggleSection(key);
                  } else {
                    handleItemClick(section.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
                  isDirectActive || isSubActive
                    ? 'bg-amber-600/20 text-amber-300 font-semibold border border-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isDirectActive || isSubActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold">{section.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {section.badge && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      section.badgeColor || 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                    }`}>
                      {section.badge}
                    </span>
                  )}
                  {hasSub && (
                    isSectionOpen 
                      ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> 
                      : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
              </button>

              {/* Sub-items drawer */}
              {hasSub && isSectionOpen && (
                <div className="ml-4 pl-3 border-l border-slate-800 space-y-0.5 py-1">
                  {section.subItems!.map(sub => {
                    const isCurrent = currentView === sub.id || (sub.id === 'vargani-campaigns' && (currentView === 'vargani-setup' || currentView === 'vargani-units'));
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleItemClick(sub.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="truncate">{sub.label}</span>
                        {sub.badge !== undefined && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            sub.badgeColor || (isCurrent ? 'bg-slate-900 text-amber-400' : 'bg-slate-800 text-amber-400')
                          }`}>
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Secondary Admin Utilities */}
        {adminNavSections.length > 0 && (
          <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Admin Utilities
            </div>
            {adminNavSections.map(({ key, section }) => {
              const Icon = section.icon;
              const hasSub = section.subItems && section.subItems.length > 0;
              const isSectionOpen = openSections[key];
              const isDirectActive = currentView === section.id;
              const isSubActive = section.subItems?.some(s => s.id === currentView);

              return (
                <div key={key} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (hasSub) {
                        toggleSection(key);
                      } else {
                        handleItemClick(section.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all ${
                      isDirectActive || isSubActive
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{section.label}</span>
                    </div>

                    {hasSub && (
                      isSectionOpen 
                        ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> 
                        : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>

                  {hasSub && isSectionOpen && (
                    <div className="ml-4 pl-3 border-l border-slate-800 space-y-0.5 py-1">
                      {section.subItems!.map(sub => {
                        const isCurrent = currentView === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleItemClick(sub.id)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                              isCurrent
                                ? 'bg-slate-700 text-white font-bold'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                          >
                            <span className="truncate">{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer System Status & Central Sync - Fixed at bottom */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0 bg-slate-900 sticky bottom-0 z-10 mt-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cross-Device Synced</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">JAUS 2026 ERP</span>
      </div>
    </aside>
  );
};
