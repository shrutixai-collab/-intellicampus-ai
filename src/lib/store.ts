'use client';

// Simple localStorage-based store for demo app settings
import type { AppSettings, InstitutionType, UserRole } from '@/types';

const KEY = 'intellicampus_settings';

export const defaultSettings: AppSettings = {
  institutionName: 'Delhi Public School, Pune',
  institutionType: 'school',
  role: 'Principal',
};

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSettings;
    return JSON.parse(raw) as AppSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(settings));
}

export function clearSettings(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

export function saveTeacherLogin(teacherId: string, teacherName: string, institutionName: string, institutionType: InstitutionType): void {
  if (typeof window === 'undefined') return;
  const settings = { institutionName, institutionType, role: 'Teacher' as const, teacherId, teacherName };
  localStorage.setItem(KEY, JSON.stringify(settings));
  localStorage.setItem('intellicampus_teacher_id', teacherId);
  localStorage.setItem('intellicampus_teacher_name', teacherName);
}

export function getTeacherId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('intellicampus_teacher_id');
}

export function getTeacherName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('intellicampus_teacher_name');
}

// Label helpers based on institution type
export function getLabels(type: InstitutionType) {
  if (type === 'college') {
    return {
      class: 'Year/Semester',
      parent: 'Guardian',
      principal: 'Principal / Dean',
      student: 'Student',
      school: 'College',
    };
  }
  return {
    class: 'Class',
    parent: 'Parent',
    principal: 'Principal',
    student: 'Student',
    school: 'School',
  };
}
