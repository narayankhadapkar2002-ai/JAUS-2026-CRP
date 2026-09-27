import React, { useRef } from 'react';
import { Printer, MessageSquare, CheckCircle, Clock, AlertTriangle, X, Shield, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReceiptModal: React.FC = () => {
  const { activeReceipt, setActiveReceipt, setActiveWhatsApp, settings, receiptTemplates } = useApp();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!activeReceipt) return null;

  const currentTemplate = receiptTemplates.find(t => t.isDefault) || receiptTemplates[0];
  const isPendingCommitment = activeReceipt.isPendingPaymentCommitment || activeReceipt.receiptNumber.includes('PEND');

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const isPending = isPendingCommitment;
    const headerTitle = currentTemplate?.headerTitle || settings.samitiName;
    const footerBlessing = currentTemplate?.footerBlessing || settings.receiptFooterNote;
    const taxNote = currentTemplate?.taxExemptionNote ? `\n📌 ${currentTemplate.taxExemptionNote}\n` : '';

    const msg = isPending
      ? `🙏 *${headerTitle.toUpperCase()}* 🙏\n*PENDING PAYMENT COMMITMENT RECEIPT*\n\n` +
        `📄 *Receipt No:* ${activeReceipt.receiptNumber}\n` +
        `👤 *Donor Name:* ${activeReceipt.donorName}\n` +
        `🏢 *Premises:* ${activeReceipt.unitDetails || 'General Patron'}\n` +
        `💰 *Committed Amount:* ₹${(activeReceipt.amount || 0).toLocaleString('en-IN')}\n` +
        `📅 *Promised Date:* ${activeReceipt.promisedPaymentDate || 'As discussed'}\n` +
        `🤝 *Volunteer Collector:* ${activeReceipt.collectorName}\n\n` +
        `⚠️ *Note:* This is a voluntary commitment reminder, not a completed tax/donation receipt. The official Donation Receipt will be generated once payment is completed.\n\n` +
        `"${footerBlessing}"\n` +
        `Jai Mata Di! ✨`
      : `🙏 *${headerTitle.toUpperCase()}* 🙏\n*OFFICIAL DONATION RECEIPT (VARGANI)*\n\n` +
        `📄 *Receipt No:* ${activeReceipt.receiptNumber}\n` +
        `👤 *Donor Name:* ${activeReceipt.donorName}\n` +
        `🏢 *Premises:* ${activeReceipt.unitDetails || 'General Patron'}\n` +
        `💰 *Donation Amount:* ₹${(activeReceipt.amount || 0).toLocaleString('en-IN')}\n` +
        `💳 *Payment Method:* ${activeReceipt.paymentMethod}${activeReceipt.transactionId ? ` (UTR: ${activeReceipt.transactionId})` : ''}\n` +
        `📅 *Date & Time:* ${activeReceipt.collectedAt}\n` +
        `🤝 *Collector:* ${activeReceipt.collectorName}\n` +
        `📊 *Status:* ${activeReceipt.financialStatus}\n` +
        `${activeReceipt.approvedByName ? `✅ *Approved By:* ${activeReceipt.approvedByName}\n` : ''}` +
        `${taxNote}\n` +
        `"${footerBlessing}"\n\n` +
        `Jai Mata Di! ✨`;

    setActiveWhatsApp({
      phone: activeReceipt.donorMobile,
      text: msg,
      title: isPending ? `WhatsApp Pending Slip: ${activeReceipt.receiptNumber}` : `WhatsApp Receipt: ${activeReceipt.receiptNumber}`,
      receiptNumber: activeReceipt.receiptNumber
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden my-auto flex flex-col">
        {/* Modal Top Control Bar */}
        <div className="bg-slate-900 px-5 py-3 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              {isPendingCommitment ? 'Payment Commitment Slip' : 'Official Vargani Receipt'}
            </span>
            <span className="text-slate-400 text-xs">• {activeReceipt.receiptNumber}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send to WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveReceipt(null)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg ml-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div ref={receiptRef} className="p-6 bg-amber-50/30 text-slate-900 font-sans border-b border-dashed border-slate-300">
          {/* Header Banner */}
          <div className="text-center pb-4 border-b-2 border-amber-800/30 relative">
            <div className="inline-block bg-amber-800 text-amber-50 text-[10px] font-bold tracking-widest px-3 py-0.5 rounded-full uppercase mb-2">
              {currentTemplate?.subHeader || 'Navratri Mahotsav 2026 • 39th Year'}
            </div>
            <h2 className="font-serif font-black text-xl text-amber-950 tracking-tight leading-tight">
              {(currentTemplate?.headerTitle || settings.samitiName).toUpperCase()}
            </h2>
            <p className="text-[11px] text-amber-900 font-medium mt-0.5">
              {currentTemplate?.registrationText || `Regd. No: ${settings.registrationNumber} • Estd. ${settings.foundedYear}`}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              {settings.address}
            </p>

            {/* Commitment vs Donation Banner */}
            <div className={`mt-3 py-1 px-4 rounded-lg font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 ${
              isPendingCommitment 
                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                : 'bg-amber-800 text-white shadow-xs'
            }`}>
              {isPendingCommitment ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Pending Payment Commitment Slip</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-amber-300" />
                  <span>Donation Receipt (Vargani)</span>
                </>
              )}
            </div>
          </div>

          {/* Pending Notice Warning if applicable */}
          {isPendingCommitment && (
            <div className="mt-3 p-2.5 bg-amber-100/70 border border-amber-300/80 rounded-lg flex items-start gap-2 text-[11px] text-amber-950 leading-snug">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Payment Commitment Notice:</strong> This receipt acknowledges a pledged contribution. It is a reminder commitment and <em>not</em> an authorized tax or final donation receipt. Final receipt will be generated upon payment receipt.
              </div>
            </div>
          )}

          {/* Key Receipt Meta */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-white/80 p-3 rounded-xl border border-amber-900/10">
            <div>
              <span className="text-[10px] text-slate-600 uppercase font-semibold block">Receipt Number</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{activeReceipt.receiptNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-600 uppercase font-semibold block">Date & Time</span>
              <span className="font-medium text-slate-800">{activeReceipt.collectedAt}</span>
            </div>
          </div>

          {/* Donor & Premises Details */}
          <div className="mt-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-baseline py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-medium">Donor Name:</span>
              <span className="font-bold text-slate-900 text-sm text-right">{activeReceipt.donorName}</span>
            </div>

            <div className="flex justify-between items-baseline py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-medium">Mobile Number:</span>
              <span className="font-mono font-medium text-slate-800 text-right">{activeReceipt.donorMobile}</span>
            </div>

            <div className="flex justify-between items-baseline py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-medium">Building / Premises:</span>
              <span className="font-semibold text-slate-900 text-right max-w-[260px] truncate">
                {activeReceipt.unitDetails || activeReceipt.campaignName}
              </span>
            </div>

            <div className="flex justify-between items-baseline py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-medium">Payment Mode:</span>
              <span className="font-medium text-slate-800 text-right">
                {activeReceipt.paymentMethod}
                {activeReceipt.transactionId && (
                  <span className="block text-[10px] font-mono text-slate-600">UTR: {activeReceipt.transactionId}</span>
                )}
              </span>
            </div>

            {isPendingCommitment && activeReceipt.promisedPaymentDate && (
              <div className="flex justify-between items-baseline py-1.5 border-b border-amber-200 bg-amber-50/50 px-2 rounded">
                <span className="text-amber-800 font-semibold">Promised Payment Date:</span>
                <span className="font-bold text-amber-900">{activeReceipt.promisedPaymentDate}</span>
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div className="mt-5 p-4 bg-gradient-to-br from-amber-800 to-amber-900 rounded-xl text-white flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-amber-200 font-semibold block">
                {isPendingCommitment ? 'Committed Amount' : 'Amount Received'}
              </span>
              <span className="font-serif font-black text-2xl tracking-tight">
                ₹{(activeReceipt.amount || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right text-[11px] text-amber-200">
              <span className="px-2.5 py-1 bg-white/20 rounded-full font-semibold inline-flex items-center gap-1">
                {activeReceipt.financialStatus === 'Approved' || activeReceipt.financialStatus === 'Completed' ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-300" />
                    <span>{activeReceipt.financialStatus}</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-300" />
                    <span>Pending Approval</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-center text-[10px]">
            <div>
              <div className="h-9 flex items-end justify-center font-serif italic text-slate-600 text-xs">
                {activeReceipt.collectorName}
              </div>
              <div className="border-t border-slate-300 pt-1 text-slate-500 font-medium">
                Authorized Volunteer Collector
              </div>
            </div>
            <div>
              <div className="h-9 flex items-end justify-center font-serif italic text-slate-600 text-xs">
                {activeReceipt.approvedByName || 'Authorized Signatory'}
              </div>
              <div className="border-t border-slate-300 pt-1 text-slate-500 font-medium">
                {currentTemplate?.signatoryTitle || 'Treasurer Confirmation'}
              </div>
            </div>
          </div>

          {/* Tax Exemption Note if configured in template */}
          {currentTemplate?.taxExemptionNote && (
            <div className="mt-3 text-center text-[9px] text-emerald-800 font-mono bg-emerald-50/70 p-1 rounded border border-emerald-200/50">
              ✓ {currentTemplate.taxExemptionNote}
            </div>
          )}

          {/* Blessings Note */}
          <div className="mt-4 text-center text-[10px] text-slate-600 italic">
            "{currentTemplate?.footerBlessing || settings.receiptFooterNote}"
          </div>
        </div>

        {/* Modal Action Bottom */}
        <div className="p-4 bg-slate-50 flex items-center justify-between text-xs no-print">
          <span className="text-slate-500 text-[11px]">
            JAUS 2026 Central ERP System
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveReceipt(null)}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-medium text-slate-700 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-medium text-white flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
