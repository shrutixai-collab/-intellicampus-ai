'use client';
import { complaints } from '@/data/seed-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Breadcrumb from '@/components/layout/Breadcrumb';

const myClasses = ['Class 7A', 'Class 7B', 'Class 9A', 'Class 9B'];

export default function TeacherComplaintsPage() {
  const myComplaints = complaints.filter(c =>
    myClasses.some(cls => c.description.includes(cls) || (c.assignedTo && c.assignedTo.includes('Kale')))
  ).slice(0, 5);

  return (
    <div className="page-enter max-w-4xl mx-auto">
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-2">My Complaints</h1>
      <p className="text-muted-foreground text-sm mb-6">Complaints related to your classes</p>
      <div className="space-y-3">
        {myComplaints.map(c => (
          <Card key={c.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{c.complaintNo} — {c.studentName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.description.slice(0, 100)}...</p>
                </div>
                <Badge variant={c.status === 'Resolved' ? 'success' : c.status === 'Open' ? 'destructive' : 'warning'}>{c.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {myComplaints.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No complaints assigned to you</p>}
      </div>
    </div>
  );
}
