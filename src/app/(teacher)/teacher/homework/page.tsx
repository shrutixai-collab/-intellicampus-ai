'use client';

import { useState } from 'react';
import { BookOpen, Send, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Breadcrumb from '@/components/layout/Breadcrumb';

const myClasses = ['Class 7A', 'Class 7B', 'Class 9A'];

interface HomeworkEntry {
  id: string;
  classDiv: string;
  subject: string;
  description: string;
  dueDate: string;
  postedAt: string;
}

const initialHomework: HomeworkEntry[] = [
  { id: 'hw1', classDiv: 'Class 7A', subject: 'Mathematics', description: 'Complete Exercise 8.3 from NCERT — Questions 1 to 10. Show all steps.', dueDate: '14/03/2026', postedAt: '11/03/2026, 4:30 PM' },
  { id: 'hw2', classDiv: 'Class 9A', subject: 'Mathematics', description: 'Solve Chapter 9 worksheet on Parallelograms and Triangles. 15 questions.', dueDate: '13/03/2026', postedAt: '10/03/2026, 2:15 PM' },
  { id: 'hw3', classDiv: 'Class 7B', subject: 'Mathematics', description: 'Practice sums on Simple Equations — Textbook Ex 7.1 and 7.2.', dueDate: '13/03/2026', postedAt: '10/03/2026, 11:00 AM' },
  { id: 'hw4', classDiv: 'Class 9A', subject: 'Mathematics', description: 'Revision worksheet for Unit Test 2 — all topics from Chapters 1-8.', dueDate: '14/03/2026', postedAt: '09/03/2026, 3:45 PM' },
];

export default function TeacherHomeworkPage() {
  const [selectedClass, setSelectedClass] = useState(myClasses[0]);
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [homework, setHomework] = useState<HomeworkEntry[]>(initialHomework);

  const handlePost = () => {
    if (!description.trim()) { toast.error('Please enter homework description'); return; }
    const newHw: HomeworkEntry = {
      id: `hw${Date.now()}`,
      classDiv: selectedClass,
      subject: 'Mathematics',
      description,
      dueDate: dueDate ? dueDate.split('-').reverse().join('/') : 'No deadline',
      postedAt: new Date().toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    setHomework(prev => [newHw, ...prev]);
    setDescription('');
    setDueDate('');
    toast.success(`Homework posted for ${selectedClass} — parents will be notified`);
  };

  const myClassHomework = homework.filter(h => myClasses.includes(h.classDiv));

  return (
    <div className="page-enter max-w-4xl mx-auto">
      <Breadcrumb />
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Homework Tracker</h1>
        <p className="text-muted-foreground text-sm mt-1">Post homework for your classes and notify parents</p>
      </div>

      {/* Post Homework Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" /> Post New Homework
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
              <SelectContent>
                {myClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              value="Mathematics"
              readOnly
              className="bg-muted text-muted-foreground"
            />
            <div className="flex gap-2 items-center">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Due date:</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground flex-1"
              />
            </div>
          </div>
          <div>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the homework assignment... (e.g. Complete Exercise 5.3 from NCERT — Questions 1-8)"
              rows={3}
              className="text-sm"
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Parents will receive a WhatsApp notification when homework is posted</p>
            <Button variant="primary" className="gap-2" onClick={handlePost}>
              <Send className="w-4 h-4" /> Post Homework
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Homework List */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recently Posted</h2>
        <div className="space-y-3">
          {myClassHomework.map(hw => (
            <Card key={hw.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="info" className="text-xs">{hw.classDiv}</Badge>
                      <Badge variant="secondary" className="text-xs">{hw.subject}</Badge>
                      {hw.dueDate !== 'No deadline' && (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <Clock className="w-3 h-3" /> Due: {hw.dueDate}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{hw.description}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">Posted: {hw.postedAt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {myClassHomework.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-8">No homework posted yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
