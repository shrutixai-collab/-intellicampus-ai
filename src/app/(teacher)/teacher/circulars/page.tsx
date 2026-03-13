'use client';

import { useState } from 'react';
import { Eye, RefreshCw, Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { circulars } from '@/data/seed-data';
import { formatDate } from '@/lib/utils';
import type { CircularCategory } from '@/types';

export default function TeacherCircularsPage() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<CircularCategory | 'All'>('All');
  const [showDetail, setShowDetail] = useState<typeof circulars[0] | null>(null);

  const filtered = circulars.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || c.category === catFilter;
    return matchSearch && matchCat;
  });

  const catBadge = (cat: CircularCategory) => {
    const v: Record<CircularCategory, 'info' | 'warning' | 'success' | 'destructive' | 'purple' | 'secondary'> = {
      Event: 'info', Academic: 'purple', Administrative: 'secondary', Fee: 'warning', Holiday: 'success',
    };
    return <Badge variant={v[cat]}>{cat}</Badge>;
  };

  return (
    <div className="page-enter">
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Circulars & Communication</h1>
          <p className="text-muted-foreground text-sm mt-1">School announcements and notices</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Circulars', value: circulars.length },
          { label: 'Total Sent', value: circulars.reduce((s, c) => s + c.delivered, 0).toLocaleString('en-IN') },
          { label: 'Total Read', value: circulars.reduce((s, c) => s + c.read, 0).toLocaleString('en-IN') },
          { label: 'Avg Read Rate', value: `${Math.round(circulars.reduce((s, c) => s + (c.read / c.totalRecipients * 100), 0) / circulars.length)}%` },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search circulars..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={v => setCatFilter(v as CircularCategory | 'All')}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {(['All', 'Event', 'Academic', 'Administrative', 'Fee', 'Holiday'] as const).map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2" onClick={() => toast.success('Exported!')}>
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      {/* Circular cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No circulars found</CardContent></Card>
        ) : (
          filtered.map(circ => {
            const deliveryPct = Math.round((circ.delivered / circ.totalRecipients) * 100);
            const readPct = Math.round((circ.read / circ.totalRecipients) * 100);
            return (
              <Card key={circ.id} className="hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {catBadge(circ.category)}
                        <span className="text-xs text-muted-foreground">{formatDate(circ.sentAt)}</span>
                        <span className="text-xs text-muted-foreground">· {circ.targetAudience}</span>
                      </div>
                      <h3 className="font-semibold text-foreground">{circ.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{circ.content.split('\n')[2] || circ.content.slice(0, 120)}</p>

                      {/* Delivery stats */}
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground w-16">Delivered</span>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${deliveryPct}%` }} />
                          </div>
                          <span className="font-medium w-24 text-right">{circ.delivered}/{circ.totalRecipients} ({deliveryPct}%)</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground w-16">Read</span>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${readPct}%` }} />
                          </div>
                          <span className="font-medium w-24 text-right">{circ.read}/{circ.totalRecipients} ({readPct}%)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setShowDetail(circ)}>
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* View detail modal */}
      <Dialog open={!!showDetail} onOpenChange={o => !o && setShowDetail(null)}>
        {showDetail && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{showDetail.title}</DialogTitle>
              <DialogDescription>{catBadge(showDetail.category)} · Sent on {formatDate(showDetail.sentAt)} · {showDetail.targetAudience}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Sent', value: showDetail.delivered, color: 'text-emerald-600' },
                  { label: 'Read', value: showDetail.read, color: 'text-blue-600' },
                  { label: 'Pending', value: showDetail.totalRecipients - showDetail.delivered, color: 'text-amber-600' },
                ].map(s => (
                  <div key={s.label} className="text-center p-3 bg-muted/50 rounded-xl">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{showDetail.content}</p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
