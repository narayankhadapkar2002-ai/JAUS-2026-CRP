import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  CalendarDays, 
  Clock, 
  MapPin, 
  Plus, 
  Edit2, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Sparkles, 
  Send, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Info, 
  Check, 
  Image as ImageIcon, 
  User, 
  Bell, 
  Filter,
  CheckCircle,
  XCircle,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavratriEvent, EventStatus, BroadcastLanguage } from '../types';

interface EventsModuleViewProps {
  initialSubTab?: string;
  onNavigateSub?: (tab: string) => void;
}

export const EventsModuleView: React.FC<EventsModuleViewProps> = ({
  initialSubTab = 'events-schedule',
  onNavigateSub
}) => {
  const { 
    events, 
    createEvent, 
    updateEvent, 
    setActiveWhatsApp, 
    currentUser,
    members 
  } = useApp();

  const isAdmin = currentUser?.category === 'CM';

  // 1. CALENDAR VIEW MODES: Month | Week | Day | List
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day' | 'list'>('month');

  // 2. ACTIVE DATE STATE: Defaults to Navratri 2026 (October 3, 2026 - Ghatasthapana)
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(2026, 9, 3)); // Oct 3, 2026

  // 3. SELECTION / MODAL STATES
  const [selectedEvent, setSelectedEvent] = useState<NavratriEvent | null>(null);
  const [isCreatingOrEditing, setIsCreatingOrEditing] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [broadcastingEvent, setBroadcastingEvent] = useState<NavratriEvent | null>(null);

  // Status Filter for List View
  const [listStatusFilter, setListStatusFilter] = useState<'all' | EventStatus>('all');

  // Form State
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState('2026-10-03');
  const [formStartTime, setFormStartTime] = useState('19:30');
  const [formEndTime, setFormEndTime] = useState('22:30');
  const [formVenue, setFormVenue] = useState('Shree Ambe Dham Main Mandap, Borivali West');
  const [formDescription, setFormDescription] = useState('');
  const [formPosterUrl, setFormPosterUrl] = useState('');
  const [formImportantInstructions, setFormImportantInstructions] = useState('');
  const [formChiefGuest, setFormChiefGuest] = useState('');
  const [formStatus, setFormStatus] = useState<EventStatus>('Draft');

  // Broadcast Form State
  const [broadcastLang, setBroadcastLang] = useState<BroadcastLanguage>('Marathi');
  const [broadcastChannelWhatsApp, setBroadcastChannelWhatsApp] = useState<boolean>(true);
  const [broadcastChannelInApp, setBroadcastChannelInApp] = useState<boolean>(true);
  const [customBroadcastMsg, setCustomBroadcastMsg] = useState<string>('');
  const [broadcastSentNotification, setBroadcastSentNotification] = useState<string>('');

  // ----------------------------------------------------
  // DATE HELPERS
  // ----------------------------------------------------
  const formatDateKey = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectedDateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);

  // Map events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, NavratriEvent[]> = {};
    events.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    // Sort each day chronologically by startTime
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return map;
  }, [events]);

  // Check for time overlap on a given date
  const checkOverlappingEvents = (dateStr: string, start: string, end: string, excludeId?: string | null): NavratriEvent[] => {
    const dayEvts = eventsByDate[dateStr] || [];
    return dayEvts.filter(e => {
      if (excludeId && e.id === excludeId) return false;
      if (e.status === 'Cancelled') return false; // Cancelled events do not conflict
      // Overlap formula: (startA < endB) and (endA > startB)
      return start < e.endTime && end > e.startTime;
    });
  };

  // Real-time overlap check for form
  const formConflicts = useMemo(() => {
    if (!isCreatingOrEditing) return [];
    return checkOverlappingEvents(formDate, formStartTime, formEndTime, editingEventId);
  }, [formDate, formStartTime, formEndTime, editingEventId, isCreatingOrEditing, eventsByDate]);

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(selectedDate);
    if (calendarView === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (calendarView === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setSelectedDate(d);
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    if (calendarView === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (calendarView === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setSelectedDate(d);
  };

  const handleJumpToNavratri = () => {
    setSelectedDate(new Date(2026, 9, 3)); // Oct 3, 2026
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Month days generation
  const monthCalendarDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay(); // 0 is Sunday
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean; key: string }[] = [];

    // Prev month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false, key: formatDateKey(prevDate) });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const curDate = new Date(year, month, i);
      days.push({ date: curDate, isCurrentMonth: true, key: formatDateKey(curDate) });
    }

    // Next month padding to fill full grid of 35 or 42
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false, key: formatDateKey(nextDate) });
    }

    return days;
  }, [selectedDate]);

  // Week days generation (Sun-Sat)
  const weekCalendarDays = useMemo(() => {
    const d = new Date(selectedDate);
    const dayOfWeek = d.getDay();
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - dayOfWeek);

    const days: { date: Date; key: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(sunday);
      weekDay.setDate(sunday.getDate() + i);
      days.push({ date: weekDay, key: formatDateKey(weekDay) });
    }
    return days;
  }, [selectedDate]);

  // ----------------------------------------------------
  // EVENT FORM ACTIONS
  // ----------------------------------------------------
  const handleOpenCreateEvent = (datePrefill?: string, timePrefill?: string) => {
    if (!isAdmin) {
      alert('Only Admin / Committee Members can create events or programs.');
      return;
    }
    setEditingEventId(null);
    setFormName('');
    setFormDate(datePrefill || selectedDateKey);
    setFormStartTime(timePrefill || '19:30');
    setFormEndTime('22:00');
    setFormVenue('Shree Ambe Dham Main Mandap, Borivali West');
    setFormDescription('');
    setFormPosterUrl('');
    setFormImportantInstructions('');
    setFormChiefGuest('');
    setFormStatus('Draft');
    setIsCreatingOrEditing(true);
  };

  const handleOpenEditEvent = (evt: NavratriEvent) => {
    if (!isAdmin) {
      alert('Only Admin / Committee Members can edit events.');
      return;
    }
    setEditingEventId(evt.id);
    setFormName(evt.name);
    setFormDate(evt.date);
    setFormStartTime(evt.startTime);
    setFormEndTime(evt.endTime);
    setFormVenue(evt.venue);
    setFormDescription(evt.description);
    setFormPosterUrl(evt.posterUrl || '');
    setFormImportantInstructions(evt.importantInstructions || '');
    setFormChiefGuest(evt.chiefGuest || '');
    setFormStatus(evt.status);
    setIsCreatingOrEditing(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Only Admin / Committee Members can create or modify events.');
      return;
    }
    if (!formName.trim() || !formDate || !formStartTime || !formEndTime || !formVenue.trim() || !formDescription.trim()) {
      alert('Please fill out all required fields (Name, Date, Start Time, End Time, Venue, and Description).');
      return;
    }

    if (editingEventId) {
      updateEvent(editingEventId, {
        name: formName.trim(),
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        venue: formVenue.trim(),
        description: formDescription.trim(),
        posterUrl: formPosterUrl.trim() || undefined,
        importantInstructions: formImportantInstructions.trim() || undefined,
        chiefGuest: formChiefGuest.trim() || undefined,
        status: formStatus
      });
      // Update selectedEvent if it was open
      if (selectedEvent && selectedEvent.id === editingEventId) {
        setSelectedEvent({
          ...selectedEvent,
          name: formName.trim(),
          date: formDate,
          startTime: formStartTime,
          endTime: formEndTime,
          venue: formVenue.trim(),
          description: formDescription.trim(),
          posterUrl: formPosterUrl.trim() || undefined,
          importantInstructions: formImportantInstructions.trim() || undefined,
          chiefGuest: formChiefGuest.trim() || undefined,
          status: formStatus
        });
      }
    } else {
      const created = createEvent({
        name: formName.trim(),
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        venue: formVenue.trim(),
        description: formDescription.trim(),
        posterUrl: formPosterUrl.trim() || undefined,
        importantInstructions: formImportantInstructions.trim() || undefined,
        chiefGuest: formChiefGuest.trim() || undefined,
        status: formStatus,
        createdBy: currentUser?.id || 'Admin'
      });
      // Optionally focus the newly created event
      setSelectedEvent(created);
    }

    setIsCreatingOrEditing(false);
    setEditingEventId(null);
  };

  // Status transitions
  const handleTransitionStatus = (evtId: string, newStatus: EventStatus) => {
    if (!isAdmin) {
      alert('Only Admin / Committee Members can transition event status.');
      return;
    }
    updateEvent(evtId, { status: newStatus });
    if (selectedEvent && selectedEvent.id === evtId) {
      setSelectedEvent(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // ----------------------------------------------------
  // EVENT BROADCAST (Separate from Public Broadcast)
  // ----------------------------------------------------
  const handleOpenBroadcast = (evt: NavratriEvent) => {
    if (!isAdmin) {
      alert('Only Admin / Committee Members have permission to broadcast events.');
      return;
    }
    setBroadcastingEvent(evt);
    setBroadcastLang('Marathi');
    setBroadcastChannelWhatsApp(true);
    setBroadcastChannelInApp(true);

    const defaultMarathi = 
      `जय माता दी! 🙏\n` +
      `जय अंबे उत्सव समिती (JAUS २०२६) — अधिकृत कार्यक्रम सूचना\n\n` +
      `🌺 *${evt.name.toUpperCase()}* 🌺\n` +
      `📅 दिनांक: ${evt.date}\n` +
      `⏰ वेळ: ${evt.startTime} ते ${evt.endTime}\n` +
      `📍 स्थळ: ${evt.venue}\n` +
      `${evt.chiefGuest ? `⭐ विशेष पाहुणे: ${evt.chiefGuest}\n` : ''}` +
      `${evt.importantInstructions ? `⚠️ सूचना: ${evt.importantInstructions}\n` : ''}` +
      `\n${evt.description}\n\n` +
      `सर्व सन्माननीय सदस्यांनी वेळेवर उपस्थित राहावे.\n` +
      `— जय अंबे उत्सव समिती २०२६`;

    setCustomBroadcastMsg(defaultMarathi);
  };

  const handleSendEventBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastingEvent || !isAdmin) return;

    const marathiMsg = customBroadcastMsg;
    const hindiMsg = 
      `जय माता दी! 🙏\nजय अम्बे उत्सव समिति (JAUS 2026) — आधिकारिक कार्यक्रम सूचना\n\n🌺 *${broadcastingEvent.name.toUpperCase()}* 🌺\n📅 दिनांक: ${broadcastingEvent.date}\n⏰ समय: ${broadcastingEvent.startTime} से ${broadcastingEvent.endTime}\n📍 स्थान: ${broadcastingEvent.venue}\n${broadcastingEvent.chiefGuest ? `⭐ विशेष अतिथि: ${broadcastingEvent.chiefGuest}\n` : ''}${broadcastingEvent.importantInstructions ? `⚠️ निर्देश: ${broadcastingEvent.importantInstructions}\n` : ''}\n${broadcastingEvent.description}\n\nसभी पंजीकृत सदस्यों से समय पर उपस्थिति का आग्रह है।\n— जय अम्बे उत्सव समिति 2026`;
    const englishMsg = 
      `Jai Mata Di! 🙏\nJai Ambe Utsav Samiti (JAUS 2026) — Official Member Event Notice\n\n🌺 *${broadcastingEvent.name.toUpperCase()}* 🌺\n📅 Date: ${broadcastingEvent.date}\n⏰ Time: ${broadcastingEvent.startTime} - ${broadcastingEvent.endTime}\n📍 Venue: ${broadcastingEvent.venue}\n${broadcastingEvent.chiefGuest ? `⭐ Chief Guest: ${broadcastingEvent.chiefGuest}\n` : ''}${broadcastingEvent.importantInstructions ? `⚠️ Instructions: ${broadcastingEvent.importantInstructions}\n` : ''}\n${broadcastingEvent.description}\n\nAll registered members & volunteers are requested to join punctually.\n— JAUS 2026 Committee`;

    if (broadcastChannelWhatsApp) {
      setActiveWhatsApp({
        phone: `All Registered Members (${members.length} Members)`,
        text: marathiMsg,
        title: `Event Broadcast: ${broadcastingEvent.name}`,
        multilingual: {
          marathi: marathiMsg,
          hindi: hindiMsg,
          english: englishMsg
        },
        initialLanguage: broadcastLang
      });
    }

    setBroadcastSentNotification(`Event broadcast for "${broadcastingEvent.name}" dispatched to all ${members.length} members via ${broadcastChannelWhatsApp ? 'WhatsApp' : ''} ${broadcastChannelInApp ? '& In-App' : ''}.`);
    setBroadcastingEvent(null);
    setTimeout(() => setBroadcastSentNotification(''), 5000);
  };

  // Helper for status badge styling
  const getStatusBadge = (st: EventStatus) => {
    switch (st) {
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Draft</span>
          </span>
        );
      case 'Published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
            <span>Published</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
            <Check className="w-2.5 h-2.5 text-slate-600" />
            <span>Completed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-300">
            <XCircle className="w-2.5 h-2.5 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  // Helper for event chip color in calendar cells
  const getEventChipClass = (st: EventStatus) => {
    switch (st) {
      case 'Draft':
        return 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100';
      case 'Published':
        return 'bg-emerald-50 text-emerald-950 border border-emerald-300 hover:bg-emerald-100';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 line-through opacity-80';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-900 border border-rose-300 hover:bg-rose-100 line-through opacity-75';
    }
  };

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* ---------------------------------------------------------------- */}
      {/* 1. TOP HEADER & CALENDAR CONTROLS */}
      {/* ---------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>JAUS 2026 — Navratri & Event Calendar</span>
                <span className="px-2 py-0.5 text-[9px] bg-amber-100 text-amber-800 rounded-full font-bold uppercase tracking-wider">
                  39th Year
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Official Navratri Mahotsav schedule, daily rituals, cultural programs & member broadcasts.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Navratri Jump, View Switcher, Create Event */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Fast Jump to Navratri 2026 */}
          <button
            type="button"
            onClick={handleJumpToNavratri}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1 shadow-2xs"
            title="Focus Navratri 2026 Dates (October 2026)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Navratri 2026</span>
          </button>

          {/* View Switcher: Month | Week | Day | List */}
          <div className="p-1 bg-slate-100 border border-slate-200 rounded-xl flex items-center text-xs font-bold text-slate-600">
            {(['month', 'week', 'day', 'list'] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setCalendarView(view)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  calendarView === view
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          {/* Create Program / Event (Admin & Committee Members Only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleOpenCreateEvent()}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Program</span>
            </button>
          )}
        </div>
      </div>

      {/* Broadcast Notification Banner */}
      {broadcastSentNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{broadcastSentNotification}</span>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 2. CALENDAR NAVIGATION TOOLBAR */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:px-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          {/* Previous & Next */}
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Today
          </button>

          {/* Current Date Display */}
          <div className="ml-2 font-black text-slate-900 text-sm sm:text-base tracking-tight">
            {calendarView === 'month' && (
              <span>
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            )}
            {calendarView === 'week' && (
              <span>
                Week of {weekCalendarDays[0]?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekCalendarDays[6]?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {calendarView === 'day' && (
              <span>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {calendarView === 'list' && (
              <span>All Navratri 2026 Programs & Events</span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Draft</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Published</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 3. CALENDAR VIEWS (MONTH / WEEK / DAY / LIST) */}
      {/* ---------------------------------------------------------------- */}

      {/* VIEW A: MONTH VIEW */}
      {calendarView === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[11px] font-bold text-slate-500 py-2.5 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* 35 or 42 grid cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-100/40">
            {monthCalendarDays.map((cell) => {
              const dayEvents = eventsByDate[cell.key] || [];
              const isSelectedDay = cell.key === selectedDateKey;
              const isToday = cell.key === formatDateKey(new Date());
              const hasMultiple = dayEvents.length > 1;

              return (
                <div
                  key={cell.key}
                  onClick={() => {
                    setSelectedDate(cell.date);
                  }}
                  className={`min-h-[90px] sm:min-h-[120px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/70 text-slate-400'
                  } ${isSelectedDay ? 'ring-2 ring-amber-500 ring-inset z-10' : 'hover:bg-amber-50/20'}`}
                >
                  {/* Top row: day number & add button for admin */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday 
                          ? 'bg-amber-600 text-white font-black' 
                          : isSelectedDay 
                            ? 'bg-amber-100 text-amber-900' 
                            : cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>

                    {/* Quick Add icon for admin */}
                    {isAdmin && cell.isCurrentMonth && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCreateEvent(cell.key);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-all"
                        title="Add event on this date"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Events on this date */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px]">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(evt);
                        }}
                        className={`px-1.5 py-1 rounded text-[10px] font-semibold leading-tight truncate transition-all shadow-2xs cursor-pointer ${getEventChipClass(evt.status)}`}
                        title={`${evt.startTime} - ${evt.name} (${evt.status})`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold shrink-0">{evt.startTime}</span>
                          <span className="truncate flex-1">{evt.name}</span>
                        </div>
                      </div>
                    ))}

                    {/* Multiple events indicator */}
                    {hasMultiple && (
                      <div className="text-[9px] text-amber-700 font-bold px-1">
                        • {dayEvents.length} programs
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Month View Footer Quick Inspector: shows events for selected day */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="font-medium text-slate-700 flex items-center gap-2">
              <span className="font-bold text-slate-900">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}:
              </span>
              <span>
                {(eventsByDate[selectedDateKey] || []).length} scheduled program(s)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCalendarView('day')}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Open in Day View →
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleOpenCreateEvent(selectedDateKey)}
                  className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700"
                >
                  + Add Event Here
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: WEEK VIEW */}
      {calendarView === 'week' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Week column headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5">
            {weekCalendarDays.map((col) => {
              const isSelected = col.key === selectedDateKey;
              const isToday = col.key === formatDateKey(new Date());
              return (
                <div 
                  key={col.key} 
                  onClick={() => setSelectedDate(col.date)}
                  className={`cursor-pointer px-1 ${isSelected ? 'text-amber-800 font-black' : 'text-slate-600'}`}
                >
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    {col.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-sm font-black inline-block w-7 h-7 leading-7 rounded-full ${
                    isToday ? 'bg-amber-600 text-white' : isSelected ? 'bg-amber-100 text-amber-900' : ''
                  }`}>
                    {col.date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Week Days Columns */}
          <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[480px] bg-slate-50/20">
            {weekCalendarDays.map((col) => {
              const colEvents = eventsByDate[col.key] || [];
              const isSelected = col.key === selectedDateKey;

              return (
                <div
                  key={col.key}
                  className={`p-2 space-y-2 flex flex-col justify-start transition-colors ${
                    isSelected ? 'bg-amber-50/30' : 'hover:bg-slate-50'
                  }`}
                >
                  {colEvents.length === 0 ? (
                    <div 
                      onClick={() => isAdmin && handleOpenCreateEvent(col.key)}
                      className="h-full flex items-center justify-center p-3 text-center text-[10px] text-slate-400 font-medium italic border-2 border-dashed border-transparent hover:border-slate-200 rounded-xl cursor-pointer"
                    >
                      {isAdmin ? '+ Click to add program' : 'No programs'}
                    </div>
                  ) : (
                    colEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-2xs space-y-1.5 ${getEventChipClass(evt.status)}`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{evt.startTime}</span>
                          </span>
                          {getStatusBadge(evt.status)}
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight">
                          {evt.name}
                        </h4>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{evt.venue}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW C: DAY VIEW (Chronological Time-based Schedule with Overlap Detection) */}
      {calendarView === 'day' && (
        <div className="space-y-4">
          {/* Day View Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-700 font-bold rounded-full">
                  {(eventsByDate[selectedDateKey] || []).length} Event(s)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chronological timeline schedule of all programs, rituals, and ceremonies.
              </p>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => handleOpenCreateEvent(selectedDateKey)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event on this Day</span>
              </button>
            )}
          </div>

          {/* Overlap Warning on this Day if any events overlap */}
          {(() => {
            const dayEvents = eventsByDate[selectedDateKey] || [];
            const overlaps: { a: NavratriEvent; b: NavratriEvent }[] = [];
            for (let i = 0; i < dayEvents.length; i++) {
              for (let j = i + 1; j < dayEvents.length; j++) {
                const a = dayEvents[i];
                const b = dayEvents[j];
                if (a.status !== 'Cancelled' && b.status !== 'Cancelled') {
                  if (a.startTime < b.endTime && a.endTime > b.startTime) {
                    overlaps.push({ a, b });
                  }
                }
              }
            }

            if (overlaps.length > 0) {
              return (
                <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-950 rounded-xl text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Multiple Overlapping Programs on this Date:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-amber-900">
                      {overlaps.map((ov, idx) => (
                        <li key={idx}>
                          "{ov.a.name}" ({ov.a.startTime}–{ov.a.endTime}) overlaps with "{ov.b.name}" ({ov.b.startTime}–{ov.b.endTime}).
                        </li>
                      ))}
                    </ul>
                    <span className="text-[10px] text-amber-700 italic block mt-1">
                      Overlapping events are permitted as separate programs. Neither has been merged or cancelled.
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Day Timeline Cards */}
          <div className="space-y-3">
            {(eventsByDate[selectedDateKey] || []).length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-sm text-slate-700">No Programs Scheduled on this Date</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  There are no rituals, garba nights, or samiti events planned for {selectedDateKey}.
                </p>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleOpenCreateEvent(selectedDateKey)}
                    className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors"
                  >
                    + Schedule First Event
                  </button>
                )}
              </div>
            ) : (
              (eventsByDate[selectedDateKey] || []).map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-amber-400 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(evt.status)}
                      <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{evt.startTime} – {evt.endTime}</span>
                      </span>
                    </div>

                    <h3 className="font-black text-base text-slate-900 group-hover:text-amber-800 transition-colors">
                      {evt.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.venue}</span>
                      </span>
                      {evt.chiefGuest && evt.status !== 'Draft' && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Guest: {evt.chiefGuest}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                      {evt.description}
                    </p>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(evt);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBroadcast(evt);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 transition-colors"
                          title="Broadcast to All Members"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Broadcast</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditEvent(evt);
                          }}
                          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW D: LIST / SCHEDULE VIEW */}
      {calendarView === 'list' && (
        <div className="space-y-4">
          {/* List Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status Filter:</span>
              <div className="flex flex-wrap gap-1">
                {(['all', 'Published', 'Draft', 'Completed', 'Cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setListStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      listStatusFilter === st
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'All Events' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing {events.filter(e => listStatusFilter === 'all' || e.status === listStatusFilter).length} of {events.length} programs
            </div>
          </div>

          {/* Chronological List of Events */}
          <div className="space-y-3">
            {events
              .filter(e => listStatusFilter === 'all' || e.status === listStatusFilter)
              .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
              .map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-amber-400 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                        {evt.date}
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {evt.startTime} – {evt.endTime}
                      </span>
                      {getStatusBadge(evt.status)}
                    </div>

                    <h3 className="font-black text-base text-slate-900">
                      {evt.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.venue}</span>
                      </span>
                      {evt.chiefGuest && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Guest: {evt.chiefGuest}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {evt.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(evt);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBroadcast(evt);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 transition-colors"
                          title="Broadcast to All Members"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Broadcast</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditEvent(evt);
                          }}
                          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 4. EVENT DETAILS MODAL (Rule 2 & 6: Draft vs Published Visibility) */}
      {/* ---------------------------------------------------------------- */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedEvent.status)}
                  <span className="text-xs text-amber-400 font-mono font-bold">
                    {selectedEvent.date}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                  {selectedEvent.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              {/* Optional Poster Image if Published or Admin */}
              {selectedEvent.posterUrl && (selectedEvent.status !== 'Draft' || isAdmin) && (
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-56 bg-slate-100">
                  <img src={selectedEvent.posterUrl} alt="Event Poster" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Status Warning if Draft */}
              {selectedEvent.status === 'Draft' && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Draft Program:</strong> Members can see basic details (Time, Venue, Description). Complete details, guest list, and instructions will be unlocked when the event status is changed to <strong>Published</strong>.
                  </div>
                </div>
              )}

              {/* Time, Venue & Key Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Date & Day</span>
                  <div className="font-bold text-slate-900 text-xs">
                    {new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Time Slot</span>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{selectedEvent.startTime} to {selectedEvent.endTime}</span>
                  </div>
                </div>

                <div className="space-y-0.5 sm:col-span-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Venue</span>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>{selectedEvent.venue}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Program Description</h4>
                <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-200">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Chief Guest (Only visible if Published OR Admin) */}
              {(selectedEvent.status !== 'Draft' || isAdmin) && selectedEvent.chiefGuest && (
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Chief / Special Guest</h4>
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-slate-900 font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{selectedEvent.chiefGuest}</span>
                  </div>
                </div>
              )}

              {/* Important Instructions (Only visible if Published OR Admin) */}
              {(selectedEvent.status !== 'Draft' || isAdmin) && selectedEvent.importantInstructions && (
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Important Instructions</h4>
                  <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200 text-slate-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="whitespace-pre-wrap">{selectedEvent.importantInstructions}</p>
                  </div>
                </div>
              )}

              {/* Status Change Buttons for Admin */}
              {isAdmin && (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Admin Status Transitions:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.status !== 'Draft' && (
                      <button
                        type="button"
                        onClick={() => handleTransitionStatus(selectedEvent.id, 'Draft')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100"
                      >
                        Set to Draft
                      </button>
                    )}

                    {selectedEvent.status !== 'Published' && (
                      <button
                        type="button"
                        onClick={() => handleTransitionStatus(selectedEvent.id, 'Published')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Publish Event
                      </button>
                    )}

                    {selectedEvent.status !== 'Completed' && (
                      <button
                        type="button"
                        onClick={() => handleTransitionStatus(selectedEvent.id, 'Completed')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 text-white hover:bg-slate-800"
                      >
                        Mark Completed
                      </button>
                    )}

                    {selectedEvent.status !== 'Cancelled' && (
                      <button
                        type="button"
                        onClick={() => handleTransitionStatus(selectedEvent.id, 'Cancelled')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100"
                      >
                        Cancel Event
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const target = selectedEvent;
                        setSelectedEvent(null);
                        handleOpenEditEvent(target);
                      }}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Event</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const target = selectedEvent;
                        setSelectedEvent(null);
                        handleOpenBroadcast(target);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Broadcast to Members</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 5. CREATE / EDIT EVENT MODAL (Rule 1 & 5: Required info & Overlap Warning) */}
      {/* ---------------------------------------------------------------- */}
      {isCreatingOrEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingEventId ? 'Edit Event / Program' : 'Create New Event / Program'}
                </h3>
                <p className="text-xs text-slate-400">
                  Every event is a standalone program for JAUS 2026.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setIsCreatingOrEditing(false); setEditingEventId(null); }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Overlap Warning Banner */}
              {formConflicts.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 text-amber-950 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Time Overlap Detected:</span>
                  </div>
                  <p className="text-[11px] text-amber-900">
                    This program overlaps with {formConflicts.map(c => `"${c.name}" (${c.startTime}–${c.endTime})`).join(', ')}.
                  </p>
                  <p className="text-[10px] text-amber-700 italic">
                    Multiple overlapping events are allowed and will be saved as separate records.
                  </p>
                </div>
              )}

              {/* Event Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Event / Program Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Maha Ashtami Chandi Havan & Pujan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-amber-500"
                />
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Start Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    End Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Venue / Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formVenue}
                  onChange={(e) => setFormVenue(e.target.value)}
                  placeholder="e.g. Shree Ambe Dham Main Mandap, SV Road, Borivali West"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Program Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide ritual details, schedule flow, guidelines..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
                />
              </div>

              {/* Optional Fields: Chief Guest & Poster URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Chief / Special Guest (Optional)
                  </label>
                  <input
                    type="text"
                    value={formChiefGuest}
                    onChange={(e) => setFormChiefGuest(e.target.value)}
                    placeholder="e.g. Mahant Swami Vishwanand Ji"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Poster / Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formPosterUrl}
                    onChange={(e) => setFormPosterUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Important Instructions (Optional) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Important Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={formImportantInstructions}
                  onChange={(e) => setFormImportantInstructions(e.target.value)}
                  placeholder="e.g. Traditional attire mandatory; arrive by 08:30 AM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              {/* Initial Status */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Program Status
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Draft', 'Published', 'Completed', 'Cancelled'] as EventStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormStatus(st)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        formStatus === st
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Save */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsCreatingOrEditing(false); setEditingEventId(null); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingEventId ? 'Save Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 6. EVENT BROADCAST MODAL (Rule 8: WhatsApp & In-App, Members Only) */}
      {/* ---------------------------------------------------------------- */}
      {broadcastingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
            <div className="bg-emerald-800 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Send className="w-4 h-4 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Broadcast Program to Members</h3>
                  <p className="text-xs text-emerald-100">
                    Audience: All {members.length} Registered Samiti Members
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBroadcastingEvent(null)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEventBroadcast} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Event summary banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Target Program</span>
                <div className="font-bold text-slate-900 text-sm">{broadcastingEvent.name}</div>
                <div className="text-[11px] text-slate-600 flex items-center gap-3">
                  <span>📅 {broadcastingEvent.date}</span>
                  <span>⏰ {broadcastingEvent.startTime} – {broadcastingEvent.endTime}</span>
                  <span>📍 {broadcastingEvent.venue}</span>
                </div>
              </div>

              {/* Delivery Channels */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Delivery Channels
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer bg-slate-50 hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      checked={broadcastChannelWhatsApp}
                      onChange={(e) => setBroadcastChannelWhatsApp(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                    />
                    <div>
                      <div className="font-bold text-slate-900">WhatsApp Broadcast</div>
                      <div className="text-[10px] text-slate-500">Dispatch via WhatsApp Web/App</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer bg-slate-50 hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      checked={broadcastChannelInApp}
                      onChange={(e) => setBroadcastChannelInApp(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                    />
                    <div>
                      <div className="font-bold text-slate-900">In-App Notification</div>
                      <div className="text-[10px] text-slate-500">Mandal Bulletin Board</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Language Selection Prefix Header */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                    <span>🌐 भाषा / Language: मराठी (Default) | हिंदी | English</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {(['Marathi', 'Hindi', 'English'] as BroadcastLanguage[]).map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setBroadcastLang(lang)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          broadcastLang === lang
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {lang === 'Marathi' ? 'मराठी' : lang === 'Hindi' ? 'हिंदी' : 'English'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customizable Message Body */}
                <textarea
                  rows={6}
                  value={customBroadcastMsg}
                  onChange={(e) => setCustomBroadcastMsg(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-sans text-xs text-slate-900 leading-relaxed focus:bg-white focus:border-emerald-500"
                  placeholder="Type broadcast message..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBroadcastingEvent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!broadcastChannelWhatsApp && !broadcastChannelInApp}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast to All Members</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
