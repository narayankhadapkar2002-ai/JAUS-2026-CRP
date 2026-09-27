import React, { useState } from 'react';
import { 
  Users, 
  Printer, 
  Download, 
  PieChart, 
  BarChart2, 
  FileText, 
  CheckCircle, 
  Filter 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MemberReportsView: React.FC = () => {
  const { members, teams } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Metrics
  const cmCount = members.filter(m => m.category === 'CM').length;
  const sbCount = members.filter(m => m.category === 'SB').length;
  const kyCount = members.filter(m => m.category === 'KY').length;
  const ykCount = members.filter(m => m.category === 'YK').length;
  const activeCount = members.filter(m => m.status === 'Active').length;

  const filteredMembers = members.filter(m => {
    const matchCat = categoryFilter === 'all' || m.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchCat && matchStatus;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['Member ID', 'Full Name', 'Category', 'Mobile', 'Status', 'Address', 'Responsibilities'];
    const rows = filteredMembers.map(m => [
      m.id,
      `"${m.fullName}"`,
      m.category,
      m.mobile,
      m.status,
      `"${m.address}"`,
      `"${m.responsibilities.join('; ')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JAUS_2026_Member_Census_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
            Member Census & Volunteer Reports
          </h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
            Official demographic registry for Jai Ambe Utsav Samiti (JAUS 2026).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Census Header */}
      <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="text-center pb-4 border-b border-slate-200">
          <h2 className="font-bold text-base sm:text-lg text-slate-900 uppercase tracking-wider">
            Jai Ambe Utsav Samiti • Member Roster
          </h2>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
            Generated on: {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })} • Borivali West, Mumbai
          </p>
        </div>

        {/* Statistical KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-5">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center border-t-2 border-t-amber-600">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Committee (CM)</span>
            <span className="font-bold text-2xl text-slate-900 mt-0.5 block">{cmCount}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center border-t-2 border-t-indigo-600">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Sabhasad (SB)</span>
            <span className="font-bold text-2xl text-slate-900 mt-0.5 block">{sbCount}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center border-t-2 border-t-sky-600">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Karyakarta (KY)</span>
            <span className="font-bold text-2xl text-slate-900 mt-0.5 block">{kyCount}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center border-t-2 border-t-slate-600">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Yuva Karyakarta (YK)</span>
            <span className="font-bold text-2xl text-slate-900 mt-0.5 block">{ykCount}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center border-t-2 border-t-emerald-600 col-span-2 sm:col-span-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Active Volunteers</span>
            <span className="font-bold text-2xl text-emerald-800 mt-0.5 block">{activeCount}</span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4 no-print">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Filter List:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-800 shadow-xs"
          >
            <option value="all">All Hierarchy Categories</option>
            <option value="CM">Committee Member (CM)</option>
            <option value="SB">Sabhasad (SB)</option>
            <option value="KY">Karyakarta (KY)</option>
            <option value="YK">Yuva Karyakarta (YK)</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-800 shadow-xs"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-auto">
            Showing {filteredMembers.length} of {members.length} members
          </span>
        </div>

        {/* Member Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Member ID</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Department / Team</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{m.id}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{m.fullName}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold uppercase tracking-wider border border-slate-200">
                      {m.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{m.mobile}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {teams.find(t => t.id === m.assignedTeams[0])?.name || 'General Operations'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      m.status === 'Active' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-600 bg-slate-100 border-slate-200'
                    }`}>
                      {m.status}
                    </span>
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
