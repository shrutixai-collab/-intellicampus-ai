export type InstitutionType = 'school' | 'college';
export type UserRole = 'Principal' | 'Admin Staff' | 'Teacher' | 'Accountant' | 'HOD' | 'Placement Officer';
export type FeeStatus = 'Paid' | 'Partial' | 'Overdue';
export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved';
export type ComplaintPriority = 'High' | 'Medium' | 'Low';
export type ComplaintCategory = 'Transport' | 'Academic' | 'Infrastructure' | 'Fee Related' | 'Canteen' | 'Discipline' | 'Other';
export type CertificateType = 'Bonafide' | 'Transfer Certificate' | 'Character Certificate' | 'Migration Certificate' | 'NOC';
export type CertificateStatus = 'Pending' | 'Processing' | 'Ready' | 'Collected';
export type CircularCategory = 'Event' | 'Academic' | 'Administrative' | 'Fee' | 'Holiday';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late';
export type StaffStatus = 'Present' | 'Absent' | 'Leave';

export interface Student {
  id: string;
  name: string;
  classDiv: string;        // e.g. "Class 9B" or "FY BBA"
  parentName: string;
  parentPhone: string;
  totalFee: number;
  paidFee: number;
  feeStatus: FeeStatus;
  attendance: number;      // percentage 0-100
  lastReminder?: string;   // ISO date string
  rollNo: string;
  email?: string;
}

export interface Complaint {
  id: string;
  complaintNo: string;
  parentName: string;
  studentName: string;
  category: ComplaintCategory;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedTo: string;
  createdAt: string;       // ISO date string
  updatedAt: string;
  resolution?: string;
  aiResponse?: string;
}

export interface Staff {
  id: string;
  name: string;
  subject: string;
  phone: string;
  email: string;
  status: StaffStatus;
  classes: string[];       // e.g. ["Class 7B (Maths, Period 3)", "Class 9A (Maths, Period 5)"]
  qualification: string;
  joinDate: string;
  avatarInitials: string;
}

export interface Circular {
  id: string;
  title: string;
  content: string;
  category: CircularCategory;
  sentAt: string;
  targetAudience: string;
  totalRecipients: number;
  delivered: number;
  read: number;
  createdBy?: string;
}

export interface CertificateRequest {
  id: string;
  requestNo: string;
  studentId: string;
  studentName: string;
  classDiv: string;
  type: CertificateType;
  requestDate: string;
  expectedDate: string;
  status: CertificateStatus;
  purpose?: string;
  collectedDate?: string;
}

export interface ActivityItem {
  id: string;
  color: 'green' | 'blue' | 'yellow' | 'red';
  message: string;
  time: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'parent' | 'ai';
  time: string;
}

export interface ChatContact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: ChatMessage[];
}

export interface AppSettings {
  institutionName: string;
  institutionType: InstitutionType;
  role: UserRole;
}

export interface TestScore {
  id: string;
  studentId: string;
  subject: string;
  testName: string;
  examType: 'Weekly Test' | 'Unit Test' | 'Mid-Term' | 'Final Exam';
  marksObtained: number;
  totalMarks: number;
  date: string; // DD/MM/YYYY format
  classDiv: string;
  teacherId: string;
}

export interface SyllabusChapter {
  chapterNo: number;
  chapterName: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
  progressPercent?: number; // only for In Progress chapters
}

export interface TeacherSyllabusProgress {
  teacherId: string;
  classDiv: string;
  subject: string;
  totalChapters: number;
  chapters: SyllabusChapter[];
  lastUpdated: string; // DD/MM/YYYY
}

export interface TeacherSchedulePeriod {
  period: number;
  startTime: string;
  endTime: string;
  classDiv: string | null; // null = free period
  subject: string | null;
  type: 'teaching' | 'free' | 'substitute';
}

export interface TeacherTimetable {
  teacherId: string;
  schedule: TeacherSchedulePeriod[];
}

export interface DailyAttendanceRecord {
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late';
}

export interface StudentAttendanceHistory {
  studentId: string;
  records: DailyAttendanceRecord[];
}

export interface StaffDailyAttendanceRecord {
  date: string; // YYYY-MM-DD
  status: StaffStatus; // 'Present' | 'Absent' | 'Leave'
}

export interface StaffAttendanceHistory {
  staffId: string;
  records: StaffDailyAttendanceRecord[];
}

export interface StudentActivity {
  id: string;
  studentId: string;
  activity: string;
  achievement?: string;
  date: string; // DD/MM/YYYY
}

export type SupportStaffRole = 'Bus Driver' | 'Helper/Peon' | 'Watchman' | 'Cleaning Staff';

export interface SupportStaff {
  id: string;
  name: string;
  role: SupportStaffRole;
  phone: string;
  routeId?: string;
  joinDate: string;
}

export interface BusRoute {
  id: string;
  routeNo: string;
  name: string;
  stops: string[];
  driverId: string;
  driverName: string;
  departureTime: string;
  returnTime: string;
}

export interface VisitorEntry {
  id: string;
  visitorName: string;
  visitorPhone: string;
  purpose: 'Parent Meeting' | 'Delivery' | 'Official Visit' | 'Interview' | 'Other';
  meetingWith: string;
  entryTime: string;
  exitTime?: string;
  date: string;
}

export interface WorkLogEntry {
  id: string;
  staffId: string;
  task: string;
  notes?: string;
  time: string;
  date: string;
}
