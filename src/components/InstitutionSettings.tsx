import React, { useState } from 'react';
import { Building2, Save, Plus, Trash2, CheckCircle2, School } from 'lucide-react';
import { Institution } from '../types';

interface InstitutionSettingsProps {
  institution: Institution;
  onSave: (updated: Institution) => void;
}

const DEFAULT_AVAILABLE_LEVELS = [
  'المستوى الأول',
  'المستوى الثاني',
  'المستوى الثالث',
  'المستوى الرابع',
  'المستوى الخامس',
  'المستوى السادس',
  'التعليم الأولي',
  'التربية غير النظامية',
];

export const InstitutionSettings: React.FC<InstitutionSettingsProps> = ({
  institution,
  onSave,
}) => {
  const [formData, setFormData] = useState<Institution>({ ...institution });
  const [newCustomLevel, setNewCustomLevel] = useState('');
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  const handleToggleLevel = (level: string) => {
    const exists = formData.activeLevels.includes(level);
    if (exists) {
      if (formData.activeLevels.length === 1) {
        alert('يجب الإبقاء على مستوى واحد على الأقل معني بالدعم المكثف.');
        return;
      }
      setFormData({
        ...formData,
        activeLevels: formData.activeLevels.filter((l) => l !== level),
      });
    } else {
      setFormData({
        ...formData,
        activeLevels: [...formData.activeLevels, level],
      });
    }
  };

  const handleAddCustomLevel = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCustomLevel.trim();
    if (!trimmed) return;
    if (!formData.activeLevels.includes(trimmed)) {
      setFormData({
        ...formData,
        activeLevels: [...formData.activeLevels, trimmed],
      });
    }
    setNewCustomLevel('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('يرجى إدخال اسم المؤسسة التعليمية.');
      return;
    }
    onSave(formData);
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">إدارة معلومات المؤسسة التعليمية</h2>
              <p className="text-xs text-slate-500">
                تظهر هذه المعلومات في الترويسة الرسمية لجميع أوراق تمرير الرائز والتقارير المطبوعة.
              </p>
            </div>
          </div>

          {showSavedNotification && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم حفظ المعلومات بنجاح</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Institution Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المؤسسة التعليمية <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: مدرسة ابن خلدون الابتدائية"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* Directorate */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                المديرية الإقليمية / الإقليم <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.directorate}
                onChange={(e) => setFormData({ ...formData, directorate: e.target.value })}
                placeholder="مثال: المديرية الإقليمية لمراكش"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الموسم الدراسي <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="مثال: 2024-2025"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* Director / Head Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم السيد المدير أو المسؤول عن التمرير <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.directorName}
                onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                placeholder="مثال: ذ. عبد الرحيم العلمي"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Active Levels for Remediation */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 mb-2">
              المستويات الدراسية المعنية بالدعم المكثف ورائز التمرير:
            </label>
            <p className="text-xs text-slate-500 mb-3">
              حدد المستويات التي ستشملها عملية التشخيص وتوليد أوراق الرائز، ويمكنك إضافة مستويات مخصصة بحرية:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {DEFAULT_AVAILABLE_LEVELS.map((lvl) => {
                const isSelected = formData.activeLevels.includes(lvl);
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleToggleLevel(lvl)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>{lvl}</span>
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                  </button>
                );
              })}

              {/* Any custom levels that are not in defaults */}
              {formData.activeLevels
                .filter((l) => !DEFAULT_AVAILABLE_LEVELS.includes(l))
                .map((lvl) => (
                  <div
                    key={lvl}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-500 text-emerald-800"
                  >
                    <span>{lvl}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleLevel(lvl)}
                      className="text-rose-500 hover:text-rose-700 ml-1"
                      title="حذف هذا المستوى"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>

            {/* Add Custom Level Field */}
            <div className="mt-3 flex items-center gap-2 max-w-sm">
              <input
                type="text"
                value={newCustomLevel}
                onChange={(e) => setNewCustomLevel(e.target.value)}
                placeholder="إضافة مستوى آخر (مثلا: قسم الدمج المدرسي)..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddCustomLevel}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ تعديلات المؤسسة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
