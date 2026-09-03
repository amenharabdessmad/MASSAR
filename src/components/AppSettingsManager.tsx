import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Check,
  X,
  Sliders,
  Users
} from 'lucide-react';
import { AppState, EvaluationSystem, UserRole } from '../types';

interface AppSettingsManagerProps {
  state: AppState;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onUpdateSettings: (newSettings: Partial<AppState['settings']>) => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetToDefault: () => void;
}

export const AppSettingsManager: React.FC<AppSettingsManagerProps> = ({
  state,
  currentRole,
  onChangeRole,
  onUpdateSettings,
  onExportBackup,
  onImportBackup,
  onResetToDefault,
}) => {
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const handleEvaluationSystemChange = (sys: EvaluationSystem) => {
    onUpdateSettings({ evaluationSystem: sys });
    setSaveFeedback('تم تحديث نظام تقييم معايير الرائز بنجاح');
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-900">إعدادات النظام، الصلاحيات والنسخ الاحتياطي</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          تخصيص نظام تسجيل نتائج الرائز، إدارة صلاحيات الأدوار، وحماية البيانات بالنسخ الاحتياطي والاسترجاع.
        </p>

        {saveFeedback && (
          <div className="mt-3 flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        )}
      </div>

      {/* Section 10 & 20: Evaluation System Mode Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>طريقة ونمط تسجيل نتائج التمرير في أوراق الرائز</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            اختر النظام المفضل لمؤسستك، وسيتم اعتماده فورياً في شبكات تفريغ النقط وجداول الطباعة A4:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Option 1: مكتسب / في طور الاكتساب / غير مكتسب */}
          <div
            onClick={() => handleEvaluationSystemChange('acquired_levels')}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              state.settings.evaluationSystem === 'acquired_levels'
                ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">مستويات التمكن الثلاثية</span>
                {state.settings.evaluationSystem === 'acquired_levels' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                النظام التربوي المعتمد: تقييم ثلاثي دقيق يوضح مراحل اكتساب الكفاية.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-around text-[11px] font-bold">
              <span className="text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">مكتسب</span>
              <span className="text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">في طوره</span>
              <span className="text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded">غير مكتسب</span>
            </div>
          </div>

          {/* Option 2: Binary Check (✓ / ✗) */}
          <div
            onClick={() => handleEvaluationSystemChange('binary_check')}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              state.settings.evaluationSystem === 'binary_check'
                ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">علامات التمكين (✓ / ✗)</span>
                {state.settings.evaluationSystem === 'binary_check' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                نظام الرموز السريعة والمباشرة، مثالي للتفريغ اليدوي السريع والمطبوعات المدمجة.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-around text-xs font-bold">
              <span className="flex items-center gap-1 text-emerald-700">
                <Check className="w-4 h-4 stroke-[3]" /> (متمكن)
              </span>
              <span className="flex items-center gap-1 text-rose-600">
                <X className="w-4 h-4 stroke-[3]" /> (غير متمكن)
              </span>
            </div>
          </div>

          {/* Option 3: Numeric (1 / 0) */}
          <div
            onClick={() => handleEvaluationSystemChange('numeric')}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              state.settings.evaluationSystem === 'numeric'
                ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">النظام الرقمي الثنائي (1 / 0)</span>
                {state.settings.evaluationSystem === 'numeric' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                نظام رقمي بسيط يسهل إجراء العمليات الحسابية والجمع الميكانيكي للنقاط.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-around text-xs font-mono font-bold">
              <span className="text-emerald-700 bg-emerald-100/60 px-3 py-0.5 rounded">1</span>
              <span className="text-rose-700 bg-rose-100/60 px-3 py-0.5 rounded">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 21: Permissions & Roles */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>نظام الصلاحيات وتدبير أدوار المستخدمين</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            تحديد صلاحيات الوصول حسب نوع المستخدم (المدير، الأستاذ الممرر، المكلف بالمسك):
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Admin */}
          <div
            onClick={() => onChangeRole('admin')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              currentRole === 'admin'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold">مدير المؤسسة (Admin)</h4>
              {currentRole === 'admin' && <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded">الحالي</span>}
            </div>
            <p className={`text-[11px] mt-1 ${currentRole === 'admin' ? 'text-slate-300' : 'text-slate-500'}`}>
              كامل الصلاحيات: إعداد المؤسسة، تدبير الأساتذة، الأفواج، المواد، المعايير، والطباعة الشاملة.
            </p>
          </div>

          {/* Examiner */}
          <div
            onClick={() => onChangeRole('examiner')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              currentRole === 'examiner'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold">أستاذ ممرر (Examiner)</h4>
              {currentRole === 'examiner' && <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded">الحالي</span>}
            </div>
            <p className={`text-[11px] mt-1 ${currentRole === 'examiner' ? 'text-slate-300' : 'text-slate-500'}`}>
              صلاحية مخصصة: عرض أوراق التمرير للفئات المسندة إليه، تسجيل نتائج المعايير، وتدوين الملاحظات.
            </p>
          </div>

          {/* Data Entry */}
          <div
            onClick={() => onChangeRole('data_entry')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              currentRole === 'data_entry'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold">مكلف بالمسك (Data Entry)</h4>
              {currentRole === 'data_entry' && <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded">الحالي</span>}
            </div>
            <p className={`text-[11px] mt-1 ${currentRole === 'data_entry' ? 'text-slate-300' : 'text-slate-500'}`}>
              إدخال ومسك لوائح التلاميذ والنقط والنتائج بدون إمكانية تعديل هيكلة المعايير أو إعدادات المؤسسة.
            </p>
          </div>
        </div>
      </div>

      {/* Section 22: Backup & Restore */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-600" />
            <span>النسخ الاحتياطي وحفظ المعطيات (Backup & Restore)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            حفظ نسخة احتياطية آمنة على حاسوبك واسترجاعها في أي وقت دون فقدان أي معطيات:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900">تصدير نسخة احتياطية كاملة (JSON)</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                تنزيل ملف يحتوي على كل معطيات المؤسسة، الأساتذة، الأفواج، التلاميذ، المعايير والنتائج.
              </p>
            </div>
            <button
              type="button"
              onClick={onExportBackup}
              className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل النسخة الاحتياطية الآن</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900">استرجاع نسخة احتياطية سابقة</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                رفع ملف النسخة الاحتياطية (JSON) لاسترجاع المعطيات كاملة بضغطة زر.
              </p>
            </div>
            <label className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
              <Upload className="w-4 h-4" />
              <span>اختيار ملف الاسترجاع...</span>
              <input
                type="file"
                accept=".json"
                onChange={onImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            الحالة: البيانات محفوظة تلقائياً في التخزين المحلي الآمن.
          </span>
          <button
            type="button"
            onClick={() => {
              if (confirm('هل أنت متأكد من رغبتك في إعادة ضبط البرنامج إلى المعطيات التجريبية الأصلية؟ ستفقد التغييرات الحالية.')) {
                onResetToDefault();
              }
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط المصنع (المعطيات النموذجية)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
