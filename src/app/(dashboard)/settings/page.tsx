'use client';

import { useState, useEffect } from 'react';
import { Save, GraduationCap, Bell, Shield, LogOut, CloudUpload, Download, FileSpreadsheet, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { getSettings, saveSettings } from '@/lib/store';
import type { InstitutionType, UserRole } from '@/types';
import { useRouter } from 'next/navigation';

const schoolRoles: UserRole[] = ['Principal', 'Admin Staff', 'Teacher', 'Accountant'];
const collegeRoles: UserRole[] = ['Principal', 'Admin Staff', 'Teacher', 'Accountant', 'HOD', 'Placement Officer'];

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<InstitutionType>('school');
  const [role, setRole] = useState<UserRole>('Principal');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setName(s.institutionName);
    setType(s.institutionType);
    setRole(s.role);
  }, []);

  const roles = type === 'college' ? collegeRoles : schoolRoles;

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    saveSettings({ institutionName: name, institutionType: type, role });
    setSaving(false);
    toast.success('Settings saved successfully!');
  };

  const handleLogout = () => {
    router.push('/');
    toast.info('Logged out — redirecting to login');
  };

  const [autoBackup, setAutoBackup] = useState(true);
  const [backupEmail, setBackupEmail] = useState('principal@dps.edu');

  const sections = [
    {
      icon: GraduationCap,
      title: 'Institution Profile',
      desc: 'Configure your institution details',
      color: 'text-emerald-500',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Institution Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Delhi Public School, Pune" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Institution Type</label>
              <Select value={type} onValueChange={v => { setType(v as InstitutionType); setRole('Principal'); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">School (K-12)</SelectItem>
                  <SelectItem value="college">College (Degree / PG)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Your Role</label>
              <Select value={role} onValueChange={v => setRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: Bell,
      title: 'Notifications',
      desc: 'Control when and how you receive alerts',
      color: 'text-blue-500',
      content: (
        <div className="space-y-3">
          {['Fee overdue alerts', 'New complaint received', 'Certificate ready for collection', 'Attendance below 75%', 'Staff absent today'].map(n => (
            <div key={n} className="flex items-center justify-between py-2 border-b last:border-0">
              <p className="text-sm text-foreground">{n}</p>
              <div className="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer" onClick={() => toast.info('Toggle updated')}>
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: CloudUpload,
      title: 'Data Backup & Safety',
      desc: 'Automatic backups and data export',
      color: 'text-sky-500',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium">Auto daily backup to email</p>
              <p className="text-xs text-muted-foreground mt-0.5">Backup frequency: Daily at 11:00 PM</p>
            </div>
            <div
              className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${autoBackup ? 'bg-emerald-500' : 'bg-muted'}`}
              onClick={() => { setAutoBackup(v => !v); toast.success(autoBackup ? 'Auto backup disabled' : 'Auto backup enabled'); }}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoBackup ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Backup Email</label>
            <Input value={backupEmail} onChange={e => setBackupEmail(e.target.value)} placeholder="principal@school.edu" />
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm flex items-start gap-2">
            <span className="mt-0.5">✅</span>
            <span>Last backup: <strong>12/03/2026, 11:00 PM</strong></span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button variant="outline" className="gap-2 text-sky-600 border-sky-200 hover:bg-sky-50 dark:border-sky-800 dark:hover:bg-sky-950/30" onClick={() => toast.success('Complete data export downloaded as Excel')}>
              <Download className="w-4 h-4" /> Export All Data
            </Button>
            <Button variant="outline" className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/30" onClick={() => toast.success('Fee report exported!')}>
              <FileSpreadsheet className="w-4 h-4" /> Fee Report
            </Button>
            <Button variant="outline" className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/30" onClick={() => toast.success('Attendance report exported!')}>
              <ClipboardList className="w-4 h-4" /> Attendance Report
            </Button>
          </div>
          <p className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-xl leading-relaxed">
            ☁️ Your data is automatically backed up every 6 hours on secure Indian servers (Mumbai). Daily Excel reports are emailed to the registered email address.
          </p>
        </div>
      ),
    },
    {
      icon: Shield,
      title: 'Data & Privacy',
      desc: 'Demo mode — all data is simulated',
      color: 'text-purple-500',
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300">
            ℹ️ This is a <strong>demo application</strong>. All student, staff, and financial data shown is simulated for demonstration purposes only. No real data is stored or transmitted.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => toast.success('Export started (simulated)')}>Export Demo Data</Button>
            <Button variant="destructive" className="flex-1" onClick={() => toast.info('Data cleared (simulated)')}>Clear Local Data</Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="page-enter">
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your IntelliCampus AI configuration</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Log Out
          </Button>
          <Button variant="primary" className="gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </Button>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        {sections.map(({ icon: Icon, title, desc, color, content }) => (
          <Card key={title}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className={`w-5 h-5 ${color}`} />
                {title}
              </CardTitle>
              <CardDescription>{desc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">{content}</CardContent>
          </Card>
        ))}

        {/* App version */}
        <div className="text-center text-xs text-muted-foreground pt-4 pb-2">
          <p className="font-semibold">IntelliCampus AI v1.0.0</p>
          <p className="mt-0.5">Built for Indian schools & colleges 🇮🇳 · Powered by AI</p>
        </div>
      </div>
    </div>
  );
}
