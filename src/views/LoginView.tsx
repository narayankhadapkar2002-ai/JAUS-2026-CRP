import React, { useState } from 'react';
import { 
  Flame, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  Lock,
  MessageSquare,
  KeyRound,
  Fingerprint
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MemberCategory, Gender } from '../types';

export const LoginView: React.FC = () => {
  const { loginWithMobileOtp, selfRegister, switchUser, members, settings } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpChannel, setOtpChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Self registration fields
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('1995-05-15');
  const [gender, setGender] = useState<Gender>('Male');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<MemberCategory>('KY');
  const [pin, setPin] = useState('1234');
  const [email, setEmail] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const clean = mobile.replace(/\D/g, '');
    if (clean.length < 10) {
      setLoginError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Check if user exists
    const user = members.find(m => m.mobile.replace(/\D/g, '') === clean);
    if (!user) {
      setLoginError('This mobile number is not registered. Please switch to "New Member Registration" tab below.');
      return;
    }

    if (user.status === 'Inactive' || user.status === 'Suspended') {
      setLoginError(`Account Access Blocked: This member profile is currently marked as "${user.status}". Active login is suspended. Contact Committee.`);
      return;
    }

    setOtpSent(true);
    setOtp('123456'); // Pre-fill demo OTP
    setLoginSuccess(`Demo OTP (123456) dispatched via ${otpChannel.toUpperCase()} to ${mobile}`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const result = loginWithMobileOtp(mobile, otp);
    if (!result.success) {
      setLoginError(result.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!fullName.trim() || !mobile.trim() || !address.trim()) {
      setLoginError('Please fill in all mandatory profile fields.');
      return;
    }

    const clean = mobile.replace(/\D/g, '');
    if (clean.length < 10) {
      setLoginError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Check existing
    if (members.some(m => m.mobile.replace(/\D/g, '') === clean)) {
      setLoginError('A member with this mobile number already exists. Please log in.');
      return;
    }

    const res = selfRegister({
      fullName,
      mobile: clean,
      email: email || undefined,
      dob,
      gender,
      address,
      category,
      status: 'Active',
      assignedTeams: ['team-cultural'],
      responsibilities: [
        category === 'CM' ? 'Registered Member (Requested Committee Member)' :
        category === 'SB' ? 'Registered Member (Requested Sabhasad)' :
        category === 'KY' ? 'Registered Member (Requested Karyakarta)' : 'Registered Member (Requested Yuva Karyakarta)'
      ],
      pin: pin || '1234'
    });

    if (!res.success) {
      setLoginError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Mandal Brand Icon */}
        <div className="mx-auto w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm border border-indigo-500">
          <Flame className="w-6 h-6 text-white" />
        </div>
        <h1 className="mt-3 font-bold text-xl sm:text-2xl text-white tracking-tight uppercase">
          JAUS 2026 ERP
        </h1>
        <p className="mt-0.5 text-xs text-slate-400 font-medium uppercase tracking-wider">
          {settings.samitiName}
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-slate-900 text-slate-300 border border-slate-800">
          <span>Navratri Mandal Enterprise Platform</span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-6 sm:px-8 shadow-xl rounded-lg border border-slate-200">
          {/* Toggle Login vs Self-Register */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 border border-slate-200 rounded-md mb-5 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => { setMode('login'); setLoginError(''); }}
              className={`py-1.5 rounded transition-all text-[11px] ${
                mode === 'login' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Member Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setLoginError(''); }}
              className={`py-1.5 rounded transition-all text-[11px] ${
                mode === 'register' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              New Registration
            </button>
          </div>

          {/* Feedback alerts */}
          {loginError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {loginSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{loginSuccess}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <span className="text-xs font-bold">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="98201 12233"
                        className="block w-full pl-12 pr-4 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden font-bold"
                        required
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Mobile number is your primary identity across PC & Mobile.
                    </p>
                  </div>

                  {/* Channel Selection */}
                  <div className="pt-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      OTP Delivery Channel
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOtpChannel('sms')}
                        className={`p-2 rounded-md border text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                          otpChannel === 'sms'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>SMS OTP</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOtpChannel('whatsapp')}
                        className={`p-2 rounded-md border text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                          otpChannel === 'whatsapp'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp OTP</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs rounded-md shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Send Verification OTP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Mobile</span>
                      <span className="font-mono font-bold">+91 {mobile}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-indigo-600 hover:underline font-bold text-[10px] uppercase tracking-wider"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="block w-full py-2 text-center font-mono font-bold tracking-widest text-base bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                      required
                    />
                    <p className="mt-1 text-[10px] text-slate-500 text-center">
                      Auto-filled demo code is <strong>123456</strong>
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs rounded-md shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Access ERP</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Self Registration Form */
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh K. Joshi"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="98200 99887"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Requested Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MemberCategory)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium text-xs"
                  >
                    <option value="CM">1. Committee Member</option>
                    <option value="SB">2. Sabhasad</option>
                    <option value="KY">3. Karyakarta</option>
                    <option value="YK">4. Yuva Karyakarta</option>
                  </select>
                </div>
              </div>

              {/* Requested category guidance notice */}
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <span className="text-xs shrink-0">ℹ️</span>
                <div className="leading-snug space-y-1">
                  <div>
                    <strong>Requested Category:</strong> During self-registration, the category you select is a <strong>requested category</strong>, not automatically the final approved category.
                  </div>
                  <div className="text-[10px] text-amber-800">
                    After registration, an Admin / Committee Member will review your application. They can <strong>Approve</strong>, <strong>Change</strong>, or <strong>Reject</strong> the requested higher category (if rejected, you are assigned as <strong>Karyakarta</strong>).
                  </div>
                  {category === 'YK' && (
                    <div className="font-semibold text-amber-950 pt-0.5">
                      • Yuva Karyakarta intended age range: <strong>18–35 years</strong> (no strict automatic age restriction enforced).
                    </div>
                  )}
                  {category === 'CM' && (
                    <div className="font-semibold text-indigo-900 pt-0.5">
                      • Committee Member is the highest organizational category with Admin-level access. Committee accounts are normally created directly by existing Committee Members; self-registered requests require administrative review.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Residential Address in Samiti Area *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat/Wing, Building Name, Borivali"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    4-Digit Security PIN *
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono text-center tracking-widest"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs rounded-md shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Verify OTP & Register Member ID</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Switcher Section */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 text-center mb-2">
              Instant Demo Evaluator Roles
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => switchUser('JAUS26-CM-001')}
                className="p-2 text-left rounded-md bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors border-l-2 border-l-amber-600"
              >
                <div className="font-bold text-xs">Anand Varma</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-amber-700">CM (Admin Access)</div>
              </button>
              <button
                type="button"
                onClick={() => switchUser('JAUS26-SB-002')}
                className="p-2 text-left rounded-md bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors border-l-2 border-l-emerald-600"
              >
                <div className="font-bold text-xs">Rajesh Patel</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Sabhasad (Treasurer)</div>
              </button>
              <button
                type="button"
                onClick={() => switchUser('JAUS26-KY-003')}
                className="p-2 text-left rounded-md bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors border-l-2 border-l-sky-600"
              >
                <div className="font-bold text-xs">Sunita Sharma</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-sky-700">Karyakarta (Lead)</div>
              </button>
              <button
                type="button"
                onClick={() => switchUser('JAUS26-YK-004')}
                className="p-2 text-left rounded-md bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors border-l-2 border-l-indigo-600"
              >
                <div className="font-bold text-xs">Vikram Deshmukh</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-indigo-700">Yuva Karyakarta</div>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2 font-mono">
              Default 4-digit PIN for all demo accounts: <strong>1234</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
