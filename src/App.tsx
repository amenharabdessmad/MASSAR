import React, { useState, useEffect } from 'react';
import {
  loadAppState,
  saveAppState,
  exportAppStateAsJson,
  importAppStateFromJson,
  exportStudentsToExcel,
  exportTestSheetToExcel,
  exportResultsAnalyticsToExcel,
  resetAppStateToDefault,
} from './services/storage';
import {
  AppState,
  UserRole,
  Teacher,
  Student,
  Subject,
  Criterion,
  ClassGroup,
  Category,
  TestPassingSheet,
  EvaluationValue,
  Institution,
} from './types';
import { Navbar } from './components/Navbar';
import { Navigation, TabType } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { InstitutionSettings } from './components/InstitutionSettings';
import { TeachersManager } from './components/TeachersManager';
import { ClassesManager } from './components/ClassesManager';
import { StudentsManager } from './components/StudentsManager';
import { SubjectsCriteriaManager } from './components/SubjectsCriteriaManager';
import { TestPassSheets } from './components/TestPassSheets';
import { ResultsAnalytics } from './components/ResultsAnalytics';
import { AppSettingsManager } from './components/AppSettingsManager';
import { ImportExcelModal } from './components/ImportExcelModal';

export const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [currentTeacherId, setCurrentTeacherId] = useState<string | undefined>(
    state.teachers[0]?.id
  );
  const [selectedSheetId, setSelectedSheetId] = useState<string>(
    state.passingSheets[0]?.id || ''
  );
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Sync state changes to local storage
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Keep selectedSheetId valid if sheets change
  useEffect(() => {
    if (state.passingSheets.length > 0) {
      const exists = state.passingSheets.some((s) => s.id === selectedSheetId);
      if (!exists) {
        setSelectedSheetId(state.passingSheets[0].id);
      }
    }
  }, [state.passingSheets, selectedSheetId]);

  // 1. Institution handlers
  const handleUpdateInstitution = (info: Institution) => {
    setState((prev) => ({
      ...prev,
      institution: info,
    }));
  };

  // 2. Teacher handlers
  const handleAddTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `tch-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      teachers: [...prev.teachers, newTeacher],
    }));
  };

  const handleUpdateTeacher = (teacher: Teacher) => {
    setState((prev) => ({
      ...prev,
      teachers: prev.teachers.map((t) => (t.id === teacher.id ? teacher : t)),
    }));
  };

  const handleDeleteTeacher = (id: string) => {
    setState((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t.id !== id),
    }));
  };

  // 3. Class & Category handlers
  const handleAddClass = (level: string, className: string, categoryCount: number) => {
    const newClassId = `cls-${Date.now()}`;
    const newClass: ClassGroup = {
      id: newClassId,
      name: className,
      level,
      categoryCount,
    };

    const newCats: Category[] = [];
    for (let i = 1; i <= categoryCount; i++) {
      newCats.push({
        id: `cat-${newClassId}-${i}`,
        classId: newClassId,
        level,
        name: `الفئة ${i}`,
      });
    }

    setState((prev) => ({
      ...prev,
      classes: [...prev.classes, newClass],
      categories: [...prev.categories, ...newCats],
    }));
  };

  const handleUpdateClassCategories = (classId: string, newCategoryCount: number) => {
    setState((prev) => {
      const targetClass = prev.classes.find((c) => c.id === classId);
      if (!targetClass) return prev;

      const updatedClass = { ...targetClass, categoryCount: newCategoryCount };
      const currentCats = prev.categories.filter((cat) => cat.classId === classId);

      let updatedCategories = prev.categories.filter((cat) => cat.classId !== classId);
      const newCats: Category[] = [];

      for (let i = 1; i <= newCategoryCount; i++) {
        const existing = currentCats[i - 1];
        if (existing) {
          newCats.push(existing);
        } else {
          newCats.push({
            id: `cat-${classId}-${i}`,
            classId,
            level: targetClass.level,
            name: `الفئة ${i}`,
          });
        }
      }

      // Re-assign any students in deleted categories to the first available category
      const validCategoryIds = new Set(newCats.map((c) => c.id));
      const firstValidCatId = newCats[0]?.id;

      const updatedStudents = prev.students.map((s) => {
        if (s.classId === classId && !validCategoryIds.has(s.categoryId)) {
          return { ...s, categoryId: firstValidCatId || s.categoryId };
        }
        return s;
      });

      return {
        ...prev,
        classes: prev.classes.map((c) => (c.id === classId ? updatedClass : c)),
        categories: [...updatedCategories, ...newCats],
        students: updatedStudents,
      };
    });
  };

  const handleDeleteClass = (classId: string) => {
    setState((prev) => ({
      ...prev,
      classes: prev.classes.filter((c) => c.id !== classId),
      categories: prev.categories.filter((cat) => cat.classId !== classId),
      students: prev.students.filter((s) => s.classId !== classId),
      passingSheets: prev.passingSheets.filter((sh) => sh.classId !== classId),
    }));
  };

  // 4. Student handlers
  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setState((prev) => ({
      ...prev,
      students: [...prev.students, newStudent],
    }));
  };

  const handleUpdateStudent = (student: Student) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === student.id ? student : s)),
    }));
  };

  const handleDeleteStudent = (id: string) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
    }));
  };

  // Item 4: Manual Transfer of student from one category to another
  const handleTransferStudent = (studentId: string, targetCategoryId: string) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, categoryId: targetCategoryId } : s
      ),
    }));
  };

  // Item 4: Auto-partition students across categories with maximal balance
  const handleAutoDistributeStudents = (classId: string) => {
    setState((prev) => {
      const classStudents = prev.students.filter((s) => s.classId === classId);
      const classCats = prev.categories.filter((cat) => cat.classId === classId);

      if (classCats.length === 0 || classStudents.length === 0) return prev;

      // Distribute in round-robin fashion for maximum balance
      const updatedStudentsMap = new Map<string, string>();
      classStudents.forEach((student, index) => {
        const targetCategory = classCats[index % classCats.length];
        updatedStudentsMap.set(student.id, targetCategory.id);
      });

      const updatedStudents = prev.students.map((s) => {
        if (updatedStudentsMap.has(s.id)) {
          return { ...s, categoryId: updatedStudentsMap.get(s.id)! };
        }
        return s;
      });

      return {
        ...prev,
        students: updatedStudents,
      };
    });
  };

  // 5. Subject and Criteria handlers
  const handleAddSubject = (name: string, code: string, levels: string[]) => {
    const newSubjectId = `sub-${Date.now()}`;
    const newSubject: Subject = {
      id: newSubjectId,
      name,
      code,
      levels,
      criteria: [
        { id: `crit-${newSubjectId}-1`, code: 'C1', title: 'المعيار الأول' },
        { id: `crit-${newSubjectId}-2`, code: 'C2', title: 'المعيار الثاني' },
      ],
    };
    setState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
  };

  const handleUpdateSubject = (subject: Subject) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === subject.id ? subject : s)),
    }));
  };

  const handleDeleteSubject = (subjectId: string) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== subjectId),
    }));
  };

  const handleAddCriterion = (subjectId: string, criterion: Omit<Criterion, 'id'>) => {
    const newCriterion: Criterion = {
      ...criterion,
      id: `crit-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((sub) => {
        if (sub.id === subjectId) {
          return {
            ...sub,
            criteria: [...sub.criteria, newCriterion],
          };
        }
        return sub;
      }),
    }));
  };

  const handleUpdateCriterion = (subjectId: string, criterion: Criterion) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((sub) => {
        if (sub.id === subjectId) {
          return {
            ...sub,
            criteria: sub.criteria.map((c) => (c.id === criterion.id ? criterion : c)),
          };
        }
        return sub;
      }),
    }));
  };

  const handleDeleteCriterion = (subjectId: string, criterionId: string) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((sub) => {
        if (sub.id === subjectId) {
          return {
            ...sub,
            criteria: sub.criteria.filter((c) => c.id !== criterionId),
          };
        }
        return sub;
      }),
    }));
  };

  // 6. Test Passing Sheets handlers
  const handleUpdateResults = (newResults: Record<string, EvaluationValue>) => {
    setState((prev) => ({
      ...prev,
      results: newResults,
    }));
  };

  const handleAddSheet = (sheetData: Omit<TestPassingSheet, 'id'>) => {
    const newSheet: TestPassingSheet = {
      ...sheetData,
      id: `sheet-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      passingSheets: [...prev.passingSheets, newSheet],
    }));
    setSelectedSheetId(newSheet.id);
  };

  // Prompt Item 12: "إنشاء أوراق جميع الفئات تلقائياً"
  const handleBulkGenerateSheets = () => {
    const examiners = state.teachers.filter(
      (t) => t.assignedRoles.includes('examiner') || t.assignedRoles.includes('supervisor')
    );
    const poolOfTeachers = examiners.length > 0 ? examiners : state.teachers;

    if (poolOfTeachers.length === 0) {
      alert('يرجى إضافة أساتذة أولاً لتعيينهم كممررين في أوراق الرائز.');
      return;
    }

    const generatedSheets: TestPassingSheet[] = [];
    let teacherIndex = 0;
    const allSubjectIds = state.subjects.map((s) => s.id);

    state.classes.forEach((cls) => {
      const clsCategories = state.categories.filter((cat) => cat.classId === cls.id);
      clsCategories.forEach((cat) => {
        // Check if a sheet for this combination already exists
        const existing = state.passingSheets.find(
          (s) => s.level === cls.level && s.classId === cls.id && s.categoryId === cat.id
        );

        if (existing) {
          generatedSheets.push(existing);
        } else {
          const assignedTeacher = poolOfTeachers[teacherIndex % poolOfTeachers.length];
          teacherIndex++;

          generatedSheets.push({
            id: `sheet-${cls.id}-${cat.id}`,
            level: cls.level,
            classId: cls.id,
            categoryId: cat.id,
            teacherId: assignedTeacher.id,
            subjectIds: allSubjectIds,
            passingDate: new Date().toISOString().split('T')[0],
            notes: '',
            status: 'pending',
          });
        }
      });
    });

    setState((prev) => ({
      ...prev,
      passingSheets: generatedSheets,
    }));

    if (generatedSheets[0]) {
      setSelectedSheetId(generatedSheets[0].id);
    }
    alert(`تم بنجاح إنشاء وتحديث ${generatedSheets.length} ورقة تمرير لجميع الأفواج والفئات.`);
  };

  const handleDeleteSheet = (sheetId: string) => {
    setState((prev) => ({
      ...prev,
      passingSheets: prev.passingSheets.filter((s) => s.id !== sheetId),
    }));
  };

  const handleUpdateSheetMeta = (
    sheetId: string,
    passingDate: string,
    notes: string,
    status: 'pending' | 'in_progress' | 'completed'
  ) => {
    setState((prev) => ({
      ...prev,
      passingSheets: prev.passingSheets.map((s) =>
        s.id === sheetId ? { ...s, passingDate, notes, status } : s
      ),
    }));
  };

  // Print Handlers
  const handlePrintCurrentSheet = (sheetId: string) => {
    setSelectedSheetId(sheetId);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintAllSheets = () => {
    window.print();
  };

  // Excel handlers
  const handleExportStudentsExcel = (levelFilter?: string) => {
    exportStudentsToExcel(state, levelFilter);
  };

  const handleExportSheetExcel = (sheetId: string) => {
    const sheet = state.passingSheets.find((s) => s.id === sheetId);
    if (!sheet) return;
    exportTestSheetToExcel(sheet, state);
  };

  const handleExportAnalyticsExcel = () => {
    exportResultsAnalyticsToExcel(state);
  };

  const handleImportExcelSuccess = (result: {
    students: Student[];
    newClasses: ClassGroup[];
    newCategories: Category[];
  }) => {
    setState((prev) => ({
      ...prev,
      classes: [...prev.classes, ...result.newClasses],
      categories: [...prev.categories, ...result.newCategories],
      students: [...prev.students, ...result.students],
    }));
    alert(`تم استيراد ${result.students.length} تلميذ بنجاح!`);
  };

  // Settings and Backup handlers
  const handleUpdateSettings = (newSettings: Partial<AppState['settings']>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings,
      },
    }));
  };

  const handleExportBackup = () => {
    exportAppStateAsJson(state);
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importAppStateFromJson(file);
      setState(imported);
      alert('تم استرجاع النسخة الاحتياطية بنجاح!');
    } catch (err) {
      console.error(err);
      alert('فشل استرجاع النسخة الاحتياطية. يرجى التأكد من صحة ملف JSON.');
    }
  };

  const handleResetToDefault = () => {
    const fresh = resetAppStateToDefault();
    setState(fresh);
    alert('تم إعادة ضبط البرنامج على المعطيات النموذجية الأولية.');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-200">
      {/* Navbar (Hidden in Print) */}
      <Navbar
        state={state}
        currentRole={currentRole}
        onChangeRole={setCurrentRole}
        onQuickBackup={handleExportBackup}
        onQuickPrint={() => handlePrintCurrentSheet(selectedSheetId)}
      />

      {/* Navigation Tab Bar (Hidden in Print) */}
      <Navigation
        activeTab={currentTab}
        onSelectTab={setCurrentTab}
        currentRole={currentRole}
        studentsCount={state.students.length}
        sheetsCount={state.passingSheets.length}
      />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            state={state}
            onNavigate={(tab) => setCurrentTab(tab as TabType)}
            onBulkGenerateSheets={handleBulkGenerateSheets}
            onPrintAllSheets={handlePrintAllSheets}
            onExportAnalyticsExcel={handleExportAnalyticsExcel}
          />
        )}

        {currentTab === 'institution' && (
          <InstitutionSettings
            institution={state.institution}
            onSave={handleUpdateInstitution}
          />
        )}

        {currentTab === 'teachers' && (
          <TeachersManager
            teachers={state.teachers}
            activeLevels={state.institution.activeLevels}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
          />
        )}

        {currentTab === 'classes' && (
          <ClassesManager
            activeLevels={state.institution.activeLevels}
            classes={state.classes}
            categories={state.categories}
            students={state.students}
            onAddClass={handleAddClass}
            onUpdateClassCategories={handleUpdateClassCategories}
            onDeleteClass={handleDeleteClass}
            onSelectClassForStudents={(lvl, clsId) => {
              setCurrentTab('students');
            }}
          />
        )}

        {currentTab === 'students' && (
          <StudentsManager
            students={state.students}
            classes={state.classes}
            categories={state.categories}
            activeLevels={state.institution.activeLevels}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onTransferStudent={handleTransferStudent}
            onAutoDistributeStudents={handleAutoDistributeStudents}
            onExportExcel={handleExportStudentsExcel}
            onOpenImportExcel={() => setIsImportModalOpen(true)}
          />
        )}

        {currentTab === 'subjects' && (
          <SubjectsCriteriaManager
            subjects={state.subjects}
            activeLevels={state.institution.activeLevels}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            onAddCriterion={handleAddCriterion}
            onUpdateCriterion={handleUpdateCriterion}
            onDeleteCriterion={handleDeleteCriterion}
          />
        )}

        {currentTab === 'sheets' && (
          <TestPassSheets
            state={state}
            currentRole={currentRole}
            currentTeacherId={currentTeacherId}
            onUpdateResults={handleUpdateResults}
            onAddSheet={handleAddSheet}
            onBulkGenerateSheets={handleBulkGenerateSheets}
            onDeleteSheet={handleDeleteSheet}
            onUpdateSheetMeta={handleUpdateSheetMeta}
            onPrintCurrentSheet={handlePrintCurrentSheet}
            onPrintAllSheets={handlePrintAllSheets}
            onExportSheetToExcel={handleExportSheetExcel}
            selectedSheetId={selectedSheetId}
            setSelectedSheetId={setSelectedSheetId}
          />
        )}

        {currentTab === 'reports' && (
          <ResultsAnalytics
            state={state}
            onExportExcel={handleExportAnalyticsExcel}
            onPrintReport={handlePrintAllSheets}
          />
        )}

        {currentTab === 'settings' && (
          <AppSettingsManager
            state={state}
            currentRole={currentRole}
            onChangeRole={setCurrentRole}
            onUpdateSettings={handleUpdateSettings}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetToDefault={handleResetToDefault}
          />
        )}
      </main>

      {/* Excel Import Modal */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportExcelSuccess}
        currentClasses={state.classes}
        currentCategories={state.categories}
      />
    </div>
  );
};

export default App;
