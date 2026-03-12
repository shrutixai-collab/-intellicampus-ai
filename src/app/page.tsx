'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight, Sparkles, BarChart3, MessageSquare, IndianRupee, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveSettings, saveTeacherLogin } from '@/lib/store';
import type { InstitutionType, UserRole } from '@/types';

// Teacher data for dropdown (matches seed-data staff who are Teachers)
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

const features = [
  { icon: IndianRupee, label: 'Fee Management', desc: 'AI reminders & tracking' },
  { icon: MessageSquare, label: 'Complaint Desk', desc: 'Auto-route & resolve' },
  { icon: BarChart3, label: 'Attendance AI', desc: 'At-risk alerts' },
  { icon: Sparkles, label: 'Smart Circulars', desc: 'AI-drafted communications' },
];

export default function LoginPage() {
  const router = useRouter();
  const [institutionType, setInstitutionType] = useState<InstitutionType>('school');

  // Admin login state
  const [institutionName, setInstitutionName] = useState('Delhi Public School, Pune');
  const [adminRole, setAdminRole] = useState<UserRole>('Principal');
  const [adminPassword, setAdminPassword] = useState('demo123');
  const [adminLoading, setAdminLoading] = useState(false);

  // Teacher login state
  const [selectedTeacherId, setSelectedTeacherId] = useState('st3');
  const [teacherPassword, setTeacherPassword] = useState('demo123');
  const [teacherLoading, setTeacherLoading] = useState(false);

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

  return (
    <div className="min-h-screen flex bg-[#0F172A]">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[50%] p-12 relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-blue-500/15 blur-[100px] pointer-events-none" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">IntelliCampus AI</h1>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Campus Operations
          </div>
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
            Run your campus<br />
            <span className="text-emerald-400">smarter</span>, not harder.
          </h2>
          <p className="text-white/60 text-lg max-w-md leading-relaxed">
            From fee reminders to complaint routing — IntelliCampus AI handles the operations so you can focus on education.
          </p>

          {/* Feature pills */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 hover:bg-white/10 transition-all">
                <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-emerald-400" size={18} />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">{label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats footer */}
        <div className="relative z-10 flex items-center gap-8">
          {[['500+', 'Institutions Trust Us'], ['50,000+', 'Students Managed'], ['99.9%', 'Uptime']].map(([num, label]) => (
            <div key={label}>
              <p className="text-2xl font-bold text-white">{num}</p>
              <p className="text-white/40 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login forms */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 overflow-y-auto">
        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-6 lg:hidden">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">IntelliCampus AI</h1>
            <p className="text-white/50 text-xs">AI-Powered Campus Operations</p>
          </div>
        </div>

        {/* Institution type selector */}
        <div className="w-full max-w-3xl mb-5">
          <label className="block text-sm font-medium text-white/70 mb-1.5">Institution Type</label>
          <Select
            value={institutionType}
            onValueChange={v => setInstitutionType(v as InstitutionType)}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-emerald-500 w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="school">School (K-12)</SelectItem>
              <SelectItem value="college">College (Degree / PG)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Two login cards side by side */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* LEFT CARD: Principal / Admin Login */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-sm flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Principal / Admin</h2>
                <p className="text-white/40 text-xs">Administration access</p>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Institution Name</label>
                <Input
                  value={institutionName}
                  onChange={e => setInstitutionName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-emerald-500 text-sm"
                  placeholder="e.g. Delhi Public School, Pune"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Role</label>
                <Select value={adminRole} onValueChange={v => setAdminRole(v as UserRole)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-emerald-500 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {adminRolesList.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Password</label>
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-emerald-500 text-sm"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full mt-5 gap-2 shadow-lg shadow-emerald-500/20"
              onClick={handleAdminLogin}
              disabled={adminLoading || !institutionName.trim()}
            >
              {adminLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* RIGHT CARD: Teacher Login */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-sm flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Teacher Login</h2>
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
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} — {t.subject}
                      </SelectItem>
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
                  placeholder="Enter password"
                />
              </div>

              {/* Spacer to align button with admin card */}
              <div className="flex-1" />
            </div>

            <Button
              className="w-full mt-5 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              onClick={handleTeacherLogin}
              disabled={teacherLoading || !selectedTeacherId}
            >
              {teacherLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Enter Teacher Portal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Demo Mode — No login required. All data is simulated.
        </p>
        <p className="text-center text-white/30 text-xs mt-1">
          Built for Indian schools & colleges 🇮🇳
        </p>
      </div>
    </div>
  );
}
