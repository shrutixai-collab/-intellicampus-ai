'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, Calendar, GraduationCap, TrendingUp, TrendingDown, Bot, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { students, testScores, studentAttendanceHistory, studentActivities } from '@/data/seed-data';
import { formatCurrency, getAttendanceColor, getAttendanceBg } from '@/lib/utils';

type Tab = 'overview' | 'attendance' | 'academics' | 'fees' | 'activities' | 'homework';

// Month names for calendar
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function AttendanceCalendar({ studentId }: { studentId: string }) {
  const history = studentAttendanceHistory.find(h => h.studentId === studentId);
  if (!history) {
    return <p className="text-sm text-muted-foreground text-center py-4">No detailed attendance history available</p>;
  }

  // Group records by month
  const byMonth: Record<string, typeof history.records> = {};
  history.records.forEach(r => {
    const month = r.date.slice(0, 7); // YYYY-MM
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(r);
  });

  return (
    <div className="space-y-4">
      {Object.entries(byMonth).map(([month, records]) => {
        const [year, m] = month.split('-');
        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const late = records.filter(r => r.status === 'Late').length;
        return (
          <div key={month}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">{MONTHS[parseInt(m) - 1]} {year}</p>
              <div className="flex gap-3 text-xs">
                <span className="text-emerald-600">P: {present}</span>
                <span className="text-rose-600">A: {absent}</span>
                {late > 0 && <span className="text-amber-600">L: {late}</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {records.map(r => {
                const day = r.date.slice(8, 10);
                return (
                  <div
                    key={r.date}
                    title={`${r.date}: ${r.status}`}
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
    </div>
  );
}

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const student = students.find(s => s.id === id);
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Student not found</p>
        <Link href="/fees"><Button variant="outline">Back to Fees</Button></Link>
      </div>
    );
  }

  const studentScores = testScores.filter(t => t.studentId === id);
  const activities = studentActivities.filter(a => a.studentId === id);

  // Subject-wise latest scores
  const subjectMap: Record<string, typeof studentScores> = {};
  studentScores.forEach(t => {
    if (!subjectMap[t.subject]) subjectMap[t.subject] = [];
    subjectMap[t.subject].push(t);
  });

  const subjects = Object.entries(subjectMap).map(([subject, scores]) => {
    const sorted = [...scores].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = sorted[0];
    const latestPct = latest ? Math.round((latest.marksObtained / latest.totalMarks) * 100) : 0;
    const prevPct = sorted[1] ? Math.round((sorted[1].marksObtained / sorted[1].totalMarks) * 100) : latestPct;
    const trend = latestPct - prevPct;
    return { subject, scores: sorted, latestPct, trend };
  });

  const avgScore = subjects.length > 0
    ? Math.round(subjects.reduce((a, b) => a + b.latestPct, 0) / subjects.length)
    : 0;

  // Fee info
  const pendingFee = student.totalFee - student.paidFee;

  // Attendance warning
  const maxAbsences = Math.floor(student.attendance * 0.25 + 8);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'academics', label: 'Academics' },
    { id: 'fees', label: 'Fees' },
    { id: 'homework', label: 'Homework' },
    { id: 'activities', label: 'Activities' },
  ];

  return (
    <div className="page-enter max-w-5xl mx-auto">
      {/* Back button */}
      <Link href="/fees" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Profile Header */}
      <Card className="mb-5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 bg-[#0F172A] dark:bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white text-2xl font-bold">
                {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-2xl font-bold">{student.name}</h1>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> {student.classDiv} · Roll {student.rollNo}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {student.parentPhone}</span>
                {student.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {student.email}</span>}
              </div>
              <p className="text-sm mt-1 text-muted-foreground">Parent: {student.parentName}</p>
            </div>

            {/* Quick stats */}
            <div className="flex sm:flex-col gap-4 text-right">
              <div>
                <p className="text-xs text-muted-foreground">Attendance</p>
                <p className={`text-xl font-bold ${getAttendanceColor(student.attendance)}`}>{student.attendance}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fee Status</p>
                <Badge variant={student.feeStatus === 'Paid' ? 'success' : student.feeStatus === 'Partial' ? 'warning' : 'destructive'}>
                  {student.feeStatus}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-5 bg-muted/30 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-w-[80px] ${
              activeTab === tab.id
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Attendance', value: `${student.attendance}%`, color: getAttendanceColor(student.attendance), bg: getAttendanceBg(student.attendance) },
              { label: 'Fee Status', value: student.feeStatus, color: student.feeStatus === 'Paid' ? 'text-emerald-600' : student.feeStatus === 'Partial' ? 'text-amber-600' : 'text-rose-600', bg: student.feeStatus === 'Paid' ? 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20' : student.feeStatus === 'Partial' ? 'from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20' : 'from-rose-50 to-rose-100/50 dark:from-rose-950/40 dark:to-rose-900/20' },
              { label: 'Avg Score', value: subjects.length > 0 ? `${avgScore}%` : 'N/A', color: 'text-blue-600', bg: 'from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20' },
              { label: 'Activities', value: activities.length.toString(), color: 'text-purple-600', bg: 'from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/20' },
            ].map(stat => (
              <Card key={stat.label} className={`border-0 shadow-sm bg-gradient-to-br ${stat.bg}`}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Insight */}
          <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-500" /> AI Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {subjects.length > 0 ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {student.name.split(' ')[0]} is{' '}
                  {subjects.some(s => s.trend > 0) ? (
                    <>showing improvement in {subjects.filter(s => s.trend > 0).map(s => s.subject).join(', ')} (+{Math.max(...subjects.filter(s=>s.trend>0).map(s=>s.trend))}% over last test)</>
                  ) : 'maintaining consistent performance'}.
                  {subjects.some(s => s.latestPct < 50) && (
                    <> Needs attention in {subjects.filter(s => s.latestPct < 50).map(s => s.subject).join(', ')} (below 50%).</>
                  )}
                  {' '}Attendance is {student.attendance >= 85 ? 'healthy' : student.attendance >= 75 ? 'acceptable but needs improvement' : 'concerning'} at {student.attendance}%.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {student.name.split(' ')[0]} has {student.attendance}% attendance.
                  {student.attendance < 75 && ' Attendance below 75% — parent intervention recommended.'}
                  {' '}Fee status: {student.feeStatus}.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {studentScores.slice(0, 3).map(score => (
                  <div key={score.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{score.testName} — {score.subject}</p>
                      <p className="text-xs text-muted-foreground">{score.marksObtained}/{score.totalMarks} ({Math.round(score.marksObtained/score.totalMarks*100)}%) · {score.date}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Fee Payment Recorded</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(student.paidFee)} paid · {student.feeStatus}</p>
                  </div>
                </div>
                {activities.slice(0, 2).map(a => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{a.activity}</p>
                      {a.achievement && <p className="text-xs text-emerald-600">{a.achievement}</p>}
                      <p className="text-xs text-muted-foreground">{a.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Attendance */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Overall', value: `${student.attendance}%`, color: getAttendanceColor(student.attendance) },
              { label: 'This Month (Mar)', value: '18/22', color: 'text-emerald-600' },
              { label: 'Status', value: student.attendance >= 85 ? 'Good' : student.attendance >= 75 ? 'At Risk' : 'Critical', color: student.attendance >= 85 ? 'text-emerald-600' : student.attendance >= 75 ? 'text-amber-600' : 'text-rose-600' },
            ].map(stat => (
              <Card key={stat.label} className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {student.attendance < 80 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
              Warning: Maximum {maxAbsences} more absences allowed this semester to maintain 75% threshold.
            </div>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Daily Attendance (Last 30 Days)</CardTitle>
              <div className="flex gap-3 text-xs mt-1">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-200 rounded" /> Present</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-200 rounded" /> Absent</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-200 rounded" /> Late</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <AttendanceCalendar studentId={id} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Academics */}
      {activeTab === 'academics' && (
        <div className="space-y-4">
          {subjects.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No test scores available</CardContent></Card>
          ) : (
            <>
              {/* Subject summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.map(({ subject, scores, latestPct, trend }) => (
                  <Card key={subject}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm">{subject}</p>
                        <div className="flex items-center gap-1.5">
                          {trend > 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : trend < 0 ? <TrendingDown className="w-4 h-4 text-rose-500" /> : null}
                          <span className={`text-lg font-bold ${latestPct >= 75 ? 'text-emerald-600' : latestPct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{latestPct}%</span>
                        </div>
                      </div>
                      {trend !== 0 && (
                        <p className={`text-xs ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {trend > 0 ? `+${trend}%` : `${trend}%`} from last test
                        </p>
                      )}
                      {/* Mini score history bar chart */}
                      <div className="mt-3 flex gap-1 items-end h-8">
                        {[...scores].reverse().slice(0, 6).map((score) => {
                          const pct = score.marksObtained / score.totalMarks;
                          return (
                            <div
                              key={score.id}
                              title={`${score.testName}: ${score.marksObtained}/${score.totalMarks}`}
                              className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-sm min-w-[4px]"
                              style={{ height: `${Math.max(4, pct * 32)}px` }}
                            />
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Detailed scores table */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Test History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Date</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Test Name</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Subject</th>
                          <th className="text-center px-4 py-2 text-xs font-semibold text-muted-foreground">Marks</th>
                          <th className="text-center px-4 py-2 text-xs font-semibold text-muted-foreground">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {studentScores.map(score => {
                          const pct = Math.round((score.marksObtained / score.totalMarks) * 100);
                          return (
                            <tr key={score.id} className="hover:bg-muted/20">
                              <td className="px-4 py-2.5 text-muted-foreground text-xs">{score.date}</td>
                              <td className="px-4 py-2.5 font-medium">{score.testName}</td>
                              <td className="px-4 py-2.5 text-muted-foreground">{score.subject}</td>
                              <td className="px-4 py-2.5 text-center">{score.marksObtained}/{score.totalMarks}</td>
                              <td className="px-4 py-2.5 text-center">
                                <span className={`font-semibold ${pct >= 75 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{pct}%</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Tab 4: Fees */}
      {activeTab === 'fees' && (
        <div className="space-y-4">
          {/* Fee summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Fee', value: formatCurrency(student.totalFee), color: 'text-foreground' },
              { label: 'Paid', value: formatCurrency(student.paidFee), color: 'text-emerald-600' },
              { label: 'Pending', value: formatCurrency(pendingFee), color: pendingFee > 0 ? 'text-rose-600' : 'text-emerald-600' },
            ].map(stat => (
              <Card key={stat.label} className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Payment Progress</p>
                <Badge variant={student.feeStatus === 'Paid' ? 'success' : student.feeStatus === 'Partial' ? 'warning' : 'destructive'}>
                  {student.feeStatus}
                </Badge>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(student.paidFee / student.totalFee) * 100}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{Math.round((student.paidFee / student.totalFee) * 100)}% paid</p>
            </CardContent>
          </Card>

          {/* Payment history */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Payment History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {student.paidFee > 0 && (
                  <>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">First Installment</p>
                        <p className="text-xs text-muted-foreground">Online Transfer · Ref: ICICI{student.id.toUpperCase()}001</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600">{formatCurrency(Math.min(student.paidFee, student.totalFee / 2))}</p>
                        <p className="text-xs text-muted-foreground">15/01/2026</p>
                      </div>
                    </div>
                    {student.paidFee > student.totalFee / 2 && (
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Second Installment</p>
                          <p className="text-xs text-muted-foreground">Online Transfer · Ref: ICICI{student.id.toUpperCase()}002</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-600">{formatCurrency(student.paidFee - student.totalFee / 2)}</p>
                          <p className="text-xs text-muted-foreground">10/02/2026</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {student.paidFee === 0 && (
                  <div className="px-4 py-8 text-center text-muted-foreground text-sm">No payments recorded</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 5: Activities */}
      {activeTab === 'activities' && (
        <div className="space-y-3">
          {activities.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No activities recorded</CardContent></Card>
          ) : (
            activities.map(activity => (
              <Card key={activity.id}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{activity.activity}</p>
                    {activity.achievement && (
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">Trophy: {activity.achievement}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 5.5: Homework */}
      {activeTab === 'homework' && (
        <div className="space-y-3">
          {[
            { subject: 'Mathematics', desc: 'Complete Exercise 8.3 from NCERT — Questions 1 to 10. Show all steps.', due: '14/03/2026', posted: '11/03/2026' },
            { subject: 'Mathematics', desc: 'Solve Chapter 9 worksheet on Parallelograms and Triangles.', due: '13/03/2026', posted: '10/03/2026' },
            { subject: 'English', desc: 'Write a letter to the editor about water conservation (200-250 words).', due: '14/03/2026', posted: '11/03/2026' },
            { subject: 'English', desc: 'Learn vocabulary from Chapter 6 — The Bond of Love. 20 new words.', due: '13/03/2026', posted: '09/03/2026' },
          ].filter(hw => {
            // Show relevant homework based on student class
            if (student.classDiv.includes('9') || student.classDiv.includes('10')) return true;
            if (student.classDiv.includes('7') || student.classDiv.includes('8')) return true;
            return true;
          }).map((hw, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="info" className="text-xs">{hw.subject}</Badge>
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        Due: {hw.due}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{hw.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1">Posted: {hw.posted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
