'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, IndianRupee, MessageSquare, UserCheck, ArrowUpRight,
  Megaphone, CalendarCheck, Award, MessageCircle, Activity,
  AlertTriangle, Clock, AlertOctagon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { students, complaints, staff, activityFeed } from '@/data/seed-data';
import { formatCurrency, getGreeting, getTodayFormatted } from '@/lib/utils';
import { getSettings } from '@/lib/store';
import type { AppSettings } from '@/types';

const quickActions = [
  { icon: Megaphone, label: 'Send Circular', href: '/circulars', color: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900' },
  { icon: IndianRupee, label: 'Fee Status', href: '/fees', color: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900' },
  { icon: MessageSquare, label: 'Complaints', href: '/complaints', color: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900' },
  { icon: CalendarCheck, label: 'Attendance', href: '/attendance', color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900' },
  { icon: Award, label: 'Certificates', href: '/certificates', color: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900' },
  { icon: Users, label: 'Staff', href: '/staff', color: 'bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400', border: 'border-slate-100 dark:border-slate-900' },
];

export default function DashboardPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [emergencySending, setEmergencySending] = useState(false);
  const [emergencyTarget, setEmergencyTarget] = useState<'all' | 'parents' | 'staff'>('all');

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  // Compute stats from seed data
  const totalStudents = students.length;
  const paidStudents = students.filter(s => s.feeStatus === 'Paid').length;
  const totalExpected = students.reduce((sum, s) => sum + s.totalFee, 0);
  const totalCollected = students.reduce((sum, s) => sum + s.paidFee, 0);
  const recoveryRate = Math.round((totalCollected / totalExpected) * 100);
  const openComplaints = complaints.filter(c => c.status === 'Open').length;
  const highPriority = complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length;
  const presentStaff = staff.filter(s => s.status === 'Present').length;
  const totalStaff = staff.length;

  const role = settings?.role ?? 'Principal';
  const isCollege = settings?.institutionType === 'college';

  const localActivityFeed = [
    { id: 'emergency1', color: 'red' as const, message: '🚨 Emergency: School closed tomorrow due to heavy rain warning — sent to all parents', time: '2 mins ago', timestamp: Date.now() },
    ...activityFeed,
  ];

  const activityColors: Record<string, string> = {
    green: 'bg-emerald-500',
    blue: 'bg-blue-500',
    yellow: 'bg-amber-500',
    red: 'bg-rose-500',
  };

  return (
    <div className="page-enter">
      <Breadcrumb />

      {/* Emergency Broadcast Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setEmergencyMessage(`Important notice from ${settings?.institutionName ?? 'School'}:`); setShowEmergencyModal(true); }}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-rose-500/30 transition-all active:scale-95"
        >
          <AlertOctagon className="w-4 h-4" />
          Emergency Broadcast
        </button>
      </div>

      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {role} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{getTodayFormatted()}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {/* Total Students */}
        <Card className="stats-card border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <Badge variant="info" className="text-xs">+12 new</Badge>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalStudents}</p>
            <p className="text-sm font-medium text-foreground/70 mt-1">Total Students</p>
            <p className="text-xs text-muted-foreground mt-0.5">This academic year</p>
          </CardContent>
        </Card>

        {/* Fee Collection */}
        <Card className="stats-card border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-white" />
              </div>
              <Badge variant="success" className="text-xs">{recoveryRate}% collected</Badge>
            </div>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(totalCollected)}</p>
            <p className="text-sm font-medium text-foreground/70 mt-1">Fee Collection</p>
            <p className="text-xs text-muted-foreground mt-0.5">of {formatCurrency(totalExpected)} expected</p>
          </CardContent>
        </Card>

        {/* Open Complaints */}
        <Card className="stats-card border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              {highPriority > 0 && (
                <Badge variant="destructive" className="text-xs">{highPriority} high priority</Badge>
              )}
            </div>
            <p className="text-3xl font-bold text-foreground">{openComplaints}</p>
            <p className="text-sm font-medium text-foreground/70 mt-1">Open Complaints</p>
            <p className="text-xs text-muted-foreground mt-0.5">Needs attention</p>
          </CardContent>
        </Card>

        {/* Staff Attendance */}
        <Card className="stats-card border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <Badge variant="warning" className="text-xs">{totalStaff - presentStaff} on leave</Badge>
            </div>
            <p className="text-3xl font-bold text-foreground">{presentStaff}/{totalStaff}</p>
            <p className="text-sm font-medium text-foreground/70 mt-1">Staff Today</p>
            <p className="text-xs text-muted-foreground mt-0.5">Present this morning</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Activity Feed */}
        <div className="xl:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Live Activity Feed
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-dot" />
                  Live
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {localActivityFeed.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className={`activity-dot mt-1.5 flex-shrink-0 ${activityColors[item.color]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{item.message}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map(({ icon: Icon, label, href, color, border }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border ${border} ${color} hover:scale-[1.02] transition-all text-center`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-semibold leading-tight">{label}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900">
                <div className="w-2 h-2 bg-rose-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Fee Submission Deadline</p>
                  <p className="text-xs text-muted-foreground mt-0.5">15 March 2026 — <span className="text-rose-600 font-medium">3 days left</span></p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Parent-Teacher Meeting</p>
                  <p className="text-xs text-muted-foreground mt-0.5">18 March 2026 — 6 days left</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Annual Day Celebration</p>
                  <p className="text-xs text-muted-foreground mt-0.5">28 March 2026 — 16 days left</p>
                </div>
              </div>
              {isCollege && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">NAAC Document Submission</p>
                    <p className="text-xs text-muted-foreground mt-0.5">30 March 2026 — 18 days left</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* WhatsApp quick link */}
          <Link href="/chat">
            <Card className="bg-gradient-to-br from-[#25D366]/10 to-[#128C7E]/10 border-[#25D366]/30 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">WhatsApp AI Simulator</p>
                  <p className="text-xs text-muted-foreground mt-0.5">See how AI handles parent queries</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
      {/* Emergency Broadcast Modal */}
      <Dialog open={showEmergencyModal} onOpenChange={setShowEmergencyModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertOctagon className="w-5 h-5" /> Emergency Broadcast
            </DialogTitle>
            <DialogDescription>Send an urgent alert to parents, staff, or everyone immediately.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Message</label>
              <Textarea
                value={emergencyMessage}
                onChange={e => setEmergencyMessage(e.target.value)}
                rows={4}
                className="text-sm"
                placeholder="Type your emergency message..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Send To</label>
              <div className="flex gap-2">
                {(['all', 'parents', 'staff'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setEmergencyTarget(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                      emergencyTarget === t
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-background border-border text-muted-foreground hover:border-rose-300'
                    }`}
                  >
                    {t === 'all' ? 'All Parents + Staff' : t === 'parents' ? 'Parents Only' : 'Staff Only'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                disabled={emergencySending || !emergencyMessage.trim()}
                onClick={async () => {
                  setEmergencySending(true);
                  await new Promise(r => setTimeout(r, 1200));
                  setEmergencySending(false);
                  setShowEmergencyModal(false);
                  toast.success('Emergency alert sent to 470 parents and 20 staff members');
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
              >
                {emergencySending ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : (
                  <><AlertOctagon className="w-4 h-4" /> Send Emergency Alert</>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
