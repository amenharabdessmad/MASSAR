import React from 'react';
import { 
  GraduationCap, 
  Building2, 
  UserCheck, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Users,
  PenTool
} from 'lucide-react';
import { AppState, UserRole } from '../types';

interface NavbarProps {
  state: AppState;
  currentRole: UserRole;
  currentTeacherId?: string;
  onRoleChange: (role: UserRole, teacherId?: string) => void;
  onQuickPrint: () => void;
  onQuickBackup: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  currentRole,
  currentTeacherId,
  onRoleChange,
  onQuickPrint,
  onQuickBackup,
  activeTab,
  setActiveTab,
}) => {
  const currentTeacher = state.teachers.find((t) => t.id === currentTeacherId);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Institution & App Branding */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                  تدبير الدعم المكثف ورائز التمرير
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {state.institution.academicYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span>{state.institution.name}</span>
                <span className="text-slate-300">•</span>
                <span>{state.institution.directorate}</span>
              </p>
            </div>
          </div>

          {/* User Role Switcher & Quick Actions */}
          <div className="flex items-center space-x-3 space-x-reverse">
            {/* Role Switcher */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                id="role-admin-btn"
                onClick={() => onRoleChange('admin')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
                  currentRole === 'admin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>المدير / المسؤول</span>
              </button>

              <button
                type="button"
                id="role-examiner-btn"
                onClick={() => onRoleChange('examiner', state.teachers[0]?.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
                  currentRole === 'examiner'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-3.5 h-3.5 text-blue-600" />
                <span>الأستاذ الممرر</span>
              </button>

              <button
                type="button"
                id="role-dataentry-btn"
                onClick={() => onRoleChange('data_entry')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium ${
                  currentRole === 'data_entry'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>مسؤول النتائج</span>
              </button>
            </div>

            {/* If examiner role is selected, allow choosing which teacher */}
            {currentRole === 'examiner' && (
              <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg text-xs">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <select
                  id="examiner-select"
                  value={currentTeacherId || ''}
                  onChange={(e) => onRoleChange('examiner', e.target.value)}
                  className="bg-transparent font-medium text-blue-900 focus:outline-none cursor-pointer"
                >
                  {state.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialty})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Auto-save Status Indicator */}
            <div className="hidden lg:flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>الحفظ التلقائي مفعّل</span>
            </div>

            {/* Quick Print Button */}
            <button
              type="button"
              id="quick-print-btn"
              onClick={onQuickPrint}
              title="طباعة سريعة للوثيقة الحالية"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">طباعة</span>
            </button>

            {/* Quick Backup Button */}
            <button
              type="button"
              id="quick-backup-btn"
              onClick={onQuickBackup}
              title="تصدير نسخة احتياطية من قاعدة البيانات"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">نسخ احتياطي</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
