'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { IndianRupee, Search, Download, Plus, Send, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { students } from '@/data/seed-data';
import { formatCurrency, formatDate, exportToCSV } from '@/lib/utils';
import type { Student, FeeStatus } from '@/types';

type SortKey = 'name' | 'totalFee' | 'paidFee' | 'pending';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

const reminderMessages = [
  {
    label: '1st Reminder (Polite)',
    color: 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800',
    badgeVariant: 'success' as const,
    text: (s: Student) => `Namaste ${s.parentName} ji 🙏\n\nYeh ek gentle reminder hai ki ${s.name} ki fees ₹${(s.totalFee - s.paidFee).toLocaleString('en-IN')} pending hai is semester ke liye.\n\nKripya jald se jald payment arrange karein.\nKisi bhi query ke liye school office se contact karein.\n\nShukriya!\n— ${s.name.split(' ')[0]} School, Pune`,
  },
  {
    label: '2nd Reminder (Firm)',
    color: 'border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800',
    badgeVariant: 'warning' as const,
    text: (s: Student) => `Dear ${s.parentName} ji,\n\nYeh ${s.name} ki pending fees ka doosra reminder hai. Amount: ₹${(s.totalFee - s.paidFee).toLocaleString('en-IN')}\n\nDeadline 15th March 2026 thi. Kripya 3 dinon mein payment karein warna late fee charges lagenge. Installment options ke liye accounts office visit karein.\n\n— School Administration`,
  },
  {
    label: '3rd Reminder (Final)',
    color: 'border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800',
    badgeVariant: 'destructive' as const,
    text: (s: Student) => `Dear ${s.parentName},\n\n⚠️ URGENT: ${s.name} ki fees ₹${(s.totalFee - s.paidFee).toLocaleString('en-IN')} significantly overdue hai.\n\nSchool policy ke anusaar, pending fees ke chalte exam hall tickets withheld ki ja sakti hain.\n\nKripya aaj hi accounts office visit karein ya 020-27356789 par call karein. Yeh ek urgent matter hai.\n\n— Principal, DPS Pune`,
  },
];

export default function FeesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FeeStatus | 'All'>('All');
  const [classFilter, setClassFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(0);

  // All unique classes
  const classes = ['All', ...Array.from(new Set(students.map(s => s.classDiv))).sort()];

  // Filtered + sorted data
  const filtered = useMemo(() => {
    let data = [...students];
    if (search) data = data.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.parentName.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'All') data = data.filter(s => s.feeStatus === statusFilter);
    if (classFilter !== 'All') data = data.filter(s => s.classDiv === classFilter);
    data.sort((a, b) => {
      let av: number | string, bv: number | string;
      if (sortKey === 'name') { av = a.name; bv = b.name; }
      else if (sortKey === 'totalFee') { av = a.totalFee; bv = b.totalFee; }
      else if (sortKey === 'paidFee') { av = a.paidFee; bv = b.paidFee; }
      else { av = a.totalFee - a.paidFee; bv = b.totalFee - b.paidFee; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [search, statusFilter, classFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const totalExpected = students.reduce((s, st) => s + st.totalFee, 0);
  const totalCollected = students.reduce((s, st) => s + st.paidFee, 0);
  const totalPending = totalExpected - totalCollected;
  const recoveryRate = Math.round((totalCollected / totalExpected) * 100);
  const pendingStudents = students.filter(s => s.feeStatus !== 'Paid');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />;
  };

  const handleSendReminders = async () => {
    setSendingReminders(true);
    await new Promise(r => setTimeout(r, 1500));
    setSendingReminders(false);
    setShowReminderModal(false);
    toast.success(`${pendingStudents.length} reminders sent via WhatsApp successfully!`);
  };

  const handleExport = () => {
    exportToCSV(filtered.map(s => ({
      'Student Name': s.name,
      'Class': s.classDiv,
      'Parent': s.parentName,
      'Phone': s.parentPhone,
      'Total Fee': s.totalFee,
      'Paid': s.paidFee,
      'Pending': s.totalFee - s.paidFee,
      'Status': s.feeStatus,
    })), 'fee-report');
    toast.success('Fee report exported!');
  };

  const statusBadge = (status: FeeStatus) => {
    if (status === 'Paid') return <Badge variant="success">Paid</Badge>;
    if (status === 'Partial') return <Badge variant="warning">Partial</Badge>;
    return <Badge variant="destructive">Overdue</Badge>;
  };

  return (
    <div className="page-enter">
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Fee Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage student fee payments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Expected', value: formatCurrency(totalExpected), color: 'text-foreground' },
          { label: 'Total Collected', value: formatCurrency(totalCollected), color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Total Pending', value: formatCurrency(totalPending), color: 'text-rose-600 dark:text-rose-400' },
          { label: 'Recovery Rate', value: `${recoveryRate}%`, color: recoveryRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600', extra: <Progress value={recoveryRate} className="mt-2 h-1.5 [&>div]:bg-emerald-500" /> },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              {s.extra}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Button variant="primary" className="gap-2" onClick={() => setShowReminderModal(true)}>
          <Send className="w-4 h-4" /> Send AI Reminders
        </Button>
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => toast.success('Payment recorded!')}>
          <Plus className="w-4 h-4" /> Record Payment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by student or parent..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={classFilter} onValueChange={v => { setClassFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Classes" /></SelectTrigger>
          <SelectContent>{classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as FeeStatus | 'All'); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            {(['All', 'Paid', 'Partial', 'Overdue'] as const).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {[
                  { key: 'name', label: 'Student' },
                  { key: null, label: 'Class' },
                  { key: null, label: 'Parent Phone' },
                  { key: 'totalFee', label: 'Total Fee' },
                  { key: 'paidFee', label: 'Paid' },
                  { key: 'pending', label: 'Pending' },
                  { key: null, label: 'Last Reminder' },
                  { key: null, label: 'Status' },
                  { key: null, label: 'Actions' },
                ].map(col => (
                  <th
                    key={col.label}
                    className={`text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap ${col.key ? 'cursor-pointer hover:text-foreground select-none' : ''}`}
                    onClick={() => col.key && handleSort(col.key as SortKey)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.key && <SortIcon k={col.key as SortKey} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">No students match your filters</td></tr>
              ) : (
                paged.map(student => (
                  <tr key={student.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">
                        <Link href={`/student/${student.id}`} className="hover:text-emerald-600 hover:underline transition-colors font-medium">{student.name}</Link>
                      </p>
                      <p className="text-xs text-muted-foreground">Roll #{student.rollNo}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{student.classDiv}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{student.parentPhone}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{formatCurrency(student.totalFee)}</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">{formatCurrency(student.paidFee)}</td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: student.totalFee - student.paidFee > 0 ? '#F43F5E' : '#10B981' }}>
                      {formatCurrency(student.totalFee - student.paidFee)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {student.lastReminder ? formatDate(student.lastReminder) : '—'}
                    </td>
                    <td className="px-4 py-3">{statusBadge(student.feeStatus)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => toast.info(`Viewing ${student.name}`)}>View</Button>
                        {student.feeStatus !== 'Paid' && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-emerald-600 hover:text-emerald-700" onClick={() => toast.success(`Reminder sent to ${student.parentName}`)}>Remind</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} students
            </p>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page + i - 2;
                if (pg < 1 || pg > totalPages) return null;
                return (
                  <Button key={pg} size="sm" variant={pg === page ? 'default' : 'outline'} onClick={() => setPage(pg)} className="w-8">
                    {pg}
                  </Button>
                );
              })}
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Reminder Modal */}
      <Dialog open={showReminderModal} onOpenChange={setShowReminderModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-500" />
              Send AI-Generated Fee Reminders
            </DialogTitle>
            <DialogDescription>
              {pendingStudents.length} parents with pending fees found. Preview and select reminder type.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Partial Payment', count: students.filter(s => s.feeStatus === 'Partial').length, color: 'text-amber-600' },
                { label: 'Overdue', count: students.filter(s => s.feeStatus === 'Overdue').length, color: 'text-rose-600' },
                { label: 'Total to Remind', count: pendingStudents.length, color: 'text-foreground' },
              ].map(s => (
                <div key={s.label} className="text-center p-3 bg-muted/50 rounded-xl">
                  <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Message previews */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">Select Reminder Type:</p>
              {reminderMessages.map((rm, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedReminder(i)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${rm.color} ${selectedReminder === i ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={rm.badgeVariant}>{rm.label}</Badge>
                    {selectedReminder === i && <Badge variant="success" className="text-xs">Selected</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono whitespace-pre-line leading-relaxed">
                    {rm.text(pendingStudents[0])}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowReminderModal(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1 gap-2" onClick={handleSendReminders} disabled={sendingReminders}>
                {sendingReminders ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send to {pendingStudents.length} Parents</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
