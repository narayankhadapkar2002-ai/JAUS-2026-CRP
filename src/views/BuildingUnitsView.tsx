import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  DoorClosed, 
  AlertCircle, 
  Users, 
  Coins, 
  CreditCard, 
  Check, 
  X, 
  ShieldCheck, 
  Receipt, 
  MessageSquare, 
  ArrowRight, 
  Home, 
  Store, 
  History, 
  Phone, 
  User, 
  Calendar,
  Sparkles,
  Upload,
  AlertTriangle,
  RotateCcw,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  BuildingUnit, 
  BuildingWing, 
  CollectionSituationStatus, 
  PaymentMethod 
} from '../types';

interface BuildingUnitsViewProps {
  initialCampaignId?: string;
  onGoToSetup?: () => void;
  onBack?: () => void;
}

interface LinkedUnitChipProps {
  unitId: string;
  unitNumber: string;
  isSelected: boolean;
  onToggle: (unitId: string, checked: boolean) => void;
}

const LinkedUnitChip: React.FC<LinkedUnitChipProps> = ({
  unitId,
  unitNumber,
  isSelected,
  onToggle
}) => {
  return (
    <label
      className={`group flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer select-none transition-all duration-150 ${
        isSelected
          ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-900'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onToggle(unitId, e.target.checked)}
        className="sr-only"
      />
      <span className="truncate">{unitNumber}</span>
      <span
        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
          isSelected
            ? 'bg-white text-purple-700'
            : 'border border-slate-300 bg-white group-hover:border-purple-300'
        }`}
      >
        <Check
          className={`w-3 h-3 stroke-[3] transition-opacity ${
            isSelected ? 'opacity-100 text-purple-700' : 'opacity-0'
          }`}
        />
      </span>
    </label>
  );
};

export const BuildingUnitsView: React.FC<BuildingUnitsViewProps> = ({ initialCampaignId, onGoToSetup, onBack }) => {
  const { 
    campaigns, 
    donations, 
    currentUser, 
    updateUnitStatus, 
    submitDonation, 
    submitPendingPaymentCommitment, 
    requestPinAuth,
    setActiveReceipt,
    setActiveWhatsApp
  } = useApp();

  const buildingCampaigns = useMemo(() => {
    return campaigns.filter(c => c.type === 'Building-Based');
  }, [campaigns]);

  // Selected Campaign
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(() => {
    if (initialCampaignId) return initialCampaignId;
    const open = buildingCampaigns.find(c => c.status === 'Open');
    return open ? open.id : (buildingCampaigns[0]?.id || '');
  });

  useEffect(() => {
    if (initialCampaignId) {
      setSelectedCampaignId(initialCampaignId);
    }
  }, [initialCampaignId]);

  const campaign = useMemo(() => {
    return buildingCampaigns.find(c => c.id === selectedCampaignId) || buildingCampaigns[0] || null;
  }, [buildingCampaigns, selectedCampaignId]);

  const wings: BuildingWing[] = useMemo(() => {
    return campaign?.buildingConfig?.wings || [];
  }, [campaign]);

  // Selected Wing
  const [selectedWingId, setSelectedWingId] = useState<string>('');
  const activeWing = useMemo(() => {
    if (!wings.length) return null;
    return wings.find(w => w.id === selectedWingId) || wings[0];
  }, [wings, selectedWingId]);

  // Filters
  const [selectedFloor, setSelectedFloor] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Unit Collection Drawer / Modal State
  const [activeUnit, setActiveUnit] = useState<BuildingUnit | null>(null);
  const [situationStatus, setSituationStatus] = useState<CollectionSituationStatus>('Collection Received');
  
  // Form fields
  const [donorName, setDonorName] = useState('');
  const [donorMobile, setDonorMobile] = useState('');
  const [amount, setAmount] = useState<number>(1001);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [promisedDate, setPromisedDate] = useState('2026-09-15');
  const [notes, setNotes] = useState('');
  const [proofFileName, setProofFileName] = useState<string>('');

  // Family / Multi-flat linking state
  const [familyName, setFamilyName] = useState('');
  const [linkedUnitIds, setLinkedUnitIds] = useState<string[]>([]);

  // Open unit modal helper
  const handleOpenUnit = (unit: BuildingUnit) => {
    setActiveUnit(unit);
    setSituationStatus(unit.collectionStatus || 'Collection Received');
    setDonorName(unit.donorName || '');
    setDonorMobile(unit.donorMobile || '');
    setAmount(1001);
    setPaymentMethod('Cash');
    setTransactionId('');
    setNotes(unit.notes || '');
    setLinkedUnitIds(unit.linkedFamilyUnitIds || []);
    setFamilyName('');
    setProofFileName('');
  };

  // Metrics for active wing / campaign
  const metrics = useMemo(() => {
    if (!activeWing) return { total: 0, notVisited: 0, collected: 0, pending: 0, closed: 0, refused: 0, sameFamily: 0 };

    let notVisited = 0;
    let collected = 0;
    let pending = 0;
    let closed = 0;
    let refused = 0;
    let sameFamily = 0;

    activeWing.units.forEach(u => {
      const st = u.collectionStatus || 'Not Yet Visited';
      if (st === 'Not Yet Visited') notVisited++;
      else if (st === 'Collection Received') collected++;
      else if (st.includes('Payment Pending')) pending++;
      else if (st.includes('House Closed')) closed++;
      else if (st.includes('Non-Cooperative') || st.includes('Refused')) refused++;
      else if (st.includes('Same Family')) sameFamily++;
    });

    return {
      total: activeWing.units.length,
      notVisited,
      collected,
      pending,
      closed,
      refused,
      sameFamily
    };
  }, [activeWing]);

  // Filtered units
  const filteredUnits = useMemo(() => {
    if (!activeWing) return [];
    return activeWing.units.filter(u => {
      // Floor filter
      if (selectedFloor !== 'All') {
        const floorStr = u.floor === 'G' ? 'G' : String(u.floor);
        if (floorStr !== selectedFloor) return false;
      }

      // Status filter
      if (statusFilter !== 'All') {
        const st = u.collectionStatus || 'Not Yet Visited';
        if (statusFilter === 'Not Yet Visited' && st !== 'Not Yet Visited') return false;
        if (statusFilter === 'Collection Received' && st !== 'Collection Received') return false;
        if (statusFilter === 'Payment Pending' && !st.includes('Payment Pending')) return false;
        if (statusFilter === 'House Closed' && !st.includes('House Closed')) return false;
        if (statusFilter === 'Refused' && !st.includes('Refused') && !st.includes('Non-Cooperative')) return false;
        if (statusFilter === 'Same Family' && !st.includes('Same Family')) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const numMatch = u.unitNumber.toLowerCase().includes(q);
        const nameMatch = (u.donorName || '').toLowerCase().includes(q);
        const mobileMatch = (u.donorMobile || '').includes(q);
        const notesMatch = (u.notes || '').toLowerCase().includes(q);
        return numMatch || nameMatch || mobileMatch || notesMatch;
      }

      return true;
    });
  }, [activeWing, selectedFloor, statusFilter, searchQuery]);

  // Floors in active wing for dropdown
  const floorsList = useMemo(() => {
    if (!activeWing) return [];
    const set = new Set<string>();
    activeWing.units.forEach(u => {
      set.add(u.floor === 'G' ? 'G' : String(u.floor));
    });
    return Array.from(set).sort((a, b) => {
      if (a === 'G') return -1;
      if (b === 'G') return 1;
      return (Number(a) || 0) - (Number(b) || 0);
    });
  }, [activeWing]);

  // Submit Unit Collection or Visit Action
  const handleSubmitUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !activeWing || !activeUnit) return;

    // Handle each of the 6 situations
    if (situationStatus === 'Collection Received') {
      if (!donorName.trim() || !donorMobile.trim() || amount <= 0) {
        alert('Donor name, WhatsApp mobile number, and valid amount are required.');
        return;
      }

      if (paymentMethod !== 'Cash' && !transactionId.trim()) {
        alert('UPI Transaction ID / UTR is mandatory.');
        return;
      }

      // Check UPI duplicate UTR
      if (paymentMethod !== 'Cash') {
        const isDuplicate = donations.some(d => 
          d.transactionId && d.transactionId.toLowerCase() === transactionId.trim().toLowerCase()
        );
        if (isDuplicate) {
          alert(`This Transaction ID / UTR "${transactionId}" has already been recorded in another donation.`);
          return;
        }
      }

      // Mandatory Authentication for Building Collection
      const authed = await requestPinAuth({
        title: 'Building Collection Authorization',
        description: `Authorize collection of ₹${amount.toLocaleString('en-IN')} via ${paymentMethod} from ${donorName} for Unit ${activeWing.name}-${activeUnit.unitNumber}.`,
        actionName: 'Submit Collection',
        requiredRole: 'Collector'
      });

      if (!authed) return;

      const unitDetails = `${campaign.buildingConfig?.societyName || campaign.name}, ${activeWing.name}, ${activeUnit.floor === 'G' ? 'Ground Floor' : `Floor ${activeUnit.floor}`}, ${activeUnit.unitNumber}`;

      // Submit donation
      submitDonation({
        campaignId: campaign.id,
        unitId: activeUnit.id,
        unitDetails,
        donorName: donorName.trim(),
        donorMobile: donorMobile.replace(/\D/g, ''),
        amount,
        paymentMethod,
        transactionId: paymentMethod !== 'Cash' ? transactionId.trim() : undefined,
        transactionProofUrl: proofFileName ? `uploaded_proof_${proofFileName}` : undefined,
        authMethod: '4-digit PIN'
      });

      // Update unit
      updateUnitStatus(
        campaign.id,
        activeWing.id,
        activeUnit.id,
        'Collection Received',
        donorName.trim(),
        donorMobile.replace(/\D/g, ''),
        notes.trim() || undefined,
        linkedUnitIds.length > 0 ? linkedUnitIds : undefined
      );

      setActiveUnit(null);
    } 
    else if (situationStatus.includes('Payment Pending')) {
      if (!donorName.trim() || !donorMobile.trim()) {
        alert('Resident Name and WhatsApp mobile are required for generating a Pending Payment Slip.');
        return;
      }

      // Mandatory 4-digit PIN authentication for Pending Payment Commitment
      const authed = await requestPinAuth({
        title: 'Pending Payment Commitment Authorization',
        description: `Authorize recording voluntary commitment of ₹${(amount || 0).toLocaleString('en-IN')} from ${donorName} for Unit ${activeWing.name}-${activeUnit.unitNumber}, promised for ${promisedDate || 'later'}.`,
        actionName: 'Record Pending Commitment',
        requiredRole: 'Collector'
      });

      if (!authed) return;

      const unitDetails = `${campaign.buildingConfig?.societyName || campaign.name}, ${activeWing.name}, ${activeUnit.unitNumber}`;

      // Submit Pending Commitment & Generate Pending Payment Slip
      const pendingRecord = submitPendingPaymentCommitment({
        campaignId: campaign.id,
        unitId: activeUnit.id,
        unitDetails,
        donorName: donorName.trim(),
        donorMobile: donorMobile.replace(/\D/g, ''),
        amount: amount || 0,
        promisedDate,
        notes: notes.trim()
      });

      updateUnitStatus(
        campaign.id,
        activeWing.id,
        activeUnit.id,
        'Payment Pending — Donor Will Pay Later',
        donorName.trim(),
        donorMobile.replace(/\D/g, ''),
        notes.trim()
      );

      // Trigger Pending Payment WhatsApp slip
      const text = 
        `🙏 *JAI AMBE UTSAV SAMITI (JAUS 2026)* 🙏\n` +
        `*Official Pending Payment Commitment Slip*\n\n` +
        `Ref Number: *${pendingRecord.receiptNumber}*\n` +
        `Resident: *${donorName}*\n` +
        `Premises: *${unitDetails}*\n` +
        `Expected Amount: *₹${(amount || 0).toLocaleString('en-IN')}*\n` +
        `Promised Date: *${promisedDate}*\n` +
        `Status: *PAYMENT PENDING (Unpaid Commitment)*\n` +
        `Volunteer: *${currentUser?.fullName || 'Collector'}*\n\n` +
        `Note: This is an acknowledgment of your voluntary promise, not a tax or financial receipt. Thank you for your support! ✨`;

      setActiveWhatsApp({
        phone: donorMobile.replace(/\D/g, ''),
        text,
        title: `Pending Slip for ${donorName}`
      });

      setActiveUnit(null);
    } 
    else if (situationStatus.includes('House Closed')) {
      const authed = await requestPinAuth({
        title: 'Unit Visit Verification',
        description: `Confirm recording 'House Closed' audit status for Unit ${activeWing.name}-${activeUnit.unitNumber}.`,
        actionName: 'Record Visit Status',
        requiredRole: 'Collector'
      });
      if (!authed) return;

      // Record visit attempt
      const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const closedNote = `Visited on ${new Date().toLocaleDateString('en-IN')} at ${timestamp} - House closed. ${notes.trim()}`;
      
      updateUnitStatus(
        campaign.id,
        activeWing.id,
        activeUnit.id,
        'House Closed / Nobody Available',
        undefined,
        undefined,
        closedNote
      );
      setActiveUnit(null);
    } 
    else if (situationStatus.includes('Non-Cooperative') || situationStatus.includes('Refused')) {
      const authed = await requestPinAuth({
        title: 'Unit Status Authorization',
        description: `Confirm recording 'Non-Cooperative / Refused' status for Unit ${activeWing.name}-${activeUnit.unitNumber}.`,
        actionName: 'Record Refusal Status',
        requiredRole: 'Collector'
      });
      if (!authed) return;

      const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const refuseNote = `Visited on ${new Date().toLocaleDateString('en-IN')} at ${timestamp} - Resident refused/unwilling. ${notes.trim()}`;

      updateUnitStatus(
        campaign.id,
        activeWing.id,
        activeUnit.id,
        'Non-Cooperative / Refused',
        undefined,
        undefined,
        refuseNote
      );
      setActiveUnit(null);
    } 
    else if (situationStatus.includes('Same Family')) {
      const authed = await requestPinAuth({
        title: 'Family Grouping Authorization',
        description: `Confirm linking family units with Unit ${activeWing.name}-${activeUnit.unitNumber}.`,
        actionName: 'Link Family Units',
        requiredRole: 'Collector'
      });
      if (!authed) return;

      // Link multiple units to same family group
      const famName = familyName.trim() || `${donorName} Family`;
      const combinedNotes = `Family Group: ${famName}. Linked with ${linkedUnitIds.join(', ')}. ${notes.trim()}`;

      updateUnitStatus(
        campaign.id,
        activeWing.id,
        activeUnit.id,
        'Multiple Flats/Units — Same Family',
        donorName || undefined,
        donorMobile || undefined,
        combinedNotes,
        linkedUnitIds
      );
      setActiveUnit(null);
    } 
    else {
      // Reset or Not Visited
      updateUnitStatus(
        campaign.id,
        activeWing.id,
        activeUnit.id,
        'Not Yet Visited',
        undefined,
        undefined,
        notes.trim() || undefined
      );
      setActiveUnit(null);
    }
  };

  if (!campaign || !activeWing) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-slate-200 max-w-lg mx-auto mt-12">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 uppercase tracking-tight">No Active Building Structure</h3>
        <p className="text-xs text-slate-500 mt-1">Please configure the building wings and floors in Building Setup first.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold flex items-center gap-1 transition-colors mr-1"
                title="Back to Campaigns Overview"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Campaigns</span>
              </button>
            )}
            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
              Building Collection Units
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              {campaign.name}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
            Section 11-20: Door-to-door field collection tracking for every flat & shop across wings and floors.
          </p>
        </div>

        {/* Campaign Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Society:</span>
          <select
            value={selectedCampaignId}
            onChange={(e) => {
              setSelectedCampaignId(e.target.value);
              setSelectedWingId('');
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-bold text-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {buildingCampaigns.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Wing Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {wings.map(w => {
          const isSelected = activeWing.id === w.id;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelectedWingId(w.id)}
              className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shrink-0 ${
                isSelected 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{w.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {w.units.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* KPI Breakdown for Active Wing */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Units</span>
          <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">{metrics.total}</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-emerald-200 shadow-2xs">
          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">Collected</span>
          <span className="text-xl font-black text-emerald-700 font-mono mt-0.5 block">{metrics.collected}</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-amber-200 shadow-2xs">
          <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">Payment Pending</span>
          <span className="text-xl font-black text-amber-700 font-mono mt-0.5 block">{metrics.pending}</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-blue-200 shadow-2xs">
          <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block">House Closed</span>
          <span className="text-xl font-black text-blue-700 font-mono mt-0.5 block">{metrics.closed}</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-rose-200 shadow-2xs">
          <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider block">Refused / Non-Coop</span>
          <span className="text-xl font-black text-rose-700 font-mono mt-0.5 block">{metrics.refused}</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Not Visited</span>
          <span className="text-xl font-black text-slate-700 font-mono mt-0.5 block">{metrics.notVisited}</span>
        </div>
      </div>

      {/* Filter and Search Strip */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Floor filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">Floor:</span>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-slate-800"
            >
              <option value="All">All Floors</option>
              {floorsList.map(f => (
                <option key={f} value={f}>{f === 'G' ? 'Ground Floor' : `Floor ${f}`}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-slate-800"
            >
              <option value="All">All Statuses</option>
              <option value="Not Yet Visited">Not Visited</option>
              <option value="Collection Received">Collected</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="House Closed">House Closed</option>
              <option value="Refused">Refused</option>
              <option value="Same Family">Same Family</option>
            </select>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flat, shop, donor..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredUnits.map(unit => {
          const isShop = unit.type === 'Shop' || unit.unitType === 'Shop' || unit.unitNumber.toLowerCase().includes('shop');
          const st = unit.collectionStatus || 'Not Yet Visited';

          let statusBadgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
          let statusLabel = 'Not Visited';

          if (st === 'Collection Received') {
            statusBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
            statusLabel = 'Collected';
          } else if (st.includes('Payment Pending')) {
            statusBadgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
            statusLabel = 'Payment Pending';
          } else if (st.includes('House Closed')) {
            statusBadgeClass = 'bg-blue-50 text-blue-800 border-blue-300';
            statusLabel = 'House Closed';
          } else if (st.includes('Non-Cooperative') || st.includes('Refused')) {
            statusBadgeClass = 'bg-rose-50 text-rose-800 border-rose-300';
            statusLabel = 'Refused';
          } else if (st.includes('Same Family')) {
            statusBadgeClass = 'bg-purple-50 text-purple-800 border-purple-300';
            statusLabel = 'Same Family';
          }

          return (
            <div
              key={unit.id}
              className="bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded bg-slate-100 text-slate-600">
                      {isShop ? <Store className="w-3.5 h-3.5 text-amber-600" /> : <Home className="w-3.5 h-3.5 text-indigo-600" />}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {unit.floor === 'G' ? 'Ground' : `Floor ${unit.floor}`}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${statusBadgeClass}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="mt-2.5">
                  <h3 className="font-bold text-sm text-slate-900 font-mono tracking-tight">
                    {activeWing.name} / {unit.unitNumber}
                  </h3>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID: {unit.id}
                  </div>
                </div>

                {/* Donor / Status Details */}
                {unit.donorName && (
                  <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-100 text-[11px] space-y-0.5">
                    <div className="font-bold text-slate-800 truncate">
                      {unit.donorName}
                    </div>
                    {unit.donorMobile && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        {unit.donorMobile}
                      </div>
                    )}
                  </div>
                )}

                {unit.notes && (
                  <div className="mt-1 text-[10px] text-slate-500 line-clamp-1 italic">
                    "{unit.notes}"
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] text-slate-400 uppercase font-medium">
                  {unit.lastVisitedAt || 'Pending'}
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenUnit(unit)}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <span>Update / Collect</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUnits.length === 0 && (
        <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-400 text-xs">
          No units found matching the selected filter criteria.
        </div>
      )}

      {/* UNIT COLLECTION DRAWER / MODAL (Section 13-20, 27-30) */}
      {activeUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
                    {activeWing.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {activeUnit.id}
                  </span>
                </div>
                <h3 className="font-bold text-base uppercase tracking-tight mt-1">
                  {activeWing.name} / {activeUnit.unitNumber} ({activeUnit.floor === 'G' ? 'Ground Floor' : `Floor ${activeUnit.floor}`})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveUnit(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUnit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Situation Status Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Collection Situation (Section 12) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Collection Received', label: '1. Collect', icon: Coins, color: 'text-emerald-600' },
                    { id: 'Payment Pending — Donor Will Pay Later', label: '2. Pay Pending', icon: Clock, color: 'text-amber-600' },
                    { id: 'House Closed / Nobody Available', label: '3. House Closed', icon: DoorClosed, color: 'text-blue-600' },
                    { id: 'Non-Cooperative / Refused', label: '4. Refused', icon: AlertCircle, color: 'text-rose-600' },
                    { id: 'Multiple Flats/Units — Same Family', label: '5. Same Family', icon: Users, color: 'text-purple-600' },
                    { id: 'Not Yet Visited', label: '6. Not Visited', icon: History, color: 'text-slate-500' }
                  ].map(sit => {
                    const isSelected = situationStatus === sit.id;
                    const Icon = sit.icon;
                    return (
                      <button
                        key={sit.id}
                        type="button"
                        onClick={() => setSituationStatus(sit.id as any)}
                        className={`p-2.5 rounded-md border text-left flex items-center gap-2 text-xs transition-all ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900 ring-1 ring-indigo-500' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${sit.color}`} />
                        <span className="truncate">{sit.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic form depending on status */}
              {situationStatus === 'Collection Received' && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Donation Details</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Donor Name *</label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="e.g. Ramesh Chandra"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">WhatsApp Mobile *</label>
                      <input
                        type="tel"
                        value={donorMobile}
                        onChange={(e) => setDonorMobile(e.target.value)}
                        placeholder="e.g. 9820012345"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Amount (₹) *</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md font-bold focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Cash">Cash (Pending Treasurer Approval)</option>
                        <option value="UPI / Online">UPI / Online</option>
                      </select>
                    </div>
                  </div>

                  {paymentMethod !== 'Cash' && (
                    <div className="space-y-2 pt-2 border-t border-emerald-200">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                          UPI Transaction ID / UTR *
                        </label>
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="e.g. 325412987654"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                          Payment Proof Screenshot
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProofFileName(e.target.files?.[0]?.name || '')}
                          className="w-full text-xs"
                        />
                        {proofFileName && (
                          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                            Attached: {proofFileName}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {situationStatus.includes('Payment Pending') && (
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending Payment Commitment (Section 25 & 26)</span>
                  </div>
                  <p className="text-[10px] text-amber-900">
                    Generates an official WhatsApp "Pending Payment Receipt" clearly marked as PAYMENT PENDING.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Resident Name *</label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="e.g. Anand Joshi"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">WhatsApp Mobile *</label>
                      <input
                        type="tel"
                        value={donorMobile}
                        onChange={(e) => setDonorMobile(e.target.value)}
                        placeholder="e.g. 9820012345"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Expected Amount (₹)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Promised Date</label>
                      <input
                        type="date"
                        value={promisedDate}
                        onChange={(e) => setPromisedDate(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {situationStatus.includes('Same Family') && (
                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-lg space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Multiple Flats / Same Family Group (Section 29)</span>
                  </div>
                  <p className="text-[10px] text-purple-900">
                    Links multiple units without merging them. Each unit continues to exist independently.
                  </p>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Family Group Name</label>
                    <input
                      type="text"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      placeholder="e.g. Shah Joint Family"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                      Link other units in {activeWing.name}:
                    </label>
                    <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-white grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {activeWing.units.filter(u => u.id !== activeUnit.id).map(u => (
                        <LinkedUnitChip
                          key={u.id}
                          unitId={u.id}
                          unitNumber={u.unitNumber}
                          isSelected={linkedUnitIds.includes(u.id)}
                          onToggle={(id, checked) => {
                            if (checked) setLinkedUnitIds(prev => [...prev, id]);
                            else setLinkedUnitIds(prev => prev.filter(item => item !== id));
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Collector Notes */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Collector Remarks / Visit Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Nobody home at 3pm, spoke to neighbor, will revisit Saturday..."
                  rows={2}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Requires 4-Digit Security PIN Verification</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveUnit(null)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-md font-bold text-slate-700 uppercase tracking-wider text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-indigo-200" />
                    <span>Authorize & Save</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
