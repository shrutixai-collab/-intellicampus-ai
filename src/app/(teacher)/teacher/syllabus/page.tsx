'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Clock, Circle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { syllabusProgress } from '@/data/seed-data';
import type { SyllabusChapter } from '@/types';

const myTeacherId = 'st3'; // Mr. Vinod Kale

type ChapterStatus = 'Completed' | 'In Progress' | 'Not Started';

export default function TeacherSyllabusPage() {
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set(['Class 7A']));
  const [chaptersState, setChaptersState] = useState<Record<string, SyllabusChapter[]>>(() => {
    const state: Record<string, SyllabusChapter[]> = {};
    syllabusProgress.filter(s => s.teacherId === myTeacherId).forEach(s => {
      state[s.classDiv] = [...s.chapters.map(c => ({ ...c }))];
    });
    return state;
  });

  const myClasses = syllabusProgress.filter(s => s.teacherId === myTeacherId);

  const toggleClass = (classDiv: string) => {
    setExpandedClasses(prev => {
      const next = new Set(prev);
      next.has(classDiv) ? next.delete(classDiv) : next.add(classDiv);
      return next;
    });
  };

  const cycleStatus = (classDiv: string, chapterNo: number) => {
    setChaptersState(prev => {
      const chapters = [...(prev[classDiv] ?? [])];
      const idx = chapters.findIndex(c => c.chapterNo === chapterNo);
      if (idx === -1) return prev;
      const current = chapters[idx].status;
      const next: ChapterStatus = current === 'Not Started' ? 'In Progress' : current === 'In Progress' ? 'Completed' : 'Not Started';
      chapters[idx] = { ...chapters[idx], status: next, progressPercent: next === 'In Progress' ? 50 : undefined };
      return { ...prev, [classDiv]: chapters };
    });
  };

  const updateProgress = (classDiv: string, chapterNo: number, pct: number) => {
    setChaptersState(prev => {
      const chapters = [...(prev[classDiv] ?? [])];
      const idx = chapters.findIndex(c => c.chapterNo === chapterNo);
      if (idx === -1) return prev;
      chapters[idx] = { ...chapters[idx], progressPercent: pct };
      return { ...prev, [classDiv]: chapters };
    });
  };

  const handleSave = (classDiv: string) => {
    toast.success(`Syllabus progress for ${classDiv} saved successfully`);
  };

  const getStats = (classDiv: string) => {
    const chapters = chaptersState[classDiv] ?? [];
    const completed = chapters.filter(c => c.status === 'Completed').length;
    const inProgress = chapters.filter(c => c.status === 'In Progress').length;
    const total = chapters.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, inProgress, total, pct };
  };

  const chapterIcon = (status: ChapterStatus) => {
    if (status === 'Completed') return <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
    if (status === 'In Progress') return <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />;
    return <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />;
  };

  const statusBg = (status: ChapterStatus) => {
    if (status === 'Completed') return 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900';
    if (status === 'In Progress') return 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900';
    return 'bg-background border-border';
  };

  return (
    <div className="page-enter max-w-4xl mx-auto">
      <Breadcrumb />
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Syllabus Progress</h1>
        <p className="text-muted-foreground text-sm mt-1">Track chapter-wise completion across your classes</p>
      </div>

      <div className="space-y-4">
        {myClasses.map(cls => {
          const expanded = expandedClasses.has(cls.classDiv);
          const chapters = chaptersState[cls.classDiv] ?? cls.chapters;
          const stats = getStats(cls.classDiv);
          const inProgressChapter = chapters.find(c => c.status === 'In Progress');

          return (
            <Card key={cls.classDiv}>
              <div
                className="flex items-center justify-between p-5 cursor-pointer select-none"
                onClick={() => toggleClass(cls.classDiv)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base">{cls.classDiv} — {cls.subject}</h3>
                      {inProgressChapter && (
                        <Badge variant="warning" className="text-xs">Currently Teaching: Ch.{inProgressChapter.chapterNo}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {stats.completed}/{stats.total} chapters · {stats.pct}% complete
                    </p>
                  </div>
                  <div className="flex-1 max-w-xs">
                    <Progress value={stats.pct} className="h-2" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={e => { e.stopPropagation(); handleSave(cls.classDiv); }}
                    className="gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </Button>
                  {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {expanded && (
                <CardContent className="pt-0 pb-5 px-5">
                  <div className="space-y-2">
                    {chapters.map(chapter => (
                      <div key={chapter.chapterNo} className={`flex items-center gap-3 p-3 rounded-xl border ${statusBg(chapter.status)}`}>
                        <button onClick={() => cycleStatus(cls.classDiv, chapter.chapterNo)}>
                          {chapterIcon(chapter.status)}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Ch.{chapter.chapterNo}</span>
                            <span className="text-sm font-medium">{chapter.chapterName}</span>
                            {chapter.status === 'In Progress' && (
                              <Badge variant="warning" className="text-xs">In Progress</Badge>
                            )}
                            {chapter.status === 'Completed' && (
                              <Badge variant="success" className="text-xs">✓ Done</Badge>
                            )}
                          </div>
                          {chapter.status === 'In Progress' && (
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="range" min={0} max={100} value={chapter.progressPercent ?? 50}
                                onChange={e => updateProgress(cls.classDiv, chapter.chapterNo, parseInt(e.target.value))}
                                className="flex-1 h-1.5 accent-amber-500"
                                onClick={e => e.stopPropagation()}
                              />
                              <span className="text-xs text-amber-600 font-medium w-8">{chapter.progressPercent ?? 50}%</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => cycleStatus(cls.classDiv, chapter.chapterNo)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {chapter.status === 'Completed' ? 'Mark incomplete' : chapter.status === 'In Progress' ? 'Mark done' : 'Start'}
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Last updated: {cls.lastUpdated}</p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
