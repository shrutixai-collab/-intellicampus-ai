'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const labelMap: Record<string, string> = {
  dashboard: 'Dashboard',
  fees: 'Fee Management',
  complaints: 'Complaints',
  circulars: 'Circulars',
  attendance: 'Attendance',
  certificates: 'Certificates',
  staff: 'Staff',
  chat: 'WhatsApp Simulator',
  settings: 'Settings',
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {segments.map((seg, i) => (
        <span key={seg} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5" />
          {i === segments.length - 1 ? (
            <span className="text-foreground font-medium">{labelMap[seg] ?? seg}</span>
          ) : (
            <Link href={`/${segments.slice(0, i + 1).join('/')}`} className="hover:text-foreground transition-colors">
              {labelMap[seg] ?? seg}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
