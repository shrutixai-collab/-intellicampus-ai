'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight, Shield, User, HardHat, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveSettings, saveTeacherLogin, saveStaffPortalLogin } from '@/lib/store';
import { supportStaff } from '@/data/seed-data';
import type { InstitutionType, UserRole, SupportStaffRole } from '@/types';

const teachers = [
  { id: 'st3', name: 'Mr. Vinod Kale', subject: 'Mathematics' },
  { id: 'st4', name: 'Mrs. Sunanda Joshi', subject: 'English' },
  { id: 'st5', name: 'Mr. Rajendra Patil', subject: 'Science (Physics)' },
  { id: 'st6', name: 'Mrs. Priya Kadam', subject: 'Accounts & Commerce' },
  { id: 'st7', name: 'Mrs. K.S. Menon', subject: 'Hindi' },
  { id: 'st8', name: 'Mr. Suresh Gaikwad', subject: 'Social Studies' },
  { id: 'st9', name: 'Mrs. Nandita Bhatt', subject: 'Science (Biology)' },
  { id: 'st10', name: 'Mr. Aakash Sharma', subject: 'Computer Science' },
  { id: 'st11', name: 'Mrs. Deepa Kulkarni', subject: 'Chemistry' },
  { id: 'st12', name: 'Mr. Sandeep Rao', subject: 'Physical Education' },
];

const adminRoles: UserRole[] = ['Principal', 'Admin Staff', 'Accountant'];
const collegeAdminRoles: UserRole[] = ['Principal', 'Admin Staff', 'Accountant', 'HOD', 'Placement Officer'];

export default function LoginPage() {
  const router = useRouter();

  // Admin state
  const [institutionName, setInstitutionName] = useState('Delhi Public School, Pune');
  const [institutionType, setInstitutionType] = useState<InstitutionType>('school');
  const [adminRole, setAdminRole] = useState<UserRole>('Principal');
  const [adminPassword, setAdminPassword] = useState('demo123');
  const [adminLoading, setAdminLoading] = useState(false);

  // Teacher state
  const [selectedTeacherId, setSelectedTeacherId] = useState('st3');
  const [teacherPassword, setTeacherPassword] = useState('demo123');
  const [teacherLoading, setTeacherLoading] = useState(false);

  // Support staff state
  const [staffPin, setStaffPin] = useState('1234');
  const [selectedStaffId, setSelectedStaffId] = useState('ss3');
  const [staffLoading, setStaffLoading] = useState(false);

  const adminRolesList = institutionType === 'college' ? collegeAdminRoles : adminRoles;

  const handleAdminLogin = async () => {
    setAdminLoading(true);
    saveSettings({ institutionName, institutionType, role: adminRole });
    await new Promise(r => setTimeout(r, 800));
    router.push('/dashboard');
  };

  const handleTeacherLogin = async () => {
    setTeacherLoading(true);
    const teacher = teachers.find(t => t.id === selectedTeacherId);
    if (teacher) {
      saveTeacherLogin(teacher.id, teacher.name, institutionName, institutionType);
    }
    await new Promise(r => setTimeout(r, 800));
    router.push('/teacher-dashboard');
  };

  const staffOptions = [
    { id: 'ss3', label: 'रामू काका (Watchman)', role: 'Watchman' as SupportStaffRole },
    { id: 'ss1', label: 'सुरेश ड्रायव्हर (Bus Driver - Route 7)', role: 'Bus Driver' as SupportStaffRole },
    { id: 'ss2', label: 'मंगेश ड्रायव्हर (Bus Driver - Route 3)', role: 'Bus Driver' as SupportStaffRole },
    { id: 'ss4', label: 'सुनीता ताई (Helper/Cleaning)', role: 'Helper/Peon' as SupportStaffRole },
  ];

  const handleStaffLogin = async () => {
    setStaffLoading(true);
    const selected = staffOptions.find(s => s.id === selectedStaffId)!;
    const found = supportStaff.find(s => s.id === selectedStaffId);
    saveStaffPortalLogin(selected.id, found?.name ?? selected.label, selected.role);
    await new Promise(r => setTimeout(r, 800));
    router.push('/staff-portal');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A] p-5 relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-amber-500/8 blur-[80px] pointer-events-none" />

      {/* Branding */}
      <div className="text-center mb-8 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">IntelliCampus AI</h1>
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Campus Operations
        </div>
        <p className="text-white/50 text-sm mt-2">Choose your role to enter the portal</p>
      </div>

      {/* Three login cards */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">

        {/* CARD 1: Principal / Admin */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-sm flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">🏛️ Principal / Admin</h2>
              <p className="text-white/40 text-xs">Administration access</p>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Institution Name</label>
              <Input
                value={institutionName}
                onChange={e => setInstitutionName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Institution Type</label>
              <Select value={institutionType} onValueChange={v => { setInstitutionType(v as InstitutionType); setAdminRole('Principal'); }}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-blue-500 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">School (K-12)</SelectItem>
                  <SelectItem value="college">College (Degree / PG)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Role</label>
              <Select value={adminRole} onValueChange={v => setAdminRole(v as UserRole)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-blue-500 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {adminRolesList.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Password</label>
              <Input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <Button
            className="w-full mt-5 gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
            onClick={handleAdminLogin}
            disabled={adminLoading || !institutionName.trim()}
          >
            {adminLoading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Loading...</>
              : <>Enter Dashboard <ArrowRight className="w-4 h-4" /></>
            }
          </Button>
        </div>

        {/* CARD 2: Teacher */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-sm flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">👨‍🏫 Teacher</h2>
              <p className="text-white/40 text-xs">Classroom access</p>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Select Teacher</label>
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-emerald-500 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name} — {t.subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Password</label>
              <Input
                type="password"
                value={teacherPassword}
                onChange={e => setTeacherPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          <Button
            className="w-full mt-5 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            onClick={handleTeacherLogin}
            disabled={teacherLoading || !selectedTeacherId}
          >
            {teacherLoading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Loading...</>
              : <>Enter Portal <ArrowRight className="w-4 h-4" /></>
            }
          </Button>
        </div>

        {/* CARD 3: Support Staff */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-sm flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center">
              <HardHat className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">👷 सहाय्यक कर्मचारी</h2>
              <p className="text-white/40 text-xs">Support Staff</p>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">नाव निवडा / Select Name</label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-amber-500 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {staffOptions.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">पिन / PIN</label>
              <Input
                type="password"
                maxLength={4}
                value={staffPin}
                onChange={e => setStaffPin(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-amber-500 text-sm"
                placeholder="1234"
              />
            </div>
          </div>

          <Button
            className="w-full mt-5 gap-2 bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20"
            onClick={handleStaffLogin}
            disabled={staffLoading}
          >
            {staffLoading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Loading...</>
              : <>आत या / Enter <ArrowRight className="w-4 h-4" /></>
            }
          </Button>
        </div>
      </div>

      <p className="text-center text-white/30 text-xs mt-7 relative z-10">
        Demo Mode — No login required. All data is simulated.
      </p>
      <p className="text-center text-white/20 text-xs mt-1 relative z-10">
        Built for Indian schools &amp; colleges 🇮🇳
      </p>
    </div>
  );
}
