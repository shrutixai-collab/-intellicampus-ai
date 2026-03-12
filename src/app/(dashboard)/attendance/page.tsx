'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle, Send, Download, Search, Users, UserCheck, UserX, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { students } from '@/data/seed-data';
import { getAttendanceColor, getAttendanceBg, exportToCSV } from '@/lib/utils';

// Build class-wise attendance summary
function buildClassSummary() {
  const classMap = new Map<string, { present: number; total: number }>();
  students.forEach(s => {
    const entry = classMap.get(s.classDiv) ?? { present: 0, total: 0 };
    entry.total++;
    // Simulate: attendance > 75 = "present today", else we assume 70% present rate
    if (s.attendance > 75) entry.present++;
    classMap.set(s.classDiv, entry);
  });
  return Array.from(classMap.entries()).map(([cls, { present, total }]) => ({
    class: cls,
    present,
    absent: total - present,
    total,
    pct: Math.round((present / total) * 100),
  })).sort((a, b) => a.class.localeCompare(b.class));
}

export default function AttendancePage() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [sendingWarnings, setSendingWarnings] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);
  const [selectedNotif, setSelectedNotif] = useState<null | {parent: string; student: string; classDiv: string; status: string; time: string; parentName: string; phone: string; studentId: string; parentFull: string; studentFull: string}>(null);

  const classSummary = useMemo(() => buildClassSummary(), []);

  const atRiskStudents = useMemo(() =>
    students.filter(s => s.attendance < 75).sort((a, b) => a.attendance - b.attendance),
    []
  );

  const filteredStudents = useMemo(() => {
    let data = [...students];
    if (search) data = data.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.classDiv.toLowerCase().includes(search.toLowerCase()));
    if (riskFilter === 'At Risk') data = data.filter(s => s.attendance < 75);
    if (riskFilter === 'Warning') data = data.filter(s => s.attendance >= 75 && s.attendance < 85);
    if (riskFilter === 'Good') data = data.filter(s => s.attendance >= 85);
    return data;
  }, [search, riskFilter]);

  // Simulate today's counts
  const totalStudents = students.length;
  const presentToday = students.filter(s => s.attendance > 75).length;
  const absentToday = totalStudents - presentToday;
  const lateToday = 3;
  const todayRate = Math.round((presentToday / totalStudents) * 100);

  const handleSendWarnings = async () => {
    setSendingWarnings(true);
    await new Promise(r => setTimeout(r, 1500));
    setSendingWarnings(false);
    setShowWarningModal(false);
    toast.success(`Attendance warning sent to ${atRiskStudents.length} parents!`);
  };

  const maxMissable = (pct: number, totalClasses: number = 120) => {
    const attended = Math.round((pct / 100) * totalClasses);
    const minRequired = Math.ceil(0.75 * totalClasses);
    return Math.max(0, attended - minRequired + Math.floor((totalClasses - totalClasses) * 0.75));
  };

  const classesLeft = (pct: number) => {
    // Approximate remaining classes this semester
    const totalClasses = 120;
    const attended = Math.round((pct / 100) * totalClasses);
    const minRequired = Math.ceil(0.75 * totalClasses);
    const maxCanMiss = attended - minRequired;
    return Math.max(0, maxCanMiss);
  };

  return (
    <div className="page-enter">
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">Today: Thursday, 12 March 2026</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => { exportToCSV(students.map(s => ({ Name: s.name, Class: s.classDiv, Attendance: `${s.attendance}%` })), 'attendance-report'); toast.success('Exported!'); }}>
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, label: 'Total Students', value: totalStudents, color: 'bg-blue-500', light: 'from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20' },
          { icon: UserCheck, label: 'Present Today', value: presentToday, color: 'bg-emerald-500', light: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20' },
          { icon: UserX, label: 'Absent Today', value: absentToday, color: 'bg-rose-500', light: 'from-rose-50 to-rose-100/50 dark:from-rose-950/40 dark:to-rose-900/20' },
          { icon: Clock, label: 'Attendance Rate', value: `${todayRate}%`, color: 'bg-amber-500', light: 'from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20' },
        ].map(s => (
          <Card key={s.label} className={`border-0 shadow-sm bg-gradient-to-br ${s.light}`}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Class-wise attendance grid */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Class-wise Attendance Today</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5">
                {classSummary.map(cls => (
                  <div key={cls.class} className="flex items-center gap-4">
                    <div className="w-36 flex-shrink-0">
                      <p className="text-sm font-medium text-foreground truncate">{cls.class}</p>
                      <p className="text-xs text-muted-foreground">{cls.present}/{cls.total} present</p>
                    </div>
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getAttendanceBg(cls.pct)}`}
                        style={{ width: `${cls.pct}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold w-10 text-right ${getAttendanceColor(cls.pct)}`}>
                      {cls.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* At-Risk section */}
        <div>
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  At-Risk Students
                </CardTitle>
                <Badge variant="warning">{atRiskStudents.length}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Below 75% — exam eligibility risk</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {atRiskStudents.map(s => (
                  <div
                    key={s.id}
                    className="p-2.5 bg-background rounded-xl border border-border hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => setSelectedStudent(s)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <Link href={`/student/${s.id}`} className="text-sm font-semibold text-foreground truncate hover:text-emerald-600 hover:underline transition-colors">{s.name}</Link>
                        <p className="text-xs text-muted-foreground">{s.classDiv}</p>
                      </div>
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400 flex-shrink-0 ml-2">
                        {s.attendance}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${s.attendance}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="warning" className="w-full mt-3 gap-2" onClick={() => setShowWarningModal(true)}>
                <Send className="w-4 h-4" /> Send Warnings to Parents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All Students Table */}
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-semibold text-lg">All Students</h2>
          <div className="flex-1" />
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['All', 'At Risk', 'Warning', 'Good'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Card className="shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {['Student', 'Class', 'Attendance %', 'Status', 'Max Can Miss', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.slice(0, 15).map(s => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      <Link href={`/student/${s.id}`} className="hover:text-emerald-600 hover:underline transition-colors">{s.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.classDiv}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${getAttendanceBg(s.attendance)}`} style={{ width: `${s.attendance}%` }} />
                        </div>
                        <span className={`font-semibold text-xs ${getAttendanceColor(s.attendance)}`}>{s.attendance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {s.attendance < 75
                        ? <Badge variant="destructive">At Risk</Badge>
                        : s.attendance < 85
                          ? <Badge variant="warning">Warning</Badge>
                          : <Badge variant="success">Good</Badge>
                      }
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.attendance < 75
                        ? <span className="text-rose-600 dark:text-rose-400 font-medium">0 more classes</span>
                        : `${classesLeft(s.attendance)} classes`
                      }
                    </td>
                    <td className="px-4 py-3">
                      {s.attendance < 85 && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-amber-600" onClick={() => toast.success(`Warning sent to ${s.parentName}`)}>
                          Send Warning
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Parent Notifications Sent Today */}
      <div className="mt-6">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <span className="text-lg">📱</span> Parent Notifications Sent Today
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[
                { parent: 'Mrs. Sharma', student: 'Aarav', classDiv: '9A', status: 'absent', time: '9:15 AM', parentName: 'Mrs. Rajesh Sharma', phone: '020-12345678', studentId: 's1', parentFull: 'Mrs. Sharma', studentFull: 'Aarav Sharma' },
                { parent: 'Mr. Khan', student: 'Yusuf', classDiv: '11B', status: 'absent', time: '9:15 AM', parentName: 'Mr. Naseem Khan', phone: '020-12345678', studentId: 's9', parentFull: 'Mr. Khan', studentFull: 'Yusuf Khan' },
                { parent: 'Mrs. Desai', student: 'Ananya', classDiv: '10A', status: 'late', time: '9:20 AM', parentName: 'Mrs. Vivek Desai', phone: '020-12345678', studentId: 's4', parentFull: 'Mrs. Desai', studentFull: 'Ananya Desai' },
                { parent: 'Mr. Tiwari', student: 'Akash', classDiv: '7A', status: 'absent', time: '9:22 AM', parentName: 'Mr. Ramesh Tiwari', phone: '020-12345678', studentId: 's17', parentFull: 'Mr. Tiwari', studentFull: 'Akash Tiwari' },
                { parent: 'Mrs. Mane', student: 'Preeti', classDiv: '6A', status: 'absent', time: '9:25 AM', parentName: 'Mrs. Vijay Mane', phone: '020-12345678', studentId: 's22', parentFull: 'Mrs. Mane', studentFull: 'Preeti Mane' },
                { parent: 'Mr. Ansari', student: 'Mohammad Faraz', classDiv: '9B', status: 'absent', time: '9:26 AM', parentName: 'Mr. Irfan Sheikh', phone: '020-12345678', studentId: 's3', parentFull: 'Mr. Ansari', studentFull: 'Mohammad Faraz' },
              ].map((notif, i) => (
                <div key={i} className="px-4 py-3 flex items-start justify-between gap-3 hover:bg-muted/20 cursor-pointer"
                  onClick={() => setSelectedNotif(notif)}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notif.status === 'late' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                    <div>
                      <p className="text-sm font-medium">
                        ✅ {notif.parent} notified — <Link href={`/student/${notif.studentId}`} onClick={e => e.stopPropagation()} className="text-emerald-600 hover:underline">{notif.studentFull}</Link> ({notif.classDiv}) {notif.status} — WhatsApp sent at {notif.time}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${notif.status === 'late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'}`}>
                    {notif.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Preview Modal */}
      <Dialog open={!!selectedNotif} onOpenChange={o => !o && setSelectedNotif(null)}>
        {selectedNotif && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>WhatsApp Message Preview</DialogTitle>
              <DialogDescription>Sent to {selectedNotif.parentName} at {selectedNotif.time}</DialogDescription>
            </DialogHeader>
            <div className="bg-[#ECE5DD] dark:bg-[#1a2a1a] rounded-xl p-4">
              <div className="bg-white dark:bg-[#202c33] rounded-xl p-3.5 shadow-sm max-w-[85%]">
                <p className="text-sm leading-relaxed text-foreground">
                  Namaste {selectedNotif.parentFull} ji, aapka ward <strong>{selectedNotif.studentFull}</strong> aaj Class {selectedNotif.classDiv} mein {selectedNotif.status === 'late' ? 'late aaya hai' : 'absent hai'}. Agar ye galat hai toh school office ko call karein: {selectedNotif.phone}. — Delhi Public School, Pune
                </p>
                <p className="text-xs text-muted-foreground text-right mt-2">{selectedNotif.time} ✓✓</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedNotif(null)}
              className="w-full py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-all"
            >
              Close
            </button>
          </DialogContent>
        )}
      </Dialog>

      {/* Warning Modal */}
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Send Attendance Warnings
            </DialogTitle>
            <DialogDescription>
              {atRiskStudents.length} students below 75% attendance threshold
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-2">AI Warning Message Preview:</p>
              <p className="text-xs text-muted-foreground leading-relaxed font-mono whitespace-pre-line">
                {`Dear [Parent],

Aapke ward ${atRiskStudents[0]?.name} (${atRiskStudents[0]?.classDiv}) ki current attendance ${atRiskStudents[0]?.attendance}% hai.

⚠️ Minimum 75% attendance exam eligibility ke liye required hai. Is semester mein aur classes miss karna exam debarment ka risk hai.

Please ensure regular attendance immediately. Class teacher se contact karein for details.

— IntelliCampus AI, DPS Pune`}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowWarningModal(false)}>Cancel</Button>
              <Button variant="warning" className="flex-1 gap-2" onClick={handleSendWarnings} disabled={sendingWarnings}>
                {sendingWarnings
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  : <><Send className="w-4 h-4" /> Send to {atRiskStudents.length} Parents</>
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student detail modal */}
      <Dialog open={!!selectedStudent} onOpenChange={o => !o && setSelectedStudent(null)}>
        {selectedStudent && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedStudent.name}</DialogTitle>
              <DialogDescription>{selectedStudent.classDiv} · Roll #{selectedStudent.rollNo}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-rose-600">{selectedStudent.attendance}%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Current Attendance</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-amber-600">{classesLeft(selectedStudent.attendance)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Max Classes Can Miss</p>
                </div>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 rounded-xl">
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">Parent Contact</p>
                <p className="text-sm">{selectedStudent.parentName} · {selectedStudent.parentPhone}</p>
              </div>
              <Button variant="warning" className="w-full gap-2" onClick={() => { setSelectedStudent(null); toast.success(`Warning sent to ${selectedStudent.parentName}`); }}>
                <Send className="w-4 h-4" /> Send Warning to Parent
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
