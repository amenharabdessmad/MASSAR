import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ClipboardList,
  Shield,
  FilePenLine,
  UserPlus,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { Teacher, TeacherTask, ClassGroup, Category, Subject } from '../types';

interface TeachersManagerProps {
  teachers: Teacher[];
  tasks: TeacherTask[];
  classes: ClassGroup[];
  categories: Category[];
  subjects: Subject[];
  activeLevels: string[];
  onAddTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onAddTask: (task: Omit<TeacherTask, 'id'>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TeachersManager: React.FC<TeachersManagerProps> = ({
  teachers,
  tasks,
  classes,
  categories,
  subjects,
  activeLevels,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onAddTask,
  onDeleteTask,
}) => {
  // Modal states
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    code: '',
    specialty: 'اللغة العربية',
    assignedLevel: activeLevels[0] || 'المستوى الأول',
    phone: '',
  });

  // Task assignment modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<{
    teacherId: string;
    taskType: 'examiner' | 'supervisor' | 'data_entry';
    level: string;
    classId: string;
    categoryId: string;
    selectedSubjects: string[];
    scopeNotes: string;
  }>({
    teacherId: teachers[0]?.id || '',
    taskType: 'examiner',
    level: activeLevels[0] || 'المستوى الأول',
    classId: '',
    categoryId: '',
    selectedSubjects: subjects.map((s) => s.id),
    scopeNotes: '',
  });

  // Filter categories by selected class
  const filteredClasses = classes.filter((c) => c.level === taskForm.level);
  const filteredCategories = categories.filter((cat) => cat.classId === taskForm.classId);

  // Open Add Teacher
  const handleOpenAddTeacher = () => {
    setEditingTeacher(null);
    setTeacherForm({
      name: '',
      code: '',
      specialty: 'اللغة العربية',
      assignedLevel: activeLevels[0] || 'المستوى الأول',
      phone: '',
    });
    setIsTeacherModalOpen(true);
  };

  // Open Edit Teacher
  const handleOpenEditTeacher = (t: Teacher) => {
    setEditingTeacher(t);
    setTeacherForm({
      name: t.name,
      code: t.code || '',
      specialty: t.specialty,
      assignedLevel: t.assignedLevel || activeLevels[0] || '',
      phone: t.phone || '',
    });
    setIsTeacherModalOpen(true);
  };

  // Submit Teacher
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name.trim()) {
      alert('يرجى إدخال اسم الأستاذ');
      return;
    }

    if (editingTeacher) {
      onUpdateTeacher({
        ...editingTeacher,
        name: teacherForm.name.trim(),
        code: teacherForm.code.trim() || undefined,
        specialty: teacherForm.specialty,
        assignedLevel: teacherForm.assignedLevel,
        phone: teacherForm.phone.trim() || undefined,
      });
    } else {
      onAddTeacher({
        name: teacherForm.name.trim(),
        code: teacherForm.code.trim() || undefined,
        specialty: teacherForm.specialty,
        assignedLevel: teacherForm.assignedLevel,
        phone: teacherForm.phone.trim() || undefined,
      });
    }
    setIsTeacherModalOpen(false);
  };

  // Open Task Assignment
  const handleOpenAddTask = (teacherId?: string) => {
    const selectedLvl = activeLevels[0] || 'المستوى الأول';
    const firstCls = classes.find((c) => c.level === selectedLvl);
    const firstCat = firstCls ? categories.find((cat) => cat.classId === firstCls.id) : undefined;

    setTaskForm({
      teacherId: teacherId || teachers[0]?.id || '',
      taskType: 'examiner',
      level: selectedLvl,
      classId: firstCls?.id || '',
      categoryId: firstCat?.id || '',
      selectedSubjects: subjects.map((s) => s.id),
      scopeNotes: '',
    });
    setIsTaskModalOpen(true);
  };

  // Submit Task
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.teacherId) {
      alert('يرجى اختيار الأستاذ المعني بالمهمة');
      return;
    }

    if (taskForm.taskType === 'examiner' && (!taskForm.classId || !taskForm.categoryId)) {
      alert('يرجى تحديد الفوج والفئة الخاصة بمهمة التمرير');
      return;
    }

    onAddTask({
      teacherId: taskForm.teacherId,
      taskType: taskForm.taskType,
      level: taskForm.level,
      classId: taskForm.classId || undefined,
      categoryId: taskForm.categoryId || undefined,
      subjects: taskForm.selectedSubjects,
      scopeNotes: taskForm.scopeNotes.trim() || undefined,
    });

    setIsTaskModalOpen(false);
  };

  const handleToggleSubject = (subId: string) => {
    if (taskForm.selectedSubjects.includes(subId)) {
      if (taskForm.selectedSubjects.length === 1) return;
      setTaskForm({
        ...taskForm,
        selectedSubjects: taskForm.selectedSubjects.filter((id) => id !== subId),
      });
    } else {
      setTaskForm({
        ...taskForm,
        selectedSubjects: [...taskForm.selectedSubjects, subId],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">إدارة هيئة التدريس وإسناد المهام</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {teachers.length} أستاذ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            إدخال وتعديل بيانات الأساتذة وتعيين مهام التمرير والإشراف ورقمنة النتائج.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenAddTask()}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>إسناد مهمة جديدة</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddTeacher}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة أستاذ جديد</span>
          </button>
        </div>
      </div>

      {/* Teachers Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>لائحة الأساتذة والمهام المسندة</span>
          </h3>
          <span className="text-xs text-slate-400">
            إجمالي المهام المسندة: {tasks.length} مهمة
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {teachers.map((teacher) => {
            const assignedTasks = tasks.filter((tk) => tk.teacherId === teacher.id);
            return (
              <div key={teacher.id} className="p-4 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-100">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">{teacher.name}</h4>
                      {teacher.code && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">
                          {teacher.code}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-medium border border-blue-100">
                        {teacher.specialty}
                      </span>
                      {teacher.assignedLevel && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px]">
                          {teacher.assignedLevel}
                        </span>
                      )}
                    </div>

                    {/* Teacher Tasks Badges */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {assignedTasks.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">
                          لم يتم إسناد أي مهمة بعد
                        </span>
                      ) : (
                        assignedTasks.map((t) => {
                          const cls = classes.find((c) => c.id === t.classId)?.name;
                          const cat = categories.find((c) => c.id === t.categoryId)?.name;
                          return (
                            <div
                              key={t.id}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 border border-slate-200 group"
                            >
                              {t.taskType === 'examiner' && (
                                <>
                                  <FilePenLine className="w-3 h-3 text-blue-600" />
                                  <span className="text-blue-900">
                                    تمرير: {t.level} - {cls} - {cat}
                                  </span>
                                </>
                              )}
                              {t.taskType === 'supervisor' && (
                                <>
                                  <Shield className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-900">
                                    إشراف: {t.level}
                                  </span>
                                </>
                              )}
                              {t.taskType === 'data_entry' && (
                                <>
                                  <CheckSquare className="w-3 h-3 text-amber-600" />
                                  <span className="text-amber-900">
                                    رقمنة النتائج
                                  </span>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('هل تريد حذف هذه المهمة من الأستاذ؟')) {
                                    onDeleteTask(t.id);
                                  }
                                }}
                                className="text-slate-400 hover:text-rose-600 mr-1 p-0.5"
                                title="حذف المهمة"
                              >
                                &times;
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenAddTask(teacher.id)}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    title="إسناد مهمة لهذا الأستاذ"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إسناد مهمة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditTeacher(teacher)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="تعديل بيانات الأستاذ"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من رغبتك في حذف الأستاذ (${teacher.name})؟ سيتم أيضاً حذف المهام المرتبطة به.`)) {
                        onDeleteTeacher(teacher.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="حذف الأستاذ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teacher Form Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              {editingTeacher ? 'تعديل بيانات الأستاذ' : 'إضافة أستاذ جديد'}
            </h3>

            <form onSubmit={handleSaveTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الأستاذ الكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  placeholder="مثال: ذ. محمد العلوي"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم التأجير / رمز الأستاذ (اختياري)
                  </label>
                  <input
                    type="text"
                    value={teacherForm.code}
                    onChange={(e) => setTeacherForm({ ...teacherForm, code: e.target.value })}
                    placeholder="ENS-0012"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف (اختياري)
                  </label>
                  <input
                    type="text"
                    value={teacherForm.phone}
                    onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    placeholder="06XXXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المادة أو التخصص <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={teacherForm.specialty}
                  onChange={(e) => setTeacherForm({ ...teacherForm, specialty: e.target.value })}
                  placeholder="اللغة العربية، الرياضيات، الفرنسية..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المستوى المشتغل فيه إن وجد
                </label>
                <select
                  value={teacherForm.assignedLevel}
                  onChange={(e) => setTeacherForm({ ...teacherForm, assignedLevel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  {activeLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition"
                >
                  حفظ الأستاذ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Assignment Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
              <span>إسناد مهمة تربوية للأستاذ</span>
            </h3>

            <form onSubmit={handleSaveTask} className="space-y-4">
              {/* Teacher Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اختيار الأستاذ <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={taskForm.teacherId}
                  onChange={(e) => setTaskForm({ ...taskForm, teacherId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialty})
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نوع المهمة المسندة <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTaskForm({ ...taskForm, taskType: 'examiner' })}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center gap-1 ${
                      taskForm.taskType === 'examiner'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <FilePenLine className="w-4 h-4 text-blue-600" />
                    <span>أ. مهمة التمرير</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskForm({ ...taskForm, taskType: 'supervisor' })}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center gap-1 ${
                      taskForm.taskType === 'supervisor'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>ب. مهمة الإشراف</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskForm({ ...taskForm, taskType: 'data_entry' })}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center gap-1 ${
                      taskForm.taskType === 'data_entry'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                    <span>ج. تسجيل المعطيات</span>
                  </button>
                </div>
              </div>

              {/* Level Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المستوى الدراسي <span className="text-rose-500">*</span>
                </label>
                <select
                  value={taskForm.level}
                  onChange={(e) => {
                    const newLvl = e.target.value;
                    const newCls = classes.find((c) => c.level === newLvl);
                    const newCat = newCls ? categories.find((cat) => cat.classId === newCls.id) : undefined;
                    setTaskForm({
                      ...taskForm,
                      level: newLvl,
                      classId: newCls?.id || '',
                      categoryId: newCat?.id || '',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  {activeLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              {/* If examiner task: Choose Class and Category */}
              {taskForm.taskType === 'examiner' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                  <div>
                    <label className="block text-xs font-bold text-blue-900 mb-1">
                      الفوج <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={taskForm.classId}
                      onChange={(e) => {
                        const newClassId = e.target.value;
                        const firstCat = categories.find((c) => c.classId === newClassId);
                        setTaskForm({
                          ...taskForm,
                          classId: newClassId,
                          categoryId: firstCat?.id || '',
                        });
                      }}
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      {filteredClasses.length === 0 ? (
                        <option value="">لا يوجد أفواج في هذا المستوى</option>
                      ) : (
                        filteredClasses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-900 mb-1">
                      الفئة / المجموعة <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={taskForm.categoryId}
                      onChange={(e) => setTaskForm({ ...taskForm, categoryId: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      {filteredCategories.length === 0 ? (
                        <option value="">لا توجد فئات محددة لهذا الفوج</option>
                      ) : (
                        filteredCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* Materials / Subjects for Examiner Task */}
              {taskForm.taskType === 'examiner' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المواد المعنية بالتمرير:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((sub) => {
                      const isSelected = taskForm.selectedSubjects.includes(sub.id);
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleToggleSubject(sub.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Supervisor / Data Entry details or notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات أو تفاصيل نطاق المهمة (مثلا رقم القاعة أو نطاق الإشراف)
                </label>
                <input
                  type="text"
                  value={taskForm.scopeNotes}
                  onChange={(e) => setTaskForm({ ...taskForm, scopeNotes: e.target.value })}
                  placeholder="مثال: القاعة رقم 4، أو الإشراف على جميع فئات المستوى الأول..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition"
                >
                  تأكيد إسناد المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
