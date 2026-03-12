'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { getTeacherName, getTeacherId } from '@/lib/store';
import { staff } from '@/data/seed-data';

export default function TeacherProfilePage() {
  const [teacher, setTeacher] = useState(staff.find(s => s.id === 'st3'));

  useEffect(() => {
    const id = getTeacherId();
    if (id) setTeacher(staff.find(s => s.id === id));
  }, []);

  if (!teacher) return null;

  return (
    <div className="page-enter max-w-2xl mx-auto">
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#0F172A] dark:bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">{teacher.avatarInitials}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{teacher.name}</h2>
              <p className="text-muted-foreground">{teacher.subject}</p>
              <p className="text-sm text-muted-foreground">{teacher.qualification}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground text-xs uppercase tracking-wide">Phone</p><p className="font-medium mt-0.5">{teacher.phone}</p></div>
            <div><p className="text-muted-foreground text-xs uppercase tracking-wide">Email</p><p className="font-medium mt-0.5">{teacher.email}</p></div>
            <div><p className="text-muted-foreground text-xs uppercase tracking-wide">Joining Date</p><p className="font-medium mt-0.5">{teacher.joinDate}</p></div>
            <div><p className="text-muted-foreground text-xs uppercase tracking-wide">Classes</p><p className="font-medium mt-0.5">{teacher.classes.length} assigned</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
