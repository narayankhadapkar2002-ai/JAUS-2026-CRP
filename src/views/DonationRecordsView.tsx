import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  History, 
  ShieldAlert, 
  X,
  Edit,
  Ban
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DonationRecord, FinancialStatus, PaymentMethod } from '../types';

export const DonationRecordsView: React.FC = () => {
  const { 
    donations, 
    correctDonationRecord, 
    cancelDonationRecord, 
    setActiveReceipt, 
    setActiveWhatsApp,
    requestPinAuth,
    currentUser 
  } = useApp();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Audit modal
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<DonationRecord | null>(null);

  // Correction modal
  const [correctingRecord, setCorrectingRecord] = useState<DonationRecord | null>(null);
  const [correctDonorName, setCorrectDonorName] = useState('');
  const [correctAmount, setCorrectAmount] = useState('');
  const [correctReason, setCorrectReason] = useState('');

  // Cancellation modal
  const [cancellingRecord, setCancellingRecord] = useState<DonationRecord | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const filtered = donations.filter(d => {
    const matchSearch = 
      d.donorName.toLowerCase().includes(search.toLowerCase()) ||
      d.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.donorMobile.includes(search) ||
      d.collectorName.toLowerCase().includes(search.toLowerCase());

    const matchMethod = methodFilter === 'all' || d.paymentMethod === methodFilter;
    const matchStatus = statusFilter === 'all' || d.financialStatus === statusFilter;

    return matchSearch && matchMethod && matchStatus;
  });

  const handleStartCorrection = (d: DonationRecord) => {
    setCorrectingRecord(d);
    setCorrectDonorName(d.donorName);
    setCorrectAmount(d.amount.toString());
    setCorrectReason('');
  };

  const handleApplyCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctingRecord) return;
    if (!correctReason.trim()) {
      alert('A clear reason is mandatory for financial record corrections.');
      return;
    }

    const authed = await requestPinAuth({
      title: 'Financial Record Correction',
      description: `Authorize correction for receipt ${correctingRecord.receiptNumber}`,
      actionName: 'Record Correction',
      requiredRole: 'Admin'
    });

    if (!authed) return;

    correctDonationRecord(correctingRecord.id, {
      donorName: correctDonorName,
      amount: parseFloat(correctAmount) || correctingRecord.amount,
      correctionReason: correctReason
    });

    setCorrectingRecord(null);
  };

  const handleStartCancel = (d: DonationRecord) => {
    setCancellingRecord(d);
    setCancelReason('');
  };

  const handleApplyCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingRecord) return;
    if (!cancelReason.trim()) {
      alert('Please specify the justification for cancelling this official receipt.');
      return;
    }

    const authed = await requestPinAuth({
      title: 'Receipt Cancellation',
      description: `Authorize cancellation of receipt ${cancellingRecord.receiptNumber}`,
      actionName: 'Cancel Donation Record',
      requiredRole: 'Treasurer'
    });

    if (!authed) return;

    cancelDonationRecord(cancellingRecord.id, cancelReason);
    setCancellingRecord(null);
  };

  const handleExportCsv = () => {
    const headers = ['Receipt Number', 'Donor Name', 'Mobile', 'Amount (INR)', 'Method', 'Financial Status', 'Collector', 'Date', 'Premises'];
    const rows = filtered.map(d => [
      d.receiptNumber,
      `"${d.donorName}"`,
      d.donorMobile,
      d.amount,
      d.paymentMethod,
      d.financialStatus,
      `"${d.collectorName}"`,
      `"${d.collectedAt}"`,
      `"${d.unitDetails || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `JAUS2026_Donation_Records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
              Donation Records & Audit Ledger
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-slate-200">
              Permanent Audit Trail
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
            Financial records are never deleted. All corrections, reversals, and cancellations are permanently auditable.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto uppercase tracking-wider"
        >
          <Download className="w-4 h-4" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search donor, receipt no., mobile, collector..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="all">All Payment Methods</option>
              <option value="Cash">Physical Cash</option>
              <option value="UPI">UPI / Online</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="all">All Financial Statuses</option>
              <option value="Pending">Pending Cash Approval</option>
              <option value="Approved">Approved (Treasurer Verified)</option>
              <option value="Completed">Completed (UPI Verified)</option>
              <option value="Corrected">Corrected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3.5">Receipt No. & Date</th>
                <th className="py-2.5 px-3.5">Donor & Premises</th>
                <th className="py-2.5 px-3.5">Amount & Mode</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5">Volunteer Collector</th>
                <th className="py-2.5 px-3.5 text-right">Audit & Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3.5">
                    <div className="font-mono font-bold text-slate-800">{d.receiptNumber}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">{d.collectedAt}</div>
                  </td>

                  <td className="py-2.5 px-3.5">
                    <div className="font-bold text-slate-800 uppercase tracking-tight text-xs">{d.donorName}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                      {d.unitDetails || 'General Patron'} • {d.donorMobile}
                    </div>
                  </td>

                  <td className="py-2.5 px-3.5">
                    <div className="font-mono font-bold text-slate-800 text-xs sm:text-sm">
                      ₹{(d.amount || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider font-semibold mt-0.5">
                      <span>{d.paymentMethod}</span>
                      {d.transactionId && <span className="font-mono text-[9px] text-slate-400">({d.transactionId.slice(-6)})</span>}
                    </div>
                  </td>

                  <td className="py-2.5 px-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      d.financialStatus === 'Approved' || d.financialStatus === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : d.financialStatus === 'Pending'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : d.financialStatus === 'Corrected'
                        ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {d.financialStatus === 'Approved' || d.financialStatus === 'Completed' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : d.financialStatus === 'Pending' ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      <span>{d.financialStatus}</span>
                    </span>
                  </td>

                  <td className="py-2.5 px-3.5 text-slate-600">
                    <div className="font-medium text-slate-800">{d.collectorName}</div>
                    {d.approvedByName && (
                      <div className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider mt-0.5">
                        Approved: {d.approvedByName}
                      </div>
                    )}
                  </td>

                  <td className="py-2.5 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Receipt */}
                      <button
                        type="button"
                        onClick={() => setActiveReceipt(d)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md text-xs transition-colors"
                        title="View Official Receipt"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* WhatsApp Dispatch */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveWhatsApp({
                            phone: d.donorMobile,
                            text: `🙏 *JAI AMBE UTSAV SAMITI (JAUS 2026)* 🙏\n*DONATION RECEIPT*\n\nReceipt: ${d.receiptNumber}\nDonor: ${d.donorName}\nAmount: ₹${d.amount}\nMode: ${d.paymentMethod}\nStatus: ${d.financialStatus}\n\nJai Mata Di! ✨`,
                            title: `WhatsApp: ${d.receiptNumber}`
                          });
                        }}
                        className="p-1.5 hover:bg-emerald-50 text-emerald-700 rounded-md text-xs transition-colors"
                        title="Resend WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      {/* View Audit Trail */}
                      <button
                        type="button"
                        onClick={() => setSelectedAuditRecord(d)}
                        className="p-1.5 hover:bg-indigo-50 text-indigo-700 rounded-md text-xs transition-colors"
                        title="View Full Audit History"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      {/* Financial Correction */}
                      {d.financialStatus !== 'Cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleStartCorrection(d)}
                          className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-md text-xs transition-colors"
                          title="Audit Correction"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {/* Cancellation */}
                      {d.financialStatus !== 'Cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleStartCancel(d)}
                          className="p-1.5 hover:bg-rose-50 text-rose-700 rounded-md text-xs transition-colors"
                          title="Cancel Transaction"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Audit History Modal */}
      {selectedAuditRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider">Permanent Audit Trail</h3>
                <p className="text-[10px] text-slate-400 font-mono">{selectedAuditRecord.receiptNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditRecord(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <div className="font-bold text-slate-800 uppercase tracking-tight">{selectedAuditRecord.donorName}</div>
                <div className="text-slate-600 mt-0.5 text-[11px]">
                  Amount: ₹{(selectedAuditRecord.amount || 0).toLocaleString('en-IN')} • {selectedAuditRecord.paymentMethod} • Status: {selectedAuditRecord.financialStatus}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-2">
                  Chronological Audit Log
                </h4>
                <div className="space-y-2">
                  {selectedAuditRecord.auditTrail.map((log) => (
                    <div key={log.id} className="p-3 bg-white border border-slate-200 rounded-md space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">{log.action}</span>
                        <span className="font-mono text-[9px] text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{log.details}</p>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                        By: <strong className="text-slate-700">{log.performedByName}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAuditRecord(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md font-bold text-slate-700 text-xs uppercase tracking-wider"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Financial Correction Modal */}
      {correctingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm uppercase tracking-wider">Audit Correction</h3>
              <button
                type="button"
                onClick={() => setCorrectingRecord(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyCorrection} className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-medium">
                Corrections do not overwrite the permanent ledger. An audited version is created and authorized with your PIN.
              </p>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Donor Full Name</label>
                <input
                  type="text"
                  value={correctDonorName}
                  onChange={(e) => setCorrectDonorName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Corrected Amount (₹)</label>
                <input
                  type="number"
                  value={correctAmount}
                  onChange={(e) => setCorrectAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Justification / Audit Reason *</label>
                <textarea
                  value={correctReason}
                  onChange={(e) => setCorrectReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Spelling error corrected upon donor request, verified by Treasurer..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCorrectingRecord(null)}
                  className="px-3.5 py-1.5 bg-slate-100 rounded-md font-bold text-slate-700 text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-xs uppercase tracking-wider shadow-sm"
                >
                  Authorize Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-rose-900 px-5 py-3.5 text-white flex items-center justify-between border-b border-rose-800">
              <h3 className="font-bold text-sm uppercase tracking-wider">Receipt Cancellation</h3>
              <button
                type="button"
                onClick={() => setCancellingRecord(null)}
                className="text-rose-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyCancel} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-800 text-[10px] leading-snug">
                <strong>Permanent Record Notice:</strong> This receipt ({cancellingRecord.receiptNumber}) will be marked as "Cancelled" and removed from active totals, but retained in the audit ledger. Requires Treasurer PIN authentication.
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Cancellation Reason *</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Accidental duplicate entry, cash refunded to donor..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancellingRecord(null)}
                  className="px-3.5 py-1.5 bg-slate-100 rounded-md font-bold text-slate-700 text-xs uppercase tracking-wider"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-md font-bold text-xs uppercase tracking-wider shadow-sm"
                >
                  Authorize Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
