'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, UserCheck, UserX, Clock, Bot, Send, Download, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { staff } from '@/data/seed-data';
import type { StaffStatus } from '@/types';

// Staff members who are absent — build substitute suggestions
const absentStaff = staff.filter(s => s.status !== 'Present');

// Find substitutes for absent teacher
function findSubstitute(absentTeacher: typeof staff[0]) {
  const available = staff.filter(s =>
    s.status === 'Present' &&
    s.id !== absentTeacher.id &&
    (s.subject.toLowerCase().includes(absentTeacher.subject.split(' ')[0].toLowerCase()) ||
     s.subject.toLowerCase().includes('mathematics') && absentTeacher.subject.toLowerCase().includes('math'))
  );
  return available[0] ?? staff.find(s => s.status === 'Present' && s.id !== absentTeacher.id) ?? null;
}

export default function StaffPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StaffStatus | 'All'>('All');
  const [selectedAbsent, setSelectedAbsent] = useState<typeof staff[0] | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, StaffStatus>>({});

  const getStatus = (s: typeof staff[0]) => localStatuses[s.id] ?? s.status;

  const filtered = useMemo(() => {
    let data = [...staff];
    if (search) data = data.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.subject.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'All') data = data.filter(s => getStatus(s) === statusFilter);
    return data;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, localStatuses]);

  const present = staff.filter(s => getStatus(s) === 'Present').length;
  const absent = staff.filter(s => getStatus(s) === 'Absent').length;
  const onLeave = staff.filter(s => getStatus(s) === 'Leave').length;

  const statusBadge = (s: StaffStatus) => {
    if (s === 'Present') return <Badge variant="success">Present</Badge>;
    if (s === 'Absent') return <Badge variant="destructive">Absent</Badge>;
    return <Badge variant="warning">On Leave</Badge>;
  };

  const borderColor = (s: StaffStatus) => {
    if (s === 'Present') return 'border-emerald-200 dark:border-emerald-800';
    if (s === 'Absent') return 'border-rose-200 dark:border-rose-800';
    return 'border-amber-200 dark:border-amber-800';
  };

  const bgColor = (s: StaffStatus) => {
    if (s === 'Present') return 'bg-emerald-50/50 dark:bg-emerald-950/20';
    if (s === 'Absent') return 'bg-rose-50/50 dark:bg-rose-950/20';
    return 'bg-amber-50/50 dark:bg-amber-950/20';
  };

  const absent_today = staff.filter(s => getStatus(s) !== 'Present');

  return (
    <div className="page-enter">
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{"Today's attendance & substitute management"}</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => toast.success('Staff report exported!')}>
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: UserCheck, label: 'Present', value: present, color: 'bg-emerald-500', light: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20' },
          { icon: UserX, label: 'Absent', value: absent, color: 'bg-rose-500', light: 'from-rose-50 to-rose-100/50 dark:from-rose-950/40 dark:to-rose-900/20' },
          { icon: Clock, label: 'On Leave', value: onLeave, color: 'bg-amber-500', light: 'from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20' },
        ].map(s => (
          <Card key={s.label} className={`border-0 shadow-sm bg-gradient-to-br ${s.light}`}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{s.label} today</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Substitute Suggestions */}
      {absent_today.length > 0 && (
        <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-500" />
              AI Substitute Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {absent_today.map(absentTeacher => {
              const substitute = findSubstitute(absentTeacher);
              return (
                <div key={absentTeacher.id} className="bg-background rounded-xl border border-border p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {absentTeacher.name} is {getStatus(absentTeacher).toLowerCase()} today
                      </p>
                      {absentTeacher.classes.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {absentTeacher.classes.map((cls, i) => (
                            <p key={i} className="text-xs text-rose-600 dark:text-rose-400">⚠️ {cls}</p>
                          ))}
                        </div>
                      )}
                      {substitute && (
                        <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg space-y-1.5">
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">AI Substitute Suggestions:</p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400">
                            🥇 <span className="font-semibold">Best:</span> {substitute.name} ({substitute.subject}) — Free during affected periods, syllabus 85% complete (ahead of schedule), can cover revision
                          </p>
                          {staff.filter(s => s.status === 'Present' && s.id !== absentTeacher.id && s.id !== substitute.id)[0] && (
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              🥈 <span className="font-semibold">Alternative:</span> {staff.filter(s => s.status === 'Present' && s.id !== absentTeacher.id && s.id !== substitute.id)[0].name} ({staff.filter(s => s.status === 'Present' && s.id !== absentTeacher.id && s.id !== substitute.id)[0].subject}) — Available if needed, can handle class
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {substitute && (
                        <Button size="sm" variant="primary" className="text-xs h-7 px-2.5 gap-1" onClick={() => toast.success(`${substitute.name} notified as substitute!`)}>
                          <Send className="w-3 h-3" /> Notify Sub
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-xs h-7 px-2.5 gap-1" onClick={() => toast.success('Students notified about class arrangement')}>
                        Notify Class
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or subject..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StaffStatus | 'All')}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(['All', 'Present', 'Absent', 'Leave'] as const).map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Staff cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(member => {
          const status = getStatus(member);
          return (
            <Card key={member.id} className={`border-2 ${borderColor(status)} ${bgColor(status)} hover:shadow-md transition-all cursor-pointer`} onClick={() => { if (status !== 'Present') setSelectedAbsent(member); }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#0F172A] dark:bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">{member.avatarInitials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/staff/${member.id}`} onClick={e => e.stopPropagation()} className="font-semibold text-sm text-foreground leading-tight truncate hover:text-emerald-600 hover:underline transition-colors">
                      {member.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{member.subject}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {statusBadge(status)}
                  <div className="flex gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={e => { e.stopPropagation(); toast.info(`Calling ${member.name}...`); }}
                    >
                      <Phone className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {member.classes.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground line-clamp-2">{member.classes[0]}{member.classes.length > 1 ? ` +${member.classes.length - 1} more` : ''}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Absent staff detail modal */}
      <Dialog open={!!selectedAbsent} onOpenChange={o => !o && setSelectedAbsent(null)}>
        {selectedAbsent && (() => {
          const sub = findSubstitute(selectedAbsent);
          const status = getStatus(selectedAbsent);
          return (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedAbsent.name}</DialogTitle>
                <DialogDescription>{selectedAbsent.subject} · {selectedAbsent.qualification}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {statusBadge(status)}
                  <span className="text-sm text-muted-foreground">{selectedAbsent.phone}</span>
                </div>

                {selectedAbsent.classes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Classes Affected Today</p>
                    <div className="space-y-1.5">
                      {selectedAbsent.classes.map((cls, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-100 dark:border-rose-900">
                          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                          <p className="text-xs text-foreground">{cls}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sub && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" /> AI Substitute Suggestions
                    </p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium">🥇 Best Match</p>
                        <p className="text-sm font-semibold text-foreground">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">{sub.subject} · Free during affected periods · Syllabus 85% complete (ahead of schedule)</p>
                      </div>
                      {(() => {
                        const alt = staff.find(s => s.status === 'Present' && s.id !== selectedAbsent.id && s.id !== sub.id);
                        return alt ? (
                          <div className="border-t border-border pt-2">
                            <p className="text-xs font-medium">🥈 Alternative</p>
                            <p className="text-sm font-semibold text-foreground">{alt.name}</p>
                            <p className="text-xs text-muted-foreground">{alt.subject} · Available if needed</p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {sub && (
                    <Button variant="primary" className="flex-1 gap-2" onClick={() => { toast.success(`${sub.name} notified as substitute for ${selectedAbsent.name}!`); setSelectedAbsent(null); }}>
                      <Send className="w-4 h-4" /> Notify {sub.name.split(' ')[0]}
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => { toast.success('Students notified!'); setSelectedAbsent(null); }}>
                    Notify Students
                  </Button>
                </div>
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>
    </div>
  );
}
