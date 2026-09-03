import React from 'react';
import {
  GraduationCap,
  Layers,
  Users,
  Grid,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Settings,
  BarChart3,
  Search,
  Printer,
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { AppState, UserRole } from '../types';

interface DashboardProps {
  state: AppState;
  currentRole: UserRole;
  currentTeacherId?: string;
  setActiveTab: (tab: string) => void;
  onSelectSheet?: (sheetId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  state,
  currentRole,
  currentTeacherId,
  setActiveTab,
  onSelectSheet,
}) => {
  const totalTeachers = state.teachers.length;
  const totalLevels = state.institution.activeLevels.length;
  const totalClasses = state.classes.length;
  const totalCategories = state.categories.length;
  const totalStudents = state.students.length;
  const totalSheets = state.passingSheets.length;

  const completedSheets = state.passingSheets.filter((s) => s.status === 'completed').length;
  const inProgressSheets = state.passingSheets.filter((s) => s.status === 'in_progress').length;
  const pendingSheets = state.passingSheets.filter((s) => s.status === 'pending').length;

  const completionPercentage = totalSheets > 0 ? Math.round((completedSheets / totalSheets) * 100) : 0;

  // Examiner specific view
  const currentTeacher = state.teachers.find((t) => t.id === currentTeacherId);
  const teacherTasks = state.tasks.filter((tk) => tk.teacherId === currentTeacherId);
  const teacherSheets = state.passingSheets.filter((s) => s.teacherId === currentTeacherId);

  // Criteria needing urgent remediation (overall)
  const criteriaStats: { subjectName: string; code: string; title: string; rate: number }[] = [];
  state.subjects.forEach((sub) => {
    sub.criteria.forEach((crit) => {
      let acquired = 0;
      let total = 0;
      state.students.forEach((std) => {
        const val = state.results[`${std.id}_${sub.id}_${crit.code}`];
        if (val && val !== 'none') {
          total++;
          if (val === 'acquired') acquired++;
        }
      });
      if (total > 0) {
        const rate = Math.round((acquired / total) * 100);
        criteriaStats.push({
          subjectName: sub.name,
          code: crit.code,
          title: crit.title,
          rate,
        });
      }
    });
  });

  const urgentCriteria = criteriaStats.filter((c) => c.rate < 70).sort((a, b) => a.rate - b.rate);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-emerald-800 to-teal-700 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium backdrop-blur-xs">
                منظومة تشخيص التعلمات والرائز
              </span>
              <span className="text-emerald-200 text-xs">
                الموسم الدراسي: {state.institution.academicYear}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              تدبير الدعم المكثف - {state.institution.name}
            </h2>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
              منصة متكاملة لتنظيم أفواج وفئات التلاميذ، إسناد مهام الأساتذة، توليد أوراق التمرير الرسمية A4، ورصد نتائج معايير الرائز التشخيصي لاستخراج خطط الدعم.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="dashboard-generate-sheets-btn"
              onClick={() => setActiveTab('sheets')}
              className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>أوراق التمرير والطباعة</span>
            </button>
            <button
              type="button"
              id="dashboard-record-results-btn"
              onClick={() => setActiveTab('results')}
              className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/40 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>رصد وتتبع النتائج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role specific notification banner */}
      {currentRole === 'examiner' && currentTeacher && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              {currentTeacher.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-blue-600 font-semibold">لوحة تحكم الأستاذ الممرر</p>
              <h4 className="text-sm font-bold">{currentTeacher.name} - ({currentTeacher.specialty})</h4>
              <p className="text-xs text-blue-700">لديك {teacherTasks.length} مهام مسندة و {teacherSheets.length} أوراق تمرير مخصصة لك.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('sheets')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg self-start sm:self-auto cursor-pointer"
          >
            عرض أوراق التمرير المسندة لي
          </button>
        </div>
      )}

      {/* Core Summary Counters (As Requested by User in Item 14) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">عدد الأساتذة</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalTeachers}</p>
          <span className="text-[11px] text-slate-500">أستاذ مسجل</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">عدد المستويات</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalLevels}</p>
          <span className="text-[11px] text-slate-500">مستويات تعليمية</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">عدد الأفواج</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <Grid className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalClasses}</p>
          <span className="text-[11px] text-slate-500">فوج دراسي</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">عدد التلاميذ</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalStudents}</p>
          <span className="text-[11px] text-slate-500">تلميذ وتلميذة</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">عدد الفئات</span>
            <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalCategories}</p>
          <span className="text-[11px] text-slate-500">فئة دعم</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">أوراق التمرير</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalSheets}</p>
          <span className="text-[11px] text-slate-500">ورقة تمرير جاهزة</span>
        </div>
      </div>

      {/* Progress & Passing Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pass Sheets Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">تقدم عملية تمرير الرائز</h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {completionPercentage}% مكتمل
              </span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden flex">
              <div
                className="bg-emerald-600 h-3 transition-all"
                style={{ width: `${(completedSheets / (totalSheets || 1)) * 100}%` }}
                title={`مكتمل: ${completedSheets}`}
              />
              <div
                className="bg-amber-500 h-3 transition-all"
                style={{ width: `${(inProgressSheets / (totalSheets || 1)) * 100}%` }}
                title={`قيد التمرير: ${inProgressSheets}`}
              />
              <div
                className="bg-slate-300 h-3 transition-all"
                style={{ width: `${(pendingSheets / (totalSheets || 1)) * 100}%` }}
                title={`في الانتظار: ${pendingSheets}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
                <span className="block font-bold text-base">{completedSheets}</span>
                <span>تم تمريرها</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
                <span className="block font-bold text-base">{inProgressSheets}</span>
                <span>قيد الرصد</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                <span className="block font-bold text-base">{pendingSheets}</span>
                <span>في الانتظار</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-600">
            <span>نظام التقييم المعتمد:</span>
            <span className="font-bold text-slate-900">
              {state.settings.evaluationSystem === 'acquired_levels'
                ? 'مكتسب / في طور الاكتساب / غير مكتسب'
                : state.settings.evaluationSystem === 'binary_check'
                ? 'علامات التمكن (✓ / ✗)'
                : 'الأرقام الثنائية (1 / 0)'}
            </span>
          </div>
        </div>

        {/* Urgent Remediation Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                معايير تحتاج إلى دعم مكثف عاجل
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-0.5"
            >
              <span>عرض التقرير المفصل</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {urgentCriteria.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs bg-slate-50 rounded-lg">
              لا توجد معايير متعثرة بنسبة حرجة حالياً، أو لم يتم إدخال نتائج كافية بعد.
            </div>
          ) : (
            <div className="space-y-2.5">
              {urgentCriteria.slice(0, 4).map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-black px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[11px]">
                      {c.code}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900">{c.title}</span>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span className="text-slate-500">{c.subjectName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-600">{c.rate}% تمكن</span>
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-semibold">
                      أولوية دعم
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Control Buttons Grid (User Item 14) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>أقسام تدبير المنظومة</span>
          <span className="text-xs text-slate-400 font-normal">
            (انقر للولوج المباشر لأي قسم)
          </span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('teachers')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-900 transition group cursor-pointer"
          >
            <GraduationCap className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold">الأساتذة والمهام</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('classes')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-900 transition group cursor-pointer"
          >
            <Layers className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold">المستويات والأفواج</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-900 transition group cursor-pointer"
          >
            <Users className="w-5 h-5 text-amber-600 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold">التلاميذ وتقسيم الفئات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subjects')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-900 transition group cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-purple-600 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold">المواد ومعايير الرائز</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sheets')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-900 transition group cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 text-rose-600 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold">أوراق التمرير والطباعة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-900 transition group cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-teal-600 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold">رصد وتسجيل النتائج</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-900 transition group cursor-pointer"
          >
            <BarChart3 className="w-5 h-5 text-indigo-600 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold">التقارير والإحصائيات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-900 transition group cursor-pointer"
          >
            <Search className="w-5 h-5 text-orange-600 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold">البحث عن تلميذ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('excel')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-900 transition group cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 text-green-600 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold">استيراد/تصدير Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('institution')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-900 transition group cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-slate-600 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold">إدارة المؤسسة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-900 transition group cursor-pointer"
          >
            <Settings className="w-5 h-5 text-slate-600 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold">الإعدادات والنسخ الاحتياطي</span>
          </button>
        </div>
      </div>
    </div>
  );
};
