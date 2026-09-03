import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Sparkles,
  Download,
  Check,
  X,
  UserCheck,
  FileCheck,
  Edit3,
  Layers,
  ChevronRight,
  Eye
} from 'lucide-react';
import {
  AppState,
  TestPassingSheet,
  Student,
  Subject,
  EvaluationValue,
  Teacher,
  ClassGroup,
  Category,
  UserRole
} from '../types';

interface TestPassSheetsProps {
  state: AppState;
  currentRole: UserRole;
  currentTeacherId?: string;
  onUpdateResults: (newResults: Record<string, EvaluationValue>) => void;
  onAddSheet: (sheet: Omit<TestPassingSheet, 'id'>) => void;
  onBulkGenerateSheets: () => void;
  onDeleteSheet: (sheetId: string) => void;
  onUpdateSheetMeta: (sheetId: string, passingDate: string, notes: string, status: 'pending' | 'in_progress' | 'completed') => void;
  onPrintCurrentSheet: (sheetId: string) => void;
  onPrintAllSheets: () => void;
  onExportSheetToExcel: (sheetId: string) => void;
  selectedSheetId?: string;
  setSelectedSheetId: (id: string) => void;
}

export const TestPassSheets: React.FC<TestPassSheetsProps> = ({
  state,
  currentRole,
  currentTeacherId,
  onUpdateResults,
  onAddSheet,
  onBulkGenerateSheets,
  onDeleteSheet,
  onUpdateSheetMeta,
  onPrintCurrentSheet,
  onPrintAllSheets,
  onExportSheetToExcel,
  selectedSheetId,
  setSelectedSheetId,
}) => {
  // If examiner, filter only sheets assigned to them
  const availableSheets =
    currentRole === 'examiner' && currentTeacherId
      ? state.passingSheets.filter((s) => s.teacherId === currentTeacherId)
      : state.passingSheets;

  // Active sheet
  const activeSheet =
    availableSheets.find((s) => s.id === selectedSheetId) ||
    availableSheets[0] ||
    state.passingSheets[0];

  // Manual generation modal
  const [isNewSheetModalOpen, setIsNewSheetModalOpen] = useState(false);
  const [newSheetForm, setNewSheetForm] = useState({
    level: state.institution.activeLevels[0] || 'المستوى الأول',
    classId: state.classes[0]?.id || '',
    categoryId: state.categories[0]?.id || '',
    teacherId: state.teachers[0]?.id || '',
    subjectIds: state.subjects.map((s) => s.id),
  });

  const [dateInput, setDateInput] = useState<string>(activeSheet?.passingDate || new Date().toISOString().split('T')[0]);
  const [notesInput, setNotesInput] = useState<string>(activeSheet?.notes || '');

  // Keep local date & notes in sync when activeSheet changes
  React.useEffect(() => {
    if (activeSheet) {
      setDateInput(activeSheet.passingDate || new Date().toISOString().split('T')[0]);
      setNotesInput(activeSheet.notes || '');
    }
  }, [activeSheet?.id]);

  if (!activeSheet && availableSheets.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">لا توجد أوراق تمرير منشأة حالياً</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto mb-5">
          يمكنك الضغط على زر &quot;إنشاء أوراق التمرير لجميع الفئات تلقائيًا&quot; لتوليد جميع الأوراق بضغطة زر، أو إنشاء ورقة مخصصة لفئة محددة.
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onBulkGenerateSheets}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>إنشاء أوراق التمرير لجميع الفئات تلقائيًا</span>
          </button>
        </div>
      </div>
    );
  }

  // Active sheet entities
  const teacher = state.teachers.find((t) => t.id === activeSheet?.teacherId);
  const currentClass = state.classes.find((c) => c.id === activeSheet?.classId);
  const currentCategory = state.categories.find((c) => c.id === activeSheet?.categoryId);
  const sheetStudents = state.students.filter(
    (s) =>
      s.level === activeSheet?.level &&
      s.classId === activeSheet?.classId &&
      s.categoryId === activeSheet?.categoryId
  );
  const activeSubjects = state.subjects.filter((sub) => activeSheet?.subjectIds.includes(sub.id));

  // Cell Click Handler to cycle evaluation values
  const handleCellClick = (studentId: string, subjectId: string, criterionCode: string) => {
    const key = `${studentId}_${subjectId}_${criterionCode}`;
    const currentVal = state.results[key] || 'none';

    let nextVal: EvaluationValue = 'acquired';
    if (state.settings.evaluationSystem === 'acquired_levels') {
      if (currentVal === 'none') nextVal = 'acquired';
      else if (currentVal === 'acquired') nextVal = 'in_progress';
      else if (currentVal === 'in_progress') nextVal = 'not_acquired';
      else nextVal = 'none';
    } else {
      // Binary or Numeric
      if (currentVal === 'none') nextVal = 'acquired';
      else if (currentVal === 'acquired') nextVal = 'not_acquired';
      else nextVal = 'none';
    }

    onUpdateResults({
      ...state.results,
      [key]: nextVal,
    });
  };

  // Quick fill row
  const handleQuickFillStudent = (studentId: string, value: EvaluationValue) => {
    const updated = { ...state.results };
    activeSubjects.forEach((sub) => {
      sub.criteria.forEach((crit) => {
        const key = `${studentId}_${sub.id}_${crit.code}`;
        updated[key] = value;
      });
    });
    onUpdateResults(updated);
  };

  // Save sheet metadata (notes, date, status)
  const handleSaveMeta = (newStatus?: 'pending' | 'in_progress' | 'completed') => {
    if (!activeSheet) return;
    const statusToSave = newStatus || activeSheet.status;
    onUpdateSheetMeta(activeSheet.id, dateInput, notesInput, statusToSave);
  };

  // Manual Add Sheet submit
  const handleCreateManualSheet = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSheet({
      level: newSheetForm.level,
      classId: newSheetForm.classId,
      categoryId: newSheetForm.categoryId,
      teacherId: newSheetForm.teacherId,
      subjectIds: newSheetForm.subjectIds,
      passingDate: new Date().toISOString().split('T')[0],
      notes: '',
      status: 'pending',
    });
    setIsNewSheetModalOpen(false);
  };

  // Render evaluation cell content based on app settings
  const renderCellContent = (val: EvaluationValue) => {
    const sys = state.settings.evaluationSystem;

    if (val === 'acquired') {
      if (sys === 'acquired_levels') {
        return <span className="text-emerald-700 font-bold text-[11px]">مكتسب</span>;
      }
      if (sys === 'binary_check') {
        return <Check className="w-4 h-4 text-emerald-600 stroke-[3] mx-auto" />;
      }
      return <span className="text-emerald-700 font-bold text-xs">1</span>;
    }

    if (val === 'in_progress') {
      return <span className="text-amber-700 font-bold text-[10px]">في طوره</span>;
    }

    if (val === 'not_acquired') {
      if (sys === 'acquired_levels') {
        return <span className="text-rose-600 font-bold text-[10px]">غير مكتسب</span>;
      }
      if (sys === 'binary_check') {
        return <X className="w-4 h-4 text-rose-500 stroke-[3] mx-auto" />;
      }
      return <span className="text-rose-600 font-bold text-xs">0</span>;
    }

    return <span className="text-slate-300 font-bold">-</span>;
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs no-print">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">أوراق تمرير الرائز وجداول التنقيط</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {availableSheets.length} ورقة تمرير
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            توليد أوراق الرائز آلياً لكل فئة وأستاذ ممرر، مع طباعة A4 عالية الجودة، ورصد نتائج المعايير فورياً.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Prompt Item 12: Bulk generate button */}
          <button
            type="button"
            onClick={onBulkGenerateSheets}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="توليد وتحديث أوراق التمرير لجميع الأفواج والفئات والأساتذة آلياً"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>توليد أوراق جميع الفئات آلياً</span>
          </button>

          {/* Export to Excel */}
          {activeSheet && (
            <button
              type="button"
              onClick={() => onExportSheetToExcel(activeSheet.id)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="تصدير هذه الورقة إلى Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير Excel</span>
            </button>
          )}

          {/* Prompt Item 13: Print Current Sheet */}
          {activeSheet && (
            <button
              type="button"
              onClick={() => onPrintCurrentSheet(activeSheet.id)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="طباعة هذه الورقة بتنسيق A4 احترافي"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الورقة الحالية A4</span>
            </button>
          )}

          {/* Prompt Item 13: Print All Sheets */}
          <button
            type="button"
            onClick={onPrintAllSheets}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="طباعة كل أوراق التمرير دفعة واحدة مع فواصل صفحات A4"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة جميع أوراق التمرير</span>
          </button>
        </div>
      </div>

      {/* Sheets Navigation Bar / Tabs */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs no-print overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-xs font-bold text-slate-500 pl-2">الأوراق المتوفرة:</span>
          {availableSheets.map((sh) => {
            const isSelected = sh.id === activeSheet?.id;
            const cls = state.classes.find((c) => c.id === sh.classId)?.name;
            const cat = state.categories.find((c) => c.id === sh.categoryId)?.name;
            const tch = state.teachers.find((t) => t.id === sh.teacherId)?.name || 'أستاذ';

            return (
              <button
                key={sh.id}
                type="button"
                onClick={() => setSelectedSheetId(sh.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{sh.level}</span>
                <span className="opacity-60">•</span>
                <span>{cls}</span>
                <span className="opacity-60">•</span>
                <span className="text-emerald-400 font-bold">{cat}</span>
                {sh.status === 'completed' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="مكتملة" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* The Official Moroccan A4 Test Pass Sheet Card (Optimized for Screen & Print) */}
      {activeSheet && (
        <div className="bg-white rounded-2xl border border-slate-300 shadow-sm print-page p-6 lg:p-8 space-y-6">
          {/* Institutional Header (Prompt Item 8 & 13) */}
          <div className="border-b-2 border-slate-800 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-3">
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">{state.institution.name}</p>
                <p className="text-slate-600">{state.institution.directorate}</p>
                <p className="text-slate-600">
                  الموسم الدراسي: <strong>{state.institution.academicYear}</strong>
                </p>
              </div>

              <div className="text-center sm:text-center">
                <div className="inline-block px-4 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-black tracking-wide text-slate-900 mb-1">
                  رائز تشخيص التعلمات - تدبير الدعم المكثف
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  شبكة تفريغ نتائج التمرير الميداني للمتعلمين
                </p>
              </div>

              <div className="sm:text-left space-y-1 text-xs">
                <p className="text-slate-700">
                  المستوى:{' '}
                  <strong className="text-slate-900 text-sm font-bold">{activeSheet.level}</strong>
                </p>
                <p className="text-slate-700">
                  الفوج: <strong>{currentClass?.name || activeSheet.classId}</strong>
                  <span className="mx-1 text-slate-400">|</span>
                  الفئة: <strong className="text-emerald-800 font-bold">{currentCategory?.name || activeSheet.categoryId}</strong>
                </p>
                <p className="text-slate-700">
                  الأستاذ الممرر:{' '}
                  <strong className="text-slate-900 font-bold">
                    {teacher?.name || 'غير محدد'}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* Prompt Section 9 & 11: Main Interactive / Printable Sheet Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse border border-slate-400">
              <thead>
                {/* Level 1 Header: Subject Names */}
                <tr className="bg-slate-100 text-slate-900 font-bold">
                  <th
                    rowSpan={2}
                    className="border border-slate-400 p-2 text-center w-10 text-slate-700"
                  >
                    رقم
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-400 p-2 text-center w-24 text-slate-700"
                  >
                    رقم مسار
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-400 p-2 min-w-44 text-slate-900 font-bold"
                  >
                    الاسم الكامل للتلميذ
                  </th>

                  {activeSubjects.map((sub) => (
                    <th
                      key={sub.id}
                      colSpan={sub.criteria.length}
                      className="border border-slate-400 p-2 text-center font-bold bg-slate-200/90 text-slate-900"
                    >
                      {sub.name} ({sub.criteria.length} معايير)
                    </th>
                  ))}

                  <th
                    rowSpan={2}
                    className="border border-slate-400 p-2 text-center w-16 no-print text-[11px]"
                  >
                    رصد سريع
                  </th>
                </tr>

                {/* Level 2 Header: Criteria Codes (C1, C2, C3... Cn) */}
                <tr className="bg-slate-50 text-slate-700 font-mono text-[11px] font-bold">
                  {activeSubjects.map((sub) =>
                    sub.criteria.map((crit) => (
                      <th
                        key={crit.id}
                        className="border border-slate-400 p-1.5 text-center hover:bg-emerald-50 transition cursor-help"
                        title={`${crit.code}: ${crit.title}`}
                      >
                        {crit.code}
                      </th>
                    ))
                  )}
                </tr>
              </thead>

              <tbody>
                {sheetStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        4 +
                        activeSubjects.reduce((acc, s) => acc + s.criteria.length, 0)
                      }
                      className="p-8 text-center text-slate-400 font-bold"
                    >
                      لا يوجد تلاميذ مسجلين حالياً في هذه الفئة ({activeSheet.level} - {currentClass?.name} - {currentCategory?.name})
                    </td>
                  </tr>
                ) : (
                  sheetStudents.map((std, idx) => (
                    <tr key={std.id} className="hover:bg-slate-50/90 transition">
                      <td className="border border-slate-400 p-2 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-400 p-2 text-center font-mono text-slate-600 text-[11px]">
                        {std.studentNumber || '-'}
                      </td>
                      <td className="border border-slate-400 p-2 font-bold text-slate-900 whitespace-nowrap">
                        {std.fullName}
                      </td>

                      {/* Criteria Results Cells */}
                      {activeSubjects.map((sub) =>
                        sub.criteria.map((crit) => {
                          const key = `${std.id}_${sub.id}_${crit.code}`;
                          const val = state.results[key] || 'none';

                          return (
                            <td
                              key={crit.id}
                              onClick={() => handleCellClick(std.id, sub.id, crit.code)}
                              title={`نقر لتغيير النتيجة: ${crit.code} (${crit.title})`}
                              className={`border border-slate-400 p-1.5 text-center cursor-pointer select-none transition ${
                                val === 'acquired'
                                  ? 'bg-emerald-50/90 font-bold'
                                  : val === 'in_progress'
                                  ? 'bg-amber-50/90 font-bold'
                                  : val === 'not_acquired'
                                  ? 'bg-rose-50/90 font-bold'
                                  : 'hover:bg-slate-100'
                              }`}
                            >
                              {renderCellContent(val)}
                            </td>
                          );
                        })
                      )}

                      {/* Quick fill row button (Screen only) */}
                      <td className="border border-slate-400 p-1 text-center no-print">
                        <button
                          type="button"
                          onClick={() => handleQuickFillStudent(std.id, 'acquired')}
                          className="px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[10px] font-bold"
                          title="تحديد كل معايير التلميذ كمكتسب"
                        >
                          تمكن كلي
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Criteria Explanations Legend for Teachers */}
          <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs space-y-2">
            <span className="font-bold text-slate-900 block">
              فهرس وتوصيف معايير الرائز المعتمدة في هذا النموذج:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {activeSubjects.map((sub) => (
                <div key={sub.id} className="space-y-1">
                  <span className="font-bold text-emerald-800 text-[11px] block">
                    {sub.name}:
                  </span>
                  {sub.criteria.map((c) => (
                    <div key={c.id} className="text-[11px] text-slate-700 flex items-start gap-1">
                      <span className="font-bold font-mono text-slate-900 shrink-0">{c.code}:</span>
                      <span>{c.title}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Section 13: Footer Block (Notes, Date, Teacher Signature) */}
          <div className="pt-4 border-t-2 border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            {/* Notes Section */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-900 block">
                ملاحظات وخلاصات الأستاذ الممرر:
              </label>
              <textarea
                rows={2}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                onBlur={() => handleSaveMeta()}
                placeholder="تدوين أي ملاحظات خاصة بظروف التمرير أو الصعوبات المرصودة لدى المتعلمين..."
                className="w-full p-2 bg-slate-50/70 border border-slate-300 rounded-lg text-xs focus:bg-white"
              />
            </div>

            {/* Date and Signature Block */}
            <div className="space-y-3 sm:text-left">
              <div className="flex items-center sm:justify-end gap-2">
                <span className="font-bold text-slate-900">تاريخ التمرير:</span>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  onBlur={() => handleSaveMeta()}
                  className="p-1 border border-slate-300 rounded text-xs font-mono"
                />
              </div>

              <div className="pt-2">
                <span className="font-bold text-slate-900 block sm:text-left">
                  توقيع الأستاذ(ة) الممرر:
                </span>
                <div className="mt-2 h-14 border border-dashed border-slate-400 rounded-lg flex items-center justify-center text-slate-400 text-[11px]">
                  {teacher?.name || 'توقيع وخاتم الأستاذ'}
                </div>
              </div>
            </div>
          </div>

          {/* Status badge and quick actions bar (Screen Only) */}
          <div className="no-print pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">حالة الرصد:</span>
              <button
                type="button"
                onClick={() => handleSaveMeta('pending')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  activeSheet.status === 'pending'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                في الانتظار
              </button>
              <button
                type="button"
                onClick={() => handleSaveMeta('in_progress')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  activeSheet.status === 'in_progress'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                قيد التمرير والرصد
              </button>
              <button
                type="button"
                onClick={() => handleSaveMeta('completed')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  activeSheet.status === 'completed'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                مكتمل وتم التدقيق
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('هل تريد بالتأكيد حذف ورقة التمرير هذه؟')) {
                    onDeleteSheet(activeSheet.id);
                  }
                }}
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-bold transition"
              >
                حذف الورقة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden container for printing ALL sheets at once */}
      <div className="print-only">
        {state.passingSheets.map((sh) => {
          const sTch = state.teachers.find((t) => t.id === sh.teacherId);
          const sCls = state.classes.find((c) => c.id === sh.classId);
          const sCat = state.categories.find((c) => c.id === sh.categoryId);
          const sStudents = state.students.filter(
            (s) => s.level === sh.level && s.classId === sh.classId && s.categoryId === sh.categoryId
          );
          const sSubjects = state.subjects.filter((sub) => sh.subjectIds.includes(sub.id));

          return (
            <div key={sh.id} className="print-page p-6 mb-8 border-b-2 border-black">
              {/* Header */}
              <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-start text-xs">
                <div>
                  <h3 className="font-bold text-sm">{state.institution.name}</h3>
                  <p>{state.institution.directorate}</p>
                  <p>الموسم الدراسي: {state.institution.academicYear}</p>
                </div>
                <div className="text-center">
                  <span className="font-black text-sm border border-black px-3 py-1">
                    رائز تشخيص التعلمات - الدعم المكثف
                  </span>
                </div>
                <div className="text-left">
                  <p>المستوى: <strong>{sh.level}</strong></p>
                  <p>الفوج: <strong>{sCls?.name}</strong> | الفئة: <strong>{sCat?.name}</strong></p>
                  <p>الأستاذ الممرر: <strong>{sTch?.name}</strong></p>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-right text-[11px] border-collapse border border-black mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th rowSpan={2} className="border border-black p-1 text-center w-8">رقم</th>
                    <th rowSpan={2} className="border border-black p-1 text-center w-20">مسار</th>
                    <th rowSpan={2} className="border border-black p-1">الاسم الكامل للتلميذ</th>
                    {sSubjects.map((sub) => (
                      <th
                        key={sub.id}
                        colSpan={sub.criteria.length}
                        className="border border-black p-1 text-center font-bold"
                      >
                        {sub.name}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    {sSubjects.map((sub) =>
                      sub.criteria.map((crit) => (
                        <th key={crit.id} className="border border-black p-1 text-center font-mono text-[10px]">
                          {crit.code}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sStudents.map((std, idx) => (
                    <tr key={std.id}>
                      <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                      <td className="border border-black p-1 text-center font-mono">{std.studentNumber || '-'}</td>
                      <td className="border border-black p-1 font-bold">{std.fullName}</td>
                      {sSubjects.map((sub) =>
                        sub.criteria.map((crit) => {
                          const key = `${std.id}_${sub.id}_${crit.code}`;
                          const val = state.results[key] || 'none';
                          return (
                            <td key={crit.id} className="border border-black p-1 text-center">
                              {renderCellContent(val)}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="flex justify-between items-end text-xs border-t border-black pt-3">
                <div>
                  <p className="font-bold">ملاحظات الأستاذ الممرر:</p>
                  <p className="text-gray-600">{sh.notes || 'لا توجد ملاحظات خاصة.'}</p>
                </div>
                <div>
                  <p>تاريخ التمرير: {sh.passingDate || '..../..../2024'}</p>
                  <p className="mt-4 font-bold">توقيع الأستاذ الممرر: ........................</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
