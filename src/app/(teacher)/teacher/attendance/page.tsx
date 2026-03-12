'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { students } from '@/data/seed-data';

const myClasses = ['Class 7A', 'Class 7B', 'Class 9A'];
type AttendanceStatus = 'Present' | 'Absent' | 'Late';

// Simulated AI OCR result
function getSimulatedOCRResult(classDiv: string) {
  const classStudents = students.filter(s => s.classDiv === classDiv);
  return classStudents.map((s, i) => ({
    id: s.id,
    name: s.name,
    rollNo: s.rollNo,
    status: (i % 7 === 3 ? 'Absent' : i % 11 === 5 ? 'Late' : 'Present') as AttendanceStatus,
    uncertain: i % 9 === 4, // AI is unsure about these
  }));
}

export default function TeacherAttendancePage() {
  const [activeTab, setActiveTab] = useState<'photo' | 'manual'>('photo');
  const [selectedClass, setSelectedClass] = useState(myClasses[0]);
  const [uploadState, setUploadState] = useState<'idle' | 'processing' | 'done'>('idle');
  const [attendanceData, setAttendanceData] = useState<Array<{ id: string; name: string; rollNo: string; status: AttendanceStatus; uncertain: boolean }>>([]);
  const [manualAttendance, setManualAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    setUploadState('processing');
    // Simulate AI OCR — wait 2 seconds, then show pre-populated results
    await new Promise(r => setTimeout(r, 2000));
    setAttendanceData(getSimulatedOCRResult(selectedClass));
    setUploadState('done');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoUpload(file);
  };

  const toggleStatus = (id: string, current: AttendanceStatus) => {
    const next: AttendanceStatus = current === 'Present' ? 'Absent' : current === 'Absent' ? 'Late' : 'Present';
    setAttendanceData(prev => prev.map(s => s.id === id ? { ...s, status: next, uncertain: false } : s));
  };

  const handleConfirmSubmit = () => {
    const present = attendanceData.filter(s => s.status === 'Present').length;
    const absent = attendanceData.filter(s => s.status === 'Absent').length;
    toast.success(`Attendance for ${selectedClass} submitted — ${present} present, ${absent} absent`);
    setUploadState('idle');
    setAttendanceData([]);
  };

  const handleManualSubmit = () => {
    const classStudents = students.filter(s => s.classDiv === selectedClass);
    const present = classStudents.filter(s => (manualAttendance[s.id] ?? 'Present') === 'Present').length;
    const absent = classStudents.filter(s => (manualAttendance[s.id] ?? 'Present') === 'Absent').length;
    toast.success(`Attendance for ${selectedClass} submitted — ${present} present, ${absent} absent`);
    setManualAttendance({});
  };

  const classStudents = students.filter(s => s.classDiv === selectedClass);

  return (
    <div className="page-enter max-w-4xl mx-auto">
      <Breadcrumb />
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mark Attendance</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload photo or enter manually</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'photo' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('photo')}
          className="gap-2"
        >
          <Camera className="w-4 h-4" /> Photo Upload
        </Button>
        <Button
          variant={activeTab === 'manual' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('manual')}
          className="gap-2"
        >
          <CheckCircle className="w-4 h-4" /> Manual Entry
        </Button>
      </div>

      {/* Class selector */}
      <div className="flex gap-3 mb-5">
        <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); setUploadState('idle'); setAttendanceData([]); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {myClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
      </div>

      {/* PHOTO UPLOAD TAB */}
      {activeTab === 'photo' && (
        <div className="space-y-4">
          {uploadState === 'idle' && (
            <Card className="border-2 border-dashed border-border hover:border-emerald-500/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-lg font-semibold mb-2">Click or tap to upload photo</p>
                <p className="text-muted-foreground text-sm mb-1">Take a photo of the attendance register</p>
                <p className="text-muted-foreground text-xs">On mobile: opens camera directly</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </CardContent>
            </Card>
          )}

          {uploadState === 'processing' && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin block" />
                </div>
                <p className="text-lg font-semibold mb-2">AI is processing your register...</p>
                <p className="text-muted-foreground text-sm">Reading student names and status from the photo</p>
              </CardContent>
            </Card>
          )}

          {uploadState === 'done' && attendanceData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">AI Parsed Results — {selectedClass}</p>
                  <p className="text-sm text-muted-foreground">
                    {attendanceData.filter(s => s.status === 'Present').length} Present ·{' '}
                    {attendanceData.filter(s => s.status === 'Absent').length} Absent ·{' '}
                    {attendanceData.filter(s => s.status === 'Late').length} Late
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setUploadState('idle'); setAttendanceData([]); }}>
                  Re-upload
                </Button>
              </div>

              {attendanceData.filter(s => s.uncertain).length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{attendanceData.filter(s => s.uncertain).length} rows highlighted — AI could not read clearly. Please confirm.</p>
                </div>
              )}

              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {attendanceData.map(student => (
                      <div key={student.id} className={`flex items-center justify-between px-4 py-3 ${student.uncertain ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
                        <div className="flex items-center gap-3">
                          {student.uncertain && <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                          <div>
                            <p className="text-sm font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">Roll {student.rollNo}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {student.uncertain && <span className="text-xs text-amber-600">Confirm?</span>}
                          <button onClick={() => toggleStatus(student.id, student.status)}>
                            {student.status === 'Present' ? (
                              <Badge variant="success" className="cursor-pointer">Present ↔</Badge>
                            ) : student.status === 'Absent' ? (
                              <Badge variant="destructive" className="cursor-pointer">Absent ↔</Badge>
                            ) : (
                              <Badge variant="warning" className="cursor-pointer">Late ↔</Badge>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button variant="primary" className="w-full gap-2" onClick={handleConfirmSubmit}>
                <CheckCircle className="w-4 h-4" />
                Confirm & Submit Attendance
              </Button>
            </div>
          )}
        </div>
      )}

      {/* MANUAL ENTRY TAB */}
      {activeTab === 'manual' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Backup option — use photo upload as primary method</p>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="px-4 py-3 bg-muted/30 grid grid-cols-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <span>Student</span>
                  <span className="text-center">Roll No</span>
                  <span className="text-right">Status</span>
                </div>
                {classStudents.map(student => {
                  const status = manualAttendance[student.id] ?? 'Present';
                  return (
                    <div key={student.id} className="px-4 py-3 flex items-center justify-between">
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground text-center">{student.rollNo}</p>
                      <div className="flex gap-1">
                        {(['Present', 'Absent', 'Late'] as AttendanceStatus[]).map(s => (
                          <button
                            key={s}
                            onClick={() => setManualAttendance(prev => ({ ...prev, [student.id]: s }))}
                            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                              status === s
                                ? s === 'Present' ? 'bg-emerald-500 text-white'
                                  : s === 'Absent' ? 'bg-rose-500 text-white'
                                  : 'bg-amber-500 text-white'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Button variant="primary" className="w-full" onClick={handleManualSubmit}>
            Submit Attendance for {selectedClass}
          </Button>
        </div>
      )}
    </div>
  );
}
