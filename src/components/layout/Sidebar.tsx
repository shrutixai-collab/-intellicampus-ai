'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, IndianRupee, MessageSquare, Megaphone,
  CalendarCheck, Award, Users, MessageCircle, Settings, GraduationCap, X,
  Calendar, Bus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSettings } from '@/lib/store';
import { useEffect, useState } from 'react';
import type { AppSettings } from '@/types';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/fees', icon: IndianRupee, label: 'Fees' },
  { href: '/complaints', icon: MessageSquare, label: 'Complaints' },
  { href: '/circulars', icon: Megaphone, label: 'Circulars' },
  { href: '/attendance', icon: CalendarCheck, label: 'Attendance' },
  { href: '/certificates', icon: Award, label: 'Certificates' },
  { href: '/staff', icon: Users, label: 'Staff' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/transport', icon: Bus, label: 'Transport' },
  { href: '/chat', icon: MessageCircle, label: 'WhatsApp Sim' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const institutionType = settings?.institutionType ?? 'school';

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-[#0F172A] text-white flex flex-col transition-transform duration-300 lg:translate-x-0 lg:relative lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">IntelliCampus</p>
              <p className="text-xs text-white/50 leading-tight">AI</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
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

        {/* Institution badge */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1">
              {institutionType === 'college' ? 'College Mode' : 'School Mode'}
            </p>
            <p className="text-xs text-white/80 font-semibold truncate">
              {settings?.institutionName ?? 'Delhi Public School, Pune'}
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              {settings?.role ?? 'Principal'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
