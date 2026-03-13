'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Camera, FileText, BookOpen, Users,
  Megaphone, ClipboardList, UserCircle, GraduationCap, X, Menu, LogOut,
  Calendar, NotebookPen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTeacherName, clearSettings } from '@/lib/store';
import { useEffect } from 'react';
import TopNav from '@/components/layout/TopNav';

const teacherNavItems = [
  { href: '/teacher-dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
  { href: '/teacher/attendance', icon: Camera, label: 'Mark Attendance' },
  { href: '/teacher/marks', icon: FileText, label: 'Enter Marks' },
  { href: '/teacher/syllabus', icon: BookOpen, label: 'Syllabus Progress' },
  { href: '/teacher/homework', icon: NotebookPen, label: 'Homework' },
  { href: '/teacher/students', icon: Users, label: 'My Students' },
  { href: '/teacher/circulars', icon: Megaphone, label: 'Circulars' },
  { href: '/teacher/complaints', icon: ClipboardList, label: 'My Complaints' },
  { href: '/teacher/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/teacher/profile', icon: UserCircle, label: 'My Profile' },
];

function TeacherSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [teacherName, setTeacherName] = useState<string | null>(null);

  useEffect(() => {
    setTeacherName(getTeacherName());
  }, []);

  const handleLogout = () => {
    clearSettings();
    router.push('/');
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        'fixed left-0 top-0 z-50 h-full w-64 bg-[#0F172A] text-white flex flex-col transition-transform duration-300 lg:translate-x-0 lg:relative lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">IntelliCampus</p>
              <p className="text-xs text-emerald-400 leading-tight font-medium">Teacher Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {teacherNavItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (pathname.startsWith(href) && href !== '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                )}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Teacher badge */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1">Teacher Portal</p>
            <p className="text-xs text-white/80 font-semibold truncate">{teacherName ?? 'Teacher'}</p>
            <p className="text-xs text-white/50 mt-0.5">Mathematics Dept.</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Switch Account
          </button>
        </div>
      </aside>
    </>
  );
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <TeacherSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
