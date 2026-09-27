import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  Building, 
  Phone, 
  ArrowRight,
  Coins,
  CreditCard,
  X,
  AlertCircle,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PendingPayment, PaymentMethod } from '../types';

export const PendingPaymentsView: React.FC = () => {
  const { 
    pendingPayments, 
    convertPendingPaymentToDonation, 
    setActiveReceipt, 
    setActiveWhatsApp,
    campaigns,
    requestPinAuth
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionPaymentMethod, setConversionPaymentMethod] = useState<PaymentMethod>('Cash');
  const [conversionUtr, setConversionUtr] = useState('');

  const filtered = pendingPayments.filter(p => {
    return (
      p.donorName.toLowerCase().includes(search.toLowerCase()) ||
      p.donorMobile.includes(search) ||
      p.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      (p.unitDetails && p.unitDetails.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const totalCommitted = pendingPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleSendReminder = (p: PendingPayment) => {
    const text = 
      `🙏 *JAI AMBE UTSAV SAMITI (JAUS 2026)* 🙏\n` +
      `*Gentle Navratri Vargani Reminder*\n\n` +
      `Pranam *${p.donorName}* ji,\n\n` +
      `This is a respectful follow-up regarding your generous voluntary commitment of *₹${(p.amount || 0).toLocaleString('en-IN')}* towards Navratri Mahotsav 2026 for ${p.unitDetails || 'your residence'}.\n\n` +
      `📄 *Commitment Slip Ref:* ${p.receiptNumber}\n` +
      `📅 *Promised Date:* ${p.promisedPaymentDate || 'As scheduled'}\n\n` +
      `Our volunteer *${p.collectorName}* can visit at your convenience, or you may contribute via UPI.\n\n` +
      `May Maa Durga bless you and your family! ✨`;

    setActiveWhatsApp({
      phone: p.donorMobile,
      text,
      title: `Reminder for ${p.donorName}`,
      receiptNumber: p.receiptNumber
    });
  };

  const handleConfirmConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    const authed = await requestPinAuth({
      title: 'Payment Commitment Realization',
      description: `Verify 4-digit PIN to confirm receipt of ₹${(selectedPayment.amount || 0).toLocaleString('en-IN')} via ${conversionPaymentMethod === 'Cash' ? 'Physical Cash' : 'UPI / Online'} from ${selectedPayment.donorName} (${selectedPayment.unitDetails || 'Unit'}).`,
      actionName: 'Fulfill Commitment',
      requiredRole: 'Collector'
    });

    if (!authed) return;

    const receipt = convertPendingPaymentToDonation(
      selectedPayment.id,
      conversionPaymentMethod,
      conversionPaymentMethod === 'UPI' ? (conversionUtr || `UPI-COMP-${Math.floor(Math.random()*1000000)}`) : undefined,
      '4-digit PIN'
    );

    setIsConverting(false);
    setSelectedPayment(null);
    setConversionUtr('');

    if (receipt) {
      setActiveReceipt(receipt);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
              Pending Payment Commitments
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-slate-200">
              {pendingPayments.length} Pledged
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
            Track voluntary commitments from residents who promised to pay later. Convert to official receipts upon payment.
          </p>
        </div>

        <div className="bg-white px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 border-t-2 border-t-indigo-600">
          <Clock className="w-5 h-5 text-indigo-600" />
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Pledged Amount</span>
            <span className="font-bold text-slate-900 text-base">
              ₹{(totalCommitted || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Donor Name, Mobile, Slip Ref, Building/Flat..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Commitment Slip No.</th>
                  <th className="py-2.5 px-4">Donor & Premises</th>
                  <th className="py-2.5 px-4">Mobile Number</th>
                  <th className="py-2.5 px-4">Committed Amount</th>
                  <th className="py-2.5 px-4">Promised Date</th>
                  <th className="py-2.5 px-4">Volunteer Collector</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {p.receiptNumber}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 text-xs">{p.donorName}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                        {p.unitDetails || 'General Patron'}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 text-xs">
                      {p.donorMobile}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs sm:text-sm">
                      ₹{(p.amount || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[10px] font-bold uppercase tracking-wider">
                        {p.promisedPaymentDate || 'Not specified'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {p.collectorName}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSendReminder(p)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-emerald-200 transition-colors"
                          title="Send WhatsApp Reminder"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPayment(p);
                            setIsConverting(true);
                          }}
                          className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors shadow-sm"
                          title="Requires 4-Digit Security PIN"
                        >
                          <Lock className="w-3 h-3 text-indigo-200" />
                          <span>Convert to Receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">No Pending Commitments Found</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              When donors request to pay at a later date, records created in "Fast Collection" will be managed here.
            </p>
          </div>
        )}
      </div>

      {/* Convert to Completed Donation Modal */}
      {isConverting && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm uppercase tracking-wider">Convert Commitment to Receipt</h3>
              <button
                type="button"
                onClick={() => { setIsConverting(false); setSelectedPayment(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmConvert} className="p-5 space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Donor:</span>
                  <span className="font-bold text-slate-900">{selectedPayment.donorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Committed Amount:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    ₹{(selectedPayment.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Premises:</span>
                  <span className="font-medium text-slate-800">{selectedPayment.unitDetails || 'General'}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Actual Payment Mode Received *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConversionPaymentMethod('Cash')}
                    className={`p-2.5 rounded-md border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                      conversionPaymentMethod === 'Cash'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs'
                        : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-amber-700" />
                    <span>Physical Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConversionPaymentMethod('UPI')}
                    className={`p-2.5 rounded-md border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                      conversionPaymentMethod === 'UPI'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-950 shadow-xs'
                        : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-700" />
                    <span>UPI / Online</span>
                  </button>
                </div>
              </div>

              {conversionPaymentMethod === 'UPI' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    UPI Reference / UTR Number
                  </label>
                  <input
                    type="text"
                    value={conversionUtr}
                    onChange={(e) => setConversionUtr(e.target.value)}
                    placeholder="e.g. 4210982348"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md font-mono text-xs outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Requires 4-Digit Security PIN</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => { setIsConverting(false); setSelectedPayment(null); }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md font-bold text-slate-700 text-xs uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-indigo-200" />
                    <span>Authorize & Generate Receipt</span>
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
