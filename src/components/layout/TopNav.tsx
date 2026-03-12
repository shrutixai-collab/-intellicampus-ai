'use client';

import { useState, useEffect } from 'react';
import { Bell, Moon, Sun, Search, Menu, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSettings } from '@/lib/store';
import type { AppSettings } from '@/types';

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const [dark, setDark] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [notifCount] = useState(5);

  useEffect(() => {
    setSettings(getSettings());
    // Restore dark mode preference
    const saved = localStorage.getItem('ic_dark');
    if (saved === 'true') {
      document.documentElement.classList.add('dark');
      setDark(true);
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('ic_dark', String(next));
  };

  const initials = (settings?.role ?? 'Principal')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 gap-3 sticky top-0 z-30">
      {/* Mobile menu toggle */}
      <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="w-5 h-5" />
      </Button>

      {/* Logo (mobile only) */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-sm">IntelliCampus AI</span>
      </div>

      {/* Institution name (desktop) */}
      <div className="hidden lg:block">
        <p className="font-semibold text-sm text-foreground">
          {settings?.institutionName ?? 'Delhi Public School, Pune'}
        </p>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students, complaints, circulars..."
            className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="w-4.5 h-4.5" size={18} />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </Button>

        {/* Dark mode */}
        <Button variant="ghost" size="icon-sm" onClick={toggleDark}>
          {dark ? <Sun className="w-4.5 h-4.5" size={18} /> : <Moon className="w-4.5 h-4.5" size={18} />}
        </Button>

        {/* Avatar */}
        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold ml-1 cursor-pointer">
          {initials}
        </div>
      </div>
    </header>
  );
}
