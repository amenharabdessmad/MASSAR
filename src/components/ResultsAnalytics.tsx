import React, { useState } from 'react';
import {
  BarChart3,
  Filter,
  Download,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Users,
  Award,
  BookOpen,
  ArrowDownCircle,
  HelpCircle
} from 'lucide-react';
import { AppState, Student, Subject, Criterion } from '../types';

interface ResultsAnalyticsProps {
  state: AppState;
  onExportExcel: () => void;
  onPrintReport: () => void;
}

export const ResultsAnalytics: React.FC<ResultsAnalyticsProps> = ({
  state,
  onExportExcel,
  onPrintReport,
}) => {
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Filter students based on level, class, category
  const filteredStudents = state.students.filter((s) => {
    if (levelFilter !== 'all' && s.level !== levelFilter) return false;
    if (classFilter !== 'all' && s.classId !== classFilter) return false;
    if (categoryFilter !== 'all' && s.categoryId !== categoryFilter) return false;
    return true;
  });

  const availableClasses =
    levelFilter === 'all'
      ? state.classes
      : state.classes.filter((c) => c.level === levelFilter);

  const availableCategories =
    classFilter === 'all'
      ? state.categories
      : state.categories.filter((cat) => cat.classId === classFilter);

  const activeSubjects =
    subjectFilter === 'all'
      ? state.subjects
      : state.subjects.filter((sub) => sub.id === subjectFilter);

  // Compute criteria statistics
  interface CriterionStat {
    subjectId: string;
    subjectName: string;
    code: string;
    title: string;
    description?: string;
    totalAssessed: number;
    acquired: number;
    inProgress: number;
    notAcquired: number;
    masteryRate: number;
    studentsNeedingSupport: Student[];
  }

  const statsList: CriterionStat[] = [];

  activeSubjects.forEach((sub) => {
    sub.criteria.forEach((crit) => {
      let acquired = 0;
      let inProgress = 0;
      let notAcquired = 0;
      let totalAssessed = 0;
      const studentsNeedingSupport: Student[] = [];

      filteredStudents.forEach((std) => {
        const key = `${std.id}_${sub.id}_${crit.code}`;
        const val = state.results[key];
        if (val && val !== 'none') {
          totalAssessed++;
          if (val === 'acquired') {
            acquired++;
          } else if (val === 'in_progress') {
            inProgress++;
            studentsNeedingSupport.push(std);
          } else if (val === 'not_acquired') {
            notAcquired++;
            studentsNeedingSupport.push(std);
          }
        }
      });

      const masteryRate = totalAssessed > 0 ? Math.round((acquired / totalAssessed) * 100) : 0;

      statsList.push({
        subjectId: sub.id,
        subjectName: sub.name,
        code: crit.code,
        title: crit.title,
        description: crit.description,
        totalAssessed,
        acquired,
        inProgress,
        notAcquired,
        masteryRate,
        studentsNeedingSupport,
      });
    });
  });

  // Criteria needing urgent remediation (masteryRate < 70% and assessed > 0)
  const urgentCriteria = statsList
    .filter((s) => s.totalAssessed > 0 && s.masteryRate < 70)
    .sort((a, b) => a.masteryRate - b.masteryRate);

  // Selected criterion for detailed modal / student remediation list
  const [selectedCritForSupport, setSelectedCritForSupport] = useState<CriterionStat | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs no-print">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">تقارير وتحليل نتائج رائز التشخيص</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              تحليل إحصائي وتشخيص التعلمات
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            استخراج نتائج كل تلميذ، كل معيار، كل مادة، كل فوج وفئة، مع تحديد الكفايات المتعثرة ولوائح الدعم المكثف.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportExcel}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير تقرير Excel</span>
          </button>

          <button
            type="button"
            onClick={onPrintReport}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة التقرير التشخيصي</span>
          </button>
        </div>
      </div>

      {/* Filter Selection Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Level */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">المستوى الدراسي:</label>
            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setClassFilter('all');
                setCategoryFilter('all');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">جميع المستويات</option>
              {state.institution.activeLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">الفوج:</label>
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setCategoryFilter('all');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">جميع الأفواج</option>
              {availableClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.level} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">الفئة / المجموعة:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">جميع الفئات</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">المادة الدراسية:</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">جميع المواد</option>
              {state.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            نطاق التحليل الحالي يشمل: <strong className="text-slate-900">{filteredStudents.length} تلميذًا</strong>
          </span>
          {urgentCriteria.length > 0 && (
            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              يوجد {urgentCriteria.length} معايير بحاجة إلى دعم مكثف ذو أولوية
            </span>
          )}
        </div>
      </div>

      {/* Urgent Remediation Recommendations Banner (Prompt Section 15 & 23) */}
      {urgentCriteria.length > 0 && (
        <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                المعايير التي تحتاج إلى دعم مكثف ذو أولوية عاجلة (نسبة التمكن أقل من 70%)
              </h3>
              <p className="text-xs text-slate-500">
                انقر على أي معيار لاستخراج لائحة التلاميذ المتعثرين فيه بدقة لبرمجة حصص الدعم لهم.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {urgentCriteria.map((crit, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedCritForSupport(crit)}
                className="p-3.5 bg-rose-50/50 hover:bg-rose-50 rounded-xl border border-rose-200 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-black text-xs px-2 py-0.5 bg-rose-200 text-rose-800 rounded">
                      {crit.code}
                    </span>
                    <span className="text-xs font-bold text-rose-700">
                      {crit.masteryRate}% تمكن
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{crit.title}</h4>
                  <span className="text-[11px] text-slate-500">{crit.subjectName}</span>
                </div>

                <div className="mt-3 pt-2 border-t border-rose-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">التلاميذ غير المتمكنين:</span>
                  <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded shadow-2xs">
                    {crit.studentsNeedingSupport.length} تلميذ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Results Table (Prompt Section 15 example) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>جدول نسب التمكن وتوزيع نتائج معايير الرائز</span>
          </h3>
          <span className="text-xs text-slate-400">
            عدد المعايير المحللة: {statsList.length} معايير
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">المادة</th>
                <th className="py-3 px-3 text-center">المعيار</th>
                <th className="py-3 px-3 min-w-44">عنوان المعيار</th>
                <th className="py-3 px-3 text-center">المفحوصون</th>
                <th className="py-3 px-3 text-center text-emerald-700">المكتسبون</th>
                <th className="py-3 px-3 text-center text-amber-700">في طور الاكتساب</th>
                <th className="py-3 px-3 text-center text-rose-600">غير المكتسبين</th>
                <th className="py-3 px-3 text-center">نسبة التمكن</th>
                <th className="py-3 px-3 text-center">مستوى الحاجة للدعم</th>
                <th className="py-3 px-3 text-center no-print">لائحة التلاميذ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {statsList.map((st, i) => {
                const badgeColor =
                  st.masteryRate >= 80
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : st.masteryRate >= 60
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200';

                const needLevel =
                  st.masteryRate >= 80
                    ? 'متحكم فيه (تحصين)'
                    : st.masteryRate >= 60
                    ? 'دعم متوسط'
                    : 'دعم مكثف عاجل';

                return (
                  <tr key={i} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{st.subjectName}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-black text-slate-900">
                      {st.code}
                    </td>
                    <td className="py-2.5 px-3 text-slate-900 font-medium">{st.title}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                      {st.totalAssessed}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700 bg-emerald-50/40">
                      {st.acquired}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-amber-700 bg-amber-50/40">
                      {st.inProgress}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-rose-700 bg-rose-50/40">
                      {st.notAcquired}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-bold text-slate-900 text-xs">{st.masteryRate}%</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}>
                        {needLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center no-print">
                      <button
                        type="button"
                        onClick={() => setSelectedCritForSupport(st)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-bold transition"
                      >
                        عرض المستهدفين ({st.studentsNeedingSupport.length})
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Students Needing Support in a specific criterion */}
      {selectedCritForSupport && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-xs font-bold">
                  {selectedCritForSupport.code}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  لائحة المتعلمين المستهدفين بالدعم المكثف
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedCritForSupport.subjectName}: {selectedCritForSupport.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCritForSupport(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
                <span>إجمالي المتعثرين في هذا المعيار:</span>
                <span className="font-bold text-rose-700">
                  {selectedCritForSupport.studentsNeedingSupport.length} تلميذ
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {selectedCritForSupport.studentsNeedingSupport.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">
                    لا يوجد تلاميذ متعثرين في هذا المعيار.
                  </p>
                ) : (
                  selectedCritForSupport.studentsNeedingSupport.map((std, idx) => {
                    const cls = state.classes.find((c) => c.id === std.classId)?.name;
                    const cat = state.categories.find((c) => c.id === std.categoryId)?.name;
                    return (
                      <div
                        key={std.id}
                        className="p-2.5 hover:bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400 w-5">{idx + 1}</span>
                          <span className="font-bold text-slate-900">{std.fullName}</span>
                        </div>
                        <span className="text-slate-500 text-[11px]">
                          {std.level} - {cls} - {cat}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCritForSupport(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
