import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Check, AlertCircle, X, Download } from 'lucide-react';
import { parseStudentsFromExcel, exportSampleStudentExcel } from '../services/storage';
import { Student, ClassGroup, Category } from '../types';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (result: {
    students: Student[];
    newClasses: ClassGroup[];
    newCategories: Category[];
  }) => void;
  currentClasses: ClassGroup[];
  currentCategories: Category[];
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  currentClasses,
  currentCategories,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewResult, setPreviewResult] = useState<{
    students: Student[];
    newClasses: ClassGroup[];
    newCategories: Category[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const result = await parseStudentsFromExcel(selectedFile, currentClasses, currentCategories);
      if (result.students.length === 0) {
        setErrorMsg('لم يتم العثور على بيانات تلاميذ في الملف، تأكد من وجود عمود باسم "الاسم" أو "Nom"');
        setPreviewResult(null);
      } else {
        setPreviewResult(result);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('حدث خطأ أثناء قراءة ملف Excel، يرجى التأكد من صحة تنسيق الملف.');
      setPreviewResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!previewResult) return;
    onImportSuccess(previewResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">استيراد لوائح التلاميذ من Excel</h3>
              <p className="text-xs text-slate-500">يدعم صيغ .xlsx و .xls و .csv من مسار أو لوائح المؤسسة</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Sample template download button */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600">يمكنك تحميل نموذج Excel جاهز لتعبئة التلاميذ:</span>
            <button
              type="button"
              onClick={exportSampleStudentExcel}
              className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>تحميل النموذج</span>
            </button>
          </div>

          {/* File Upload Drop Zone */}
          <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center bg-slate-50/50 hover:bg-emerald-50/20">
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-xs font-bold text-slate-800">
              {file ? file.name : 'انقر لاختيار ملف Excel أو اسحبه إلى هنا'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              الملفات المدعومة: (.xlsx, .xls, .csv)
            </span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Processing / Error indicator */}
          {isProcessing && (
            <p className="text-xs text-center text-slate-500 font-bold animate-pulse">
              جاري معالجة وقراءة بيانات الملف...
            </p>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Result */}
          {previewResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>تم التعرف على البيانات بنجاح:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-emerald-800 text-[11px]">
                <li>عدد التلاميذ الجاهزين للاستيراد: <strong>{previewResult.students.length} تلميذ</strong></li>
                {previewResult.newClasses.length > 0 && (
                  <li>أفواج جديدة سيتم إنشاؤها: <strong>{previewResult.newClasses.length} أفواج</strong></li>
                )}
                {previewResult.newCategories.length > 0 && (
                  <li>فئات جديدة سيتم إنشاؤها: <strong>{previewResult.newCategories.length} فئات</strong></li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={!previewResult || isProcessing}
            onClick={handleConfirmImport}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            تأكيد الاستيراد والإضافة
          </button>
        </div>
      </div>
    </div>
  );
};
