import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Calendar, 
  Coins, 
  CheckCircle2, 
  ChevronRight, 
  X,
  Layers,
  Sparkles,
  User,
  Phone,
  Receipt,
  FileText,
  Clock,
  ArrowRight,
  Search,
  Filter,
  CreditCard,
  Building,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  DoorClosed,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VarganiCampaign, CampaignStatus, PaymentMethod } from '../types';
import { BuildingSetupView } from './BuildingSetupView';
import { BuildingUnitsView } from './BuildingUnitsView';

interface VarganiCampaignsViewProps {
  onNavigate?: (view: string) => void;
  initialSubTab?: 'campaigns' | 'setup' | 'units';
}

export const VarganiCampaignsView: React.FC<VarganiCampaignsViewProps> = ({ 
  onNavigate, 
  initialSubTab = 'campaigns' 
}) => {
  const { 
    campaigns, 
    createCampaign, 
    donations, 
    currentUser, 
    members,
    updateCampaignStatus, 
    updateCampaignTeamLead,
    requestPinAuth,
    setCurrentView
  } = useApp();

  const [activeSection, setActiveSection] = useState<'campaigns' | 'setup' | 'units'>(initialSubTab);
  const [selectedCampaignForSubView, setSelectedCampaignForSubView] = useState<string>('');

  useEffect(() => {
    if (initialSubTab) {
      setActiveSection(initialSubTab);
    }
  }, [initialSubTab]);

  const handleNavigate = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    }
    if (typeof setCurrentView === 'function') {
      setCurrentView(view);
    }
  };

  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Draft' | 'Closed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Campaign Modal State (Section 3: Building-Based, No Target Amount, Starts in Draft)
  const [isCreating, setIsCreating] = useState(false);
  const [campaignName, setCampaignName] = useState('JAUS26-VG-0003 - Shree Ganesh Residency');
  const [societyName, setSocietyName] = useState('Shree Ganesh Co-op Housing Society');
  const [startDate, setStartDate] = useState('2026-09-05');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [selectedLeadId, setSelectedLeadId] = useState('');

  // Close Campaign Summary Modal State (Section 42)
  const [campaignToClose, setCampaignToClose] = useState<VarganiCampaign | null>(null);

  // Assign Team Lead Modal State (Section 4)
  const [leadModalCampaign, setLeadModalCampaign] = useState<VarganiCampaign | null>(null);
  const [targetLeadMemberId, setTargetLeadMemberId] = useState('');

  const isAdminOrCM = currentUser?.category === 'CM' || currentUser?.isTreasurer;

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      if (c.type !== 'Building-Based') return false;
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(query) || (c.buildingConfig?.societyName || '').toLowerCase().includes(query);
      }
      return true;
    });
  }, [campaigns, statusFilter, searchQuery]);

  // Create New Campaign Handler (Section 3)
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim() || !societyName.trim()) return;

    const leadMember = members.find(m => m.id === selectedLeadId);

    createCampaign({
      name: campaignName.trim(),
      type: 'Building-Based',
      targetAmount: 0, // Explicitly no target amount required per Section 3
      startDate,
      endDate,
      teamLeadId: leadMember?.id || currentUser?.id,
      teamLeadName: leadMember?.fullName || currentUser?.fullName,
      buildingConfig: {
        societyName: societyName.trim(),
        isConfirmed: false,
        wings: []
      }
    });

    setIsCreating(false);
    setCampaignName('');
    setSocietyName('');
    setSelectedLeadId('');
  };

  // Close Campaign Handler (Section 42)
  const handleConfirmCloseCampaign = async () => {
    if (!campaignToClose) return;

    const authed = await requestPinAuth({
      title: 'Close Building Campaign',
      description: `Official closure for ${campaignToClose.name}. Collection will cease and records will be finalized.`,
      actionName: 'Close Campaign',
      requiredRole: 'Committee Member'
    });

    if (authed) {
      updateCampaignStatus(campaignToClose.id, 'Closed');
      setCampaignToClose(null);
    }
  };

  // Reopen Campaign Handler (Section 43)
  const handleReopenCampaign = async (campaign: VarganiCampaign) => {
    const authed = await requestPinAuth({
      title: 'Reopen Building Campaign',
      description: `Reopen ${campaign.name} for active collection. All existing unit statuses and records are preserved.`,
      actionName: 'Reopen Campaign',
      requiredRole: 'Committee Member'
    });

    if (authed) {
      updateCampaignStatus(campaign.id, 'Open');
    }
  };

  // Save Team Lead
  const handleSaveTeamLead = () => {
    if (!leadModalCampaign || !targetLeadMemberId) return;
    const member = members.find(m => m.id === targetLeadMemberId);
    if (!member) return;
    updateCampaignTeamLead(leadModalCampaign.id, member.id, member.fullName);
    setLeadModalCampaign(null);
    setTargetLeadMemberId('');
  };

  // Helper to compute stats for a campaign
  const getCampaignStats = (camp: VarganiCampaign) => {
    const campDonations = donations.filter(d => d.campaignId === camp.id && d.financialStatus !== 'Cancelled');
    const totalCollected = campDonations.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const approvedCash = campDonations.filter(d => d.paymentMethod === 'Cash' && d.financialStatus === 'Approved').reduce((acc, curr) => acc + curr.amount, 0);
    const pendingCash = campDonations.filter(d => d.paymentMethod === 'Cash' && d.financialStatus === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);

    let totalUnits = 0;
    let collectedUnits = 0;
    let pendingUnits = 0;
    let closedUnits = 0;
    let refusedUnits = 0;
    let notVisitedUnits = 0;

    if (camp.buildingConfig?.wings) {
      camp.buildingConfig.wings.forEach(w => {
        w.units.forEach(u => {
          totalUnits++;
          const st = u.collectionStatus || 'Not Yet Visited';
          if (st === 'Collection Received') collectedUnits++;
          else if (st.includes('Payment Pending')) pendingUnits++;
          else if (st.includes('House Closed')) closedUnits++;
          else if (st.includes('Refused') || st.includes('Non-Cooperative')) refusedUnits++;
          else notVisitedUnits++;
        });
      });
    }

    return {
      totalCollected,
      approvedCash,
      pendingCash,
      totalUnits,
      collectedUnits,
      pendingUnits,
      closedUnits,
      refusedUnits,
      notVisitedUnits
    };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
              Building-Based Vargani Campaigns
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              JAUS 2026
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
            Structured building drives, physical wings & unit structures, and door-to-door collection units matrix.
          </p>
        </div>

        {/* Action Button */}
        {isAdminOrCM && activeSection === 'campaigns' && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors self-start lg:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Building Campaign</span>
          </button>
        )}
      </div>

      {/* Building-Based Vargani Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSection('campaigns')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'campaigns'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Campaigns Overview</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              {filteredCampaigns.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('setup')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'setup'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Building Structure Setup</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('units')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'units'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-indigo-600" />
            <span>Building Collection Units</span>
          </button>
        </div>

        {activeSection !== 'campaigns' && (
          <button
            type="button"
            onClick={() => setActiveSection('campaigns')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Back to Campaigns Overview</span>
          </button>
        )}
      </div>

      {/* Render Building Structure Setup */}
      {activeSection === 'setup' && (
        <BuildingSetupView 
          initialCampaignId={selectedCampaignForSubView} 
          onGoToUnits={() => setActiveSection('units')} 
        />
      )}

      {/* Render Building Collection Units */}
      {activeSection === 'units' && (
        <BuildingUnitsView 
          initialCampaignId={selectedCampaignForSubView} 
          onGoToSetup={() => setActiveSection('setup')} 
        />
      )}

      {/* Render Campaigns Overview List */}
      {activeSection === 'campaigns' && (
        <>
          {/* Filter and Search */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['All', 'Open', 'Draft', 'Closed'] as const).map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
                statusFilter === st 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st} ({st === 'All' ? campaigns.filter(c => c.type === 'Building-Based').length : campaigns.filter(c => c.type === 'Building-Based' && c.status === st).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search society, campaign..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCampaigns.map(camp => {
          const stats = getCampaignStats(camp);
          const isConfirmed = !!camp.buildingConfig?.isConfirmed;

          return (
            <div 
              key={camp.id}
              className="bg-white rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3.5">
                {/* Status Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    camp.status === 'Open'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : camp.status === 'Draft'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {camp.status === 'Open' ? 'Active / Open' : camp.status}
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    isConfirmed 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {isConfirmed ? 'Structure Confirmed' : 'Structure Unconfirmed'}
                  </span>
                </div>

                {/* Campaign Titles */}
                <div>
                  <h3 className="font-bold text-base text-slate-900 tracking-tight line-clamp-1">
                    {camp.name}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">{camp.buildingConfig?.societyName || 'Building Society'}</span>
                  </div>
                </div>

                {/* Team Lead */}
                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Team Lead</span>
                      <span className="font-bold text-slate-800">{camp.teamLeadName || 'Unassigned'}</span>
                    </div>
                  </div>

                  {isAdminOrCM && camp.status === 'Draft' && (
                    <button
                      type="button"
                      onClick={() => {
                        setLeadModalCampaign(camp);
                        setTargetLeadMemberId(camp.teamLeadId || '');
                      }}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider"
                    >
                      Change
                    </button>
                  )}
                </div>

                {/* Live Collection & Units Stats */}
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-slate-400 block">
                      Total Collected
                    </span>
                    <span className="font-black text-slate-900 text-sm">
                      ₹{stats.totalCollected.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-slate-400 block">
                      Coverage
                    </span>
                    <span className="font-black text-slate-900 text-sm">
                      {stats.collectedUnits} / {stats.totalUnits} <span className="text-[10px] font-normal text-slate-400 font-sans">Units</span>
                    </span>
                  </div>
                </div>

                {/* Units Breakdown Mini Bar */}
                {stats.totalUnits > 0 && (
                  <div className="space-y-1 text-[10px] text-slate-500">
                    <div className="flex justify-between text-[9px] uppercase font-mono font-bold">
                      <span className="text-emerald-700">{stats.collectedUnits} Collected</span>
                      <span className="text-amber-700">{stats.pendingUnits} Pending</span>
                      <span className="text-blue-700">{stats.closedUnits} Closed</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                      <div style={{ width: `${(stats.collectedUnits / stats.totalUnits) * 100}%` }} className="bg-emerald-500 h-full" />
                      <div style={{ width: `${(stats.pendingUnits / stats.totalUnits) * 100}%` }} className="bg-amber-500 h-full" />
                      <div style={{ width: `${(stats.closedUnits / stats.totalUnits) * 100}%` }} className="bg-blue-500 h-full" />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCampaignForSubView(camp.id);
                      setActiveSection('setup');
                    }}
                    className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                  >
                    <Layers className="w-3 h-3 text-indigo-600" />
                    <span>Setup Wings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCampaignForSubView(camp.id);
                      setActiveSection('units');
                    }}
                    className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors"
                  >
                    <span>Field Units</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Close / Reopen controls */}
                {isAdminOrCM && (
                  <div className="pt-1 flex justify-end">
                    {camp.status === 'Open' ? (
                      <button
                        type="button"
                        onClick={() => setCampaignToClose(camp)}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-800 uppercase tracking-wider"
                      >
                        Close Campaign (Finalize)
                      </button>
                    ) : camp.status === 'Closed' ? (
                      <button
                        type="button"
                        onClick={() => handleReopenCampaign(camp)}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reopen Campaign</span>
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center text-slate-400 text-xs">
          No campaigns found matching the filter.
        </div>
      )}
      </>
      )}

      {/* MODAL: Create Building Campaign (Section 3) */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Create Building-Based Campaign</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md text-indigo-900 text-[11px] leading-relaxed">
                <span className="font-bold block uppercase text-[9px] text-indigo-700 tracking-wider">Section 3 Mandate:</span>
                Campaign starts in <strong>DRAFT</strong> status. There is <strong>no collection target amount</strong>. The Team Lead will configure the physical building wings & units.
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Campaign Name / Code *
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. JAUS26-VG-0003 - Shree Ganesh Residency"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Building / Society Name *
                </label>
                <input
                  type="text"
                  value={societyName}
                  onChange={(e) => setSocietyName(e.target.value)}
                  placeholder="e.g. Shree Ganesh Co-op Housing Society"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Assign Team Lead (Section 4)
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a member...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.roleTitle || m.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3.5 py-1.5 bg-slate-100 rounded-md font-bold text-slate-700 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold uppercase tracking-wider shadow-xs"
                >
                  Create (Draft)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Close Campaign Summary Confirmation (Section 42) */}
      {campaignToClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>Close Campaign & Finalize Summary</span>
              </h3>
              <button
                type="button"
                onClick={() => setCampaignToClose(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Before closing <strong>{campaignToClose.name}</strong>, review the final metrics. This action requires 4-digit PIN authentication.
              </p>

              {(() => {
                const stats = getCampaignStats(campaignToClose);
                return (
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-2 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Total Building Units:</span>
                      <span className="font-bold">{stats.totalUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Collected Units:</span>
                      <span className="font-bold text-emerald-700">{stats.collectedUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Pending Payments:</span>
                      <span className="font-bold text-amber-700">{stats.pendingUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">House Closed:</span>
                      <span className="font-bold text-blue-700">{stats.closedUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Refused / Non-Cooperative:</span>
                      <span className="font-bold text-rose-700">{stats.refusedUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Not Visited:</span>
                      <span className="font-bold text-slate-700">{stats.notVisitedUnits}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-indigo-700">
                      <span className="font-sans uppercase">Total Collected:</span>
                      <span>₹{stats.totalCollected.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400 font-sans">Pending Cash Approvals:</span>
                      <span className="text-amber-600">₹{stats.pendingCash.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCampaignToClose(null)}
                  className="px-3.5 py-1.5 bg-slate-100 rounded-md font-bold text-slate-700 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCloseCampaign}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-bold uppercase tracking-wider shadow-xs"
                >
                  Authenticate & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Change Team Lead (Section 4) */}
      {leadModalCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>Change Campaign Team Lead</span>
              </h3>
              <button
                type="button"
                onClick={() => setLeadModalCampaign(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-500 text-[11px]">
                Changing the Team Lead does not reset the building wings or units.
              </p>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Select New Lead
                </label>
                <select
                  value={targetLeadMemberId}
                  onChange={(e) => setTargetLeadMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a member...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.roleTitle || m.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLeadModalCampaign(null)}
                  className="px-3 py-1.5 bg-slate-100 rounded-md font-bold text-slate-700 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeamLead}
                  disabled={!targetLeadMemberId}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md font-bold uppercase tracking-wider shadow-xs"
                >
                  Update Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
