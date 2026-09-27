import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Users, 
  Briefcase, 
  Edit3, 
  Check, 
  X, 
  Camera, 
  QrCode, 
  KeyRound, 
  Sparkles, 
  Clock, 
  Share2,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Member, Gender } from '../types';

export const UserInformationView: React.FC = () => {
  const { currentUser, updateMemberProfile, teams, setActiveWhatsApp, settings } = useApp();

  if (!currentUser) return null;

  // Editing personal info states
  const [isEditing, setIsEditing] = useState(false);
  const [mobile, setMobile] = useState(currentUser.mobile);
  const [address, setAddress] = useState(currentUser.address);
  const [dob, setDob] = useState(currentUser.dob || '1990-01-01');
  const [gender, setGender] = useState<Gender>(currentUser.gender || 'Male');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pinChangeOpen, setPinChangeOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinFeedback, setPinFeedback] = useState('');

  // User's assigned teams
  const userTeams = teams.filter(t => 
    currentUser.assignedTeams?.includes(t.id) || 
    t.memberIds?.includes(currentUser.id) || 
    t.leaders?.includes(currentUser.id)
  );

  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case 'CM':
        return {
          title: 'Committee Member',
          badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          desc: 'Highest organizational category. Committee Members have Admin-level access.'
        };
      case 'SB':
        return {
          title: 'Sabhasad',
          badge: 'bg-purple-100 text-purple-900 border-purple-300',
          desc: 'Second organizational category. General council member & society patron.'
        };
      case 'KY':
        return {
          title: 'Karyakarta',
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          desc: 'Third organizational category. Active core volunteer & field operations.'
        };
      case 'YK':
        return {
          title: 'Yuva Karyakarta',
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          desc: 'Fourth organizational category. Intended age range: 18–35 years (not strictly enforced).'
        };
      default:
        return {
          title: 'Active Member',
          badge: 'bg-slate-100 text-slate-800 border-slate-300',
          desc: 'Active participant in JAUS 2026'
        };
    }
  };

  const catInfo = getCategoryDetails(currentUser.category);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    updateMemberProfile(currentUser.id, {
      mobile: cleanMobile,
      address,
      dob,
      gender,
      avatarUrl
    });

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdatePin = () => {
    if (!/^\d{4}$/.test(newPin)) {
      setPinFeedback('PIN must be exactly 4 digits');
      return;
    }
    updateMemberProfile(currentUser.id, { pin: newPin });
    setPinFeedback('Security PIN updated successfully!');
    setNewPin('');
    setTimeout(() => {
      setPinChangeOpen(false);
      setPinFeedback('');
    }, 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Banner / Notification */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Your personal profile information has been successfully updated across all devices.</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cover Strip */}
        <div className="h-32 bg-gradient-to-r from-amber-700 via-amber-800 to-orange-600 relative">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-3 right-4 flex items-center gap-2">
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white font-mono text-xs font-bold border border-white/30">
              JAUS 2026 ERP
            </span>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-12 gap-4 pb-4 border-b border-slate-100">
            {/* Avatar & Identifiers */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1 shadow-md border-2 border-amber-500/40">
                  <div className="w-full h-full rounded-xl overflow-hidden bg-amber-50 flex items-center justify-center text-amber-800 font-bold text-3xl">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.fullName.charAt(0)
                    )}
                  </div>
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Enter image URL for profile photo:', currentUser.avatarUrl || '');
                      if (url !== null) setAvatarUrl(url);
                    }}
                    className="absolute bottom-1 right-1 p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md transition-transform active:scale-95"
                    title="Change Photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {currentUser.fullName}
                  </h1>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${catInfo.badge}`}>
                    {currentUser.category} • {catInfo.title}
                  </span>
                  {currentUser.isTreasurer && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      Treasurer Sign-off
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                    ID: {currentUser.id}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${currentUser.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>Status: <strong>{currentUser.status}</strong></span>
                  </span>
                  <span>•</span>
                  <span>Joined: {currentUser.joinedDate || '2026-08-01'}</span>
                </div>
              </div>
            </div>

            {/* Edit / Cancel Toggle Button */}
            <div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4 text-amber-700" />
                  <span>Edit Personal Info</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Approval Review Banner */}
          {currentUser.categoryApprovalStatus === 'Pending' && (
            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
              <span className="text-sm shrink-0">⏳</span>
              <div>
                <div className="font-bold uppercase tracking-wider text-[11px] text-amber-900">
                  Requested Category Pending Committee Review
                </div>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  During self-registration you requested <strong>{getCategoryDetails(currentUser.requestedCategory || currentUser.category).title}</strong>. Your account is operating provisionally as <strong>{catInfo.title}</strong> until reviewed by an Admin / Committee Member.
                </p>
              </div>
            </div>
          )}

          {currentUser.categoryApprovalStatus === 'Rejected' && (
            <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-950 text-xs flex items-start gap-2.5">
              <span className="text-sm shrink-0">ℹ️</span>
              <div>
                <div className="font-bold uppercase tracking-wider text-[11px] text-rose-900">
                  Assigned Category: Karyakarta
                </div>
                <p className="text-[11px] text-rose-800 mt-0.5">
                  Your requested higher category was reviewed by the Committee and assigned as <strong>Karyakarta</strong>. In accordance with Samiti protocol, your member account and history remain preserved and fully active.
                </p>
              </div>
            </div>
          )}

          {/* Form or Display View */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 mb-4">
                <p className="text-xs text-amber-900 font-medium">
                  ✏️ You can edit your permitted contact details, address, and profile photo. Official membership category ({currentUser.category}) and team appointments are managed by Samiti Admins.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Full Name (Official Record)</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.fullName}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
                  />
                  <span className="text-[10px] text-slate-400">Name is locked to Samiti registration.</span>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Member ID</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.id}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden font-medium bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Avatar / Photo URL</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Residential Address / Wing & Flat *</label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Wing, Flat Number, Society, Borivali West, Mumbai"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          ) : (
            /* Read-only Detailed Grid */
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Mobile */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mobile Phone</span>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-800 font-mono">
                  +91 {currentUser.mobile}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">Verified for OTP Login</span>
              </div>

              {/* Date of Birth & Gender */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Birth Date & Gender</span>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {currentUser.dob || 'Not specified'} • {currentUser.gender}
                </p>
                <span className="text-[10px] text-slate-400">Registered with Mandal</span>
              </div>

              {/* Address */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Premises Address</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-800 line-clamp-2">
                  {currentUser.address || 'Borivali West, Mumbai 400092'}
                </p>
              </div>

              {/* Responsibilities */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                  <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                  <span>Designations & Responsibilities</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {currentUser.responsibilities && currentUser.responsibilities.length > 0 ? (
                    currentUser.responsibilities.map((r, i) => (
                      <span key={i} className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-xs">
                        ⭐ {r}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">General Member / Volunteer</span>
                  )}
                </div>
              </div>

              {/* Assigned Teams */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>Assigned Teams</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {userTeams.length > 0 ? (
                    userTeams.map(t => (
                      <span key={t.id} className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-semibold text-[11px]">
                        {t.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Not assigned to specific team</span>
                  )}
                </div>
              </div>

              {/* Rule 6: Category vs Special Designation */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 sm:col-span-2 lg:col-span-3 text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold uppercase tracking-wider text-[11px]">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>Hierarchy Rule 6: Category & Special Designation Separation</span>
                </div>
                <p className="text-amber-900 mt-1 leading-relaxed">
                  Your organizational category (<strong>{catInfo.title}</strong>) represents your tier in the 4-level hierarchy. Special designations (such as {currentUser.isTreasurer ? <strong className="text-emerald-800">Official Treasurer (Cash Approval Authority)</strong> : 'Field roles'}) are distinct concepts assigned by Admins. <em>For example, Sabhasad does not automatically mean Treasurer.</em>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security & Digital Identity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Digital Samiti Pass Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-md border border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Official Mandal Identity</span>
                <h3 className="font-bold text-sm text-white">Jai Ambe Utsav Samiti 2026</h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs">
                🪔
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-600 overflow-hidden flex items-center justify-center font-bold text-xl text-amber-400 shrink-0">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
                ) : (
                  currentUser.fullName.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-mono">PASS ID: {currentUser.id}</p>
                <h4 className="text-base font-bold text-white truncate">{currentUser.fullName}</h4>
                <p className="text-xs text-amber-300 font-semibold">{catInfo.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{currentUser.address}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 font-mono text-[11px]">VALID: NAVRATRI 2026</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              VERIFIED ACTIVE
            </span>
          </div>
        </div>

        {/* Security & PIN Settings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Security & Authentication</h3>
                  <p className="text-[11px] text-slate-500">4-digit PIN for cash approvals & collection verification</p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-slate-800">4-Digit Security PIN</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Used to verify cash entries & sensitive transactions</p>
                </div>
                <span className="font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                  ••••
                </span>
              </div>

              {pinChangeOpen ? (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                  <label className="block font-bold text-amber-900">Set New 4-Digit PIN</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234"
                      className="w-28 p-2 rounded-lg border border-amber-300 text-center font-mono font-bold text-sm tracking-widest bg-white outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleUpdatePin}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors"
                    >
                      Save PIN
                    </button>
                    <button
                      type="button"
                      onClick={() => setPinChangeOpen(false)}
                      className="px-2 py-2 text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                  {pinFeedback && (
                    <p className="text-[11px] font-semibold text-amber-900">{pinFeedback}</p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPinChangeOpen(true)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                >
                  Change 4-Digit Security PIN
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span>Biometric Prompt Active</span>
            </div>
            <span className="text-emerald-700 font-semibold">Ready on Mobile & PC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
