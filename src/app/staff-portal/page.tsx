'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Bus, MapPin, CheckCircle2, LogOut, UserCheck, PlusCircle, X, Camera, Loader2 } from 'lucide-react';
import { getStaffPortalLogin, clearStaffPortalLogin } from '@/lib/store';
import { busRoutes, todayVisitors, todayWorkLogs } from '@/data/seed-data';
import type { VisitorEntry, WorkLogEntry } from '@/types';

type BusStatus = 'Not Started' | 'In Transit' | 'Completed';
type PunchStatus = 'Not Punched In' | 'On Duty' | 'Punched Out';
type PhotoScanState = 'idle' | 'scanning' | 'parsed';

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);
  return <span>{time}</span>;
}

// ─── WORK LOG SECTION (shared) ───────────────────────────────────────────────
const quickTasks = [
  '🧹 सफाई / Cleaning',
  '🚰 पाणी / Water Supply',
  '📦 सामान हलवले / Moved Materials',
  '🔧 दुरुस्ती / Repair Work',
  '📋 इतर / Other',
];

function WorkLogSection({ staffId, prefilledTask }: { staffId: string; prefilledTask?: string }) {
  const [selected, setSelected] = useState<string[]>(prefilledTask ? [prefilledTask] : []);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [logs, setLogs] = useState<WorkLogEntry[]>(
    todayWorkLogs.filter(w => w.staffId === staffId && w.date === '13/03/2026')
  );

  const toggle = (task: string) =>
    setSelected(p => p.includes(task) ? p.filter(t => t !== task) : [...p, task]);

  const handleSubmit = () => {
    if (selected.length === 0 && !notes.trim()) {
      toast.error('कृपया काम निवडा / Select a task');
      return;
    }
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const taskStr = [...selected, ...(notes.trim() ? [notes.trim()] : [])].join(' • ');
    const newLog: WorkLogEntry = { id: `wl${Date.now()}`, staffId, task: taskStr, time: now, date: '13/03/2026' };
    setLogs(p => [newLog, ...p]);
    setSelected(prefilledTask ? [prefilledTask] : []);
    setNotes('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    toast.success('✅ आजचे काम नोंदवले! / Today\'s work recorded!');
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-5">
      <p className="font-bold text-base mb-3">📋 आजचे काम / Today&apos;s Work</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {quickTasks.map(task => (
          <button
            key={task}
            onClick={() => toggle(task)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              selected.includes(task)
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
            }`}
          >
            {task}
          </button>
        ))}
      </div>
      <textarea
        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mb-3"
        placeholder="आज काय काम केले ते लिहा / Write what work you did today..."
        rows={2}
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl py-2.5 transition-all mb-3"
      >
        जमा करा / Submit
      </button>
      {submitted && (
        <p className="text-emerald-400 text-sm text-center mb-3">✅ आजचे काम नोंदवले! / Today&apos;s work recorded!</p>
      )}
      {logs.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">आजचा इतिहास / Today&apos;s Log</p>
          {logs.map((log, i) => (
            <div key={i} className="bg-white/5 rounded-lg px-3 py-2 flex items-start justify-between gap-2">
              <p className="text-xs text-white/80 leading-relaxed">{log.task}{log.notes ? ` — ${log.notes}` : ''}</p>
              <span className="text-xs text-white/40 flex-shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BUS DRIVER VIEW ────────────────────────────────────────────────────────
function BusDriverView({ staffId, staffName, onLogout }: { staffId: string; staffName: string; onLogout: () => void }) {
  const route = busRoutes.find(r => r.driverId === staffId) ?? busRoutes[0];
  const [status, setStatus] = useState<BusStatus>('Not Started');
  const [showWorkLog, setShowWorkLog] = useState(false);

  const statusLabels: Record<BusStatus, string> = {
    'Not Started': 'सुरू नाही / Not Started',
    'In Transit': 'प्रवासात / In Transit',
    'Completed': 'पूर्ण / Completed',
  };
  const statusColors: Record<BusStatus, string> = {
    'Not Started': 'bg-slate-700/60 text-slate-300',
    'In Transit': 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    'Completed': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
  };

  const handleStart = () => {
    setStatus('In Transit');
    toast.success('🚌 बस निघाली! पालकांना सूचना पाठवली! / Bus departed — parents notified!');
  };
  const handleEnd = () => {
    setStatus('Completed');
    setShowWorkLog(true);
    toast.success('✅ मार्ग पूर्ण! सर्व पालकांना सूचना! / Route complete — all parents notified!');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-10">
      <div className="max-w-md mx-auto p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center">
              <Bus className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">चालक / Driver</p>
              <p className="font-bold">{staffName}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>

        {/* Route info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
          <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1">मार्ग / Route</p>
          <p className="text-lg font-bold text-amber-400">🚌 मार्ग {route.routeNo} — {route.name}</p>
          <p className="text-xs text-white/50 mt-1">
            निघणे / Departure: {route.departureTime} · परत / Return: {route.returnTime}
          </p>
          <div className="mt-3 space-y-1.5">
            {route.stops.map((stop, i) => (
              <div key={stop} className="flex items-center gap-2 text-sm">
                <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className={i === 0 ? 'text-white font-medium' : 'text-white/60'}>{stop}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleStart}
            disabled={status !== 'Not Started'}
            className={`w-full rounded-3xl flex flex-col items-center justify-center gap-3 py-10 font-bold text-xl transition-all ${
              status === 'Not Started'
                ? 'bg-emerald-500 hover:bg-emerald-400 shadow-2xl shadow-emerald-500/30 active:scale-95'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <span className="text-4xl">🟢</span>
            <div className="text-center">
              <p className="text-2xl">निघालो</p>
              <p className="text-base font-normal opacity-90">Journey Started</p>
            </div>
          </button>
          <button
            onClick={handleEnd}
            disabled={status !== 'In Transit'}
            className={`w-full rounded-3xl flex flex-col items-center justify-center gap-3 py-10 font-bold text-xl transition-all ${
              status === 'In Transit'
                ? 'bg-rose-500 hover:bg-rose-400 shadow-2xl shadow-rose-500/30 active:scale-95'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <span className="text-4xl">🔴</span>
            <div className="text-center">
              <p className="text-2xl">पोहोचलो</p>
              <p className="text-base font-normal opacity-90">Journey Completed</p>
            </div>
          </button>
        </div>

        {/* Work log — shown after journey ends */}
        {showWorkLog && (
          <WorkLogSection
            staffId={staffId}
            prefilledTask={`🚌 मार्ग ${route.routeNo} — सकाळची सफर पूर्ण / Route ${route.routeNo} Morning Trip Completed`}
          />
        )}

        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-white/30 hover:text-white/60 text-sm transition-all mt-6">
          <LogOut className="w-4 h-4" /> बाहेर जा / Log Out
        </button>
      </div>
    </div>
  );
}

// ─── HELPER / PEON / CLEANING VIEW ──────────────────────────────────────────
function HelperView({ staffId, staffName, onLogout }: { staffId: string; staffName: string; onLogout: () => void }) {
  const [punchStatus, setPunchStatus] = useState<PunchStatus>('Not Punched In');
  const [punchInTime, setPunchInTime] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePunchIn = () => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    setPunchInTime(now);
    setPunchStatus('On Duty');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    toast.success(`✅ हजेरी नोंदवली — ${now} / Attendance marked at ${now}`);
  };
  const handlePunchOut = () => {
    setPunchStatus('Punched Out');
    toast.success('👋 उद्या भेटू! / See you tomorrow!');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-10">
      <div className="max-w-md mx-auto p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">कर्मचारी / Staff</p>
              <p className="font-bold">{staffName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">वेळ / Time</p>
            <p className="text-sm font-mono font-bold text-white/80"><LiveClock /></p>
          </div>
        </div>

        {/* Status card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
          <p className="text-xs text-white/40 mb-1">स्थिती / Status</p>
          <p className={`font-semibold text-lg ${
            punchStatus === 'Not Punched In' ? 'text-slate-400' :
            punchStatus === 'On Duty' ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {punchStatus === 'Not Punched In' ? '⏰ हजेरी नाही / Not Punched In' :
             punchStatus === 'On Duty' ? `✅ ड्यूटीवर — ${punchInTime} पासून / On Duty since ${punchInTime}` :
             '👋 ड्यूटी संपली / Punched Out'}
          </p>
          {punchStatus === 'On Duty' && (
            <p className="text-xs text-white/40 mt-1.5">आज: {punchInTime} — हजर / Today: {punchInTime} — present</p>
          )}
        </div>

        {showSuccess && (
          <div className="flex flex-col items-center py-4 gap-2">
            <CheckCircle2 className="w-16 h-16 text-emerald-400" />
            <p className="text-emerald-400 font-bold text-lg">✅ हजेरी नोंदवली — {punchInTime}</p>
            <p className="text-white/50 text-sm">Attendance marked successfully!</p>
          </div>
        )}

        {/* Punch buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handlePunchIn}
            disabled={punchStatus !== 'Not Punched In'}
            className={`w-full rounded-3xl flex flex-col items-center justify-center gap-3 py-12 font-bold text-xl transition-all ${
              punchStatus === 'Not Punched In'
                ? 'bg-emerald-500 hover:bg-emerald-400 shadow-2xl shadow-emerald-500/30 active:scale-95'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <span className="text-4xl">🟢</span>
            <div className="text-center">
              <p className="text-2xl">मी आलो</p>
              <p className="text-base font-normal opacity-90">I&apos;m Here — Punch In</p>
            </div>
          </button>
          <button
            onClick={handlePunchOut}
            disabled={punchStatus !== 'On Duty'}
            className={`w-full rounded-3xl flex flex-col items-center justify-center gap-3 py-12 font-bold text-xl transition-all ${
              punchStatus === 'On Duty'
                ? 'bg-rose-500 hover:bg-rose-400 shadow-2xl shadow-rose-500/30 active:scale-95'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <span className="text-4xl">🔴</span>
            <div className="text-center">
              <p className="text-2xl">मी निघतो</p>
              <p className="text-base font-normal opacity-90">I&apos;m Leaving — Punch Out</p>
            </div>
          </button>
        </div>

        {/* Work log after punch-in */}
        {punchStatus === 'On Duty' && <WorkLogSection staffId={staffId} />}

        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-white/30 hover:text-white/60 text-sm transition-all mt-6">
          <LogOut className="w-4 h-4" /> बाहेर जा / Log Out
        </button>
      </div>
    </div>
  );
}

// ─── WATCHMAN VIEW ───────────────────────────────────────────────────────────
const parsedVisitorDemo = {
  visitorName: 'श्री. नरेश गुप्ता',
  visitorPhone: '+91 99887 12345',
  purpose: 'Parent Meeting' as VisitorEntry['purpose'],
  meetingWith: 'Mr. Vinod Kale',
};

function WatchmanView({ staffId, staffName, onLogout }: { staffId: string; staffName: string; onLogout: () => void }) {
  const [punchStatus, setPunchStatus] = useState<PunchStatus>('Not Punched In');
  const [punchInTime, setPunchInTime] = useState('');
  const [visitors, setVisitors] = useState<VisitorEntry[]>(todayVisitors);
  const [activeTab, setActiveTab] = useState<'photo' | 'manual'>('photo');
  const [photoState, setPhotoState] = useState<PhotoScanState>('idle');
  const [parsedData, setParsedData] = useState<typeof parsedVisitorDemo | null>(null);
  const [vName, setVName] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vPurpose, setVPurpose] = useState<VisitorEntry['purpose']>('Parent Meeting');
  const [vMeetingWith, setVMeetingWith] = useState('');

  const inside = visitors.filter(v => !v.exitTime).length;

  const handlePunchIn = () => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    setPunchInTime(now);
    setPunchStatus('On Duty');
    toast.success(`✅ ड्यूटी सुरू — ${now} / On duty since ${now}`);
  };
  const handlePunchOut = () => {
    setPunchStatus('Punched Out');
    toast.success('👋 ड्यूटी पूर्ण! उद्या भेटू! / Duty complete! See you tomorrow!');
  };

  const handlePhotoCapture = () => {
    setPhotoState('scanning');
    setTimeout(() => {
      setPhotoState('parsed');
      setParsedData(parsedVisitorDemo);
    }, 2000);
  };

  const handleConfirmParsed = () => {
    if (!parsedData) return;
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    setVisitors(p => [{ id: `v${Date.now()}`, ...parsedData, entryTime: now, date: '13/03/2026' }, ...p]);
    setPhotoState('idle');
    setParsedData(null);
    toast.success(`✅ ${parsedData.visitorName} नोंदणी झाली / registered at ${now}`);
  };

  const handleRegisterManual = () => {
    if (!vName.trim() || !vMeetingWith.trim()) {
      toast.error('नाव आणि भेटण्याची व्यक्ती लिहा / Enter name and meeting person');
      return;
    }
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    setVisitors(p => [{ id: `v${Date.now()}`, visitorName: vName, visitorPhone: vPhone, purpose: vPurpose, meetingWith: vMeetingWith, entryTime: now, date: '13/03/2026' }, ...p]);
    setVName(''); setVPhone(''); setVMeetingWith('');
    toast.success(`${vName} नोंदणी झाली / registered at ${now}`);
  };

  const handleExit = (id: string) => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    setVisitors(p => p.map(v => v.id === id ? { ...v, exitTime: now } : v));
    toast.success('बाहेर गेले / Visitor exited');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-10">
      <div className="max-w-md mx-auto p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">चौकीदार / Watchman</p>
              <p className="font-bold">{staffName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">वेळ / Time</p>
            <p className="text-sm font-mono font-bold text-white/80"><LiveClock /></p>
          </div>
        </div>

        {/* Punch buttons (compact) */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={handlePunchIn}
            disabled={punchStatus !== 'Not Punched In'}
            className={`rounded-2xl flex flex-col items-center justify-center gap-2 py-5 font-bold transition-all ${
              punchStatus === 'Not Punched In' ? 'bg-emerald-500 hover:bg-emerald-400 active:scale-95' : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <span className="text-2xl">🟢</span>
            <div className="text-center">
              <p className="text-base">मी आलो</p>
              <p className="text-xs font-normal opacity-80">Punch In</p>
            </div>
          </button>
          <button
            onClick={handlePunchOut}
            disabled={punchStatus !== 'On Duty'}
            className={`rounded-2xl flex flex-col items-center justify-center gap-2 py-5 font-bold transition-all ${
              punchStatus === 'On Duty' ? 'bg-rose-500 hover:bg-rose-400 active:scale-95' : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <span className="text-2xl">🔴</span>
            <div className="text-center">
              <p className="text-base">मी निघतो</p>
              <p className="text-xs font-normal opacity-80">Punch Out</p>
            </div>
          </button>
        </div>

        {punchStatus === 'On Duty' && (
          <p className="text-xs text-emerald-400 text-center mb-3">✅ ड्यूटीवर — {punchInTime} पासून / On duty since {punchInTime}</p>
        )}

        {/* Visitor stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{visitors.length}</p>
            <p className="text-xs text-white/50">आजचे भेटीगार / Total Visitors</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{inside}</p>
            <p className="text-xs text-white/50">आत आहेत / Inside Now</p>
          </div>
        </div>

        {/* Visitor Registration */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
          <p className="font-bold text-base mb-1">भेटीगार नोंदणी</p>
          <p className="text-xs text-white/40 mb-4">Visitor Registration</p>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setActiveTab('photo')}
              className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                activeTab === 'photo' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'
              }`}
            >
              📸 फोटो अपलोड / Photo
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                activeTab === 'manual' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'
              }`}
            >
              ✍️ स्वतः लिहा / Manual
            </button>
          </div>

          {/* Photo Upload Tab */}
          {activeTab === 'photo' && (
            <div>
              {photoState === 'idle' && (
                <button
                  onClick={handlePhotoCapture}
                  className="w-full bg-blue-600/20 border-2 border-dashed border-blue-500/40 rounded-2xl py-10 flex flex-col items-center gap-3 hover:bg-blue-600/30 transition-all"
                >
                  <Camera className="w-10 h-10 text-blue-400" />
                  <div className="text-center">
                    <p className="font-semibold text-blue-300">रजिस्टरचा फोटो काढा</p>
                    <p className="text-xs text-white/50 mt-0.5">Take Photo of Register / Upload Image</p>
                  </div>
                </button>
              )}
              {photoState === 'scanning' && (
                <div className="w-full bg-white/5 rounded-2xl py-10 flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                  <div className="text-center">
                    <p className="font-semibold text-blue-300">AI वाचत आहे...</p>
                    <p className="text-xs text-white/50 mt-0.5">AI is reading the register...</p>
                  </div>
                </div>
              )}
              {photoState === 'parsed' && parsedData && (
                <div className="space-y-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                    <p className="text-xs text-emerald-400 font-semibold mb-2">✅ AI ने वाचले / AI Extracted:</p>
                    <div className="space-y-1">
                      <p className="text-sm text-white"><span className="text-white/50">नाव / Name:</span> {parsedData.visitorName}</p>
                      <p className="text-sm text-white"><span className="text-white/50">फोन / Phone:</span> {parsedData.visitorPhone}</p>
                      <p className="text-sm text-white"><span className="text-white/50">कारण / Purpose:</span> {parsedData.purpose}</p>
                      <p className="text-sm text-white"><span className="text-white/50">भेटणार / Meeting:</span> {parsedData.meetingWith}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setPhotoState('idle'); setParsedData(null); }}
                      className="flex-1 bg-white/10 hover:bg-white/15 text-white/70 text-sm rounded-xl py-2.5 transition-all"
                    >
                      ❌ परत / Retake
                    </button>
                    <button
                      onClick={handleConfirmParsed}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl py-2.5 transition-all"
                    >
                      ✅ बरोबर आहे / Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Entry Tab */}
          {activeTab === 'manual' && (
            <div className="space-y-3">
              <input
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="भेटीगाराचे नाव / Visitor Name *"
                value={vName}
                onChange={e => setVName(e.target.value)}
              />
              <input
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="फोन नंबर / Phone Number"
                value={vPhone}
                onChange={e => setVPhone(e.target.value)}
              />
              <select
                className="w-full bg-[#1e2d3d] border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={vPurpose}
                onChange={e => setVPurpose(e.target.value as VisitorEntry['purpose'])}
              >
                <option value="Parent Meeting">पालक भेट / Parent Meeting</option>
                <option value="Delivery">डिलिव्हरी / Delivery</option>
                <option value="Official Visit">अधिकृत भेट / Official Visit</option>
                <option value="Interview">मुलाखत / Interview</option>
                <option value="Other">इतर / Other</option>
              </select>
              <input
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="कुणाला भेटणार / Meeting With *"
                value={vMeetingWith}
                onChange={e => setVMeetingWith(e.target.value)}
              />
              <button
                onClick={handleRegisterManual}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl py-2.5 transition-all"
              >
                नोंदणी करा / Register Visitor
              </button>
            </div>
          )}
        </div>

        {/* Visitor log */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
          <p className="font-bold text-sm mb-3">आजचा लॉग / Today&apos;s Log ({visitors.length})</p>
          <div className="space-y-2">
            {visitors.map(v => (
              <div key={v.id} className="bg-white/5 rounded-xl p-3 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{v.visitorName}</p>
                  <p className="text-xs text-white/50">{v.purpose} · {v.meetingWith}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    आत / In: {v.entryTime}{v.exitTime ? ` · बाहेर / Out: ${v.exitTime}` : ' · आत आहे / Inside'}
                  </p>
                </div>
                {!v.exitTime && (
                  <button
                    onClick={() => handleExit(v.id)}
                    className="text-xs bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 px-2.5 py-1 rounded-lg flex-shrink-0 transition-all"
                  >
                    बाहेर / Exit
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Work log */}
        {punchStatus === 'On Duty' && <WorkLogSection staffId={staffId} />}

        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-white/30 hover:text-white/60 text-sm transition-all mt-4">
          <LogOut className="w-4 h-4" /> बाहेर जा / Log Out
        </button>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function StaffPortalPage() {
  const router = useRouter();
  const [staffData, setStaffData] = useState<{ id: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getStaffPortalLogin();
    setStaffData(data);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    clearStaffPortalLogin();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!staffData) { router.push('/'); return null; }

  if (staffData.role === 'Bus Driver')
    return <BusDriverView staffId={staffData.id} staffName={staffData.name} onLogout={handleLogout} />;
  if (staffData.role === 'Watchman')
    return <WatchmanView staffId={staffData.id} staffName={staffData.name} onLogout={handleLogout} />;
  return <HelperView staffId={staffData.id} staffName={staffData.name} onLogout={handleLogout} />;
}
