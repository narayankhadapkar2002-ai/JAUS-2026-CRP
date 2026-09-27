import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, Copy, Check, X, Smartphone, CheckCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WhatsAppModal: React.FC = () => {
  const { activeWhatsApp, setActiveWhatsApp } = useApp();
  const [copied, setCopied] = useState(false);
  const [isSentSimulated, setIsSentSimulated] = useState(false);

  const [selectedLang, setSelectedLang] = useState<'Marathi' | 'Hindi' | 'English'>('Marathi');

  useEffect(() => {
    if (activeWhatsApp?.initialLanguage) {
      setSelectedLang(activeWhatsApp.initialLanguage as 'Marathi' | 'Hindi' | 'English');
    } else {
      setSelectedLang('Marathi');
    }
  }, [activeWhatsApp]);

  if (!activeWhatsApp) return null;

  const hasMultilingual = !!activeWhatsApp.multilingual && (
    !!activeWhatsApp.multilingual.marathi || 
    !!activeWhatsApp.multilingual.hindi || 
    !!activeWhatsApp.multilingual.english
  );

  const currentMessageBody = hasMultilingual && activeWhatsApp.multilingual
    ? (selectedLang === 'Marathi' 
        ? activeWhatsApp.multilingual.marathi 
        : selectedLang === 'Hindi' 
          ? activeWhatsApp.multilingual.hindi 
          : activeWhatsApp.multilingual.english)
    : activeWhatsApp.text;

  const prefixHeader = '🌐 भाषा / Language: मराठी | हिंदी | English';
  const fullTextToShare = hasMultilingual 
    ? `${prefixHeader}\n\n${currentMessageBody}`
    : activeWhatsApp.text;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullTextToShare);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanPhone = activeWhatsApp.phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(fullTextToShare);
  const whatsappWebUrl = cleanPhone 
    ? `https://web.whatsapp.com/send?phone=91${cleanPhone.slice(-10)}&text=${encodedText}`
    : `https://web.whatsapp.com/send?text=${encodedText}`;
  
  const whatsappDirectUrl = cleanPhone
    ? `https://api.whatsapp.com/send?phone=91${cleanPhone.slice(-10)}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - WhatsApp Green theme */}
        <div className="bg-emerald-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">{activeWhatsApp.title || 'WhatsApp Dispatch'}</h3>
              <p className="text-xs text-emerald-100">Official JAUS 2026 Notification Service</p>
            </div>
          </div>
          <button 
            onClick={() => { setActiveWhatsApp(null); setIsSentSimulated(false); }}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200">
            <div>
              <span className="font-semibold">Recipient:</span> {activeWhatsApp.phone || 'All Registered'}
            </div>
            <span className="px-2 py-0.5 bg-emerald-200/60 rounded-md font-medium text-emerald-900">
              One-way Broadcast
            </span>
          </div>

          {/* WhatsApp Chat Bubble Simulation with Embedded Language Selector Prefix */}
          <div className="bg-[#efeae2] p-4 rounded-xl border border-slate-200 relative min-h-[160px]">
            <div className="bg-white rounded-lg p-4 shadow-xs max-w-[95%] text-slate-800 text-xs leading-relaxed border border-slate-100 space-y-3">
              {/* EMBEDDED LANGUAGE SELECTOR IN MESSAGE PREFIX */}
              {hasMultilingual && (
                <div className="pb-3 border-b border-slate-100">
                  <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <span>🌐</span>
                    <span>भाषा / Language:</span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Default: मराठी
                    </span>
                  </div>

                  {/* Interactive Button / List Selector mechanism */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSelectedLang('Marathi')}
                      className={`py-1.5 px-2 rounded-md font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
                        selectedLang === 'Marathi'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60'
                      }`}
                    >
                      <span>मराठी</span>
                      {selectedLang === 'Marathi' && <Check className="w-3 h-3" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedLang('Hindi')}
                      className={`py-1.5 px-2 rounded-md font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
                        selectedLang === 'Hindi'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60'
                      }`}
                    >
                      <span>हिंदी</span>
                      {selectedLang === 'Hindi' && <Check className="w-3 h-3" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedLang('English')}
                      className={`py-1.5 px-2 rounded-md font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
                        selectedLang === 'English'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60'
                      }`}
                    >
                      <span>English</span>
                      {selectedLang === 'English' && <Check className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="mt-1 text-[10px] text-slate-400 font-mono">
                    🌐 भाषा / Language: मराठी | हिंदी | English
                  </div>
                </div>
              )}

              {/* Message Content displayed in active language */}
              <div className="whitespace-pre-wrap">
                {currentMessageBody}
              </div>

              <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-end gap-1">
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
              </div>
            </div>
          </div>

          {isSentSimulated && (
            <div className="flex items-center gap-2 p-3 bg-emerald-100 text-emerald-900 text-xs rounded-xl font-medium">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>WhatsApp message delivered successfully to donor's chat!</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2 justify-between items-center">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-2 rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsSentSimulated(true)}
              className="px-4 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              <span>Send via WhatsApp App</span>
            </a>
            <a
              href={whatsappWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsSentSimulated(true)}
              className="px-4 py-2 rounded-xl text-slate-800 bg-emerald-100 hover:bg-emerald-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>WhatsApp Web</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
