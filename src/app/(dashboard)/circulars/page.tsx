'use client';

import { useState } from 'react';
import { Plus, Send, Bot, Eye, RefreshCw, Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { circulars } from '@/data/seed-data';
import { formatDate } from '@/lib/utils';
import type { CircularCategory } from '@/types';

const aiDrafts: Record<string, string> = {
  'Annual Day': `Dear Parents,

We are delighted to invite you to the Annual Day Celebration of [School Name] on Saturday, 28th March 2026 at 5:30 PM in the school auditorium.

Students from all classes will present cultural performances including classical dance, drama, music, and skits. A special felicitation ceremony will honour students for excellence in academics, sports, and arts.

Kindly note:
• Entry strictly by invitation card (1 card = 2 parents)
• Students performing must arrive by 3:30 PM in costume
• Parking available at Sports Ground (Gate 2)

We look forward to your gracious presence.

Warm regards,
Principal`,

  'Fee': `Dear Parents,

This is a reminder that the last date for payment of fees is approaching. Please ensure timely payment to avoid late fee charges and any disruption to your ward's academic activities.

Fee payment options:
1. Online NEFT/UPI transfer to school account
2. Cheque/DD at accounts office (Mon–Fri, 9 AM – 2 PM)
3. Cash at accounts counter

For installment requests or concession queries, please contact the Accounts Office before the deadline.

Thank you for your cooperation.
Accounts Department`,

  'Holiday': `Dear Parents,

Please note that the school/college will remain closed on [DATE] on account of [OCCASION].

Normal classes will resume on [NEXT WORKING DAY].

Students are advised to use this time productively. Online classes will NOT be conducted during this holiday.

Wishing everyone a wonderful [OCCASION]!

Admin Office`,

  'PTM': `Dear Parents,

The Parent-Teacher Meeting (PTM) is scheduled on [DATE] from [TIME] at the school premises.

Class-wise timings will be communicated by class teachers separately. Progress reports will be distributed during the PTM.

Attendance is mandatory for parents of students with:
• Attendance below 80%
• Unit test performance below 50%

Please bring your ward's diary and school ID.

We look forward to a productive interaction.

Academic Office`,

  'Exam': `Dear Parents and Students,

The examination schedule for the upcoming [EXAM NAME] has been finalized. Key dates are:

[LIST OF SUBJECTS AND DATES]

Students are advised to:
• Carry their Admit Card and school ID to every exam
• Report 30 minutes before the exam
• Review the complete syllabus as per textbooks

Wishing all students the very best!

Academic Office`,
};

function getAiDraft(title: string): string {
  const key = Object.keys(aiDrafts).find(k => title.toLowerCase().includes(k.toLowerCase()));
  return key ? aiDrafts[key] : `Dear Parents,\n\nPlease note the following important communication regarding "${title}".\n\n[Please add details here]\n\nKindly acknowledge receipt of this circular.\n\nThank you for your cooperation.\n\nAdmin Office, [School Name]`;
}

export default function CircularsPage() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<CircularCategory | 'All'>('All');
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState<typeof circulars[0] | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<CircularCategory>('Academic');
  const [newAudience, setNewAudience] = useState('All Parents');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [sending, setSending] = useState(false);

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

  const handleAiDraft = async () => {
    if (!newTitle.trim()) { toast.error('Enter a title first'); return; }
    setAiGenerating(true);
    await new Promise(r => setTimeout(r, 1200));
    setNewContent(getAiDraft(newTitle));
    setAiGenerating(false);
    toast.success('AI draft generated!');
  };

  const handleSend = async () => {
    if (!newTitle.trim() || !newContent.trim()) { toast.error('Fill in title and content'); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setShowNew(false);
    setNewTitle('');
    setNewContent('');
    toast.success('Circular sent to all selected recipients!');
  };

  const handleResend = async (c: typeof circulars[0]) => {
    const pending = c.totalRecipients - c.delivered;
    await new Promise(r => setTimeout(r, 800));
    toast.success(`Resent to ${pending} pending recipients!`);
  };

  return (
    <div className="page-enter">
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Circulars & Communication</h1>
          <p className="text-muted-foreground text-sm mt-1">Send and track school announcements</p>
        </div>
        <Button variant="primary" className="gap-2" onClick={() => setShowNew(true)}>
          <Plus className="w-4 h-4" /> Send New Circular
        </Button>
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
            const pending = circ.totalRecipients - circ.delivered;
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
                      {pending > 0 && (
                        <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => handleResend(circ)}>
                          <RefreshCw className="w-3.5 h-3.5" /> Resend ({pending})
                        </Button>
                      )}
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

      {/* New Circular Modal */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-500" /> Send New Circular
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Title</label>
                <Input placeholder="e.g. Annual Day Celebration 2026" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Category</label>
                <Select value={newCategory} onValueChange={v => setNewCategory(v as CircularCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(['Event', 'Academic', 'Administrative', 'Fee', 'Holiday'] as const).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Target Audience</label>
                <Select value={newAudience} onValueChange={setNewAudience}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['All Parents', 'Specific Classes', 'Staff Only', 'Students Only', 'All'].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Content</label>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7 px-2.5 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30" onClick={handleAiDraft} disabled={aiGenerating}>
                  {aiGenerating ? <><span className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" /> Generating...</> : <><Bot className="w-3.5 h-3.5" /> AI Draft</>}
                </Button>
              </div>
              <textarea
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[200px] resize-none"
                placeholder="Write your circular content here, or click 'AI Draft' to auto-generate..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
              />
            </div>

            {/* WhatsApp preview */}
            {newContent && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">WhatsApp Preview</p>
                <div className="bg-[#ECE5DD] dark:bg-[#1a2c35] rounded-xl p-4">
                  <div className="bubble-sent inline-block p-3 max-w-[85%] shadow-sm">
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold mb-1">📢 DPS Pune — Official</p>
                    <p className="text-xs text-gray-800 dark:text-gray-100 whitespace-pre-line leading-relaxed">{newContent.slice(0, 300)}{newContent.length > 300 ? '...' : ''}</p>
                    <p className="text-[10px] text-gray-500 mt-1 text-right">9:00 AM ✓✓</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1 gap-2" onClick={handleSend} disabled={sending}>
                {sending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Now</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
