import React, { useState, useEffect } from 'react';
import { ShieldCheck, Fingerprint, Delete, AlertCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PinBiometricModal: React.FC = () => {
  const { pinPrompt, submitPin, cancelPin, currentUser } = useApp();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isVerifyingBio, setIsVerifyingBio] = useState<boolean>(false);

  useEffect(() => {
    if (pinPrompt.isOpen) {
      setPin('');
      setError('');
      setIsVerifyingBio(false);
    }
  }, [pinPrompt.isOpen]);

  if (!pinPrompt.isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        // Automatically verify upon 4th digit
        setTimeout(() => {
          const success = submitPin(newPin, false);
          if (!success) {
            setError('Incorrect 4-digit PIN. Try default demo PIN: 1234');
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleBiometricAuth = () => {
    setIsVerifyingBio(true);
    setError('');
    setTimeout(() => {
      setIsVerifyingBio(false);
      const success = submitPin('', true);
      if (!success) {
        setError('Biometric verification failed.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">Security Verification</h3>
              <p className="text-xs text-amber-100">JAUS 2026 Audit Authorization</p>
            </div>
          </div>
          <button 
            onClick={cancelPin}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="text-center mb-5">
            <h4 className="font-medium text-slate-800 text-base">{pinPrompt.title || 'Authorize Operation'}</h4>
            <p className="text-xs text-slate-500 mt-1">{pinPrompt.description || 'Enter your 4-digit security PIN or scan fingerprint.'}</p>
            {pinPrompt.requiredRole && (
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                Requires: {pinPrompt.requiredRole} Authorization
              </span>
            )}
          </div>

          {/* PIN Dots Display */}
          <div className="flex justify-center items-center gap-4 mb-4">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  i < pin.length 
                    ? 'bg-amber-600 scale-110 shadow-xs' 
                    : 'bg-slate-200 border border-slate-300'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-100 animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 10-Key Pad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-12 rounded-xl bg-slate-50 hover:bg-amber-50 active:bg-amber-100 text-slate-800 font-semibold text-lg border border-slate-200 shadow-2xs hover:border-amber-300 transition-all flex items-center justify-center"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 font-medium text-xs border border-slate-200 transition-all flex items-center justify-center"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-12 rounded-xl bg-slate-50 hover:bg-amber-50 active:bg-amber-100 text-slate-800 font-semibold text-lg border border-slate-200 shadow-2xs hover:border-amber-300 transition-all flex items-center justify-center"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-xl bg-slate-50 hover:bg-rose-50 active:bg-rose-100 text-slate-600 font-medium border border-slate-200 transition-all flex items-center justify-center"
            >
              <Delete className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Biometric Touch Option */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBiometricAuth}
              disabled={isVerifyingBio}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Fingerprint className={`w-4 h-4 text-amber-400 ${isVerifyingBio ? 'animate-pulse' : ''}`} />
              <span>{isVerifyingBio ? 'Scanning Fingerprint / Face ID...' : 'Touch to Verify Biometrics'}</span>
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600 px-1">
            <span>User: {currentUser?.fullName || 'Collector'}</span>
            <button 
              type="button"
              onClick={() => { setPin('1234'); setTimeout(() => submitPin('1234', false), 100); }}
              className="text-amber-700 hover:underline font-medium"
            >
              Auto-fill Demo PIN (1234)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
