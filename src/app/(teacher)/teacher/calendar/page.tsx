'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/layout/Breadcrumb';

type EventCategory = 'holiday' | 'exam' | 'event' | 'deadline';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  category: EventCategory;
  description?: string;
}

const seedEvents: CalendarEvent[] = [
  { id: 'e1', date: '2026-03-13', title: 'Unit Test 2 Begins', category: 'exam', description: 'Class 9 and 10 — all subjects' },
  { id: 'e2', date: '2026-03-14', title: 'Unit Test 2 Continues', category: 'exam' },
  { id: 'e3', date: '2026-03-15', title: 'Fee Submission Deadline', category: 'deadline', description: 'Last date to pay Term 2 fees without penalty' },
  { id: 'e4', date: '2026-03-17', title: 'Holi — School Holiday', category: 'holiday', description: 'School closed for Holi festival' },
  { id: 'e5', date: '2026-03-18', title: 'Parent-Teacher Meeting', category: 'event', description: 'PTM for Class 9, 10, 11 — 9 AM to 1 PM' },
  { id: 'e6', date: '2026-03-19', title: 'Parent-Teacher Meeting', category: 'event', description: 'PTM for Class 6, 7, 8 — 9 AM to 1 PM' },
  { id: 'e7', date: '2026-03-20', title: 'Science Exhibition', category: 'event', description: 'Annual Science Fair — Class 8 to 12 — Main Hall' },
  { id: 'e8', date: '2026-03-22', title: 'Yoga Day & Sports Activity', category: 'event', description: 'Morning assembly + PT period for all classes' },
  { id: 'e9', date: '2026-03-25', title: 'Unit Test 2 Results', category: 'exam', description: 'Answer scripts distributed in class' },
  { id: 'e10', date: '2026-03-28', title: 'Annual Day Celebration', category: 'event', description: 'Cultural performances, awards — 5 PM onwards, School Auditorium' },
  { id: 'e11', date: '2026-03-29', title: 'Good Friday — Holiday', category: 'holiday' },
  { id: 'e12', date: '2026-03-30', title: 'NAAC Document Submission', category: 'deadline', description: 'All documentation to be submitted to Principal office' },
  { id: 'e13', date: '2026-03-31', title: 'Last Working Day — March', category: 'deadline' },
  { id: 'e14', date: '2026-04-01', title: 'New Academic Month Begins', category: 'event' },
  { id: 'e15', date: '2026-04-05', title: 'Ambedkar Jayanti — Holiday', category: 'holiday', description: 'National holiday' },
  { id: 'e16', date: '2026-04-06', title: 'Mid-Term Exam Begins', category: 'exam', description: 'Mid-term examinations for all classes' },
  { id: 'e17', date: '2026-04-07', title: 'Mid-Term Exams', category: 'exam' },
  { id: 'e18', date: '2026-04-08', title: 'Mid-Term Exams', category: 'exam' },
  { id: 'e19', date: '2026-04-10', title: 'Mid-Term Exams End', category: 'exam' },
  { id: 'e20', date: '2026-04-14', title: 'Ram Navami — Holiday', category: 'holiday' },
  { id: 'e21', date: '2026-04-15', title: 'Sports Day', category: 'event', description: 'Annual Sports Day — Ground — All students participate' },
  { id: 'e22', date: '2026-04-18', title: 'Fee Deadline — Term 3', category: 'deadline', description: 'Term 3 fee payment deadline' },
  { id: 'e23', date: '2026-04-22', title: 'Earth Day Activity', category: 'event', description: 'Environmental awareness — tree planting drive' },
  { id: 'e24', date: '2026-04-25', title: 'Mid-Term Results', category: 'exam', description: 'Reports distributed to students' },
];

const categoryConfig: Record<EventCategory, { color: string; bg: string; border: string; dot: string; label: string }> = {
  holiday: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-500', label: 'Holiday' },
  exam: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/40', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500', label: 'Exam' },
  event: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500', label: 'Event' },
  deadline: { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-950/40', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-500', label: 'Deadline' },
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TeacherCalendarPage() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(2); // 0-indexed, March = 2
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const getEventsForDate = (dateStr: string) => seedEvents.filter(e => e.date === dateStr);
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const isToday = (day: number) => getDateStr(day) === '2026-03-13';

  const upcomingEvents = seedEvents
    .filter(e => e.date >= '2026-03-13' && e.date <= '2026-03-20')
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="page-enter max-w-6xl mx-auto">
      <Breadcrumb />
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Academic Calendar</h1>
        <p className="text-muted-foreground text-sm mt-1">Holidays, exams, events & deadlines</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5">
        {Object.entries(categoryConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs">
            <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
            <span className="text-muted-foreground">{cfg.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Calendar */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{MONTHS[month]} {year}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const dateStr = getDateStr(day);
                  const dayEvents = getEventsForDate(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const today = isToday(day);
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={`min-h-[52px] p-1.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                          : today
                            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'border-transparent hover:border-border hover:bg-muted/30'
                      }`}
                    >
                      <p className={`text-xs font-semibold mb-1 ${today ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                        {today ? `${day} ●` : day}
                      </p>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map(ev => (
                          <div key={ev.id} className={`w-full h-1.5 rounded-full ${categoryConfig[ev.category].dot}`} />
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-xs text-muted-foreground">+{dayEvents.length - 2}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected day events */}
          {selectedDate && (
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    Events on {selectedDate.split('-').reverse().join('/')}
                  </CardTitle>
                  <button onClick={() => setSelectedDate(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {selectedEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No events on this date.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedEvents.map(ev => {
                      const cfg = categoryConfig[ev.category];
                      return (
                        <div key={ev.id} className={`p-3 rounded-xl border ${cfg.border} ${cfg.bg}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`text-sm font-semibold ${cfg.color}`}>{ev.title}</p>
                              {ev.description && <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>}
                            </div>
                            <Badge className={`text-xs flex-shrink-0 ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{cfg.label}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: upcoming events */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" /> Upcoming (7 days)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">No upcoming events</p>
              ) : upcomingEvents.map(ev => {
                const cfg = categoryConfig[ev.category];
                const [y, m, d] = ev.date.split('-');
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedDate(ev.date)}
                    className={`p-2.5 rounded-xl border cursor-pointer hover:shadow-sm transition-all ${cfg.border} ${cfg.bg}`}
                  >
                    <p className={`text-xs font-semibold ${cfg.color}`}>{ev.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{d}/{m}/{y}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Monthly stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">This Month</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {Object.entries(categoryConfig).map(([key, cfg]) => {
                const count = seedEvents.filter(e => e.category === key as EventCategory && e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className="text-muted-foreground">{cfg.label}s</span>
                    </div>
                    <span className="text-xs font-semibold">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
