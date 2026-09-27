import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Coins, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  AlertTriangle,
  QrCode,
  Share2,
  FileCheck2,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';

export const VarganiCollectionView: React.FC = () => {
  const { 
    currentUser, 
    campaigns, 
    donations,
    submitDonation, 
    submitPendingPaymentCommitment,
    setActiveReceipt,
    setActiveWhatsApp,
    requestPinAuth
  } = useApp();

  // Fast collection automatically operates on the active primary festival drive
  const activeCampaign = useMemo(() => campaigns.find(c => c.status === 'Open') || campaigns[0], [campaigns]);

  // Collection mode: 'completed' vs 'pending_promise'
  const [collectionMode, setCollectionMode] = useState<'completed' | 'pending_promise'>('completed');

  // Form states
  const [donorName, setDonorName] = useState('');
  const [donorMobile, setDonorMobile] = useState('');
  const [amount, setAmount] = useState<number>(1001);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [promisedDate, setPromisedDate] = useState('2026-09-25');
  const [notes, setNotes] = useState('');

  const predefinedAmounts = [251, 501, 1001, 2100, 5001, 11000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanMobile = donorMobile.replace(/\D/g, '');
    if (!donorName.trim()) {
      alert('Please enter Donor Name');
      return;
    }
    if (cleanMobile.length < 10) {
      alert('Please enter a valid 10-digit mobile number for WhatsApp delivery');
      return;
    }
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (!finalAmount || finalAmount <= 0) {
      alert('Please select or specify a valid donation amount');
      return;
    }

    if (collectionMode === 'completed') {
      const authed = await requestPinAuth({
        title: 'Festival Vargani Authorization',
        description: `Verify 4-digit security PIN to authorize donation of ₹${finalAmount.toLocaleString('en-IN')} via ${paymentMethod} from ${donorName.trim()}.`,
        actionName: 'Record Donation',
        requiredRole: 'Collector'
      });
      if (!authed) return;

      // Completed donation
      submitDonation({
        campaignId: activeCampaign?.id || 'camp-1',
        donorName: donorName.trim(),
        donorMobile: cleanMobile,
        amount: finalAmount,
        paymentMethod: paymentMethod === 'Cash' ? 'Cash' : 'UPI / Online',
        transactionId: paymentMethod !== 'Cash' ? (transactionId.trim() || `UPI-TXN-${Date.now().toString().slice(-6)}`) : undefined,
        authMethod: '4-digit PIN'
      });

      // Clear form
      setDonorName('');
      setDonorMobile('');
      setCustomAmount('');
      setTransactionId('');
      setNotes('');
    } else {
      const authed = await requestPinAuth({
        title: 'Pending Commitment Authorization',
        description: `Verify 4-digit security PIN to authorize voluntary commitment of ₹${finalAmount.toLocaleString('en-IN')} from ${donorName.trim()}, promised for ${promisedDate || 'later'}.`,
        actionName: 'Record Pending Commitment',
        requiredRole: 'Collector'
      });
      if (!authed) return;

      // Pending payment commitment
      submitPendingPaymentCommitment({
        campaignId: activeCampaign?.id || 'camp-1',
        donorName: donorName.trim(),
        donorMobile: cleanMobile,
        amount: finalAmount,
        promisedDate: promisedDate || '2026-09-25',
        notes: notes.trim() || undefined
      });

      // Clear form
      setDonorName('');
      setDonorMobile('');
      setCustomAmount('');
      setNotes('');
    }
  };

  // Recent collections recorded by current user
  const recentUserCollections = useMemo(() => {
    if (!currentUser) return [];
    return donations
      .filter(d => d.collectorId === currentUser.id)
      .slice(0, 5);
  }, [donations, currentUser]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
          Fast Vargani Collection
        </h1>
      </div>

      {/* Collection Entry Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-5">
        {/* Mode Switch: Completed vs Pay Later */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold border border-slate-200">
          <button
            type="button"
            onClick={() => setCollectionMode('completed')}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider ${
              collectionMode === 'completed'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Immediate Donation</span>
          </button>
          <button
            type="button"
            onClick={() => setCollectionMode('pending_promise')}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider ${
              collectionMode === 'pending_promise'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Pay Later (Promise Slip)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Donor Name & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Donor Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Ramesh P. Shah"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                WhatsApp Mobile Number *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">+91</span>
                <input
                  type="tel"
                  value={donorMobile}
                  onChange={(e) => setDonorMobile(e.target.value)}
                  placeholder="98200 12345"
                  className="w-full pl-11 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono text-sm font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Amount Selection Buttons */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {collectionMode === 'completed' ? 'Donation Amount (₹) *' : 'Promised Amount (₹) *'}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {predefinedAmounts.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => { setAmount(val); setCustomAmount(''); }}
                  className={`py-2 rounded-xl font-mono font-bold text-xs border transition-all ${
                    amount === val && !customAmount
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ₹{val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Or Custom Amount:</span>
              <div className="relative">
                <span className="absolute left-3 top-1.5 text-slate-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-40 pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* If Immediate Donation: Payment Method & Details */}
          {collectionMode === 'completed' ? (
            <div className="space-y-3.5 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Payment Method *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    paymentMethod === 'Cash'
                      ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Coins className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Physical Cash</div>
                    <div className="text-[10px] text-amber-800 mt-0.5 uppercase tracking-wider font-semibold">
                      Requires Treasurer Approval
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    paymentMethod === 'UPI'
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-950 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs sm:text-sm">UPI / QR Code</div>
                    <div className="text-[10px] text-indigo-800 mt-0.5 uppercase tracking-wider font-semibold">
                      Completed Instantly
                    </div>
                  </div>
                </button>
              </div>

              {/* Cash Approval Notice */}
              {paymentMethod === 'Cash' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Cash Audit Rule:</strong> Physical cash collections remain in <em>Pending Approval</em> status until the designated Treasurer verifies the cash and signs off with a 4-digit PIN.
                  </div>
                </div>
              )}

              {/* UPI UTR Input */}
              {paymentMethod === 'UPI' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    UPI Reference / UTR Number
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 425619283921 (Optional, auto-generated if blank)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Pay Later Promise Configuration */
            <div className="space-y-3.5 pt-3 border-t border-slate-100">
              <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <strong>Pending Commitment Reminder:</strong> A commitment reminder slip will be issued and dispatched via WhatsApp. It is explicitly marked as a commitment reminder, not a completed donation receipt.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Promised Payment Date *
                </label>
                <input
                  type="date"
                  value={promisedDate}
                  onChange={(e) => setPromisedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white font-semibold text-xs"
                  required
                />
              </div>
            </div>
          )}

          {/* Voluntary Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Volunteer Remarks / Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Requested evening Aarti pass, special puja sankalp..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white text-xs"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className={`w-full py-3 px-4 text-white font-bold rounded-xl shadow-sm text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 ${
                collectionMode === 'completed'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              <Lock className="w-4 h-4 text-amber-200" />
              <span>
                {collectionMode === 'completed'
                  ? `Authorize & Generate Receipt (₹${((customAmount ? parseFloat(customAmount) : amount) || 0).toLocaleString('en-IN')})`
                  : `Authorize & Issue Commitment Slip (₹${((customAmount ? parseFloat(customAmount) : amount) || 0).toLocaleString('en-IN')})`}
              </span>
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Requires 4-Digit Security PIN or Biometric Authorization</span>
            </div>
          </div>
        </form>
      </div>

      {/* Recent Collections Recorded */}
      {recentUserCollections.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                Your Recent Collections
              </h3>
              <p className="text-[11px] text-slate-500">
                Recently issued receipts by you for quick verification & WhatsApp dispatch
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
              {recentUserCollections.length} Recent
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentUserCollections.map(d => (
              <div key={d.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-700 font-bold text-[10px]">
                    {d.receiptNumber}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">{d.donorName}</h5>
                    <p className="text-[10px] text-slate-500 font-mono">+91 {d.donorMobile} • {d.collectedAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900">₹{d.amount.toLocaleString('en-IN')}</span>
                    <span className={`block text-[10px] font-semibold ${
                      d.financialStatus === 'Received' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {d.paymentMethod} • {d.financialStatus}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveReceipt(d)}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg"
                    title="View Receipt"
                  >
                    <FileCheck2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveWhatsApp({
                      mobile: d.donorMobile,
                      recipientName: d.donorName,
                      type: 'receipt',
                      data: d
                    })}
                    className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg"
                    title="Share on WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
