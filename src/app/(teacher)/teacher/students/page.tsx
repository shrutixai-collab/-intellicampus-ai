'use client';
import { students } from '@/data/seed-data';
import { Card, CardContent } from '@/components/ui/card';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Link from 'next/link';

const myClasses = ['Class 7A', 'Class 7B', 'Class 9A'];

export default function TeacherStudentsPage() {
  const myStudents = students.filter(s => myClasses.includes(s.classDiv));
  return (
    <div className="page-enter max-w-4xl mx-auto">
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-2">My Students</h1>
      <p className="text-muted-foreground text-sm mb-6">{myStudents.length} students across {myClasses.length} classes</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {myStudents.map(s => (
          <Link key={s.id} href={`/student/${s.id}`}>
            <Card className="hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0F172A] dark:bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{s.name.split(' ').map(n => n[0]).join('').slice(0,2)}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.classDiv} · Roll {s.rollNo}</p>
                  <p className="text-xs text-muted-foreground">Attendance: {s.attendance}%</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
