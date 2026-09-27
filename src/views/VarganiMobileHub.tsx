import React from 'react';
import { 
  Zap, 
  Building2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight, 
  Smartphone, 
  Coins, 
  TrendingUp,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface VarganiMobileHubProps {
  onNavigate: (tabId: string) => void;
}

export const VarganiMobileHub: React.FC<VarganiMobileHubProps> = ({ onNavigate }) => {
  const { 
    currentUser, 
    donations, 
    pendingPayments, 
    campaigns, 
    setActiveReceipt 
  } = useApp();

  const isTreasurerOrAdmin = currentUser?.isTreasurer || currentUser?.category === 'CM';
  const pendingCashCount = donations.filter(d => d.paymentMethod === 'Cash' && d.financialStatus === 'Pending').length;
  const pendingPaymentsCount = pendingPayments.length;

  const totalCollected = donations.reduce((acc, d) => acc + (d.amount || 0), 0);
  const cashCollected = donations.filter(d => d.paymentMethod === 'Cash').reduce((acc, d) => acc + (d.amount || 0), 0);
  const upiCollected = donations.filter(d => d.paymentMethod !== 'Cash').reduce((acc, d) => acc + (d.amount || 0), 0);
  const totalCommitted = pendingPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // Recent 3 collections
  const recentDonations = donations.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans">
      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* ========================================================================= */}
        {/* 1. THE FIRST BIG: Fast Vargani Collection (Hero Collection Desk)          */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span>Primary Collection Counter</span>
            </h2>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Instant Slip & WhatsApp
            </span>
          </div>

          {/* Big Hero Card */}
          <div 
            onClick={() => onNavigate('vargani-collection')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 text-white p-5 sm:p-6 shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer border border-amber-500/40"
          >
            {/* Subtle decorative background circles */}
            <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-orange-950/20 blur-lg pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between min-h-[150px]">
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white drop-shadow-xs">
                  Fast Vargani Collection
                </h3>
              </div>

              <div className="mt-5 pt-3.5 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-200 block">Total Collected</span>
                    <span className="text-base sm:text-lg font-black font-mono text-white">
                      ₹{totalCollected.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="h-7 w-px bg-white/20" />
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-200 block">Receipts</span>
                    <span className="text-base sm:text-lg font-black font-mono text-white">
                      {donations.length}
                    </span>
                  </div>
                  <div className="h-7 w-px bg-white/20 hidden sm:block" />
                  <div className="hidden sm:block">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-200 block">Mode</span>
                    <span className="text-xs font-bold text-white">
                      Cash & UPI / QR
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="bg-white text-amber-950 group-hover:bg-amber-50 px-4 py-2 rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 transition-all shrink-0"
                >
                  <span>Collect Vargani Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. THEN ANOTHER 2: Building Campaigns & Pending Commitments               */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Campaigns & Field Commitments
            </h2>
            <span className="text-[10px] font-bold text-slate-500">Field Drives</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Card 1: Building-Based Vargani Campaigns */}
            <div 
              onClick={() => onNavigate('vargani-campaigns')}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  {/* Soft squircle tinted icon container (RailOne inspired) */}
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:bg-sky-100 group-hover:scale-105 transition-all">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {campaigns.length} Societies
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-sm sm:text-base mt-3 leading-snug group-hover:text-sky-700 transition-colors">
                  Building-Based Vargani Campaigns
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sky-700 text-xs font-bold">
                <span>Open Societies & Wings</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Card 2: Pending Payment Commitments */}
            <div 
              onClick={() => onNavigate('vargani-pending')}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  {/* Soft squircle tinted icon container (RailOne inspired) */}
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:bg-amber-100 group-hover:scale-105 transition-all">
                    <Clock className="w-6 h-6" />
                  </div>
                  {pendingPaymentsCount > 0 ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      {pendingPaymentsCount} Pledged
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      0 Pledged
                    </span>
                  )}
                </div>

                <h3 className="font-black text-slate-900 text-sm sm:text-base mt-3 leading-snug group-hover:text-amber-700 transition-colors">
                  Pending Payment Commitments
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-amber-700 text-xs font-bold">
                <span>Follow Up Pledges</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. THEN ANOTHER 3: Records, Approvals, Financial Summary                  */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Audit & Financial Oversight
            </h2>
            <span className="text-[10px] font-bold text-slate-500">3-Tier Verification</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
            {/* 1. Donation Records & Audit Ledger */}
            <div 
              onClick={() => onNavigate('vargani-records')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all active:scale-[0.98] cursor-pointer text-center flex flex-col items-center justify-between group"
            >
              <div className="w-full flex flex-col items-center">
                {/* Squircle Pastel Green (RailOne style) */}
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-100 group-hover:scale-105 transition-all mb-2 shadow-2xs">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-emerald-700 transition-colors">
                  Donation Records & Audit Ledger
                </h3>
              </div>
              <div className="mt-2 text-[10px] sm:text-[11px] font-bold text-slate-500 group-hover:text-emerald-800">
                {donations.length} Verified Entries
              </div>
            </div>

            {/* 2. Treasurer Cash Approvals */}
            <div 
              onClick={() => onNavigate('vargani-approvals')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all active:scale-[0.98] cursor-pointer text-center flex flex-col items-center justify-between relative group"
            >
              <div className="w-full flex flex-col items-center">
                {/* Squircle Pastel Coral/Rose (RailOne style) */}
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:bg-rose-100 group-hover:scale-105 transition-all mb-2 shadow-2xs relative">
                  <ShieldCheck className="w-6 h-6" />
                  {pendingCashCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white animate-pulse">
                      {pendingCashCount}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-rose-700 transition-colors">
                  Treasurer Cash Approvals
                </h3>
              </div>
              <div className="mt-2 text-[10px] sm:text-[11px] font-bold text-rose-700">
                {pendingCashCount > 0 ? `${pendingCashCount} Pending Approval` : 'All Clear'}
              </div>
            </div>

            {/* 3. Vargani Financial Summary */}
            <div 
              onClick={() => onNavigate('vargani-summary')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all active:scale-[0.98] cursor-pointer text-center flex flex-col items-center justify-between group"
            >
              <div className="w-full flex flex-col items-center">
                {/* Squircle Pastel Purple (RailOne style) */}
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:bg-purple-100 group-hover:scale-105 transition-all mb-2 shadow-2xs">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-purple-700 transition-colors">
                  Vargani Financial Summary
                </h3>
              </div>
              <div className="mt-2 text-[10px] sm:text-[11px] font-bold text-slate-500 group-hover:text-purple-800">
                Reconciliation & Reports
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. LIVE SNAPSHOT & RECENT RECEIPTS (RailOne 'Do you know?' section)       */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span>Real-Time Collection Breakdown</span>
            </h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Treasury
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-600" /> Physical Cash In Hand
              </div>
              <div className="font-mono font-black text-slate-900 text-base mt-1">
                ₹{cashCollected.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {isTreasurerOrAdmin && pendingCashCount > 0 
                  ? `${pendingCashCount} physical deposits await Treasurer confirmation` 
                  : 'All physical cash accounted for in custody'}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" /> Digital UPI / QR / Bank
              </div>
              <div className="font-mono font-black text-slate-900 text-base mt-1">
                ₹{upiCollected.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Direct bank settlement with automatic UTR reference tags
              </div>
            </div>
          </div>

          {/* Recent Receipts List with one-tap digital modal */}
          {recentDonations.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Recent Issued Receipts
                </span>
                <button 
                  type="button" 
                  onClick={() => onNavigate('vargani-records')}
                  className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-0.5"
                >
                  <span>View All ({donations.length})</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5">
                {recentDonations.map(d => (
                  <div 
                    key={d.id}
                    onClick={() => setActiveReceipt(d)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-100 flex items-center justify-between transition-colors cursor-pointer active:scale-[0.99]"
                    title="Click to view digital receipt & WhatsApp dispatch"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">{d.donorName}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-white border border-slate-200 text-slate-600">
                          {d.receiptNumber}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {d.unitDetails || 'General Patron'} • {d.paymentMethod}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-xs text-slate-900 block">
                        ₹{(d.amount || 0).toLocaleString('en-IN')}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-block ${
                        d.financialStatus === 'Approved' || d.financialStatus === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {d.financialStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
