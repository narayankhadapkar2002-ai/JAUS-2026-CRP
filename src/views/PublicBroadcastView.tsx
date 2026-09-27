import React, { useState, useMemo } from 'react';
import { 
  Send, 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Calendar, 
  FileText, 
  Sparkles, 
  Image as ImageIcon, 
  File as FileIcon, 
  Globe, 
  Filter, 
  X, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  Repeat, 
  Building, 
  Coins, 
  Phone, 
  Search, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  PublicBroadcast, 
  BroadcastTemplate, 
  BroadcastLanguage, 
  BroadcastAudienceFilter, 
  BroadcastScheduleType, 
  RecurringInterval 
} from '../types';

interface AudienceRecipient {
  id: string;
  name: string;
  mobile: string;
  type: 'donor' | 'member';
  memberCategory?: 'CM' | 'SB' | 'KY' | 'YK';
  categoryTitle?: string;
  campaignId?: string;
  campaignName?: string;
  buildingName: string;
  unitDetails?: string;
  donationStatus?: 'Donated' | 'Pending Commitment' | 'Visited / General';
  paymentStatus?: 'Completed' | 'Pending' | 'Awaiting Approval';
  amount?: number;
  preferredLanguage: BroadcastLanguage;
}

export const PublicBroadcastView: React.FC = () => {
  const { 
    broadcasts, 
    createPublicBroadcast, 
    updateScheduledBroadcast, 
    cancelScheduledBroadcast, 
    resendBroadcast, 
    templates, 
    saveTemplate, 
    deleteTemplate, 
    donations, 
    pendingPayments, 
    campaigns, 
    members,
    currentUser, 
    setActiveWhatsApp, 
    settings 
  } = useApp();

  // Permitted Sender: Only Admin (CM) and Committee Members
  const isSenderAuthorized = currentUser?.category === 'CM';

  const [activeSubTab, setActiveSubTab] = useState<'create' | 'history' | 'templates' | 'audience'>('create');

  // --- COMPOSER STATE ---
  const [title, setTitle] = useState('');
  
  // Multilingual State: Marathi is default!
  const [activeLanguage, setActiveLanguage] = useState<BroadcastLanguage>('Marathi');
  const [useRecipientLanguage, setUseRecipientLanguage] = useState<boolean>(true);

  // Message bodies for the 3 supported languages
  const [marathiMessage, setMarathiMessage] = useState<string>(
    'जय माता दी! 🙏\n\nसस्नेह जय अंबे,\nजय अंबे उत्सव समिती (JAUS २०२६) तर्फे सर्व देणगीदार व भाविकांना सूचित करण्यात येते की, नवरात्र महोत्सवाची तयारी पूर्ण उत्साहात सुरू आहे.\n\nआपल्या अमूल्य सहकार्याबद्दल धन्यवाद!\n— व्यवस्थापक समिती, जय अंबे उत्सव समिती २०२६'
  );
  const [hindiMessage, setHindiMessage] = useState<string>(
    'जय माता दी! 🙏\n\n सादर जय अम्बे,\nजय अम्बे उत्सव समिति (JAUS 2026) की ओर से सभी दानदाताओं एवं भक्तों को सूचित किया जाता है कि नवरात्रि महोत्सव की तैयारियां पूर्ण उत्साह से जारी हैं।\n\nआपके अमूल्य सहयोग हेतु हार्दिक धन्यवाद!\n— प्रबंध समिति, जय अम्बे उत्सव समिति 2026'
  );
  const [englishMessage, setEnglishMessage] = useState<string>(
    'Jai Mata Di! 🙏\n\nRespected Donor & Patron,\nJai Ambe Utsav Samiti (JAUS 2026) informs all donors that Navratri Mahotsav preparations are in full swing.\n\nThank you for your invaluable patronage and blessings!\n— Managing Committee, Jai Ambe Utsav Samiti 2026'
  );

  // Media Attachment State: Text only, Image/Poster, Document/PDF
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'document'>('none');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaName, setMediaName] = useState<string>('');

  // Audience Filter State (All Donors, Members, Campaign, Building, Donation Status, Payment Status)
  const [audienceFilter, setAudienceFilter] = useState<BroadcastAudienceFilter>('all_donors');
  const [selectedMemberCategory, setSelectedMemberCategory] = useState<'all' | 'CM' | 'SB' | 'KY' | 'YK'>('all');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [selectedBuildingName, setSelectedBuildingName] = useState<string>('Gokul Horizon Residency');
  const [selectedDonationStatus, setSelectedDonationStatus] = useState<'Donated' | 'Pending Commitment' | 'Visited / General'>('Donated');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<'Completed' | 'Pending' | 'Awaiting Approval'>('Completed');

  // Schedule & Recurring State
  const [scheduleType, setScheduleType] = useState<BroadcastScheduleType>('immediate');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('10:00');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringInterval, setRecurringInterval] = useState<RecurringInterval>('weekly');

  // Collapsible audience preview
  const [showAudienceList, setShowAudienceList] = useState<boolean>(false);

  // Modals & Editing
  const [editingBroadcast, setEditingBroadcast] = useState<PublicBroadcast | null>(null);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState<boolean>(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('General');
  const [newTemplateMarathi, setNewTemplateMarathi] = useState('');
  const [newTemplateHindi, setNewTemplateHindi] = useState('');
  const [newTemplateEnglish, setNewTemplateEnglish] = useState('');

  // Search filter for Audience directory tab
  const [audienceSearch, setAudienceSearch] = useState('');
  const [directoryViewType, setDirectoryViewType] = useState<'donors' | 'members'>('donors');

  // Recipient interactive simulation language (Default: Marathi — मराठी)
  const [previewRecipientLang, setPreviewRecipientLang] = useState<BroadcastLanguage>('Marathi');
  const [historyLangMap, setHistoryLangMap] = useState<Record<string, BroadcastLanguage>>({});

  // --- AUDIENCE EXTRACTION (Strict Data Separation) ---
  // Public Broadcast only reads donor and member information for audience selection.
  // It never modifies any donation, payment, or financial records.
  const allMembersList = useMemo<AudienceRecipient[]>(() => {
    return members.map(m => {
      const catName = m.category === 'CM' 
        ? 'Committee Member' 
        : m.category === 'SB' 
          ? 'Sabhasad' 
          : m.category === 'KY' 
            ? 'Karyakarta' 
            : 'Yuva Karyakarta';
      return {
        id: `mbr-${m.id}`,
        name: m.fullName,
        mobile: m.mobile,
        type: 'member',
        memberCategory: m.category,
        categoryTitle: catName,
        buildingName: m.wing ? `Wing ${m.wing}` : 'Mandal Active Member',
        unitDetails: m.flatNumber ? `Flat ${m.flatNumber}` : (m.responsibilities[0] || catName),
        preferredLanguage: m.preferredLanguage || 'Marathi'
      };
    });
  }, [members]);

  const allDonors = useMemo<AudienceRecipient[]>(() => {
    const donorMap = new Map<string, AudienceRecipient>();

    // 1. Read from completed donations
    donations.forEach(d => {
      if (!d.donorMobile) return;
      const key = d.donorMobile.trim();
      const existing = donorMap.get(key);
      const payStatus = d.financialStatus === 'Approved' || d.financialStatus === 'Completed' 
        ? 'Completed' 
        : d.paymentMethod === 'Cash' && d.financialStatus === 'Pending' 
          ? 'Awaiting Approval' 
          : 'Completed';

      if (!existing) {
        donorMap.set(key, {
          id: `dn-${key}`,
          name: d.donorName,
          mobile: d.donorMobile,
          type: 'donor',
          campaignId: d.campaignId,
          campaignName: d.campaignName,
          buildingName: d.unitDetails ? d.unitDetails.split(',')[0].trim() : 'Gokul Horizon Residency',
          unitDetails: d.unitDetails,
          donationStatus: 'Donated',
          paymentStatus: payStatus,
          amount: d.amount,
          preferredLanguage: d.preferredLanguage || 'Marathi'
        });
      }
    });

    // 2. Read from pending payment commitments
    pendingPayments.forEach(p => {
      if (!p.donorMobile) return;
      const key = p.donorMobile.trim();
      if (!donorMap.has(key)) {
        donorMap.set(key, {
          id: `dn-${key}`,
          name: p.donorName,
          mobile: p.donorMobile,
          type: 'donor',
          campaignId: p.campaignId,
          campaignName: p.campaignName,
          buildingName: p.unitDetails ? p.unitDetails.split(',')[0].trim() : 'Gokul Horizon Residency',
          unitDetails: p.unitDetails,
          donationStatus: 'Pending Commitment',
          paymentStatus: 'Pending',
          amount: p.amount,
          preferredLanguage: p.preferredLanguage || 'Marathi'
        });
      }
    });

    // 3. Read general donor leads from campaign building units
    campaigns.forEach(c => {
      if (c.buildingConfig && c.buildingConfig.wings) {
        c.buildingConfig.wings.forEach(w => {
          if (w.units) {
            w.units.forEach(u => {
              if (u.donorMobile && u.donorName) {
                const key = u.donorMobile.trim();
                if (!donorMap.has(key)) {
                  donorMap.set(key, {
                    id: `dn-${key}`,
                    name: u.donorName,
                    mobile: u.donorMobile,
                    type: 'donor',
                    campaignId: c.id,
                    campaignName: c.name,
                    buildingName: c.buildingConfig?.societyName || c.name,
                    unitDetails: `${w.name} - ${u.unitNumber}`,
                    donationStatus: u.collectionStatus === 'Collection Received' ? 'Donated' : u.collectionStatus === 'Payment Pending — Donor Will Pay Later' ? 'Pending Commitment' : 'Visited / General',
                    paymentStatus: u.collectionStatus === 'Collection Received' ? 'Completed' : 'Pending',
                    preferredLanguage: 'Marathi'
                  });
                }
              }
            });
          }
        });
      }
    });

    return Array.from(donorMap.values());
  }, [donations, pendingPayments, campaigns]);

  // Extract list of all unique building names
  const availableBuildings = useMemo(() => {
    const set = new Set<string>();
    allDonors.forEach(d => {
      if (d.buildingName) set.add(d.buildingName);
    });
    set.add('Gokul Horizon Residency');
    set.add('Navkar Heights Society');
    set.add('SV Road Commercial Complex');
    return Array.from(set);
  }, [allDonors]);

  // Filter matched recipients according to selected audience option
  const matchedRecipients = useMemo<AudienceRecipient[]>(() => {
    if (audienceFilter === 'members') {
      if (selectedMemberCategory === 'all') {
        return allMembersList;
      }
      return allMembersList.filter(m => m.memberCategory === selectedMemberCategory);
    }
    return allDonors.filter(donor => {
      if (audienceFilter === 'all_donors') {
        return true;
      }
      if (audienceFilter === 'by_campaign') {
        return donor.campaignId === selectedCampaignId;
      }
      if (audienceFilter === 'by_building') {
        return donor.buildingName.toLowerCase().includes(selectedBuildingName.toLowerCase());
      }
      if (audienceFilter === 'by_donation_status') {
        return donor.donationStatus === selectedDonationStatus;
      }
      if (audienceFilter === 'by_payment_status') {
        return donor.paymentStatus === selectedPaymentStatus;
      }
      return true;
    });
  }, [allDonors, allMembersList, audienceFilter, selectedMemberCategory, selectedCampaignId, selectedBuildingName, selectedDonationStatus, selectedPaymentStatus]);

  const matchedDonors = matchedRecipients;

  // Recipient Language preference breakdown (Marathi default)
  const languageBreakdown = useMemo(() => {
    let marathi = 0;
    let hindi = 0;
    let english = 0;
    matchedRecipients.forEach(d => {
      const pref = d.preferredLanguage || 'Marathi';
      if (pref === 'Hindi') hindi++;
      else if (pref === 'English') english++;
      else marathi++;
    });
    return { marathi, hindi, english };
  }, [matchedRecipients]);

  // Active message text based on selected language tab
  const activeMessageBody = activeLanguage === 'Marathi' 
    ? marathiMessage 
    : activeLanguage === 'Hindi' 
      ? hindiMessage 
      : englishMessage;

  const setActiveMessageBody = (text: string) => {
    if (activeLanguage === 'Marathi') setMarathiMessage(text);
    else if (activeLanguage === 'Hindi') setHindiMessage(text);
    else setEnglishMessage(text);
  };

  // Get human description of audience filter
  const getFilterDescription = () => {
    if (audienceFilter === 'all_donors') return 'All Donors (Regardless of status)';
    if (audienceFilter === 'members') {
      if (selectedMemberCategory === 'all') return 'All Registered Members (CM, SB, KY, YK)';
      const catName = selectedMemberCategory === 'CM' 
        ? 'Committee Members' 
        : selectedMemberCategory === 'SB' 
          ? 'Sabhasad' 
          : selectedMemberCategory === 'KY' 
            ? 'Karyakarta' 
            : 'Yuva Karyakarta';
      return `Members: ${catName}`;
    }
    if (audienceFilter === 'by_campaign') {
      const camp = campaigns.find(c => c.id === selectedCampaignId);
      return `Campaign: ${camp?.name || 'Selected Campaign'}`;
    }
    if (audienceFilter === 'by_building') return `Building / Society: ${selectedBuildingName}`;
    if (audienceFilter === 'by_donation_status') return `Donation Status: ${selectedDonationStatus}`;
    if (audienceFilter === 'by_payment_status') return `Payment Status: ${selectedPaymentStatus}`;
    return 'Targeted Audience';
  };

  // Preset Poster / Media Options
  const posterPresets = [
    { name: 'Ghatasthapana & Akhand Jyot Poster', url: 'https://images.unsplash.com/photo-1609137144822-26164223f66a?w=800&auto=format&fit=crop&q=80' },
    { name: 'Grand Garba & Dandiya Raas Poster', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80' },
    { name: 'Maha Ashtami Havan & Aarti Poster', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80' }
  ];

  const documentPresets = [
    { name: 'JAUS 2026 Navratri Mahotsav Patrika.pdf', url: 'https://example.org/jaus2026-patrika.pdf' },
    { name: 'Samiti Vargani Digital Receipt Guidelines.pdf', url: 'https://example.org/vargani-guidelines.pdf' },
    { name: 'Dandiya Pass Protocol & Rules.pdf', url: 'https://example.org/pass-rules.pdf' }
  ];

  // Handle Apply Template
  const handleApplyTemplate = (tmpl: BroadcastTemplate) => {
    setTitle(tmpl.title);
    if (tmpl.content) {
      setMarathiMessage(tmpl.content.marathi || tmpl.message || '');
      setHindiMessage(tmpl.content.hindi || tmpl.message || '');
      setEnglishMessage(tmpl.content.english || tmpl.message || '');
    } else if (tmpl.message) {
      setMarathiMessage(tmpl.message);
      setHindiMessage(tmpl.message);
      setEnglishMessage(tmpl.message);
    }
    // Switch to Marathi by default as required by specification
    setActiveLanguage('Marathi');
    setActiveSubTab('create');
  };

  // Handle Dispatch / Schedule
  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSenderAuthorized) {
      alert('Only Admin / Committee Members have permission to compose and send Public Broadcasts.');
      return;
    }
    if (!title.trim()) {
      alert('Please enter a broadcast title.');
      return;
    }
    if (!activeMessageBody.trim()) {
      alert('Please enter a message body.');
      return;
    }
    if (matchedRecipients.length === 0) {
      alert('The selected audience filter matched 0 recipients. Please adjust audience criteria.');
      return;
    }

    if (scheduleType === 'scheduled' && !scheduledDate) {
      alert('Please choose a scheduled date for future delivery.');
      return;
    }

    // Determine final message for initial preview
    const finalMsg = activeMessageBody;

    createPublicBroadcast({
      title,
      message: finalMsg,
      language: activeLanguage,
      content: {
        marathi: marathiMessage,
        hindi: hindiMessage,
        english: englishMessage
      },
      mediaType,
      mediaUrl: mediaType !== 'none' ? mediaUrl : undefined,
      mediaName: mediaType !== 'none' ? mediaName : undefined,
      audienceType: audienceFilter,
      filterValue: audienceFilter === 'members'
        ? selectedMemberCategory
        : audienceFilter === 'by_campaign' 
          ? selectedCampaignId 
          : audienceFilter === 'by_building' 
            ? selectedBuildingName 
            : audienceFilter === 'by_donation_status' 
              ? selectedDonationStatus 
              : audienceFilter === 'by_payment_status' 
                ? selectedPaymentStatus 
                : undefined,
      filterDescription: getFilterDescription(),
      targetCount: matchedRecipients.length,
      deliveryChannel: 'WhatsApp only',
      scheduleType: isRecurring ? 'recurring' : scheduleType,
      scheduledDate: scheduleType === 'scheduled' || isRecurring ? scheduledDate : undefined,
      scheduledTime: scheduleType === 'scheduled' || isRecurring ? scheduledTime : undefined,
      recurringInterval: isRecurring ? recurringInterval : undefined,
      status: scheduleType === 'immediate' ? 'Sent' : 'Scheduled',
      createdBy: currentUser?.fullName || 'Committee Member',
      createdAt: new Date().toISOString().split('T')[0]
    });

    if (scheduleType === 'immediate') {
      const recipientLabel = audienceFilter === 'members' ? 'Members' : 'Donors';
      const defaultName = audienceFilter === 'members' ? 'Samiti Member' : 'Devotee / Donor';
      const mediaPrefix = mediaName ? `📎 [Attachment: ${mediaName}]\n\n` : '';

      const marathiFinal = mediaPrefix + marathiMessage.replace('{donor_name}', matchedRecipients[0]?.name || defaultName);
      const hindiFinal = mediaPrefix + hindiMessage.replace('{donor_name}', matchedRecipients[0]?.name || defaultName);
      const englishFinal = mediaPrefix + englishMessage.replace('{donor_name}', matchedRecipients[0]?.name || defaultName);

      setActiveWhatsApp({
        phone: `WhatsApp Broadcast to ${matchedRecipients.length} ${recipientLabel}`,
        text: marathiFinal,
        title: `Public WhatsApp Broadcast: ${title}`,
        multilingual: {
          marathi: marathiFinal,
          hindi: hindiFinal,
          english: englishFinal
        },
        initialLanguage: 'Marathi'
      });
    }

    // Reset composer form
    setTitle('');
    setActiveLanguage('Marathi');
    setScheduleType('immediate');
    setScheduledDate('');
    setIsRecurring(false);
    setMediaType('none');
    setMediaUrl('');
    setMediaName('');
    setActiveSubTab('history');
  };

  // Handle Edit Scheduled Broadcast Save
  const handleSaveScheduledEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBroadcast) return;
    updateScheduledBroadcast(editingBroadcast.id, {
      title: editingBroadcast.title,
      message: editingBroadcast.message,
      scheduledDate: editingBroadcast.scheduledDate,
      scheduledTime: editingBroadcast.scheduledTime,
      recurringInterval: editingBroadcast.recurringInterval
    });
    setEditingBroadcast(null);
  };

  // Handle Save New Template
  const handleSaveNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateTitle.trim() || !newTemplateMarathi.trim()) {
      alert('Please provide template title and Marathi message (Marathi is default).');
      return;
    }

    saveTemplate({
      title: newTemplateTitle,
      category: newTemplateCategory,
      language: 'Marathi',
      content: {
        marathi: newTemplateMarathi,
        hindi: newTemplateHindi || newTemplateMarathi,
        english: newTemplateEnglish || newTemplateMarathi
      }
    });

    setNewTemplateTitle('');
    setNewTemplateMarathi('');
    setNewTemplateHindi('');
    setNewTemplateEnglish('');
    setShowNewTemplateModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                JAUS 2026 ERP
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
                <Send className="w-3 h-3 text-emerald-700" />
                WhatsApp Only
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                Strictly One-Way Broadcast
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Donors Communication System
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
              Public Broadcast Management
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Official one-way WhatsApp broadcast system specifically intended for donors. Features strict audience targeting, multilingual messaging (Marathi default), customizable attachments (Image/PDF), and delivery status tracking (Sent / Delivered / Failed).
            </p>
          </div>

          {/* Sender Identity Tag */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Active Sender Authority
            </span>
            <div className="font-bold text-xs text-slate-900 mt-0.5 flex items-center justify-end gap-1.5">
              <span>{currentUser?.fullName}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                isSenderAuthorized ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-200 text-slate-700'
              }`}>
                {currentUser?.category}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {isSenderAuthorized ? 'Authorized (Admin / Committee Member)' : 'Read-Only (Requires CM Authorization)'}
            </span>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setActiveSubTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'create'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose Broadcast</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'history'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Broadcast History & Schedules ({broadcasts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('templates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'templates'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Templates Library ({templates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audience')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'audience'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Audience Directory ({allDonors.length + members.length})</span>
          </button>
        </div>
      </div>

      {/* Authorization Alert if not Admin / Committee Member */}
      {!isSenderAuthorized && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="font-bold">Sender Permission Notice:</strong> In accordance with JAUS 2026 specifications, only <strong>Admin</strong> and <strong>Committee Members</strong> can compose and dispatch Public Broadcasts. Your account is operating in read-only mode for audit history.
          </div>
        </div>
      )}

      {/* ================= TAB 1: COMPOSE BROADCAST ================= */}
      {activeSubTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Create WhatsApp Broadcast</span>
              </h2>
              <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Channel: WhatsApp only
              </span>
            </div>

            <form onSubmit={handleDispatch} className="space-y-5 text-xs">
              {/* Broadcast Subject */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Broadcast Subject / Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Navratri Mahaprasad Invitation & Aarti Guidelines"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* SECTION 2: AUDIENCE SELECTION (Donors & Members) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-amber-600" />
                    <span>Audience Selection *</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Strict Data Separation: Reads contacts only
                  </span>
                </div>

                {/* Audience Filter Modes (Donors & Members) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    { id: 'all_donors', label: 'All Donors', desc: 'All registered donors' },
                    { id: 'members', label: 'Members', desc: 'Registered members & wings' },
                    { id: 'by_campaign', label: 'Campaign-based', desc: 'Specific collection drive' },
                    { id: 'by_building', label: 'Building / Area', desc: 'Target residential complex' },
                    { id: 'by_donation_status', label: 'Donation Status', desc: 'Received vs Visited' },
                    { id: 'by_payment_status', label: 'Payment Status', desc: 'Paid vs Pending' }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setAudienceFilter(filter.id as BroadcastAudienceFilter)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        audienceFilter === filter.id
                          ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs">{filter.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{filter.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Dynamic Sub-filter: Members selection */}
                {audienceFilter === 'members' && (
                  <div className="pt-2 space-y-2">
                    <label className="block text-slate-700 font-semibold mb-1">
                      Select Member Category / Hierarchy Wing:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: 'all', label: 'All Members', count: members.length },
                        { id: 'CM', label: 'Committee', count: members.filter(m => m.category === 'CM').length },
                        { id: 'SB', label: 'Sabhasad', count: members.filter(m => m.category === 'SB').length },
                        { id: 'KY', label: 'Karyakarta', count: members.filter(m => m.category === 'KY').length },
                        { id: 'YK', label: 'Yuva Wing', count: members.filter(m => m.category === 'YK').length }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedMemberCategory(cat.id as any)}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            selectedMemberCategory === cat.id
                              ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-2xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="text-xs">{cat.label}</div>
                          <div className="text-[10px] text-slate-500 font-mono">({cat.count})</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Sub-filter: Campaign */}
                {audienceFilter === 'by_campaign' && (
                  <div className="pt-2">
                    <label className="block text-slate-700 font-semibold mb-1">Select Campaign:</label>
                    <select
                      value={selectedCampaignId}
                      onChange={(e) => setSelectedCampaignId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium outline-hidden"
                    >
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type}) — Target ₹{c.targetAmount?.toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Dynamic Sub-filter: Building */}
                {audienceFilter === 'by_building' && (
                  <div className="pt-2">
                    <label className="block text-slate-700 font-semibold mb-1">Select Building / Society:</label>
                    <select
                      value={selectedBuildingName}
                      onChange={(e) => setSelectedBuildingName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium outline-hidden"
                    >
                      {availableBuildings.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Dynamic Sub-filter: Donation Status */}
                {audienceFilter === 'by_donation_status' && (
                  <div className="pt-2">
                    <label className="block text-slate-700 font-semibold mb-1">Select Donation Status:</label>
                    <select
                      value={selectedDonationStatus}
                      onChange={(e) => setSelectedDonationStatus(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium outline-hidden"
                    >
                      <option value="Donated">Collection Received (Donated)</option>
                      <option value="Pending Commitment">Pending Commitment (Donor Promised Later)</option>
                      <option value="Visited / General">Visited / General Society Resident</option>
                    </select>
                  </div>
                )}

                {/* Dynamic Sub-filter: Payment Status */}
                {audienceFilter === 'by_payment_status' && (
                  <div className="pt-2">
                    <label className="block text-slate-700 font-semibold mb-1">Select Payment Status:</label>
                    <select
                      value={selectedPaymentStatus}
                      onChange={(e) => setSelectedPaymentStatus(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium outline-hidden"
                    >
                      <option value="Completed">Completed / Paid (UPI or Approved Cash)</option>
                      <option value="Pending">Payment Pending (Will Pay Later)</option>
                      <option value="Awaiting Approval">Cash Collected — Awaiting Treasurer Approval</option>
                    </select>
                  </div>
                )}

                {/* Audience Selection Match Statistics */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-slate-900 text-xs">
                      Matched Audience: {matchedRecipients.length} {audienceFilter === 'members' ? 'Members' : 'Donors'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">मराठी: {languageBreakdown.marathi}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">हिंदी: {languageBreakdown.hindi}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">English: {languageBreakdown.english}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAudienceList(!showAudienceList)}
                    className="text-[10px] text-amber-700 font-bold hover:underline"
                  >
                    {showAudienceList ? 'Hide Recipient List' : 'Preview Recipients'}
                  </button>
                </div>

                {/* Collapsible Recipient Preview List */}
                {showAudienceList && (
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white p-2 divide-y divide-slate-100 text-[11px]">
                    {matchedRecipients.map(recipient => (
                      <div key={recipient.id} className="py-1.5 px-2 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">{recipient.name}</span>
                          <span className="text-[10px] text-slate-500 ml-2 font-mono">{recipient.mobile}</span>
                          <span className="text-[10px] text-slate-400 block">
                            {recipient.buildingName} • {recipient.unitDetails || (recipient.type === 'member' ? 'Member' : 'Unit')}
                          </span>
                        </div>
                        <div className="text-right">
                          {recipient.type === 'member' ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              {recipient.categoryTitle || 'Member'}
                            </span>
                          ) : (
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              recipient.donationStatus === 'Donated' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {recipient.donationStatus}
                            </span>
                          )}
                          <span className="text-[9px] text-slate-400 block font-medium">
                            Language: {recipient.preferredLanguage}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 3: MULTILINGUAL BROADCAST & LANGUAGE SELECTOR */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-slate-900 font-bold text-xs flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-amber-700" />
                      <span>Select Language / भाषा निवडा / भाषा चुनें *</span>
                    </label>
                    <span className="text-[10px] text-amber-800 font-medium">
                      मराठी (Marathi) is the official default language for JAUS 2026.
                    </span>
                  </div>

                  {/* 3-Language Selector Buttons */}
                  <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-amber-200 self-start sm:self-auto">
                    {[
                      { id: 'Marathi', label: 'मराठी — Marathi (Default)' },
                      { id: 'Hindi', label: 'हिंदी — Hindi' },
                      { id: 'English', label: 'English — English' }
                    ].map(lang => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setActiveLanguage(lang.id as BroadcastLanguage)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeLanguage === lang.id
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipient Language Preference Switch */}
                <div className="p-2.5 bg-white rounded-xl border border-amber-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="recipientLangPref"
                      checked={useRecipientLanguage}
                      onChange={(e) => setUseRecipientLanguage(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <label htmlFor="recipientLangPref" className="text-[11px] font-medium text-slate-800 cursor-pointer">
                      <strong>Deliver in Recipient's Saved Preference:</strong> Sends Marathi to Marathi preference, Hindi to Hindi, English to English. Unspecified defaults to <strong>Marathi</strong>.
                    </label>
                  </div>
                </div>

                {/* Message Body Input in Active Language */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">
                      Message Content ({activeLanguage}) *
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Variables: {'{donor_name}'}, {'{amount}'}, {'{receipt_no}'}
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    required
                    value={activeMessageBody}
                    onChange={(e) => setActiveMessageBody(e.target.value)}
                    placeholder={`Type message in ${activeLanguage}... WhatsApp markdown (*bold*, _italic_) supported.`}
                    className="w-full p-3 rounded-xl border border-slate-300 font-sans text-xs outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed bg-white"
                  />
                </div>
              </div>

              {/* SECTION 4: CONTENT ATTACHMENTS (Image/Poster, Document/PDF) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-slate-800 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>Content Attachments (Optional)</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setMediaType('none'); setMediaUrl(''); setMediaName(''); }}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs ${
                      mediaType === 'none'
                        ? 'border-amber-500 bg-amber-50 text-amber-950'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Text Only
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaType('image');
                      setMediaUrl(posterPresets[0].url);
                      setMediaName(posterPresets[0].name);
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 ${
                      mediaType === 'image'
                        ? 'border-amber-500 bg-amber-50 text-amber-950'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Image / Poster</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaType('document');
                      setMediaUrl(documentPresets[0].url);
                      setMediaName(documentPresets[0].name);
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 ${
                      mediaType === 'document'
                        ? 'border-amber-500 bg-amber-50 text-amber-950'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <FileIcon className="w-3.5 h-3.5" />
                    <span>Document / PDF</span>
                  </button>
                </div>

                {/* Image selection options */}
                {mediaType === 'image' && (
                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">Choose Festive Poster Preset or Enter URL:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {posterPresets.map((poster, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setMediaUrl(poster.url); setMediaName(poster.name); }}
                          className={`p-2 rounded-xl border text-left text-[11px] transition-all ${
                            mediaUrl === poster.url ? 'border-amber-500 bg-amber-50 font-bold' : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          <div className="truncate">{poster.name}</div>
                        </button>
                      ))}
                    </div>
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => { setMediaUrl(e.target.value); setMediaName('Custom Image Attachment'); }}
                      placeholder="Or paste custom poster image URL (https://...)"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs outline-hidden"
                    />
                  </div>
                )}

                {/* Document / PDF selection options */}
                {mediaType === 'document' && (
                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">Choose Official PDF Document Preset:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {documentPresets.map((doc, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setMediaUrl(doc.url); setMediaName(doc.name); }}
                          className={`p-2 rounded-xl border text-left text-[11px] transition-all ${
                            mediaName === doc.name ? 'border-amber-500 bg-amber-50 font-bold' : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          <div className="truncate">{doc.name}</div>
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={mediaName}
                      onChange={(e) => setMediaName(e.target.value)}
                      placeholder="Custom Document Name (e.g., Mandal Circular 2026.pdf)"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* SECTION 5: SENDING OPTIONS & RECURRING BROADCAST */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-slate-800 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sending Options & Schedule *</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setScheduleType('immediate'); setIsRecurring(false); }}
                    className={`p-3 rounded-xl border text-center font-bold text-xs ${
                      scheduleType === 'immediate' && !isRecurring
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Send Now (Immediate)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleType('scheduled')}
                    className={`p-3 rounded-xl border text-center font-bold text-xs ${
                      scheduleType === 'scheduled' || isRecurring
                        ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Schedule for Future
                  </button>
                </div>

                {/* Schedule Future Date/Time */}
                {(scheduleType === 'scheduled' || isRecurring) && (
                  <div className="pt-2 space-y-3 border-t border-slate-200/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Scheduled Date *</label>
                        <input
                          type="date"
                          required
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Scheduled Time (24h) *</label>
                        <input
                          type="time"
                          required
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium outline-hidden"
                        />
                      </div>
                    </div>

                    {/* SECTION 6: RECURRING BROADCAST CONFIGURATION */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isRecurringCheck"
                            checked={isRecurring}
                            onChange={(e) => setIsRecurring(e.target.checked)}
                            className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                          />
                          <label htmlFor="isRecurringCheck" className="text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-1.5">
                            <Repeat className="w-3.5 h-3.5 text-amber-600" />
                            <span>Enable Recurring Broadcast</span>
                          </label>
                        </div>
                      </div>

                      {isRecurring && (
                        <div className="pt-2 grid grid-cols-3 gap-2">
                          {[
                            { id: 'daily', label: 'Daily' },
                            { id: 'weekly', label: 'Weekly' },
                            { id: 'monthly', label: 'Monthly' }
                          ].map(interval => (
                            <button
                              key={interval.id}
                              type="button"
                              onClick={() => setRecurringInterval(interval.id as RecurringInterval)}
                              className={`p-2 rounded-lg border text-center text-xs font-bold transition-all ${
                                recurringInterval === interval.id
                                  ? 'bg-amber-600 text-white border-amber-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {interval.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Dispatch Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isSenderAuthorized}
                  className={`w-full py-3.5 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all ${
                    isSenderAuthorized 
                      ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer' 
                      : 'bg-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {scheduleType === 'immediate' && !isRecurring
                      ? `Send WhatsApp Broadcast Now to ${matchedDonors.length} Donors`
                      : isRecurring
                        ? `Save Recurring (${recurringInterval}) Broadcast for ${matchedDonors.length} Donors`
                        : `Schedule WhatsApp Broadcast for ${scheduledDate || 'Date'} at ${scheduledTime}`}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live WhatsApp Simulation Bubble (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Live WhatsApp Simulation</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">WhatsApp 2.26</span>
            </div>

            {/* Mobile Mockup Screen */}
            <div className="rounded-2xl border-4 border-slate-800 bg-[#efeae2] p-3 shadow-md flex flex-col justify-between min-h-[440px]">
              {/* WhatsApp Chat Header */}
              <div className="bg-emerald-800 text-white p-2.5 rounded-xl flex items-center gap-2.5 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">
                  JA
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs truncate flex items-center gap-1">
                    <span>{settings.samitiName}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-300" />
                  </div>
                  <div className="text-[9px] text-emerald-200 flex items-center gap-1 font-mono">
                    <span>Official Mandal Channel</span>
                    <span>•</span>
                    <span>One-Way</span>
                  </div>
                </div>
              </div>

              {/* Chat Message Bubble */}
              <div className="flex-1 py-3 overflow-y-auto">
                <div className="bg-white rounded-xl p-3 shadow-sm max-w-[95%] text-slate-900 text-xs whitespace-pre-wrap leading-relaxed border-l-4 border-l-emerald-600 space-y-2">
                  {/* Media attachment preview */}
                  {mediaType === 'image' && mediaUrl && (
                    <div className="rounded-lg overflow-hidden border border-slate-200 max-h-40 bg-slate-100">
                      <img src={mediaUrl} alt="Poster" className="w-full h-full object-cover" />
                      <div className="p-1 text-[9px] text-slate-500 truncate bg-white font-mono">
                        📷 {mediaName || 'Festive Poster'}
                      </div>
                    </div>
                  )}

                  {mediaType === 'document' && (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
                      <FileIcon className="w-6 h-6 text-rose-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-[10px] truncate text-slate-800">{mediaName || 'Mandal Document.pdf'}</div>
                        <div className="text-[8px] text-slate-400">PDF • 1.4 MB • Official Patrika</div>
                      </div>
                    </div>
                  )}

                  {/* EMBEDDED LANGUAGE SELECTOR IN MESSAGE PREFIX */}
                  <div className="pb-2.5 border-b border-slate-100">
                    <div className="text-[10px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span>🌐</span>
                        <span>भाषा / Language:</span>
                      </div>
                      <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                        Default: मराठी
                      </span>
                    </div>

                    {/* Interactive Button Selector Mechanism */}
                    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setPreviewRecipientLang('Marathi')}
                        className={`py-1 px-1.5 rounded-md font-bold text-[10px] transition-all flex items-center justify-center gap-1 ${
                          previewRecipientLang === 'Marathi'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>मराठी</span>
                        {previewRecipientLang === 'Marathi' && <CheckCircle2 className="w-2.5 h-2.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewRecipientLang('Hindi')}
                        className={`py-1 px-1.5 rounded-md font-bold text-[10px] transition-all flex items-center justify-center gap-1 ${
                          previewRecipientLang === 'Hindi'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>हिंदी</span>
                        {previewRecipientLang === 'Hindi' && <CheckCircle2 className="w-2.5 h-2.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewRecipientLang('English')}
                        className={`py-1 px-1.5 rounded-md font-bold text-[10px] transition-all flex items-center justify-center gap-1 ${
                          previewRecipientLang === 'English'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>English</span>
                        {previewRecipientLang === 'English' && <CheckCircle2 className="w-2.5 h-2.5" />}
                      </button>
                    </div>

                    <div className="mt-1 text-[9px] text-slate-400 font-mono text-center">
                      🌐 भाषा / Language: मराठी | हिंदी | English
                    </div>
                  </div>

                  {/* Text Content in selected recipient language version */}
                  <div className="pt-1 whitespace-pre-wrap leading-relaxed">
                    {(() => {
                      const displayedText = previewRecipientLang === 'Marathi'
                        ? marathiMessage
                        : previewRecipientLang === 'Hindi'
                          ? hindiMessage
                          : englishMessage;

                      return displayedText
                        ? displayedText.replace('{donor_name}', matchedDonors[0]?.name || 'Devotee / Donor')
                        : <span className="text-slate-400 italic">Type a message or select a template to preview live bubble...</span>;
                    })()}
                  </div>

                  {/* Delivery Status & Timestamp */}
                  <div className="text-[9px] text-slate-400 text-right flex items-center justify-end gap-1 pt-1 border-t border-slate-100">
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-emerald-600 font-bold">✓✓</span>
                    <span className="text-slate-500">Delivered</span>
                  </div>
                </div>
              </div>

              {/* Strict One-Way Notice */}
              <div className="bg-white/90 p-2 rounded-xl text-[9px] font-bold text-slate-600 text-center border border-slate-200 shadow-2xs">
                🔒 Strictly One-Way Broadcast • Recipients cannot reply through this system
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: BROADCAST HISTORY & SCHEDULES ================= */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Permanent Public Broadcast History
              </h2>
              <p className="text-xs text-slate-500">
                Complete log of sent, scheduled, and recurring broadcasts. Delivery tracking adheres strictly to Sent, Delivered, and Failed states without analytics.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {broadcasts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No broadcast records available. Create your first broadcast.
              </div>
            ) : (
              broadcasts.map(b => {
                const isScheduled = b.status === 'Scheduled';
                const hasFailed = (b.stats?.failed || 0) > 0 || b.status === 'Failed';

                return (
                  <div key={b.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">{b.title}</h3>
                          
                          {/* Status Badge */}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.status === 'Sent' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : b.status === 'Scheduled' 
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : b.status === 'Failed'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {b.status}
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {b.language || 'Marathi'}
                          </span>

                          {b.scheduleType === 'recurring' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                              <Repeat className="w-3 h-3" />
                              {b.recurringInterval} Recurring
                            </span>
                          )}

                          <span className="text-[10px] text-slate-400 font-mono">
                            {b.deliveryChannel}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                          <span>Target: <strong className="text-slate-800">{b.filterDescription || b.audienceType || 'Donors'}</strong> ({b.targetCount} recipients)</span>
                          <span>•</span>
                          <span>Dispatched/Scheduled by: <strong>{b.createdBy}</strong></span>
                          <span>•</span>
                          <span>Time: {b.sentAt || `${b.scheduledDate || ''} ${b.scheduledTime || ''}` || b.createdAt}</span>
                        </div>
                      </div>

                      {/* Delivery Status Summary (Sent / Delivered / Failed strictly) */}
                      <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-semibold" title="Sent Count">
                            Sent: <strong>{b.stats?.sent ?? b.targetCount}</strong>
                          </span>
                          <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 font-semibold" title="Delivered Count">
                            Delivered: <strong>{b.stats?.delivered ?? b.targetCount}</strong>
                          </span>
                          {(b.stats?.failed || 0) > 0 && (
                            <span className="px-2 py-1 rounded bg-rose-50 text-rose-800 font-semibold" title="Failed Count">
                              Failed: <strong>{b.stats?.failed}</strong>
                            </span>
                          )}
                        </div>

                        {/* SECTION 8: RESEND FAILED OPTION */}
                        {hasFailed && isSenderAuthorized && (
                          <button
                            type="button"
                            onClick={() => resendBroadcast(b.id)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                            title="Resend failed messages"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Resend Failed</span>
                          </button>
                        )}

                        {/* SECTION 5: EDIT / CANCEL SCHEDULED BROADCASTS */}
                        {isScheduled && isSenderAuthorized && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingBroadcast(b)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelScheduledBroadcast(b.id)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setActiveWhatsApp({
                              phone: `Audience (${b.targetCount} Donors)`,
                              text: b.content?.marathi || b.message,
                              title: `Broadcast: ${b.title}`,
                              multilingual: b.content,
                              initialLanguage: 'Marathi'
                            });
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>View in WhatsApp</span>
                        </button>
                      </div>
                    </div>

                    {/* Multilingual message body with embedded language selector prefix */}
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 font-sans border border-slate-200/60 space-y-2">
                      {b.content ? (
                        <div>
                          {/* Prefix selector */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-2">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                              <span>🌐</span>
                              <span>भाषा / Language:</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {(['Marathi', 'Hindi', 'English'] as BroadcastLanguage[]).map(lang => {
                                const currentItemLang = historyLangMap[b.id] || 'Marathi';
                                const label = lang === 'Marathi' ? 'मराठी' : lang === 'Hindi' ? 'हिंदी' : 'English';
                                return (
                                  <button
                                    key={lang}
                                    type="button"
                                    onClick={() => setHistoryLangMap(prev => ({ ...prev, [b.id]: lang }))}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                      currentItemLang === lang 
                                        ? 'bg-amber-600 text-white shadow-2xs' 
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {(historyLangMap[b.id] || 'Marathi') === 'Marathi'
                              ? b.content.marathi
                              : (historyLangMap[b.id] || 'Marathi') === 'Hindi'
                                ? b.content.hindi
                                : b.content.english}
                          </div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed">{b.message}</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: REUSABLE TEMPLATES ================= */}
      {activeSubTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Reusable Broadcast Templates
              </h2>
              <p className="text-xs text-slate-500">
                Create and reuse standardized message templates supporting Marathi, Hindi, and English.
              </p>
            </div>

            {isSenderAuthorized && (
              <button
                type="button"
                onClick={() => setShowNewTemplateModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create New Template</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(tmpl => (
              <div key={tmpl.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {tmpl.category || 'General'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Multilingual (MR/HI/EN)
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-2">{tmpl.title}</h3>

                  <div className="mt-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed border border-slate-200 max-h-48 overflow-y-auto">
                    {tmpl.content?.marathi || tmpl.message}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Default: <strong>Marathi</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {isSenderAuthorized && !tmpl.id.startsWith('tmpl-1') && !tmpl.id.startsWith('tmpl-2') && !tmpl.id.startsWith('tmpl-3') && (
                      <button
                        type="button"
                        onClick={() => deleteTemplate(tmpl.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Use Template</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: DONOR AUDIENCE DIRECTORY (Read-Only) ================= */}
      {activeSubTab === 'audience' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Donor Audience Directory (Read-Only)
              </h2>
              <p className="text-xs text-slate-500">
                Audience contacts extracted from Vargani collections, campaigns, and society units. Used strictly for broadcast targeting without modifying financial records.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={audienceSearch}
                  onChange={(e) => setAudienceSearch(e.target.value)}
                  placeholder="Search donor name or mobile..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">Donor Name</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">Building / Unit</th>
                  <th className="p-3">Donation Status</th>
                  <th className="p-3">Payment Status</th>
                  <th className="p-3">Preferred Language</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allDonors
                  .filter(d => 
                    d.name.toLowerCase().includes(audienceSearch.toLowerCase()) || 
                    d.mobile.includes(audienceSearch) ||
                    d.buildingName.toLowerCase().includes(audienceSearch.toLowerCase())
                  )
                  .map(donor => (
                    <tr key={donor.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{donor.name}</td>
                      <td className="p-3 font-mono text-slate-600">{donor.mobile}</td>
                      <td className="p-3 text-slate-600">{donor.buildingName} ({donor.unitDetails || 'Unit'})</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          donor.donationStatus === 'Donated' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {donor.donationStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          donor.paymentStatus === 'Completed' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {donor.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-700">
                        {donor.preferredLanguage}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT SCHEDULED BROADCAST ================= */}
      {editingBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Edit Scheduled Broadcast
              </h3>
              <button
                type="button"
                onClick={() => setEditingBroadcast(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScheduledEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Subject / Title</label>
                <input
                  type="text"
                  required
                  value={editingBroadcast.title}
                  onChange={(e) => setEditingBroadcast({ ...editingBroadcast, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Message Body</label>
                <textarea
                  rows={6}
                  required
                  value={editingBroadcast.message}
                  onChange={(e) => setEditingBroadcast({ ...editingBroadcast, message: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-sans outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={editingBroadcast.scheduledDate || ''}
                    onChange={(e) => setEditingBroadcast({ ...editingBroadcast, scheduledDate: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Scheduled Time</label>
                  <input
                    type="time"
                    required
                    value={editingBroadcast.scheduledTime || '10:00'}
                    onChange={(e) => setEditingBroadcast({ ...editingBroadcast, scheduledTime: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBroadcast(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE REUSABLE TEMPLATE ================= */}
      {showNewTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Create Multilingual Broadcast Template
              </h3>
              <button
                type="button"
                onClick={() => setShowNewTemplateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTemplate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Template Title *</label>
                <input
                  type="text"
                  required
                  value={newTemplateTitle}
                  onChange={(e) => setNewTemplateTitle(e.target.value)}
                  placeholder="e.g. Mahaprasad Invitation / महाप्रसाद निमंत्रण"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Category</label>
                <select
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium outline-hidden"
                >
                  <option value="Event">Event / उत्सव</option>
                  <option value="Donation">Donation / वर्गणी</option>
                  <option value="Schedule">Schedule / वेळापत्रक</option>
                  <option value="General">General / सर्वसाधारण</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  मराठी — Marathi Message (Default Language) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newTemplateMarathi}
                  onChange={(e) => setNewTemplateMarathi(e.target.value)}
                  placeholder="मराठी संदेश टाइप करा..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-sans outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  हिंदी — Hindi Message
                </label>
                <textarea
                  rows={3}
                  value={newTemplateHindi}
                  onChange={(e) => setNewTemplateHindi(e.target.value)}
                  placeholder="हिंदी संदेश टाइप करें (वैकल्पिक)..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-sans outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  English — English Message
                </label>
                <textarea
                  rows={3}
                  value={newTemplateEnglish}
                  onChange={(e) => setNewTemplateEnglish(e.target.value)}
                  placeholder="Type English message (optional)..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-sans outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTemplateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
