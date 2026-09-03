import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit3, Users, Check, AlertCircle } from 'lucide-react';
import { ClassGroup, Category, Student } from '../types';

interface ClassesManagerProps {
  activeLevels: string[];
  classes: ClassGroup[];
  categories: Category[];
  students: Student[];
  onAddClass: (level: string, className: string, categoryCount: number) => void;
  onUpdateClassCategories: (classId: string, newCategoryCount: number) => void;
  onDeleteClass: (classId: string) => void;
  onSelectClassForStudents?: (level: string, classId: string) => void;
}

export const ClassesManager: React.FC<ClassesManagerProps> = ({
  activeLevels,
  classes,
  categories,
  students,
  onAddClass,
  onUpdateClassCategories,
  onDeleteClass,
  onSelectClassForStudents,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>(activeLevels[0] || 'المستوى الأول');
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newCategoryCount, setNewCategoryCount] = useState<number>(3);
  const [customCatInput, setCustomCatInput] = useState('');

  // Editing existing class category count
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  const [editCategoryCount, setEditCategoryCount] = useState<number>(3);

  const filteredClasses = classes.filter((c) => c.level === selectedLevel);

  const handleOpenAddClass = () => {
    // Propose default name e.g. "الفوج 3"
    const nextNumber = filteredClasses.length + 1;
    setNewClassName(`الفوج ${nextNumber}`);
    setNewCategoryCount(3);
    setCustomCatInput('');
    setIsAddClassModalOpen(true);
  };

  const handleSaveNewClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      alert('يرجى إدخال اسم الفوج');
      return;
    }

    const count = customCatInput ? parseInt(customCatInput, 10) : newCategoryCount;
    if (isNaN(count) || count < 1 || count > 12) {
      alert('يرجى إدخال عدد فئات صالح بين 1 و 12');
      return;
    }

    onAddClass(selectedLevel, newClassName.trim(), count);
    setIsAddClassModalOpen(false);
  };

  const handleSaveEditClass = () => {
    if (!editingClass) return;
    onUpdateClassCategories(editingClass.id, editCategoryCount);
    setEditingClass(null);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">هيكلة المستويات والأفواج والفئات</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {classes.length} فوج عبر {activeLevels.length} مستويات
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            تحديد الأفواج وتقسيم كل فوج إلى فئات دعم مرنة (2، 3، 4، 5 أو عدد مخصص).
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddClass}
          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة فوج جديد في {selectedLevel}</span>
        </button>
      </div>

      {/* Level Selector Tabs */}
      <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-1 scrollbar-none">
        {activeLevels.map((lvl) => {
          const isSelected = selectedLevel === lvl;
          const levelClassCount = classes.filter((c) => c.level === lvl).length;
          const levelStudentCount = students.filter((s) => s.level === lvl).length;
          return (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>{lvl}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  isSelected ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {levelClassCount} أفواج ({levelStudentCount} تلميذ)
              </span>
            </button>
          );
        })}
      </div>

      {/* Classes Grid for Current Level */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">لا يوجد أفواج مضافة بعد في {selectedLevel}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            قم بإضافة الفوج الأول وحدد عدد الفئات التي تريد تقسيم الفوج إليها لبدء توزيع التلاميذ.
          </p>
          <button
            type="button"
            onClick={handleOpenAddClass}
            className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة الفوج 1 الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls) => {
            const classCats = categories.filter((cat) => cat.classId === cls.id);
            const classStudents = students.filter((s) => s.classId === cls.id);

            return (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {cls.name.replace(/[^0-9]/g, '') || '1'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{cls.name}</h4>
                        <span className="text-[11px] text-slate-400">{cls.level}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingClass(cls);
                          setEditCategoryCount(cls.categoryCount);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="تعديل عدد الفئات"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `هل أنت متأكد من حذف ${cls.name}؟ سيتم أيضاً حذف تقسيم الفئات الخاص به.`
                            )
                          ) {
                            onDeleteClass(cls.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="حذف الفوج"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-600">إجمالي التلاميذ:</span>
                    <span className="font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded-md">
                      {classStudents.length} تلميذ
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-600">عدد الفئات المقسم إليها:</span>
                    <span className="font-bold text-blue-700 px-2 py-0.5 bg-blue-50 rounded-md">
                      {classCats.length} فئات
                    </span>
                  </div>

                  {/* List of categories with student counts */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">
                      توزيع الفئات وعدد المتعلمين في كل فئة:
                    </span>
                    {classCats.map((cat) => {
                      const catStudentCount = classStudents.filter((s) => s.categoryId === cat.id).length;
                      return (
                        <div
                          key={cat.id}
                          className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 rounded-lg text-xs"
                        >
                          <span className="font-medium text-slate-700">{cat.name}</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            {catStudentCount} تلاميذ
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {onSelectClassForStudents && (
                  <button
                    type="button"
                    onClick={() => onSelectClassForStudents(cls.level, cls.id)}
                    className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-600" />
                    <span>عرض لوائح تلاميذ {cls.name}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Class Modal (Includes prompt: "إلى كم فئة تريد تقسيم هذا الفوج؟") */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              إضافة فوج جديد في {selectedLevel}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              أدخل اسم الفوج وحدد عدد فئات الدعم التي تريد تقسيمه إليها.
            </p>

            <form onSubmit={handleSaveNewClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الفوج <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="مثال: الفوج 1، الفوج 2..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Requirement Section 3: "عند إنشاء فوج، أسأل المستخدم: إلى كم فئة تريد تقسيم هذا الفوج؟" */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-blue-950">
                  إلى كم فئة تريد تقسيم هذا الفوج؟ <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-blue-800">
                  اختر أحد الخيارات السريعة أو حدد عددًا مخصصًا:
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => {
                        setNewCategoryCount(cnt);
                        setCustomCatInput('');
                      }}
                      className={`py-2 rounded-lg text-xs font-bold transition border cursor-pointer ${
                        newCategoryCount === cnt && !customCatInput
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {cnt} فئات
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <span className="text-xs text-blue-900 font-medium whitespace-nowrap">
                    أو عدد مخصص:
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={customCatInput}
                    onChange={(e) => setCustomCatInput(e.target.value)}
                    placeholder="مثلا 6..."
                    className="w-24 px-2 py-1 bg-white border border-blue-200 rounded-lg text-xs font-bold text-center focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition"
                >
                  إنشاء الفوج وفئاته
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Count Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              تعديل تقسيم فئات {editingClass.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              اختر عدد الفئات الجديد لهذا الفوج وسيتم تحديث الفئات تلقائياً:
            </p>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {[2, 3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setEditCategoryCount(cnt)}
                  className={`py-2 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    editCategoryCount === cnt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cnt} فئات
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveEditClass}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition"
              >
                تطبيق التعديل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
