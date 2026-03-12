'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Camera, FileText, BookOpen, AlertTriangle, Users, Bot, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getGreeting } from '@/lib/utils';
import { getTeacherName } from '@/lib/store';
import { teacherTimetables, syllabusProgress } from '@/data/seed-data';

// Today's schedule for Mr. Vinod Kale
const todaySchedule = teacherTimetables.find(t => t.teacherId === 'st3')?.schedule ?? [];

const myClasses = [
  { classDiv: 'Class 7A', students: 35, attendance: 89, syllabusTeacherId: 'st3', syllabusClass: 'Class 7A' },
  { classDiv: 'Class 7B', students: 32, attendance: 82, syllabusTeacherId: 'st3', syllabusClass: 'Class 7B' },
  { classDiv: 'Class 9A', students: 40, attendance: 78, syllabusTeacherId: 'st3', syllabusClass: 'Class 9A' },
];

const alerts = [
  { type: 'warning', icon: '⚠️', text: 'You are assigned as substitute for Class 11A (Physics, Period 7) today' },
  { type: 'danger', icon: '🔴', text: '3 students in Class 7A have attendance below 75%' },
  { type: 'info', icon: '📢', text: 'New circular: Annual Day rehearsal schedule posted' },
  { type: 'pending', icon: '📝', text: 'Weekly test marks for Class 9A pending submission' },
];

export default function TeacherDashboard() {
  const [teacherName, setTeacherName] = useState('Mr. Vinod Kale');

  useEffect(() => {
    const name = getTeacherName();
    if (name) setTeacherName(name);
  }, []);

  const getSyllabusPercent = (teacherId: string, classDiv: string) => {
    const progress = syllabusProgress.find(s => s.teacherId === teacherId && s.classDiv === classDiv);
    if (!progress) return 0;
    const completed = progress.chapters.filter(c => c.status === 'Completed').length;
    return Math.round((completed / progress.totalChapters) * 100);
  };

  const periodTypeColor = (type: string) => {
    if (type === 'teaching') return 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800';
    if (type === 'substitute') return 'bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800';
    return 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700';
  };

  const periodBadge = (type: string) => {
    if (type === 'teaching') return <Badge variant="success" className="text-xs">Teaching</Badge>;
    if (type === 'substitute') return <Badge variant="warning" className="text-xs">Substitute</Badge>;
    return <Badge variant="secondary" className="text-xs">Free</Badge>;
  };

  return (
    <div className="page-enter max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{getGreeting()}, {teacherName} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Thursday, 12 March 2026 · Mathematics Department</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Camera, label: 'Upload Attendance', href: '/teacher/attendance', color: 'bg-blue-500', light: 'from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20' },
          { icon: FileText, label: 'Enter Test Marks', href: '/teacher/marks', color: 'bg-purple-500', light: 'from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/20' },
          { icon: BookOpen, label: 'Update Syllabus', href: '/teacher/syllabus', color: 'bg-emerald-500', light: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20' },
        ].map(item => (
          <Link key={item.href} href={item.href}>
            <Card className={`border-0 shadow-sm bg-gradient-to-br ${item.light} cursor-pointer hover:shadow-md transition-all`}>
              <CardContent className="p-5 text-center">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-3 mx-auto`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-sm">{item.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{"Today's Schedule"}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {todaySchedule.map(period => (
                <div key={period.period} className={`flex items-center gap-3 p-3 rounded-xl border ${periodTypeColor(period.type)}`}>
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs font-bold text-muted-foreground">P{period.period}</p>
                    <p className="text-xs text-muted-foreground">{period.startTime}</p>
                    <p className="text-xs text-muted-foreground">{period.endTime}</p>
                  </div>
                  <div className="flex-1">
                    {period.classDiv ? (
                      <>
                        <p className="font-semibold text-sm">{period.classDiv}</p>
                        <p className="text-xs text-muted-foreground">{period.subject}</p>
                      </>
                    ) : (
                      <p className="font-medium text-sm text-muted-foreground">Free Period</p>
                    )}
                  </div>
                  {periodBadge(period.type)}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* My Classes Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" /> My Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {myClasses.map(cls => {
                  const syllPct = getSyllabusPercent(cls.syllabusTeacherId, cls.syllabusClass);
                  return (
                    <div key={cls.classDiv} className="bg-muted/30 rounded-xl p-4 border border-border">
                      <p className="font-bold text-sm mb-3">{cls.classDiv}</p>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex justify-between"><span>Students</span><span className="font-semibold text-foreground">{cls.students}</span></div>
                        <div className="flex justify-between"><span>Avg Attendance</span><span className={`font-semibold ${cls.attendance >= 85 ? 'text-emerald-600' : cls.attendance >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>{cls.attendance}%</span></div>
                        <div className="flex justify-between"><span>Syllabus</span><span className="font-semibold text-foreground">{syllPct}% done</span></div>
                      </div>
                      <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${syllPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div className="space-y-4">
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" /> Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 bg-background rounded-xl border border-border text-sm">
                  <span className="text-base flex-shrink-0">{alert.icon}</span>
                  <p className="text-xs leading-relaxed text-foreground">{alert.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Insight */}
          <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-500" /> AI Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {"Class 7A's average has improved from 62% to 71% over the last 3 tests. Class 9A syllabus is slightly behind schedule — consider covering Chapter 10 (Circles) before the unit test on 25th March. 3 students in Class 7A need attendance intervention."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
