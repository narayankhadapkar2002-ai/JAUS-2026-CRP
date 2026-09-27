import React from 'react';
import { 
  User, 
  Users, 
  HandHeart, 
  CalendarDays, 
  Home, 
  LayoutDashboard 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenMenu?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const { currentUser, donations, tasks } = useApp();

  const isTreasurerOrAdmin = currentUser?.isTreasurer || currentUser?.category === 'CM';
  const pendingCashCount = isTreasurerOrAdmin 
    ? donations.filter(d => d.paymentMethod === 'Cash' && d.financialStatus === 'Pending').length 
    : 0;

  const pendingTasksCount = tasks.filter(t => 
    t.status !== 'Completed' && 
    ((t.assignedToType === 'member' && t.assignedToId === currentUser?.id) ||
     (t.assignedToType === 'team' && currentUser?.assignedTeams?.includes(t.assignedToId)))
  ).length;

  // Active checks
  const isUserInfoActive = currentView === 'user-info' || currentView === 'profile';
  const isTeamsMembersActive = currentView.startsWith('org') || currentView === 'teams' || currentView === 'teams-members';
  const isVarganiActive = currentView.startsWith('vargani') || currentView.startsWith('donation');
  const isEventsActive = currentView.startsWith('events');
  const isHomeActive = currentView === 'dashboard' || currentView === 'home';

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg select-none pb-safe"
    >
      {/* 1. User Information */}
      <button
        type="button"
        onClick={() => onNavigate('user-info')}
        className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
          isUserInfoActive ? 'text-amber-700' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
          isUserInfoActive 
            ? 'ring-2 ring-amber-600 ring-offset-1 bg-amber-100 text-amber-900' 
            : 'bg-slate-100 text-slate-600'
        }`}>
          {currentUser?.avatarUrl ? (
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.fullName} 
              className="w-full h-full rounded-full object-cover" 
            />
          ) : (
            <User className="w-4 h-4" />
          )}
        </div>
        <span className={`text-[10px] tracking-tight mt-0.5 ${
          isUserInfoActive ? 'font-bold text-amber-900' : 'font-medium'
        }`}>
          User Info
        </span>
      </button>

      {/* 2. Teams / Members */}
      <button
        type="button"
        onClick={() => onNavigate('org-members')}
        className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
          isTeamsMembersActive ? 'text-amber-700' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className="relative">
          <Users className={`w-5 h-5 transition-transform ${isTeamsMembersActive ? 'scale-110 text-amber-700' : ''}`} />
          {pendingTasksCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-bold bg-amber-600 text-white min-w-4 text-center">
              {pendingTasksCount}
            </span>
          )}
        </div>
        <span className={`text-[10px] tracking-tight mt-1 ${
          isTeamsMembersActive ? 'font-bold text-amber-900' : 'font-medium'
        }`}>
          Teams/Members
        </span>
      </button>

      {/* 3. Vargani (Centerpiece) */}
      <button
        type="button"
        onClick={() => onNavigate('vargani-hub')}
        className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
          isVarganiActive ? 'text-amber-700' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className="relative">
          <div className={`p-1 rounded-lg transition-all ${
            isVarganiActive ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-400' : ''
          }`}>
            <HandHeart className="w-5 h-5" />
          </div>
          {pendingCashCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-bold bg-rose-600 text-white animate-pulse min-w-4 text-center">
              {pendingCashCount}
            </span>
          )}
        </div>
        <span className={`text-[10px] tracking-tight mt-0.5 ${
          isVarganiActive ? 'font-bold text-amber-900' : 'font-medium'
        }`}>
          Vargani
        </span>
      </button>

      {/* 4. Events */}
      <button
        type="button"
        onClick={() => onNavigate('events-schedule')}
        className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
          isEventsActive ? 'text-amber-700' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className="relative">
          <CalendarDays className={`w-5 h-5 transition-transform ${isEventsActive ? 'scale-110 text-amber-700' : ''}`} />
        </div>
        <span className={`text-[10px] tracking-tight mt-1 ${
          isEventsActive ? 'font-bold text-amber-900' : 'font-medium'
        }`}>
          Events
        </span>
      </button>

      {/* 5. Home (Dashboard) */}
      <button
        type="button"
        onClick={() => onNavigate('dashboard')}
        className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
          isHomeActive ? 'text-amber-700' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className="relative">
          <Home className={`w-5 h-5 transition-transform ${isHomeActive ? 'scale-110 text-amber-700' : ''}`} />
        </div>
        <span className={`text-[10px] tracking-tight mt-1 ${
          isHomeActive ? 'font-bold text-amber-900' : 'font-medium'
        }`}>
          Home
        </span>
      </button>
    </nav>
  );
};
