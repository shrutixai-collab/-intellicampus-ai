'use client';

import { useState, useRef } from 'react';
import { Camera, PenLine, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { students } from '@/data/seed-data';

const myClasses = ['Class 7A', 'Class 7B', 'Class 9A'];
const examTypes = ['Weekly Test', 'Unit Test', 'Mid-Term', 'Final Exam'] as const;

function getSimulatedMarks(classDiv: string, totalMarks: number) {
  const classStudents = students.filter(s => s.classDiv === classDiv);
  return classStudents.map((s, i) => ({
    id: s.id,
    name: s.name,
    rollNo: s.rollNo,
    marks: Math.max(0, Math.floor(totalMarks * (0.4 + Math.random() * 0.5))),
    uncertain: i % 8 === 3,
  }));
}

export default function TeacherMarksPage() {
  const [activeTab, setActiveTab] = useState<'photo' | 'manual'>('photo');
  const [selectedClass, setSelectedClass] = useState(myClasses[0]);
  const [examType, setExamType] = useState<typeof examTypes[number]>('Weekly Test');
  const [testName, setTestName] = useState('');
  const [totalMarks, setTotalMarks] = useState('20');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadState, setUploadState] = useState<'idle' | 'processing' | 'done'>('idle');
  const [parsedMarks, setParsedMarks] = useState<Array<{ id: string; name: string; rollNo: string; marks: number; uncertain: boolean }>>([]);
  const [manualMarks, setManualMarks] = useState<Record<string, string>>({});
  const [bulkMark, setBulkMark] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const classStudents = students.filter(s => s.classDiv === selectedClass);

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    setUploadState('processing');
    await new Promise(r => setTimeout(r, 2000));
    setParsedMarks(getSimulatedMarks(selectedClass, parseInt(totalMarks) || 20));
    setUploadState('done');
  };

  const handleManualSubmit = () => {
    toast.success(`Marks for ${selectedClass} — ${testName || 'Test'} submitted successfully`);
    setManualMarks({});
    setTestName('');
    setBulkMark('');
  };

  const handleConfirmMarks = () => {
    toast.success(`Marks for ${selectedClass} — ${testName || 'Test'} submitted successfully`);
    setUploadState('idle');
    setParsedMarks([]);
    setTestName('');
  };

  const applyBulkMark = () => {
    const newMarks: Record<string, string> = {};
    classStudents.forEach(s => { newMarks[s.id] = bulkMark; });
    setManualMarks(newMarks);
  };

  return (
    <div className="page-enter max-w-4xl mx-auto">
      <Breadcrumb />
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Enter Marks</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload photo of marks register or enter manually</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button variant={activeTab === 'photo' ? 'primary' : 'outline'} onClick={() => setActiveTab('photo')} className="gap-2">
          <Camera className="w-4 h-4" /> Photo Upload
        </Button>
        <Button variant={activeTab === 'manual' ? 'primary' : 'outline'} onClick={() => setActiveTab('manual')} className="gap-2">
          <PenLine className="w-4 h-4" /> Manual Entry
        </Button>
      </div>

      {/* Common fields */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); setUploadState('idle'); setParsedMarks([]); }}>
          <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
          <SelectContent>{myClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={examType} onValueChange={v => setExamType(v as typeof examTypes[number])}>
          <SelectTrigger><SelectValue placeholder="Exam Type" /></SelectTrigger>
          <SelectContent>{examTypes.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="Test name (e.g. Chapter 5)" value={testName} onChange={e => setTestName(e.target.value)} />
        <div className="flex gap-2">
          <Input placeholder="Total marks" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} className="w-24" />
          <input type="date" value={testDate} onChange={e => setTestDate(e.target.value)}
            className="border border-border rounded-lg px-2 py-2 text-sm bg-background text-foreground flex-1" />
        </div>
      </div>

      {/* PHOTO TAB */}
      {activeTab === 'photo' && (
        <div className="space-y-4">
          {uploadState === 'idle' && (
            <Card className="border-2 border-dashed border-border hover:border-emerald-500/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-lg font-semibold mb-2">Upload photo of marks register</p>
                <p className="text-muted-foreground text-sm">AI will extract marks automatically</p>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }} />
              </CardContent>
            </Card>
          )}

          {uploadState === 'processing' && (
            <Card><CardContent className="p-12 text-center">
              <span className="w-10 h-10 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin block mx-auto mb-4" />
              <p className="text-lg font-semibold">AI is extracting marks...</p>
              <p className="text-muted-foreground text-sm">Parsing student names and scores</p>
            </CardContent></Card>
          )}

          {uploadState === 'done' && parsedMarks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">AI Parsed Marks — {selectedClass}</p>
                  <p className="text-sm text-muted-foreground">Avg: {Math.round(parsedMarks.reduce((a,b) => a + b.marks, 0) / parsedMarks.length)}/{totalMarks}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setUploadState('idle'); setParsedMarks([]); }}>Re-upload</Button>
              </div>
              {parsedMarks.filter(s => s.uncertain).length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <p>{parsedMarks.filter(s => s.uncertain).length} rows need confirmation</p>
                </div>
              )}
              <Card><CardContent className="p-0">
                <div className="divide-y divide-border">
                  {parsedMarks.map(student => (
                    <div key={student.id} className={`flex items-center justify-between px-4 py-3 ${student.uncertain ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
                      <div className="flex items-center gap-2">
                        {student.uncertain && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">Roll {student.rollNo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={student.marks}
                          onChange={e => setParsedMarks(prev => prev.map(s => s.id === student.id ? { ...s, marks: parseInt(e.target.value) || 0, uncertain: false } : s))}
                          className="w-14 text-center border border-border rounded-lg py-1 text-sm bg-background"
                          min={0} max={parseInt(totalMarks)}
                        />
                        <span className="text-xs text-muted-foreground">/ {totalMarks}</span>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {Math.round((student.marks / (parseInt(totalMarks) || 1)) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
              <Button variant="primary" className="w-full gap-2" onClick={handleConfirmMarks}>
                <CheckCircle className="w-4 h-4" /> Submit Marks
              </Button>
            </div>
          )}
        </div>
      )}

      {/* MANUAL TAB */}
      {activeTab === 'manual' && (
        <div className="space-y-4">
          {/* Bulk fill */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
            <p className="text-sm text-muted-foreground flex-1">Quick fill — all present students scored:</p>
            <Input value={bulkMark} onChange={e => setBulkMark(e.target.value)} placeholder="Marks" className="w-20" />
            <span className="text-sm text-muted-foreground">/ {totalMarks}</span>
            <Button variant="outline" size="sm" onClick={applyBulkMark}>Apply</Button>
          </div>

          <Card><CardContent className="p-0">
            <div className="divide-y divide-border">
              <div className="px-4 py-3 bg-muted/30 grid grid-cols-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <span>Student</span><span className="text-center">Roll No</span><span className="text-right">Marks / {totalMarks}</span>
              </div>
              {classStudents.map(student => (
                <div key={student.id} className="px-4 py-3 flex items-center">
                  <p className="text-sm font-medium flex-1">{student.name}</p>
                  <p className="text-sm text-muted-foreground text-center w-20">{student.rollNo}</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={manualMarks[student.id] ?? ''}
                      onChange={e => setManualMarks(prev => ({ ...prev, [student.id]: e.target.value }))}
                      placeholder="—"
                      className="w-16 text-center border border-border rounded-lg py-1 text-sm bg-background"
                      min={0} max={parseInt(totalMarks)}
                    />
                    <span className="text-xs text-muted-foreground">/ {totalMarks}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent></Card>
          <Button variant="primary" className="w-full" onClick={handleManualSubmit}>
            Submit Marks for {selectedClass}
          </Button>
        </div>
      )}
    </div>
  );
}
