'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Download, Award, Clock, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { certificateRequests } from '@/data/seed-data';
import { formatDate, exportToCSV } from '@/lib/utils';
import type { CertificateStatus, CertificateType } from '@/types';

const PAGE_SIZE = 10;

export default function CertificatesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CertificateStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<CertificateType | 'All'>('All');
  const [page, setPage] = useState(1);
  const [statuses, setStatuses] = useState<Record<string, CertificateStatus>>({});
  const [showDetail, setShowDetail] = useState<typeof certificateRequests[0] | null>(null);

  const getStatus = (r: typeof certificateRequests[0]) => statuses[r.id] ?? r.status;

  const filtered = useMemo(() => {
    let data = [...certificateRequests];
    if (search) data = data.filter(r =>
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.requestNo.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'All') data = data.filter(r => getStatus(r) === statusFilter);
    if (typeFilter !== 'All') data = data.filter(r => r.type === typeFilter);
    return data;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, typeFilter, statuses]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    total: certificateRequests.length,
    pending: certificateRequests.filter(r => getStatus(r) === 'Pending').length,
    processing: certificateRequests.filter(r => getStatus(r) === 'Processing').length,
    ready: certificateRequests.filter(r => getStatus(r) === 'Ready').length,
    collected: certificateRequests.filter(r => getStatus(r) === 'Collected').length,
  };

  const statusBadge = (s: CertificateStatus) => {
    const v: Record<CertificateStatus, 'secondary' | 'warning' | 'success' | 'info'> = {
      Pending: 'secondary', Processing: 'warning', Ready: 'success', Collected: 'info',
    };
    return <Badge variant={v[s]}>{s}</Badge>;
  };

  const typeBadge = (t: CertificateType) => {
    const v: Record<CertificateType, 'info' | 'destructive' | 'purple' | 'warning' | 'secondary'> = {
      Bonafide: 'info', 'Transfer Certificate': 'destructive', 'Character Certificate': 'purple',
      'Migration Certificate': 'warning', NOC: 'secondary',
    };
    return <Badge variant={v[t]}>{t}</Badge>;
  };

  const nextStatus: Record<CertificateStatus, CertificateStatus | null> = {
    Pending: 'Processing', Processing: 'Ready', Ready: 'Collected', Collected: null,
  };

  const handleStatusUpdate = (req: typeof certificateRequests[0], next: CertificateStatus) => {
    setStatuses(s => ({ ...s, [req.id]: next }));
    if (next === 'Ready') {
      toast.success(`${req.requestNo} marked Ready — notification sent to ${req.studentName}!`, {
        description: `"${req.studentName}'s ${req.type} is ready for collection. Please visit school office with ID."`,
      });
    } else {
      toast.success(`${req.requestNo} status updated to ${next}`);
    }
  };

  return (
    <div className="page-enter">
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Certificate Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage student certificate issuance</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => { exportToCSV(certificateRequests.map(r => ({ 'Ref': r.requestNo, 'Student': r.studentName, 'Type': r.type, 'Status': r.status, 'Date': formatDate(r.requestDate) })), 'certificates'); toast.success('Exported!'); }}>
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: counts.total, color: 'text-foreground' },
          { label: 'Pending', value: counts.pending, color: 'text-muted-foreground' },
          { label: 'Processing', value: counts.processing, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Ready', value: counts.ready, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Collected', value: counts.collected, color: 'text-blue-600 dark:text-blue-400' },
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
          <Input placeholder="Search by student or reference..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={typeFilter} onValueChange={v => { setTypeFilter(v as CertificateType | 'All'); setPage(1); }}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Certificate Type" /></SelectTrigger>
          <SelectContent>
            {(['All', 'Bonafide', 'Transfer Certificate', 'Character Certificate', 'Migration Certificate', 'NOC'] as const).map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as CertificateStatus | 'All'); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {(['All', 'Pending', 'Processing', 'Ready', 'Collected'] as const).map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {['Ref No', 'Student', 'Class', 'Certificate Type', 'Request Date', 'Expected Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No requests found</td></tr>
              ) : (
                paged.map(req => {
                  const status = getStatus(req);
                  const next = nextStatus[status];
                  return (
                    <tr key={req.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => setShowDetail(req)}>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{req.requestNo}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <Link href={`/student/${req.studentId}`} className="hover:text-emerald-600 hover:underline transition-colors font-medium">{req.studentName}</Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{req.classDiv}</td>
                      <td className="px-4 py-3">{typeBadge(req.type)}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(req.requestDate)}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(req.expectedDate)}</td>
                      <td className="px-4 py-3">{statusBadge(status)}</td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        {next && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs px-2 gap-1" onClick={() => handleStatusUpdate(req, next)}>
                            <ChevronDown className="w-3 h-3" /> {next}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail modal */}
      <Dialog open={!!showDetail} onOpenChange={o => !o && setShowDetail(null)}>
        {showDetail && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                {showDetail.requestNo}
              </DialogTitle>
              <DialogDescription>
                <Link href={`/student/${showDetail.studentId}`} className="hover:text-emerald-600 hover:underline transition-colors font-medium">{showDetail.studentName}</Link> · {showDetail.classDiv}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Certificate Type</p>
                  {typeBadge(showDetail.type)}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  {statusBadge(getStatus(showDetail))}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Requested On</p>
                  <p className="text-sm font-medium">{formatDate(showDetail.requestDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expected By</p>
                  <p className="text-sm font-medium">{formatDate(showDetail.expectedDate)}</p>
                </div>
              </div>
              {showDetail.purpose && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Purpose</p>
                  <p className="text-sm text-foreground bg-muted/50 p-2.5 rounded-xl">{showDetail.purpose}</p>
                </div>
              )}
              {/* Status progression */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Update Status</p>
                <div className="flex gap-2">
                  {(['Pending', 'Processing', 'Ready', 'Collected'] as CertificateStatus[]).map(s => (
                    <Button
                      key={s}
                      size="sm"
                      variant={getStatus(showDetail) === s ? 'primary' : 'outline'}
                      className="flex-1 text-xs"
                      onClick={() => { handleStatusUpdate(showDetail, s); setShowDetail({ ...showDetail }); }}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
              {getStatus(showDetail) === 'Ready' && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">AI Notification Sent:</p>
                  <p className="text-xs text-muted-foreground">
                    {`"Dear Parent, ${showDetail.studentName}'s ${showDetail.type} (Ref: ${showDetail.requestNo}) is ready for collection from the school office. Office hours: 9 AM - 4 PM, Mon-Fri. Please bring valid ID proof."`}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
