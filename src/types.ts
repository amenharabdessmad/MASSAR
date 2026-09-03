export type EvaluationSystem = 'acquired_levels' | 'binary_check' | 'numeric';
// 'acquired_levels': مكتسب / في طور الاكتساب / غير مكتسب
// 'binary_check': ✓ / ✗
// 'numeric': 1 / 0

export type EvaluationValue = 'acquired' | 'in_progress' | 'not_acquired' | 'none';

export type UserRole = 'admin' | 'examiner' | 'data_entry';

export interface Institution {
  name: string;
  directorate: string; // المديرية أو الإقليم
  academicYear: string; // الموسم الدراسي
  directorName: string; // اسم المدير أو المسؤول
  activeLevels: string[]; // المستويات المعنية بالدعم المكثف
}

export interface Teacher {
  id: string;
  name: string;
  code?: string; // رقم أو رمز الأستاذ
  specialty: string; // المادة أو التخصص
  assignedLevel?: string; // المستوى
  phone?: string;
}

export interface TeacherTask {
  id: string;
  teacherId: string;
  taskType: 'examiner' | 'supervisor' | 'data_entry'; 
  // examiner = مهمة التمرير
  // supervisor = مهمة الإشراف
  // data_entry = مهمة تسجيل المعطيات
  level: string;
  classId?: string; // الفوج
  categoryId?: string; // الفئة
  subjects?: string[]; // المواد المعنية
  scopeNotes?: string; // تفاصيل الإشراف
}

export interface Student {
  id: string;
  studentNumber?: string; // رقم مسار أو الرمز
  fullName: string;
  gender?: 'M' | 'F';
  level: string;
  classId: string; // الفوج
  categoryId: string; // الفئة
}

export interface ClassGroup {
  id: string;
  level: string;
  name: string; // مثلا الفوج 1
  categoryCount: number; // عدد الفئات
}

export interface Category {
  id: string;
  classId: string;
  level: string;
  name: string; // مثلا الفئة 1
}

export interface Criterion {
  id: string;
  code: string; // C1, C2, C3...
  title: string; // فهم المقروء
  description?: string; // وصف المعيار
}

export interface Subject {
  id: string;
  name: string; // اللغة العربية، اللغة الفرنسية، الرياضيات...
  code: string; // AR, FR, MATH...
  levels: string[]; // المستويات المعنية
  criteria: Criterion[]; // المعايير
}

export interface TestPassingSheet {
  id: string;
  level: string;
  classId: string;
  categoryId: string;
  teacherId: string;
  subjectIds: string[];
  passingDate?: string;
  notes?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface CriterionResult {
  studentId: string;
  subjectId: string;
  criterionCode: string;
  value: EvaluationValue;
  updatedAt?: string;
}

export interface AppSettings {
  evaluationSystem: EvaluationSystem;
  theme?: 'light' | 'dark';
  autoSave: boolean;
}

export interface AppState {
  institution: Institution;
  teachers: Teacher[];
  tasks: TeacherTask[];
  students: Student[];
  classes: ClassGroup[];
  categories: Category[];
  subjects: Subject[];
  passingSheets: TestPassingSheet[];
  results: Record<string, EvaluationValue>; // key: `${studentId}_${subjectId}_${criterionCode}`
  settings: AppSettings;
}
