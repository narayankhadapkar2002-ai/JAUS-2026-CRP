import React, { useState, useMemo } from 'react';
import { 
  Coins, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Check, 
  UserCheck, 
  Building, 
  Calendar,
  Lock,
  FileCheck,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Layers,
  Home
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DonationRecord } from '../types';

interface PendingBuildingCampaignEntry {
  type: 'building-campaign';
  id: string; // campaignId
  campaignId: string;
  campaignName: string;
  donations: DonationRecord[];
  totalAmount: number;
  unitCount: number;
  collectors: string[];
  latestCollectedAt: string;
}

interface PendingIndividualDonationEntry {
  type: 'individual-donation';
  id: string; // donation.id
  donation: DonationRecord;
}

type PendingQueueEntry = PendingBuildingCampaignEntry | PendingIndividualDonationEntry;

export const TreasurerApprovalsView: React.FC = () => {
  const { 
    currentUser, 
    campaigns,
    donations, 
    approveCashDonation, 
    switchUser,
    requestPinAuth
  } = useApp();

  const [approvalMessage, setApprovalMessage] = useState('');
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCampaigns(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isTreasurer = !!currentUser?.isTreasurer || currentUser?.responsibilities?.some(r => r.toLowerCase().includes('treasurer'));
  const isAdmin = currentUser?.category === 'CM' || currentUser?.responsibilities?.some(r => r.toLowerCase().includes('admin') || r.toLowerCase().includes('president'));
  const isAuthorized = isTreasurer || isAdmin;

  const pendingCashDonations = useMemo(() => {
    return donations.filter(
      d => d.paymentMethod === 'Cash' && d.financialStatus === 'Pending'
    );
  }, [donations]);

  const pendingTotal = useMemo(() => {
    return pendingCashDonations.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [pendingCashDonations]);

  // Group building campaigns into a single unified entry until approved
  const queueEntries = useMemo<PendingQueueEntry[]>(() => {
    const buildingMap = new Map<string, DonationRecord[]>();
    const individualList: DonationRecord[] = [];

    pendingCashDonations.forEach(d => {
      const camp = campaigns.find(c => c.id === d.campaignId);
      const isBuildingCampaign = d.campaignType === 'Building-Based' || camp?.type === 'Building-Based';

      if (isBuildingCampaign) {
        const key = d.campaignId || d.campaignName;
        const existing = buildingMap.get(key) || [];
        existing.push(d);
        buildingMap.set(key, existing);
      } else {
        individualList.push(d);
      }
    });

    const entries: PendingQueueEntry[] = [];

    // Building-based campaigns treated as a SINGLE ENTRY
    buildingMap.forEach((dons, campaignKey) => {
      const camp = campaigns.find(c => c.id === campaignKey);
      const campaignName = camp?.name || dons[0]?.campaignName || 'Building Campaign';
      const totalAmount = dons.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      const collectors = Array.from(new Set(dons.map(curr => curr.collectorName).filter(Boolean)));
      
      // Sort donations within campaign by collectedAt descending
      dons.sort((a, b) => (b.collectedAt || '').localeCompare(a.collectedAt || ''));

      entries.push({
        type: 'building-campaign',
        id: campaignKey,
        campaignId: campaignKey,
        campaignName,
        donations: dons,
        totalAmount,
        unitCount: dons.length,
        collectors,
        latestCollectedAt: dons[0]?.collectedAt || ''
      });
    });

    // Individual donations (if any)
    individualList.forEach(d => {
      entries.push({
        type: 'individual-donation',
        id: d.id,
        donation: d
      });
    });

    return entries;
  }, [pendingCashDonations, campaigns]);

  // Single campaign batch approval handler
  const handleApproveCampaignBatch = async (entry: PendingBuildingCampaignEntry) => {
    if (!isAuthorized) {
      alert('Access Denied: Only designated Treasurers or Admins can approve cash intake.');
      return;
    }

    const authed = await requestPinAuth({
      title: 'Treasurer Building Campaign Approval',
      description: `Confirm physical custody of ₹${entry.totalAmount.toLocaleString('en-IN')} cash across all ${entry.unitCount} unit collection slips for "${entry.campaignName}". This action requires 4-digit security PIN authorization.`,
      actionName: 'Approve Building Campaign Cash',
      requiredRole: 'Treasurer'
    });

    if (!authed) return;

    let successCount = 0;
    for (const d of entry.donations) {
      const res = await approveCashDonation(d.id);
      if (res.success) successCount++;
    }

    setApprovalMessage(
      `Approved consolidated cash intake of ₹${entry.totalAmount.toLocaleString('en-IN')} for "${entry.campaignName}" (${successCount} unit collections reconciled).`
    );
    setTimeout(() => setApprovalMessage(''), 5000);
  };

  const handleApprove = async (donationId: string, donorName: string, amount: number, unitInfo?: string) => {
    if (!isAuthorized) {
      alert('Access Denied: Only designated Treasurers or Admins can approve cash intake.');
      return;
    }

    const authed = await requestPinAuth({
      title: 'Treasurer Cash Verification',
      description: `Confirm physical custody of ₹${(amount || 0).toLocaleString('en-IN')} cash received from ${donorName}${unitInfo ? ` (${unitInfo})` : ''}. This action requires 4-digit security PIN authorization.`,
      actionName: 'Approve Cash Custody',
      requiredRole: 'Treasurer'
    });

    if (!authed) return;

    const res = await approveCashDonation(donationId);
    if (res.success) {
      setApprovalMessage(`Approved ₹${(amount || 0).toLocaleString('en-IN')} cash received from ${donorName}.`);
      setTimeout(() => setApprovalMessage(''), 4000);
    } else {
      alert(res.message);
    }
  };

  const handleApproveAll = async () => {
    if (!isAuthorized) {
      alert('Access Denied: Only designated Treasurers or Admins can approve cash intake.');
      return;
    }

    const authed = await requestPinAuth({
      title: 'Bulk Cash Approvals Authorization',
      description: `Verify physical custody of all ${pendingCashDonations.length} pending cash slips totaling ₹${(pendingTotal || 0).toLocaleString('en-IN')}`,
      actionName: 'Bulk Cash Approval',
      requiredRole: 'Treasurer'
    });

    if (!authed) return;

    // Approve each
    for (const d of pendingCashDonations) {
      await approveCashDonation(d.id);
    }

    setApprovalMessage(`Successfully approved all ${pendingCashDonations.length} cash collections totaling ₹${(pendingTotal || 0).toLocaleString('en-IN')}.`);
    setTimeout(() => setApprovalMessage(''), 5000);
  };

  // If user is not Designated Treasurer or Admin, display Unauthorized
  if (!isAuthorized) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
            Treasurer Cash Approvals
          </h1>
          <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-rose-200">
            Restricted
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-6 sm:p-10 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 ring-8 ring-rose-50/60 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-rose-100 text-rose-800 border border-rose-200">
              Access Denied
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Unauthorized
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              You are not authorized to view or manage <strong>Treasurer Cash Approvals</strong>. This section is restricted exclusively to the <strong>Designated Treasurer</strong> and <strong>Admin</strong> for physical cash verification and reconciliation sign-off.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs max-w-md mx-auto text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current User:</span>
              <span className="font-bold text-slate-900">{currentUser?.fullName || 'Volunteer'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned Role:</span>
              <span className="font-mono font-bold text-slate-700">
                {currentUser?.category === 'SB' ? 'Sabhasad (SB)' : currentUser?.category === 'KY' ? 'Karyakarta (KY)' : currentUser?.category === 'YK' ? 'Yuva Karyakarta (YK)' : currentUser?.category || 'Member'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Permission Status:</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                Unauthorized
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => switchUser('JAUS26-SB-002')}
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>Switch to Rajesh Patel (Treasurer)</span>
            </button>
            <button
              type="button"
              onClick={() => switchUser('JAUS26-CM-001')}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Switch to Amit Shah (Admin)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
              Treasurer Cash Approvals
            </h1>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-amber-200">
              Audit Control
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
            Physical cash reconciliation queue • Dual-authorization ledger sign-off
          </p>
        </div>

        {isTreasurer && pendingCashDonations.length > 0 && (
          <button
            type="button"
            onClick={handleApproveAll}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow-sm flex items-center gap-2 transition-colors self-start sm:self-auto uppercase tracking-wider"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Approve All ({pendingCashDonations.length} receipts • ₹{pendingTotal.toLocaleString('en-IN')})</span>
          </button>
        )}
      </div>

      {/* Role Verification Banner if logged in as Non-Treasurer */}
      {!isTreasurer ? (
        <div className="bg-amber-50/70 border-l-4 border-l-amber-400 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-md text-amber-900 shrink-0">
              <Lock className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Designated Treasurer Authentication Required
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                You are currently signed in as <strong>{currentUser?.fullName}</strong> ({currentUser?.category}). The Samiti financial charter requires an Admin-designated Treasurer to verify physical cash and sign off with a PIN.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => switchUser('JAUS26-SB-002')}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md shadow-sm flex items-center gap-1.5 shrink-0 transition-colors uppercase tracking-wider"
          >
            <UserCheck className="w-4 h-4" />
            <span>Switch to Rajesh Patel (Treasurer)</span>
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border-l-4 border-l-emerald-500 border border-slate-200 rounded-lg p-3.5 flex items-center gap-3 text-xs text-emerald-900 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Logged in as <strong>{currentUser?.fullName}</strong> (Designated Official Treasurer). You have full authority to reconcile cash balances and certify receipt authenticity.
          </span>
        </div>
      )}

      {approvalMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{approvalMessage}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between shadow-sm border-l-4 border-l-amber-400">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">Pending Cash Receipts</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {pendingCashDonations.length}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1 block">Awaiting physical handover</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">Pending Physical Amount</span>
          <span className="text-2xl font-bold text-slate-800 mt-1 block">
            ₹{(pendingTotal || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1 block">In volunteer custody</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between shadow-sm border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">Approved Cash Total</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            ₹{donations
              .filter(d => d.paymentMethod === 'Cash' && d.financialStatus === 'Approved')
              .reduce((acc, curr) => acc + (curr.amount || 0), 0)
              .toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1 block">Reconciled in Samiti treasury</span>
        </div>
      </div>

      {/* Pending Items Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
              Pending Physical Cash Queue ({queueEntries.length} {queueEntries.length === 1 ? 'Entry' : 'Entries'} • {pendingCashDonations.length} Total Receipts)
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Building campaigns with multiple unit contributions are treated as a single consolidated entry until approved.
            </p>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0">
            Verify Physical Custody Before Approval
          </span>
        </div>

        {queueEntries.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {queueEntries.map(entry => {
              if (entry.type === 'building-campaign') {
                const isExpanded = !!expandedCampaigns[entry.id];
                return (
                  <div 
                    key={entry.id} 
                    className="p-4 hover:bg-slate-50/70 transition-colors border-l-4 border-l-purple-600 bg-white"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Building Campaign Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5">
                          <Building className="w-5 h-5 text-purple-100" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {entry.campaignName}
                            </span>
                            <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              Building Campaign Single Entry
                            </span>
                            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              {entry.unitCount} {entry.unitCount === 1 ? 'Unit Collection' : 'Unit Collections'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600">
                            Volunteers: <strong className="text-slate-800">{entry.collectors.join(', ') || 'Volunteers'}</strong>
                          </div>

                          <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-2 uppercase tracking-wider">
                            <span>Status: <strong className="text-amber-700">Awaiting Physical Custody Handover</strong></span>
                            {entry.latestCollectedAt && (
                              <>
                                <span>•</span>
                                <span>Latest slip: {entry.latestCollectedAt}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Consolidated Amount & Actions */}
                      <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
                            Consolidated Amount
                          </span>
                          <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">
                            ₹{entry.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleExpand(entry.id)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold flex items-center gap-1 transition-colors uppercase tracking-wider"
                          title="Toggle unit receipts breakdown"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Hide Units</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              <span>{entry.unitCount} Units</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApproveCampaignBatch(entry)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors uppercase tracking-wider"
                          title="Approve all cash entries for this building campaign (Requires 4-Digit PIN)"
                        >
                          <Lock className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Approve Building Cash</span>
                        </button>
                      </div>
                    </div>

                    {/* Detailed Breakdown for the Building Campaign */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-200 bg-slate-50/70 p-3 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200">
                          <span>Unit Slips in this Building Campaign ({entry.donations.length}):</span>
                          <span className="text-slate-400 font-normal">You can approve the entire campaign above or individual slips below</span>
                        </div>

                        <div className="divide-y divide-slate-200/60">
                          {entry.donations.map(d => (
                            <div key={d.id} className="py-2 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                                  {d.receiptNumber}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-800 text-xs truncate">
                                    {d.donorName} {d.unitDetails && <span className="font-mono font-medium text-slate-600">({d.unitDetails})</span>}
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                                    <span>Collector: {d.collectorName}</span>
                                    <span>•</span>
                                    <span>{d.collectedAt}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                <span className="font-mono font-bold text-slate-900 text-xs">
                                  ₹{(d.amount || 0).toLocaleString('en-IN')}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(d.id, d.donorName, d.amount, d.unitDetails)}
                                  className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs transition-colors"
                                  title="Approve this unit slip individually with 4-digit PIN"
                                >
                                  <Lock className="w-3 h-3 text-emerald-600" />
                                  <span>Approve Slip</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // Individual donation entry
              const donation = entry.donation;
              return (
                <div 
                  key={donation.id} 
                  className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-2 border-l-amber-400"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">{donation.donorName}</span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{donation.receiptNumber}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {donation.unitDetails || donation.campaignName}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex flex-wrap items-center gap-2 uppercase tracking-wider">
                        <span>Collector: <strong className="text-slate-700">{donation.collectorName}</strong></span>
                        <span>•</span>
                        <span>{donation.collectedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Amount</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        ₹{(donation.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApprove(donation.id, donation.donorName, donation.amount, donation.unitDetails)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors uppercase tracking-wider"
                      title="Requires 4-Digit Security PIN"
                    >
                      <Lock className="w-3 h-3 text-emerald-200" />
                      <span>Approve Cash</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">All Cash Collections Reconciled</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no physical cash collections currently waiting for Treasurer approval.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
