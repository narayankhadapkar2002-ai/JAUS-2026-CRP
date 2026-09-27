import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ShieldCheck, 
  UserCheck, 
  Store, 
  Home, 
  Save, 
  RotateCcw, 
  Info, 
  Check, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VarganiCampaign, BuildingWing, BuildingUnit } from '../types';

interface BuildingSetupViewProps {
  initialCampaignId?: string;
  onGoToUnits?: () => void;
  onBack?: () => void;
}

export const BuildingSetupView: React.FC<BuildingSetupViewProps> = ({ initialCampaignId, onGoToUnits, onBack }) => {
  const { 
    campaigns, 
    members, 
    currentUser, 
    updateBuildingStructure, 
    confirmBuildingLayout, 
    updateCampaignTeamLead,
    requestPinAuth
  } = useApp();

  // Filter building-based campaigns
  const buildingCampaigns = useMemo(() => {
    return campaigns.filter(c => c.type === 'Building-Based');
  }, [campaigns]);

  // Selected campaign state
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(() => {
    if (initialCampaignId) return initialCampaignId;
    // Default to a draft campaign if available, else first
    const draft = buildingCampaigns.find(c => c.status === 'Draft');
    return draft ? draft.id : (buildingCampaigns[0]?.id || '');
  });

  useEffect(() => {
    if (initialCampaignId) {
      setSelectedCampaignId(initialCampaignId);
    }
  }, [initialCampaignId]);

  const campaign = useMemo(() => {
    return buildingCampaigns.find(c => c.id === selectedCampaignId) || buildingCampaigns[0] || null;
  }, [buildingCampaigns, selectedCampaignId]);

  // Selected wing for structure inspection
  const [selectedWingId, setSelectedWingId] = useState<string>('');

  // Active wings from current campaign
  const currentWings: BuildingWing[] = useMemo(() => {
    if (!campaign?.buildingConfig?.wings) return [];
    return campaign.buildingConfig.wings;
  }, [campaign]);

  // Active wing
  const activeWing = useMemo(() => {
    if (!currentWings.length) return null;
    return currentWings.find(w => w.id === selectedWingId) || currentWings[0];
  }, [currentWings, selectedWingId]);

  // Team Lead Assignment Modal
  const [isAssigningLead, setIsAssigningLead] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(campaign?.teamLeadId || '');

  // Add Wing / Generator Modal
  const [isAddingWing, setIsAddingWing] = useState(false);
  const [newWingName, setNewWingName] = useState('Wing C-2');
  const [newFloors, setNewFloors] = useState<number>(7);
  const [hasGroundFloor, setHasGroundFloor] = useState<boolean>(true);
  const [newFlatsPerFloor, setNewFlatsPerFloor] = useState<number>(4);
  const [hasShops, setHasShops] = useState<boolean>(true);
  const [newShopsCount, setNewShopsCount] = useState<number>(2);

  // Edit / Add Unit Modal
  const [unitModal, setUnitModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    unitId?: string;
    floor: number | 'G';
    unitNumber: string;
    type: 'Flat' | 'Shop';
  }>({
    isOpen: false,
    mode: 'add',
    floor: 1,
    unitNumber: '',
    type: 'Flat'
  });

  // Confirmation Summary Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Helper: compute summary metrics
  const summaryMetrics = useMemo(() => {
    if (!campaign?.buildingConfig?.wings) {
      return { totalWings: 0, totalFloors: 0, totalFlats: 0, totalShops: 0, totalUnits: 0 };
    }
    const wings = campaign.buildingConfig.wings;
    let totalFloors = 0;
    let totalFlats = 0;
    let totalShops = 0;
    let totalUnits = 0;

    wings.forEach(w => {
      totalFloors += (w.floors || 0) + (w.hasGroundFloor ? 1 : 0);
      w.units.forEach(u => {
        totalUnits += 1;
        if (u.type === 'Shop' || u.unitType === 'Shop' || u.unitNumber.toLowerCase().includes('shop')) {
          totalShops += 1;
        } else {
          totalFlats += 1;
        }
      });
    });

    return {
      totalWings: wings.length,
      totalFloors,
      totalFlats,
      totalShops,
      totalUnits
    };
  }, [campaign]);

  const isAdminOrCM = currentUser?.category === 'CM' || currentUser?.isTreasurer;
  const isConfirmed = !!campaign?.buildingConfig?.isConfirmed;

  // Handle Team Lead Update
  const handleSaveTeamLead = () => {
    if (!campaign || !selectedLeadId) return;
    const member = members.find(m => m.id === selectedLeadId);
    if (!member) return;
    updateCampaignTeamLead(campaign.id, member.id, member.fullName);
    setIsAssigningLead(false);
  };

  // Auto-Generate a wing structure (Ground Floor shops & flats + residential floors)
  const handleGenerateWing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !newWingName.trim()) return;

    const wingClean = newWingName.trim();
    const wingId = `wing-${wingClean.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const generatedUnits: BuildingUnit[] = [];

    // Ground floor shops
    if (hasGroundFloor && hasShops && newShopsCount > 0) {
      for (let s = 1; s <= newShopsCount; s++) {
        const sNum = s < 10 ? `0${s}` : `${s}`;
        generatedUnits.push({
          id: `unit-${wingClean.replace(/\s+/g, '')}-G-Shop${sNum}`,
          wingName: wingClean,
          wing: wingClean.replace(/^Wing\s*/i, ''),
          floor: 'G',
          unitNumber: `Shop ${sNum}`,
          type: 'Shop',
          unitType: 'Shop',
          collectionStatus: 'Not Yet Visited'
        });
      }
    }

    // Ground floor flats (if ground floor exists and user wants ground flats)
    if (hasGroundFloor) {
      for (let f = 1; f <= newFlatsPerFloor; f++) {
        const fNum = f < 10 ? `00${f}` : `0${f}`;
        generatedUnits.push({
          id: `unit-${wingClean.replace(/\s+/g, '')}-G-Flat${fNum}`,
          wingName: wingClean,
          wing: wingClean.replace(/^Wing\s*/i, ''),
          floor: 'G',
          unitNumber: `Flat ${fNum}`,
          type: 'Flat',
          unitType: 'Flat',
          collectionStatus: 'Not Yet Visited'
        });
      }
    }

    // Upper residential floors
    for (let fl = 1; fl <= newFloors; fl++) {
      for (let u = 1; u <= newFlatsPerFloor; u++) {
        const uNum = `${fl}${u < 10 ? '0' + u : u}`;
        generatedUnits.push({
          id: `unit-${wingClean.replace(/\s+/g, '')}-f${fl}-Flat${uNum}`,
          wingName: wingClean,
          wing: wingClean.replace(/^Wing\s*/i, ''),
          floor: fl,
          unitNumber: `Flat ${uNum}`,
          type: 'Flat',
          unitType: 'Flat',
          collectionStatus: 'Not Yet Visited'
        });
      }
    }

    const newWingObj: BuildingWing = {
      id: wingId,
      name: wingClean,
      floors: newFloors,
      hasGroundFloor,
      flatsPerFloor: newFlatsPerFloor,
      shopsOnGround: hasShops ? newShopsCount : 0,
      units: generatedUnits
    };

    const updatedWings = [...currentWings, newWingObj];
    updateBuildingStructure(campaign.id, updatedWings);
    setSelectedWingId(wingId);
    setIsAddingWing(false);
    setNewWingName('');
  };

  // Remove Wing
  const handleRemoveWing = (wingId: string) => {
    if (!campaign) return;
    if (isConfirmed) {
      alert('Cannot delete wing from a Confirmed structure. Reset confirmation first.');
      return;
    }
    const updated = currentWings.filter(w => w.id !== wingId);
    updateBuildingStructure(campaign.id, updated);
    if (selectedWingId === wingId) {
      setSelectedWingId(updated[0]?.id || '');
    }
  };

  // Save Add/Edit Unit
  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !activeWing || !unitModal.unitNumber.trim()) return;

    let updatedUnits: BuildingUnit[] = [...activeWing.units];

    if (unitModal.mode === 'edit' && unitModal.unitId) {
      // Edit existing unit
      updatedUnits = updatedUnits.map(u => {
        if (u.id === unitModal.unitId) {
          return {
            ...u,
            unitNumber: unitModal.unitNumber.trim(),
            floor: unitModal.floor,
            type: unitModal.type,
            unitType: unitModal.type
          };
        }
        return u;
      });
    } else {
      // Add individual unit (e.g. Flat 103A, Penthouse, Shop 3)
      const cleanNum = unitModal.unitNumber.trim();
      const newUnitId = `unit-${activeWing.name.replace(/\s+/g, '')}-${unitModal.floor}-${cleanNum.replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`;
      updatedUnits.push({
        id: newUnitId,
        wingName: activeWing.name,
        wing: activeWing.name.replace(/^Wing\s*/i, ''),
        floor: unitModal.floor,
        unitNumber: cleanNum,
        type: unitModal.type,
        unitType: unitModal.type,
        collectionStatus: 'Not Yet Visited'
      });
    }

    const updatedWings = currentWings.map(w => {
      if (w.id === activeWing.id) {
        return { ...w, units: updatedUnits };
      }
      return w;
    });

    updateBuildingStructure(campaign.id, updatedWings);
    setUnitModal(prev => ({ ...prev, isOpen: false }));
  };

  // Delete Individual Unit
  const handleDeleteUnit = (unitId: string) => {
    if (!campaign || !activeWing) return;
    if (isConfirmed) {
      alert('Structure is locked/confirmed. Modify requires unconfirming layout.');
      return;
    }
    const updatedUnits = activeWing.units.filter(u => u.id !== unitId);
    const updatedWings = currentWings.map(w => {
      if (w.id === activeWing.id) {
        return { ...w, units: updatedUnits };
      }
      return w;
    });
    updateBuildingStructure(campaign.id, updatedWings);
  };

  // Officially Confirm Building Structure (Section 8)
  const handleConfirmStructure = async () => {
    if (!campaign) return;

    // PIN authentication
    const authed = await requestPinAuth({
      title: 'Confirm Building Structure',
      description: `Official confirmation by Team Lead/Admin locking ${summaryMetrics.totalUnits} collection units for ${campaign.name}.`,
      actionName: 'Confirm Structure',
      requiredRole: 'Committee Member'
    });

    if (authed) {
      confirmBuildingLayout(campaign.id);
      setIsConfirmModalOpen(false);
    }
  };

  if (!campaign) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-slate-200 max-w-lg mx-auto mt-12">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 uppercase tracking-tight">No Building-Based Campaigns Found</h3>
        <p className="text-xs text-slate-500 mt-1">Please create a Building-Based campaign first to configure premises.</p>
      </div>
    );
  }

  // Group units in active wing by floor
  const floorGroups = activeWing ? (() => {
    const map = new Map<number | 'G', BuildingUnit[]>();
    // Sort order: Ground first, then 1, 2, 3...
    activeWing.units.forEach(u => {
      const f = u.floor !== undefined ? u.floor : 1;
      if (!map.has(f)) map.set(f, []);
      map.get(f)!.push(u);
    });

    const keys = Array.from(map.keys()).sort((a, b) => {
      if (a === 'G') return -1;
      if (b === 'G') return 1;
      return (Number(a) || 0) - (Number(b) || 0);
    });

    return keys.map(k => ({
      floor: k,
      units: map.get(k)!
    }));
  })() : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Campaign Selector */}
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
              Building Structure Setup
            </h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              isConfirmed 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {isConfirmed ? 'Structure Confirmed' : 'Draft / Unconfirmed'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
            Section 5-8: Define society wings, floors, flats and shops. Review and confirm official collection units.
          </p>
        </div>

        {/* Campaign Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="text-left">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Selected Campaign:</span>
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

          <button
            type="button"
            onClick={() => setIsAssigningLead(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Lead: {campaign.teamLeadName || 'Unassigned'}</span>
          </button>
        </div>
      </div>

      {/* Building Structure Overview & Confirmation Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-lg border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
            Official Premises: {campaign.buildingConfig?.societyName || campaign.name}
          </span>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-sans">Wings: </span>
              <span className="font-bold text-white">{summaryMetrics.totalWings}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-sans">Floors: </span>
              <span className="font-bold text-white">{summaryMetrics.totalFloors}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-sans">Flats: </span>
              <span className="font-bold text-white">{summaryMetrics.totalFlats}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-sans">Shops: </span>
              <span className="font-bold text-white">{summaryMetrics.totalShops}</span>
            </div>
            <div className="px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-400/30 rounded text-indigo-300">
              <span className="text-[10px] uppercase font-sans">Total Units: </span>
              <span className="font-bold">{summaryMetrics.totalUnits}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {isConfirmed ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-md text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Confirmed by {campaign.buildingConfig.confirmedBy || 'Team Lead'} ({campaign.buildingConfig.confirmedAt || 'Verified'})</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm Building Structure</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace: Wing Selection & Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Wings List & Actions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Building Wings ({currentWings.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingWing(true)}
                className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-xs font-bold"
                title="Add New Wing"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              {currentWings.map(w => {
                const isSelected = (activeWing && activeWing.id === w.id);
                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWingId(w.id)}
                    className={`p-3 rounded-md border cursor-pointer transition-all flex items-center justify-between text-xs ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/60 font-bold text-indigo-900 shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{w.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {w.units.length} Units ({w.floors} fls{w.hasGroundFloor ? ' + G' : ''})
                      </div>
                    </div>

                    {!isConfirmed && currentWings.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveWing(w.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="Delete wing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {currentWings.length === 0 && (
                <div className="text-center p-4 text-slate-400 text-xs">
                  No wings created yet. Click "+" to generate a wing.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsAddingWing(true)}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-indigo-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add / Generate Wing</span>
            </button>
          </div>

          {/* Guidelines Box */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>Section 6 & 7 Mandate</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Never assume auto-generated units are final. Review every floor. You can rename flats (e.g. 103A), add individual penthouses, or remove non-existent units.
            </p>
          </div>
        </div>

        {/* Right Column: Active Wing Floors & Units Editor */}
        <div className="lg:col-span-3 space-y-4">
          {activeWing ? (
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-5">
              {/* Wing Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <span>{activeWing.name} Units Breakdown</span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                      {activeWing.units.length} Units
                    </span>
                  </h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                    Click "Edit" on any unit to rename or adjust floor numbering. Add flats or shops as needed.
                  </p>
                </div>

                {!isConfirmed && (
                  <button
                    type="button"
                    onClick={() => {
                      setUnitModal({
                        isOpen: true,
                        mode: 'add',
                        floor: 1,
                        unitNumber: '',
                        type: 'Flat'
                      });
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Individual Unit</span>
                  </button>
                )}
              </div>

              {/* Floors and Units */}
              <div className="space-y-4">
                {floorGroups.map(fg => (
                  <div key={String(fg.floor)} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-bold text-[10px] uppercase tracking-wider">
                          {fg.floor === 'G' ? 'Ground Floor' : `Floor ${fg.floor}`}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          ({fg.units.length} Units)
                        </span>
                      </div>

                      {!isConfirmed && (
                        <button
                          type="button"
                          onClick={() => {
                            setUnitModal({
                              isOpen: true,
                              mode: 'add',
                              floor: fg.floor,
                              unitNumber: fg.floor === 'G' ? 'Shop ' : 'Flat ',
                              type: fg.floor === 'G' ? 'Shop' : 'Flat'
                            });
                          }}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add to this floor</span>
                        </button>
                      )}
                    </div>

                    {/* Unit Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                      {fg.units.map(u => {
                        const isShop = u.type === 'Shop' || u.unitType === 'Shop' || u.unitNumber.toLowerCase().includes('shop');
                        return (
                          <div 
                            key={u.id}
                            className="bg-white p-2.5 rounded-md border border-slate-200 flex flex-col justify-between shadow-2xs hover:border-indigo-300 transition-all group"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                                {isShop ? <Store className="w-3 h-3 text-amber-600" /> : <Home className="w-3 h-3 text-indigo-600" />}
                                <span>{isShop ? 'Shop' : 'Flat'}</span>
                              </div>

                              {!isConfirmed && (
                                <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUnitModal({
                                        isOpen: true,
                                        mode: 'edit',
                                        unitId: u.id,
                                        floor: u.floor !== undefined ? u.floor : 1,
                                        unitNumber: u.unitNumber,
                                        type: (u.type || u.unitType || 'Flat') as any
                                      });
                                    }}
                                    className="text-slate-400 hover:text-indigo-600 p-0.5"
                                    title="Rename unit"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUnit(u.id)}
                                    className="text-slate-400 hover:text-rose-600 p-0.5"
                                    title="Delete unit"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="mt-1.5">
                              <div className="font-mono font-bold text-xs text-slate-800 truncate">
                                {u.unitNumber}
                              </div>
                              <div className="text-[9px] text-slate-400 truncate">
                                {u.wing || activeWing.name} / {u.unitNumber}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-lg border border-slate-200 text-center text-slate-400 text-xs">
              Select or generate a wing from the left panel to inspect and customize its units.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Auto-Generate Wing Structure */}
      {isAddingWing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Auto-Generate Wing Structure</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingWing(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateWing} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Wing Name / Designation *
                </label>
                <input
                  type="text"
                  value={newWingName}
                  onChange={(e) => setNewWingName(e.target.value)}
                  placeholder="e.g. Wing C-2, Tower A"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Number of Floors *
                  </label>
                  <input
                    type="number"
                    value={newFloors}
                    onChange={(e) => setNewFloors(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    max="50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Flats per Floor *
                  </label>
                  <input
                    type="number"
                    value={newFlatsPerFloor}
                    onChange={(e) => setNewFlatsPerFloor(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    max="20"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-700">Ground Floor Present?</span>
                  <input
                    type="checkbox"
                    checked={hasGroundFloor}
                    onChange={(e) => setHasGroundFloor(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                {hasGroundFloor && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-700">Shops on Ground Floor?</span>
                      <input
                        type="checkbox"
                        checked={hasShops}
                        onChange={(e) => setHasShops(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                    </div>

                    {hasShops && (
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">
                          Number of Commercial Shops
                        </label>
                        <input
                          type="number"
                          value={newShopsCount}
                          onChange={(e) => setNewShopsCount(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-indigo-500"
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingWing(false)}
                  className="px-3.5 py-1.5 bg-slate-100 rounded-md font-bold text-slate-700 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Structure</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit / Add Individual Unit */}
      {unitModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider">
                {unitModal.mode === 'edit' ? 'Rename / Adjust Unit' : 'Add Unit to Wing'}
              </h3>
              <button
                type="button"
                onClick={() => setUnitModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Floor
                </label>
                <select
                  value={unitModal.floor}
                  onChange={(e) => setUnitModal(prev => ({
                    ...prev,
                    floor: e.target.value === 'G' ? 'G' : parseInt(e.target.value) || 1
                  }))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="G">Ground Floor (G)</option>
                  {Array.from({ length: 30 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>Floor {i + 1}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Unit Number / Label *
                </label>
                <input
                  type="text"
                  value={unitModal.unitNumber}
                  onChange={(e) => setUnitModal(prev => ({ ...prev, unitNumber: e.target.value }))}
                  placeholder="e.g. 103A, Penthouse 2, Shop 04"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Unit Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUnitModal(prev => ({ ...prev, type: 'Flat' }))}
                    className={`py-1.5 rounded-md font-bold uppercase tracking-wider border text-[10px] ${
                      unitModal.type === 'Flat'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Flat (Residential)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitModal(prev => ({ ...prev, type: 'Shop' }))}
                    className={`py-1.5 rounded-md font-bold uppercase tracking-wider border text-[10px] ${
                      unitModal.type === 'Shop'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Commercial Shop
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUnitModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-3 py-1.5 bg-slate-100 rounded-md font-bold text-slate-700 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold uppercase tracking-wider shadow-xs"
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Team Lead Assignment (Section 4) */}
      {isAssigningLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>Assign Campaign Team Lead</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAssigningLead(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                The Team Lead is responsible for setting up and confirming the physical building structure.
              </p>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Select Team Lead
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

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssigningLead(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded-md font-bold text-slate-700 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeamLead}
                  disabled={!selectedLeadId}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md font-bold uppercase tracking-wider shadow-xs"
                >
                  Assign Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Building Structure (Section 8) */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Confirm Building Structure</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 text-xs leading-relaxed">
                Before confirming, verify the physical building structure summary below. Once confirmed, collection can begin.
              </p>

              {/* Summary table */}
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-2 font-mono">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-sans">Total Wings:</span>
                  <span className="font-bold text-slate-900">{summaryMetrics.totalWings}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-sans">Total Floors:</span>
                  <span className="font-bold text-slate-900">{summaryMetrics.totalFloors}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-sans">Total Flats:</span>
                  <span className="font-bold text-slate-900">{summaryMetrics.totalFlats}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-sans">Total Shops:</span>
                  <span className="font-bold text-slate-900">{summaryMetrics.totalShops}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-indigo-700">
                  <span className="font-sans uppercase">Total Collection Units:</span>
                  <span>{summaryMetrics.totalUnits}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2 text-amber-800 text-[11px]">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-bold block">Authorization Required</span>
                  Confirmation requires 4-digit PIN or biometric authorization and unlocks the campaign status from Draft to Active/Open.
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 rounded-md font-bold text-slate-700 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStructure}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Authenticate & Confirm</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
