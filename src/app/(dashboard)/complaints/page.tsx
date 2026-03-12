'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, Clock, ChevronDown, Check, AlertCircle, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { complaints as allComplaints, students } from '@/data/seed-data';
import { formatDate } from '@/lib/utils';
import type { Complaint, ComplaintStatus, ComplaintPriority, ComplaintCategory } from '@/types';

const PAGE_SIZE = 10;

export default function ComplaintsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<ComplaintPriority | 'All'>('All');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newStatus, setNewStatus] = useState<Record<string, ComplaintStatus>>({});

  const filtered = useMemo(() => {
    let data = [...allComplaints];
    if (search) data = data.filter(c =>
      c.parentName.toLowerCase().includes(search.toLowerCase()) ||
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.complaintNo.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'All') data = data.filter(c => (newStatus[c.id] ?? c.status) === statusFilter);
    if (categoryFilter !== 'All') data = data.filter(c => c.category === categoryFilter);
    if (priorityFilter !== 'All') data = data.filter(c => c.priority === priorityFilter);
    return data;
  }, [search, statusFilter, categoryFilter, priorityFilter, newStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const total = allComplaints.length;
  const open = allComplaints.filter(c => (newStatus[c.id] ?? c.status) === 'Open').length;
  const inProgress = allComplaints.filter(c => (newStatus[c.id] ?? c.status) === 'In Progress').length;
  const resolved = allComplaints.filter(c => (newStatus[c.id] ?? c.status) === 'Resolved').length;

  const getStatus = (c: Complaint) => newStatus[c.id] ?? c.status;

  const priorityBadge = (p: ComplaintPriority) => {
    if (p === 'High') return <Badge variant="destructive">{p}</Badge>;
    if (p === 'Medium') return <Badge variant="warning">{p}</Badge>;
    return <Badge variant="secondary">{p}</Badge>;
  };

  const statusBadge = (s: ComplaintStatus) => {
    if (s === 'Open') return <Badge variant="destructive">{s}</Badge>;
    if (s === 'In Progress') return <Badge variant="warning">{s}</Badge>;
    return <Badge variant="success">{s}</Badge>;
  };

  const categoryBadge = (cat: ComplaintCategory) => {
    const colorMap: Record<ComplaintCategory, 'info' | 'warning' | 'destructive' | 'success' | 'purple' | 'secondary'> = {
      Transport: 'info', Academic: 'purple', Infrastructure: 'warning',
      'Fee Related': 'success', Canteen: 'secondary', Discipline: 'destructive', Other: 'secondary',
    };
    return <Badge variant={colorMap[cat]}>{cat}</Badge>;
  };

  const markResolved = (c: Complaint) => {
    setNewStatus(s => ({ ...s, [c.id]: 'Resolved' }));
    setSelected(null);
    toast.success(`Complaint ${c.complaintNo} marked as Resolved`);
  };

  const timelineSteps = (c: Complaint) => {
    const status = getStatus(c);
    const steps = [
      { label: 'Received', done: true, time: formatDate(c.createdAt) },
      { label: 'Auto-categorized by AI', done: true, time: formatDate(c.createdAt) },
      { label: `Assigned to ${c.assignedTo !== 'Unassigned' ? c.assignedTo : 'pending...'}`, done: c.assignedTo !== 'Unassigned', time: c.assignedTo !== 'Unassigned' ? formatDate(c.updatedAt) : '' },
      { label: 'In Progress', done: status === 'In Progress' || status === 'Resolved', time: status !== 'Open' ? formatDate(c.updatedAt) : '' },
      { label: 'Resolved', done: status === 'Resolved', time: status === 'Resolved' ? formatDate(c.updatedAt) : '' },
    ];
    return steps;
  };

  return (
    <div className="page-enter">
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Complaint Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and resolve parent & student complaints</p>
        </div>
        <Button variant="primary" className="gap-2" onClick={() => setShowNew(true)}>
          <Plus className="w-4 h-4" /> New Complaint
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: total, color: 'text-foreground' },
          { label: 'Open', value: open, color: 'text-rose-600 dark:text-rose-400' },
          { label: 'In Progress', value: inProgress, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Resolved', value: resolved, color: 'text-emerald-600 dark:text-emerald-400' },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, ID, description..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v as ComplaintCategory | 'All'); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {(['All', 'Transport', 'Academic', 'Infrastructure', 'Fee Related', 'Canteen', 'Discipline', 'Other'] as const).map(v => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as ComplaintStatus | 'All'); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {(['All', 'Open', 'In Progress', 'Resolved'] as const).map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={v => { setPriorityFilter(v as ComplaintPriority | 'All'); setPage(1); }}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            {(['All', 'High', 'Medium', 'Low'] as const).map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Complaints cards/table */}
      <div className="space-y-2">
        {paged.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No complaints match your filters</CardContent></Card>
        ) : (
          paged.map(complaint => {
            const status = getStatus(complaint);
            return (
              <Card key={complaint.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelected(complaint)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{complaint.complaintNo}</span>
                        {priorityBadge(complaint.priority)}
                        {statusBadge(status)}
                        {categoryBadge(complaint.category)}
                      </div>
                      <p className="font-semibold text-sm text-foreground">{complaint.parentName} — <span className="font-normal text-muted-foreground">{(() => { const match = students.find(s => s.name === complaint.studentName); return match ? <Link href={`/student/${match.id}`} className="hover:text-emerald-600 hover:underline transition-colors font-medium">{complaint.studentName}</Link> : complaint.studentName; })()}</span></p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{complaint.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" /> {formatDate(complaint.createdAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">{complaint.assignedTo}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Complaint Detail Modal */}
      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 flex-wrap">
                <span>{selected.complaintNo}</span>
                {priorityBadge(selected.priority)}
                {statusBadge(getStatus(selected))}
              </DialogTitle>
              <DialogDescription>{selected.parentName} · {(() => { const match = students.find(s => s.name === selected.studentName); return match ? <Link href={`/student/${match.id}`} className="hover:text-emerald-600 hover:underline transition-colors font-medium">{selected.studentName}</Link> : selected.studentName; })()} · {formatDate(selected.createdAt)}</DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {/* Category */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Category</p>
                {categoryBadge(selected.category)}
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Complaint Details</p>
                <p className="text-sm text-foreground leading-relaxed bg-muted/50 p-3 rounded-xl">{selected.description}</p>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">Timeline</p>
                <div className="space-y-2">
                  {timelineSteps(selected).map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-emerald-500' : 'bg-muted border-2 border-muted-foreground/20'}`}>
                        {step.done && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <p className={`text-sm flex-1 ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                      {step.time && <p className="text-xs text-muted-foreground">{step.time}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Response */}
              {selected.aiResponse && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" /> AI Auto-Response Sent to Parent
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-3">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{selected.aiResponse}</p>
                  </div>
                </div>
              )}

              {/* Resolution */}
              {selected.resolution && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Resolution
                  </p>
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-xl p-3">
                    <p className="text-sm text-foreground">{selected.resolution}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { toast.success(`Assigned to staff`); setSelected(null); }}>
                  <ChevronDown className="w-4 h-4 mr-1" /> Assign
                </Button>
                {getStatus(selected) !== 'Resolved' && (
                  <Button variant="primary" className="flex-1 gap-2" onClick={() => markResolved(selected)}>
                    <Check className="w-4 h-4" /> Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* New Complaint Modal */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> New Complaint
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Parent / Student Name" />
            <Select><SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger><SelectContent>{(['Transport', 'Academic', 'Infrastructure', 'Fee Related', 'Canteen', 'Discipline', 'Other'] as const).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent>{(['High', 'Medium', 'Low'] as const).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
            <textarea className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]" placeholder="Describe the complaint..." />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1" onClick={() => { setShowNew(false); toast.success('Complaint registered & AI response sent!'); }}>Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
