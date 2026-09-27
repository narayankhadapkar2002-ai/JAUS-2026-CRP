import React from 'react';
import { 
  TrendingUp, 
  Coins, 
  CreditCard, 
  Users, 
  Building2, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Download 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DonationSummaryView: React.FC = () => {
  const { donations, campaigns, members } = useApp();

  const validDonations = donations.filter(d => d.financialStatus !== 'Cancelled');
  const totalAmount = validDonations.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Cash vs UPI
  const cashDonations = validDonations.filter(d => d.paymentMethod === 'Cash');
  const upiDonations = validDonations.filter(d => d.paymentMethod.startsWith('UPI'));

  const cashTotal = cashDonations.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const upiTotal = upiDonations.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const cashApproved = cashDonations.filter(d => d.financialStatus === 'Approved').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const cashPending = cashDonations.filter(d => d.financialStatus === 'Pending').reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Collector-wise aggregation
  const collectorMap: Record<string, { count: number; total: number; cash: number; upi: number }> = {};
  validDonations.forEach(d => {
    if (!collectorMap[d.collectorName]) {
      collectorMap[d.collectorName] = { count: 0, total: 0, cash: 0, upi: 0 };
    }
    const amt = d.amount || 0;
    collectorMap[d.collectorName].count += 1;
    collectorMap[d.collectorName].total += amt;
    if (d.paymentMethod === 'Cash') collectorMap[d.collectorName].cash += amt;
    else collectorMap[d.collectorName].upi += amt;
  });

  const collectorStats = Object.entries(collectorMap).sort((a, b) => b[1].total - a[1].total);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
            Vargani Financial Summary
          </h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
            Real-time reconciliation of Cash, UPI, and volunteer collector returns.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Financial Sheet</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-t-2 border-t-indigo-600">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Total Net Collections</span>
          <div className="font-bold text-2xl text-slate-900 mt-1">
            ₹{(totalAmount || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1 block">From {validDonations.length} receipts</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-t-2 border-t-amber-500">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Physical Cash Total</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-bold text-2xl text-amber-950 mt-1">
            ₹{(cashTotal || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2 font-medium">
            <span className="text-emerald-700 font-bold">₹{(cashApproved || 0).toLocaleString('en-IN')} Appr.</span>
            <span>•</span>
            <span className="text-amber-700 font-bold">₹{(cashPending || 0).toLocaleString('en-IN')} Pend.</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-t-2 border-t-indigo-500">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">UPI / Online Total</span>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-bold text-2xl text-slate-900 mt-1">
            ₹{(upiTotal || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1 block">{upiDonations.length} instant digital receipts</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-t-2 border-t-emerald-500">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Digital Share</span>
          <div className="font-bold text-2xl text-slate-900 mt-1">
            {totalAmount > 0 ? Math.round((upiTotal / totalAmount) * 100) : 0}%
          </div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1 block">UPI vs Cash Ratio</span>
        </div>
      </div>

      {/* Collector Performance Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider">Volunteer & Collector Breakdown</h3>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Receipt volume and cash custody per team member</p>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            {collectorStats.length} Active Collectors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Volunteer Collector</th>
                <th className="py-2.5 px-4 text-right">Receipts Issued</th>
                <th className="py-2.5 px-4 text-right">Cash Collected</th>
                <th className="py-2.5 px-4 text-right">UPI Collected</th>
                <th className="py-2.5 px-4 text-right">Total Contributed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {collectorStats.map(([name, stats]) => (
                <tr key={name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {name.charAt(0)}
                    </div>
                    <span>{name}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-700">
                    {stats.count}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-900 font-medium">
                    ₹{(stats.cash || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-indigo-900 font-medium">
                    ₹{(stats.upi || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-xs sm:text-sm">
                    ₹{(stats.total || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
