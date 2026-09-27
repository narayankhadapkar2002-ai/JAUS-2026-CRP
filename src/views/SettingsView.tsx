import React, { useState } from 'react';
import { 
  Building2, 
  Shield, 
  Coins, 
  FileText, 
  Lock, 
  Check, 
  History, 
  AlertTriangle, 
  UserCheck, 
  Sparkles,
  KeyRound,
  Printer,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Eye,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReceiptTemplate } from '../types';

interface SettingsViewProps {
  initialTab?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialTab = 'org' }) => {
  const { 
    settings, 
    updateSettings, 
    members, 
    designateTreasurer, 
    auditLogs, 
    currentUser, 
    requestPinAuth,
    updateMemberProfile,
    receiptTemplates,
    addReceiptTemplate,
    updateReceiptTemplate,
    deleteReceiptTemplate,
    setDefaultReceiptTemplate
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>(
    initialTab.startsWith('settings-') ? initialTab.replace('settings-', '') : 'org'
  );

  // Org profile state
  const [samitiName, setSamitiName] = useState(settings.samitiName);
  const [regNo, setRegNo] = useState(settings.registrationNumber);
  const [address, setAddress] = useState(settings.address);
  const [foundedYear, setFoundedYear] = useState(settings.foundedYear);
  const [upiId, setUpiId] = useState(settings.upiId);
  const [footerNote, setFooterNote] = useState(settings.receiptFooterNote);
  const [savedSuccess, setSavedSuccess] = useState('');

  // PIN Change state
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  const isAdmin = currentUser?.category === 'CM';

  // Receipt Template Management State
  const [isEditingTemplate, setIsEditingTemplate] = useState<boolean>(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateHeaderTitle, setTemplateHeaderTitle] = useState('');
  const [templateSubHeader, setTemplateSubHeader] = useState('');
  const [templateRegText, setTemplateRegText] = useState('');
  const [templateFooterBlessing, setTemplateFooterBlessing] = useState('');
  const [templateSignatoryTitle, setTemplateSignatoryTitle] = useState('');
  const [templateTaxExemption, setTemplateTaxExemption] = useState('');
  const [templateIsDefault, setTemplateIsDefault] = useState(false);
  const [templateSavedMsg, setTemplateSavedMsg] = useState('');

  const handleOpenAddTemplate = () => {
    setEditingTemplateId(null);
    setTemplateName('Navratri 2026 Special Receipt');
    setTemplateHeaderTitle(settings.samitiName || 'JAI AMBE UTSAV SAMITI');
    setTemplateSubHeader('39th Grand Navratri Mahotsav 2026');
    setTemplateRegText(`Regd. No: ${settings.registrationNumber || 'MH/2004/GBBSD/1489'} • Estd. ${settings.foundedYear || 1987}`);
    setTemplateFooterBlessing(settings.receiptFooterNote || 'May Maa Ambe shower divine blessings, health, and prosperity on your family.');
    setTemplateSignatoryTitle('Hon. Treasurer & President');
    setTemplateTaxExemption('Contributions are eligible for tax benefit under Section 80G.');
    setTemplateIsDefault(false);
    setIsEditingTemplate(true);
  };

  const handleOpenEditTemplate = (tmpl: ReceiptTemplate) => {
    setEditingTemplateId(tmpl.id);
    setTemplateName(tmpl.name);
    setTemplateHeaderTitle(tmpl.headerTitle);
    setTemplateSubHeader(tmpl.subHeader);
    setTemplateRegText(tmpl.registrationText);
    setTemplateFooterBlessing(tmpl.footerBlessing);
    setTemplateSignatoryTitle(tmpl.signatoryTitle);
    setTemplateTaxExemption(tmpl.taxExemptionNote || '');
    setTemplateIsDefault(tmpl.isDefault);
    setIsEditingTemplate(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Only Committee Members / Admins can modify receipt templates.');
      return;
    }
    if (!templateName.trim() || !templateHeaderTitle.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    if (editingTemplateId) {
      updateReceiptTemplate(editingTemplateId, {
        name: templateName.trim(),
        headerTitle: templateHeaderTitle.trim(),
        subHeader: templateSubHeader.trim(),
        registrationText: templateRegText.trim(),
        footerBlessing: templateFooterBlessing.trim(),
        signatoryTitle: templateSignatoryTitle.trim(),
        taxExemptionNote: templateTaxExemption.trim(),
        isDefault: templateIsDefault
      });
      if (templateIsDefault) {
        setDefaultReceiptTemplate(editingTemplateId);
      }
      setTemplateSavedMsg('Receipt template updated successfully!');
    } else {
      addReceiptTemplate({
        name: templateName.trim(),
        isDefault: templateIsDefault,
        headerTitle: templateHeaderTitle.trim(),
        subHeader: templateSubHeader.trim(),
        registrationText: templateRegText.trim(),
        footerBlessing: templateFooterBlessing.trim(),
        signatoryTitle: templateSignatoryTitle.trim(),
        taxExemptionNote: templateTaxExemption.trim()
      });
      setTemplateSavedMsg('New receipt template created successfully!');
    }

    setIsEditingTemplate(false);
    setEditingTemplateId(null);
    setTimeout(() => setTemplateSavedMsg(''), 4000);
  };

  const handleSetDefault = (id: string) => {
    if (!isAdmin) {
      alert('Only Committee Members / Admins can set default template.');
      return;
    }
    setDefaultReceiptTemplate(id);
    setTemplateSavedMsg('Default receipt template updated!');
    setTimeout(() => setTemplateSavedMsg(''), 3000);
  };

  const handleDeleteTemplate = (id: string) => {
    if (!isAdmin) {
      alert('Only Committee Members / Admins can delete receipt templates.');
      return;
    }
    if (receiptTemplates.length <= 1) {
      alert('At least one receipt template must be kept in the system.');
      return;
    }
    const tmpl = receiptTemplates.find(t => t.id === id);
    if (tmpl?.isDefault) {
      alert('Default template cannot be deleted. Please set another template as default first.');
      return;
    }
    if (confirm(`Are you sure you want to delete template "${tmpl?.name}"?`)) {
      deleteReceiptTemplate(id);
      setTemplateSavedMsg('Receipt template deleted.');
      setTimeout(() => setTemplateSavedMsg(''), 3000);
    }
  };

  const handleSaveOrgSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      samitiName,
      registrationNumber: regNo,
      address,
      foundedYear,
      upiId,
      receiptFooterNote: footerNote
    });
    setSavedSuccess('Organization settings updated successfully.');
    setTimeout(() => setSavedSuccess(''), 4000);
  };

  const handleToggleTreasurer = async (memberId: string, currentVal: boolean) => {
    if (!isAdmin) {
      alert('Only Committee Members / Admins can designate Treasurers.');
      return;
    }

    const member = members.find(m => m.id === memberId);
    const authed = await requestPinAuth({
      title: currentVal ? 'Revoke Treasurer Status' : 'Appoint Designated Treasurer',
      description: `Authorize financial signing authority for ${member?.fullName}`,
      actionName: 'Treasurer Designation',
      requiredRole: 'Admin'
    });

    if (authed) {
      designateTreasurer(memberId, !currentVal);
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMsg('');
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinChangeMsg('PIN must be exactly 4 numeric digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeMsg('PIN confirmation does not match.');
      return;
    }

    if (currentUser) {
      updateMemberProfile(currentUser.id, { pin: newPin });
      setPinChangeMsg('Your 4-digit security PIN has been updated successfully!');
      setNewPin('');
      setConfirmPin('');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
          System Administration & Settings
        </h1>
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
          Organization profile, designated treasurer appointments, receipt styling, and permanent audit logs.
        </p>
      </div>

      {/* Tabs */}
      <div className="p-1 bg-slate-100 border border-slate-200 rounded-md flex flex-wrap gap-1 text-xs font-bold uppercase tracking-wider max-w-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('org')}
          className={`px-3 py-1.5 rounded transition-all text-[11px] ${
            activeTab === 'org' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Samiti Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('treasurers')}
          className={`px-3 py-1.5 rounded transition-all text-[11px] ${
            activeTab === 'treasurers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Treasurer Roles
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('receipts')}
          className={`px-3 py-1.5 rounded transition-all text-[11px] ${
            activeTab === 'receipts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Receipt Template
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-3 py-1.5 rounded transition-all text-[11px] ${
            activeTab === 'security' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Security & Audit Logs
        </button>
      </div>

      {/* Tab 1: Organization Profile */}
      {activeTab === 'org' && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-sm max-w-3xl">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-1">Organization Profile</h3>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-5">
            Details appear on official receipts, WhatsApp slips, and government audit submissions.
          </p>

          {savedSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{savedSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveOrgSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Samiti Official Name</label>
              <input
                type="text"
                value={samitiName}
                onChange={(e) => setSamitiName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Charity Registration Number</label>
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Founded Year</label>
                <input
                  type="number"
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Registered Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Official Samiti UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="jaus.mandal@okhdfcbank"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Receipt Footer Note / Blessing</label>
              <input
                type="text"
                value={footerNote}
                onChange={(e) => setFooterNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-medium"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
              >
                Save Organization Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Treasurer Roles */}
      {activeTab === 'treasurers' && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-sm max-w-4xl space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Designated Treasurers</h3>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
              Only members explicitly designated as Treasurer by Admin can approve physical cash collections and cancel receipts.
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {members.map(m => (
              <div key={m.id} className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {m.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{m.fullName}</span>
                      <span className="font-mono text-[10px] text-slate-400">({m.category})</span>
                      {m.isTreasurer && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[9px] font-bold uppercase tracking-wider border border-emerald-200">
                          Official Treasurer
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{m.mobile} • {m.responsibilities[0]}</div>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleToggleTreasurer(m.id, !!m.isTreasurer)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors shadow-xs ${
                      m.isTreasurer
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {m.isTreasurer ? 'Revoke Authority' : 'Designate as Treasurer'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Receipt Templates Management (Add & Edit) */}
      {activeTab === 'receipts' && (
        <div className="space-y-6 max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>Official Receipt Templates</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                Configure headers, registration info, blessing footers, and signatories for physical & WhatsApp donation receipts.
              </p>
            </div>
            {isAdmin && !isEditingTemplate && (
              <button
                type="button"
                onClick={handleOpenAddTemplate}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Receipt Template</span>
              </button>
            )}
          </div>

          {templateSavedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{templateSavedMsg}</span>
            </div>
          )}

          {/* ADD / EDIT TEMPLATE MODAL / FORM */}
          {isEditingTemplate && (
            <div className="bg-white rounded-xl border-2 border-indigo-200 p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-xs">
                    {editingTemplateId ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                    {editingTemplateId ? 'Edit Receipt Template' : 'Add New Receipt Template'}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsEditingTemplate(false); setEditingTemplateId(null); }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Template Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g. Navratri 2026 Standard Receipt"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Header Title (Organization Name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={templateHeaderTitle}
                      onChange={(e) => setTemplateHeaderTitle(e.target.value)}
                      placeholder="e.g. JAI AMBE UTSAV SAMITI"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Festival / Sub-header Title
                    </label>
                    <input
                      type="text"
                      value={templateSubHeader}
                      onChange={(e) => setTemplateSubHeader(e.target.value)}
                      placeholder="e.g. 39th Grand Navratri Mahotsav 2026"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Charity Registration & Estd. Line
                    </label>
                    <input
                      type="text"
                      value={templateRegText}
                      onChange={(e) => setTemplateRegText(e.target.value)}
                      placeholder="e.g. Regd. No: MH/2004/GBBSD/1489 • Estd. 1987"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Signatory Designation Line
                    </label>
                    <input
                      type="text"
                      value={templateSignatoryTitle}
                      onChange={(e) => setTemplateSignatoryTitle(e.target.value)}
                      placeholder="e.g. Hon. Treasurer & General Secretary"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Tax Exemption / 80G Note
                    </label>
                    <input
                      type="text"
                      value={templateTaxExemption}
                      onChange={(e) => setTemplateTaxExemption(e.target.value)}
                      placeholder="e.g. Eligible for 80G tax exemption / Registered under Maharashtra Public Trusts Act"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Footer Blessing / Spiritual Inscription
                  </label>
                  <textarea
                    rows={2}
                    value={templateFooterBlessing}
                    onChange={(e) => setTemplateFooterBlessing(e.target.value)}
                    placeholder="e.g. May Maa Ambe shower divine blessings, health, and prosperity on your family."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="templateIsDefaultCheckbox"
                    checked={templateIsDefault}
                    onChange={(e) => setTemplateIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="templateIsDefaultCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    Make this the default receipt template for all newly recorded Vargani receipts
                  </label>
                </div>

                {/* Live Preview Box */}
                <div className="mt-4 p-4 rounded-xl bg-amber-50/40 border border-amber-200/80 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                    <span>Live Receipt Header & Footer Preview</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-amber-900/10 shadow-2xs text-center space-y-1">
                    <div className="inline-block bg-amber-800 text-amber-50 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {templateSubHeader || 'Navratri Mahotsav 2026'}
                    </div>
                    <div className="font-serif font-black text-sm text-amber-950 tracking-tight">
                      {templateHeaderTitle || 'JAI AMBE UTSAV SAMITI'}
                    </div>
                    <div className="text-[10px] text-amber-900/80 font-mono">
                      {templateRegText || 'Regd. No: MH/2004/GBBSD/1489 • Estd. 1987'}
                    </div>
                    <div className="my-2 border-t border-dashed border-amber-300/60" />
                    <div className="text-[10px] italic text-slate-600">
                      "{templateFooterBlessing || 'May Maa Durga shower divine blessings on your family.'}"
                    </div>
                    {templateTaxExemption && (
                      <div className="text-[9px] text-slate-500 font-mono">
                        {templateTaxExemption}
                      </div>
                    )}
                    <div className="pt-2 flex justify-between items-center text-[9px] text-slate-500 px-4">
                      <span>Donor Signature</span>
                      <span className="font-bold text-slate-700">{templateSignatoryTitle || 'Designated Treasurer'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setIsEditingTemplate(false); setEditingTemplateId(null); }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs rounded-lg shadow-sm transition-colors"
                  >
                    {editingTemplateId ? 'Save Changes' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TEMPLATES LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {receiptTemplates.map((tmpl) => (
              <div 
                key={tmpl.id}
                className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                  tmpl.isDefault ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{tmpl.name}</h4>
                        {tmpl.isDefault && (
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-indigo-600 text-indigo-600" />
                            <span>Default</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {tmpl.id}</div>
                    </div>
                  </div>

                  {/* Card Mini Preview */}
                  <div className="p-3 bg-amber-50/30 rounded-lg border border-amber-900/10 space-y-1 text-xs">
                    <div className="font-serif font-bold text-amber-950 text-xs truncate">
                      {tmpl.headerTitle}
                    </div>
                    <div className="text-[10px] text-amber-900 font-medium truncate">
                      {tmpl.subHeader}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono truncate">
                      {tmpl.registrationText}
                    </div>
                    <div className="text-[10px] italic text-slate-600 line-clamp-2 mt-1">
                      "{tmpl.footerBlessing}"
                    </div>
                    {tmpl.taxExemptionNote && (
                      <div className="text-[9px] text-emerald-700 font-mono truncate mt-0.5">
                        ✓ {tmpl.taxExemptionNote}
                      </div>
                    )}
                    <div className="text-[9px] text-slate-500 pt-1 font-medium">
                      Signatory: <span className="font-bold text-slate-700">{tmpl.signatoryTitle}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isAdmin && (
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      {!tmpl.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(tmpl.id)}
                          className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-md border border-slate-200 transition-colors"
                        >
                          Set as Default
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditTemplate(tmpl)}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {!tmpl.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(tmpl.id)}
                          className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md flex items-center gap-1 transition-colors"
                          title="Delete template"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Architecture Details Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-800">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">Receipt Design & Numbering Architecture:</h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 font-medium">
              <li>Receipt Number Format: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">YEAR-CAMPAIGN-SEQUENCE</code> (e.g. <strong>JAUS26-VG-0001</strong>).</li>
              <li>Receipt Types: Instant Physical/Digital Vargani Donation Receipts and Pending Payment Commitment Slips.</li>
              <li>Dual Signature: Volunteer Collector sign-off and Official Designated Treasurer sign-off.</li>
              <li>Digital Instant WhatsApp Receipt Dispatch with real-time delivery confirmation.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Audit Logs */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change PIN Box */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-sm max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Update Your 4-Digit Security PIN</h3>
            </div>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-4">
              Used for authorizing cash approvals, member edits, and audit cancellations.
            </p>

            {pinChangeMsg && (
              <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-md font-medium">
                {pinChangeMsg}
              </div>
            )}

            <form onSubmit={handleChangePin} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">New 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono text-center tracking-widest text-base font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Confirm New PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono text-center tracking-widest text-base font-bold"
                  required
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs rounded-md shadow-sm transition-colors"
                >
                  Update PIN
                </button>
              </div>
            </form>
          </div>

          {/* Chronological Audit Trail */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Global Audit Trail</h3>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Immutable chronological log of all sensitive and financial operations</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-700">
                {auditLogs.length} Events Recorded
              </span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg max-h-96 overflow-y-auto">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 text-xs flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{log.action}</span>
                      <span className="font-mono text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{log.entityId}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{log.details}</p>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">
                      Authorized By: <strong className="text-slate-700">{log.performedByName}</strong>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
