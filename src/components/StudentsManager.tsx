import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ArrowLeftRight,
  Shuffle,
  FileSpreadsheet,
  Download,
  Upload,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  Search,
  MoveHorizontal
} from 'lucide-react';
import { Student, ClassGroup, Category } from '../types';

interface StudentsManagerProps {
  students: Student[];
  classes: ClassGroup[];
  categories: Category[];
  activeLevels: string[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onTransferStudent: (studentId: string, targetCategoryId: string) => void;
  onAutoDistributeStudents: (classId: string) => void;
  onExportExcel: (levelFilter?: string) => void;
  onOpenImportExcel: () => void;
  initialLevel?: string;
  initialClassId?: string;
}

export const StudentsManager: React.FC<StudentsManagerProps> = ({
  students,
  classes,
  categories,
  activeLevels,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onTransferStudent,
  onAutoDistributeStudents,
  onExportExcel,
  onOpenImportExcel,
  initialLevel,
  initialClassId,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>(
    initialLevel || activeLevels[0] || 'المستوى الأول'
  );

  const availableClasses = classes.filter((c) => c.level === selectedLevel);
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || availableClasses[0]?.id || ''
  );

  const availableCategories = categories.filter((cat) => cat.classId === selectedClassId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add/Edit Student modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    studentNumber: '',
    gender: 'M' as 'M' | 'F',
    level: selectedLevel,
    classId: selectedClassId,
    categoryId: availableCategories[0]?.id || '',
  });

  // Transfer Student modal
  const [transferingStudent, setTransferingStudent] = useState<Student | null>(null);
  const [targetCategory, setTargetCategory] = useState<string>('');

  // Auto distribute confirmation
  const [autoDistributeResult, setAutoDistributeResult] = useState<string | null>(null);

  // Filter students
  const filteredStudents = students.filter((std) => {
    if (std.level !== selectedLevel) return false;
    if (selectedClassId && std.classId !== selectedClassId) return false;
    if (selectedCategoryId !== 'all' && std.categoryId !== selectedCategoryId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = std.fullName.toLowerCase().includes(q);
      const matchNum = std.studentNumber?.toLowerCase().includes(q);
      if (!matchName && !matchNum) return false;
    }
    return true;
  });

  // Count by category for the selected class
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({
      fullName: '',
      studentNumber: '',
      gender: 'M',
      level: selectedLevel,
      classId: selectedClassId,
      categoryId: availableCategories[0]?.id || '',
    });
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (std: Student) => {
    setEditingStudent(std);
    setStudentForm({
      fullName: std.fullName,
      studentNumber: std.studentNumber || '',
      gender: std.gender || 'M',
      level: std.level,
      classId: std.classId,
      categoryId: std.categoryId,
    });
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.fullName.trim()) {
      alert('يرجى إدخال الاسم الكامل للتلميذ');
      return;
    }
    if (!studentForm.classId || !studentForm.categoryId) {
      alert('يرجى اختيار الفوج والفئة');
      return;
    }

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        fullName: studentForm.fullName.trim(),
        studentNumber: studentForm.studentNumber.trim() || undefined,
        gender: studentForm.gender,
        level: studentForm.level,
        classId: studentForm.classId,
        categoryId: studentForm.categoryId,
      });
    } else {
      onAddStudent({
        fullName: studentForm.fullName.trim(),
        studentNumber: studentForm.studentNumber.trim() || undefined,
        gender: studentForm.gender,
        level: studentForm.level,
        classId: studentForm.classId,
        categoryId: studentForm.categoryId,
      });
    }
    setIsStudentModalOpen(false);
  };

  // Perform balanced auto-distribution
  const handleAutoDistribute = () => {
    const currentClass = classes.find((c) => c.id === selectedClassId);
    if (!currentClass) return;

    if (availableCategories.length === 0) {
      alert('لا توجد فئات محددة لهذا الفوج ليتم التوزيع عليها');
      return;
    }

    if (classStudents.length === 0) {
      alert('لا يوجد تلاميذ في هذا الفوج لتوزيعهم');
      return;
    }

    const confirmMsg = `هل تريد بالتأكيد إعادة توزيع ${classStudents.length} تلميذًا بالتساوي وبأكبر قدر ممكن من التوازن على ${availableCategories.length} فئات في ${currentClass.name}؟`;
    if (!confirm(confirmMsg)) return;

    onAutoDistributeStudents(selectedClassId);
    setAutoDistributeResult(`تم توزيع ${classStudents.length} تلميذاً بنجاح على ${availableCategories.length} فئات.`);
    setTimeout(() => setAutoDistributeResult(null), 4000);
  };

  const handleOpenTransfer = (std: Student) => {
    setTransferingStudent(std);
    // Suggest the next category
    const otherCat = availableCategories.find((c) => c.id !== std.categoryId);
    setTargetCategory(otherCat?.id || availableCategories[0]?.id || '');
  };

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferingStudent || !targetCategory) return;
    onTransferStudent(transferingStudent.id, targetCategory);
    setTransferingStudent(null);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">لوائح التلاميذ وتقسيم الفئات</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {students.length} تلميذ إجمالاً
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            إدخال لوائح المتعلمين وتوزيعهم تلقائياً أو يدوياً إلى فئات الدعم المكثف واستيراد/تصدير ملفات Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenImportExcel}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>استيراد من Excel</span>
          </button>

          <button
            type="button"
            onClick={() => onExportExcel(selectedLevel)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير إلى Excel</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddStudent}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>إضافة تلميذ جديد</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Level -> Class -> Category */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Level Pills */}
        <div className="flex space-x-1.5 space-x-reverse overflow-x-auto pb-1 scrollbar-none">
          {activeLevels.map((lvl) => {
            const isSelected = selectedLevel === lvl;
            const lvlStudentCount = students.filter((s) => s.level === lvl).length;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setSelectedLevel(lvl);
                  const firstCls = classes.find((c) => c.level === lvl);
                  setSelectedClassId(firstCls?.id || '');
                  setSelectedCategoryId('all');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{lvl}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${isSelected ? 'bg-emerald-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {lvlStudentCount}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Class and Category Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600">الفوج:</span>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setSelectedCategoryId('all');
                }}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {availableClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Categories filter tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategoryId('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedCategoryId === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الكل ({classStudents.length})
              </button>
              {availableCategories.map((cat) => {
                const count = classStudents.filter((s) => s.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      selectedCategoryId === cat.id
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search input and Auto-balance button */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم التلميذ..."
                className="pr-8 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-44 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Prompt Item 4: Balanced Auto-Partition Button */}
            <button
              type="button"
              onClick={handleAutoDistribute}
              title="توزيع تلاميذ الفوج آلياً على الفئات بأكبر قدر ممكن من التوازن"
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Shuffle className="w-3.5 h-3.5 text-blue-600" />
              <span>تقسيم آلي متوازن للفئات</span>
            </button>
          </div>
        </div>

        {autoDistributeResult && (
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{autoDistributeResult}</span>
          </div>
        )}
      </div>

      {/* Category breakdown stats cards */}
      {selectedClassId && availableCategories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {availableCategories.map((cat, idx) => {
            const count = classStudents.filter((s) => s.categoryId === cat.id).length;
            const isSelected = selectedCategoryId === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">{cat.name}</span>
                  <span className="text-[10px] text-slate-400">فئة {idx + 1}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-900">{count}</span>
                  <span className="text-xs text-slate-500">تلميذ</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>لوائح تلاميذ {selectedLevel}</span>
          </h3>
          <span className="text-xs text-slate-500">
            المعروض: {filteredStudents.length} تلميذ
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">لا يوجد تلاميذ مطابقين للشروط</p>
            <p className="text-xs text-slate-400 mt-1">
              يمكنك إضافة تلميذ يدويًا أو استيراد اللائحة كاملة بملف Excel.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">الرقم</th>
                  <th className="py-3 px-3">رقم التلميذ / مسار</th>
                  <th className="py-3 px-3">الاسم الكامل للتلميذ</th>
                  <th className="py-3 px-3">الجنس</th>
                  <th className="py-3 px-3">المستوى</th>
                  <th className="py-3 px-3">الفوج</th>
                  <th className="py-3 px-3">الفئة المسند إليها</th>
                  <th className="py-3 px-3 text-center">إجراءات والتعديل اليدوي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((std, index) => {
                  const cls = classes.find((c) => c.id === std.classId)?.name || std.classId;
                  const cat = categories.find((c) => c.id === std.categoryId)?.name || std.categoryId;

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {std.studentNumber || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {std.fullName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            std.gender === 'F'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {std.gender === 'F' ? 'أنثى' : 'ذكر'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{std.level}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">{cls}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {cat}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Item 4: نقل تلميذ من فئة إلى أخرى */}
                          <button
                            type="button"
                            onClick={() => handleOpenTransfer(std)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-[11px] font-semibold transition flex items-center gap-1"
                            title="نقل التلميذ إلى فئة أخرى"
                          >
                            <MoveHorizontal className="w-3 h-3" />
                            <span>نقل الفئة</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditStudent(std)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            title="تعديل بيانات التلميذ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف التلميذ (${std.fullName})؟`)) {
                                onDeleteStudent(std.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="حذف التلميذ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              {editingStudent ? 'تعديل بيانات التلميذ' : 'إضافة تلميذ جديد'}
            </h3>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الكامل للتلميذ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentForm.fullName}
                  onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                  placeholder="مثال: ياسمين الإدريسي"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم التلميذ / مسار
                  </label>
                  <input
                    type="text"
                    value={studentForm.studentNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, studentNumber: e.target.value })}
                    placeholder="G139827"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الجنس
                  </label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as 'M' | 'F' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="M">ذكر</option>
                    <option value="F">أنثى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المستوى
                </label>
                <select
                  value={studentForm.level}
                  onChange={(e) => {
                    const newLvl = e.target.value;
                    const firstCls = classes.find((c) => c.level === newLvl);
                    const firstCat = firstCls ? categories.find((cat) => cat.classId === firstCls.id) : undefined;
                    setStudentForm({
                      ...studentForm,
                      level: newLvl,
                      classId: firstCls?.id || '',
                      categoryId: firstCat?.id || '',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  {activeLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الفوج
                  </label>
                  <select
                    value={studentForm.classId}
                    onChange={(e) => {
                      const newClsId = e.target.value;
                      const firstCat = categories.find((cat) => cat.classId === newClsId);
                      setStudentForm({
                        ...studentForm,
                        classId: newClsId,
                        categoryId: firstCat?.id || '',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    {classes
                      .filter((c) => c.level === studentForm.level)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الفئة
                  </label>
                  <select
                    value={studentForm.categoryId}
                    onChange={(e) => setStudentForm({ ...studentForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    {categories
                      .filter((cat) => cat.classId === studentForm.classId)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition"
                >
                  حفظ بيانات التلميذ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Transfer Modal (Requirement Item 4) */}
      {transferingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <MoveHorizontal className="w-5 h-5 text-blue-600" />
              <span>نقل التلميذ يدويًا إلى فئة أخرى</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              التلميذ: <strong className="text-slate-800">{transferingStudent.fullName}</strong>
            </p>

            <form onSubmit={handleConfirmTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اختر الفئة المستهدفة للنقل:
                </label>
                <div className="space-y-2">
                  {availableCategories.map((cat) => {
                    const isCurrent = transferingStudent.categoryId === cat.id;
                    const isTarget = targetCategory === cat.id;
                    return (
                      <label
                        key={cat.id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          isTarget
                            ? 'bg-blue-50 border-blue-500 text-blue-900'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="targetCat"
                            value={cat.id}
                            checked={isTarget}
                            onChange={() => setTargetCategory(cat.id)}
                            className="text-blue-600"
                          />
                          <span>{cat.name}</span>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            (الفئة الحالية)
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTransferingStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                >
                  تأكيد النقل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
