import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Building2, 
  Clock, 
  FileText, 
  BarChart3, 
  ShieldCheck, 
  HandHeart,
  LayoutGrid
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Views
import { VarganiMobileHub } from './VarganiMobileHub';
import { VarganiCollectionView } from './VarganiCollectionView';
import { VarganiCampaignsView } from './VarganiCampaignsView';
import { PendingPaymentsView } from './PendingPaymentsView';
import { DonationRecordsView } from './DonationRecordsView';
import { TreasurerApprovalsView } from './TreasurerApprovalsView';
import { DonationSummaryView } from './DonationSummaryView';

interface VarganiModuleViewProps {
  initialSubTab?: string;
  onNavigateSub?: (tab: string) => void;
}

export const VarganiModuleView: React.FC<VarganiModuleViewProps> = ({ 
  initialSubTab = 'vargani-hub',
  onNavigateSub 
}) => {
  const { currentUser, donations, pendingPayments } = useApp();

  const isTreasurerOrAdmin = currentUser?.isTreasurer || currentUser?.category === 'CM';
  const pendingCashCount = donations.filter(d => d.paymentMethod === 'Cash' && d.financialStatus === 'Pending').length;
  const pendingPaymentsCount = pendingPayments.length;

  const resolveTab = (tab?: string) => {
    if (!tab || tab === 'vargani' || tab === 'vargani-central') {
      return 'vargani-hub';
    }
    return tab;
  };

  const [activeSubTab, setActiveSubTab] = useState<string>(() => resolveTab(initialSubTab));

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(resolveTab(initialSubTab));
    }
  }, [initialSubTab]);

  const handleSubTabChange = (tabId: string) => {
    setActiveSubTab(tabId);
    if (onNavigateSub) {
      onNavigateSub(tabId);
    }
  };

  const tabs = [
    { 
      id: 'vargani-pending', 
      label: 'Pending Payments', 
      icon: Clock, 
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined 
    },
    { id: 'vargani-records', label: 'Audit Records', icon: FileText },
    ...(isTreasurerOrAdmin ? [{
      id: 'vargani-approvals', 
      label: 'Treasurer Approvals', 
      icon: ShieldCheck, 
      badge: pendingCashCount > 0 ? `${pendingCashCount} Cash` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950'
    }] : []),
    { id: 'vargani-summary', label: 'Reconciliation & Reports', icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Subview Back Navigation (only when not on central hub) */}
      {activeSubTab !== 'vargani-hub' && (
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleSubTabChange('vargani-hub')}
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
          >
            <span>← Back to Vargani Central Hub</span>
          </button>
        </div>
      )}

      {/* Main Tab View */}
      <div className="flex-1">
        {activeSubTab === 'vargani-hub' && <VarganiMobileHub onNavigate={handleSubTabChange} />}
        {activeSubTab === 'vargani-collection' && <VarganiCollectionView />}
        {(activeSubTab === 'vargani-campaigns' || activeSubTab === 'vargani-setup' || activeSubTab === 'vargani-units') && (
          <VarganiCampaignsView 
            initialSubTab={
              activeSubTab === 'vargani-setup' 
                ? 'setup' 
                : activeSubTab === 'vargani-units' 
                ? 'units' 
                : 'campaigns'
            } 
            onNavigate={handleSubTabChange} 
          />
        )}
        {activeSubTab === 'vargani-pending' && <PendingPaymentsView />}
        {activeSubTab === 'vargani-records' && <DonationRecordsView />}
        {activeSubTab === 'vargani-approvals' && <TreasurerApprovalsView />}
        {activeSubTab === 'vargani-summary' && <DonationSummaryView />}
      </div>
    </div>
  );
};
