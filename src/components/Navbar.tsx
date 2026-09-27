import React, { useState } from 'react';
import { 
  Users, 
  Menu, 
  X, 
  ChevronDown, 
  Lock, 
  LogOut, 
  UserCheck, 
  Bell, 
  Coins, 
  Flame,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onToggleMobileMenu, 
  isMobileMenuOpen,
  onNavigate,
  currentView
}) => {
  const { currentUser, members, switchUser, logout, donations, settings } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Count pending cash collections needing Treasurer approval
  const pendingCashCount = donations.filter(d => d.paymentMethod === 'Cash' && d.financialStatus === 'Pending').length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-700 to-orange-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-slate-900 tracking-tight text-lg sm:text-xl">
                  JAUS 2026
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                  Navratri Mandal ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[180px] sm:max-w-none">
                Jai Ambe Utsav Samiti • Borivali
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls: Cash Alert & User Switcher */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-xs shrink-0">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
                ) : (
                  currentUser?.fullName?.charAt(0) || 'U'
                )}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <span>{currentUser?.fullName || 'Guest'}</span>
                  {currentUser?.isTreasurer && (
                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded font-medium">
                      Treasurer
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {currentUser?.id} ({currentUser?.category})
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Switcher Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Active Persona (Demo)
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Test role-based access for volunteers, treasurers & admins
                  </p>
                </div>

                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {members.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      disabled={m.status !== 'Active'}
                      onClick={() => {
                        switchUser(m.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left flex items-center gap-2.5 transition-colors ${
                        m.id === currentUser?.id
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : m.status !== 'Active'
                          ? 'opacity-40 cursor-not-allowed bg-slate-50'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt={m.fullName} className="w-full h-full object-cover" />
                        ) : (
                          m.fullName.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                          <span>{m.fullName}</span>
                          {m.id === currentUser?.id && <UserCheck className="w-3 h-3 text-amber-600" />}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span className="font-medium">{m.category}</span>
                          {m.isTreasurer && <span className="text-emerald-700 font-semibold">• Treasurer</span>}
                          <span>• {m.responsibilities[0] || m.status}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('settings-security');
                    }}
                    className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>PIN / Security</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
