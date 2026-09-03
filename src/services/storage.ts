import { AppState, Student, EvaluationSystem } from '../types';
import { initialAppState } from '../mockData';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'intensive_remediation_app_v1';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppState(initialAppState);
      return initialAppState;
    }
    const parsed = JSON.parse(raw);
    // Ensure all critical top-level properties exist
    return {
      institution: parsed.institution || initialAppState.institution,
      teachers: parsed.teachers || initialAppState.teachers,
      tasks: parsed.tasks || initialAppState.tasks,
      students: parsed.students || initialAppState.students,
      classes: parsed.classes || initialAppState.classes,
      categories: parsed.categories || initialAppState.categories,
      subjects: parsed.subjects || initialAppState.subjects,
      passingSheets: parsed.passingSheets || initialAppState.passingSheets,
      results: parsed.results || initialAppState.results,
      settings: parsed.settings || initialAppState.settings,
    };
  } catch (error) {
    console.error('Error reading app state from localStorage:', error);
    return initialAppState;
  }
}

export function saveAppState(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Error saving app state to localStorage:', error);
    return false;
  }
}

export function exportBackupJSON(state: AppState): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const institutionSlug = state.institution.name.replace(/\s+/g, '_');
  const filename = `نسخة_احتياطية_الدعم_المكثف_${institutionSlug}_${dateStr}.json`;
  
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importBackupJSON(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text) as AppState;
        if (!data.institution || !Array.isArray(data.students) || !Array.isArray(data.subjects)) {
          throw new Error('ملف النسخة الاحتياطية غير صالح أو ناقص البنية');
        }
        saveAppState(data);
        resolve(data);
      } catch (err: any) {
        reject(new Error(err.message || 'فشل في قراءة ملف النسخة الاحتياطية'));
      }
    };
    reader.onerror = () => reject(new Error('خطأ أثناء قراءة الملف'));
    reader.readAsText(file, 'UTF-8');
  });
}

export function resetToDefaults(): AppState {
  saveAppState(initialAppState);
  return initialAppState;
}

export const resetAppStateToDefault = resetToDefaults;
export const exportAppStateAsJson = exportBackupJSON;
export const importAppStateFromJson = importBackupJSON;

// ============ Excel Export & Import ============

export function exportStudentsToExcel(state: AppState, levelFilter?: string): void {
  const filteredStudents = levelFilter
    ? state.students.filter((s) => s.level === levelFilter)
    : state.students;

  const rows = filteredStudents.map((s, index) => {
    const cls = state.classes.find((c) => c.id === s.classId)?.name || s.classId;
    const cat = state.categories.find((c) => c.id === s.categoryId)?.name || s.categoryId;
    return {
      'الرقم الترتيبي': index + 1,
      'رقم التلميذ / مسار': s.studentNumber || '',
      'الاسم الكامل': s.fullName,
      'الجنس': s.gender === 'F' ? 'أنثى' : 'ذكر',
      'المستوى': s.level,
      'الفوج': cls,
      'الفئة': cat,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'لائحة التلاميذ');

  const filename = `لوائح_التلاميذ_${state.institution.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

export function exportTestSheetToExcel(
  sheetId: string,
  state: AppState
): void {
  const sheet = state.passingSheets.find((s) => s.id === sheetId);
  if (!sheet) return;

  const cls = state.classes.find((c) => c.id === sheet.classId)?.name || sheet.classId;
  const cat = state.categories.find((c) => c.id === sheet.categoryId)?.name || sheet.categoryId;
  const teacher = state.teachers.find((t) => t.id === sheet.teacherId)?.name || 'غير محدد';
  const students = state.students.filter(
    (s) => s.level === sheet.level && s.classId === sheet.classId && s.categoryId === sheet.categoryId
  );
  const subjects = state.subjects.filter((sub) => sheet.subjectIds.includes(sub.id));

  const rows = students.map((std, idx) => {
    const rowObj: Record<string, any> = {
      'الرقم': idx + 1,
      'رقم مسار': std.studentNumber || '',
      'اسم التلميذ': std.fullName,
    };

    subjects.forEach((sub) => {
      sub.criteria.forEach((crit) => {
        const key = `${std.id}_${sub.id}_${crit.code}`;
        const val = state.results[key] || 'none';
        let label = '-';
        if (state.settings.evaluationSystem === 'acquired_levels') {
          label = val === 'acquired' ? 'مكتسب' : val === 'in_progress' ? 'في طور الاكتساب' : val === 'not_acquired' ? 'غير مكتسب' : '-';
        } else if (state.settings.evaluationSystem === 'binary_check') {
          label = val === 'acquired' ? '✓' : val === 'not_acquired' ? '✗' : '-';
        } else {
          label = val === 'acquired' ? '1' : val === 'not_acquired' ? '0' : '-';
        }
        rowObj[`${sub.name} [${crit.code}]`] = label;
      });
    });

    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${sheet.level}-${cls}-${cat}`);

  const filename = `ورقة_تمرير_${sheet.level}_${cls}_${cat}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

export function exportResultsReportToExcel(state: AppState): void {
  // Extract overall stats per subject & criterion
  const rows: any[] = [];

  state.subjects.forEach((sub) => {
    sub.criteria.forEach((crit) => {
      let acquiredCount = 0;
      let inProgressCount = 0;
      let notAcquiredCount = 0;
      let totalAssessed = 0;

      state.students.forEach((std) => {
        const key = `${std.id}_${sub.id}_${crit.code}`;
        const val = state.results[key];
        if (val && val !== 'none') {
          totalAssessed++;
          if (val === 'acquired') acquiredCount++;
          else if (val === 'in_progress') inProgressCount++;
          else if (val === 'not_acquired') notAcquiredCount++;
        }
      });

      const masteryRate = totalAssessed > 0 ? Math.round((acquiredCount / totalAssessed) * 100) : 0;

      rows.push({
        'المادة': sub.name,
        'رمز المعيار': crit.code,
        'عنوان المعيار': crit.title,
        'إجمالي المفحوصين': totalAssessed,
        'عدد المكتسبين': acquiredCount,
        'في طور الاكتساب': inProgressCount,
        'غير المكتسبين': notAcquiredCount,
        'نسبة التمكن (%)': `${masteryRate}%`,
        'الحاجة إلى دعم مكثف': masteryRate < 60 ? 'نعم - أولوية عاجلة' : masteryRate < 80 ? 'دعم متوسط' : 'متحكم فيه',
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير معايير الرائز');

  const filename = `تقرير_نتائج_الرائز_والدعم_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

export const exportResultsAnalyticsToExcel = exportResultsReportToExcel;

export function generateTemplateExcel(): void {
  const sample = [
    {
      'الاسم الكامل': 'محمد بنسعيد',
      'المستوى': 'المستوى الأول',
      'الفوج': 'الفوج 1',
      'رقم التلميذ': 'G123456',
      'الجنس': 'ذكر',
    },
    {
      'الاسم الكامل': 'مريم العلوي',
      'المستوى': 'المستوى الأول',
      'الفوج': 'الفوج 1',
      'رقم التلميذ': 'G123457',
      'الجنس': 'أنثى',
    },
    {
      'الاسم الكامل': 'يوسف الأندلسي',
      'المستوى': 'المستوى الأول',
      'الفوج': 'الفوج 2',
      'رقم التلميذ': 'G123458',
      'الجنس': 'ذكر',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sample);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'نموذج_إدخال_التلاميذ');
  XLSX.writeFile(wb, 'نموذج_استيراد_التلاميذ_الدعم_المكثف.xlsx');
}

export const exportSampleStudentExcel = generateTemplateExcel;

export function parseStudentsFromExcel(
  file: File,
  currentStateOrClasses: AppState | any[],
  categoriesParam?: any[]
): Promise<{
  newStudents: Student[];
  students: Student[];
  addedClasses: number;
  addedCategories: number;
  newClasses: any[];
  newCategories: any[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rows.length === 0) {
          throw new Error('الملف فارغ لا يحتوي على أي أسطر.');
        }

        const newStudents: Student[] = [];
        const classesMap = new Map<string, string>(); // key: `${level}_${className}` -> classId
        const categoriesMap = new Map<string, string>(); // key: `${classId}_${catName}` -> catId

        const currentClasses: any[] = Array.isArray(currentStateOrClasses)
          ? currentStateOrClasses
          : currentStateOrClasses.classes || [];
        const currentCategories: any[] = Array.isArray(currentStateOrClasses)
          ? categoriesParam || []
          : currentStateOrClasses.categories || [];

        const newClassesList: any[] = [];
        const newCategoriesList: any[] = [];

        currentClasses.forEach((c) => {
          classesMap.set(`${c.level}_${c.name}`, c.id);
        });
        currentCategories.forEach((cat) => {
          categoriesMap.set(`${cat.classId}_${cat.name}`, cat.id);
        });

        let addedClasses = 0;
        let addedCategories = 0;

        rows.forEach((row, index) => {
          // Normalize column names
          const keys = Object.keys(row);
          const nameKey = keys.find((k) => /اسم|name|fullname/i.test(k)) || keys[0];
          const levelKey = keys.find((k) => /مستوى|level/i.test(k));
          const classKey = keys.find((k) => /فوج|class|قسم|group/i.test(k));
          const catKey = keys.find((k) => /فئة|category|subgroup/i.test(k));
          const numKey = keys.find((k) => /رقم|مسار|code|id/i.test(k));
          const genderKey = keys.find((k) => /جنس|gender|نوع/i.test(k));

          const fullName = String(row[nameKey] || '').trim();
          if (!fullName) return;

          const level = levelKey && row[levelKey] ? String(row[levelKey]).trim() : 'المستوى الأول';
          const className = classKey && row[classKey] ? String(row[classKey]).trim() : 'الفوج 1';
          const catName = catKey && row[catKey] ? String(row[catKey]).trim() : 'الفئة 1';
          const studentNumber = numKey && row[numKey] ? String(row[numKey]).trim() : `STD-${Date.now()}-${index}`;
          const rawGender = genderKey && row[genderKey] ? String(row[genderKey]).trim() : '';
          const gender: 'M' | 'F' = /أنثى|بنت|f|female/i.test(rawGender) ? 'F' : 'M';

          // Ensure class exists or register
          const classKeyStr = `${level}_${className}`;
          let classId = classesMap.get(classKeyStr);
          if (!classId) {
            classId = `c-import-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            classesMap.set(classKeyStr, classId);
            const createdCls = {
              id: classId,
              level,
              name: className,
              categoryCount: 3,
            };
            if (!Array.isArray(currentStateOrClasses)) {
              currentStateOrClasses.classes.push(createdCls);
            }
            newClassesList.push(createdCls);
            addedClasses++;
          }

          // Ensure category exists
          const catKeyStr = `${classId}_${catName}`;
          let catId = categoriesMap.get(catKeyStr);
          if (!catId) {
            catId = `cat-import-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            categoriesMap.set(catKeyStr, catId);
            const createdCat = {
              id: catId,
              classId,
              level,
              name: catName,
            };
            if (!Array.isArray(currentStateOrClasses)) {
              currentStateOrClasses.categories.push(createdCat);
            }
            newCategoriesList.push(createdCat);
            addedCategories++;
          }

          newStudents.push({
            id: `std-imp-${Date.now()}-${index}`,
            fullName,
            studentNumber,
            gender,
            level,
            classId,
            categoryId: catId,
          });
        });

        resolve({
          newStudents,
          students: newStudents,
          addedClasses,
          addedCategories,
          newClasses: newClassesList,
          newCategories: newCategoriesList,
        });
      } catch (err: any) {
        reject(new Error(err.message || 'فشل في استيراد ملف Excel'));
      }
    };
    reader.onerror = () => reject(new Error('خطأ في قراءة الملف'));
    reader.readAsArrayBuffer(file);
  });
}
