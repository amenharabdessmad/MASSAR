import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  ListOrdered,
  Eye,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Subject, Criterion } from '../types';

interface SubjectsCriteriaManagerProps {
  subjects: Subject[];
  activeLevels: string[];
  onAddSubject: (name: string, code: string, levels: string[]) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onAddCriterion: (subjectId: string, criterion: Omit<Criterion, 'id'>) => void;
  onUpdateCriterion: (subjectId: string, criterion: Criterion) => void;
  onDeleteCriterion: (subjectId: string, criterionId: string) => void;
}

export const SubjectsCriteriaManager: React.FC<SubjectsCriteriaManagerProps> = ({
  subjects,
  activeLevels,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onAddCriterion,
  onUpdateCriterion,
  onDeleteCriterion,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedPreviewLevel, setSelectedPreviewLevel] = useState<string>(activeLevels[0] || 'المستوى الأول');

  // Modals
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    selectedLevels: [...activeLevels],
  });

  const [isCriterionModalOpen, setIsCriterionModalOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);
  const [criterionForm, setCriterionForm] = useState({
    code: 'C1',
    title: '',
    description: '',
  });

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectForm({
      name: '',
      code: '',
      selectedLevels: [...activeLevels],
    });
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (s: Subject) => {
    setEditingSubject(s);
    setSubjectForm({
      name: s.name,
      code: s.code,
      selectedLevels: s.levels,
    });
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) {
      alert('يرجى كتابة اسم المادة');
      return;
    }
    const code = subjectForm.code.trim() || subjectForm.name.substring(0, 4).toUpperCase();

    if (editingSubject) {
      onUpdateSubject({
        ...editingSubject,
        name: subjectForm.name.trim(),
        code,
        levels: subjectForm.selectedLevels,
      });
    } else {
      onAddSubject(subjectForm.name.trim(), code, subjectForm.selectedLevels);
    }
    setIsSubjectModalOpen(false);
  };

  const handleOpenAddCriterion = () => {
    if (!currentSubject) return;
    const nextNum = currentSubject.criteria.length + 1;
    setEditingCriterion(null);
    setCriterionForm({
      code: `C${nextNum}`,
      title: '',
      description: '',
    });
    setIsCriterionModalOpen(true);
  };

  const handleOpenEditCriterion = (crit: Criterion) => {
    setEditingCriterion(crit);
    setCriterionForm({
      code: crit.code,
      title: crit.title,
      description: crit.description || '',
    });
    setIsCriterionModalOpen(true);
  };

  const handleSaveCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubject) return;
    if (!criterionForm.code.trim() || !criterionForm.title.trim()) {
      alert('يرجى تحديد رمز وعنوان المعيار');
      return;
    }

    if (editingCriterion) {
      onUpdateCriterion(currentSubject.id, {
        ...editingCriterion,
        code: criterionForm.code.trim().toUpperCase(),
        title: criterionForm.title.trim(),
        description: criterionForm.description.trim() || undefined,
      });
    } else {
      onAddCriterion(currentSubject.id, {
        code: criterionForm.code.trim().toUpperCase(),
        title: criterionForm.title.trim(),
        description: criterionForm.description.trim() || undefined,
      });
    }
    setIsCriterionModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">إعداد مواد الرائز ومعايير التشخيص</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              {subjects.length} مواد دراسية
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            تخصيص مواد الرائز وإضافة أو حذف معايير كل مادة (C1, C2, C3... Cn) مع عناوينها وتوصيفها الدقيق.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddSubject}
          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مادة جديدة</span>
        </button>
      </div>

      {/* Main layout: Subjects list on right, criteria and model on left */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects Column */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
            <span>المواد المعنية بالرائز</span>
            <span className="text-xs text-slate-400 font-normal">اختر مادة لضبط معاييرها</span>
          </h3>

          <div className="space-y-2">
            {subjects.map((sub) => {
              const isSelected = sub.id === currentSubject?.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sub.code}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{sub.name}</h4>
                      <span className="text-xs text-slate-500">
                        {sub.criteria.length} معايير مسجلة
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditSubject(sub)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="تعديل اسم المادة"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف مادة (${sub.name}) ومعاييرها بالكامل؟`)) {
                            onDeleteSubject(sub.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="حذف المادة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Criteria & Model Column */}
        {currentSubject && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      معايير مادة: {currentSubject.name}
                    </h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-xs rounded">
                      [{currentSubject.code}]
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    العدد الحالي للمعاير: {currentSubject.criteria.length} معايير (يمكنك الإضافة حتى C10 أو أكثر)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddCriterion}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة معيار جديد (C{currentSubject.criteria.length + 1})</span>
                </button>
              </div>

              {/* Criteria List */}
              <div className="divide-y divide-slate-100 mt-2">
                {currentSubject.criteria.map((crit, index) => (
                  <div
                    key={crit.id}
                    className="py-3 px-2 hover:bg-slate-50 rounded-xl transition flex items-start justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                        {crit.code}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{crit.title}</h4>
                        {crit.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {crit.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCriterion(crit)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="تعديل المعيار"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف المعيار ${crit.code} (${crit.title})؟`)) {
                            onDeleteCriterion(currentSubject.id, crit.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="حذف المعيار"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 7: إعداد نموذج الرائز ومحاكاة جدول التمرير */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold">معاينة نموذج رائز التمرير</h4>
                </div>
                <span className="text-[11px] text-slate-300">
                  تحديث تلقائي في جميع أوراق التمرير والطباعة
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                هكذا ستظهر أعمدة مادة <strong className="text-white">{currentSubject.name}</strong> في جدول رائز التمرير المطبوع A4:
              </p>

              <div className="overflow-x-auto bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                <div className="text-center font-bold text-xs py-1 bg-emerald-700/60 rounded-t border-b border-slate-600">
                  {currentSubject.name} ({currentSubject.criteria.length} معايير)
                </div>
                <div className="grid grid-flow-col auto-cols-fr gap-1 pt-1 text-center font-mono text-[11px] font-bold">
                  {currentSubject.criteria.map((c) => (
                    <div
                      key={c.id}
                      className="bg-slate-700/70 py-1 px-2 rounded border border-slate-600"
                      title={c.title}
                    >
                      {c.code}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              {editingSubject ? 'تعديل بيانات المادة' : 'إضافة مادة دراسية جديدة'}
            </h3>

            <form onSubmit={handleSaveSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المادة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="مثال: النشاط العلمي، التربية الإسلامية..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رمز المادة (اختياري)
                </label>
                <input
                  type="text"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  placeholder="مثال: SC, AR, MATH..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition"
                >
                  حفظ المادة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Criterion Modal */}
      {isCriterionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              {editingCriterion ? 'تعديل المعيار' : `إضافة معيار جديد لمادة ${currentSubject?.name}`}
            </h3>

            <form onSubmit={handleSaveCriterion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رمز المعيار <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={criterionForm.code}
                  onChange={(e) => setCriterionForm({ ...criterionForm, code: e.target.value })}
                  placeholder="C1, C2, C3, C7..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان المعيار أو الكفاية المستهدفة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={criterionForm.title}
                  onChange={(e) => setCriterionForm({ ...criterionForm, title: e.target.value })}
                  placeholder="مثال: فهم المقروء، قراءة وكتابة الأعداد..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  وصف تفصيلي ومؤشرات التحقق (اختياري)
                </label>
                <textarea
                  rows={3}
                  value={criterionForm.description}
                  onChange={(e) => setCriterionForm({ ...criterionForm, description: e.target.value })}
                  placeholder="تحديد المطلوب من المتعلم بدقة لقياس تحقق هذا المعيار..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCriterionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition"
                >
                  حفظ المعيار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
