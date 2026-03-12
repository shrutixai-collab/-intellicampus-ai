'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, Calendar, GraduationCap, Bot, TrendingUp, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { staff, syllabusProgress, staffAttendanceHistory, testScores, students } from '@/data/seed-data';

type Tab = 'overview' | 'attendance' | 'syllabus' | 'performance';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function StaffProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const member = staff.find(s => s.id === id);
  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Staff member not found</p>
        <Link href="/staff" className="text-sm text-emerald-600 hover:underline">← Back to Staff</Link>
      </div>
    );
  }

  const history = staffAttendanceHistory.find(h => h.staffId === id);
  const mySyllabus = syllabusProgress.filter(s => s.teacherId === id);

  // Get classes taught from staff record
  const classesTeaching = member.classes.map(c => {
    const match = c.match(/^(Class \w+[\w\s()]*)\s*\(/);
    return match ? match[1] : c;
  }).filter((v, i, arr) => arr.indexOf(v) === i);

  // Per-class average from test scores
  const classPerformance = classesTeaching.map(cls => {
    const classStudents = students.filter(s => s.classDiv === cls);
    const classScores = testScores.filter(t => t.teacherId === id && t.classDiv === cls);
    if (classScores.length === 0) return null;
    const avgPct = Math.round(
      classScores.reduce((a, b) => a + (b.marksObtained / b.totalMarks) * 100, 0) / classScores.length
    );
    const studentScoreMap: Record<string, number[]> = {};
    classScores.forEach(s => {
      if (!studentScoreMap[s.studentId]) studentScoreMap[s.studentId] = [];
      studentScoreMap[s.studentId].push((s.marksObtained / s.totalMarks) * 100);
    });
    const studentAvgs = Object.entries(studentScoreMap).map(([sid, scores]) => ({
      id: sid,
      name: students.find(s => s.id === sid)?.name ?? sid,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));
    const sorted = [...studentAvgs].sort((a, b) => b.avg - a.avg);
    return {
      classDiv: cls,
      avgPct,
      topStudents: sorted.slice(0, 3),
      bottomStudents: sorted.slice(-3).reverse(),
    };
  }).filter(Boolean) as NonNullable<{ classDiv: string; avgPct: number; topStudents: any[]; bottomStudents: any[] }>[];

  type AttendanceMonth = { present: number; absent: number; leave: number; records: { date: string; status: string }[] };
  const attendanceMonths: Record<string, AttendanceMonth> = {};
  if (history) {
    history.records.forEach(r => {
      const month = r.date.slice(0, 7);
      if (!attendanceMonths[month]) attendanceMonths[month] = { present: 0, absent: 0, leave: 0, records: [] };
      attendanceMonths[month].records.push(r);
      if (r.status === 'Present') attendanceMonths[month].present++;
      else if (r.status === 'Absent') attendanceMonths[month].absent++;
      else attendanceMonths[month].leave++;
    });
  }

  const totalDays = history?.records.length ?? 0;
  const presentDays = history?.records.filter(r => r.status === 'Present').length ?? 0;
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const avgSyllabus = mySyllabus.length > 0
    ? Math.round(mySyllabus.reduce((a, s) => {
        const done = s.chapters.filter(c => c.status === 'Completed').length;
        return a + (done / s.totalChapters) * 100;
      }, 0) / mySyllabus.length)
    : null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'syllabus', label: 'Classes & Syllabus' },
    { id: 'performance', label: 'Student Performance' },
  ];

  return (
    <div className="page-enter max-w-5xl mx-auto">
      <Link href="/staff" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Staff
      </Link>

      {/* Profile Header */}
      <Card className="mb-5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 bg-[#0F172A] dark:bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white text-2xl font-bold">{member.avatarInitials}</span>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-2xl font-bold">{member.name}</h1>
                <Badge variant={member.status === 'Present' ? 'success' : member.status === 'Absent' ? 'destructive' : 'warning'}>
                  {member.status} Today
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                <span>{member.subject}</span>
                <span>{member.qualification}</span>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {member.phone}</span>
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {member.email}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined {member.joinDate}</span>
              </div>
            </div>
            <div className="flex sm:flex-col gap-4 text-right">
              {attendancePct > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Attendance</p>
                  <p className={`text-xl font-bold ${attendancePct >= 90 ? 'text-emerald-600' : attendancePct >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>{attendancePct}%</p>
                </div>
              )}
              {avgSyllabus !== null && (
                <div>
                  <p className="text-xs text-muted-foreground">Avg Syllabus</p>
                  <p className="text-xl font-bold text-blue-600">{avgSyllabus}%</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-5 bg-muted/30 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-w-[80px] ${
              activeTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Attendance', value: attendancePct > 0 ? `${attendancePct}%` : 'N/A', color: 'text-emerald-600', bg: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20' },
              { label: 'Classes', value: member.classes.length.toString(), color: 'text-blue-600', bg: 'from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20' },
              { label: 'Avg Syllabus', value: avgSyllabus !== null ? `${avgSyllabus}%` : 'N/A', color: 'text-purple-600', bg: 'from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/20' },
              { label: 'Avg Score', value: classPerformance.length > 0 ? `${Math.round(classPerformance.reduce((a,b) => a + b.avgPct, 0) / classPerformance.length)}%` : 'N/A', color: 'text-amber-600', bg: 'from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20' },
            ].map(stat => (
              <Card key={stat.label} className={`border-0 shadow-sm bg-gradient-to-br ${stat.bg}`}>
                <CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">{stat.label}</p><p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p></CardContent>
              </Card>
            ))}
          </div>

          {/* Today's classes */}
          {member.classes.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Assigned Classes</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {member.classes.map((cls, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-xl border border-border text-sm">
                      <GraduationCap className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      {cls}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Insight */}
          <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-500" /> AI Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {member.name.split(' ').slice(-1)[0]}&apos;s classes {classPerformance.length > 0 ? `show an average score of ${Math.round(classPerformance.reduce((a,b) => a + b.avgPct, 0) / classPerformance.length)}% across tests.` : 'data is being compiled.'}
                {avgSyllabus !== null && ` Syllabus completion is at ${avgSyllabus}% on average.`}
                {mySyllabus.length > 1 && (() => {
                  const sorted = [...mySyllabus].sort((a, b) => {
                    const aD = a.chapters.filter(c => c.status === 'Completed').length / a.totalChapters;
                    const bD = b.chapters.filter(c => c.status === 'Completed').length / b.totalChapters;
                    return bD - aD;
                  });
                  const ahead = sorted[0];
                  const behind = sorted[sorted.length - 1];
                  if (ahead.classDiv !== behind.classDiv) {
                    const aheadPct = Math.round((ahead.chapters.filter(c => c.status === 'Completed').length / ahead.totalChapters) * 100);
                    const behindPct = Math.round((behind.chapters.filter(c => c.status === 'Completed').length / behind.totalChapters) * 100);
                    return ` ${ahead.classDiv} is ahead at ${aheadPct}% vs ${behind.classDiv} at ${behindPct}%.`;
                  }
                  return '';
                })()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Attendance */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Present (30 days)', value: presentDays.toString(), color: 'text-emerald-600' },
              { label: 'Absent', value: (totalDays - presentDays - (history?.records.filter(r => r.status === 'Leave').length ?? 0)).toString(), color: 'text-rose-600' },
              { label: 'On Leave', value: (history?.records.filter(r => r.status === 'Leave').length ?? 0).toString(), color: 'text-amber-600' },
            ].map(s => (
              <Card key={s.label} className="border-0 shadow-sm">
                <CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground mb-1">{s.label}</p><p className={`text-xl font-bold ${s.color}`}>{s.value}</p></CardContent>
              </Card>
            ))}
          </div>

          {history ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Monthly Calendar</CardTitle>
                <div className="flex gap-3 text-xs mt-1">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-200 rounded" /> Present</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-200 rounded" /> Absent</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-200 rounded" /> Leave</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {Object.entries(attendanceMonths).map(([month, data]) => {
                  const [year, m] = month.split('-');
                  return (
                    <div key={month}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold">{MONTHS[parseInt(m) - 1]} {year}</p>
                        <div className="flex gap-3 text-xs">
                          <span className="text-emerald-600">P: {data.present}</span>
                          <span className="text-rose-600">A: {data.absent}</span>
                          {data.leave > 0 && <span className="text-amber-600">L: {data.leave}</span>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {data.records.map(r => {
                          const day = r.date.slice(8, 10);
                          return (
                            <div key={r.date} title={`${r.date}: ${r.status}`}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium ${
                                r.status === 'Present' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                                : r.status === 'Absent' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400'
                                : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                              }`}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No detailed attendance history available</CardContent></Card>
          )}
        </div>
      )}

      {/* Tab 3: Classes & Syllabus */}
      {activeTab === 'syllabus' && (
        <div className="space-y-4">
          {mySyllabus.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No syllabus data available</CardContent></Card>
          ) : (
            mySyllabus.map(s => {
              const completed = s.chapters.filter(c => c.status === 'Completed').length;
              const pct = Math.round((completed / s.totalChapters) * 100);
              const inProgress = s.chapters.find(c => c.status === 'In Progress');
              return (
                <Card key={s.classDiv}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold">{s.classDiv}</h3>
                        <p className="text-sm text-muted-foreground">{s.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">{pct}%</p>
                        <p className="text-xs text-muted-foreground">{completed}/{s.totalChapters} chapters</p>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    {inProgress && (
                      <p className="text-xs text-amber-600 font-medium">Currently Teaching: Ch.{inProgress.chapterNo} — {inProgress.chapterName}</p>
                    )}
                    <div className="mt-3 space-y-1">
                      {s.chapters.map(c => (
                        <div key={c.chapterNo} className="flex items-center gap-2 text-xs">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.status === 'Completed' ? 'bg-emerald-500' : c.status === 'In Progress' ? 'bg-amber-500' : 'bg-muted-foreground/30'}`} />
                          <span className={c.status === 'Not Started' ? 'text-muted-foreground' : 'text-foreground'}>Ch.{c.chapterNo} {c.chapterName}</span>
                          {c.status === 'In Progress' && <Badge variant="warning" className="text-xs py-0">In Progress</Badge>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Tab 4: Student Performance */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          {classPerformance.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No performance data available</CardContent></Card>
          ) : (
            classPerformance.map(perf => (
              <Card key={perf.classDiv}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{perf.classDiv}</span>
                    <span className={`text-lg font-bold ${perf.avgPct >= 75 ? 'text-emerald-600' : perf.avgPct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{perf.avgPct}% avg</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {perf.topStudents.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Top Performers</p>
                      <div className="space-y-1">
                        {perf.topStudents.map((s, i) => (
                          <div key={s.id} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                              <Link href={`/student/${s.id}`} className="hover:text-emerald-600 hover:underline transition-colors">{s.name}</Link>
                            </span>
                            <span className="text-emerald-600 font-semibold">{s.avg}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {perf.bottomStudents.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Needs Attention</p>
                      <div className="space-y-1">
                        {perf.bottomStudents.map((s, i) => (
                          <div key={s.id} className="flex items-center justify-between text-sm">
                            <span>
                              <Link href={`/student/${s.id}`} className="hover:text-emerald-600 hover:underline transition-colors">{s.name}</Link>
                            </span>
                            <span className={`font-semibold ${s.avg < 50 ? 'text-rose-600' : 'text-amber-600'}`}>{s.avg}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
