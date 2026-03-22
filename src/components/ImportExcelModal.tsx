import React, { useState, useRef, useMemo } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Save, ChevronRight, Settings, AlertTriangle, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student } from '../types';
import { calculateScores } from '../utils/scoring';
import { findBestMatch, parseExcelDate, validateStudentData, ValidationResult } from '../utils/excelProcessor';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: Partial<Student>[]) => Promise<void>;
  existingIds: Set<string>;
}

export default function ImportExcelModal({ isOpen, onClose, onImport, existingIds }: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<any[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableFields = [
    { id: 'ma_sinh_vien', label: 'Mã sinh viên (Bắt buộc)', required: true },
    { id: 'ho_ten', label: 'Họ và tên (Bắt buộc)', required: true },
    { id: 'ngay_sinh', label: 'Ngày sinh (Bắt buộc)', required: true },
    { id: 'que_quan', label: 'Quê quán', required: false },
    { id: 'gioi_tinh', label: 'Giới tính', required: false },
    { id: 'so_dien_thoai', label: 'Số điện thoại', required: false },
    { id: 'gmail', label: 'Gmail', required: false },
    { id: 'cho_o_hien_nay', label: 'Chỗ ở hiện nay', required: false },
    { id: 'ngay_vao_doan', label: 'Ngày vào Đoàn', required: false },
    { id: 'ngay_vao_dang', label: 'Ngày vào Đảng', required: false },
    { id: 'ghi_chu', label: 'Ghi chú', required: false },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    setIsProcessing(true);
    setError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[][];

        if (jsonData.length < 2) {
          setError('File Excel không có dữ liệu hoặc sai định dạng.');
          setIsProcessing(false);
          return;
        }

        const fileHeaders = jsonData[0].map(h => String(h || '').trim());
        setHeaders(fileHeaders);
        setRawData(jsonData.slice(1));

        // Initial Smart Mapping
        const initialMapping: Record<string, string> = {};
        fileHeaders.forEach((header, index) => {
          const matchedField = findBestMatch(header);
          if (matchedField) {
            initialMapping[index] = matchedField;
          }
        });
        setMapping(initialMapping);
      } catch (err) {
        setError('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng.');
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const mappedData = useMemo(() => {
    return rawData.map(row => {
      const student: Partial<Student> = {};
      Object.entries(mapping).forEach(([colIndex, field]) => {
        const val = row[parseInt(colIndex)];
        const fieldStr = String(field);
        const fieldKey = fieldStr as keyof Student;
        if (fieldStr.includes('ngay_')) {
          (student as any)[fieldKey] = parseExcelDate(val);
        } else {
          (student as any)[fieldKey] = String(val || '').trim();
        }
      });

      // Default academic/conduct/activity/interaction for new imports
      const defaultStudent: Partial<Student> = {
        academic: { diem_trung_binh: 0, so_tin_chi_no: 0, so_mon_truot: 0, so_buoi_vang: 0, vi_pham_thi_cu: false },
        conduct: { diem_ren_luyen: 0, vi_pham_ky_luat: 0, muc_do_vi_pham: 'none' },
        activity: { tham_gia_clb: false, so_hoat_dong_tham_gia: 0, vai_tro: 'none', giai_thuong: 0 },
        interaction: { tuong_tac_giang_vien: 'medium', phan_hoi_som: true, tinh_than_hoc_tap: 5 },
        ...student
      };

      const scores = calculateScores(defaultStudent as Student);
      return { ...defaultStudent, ...scores };
    });
  }, [rawData, mapping]);

  const { errors, warnings } = useMemo(() => {
    return validateStudentData(mappedData, existingIds);
  }, [mappedData, existingIds]);

  const handleImport = async () => {
    if (errors.length > 0) {
      setError('Vui lòng sửa các lỗi nghiêm trọng trước khi import.');
      return;
    }
    setIsProcessing(true);
    try {
      await onImport(mappedData);
      onClose();
    } catch (err) {
      setError('Lỗi khi lưu dữ liệu vào hệ thống.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-6xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-stone-100">
        <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <FileSpreadsheet size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-stone-900 tracking-tight">Import Dữ liệu Sinh viên</h3>
              <p className="text-sm text-stone-500 font-medium">Xử lý dữ liệu Excel thông minh & chống lỗi mapping</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-stone-100 rounded-full transition-all">
            <X size={24} className="text-stone-400" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-200 rounded-[32px] p-20 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-24 h-24 bg-stone-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-stone-300 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-500 shadow-inner">
                  <Upload size={40} />
                </div>
                <h4 className="text-2xl font-black text-stone-900 mb-3 tracking-tight">Kéo thả file Excel vào đây</h4>
                <p className="text-stone-500 max-w-md mx-auto font-medium leading-relaxed">
                  Hệ thống sẽ tự động nhận diện cột (MSSV, Họ tên, Ngày sinh...) dựa trên tên cột trong file của bạn.
                </p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-10">
              {/* Mapping Section */}
              <div className="bg-stone-50/50 p-8 rounded-[32px] border border-stone-100">
                <div className="flex items-center gap-3 mb-6">
                  <Settings size={20} className="text-stone-400" />
                  <h4 className="text-lg font-black text-stone-900 tracking-tight uppercase">Cấu hình Mapping Cột</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {headers.map((header, index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Cột: "{header}"</label>
                      <select 
                        className={`w-full p-4 rounded-2xl border transition-all font-bold text-sm focus:ring-4 focus:outline-none ${
                          mapping[index] 
                            ? 'bg-white border-emerald-200 text-emerald-700 focus:ring-emerald-500/10' 
                            : 'bg-stone-100 border-stone-200 text-stone-400 focus:ring-stone-500/10'
                        }`}
                        value={mapping[index] || ''}
                        onChange={(e) => setMapping({ ...mapping, [index]: e.target.value })}
                      >
                        <option value="">-- Bỏ qua cột này --</option>
                        {availableFields.map(field => (
                          <option key={field.id} value={field.id}>{field.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Validation Summary */}
              {(errors.length > 0 || warnings.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {errors.length > 0 && (
                    <div className="bg-red-50 p-6 rounded-[32px] border border-red-100">
                      <div className="flex items-center gap-3 mb-4 text-red-600">
                        <AlertCircle size={20} />
                        <h5 className="font-black uppercase text-sm tracking-widest">Lỗi nghiêm trọng ({errors.length})</h5>
                      </div>
                      <ul className="space-y-2">
                        {errors.slice(0, 5).map((err, i) => (
                          <li key={i} className="text-xs text-red-800 font-medium bg-white/50 p-2 rounded-lg">
                            Dòng {err.row}: {err.message}
                          </li>
                        ))}
                        {errors.length > 5 && <li className="text-[10px] text-red-400 italic">Và {errors.length - 5} lỗi khác...</li>}
                      </ul>
                    </div>
                  )}
                  {warnings.length > 0 && (
                    <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100">
                      <div className="flex items-center gap-3 mb-4 text-amber-600">
                        <AlertTriangle size={20} />
                        <h5 className="font-black uppercase text-sm tracking-widest">Cảnh báo ({warnings.length})</h5>
                      </div>
                      <ul className="space-y-2">
                        {warnings.slice(0, 5).map((warn, i) => (
                          <li key={i} className="text-xs text-amber-800 font-medium bg-white/50 p-2 rounded-lg">
                            Dòng {warn.row}: {warn.message}
                          </li>
                        ))}
                        {warnings.length > 5 && <li className="text-[10px] text-amber-400 italic">Và {warnings.length - 5} cảnh báo khác...</li>}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Preview Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Info size={18} className="text-blue-500" />
                    <h4 className="text-lg font-black text-stone-900 tracking-tight uppercase">Xem trước dữ liệu ({mappedData.length} dòng)</h4>
                  </div>
                </div>
                <div className="border border-stone-200 rounded-[32px] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                          <th className="p-4 font-black text-stone-400 uppercase text-[10px] tracking-widest">Dòng</th>
                          <th className="p-4 font-black text-stone-400 uppercase text-[10px] tracking-widest">MSSV</th>
                          <th className="p-4 font-black text-stone-400 uppercase text-[10px] tracking-widest">Họ và tên</th>
                          <th className="p-4 font-black text-stone-400 uppercase text-[10px] tracking-widest">Ngày sinh</th>
                          <th className="p-4 font-black text-stone-400 uppercase text-[10px] tracking-widest">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {mappedData.slice(0, 10).map((s, i) => {
                          const rowErrors = errors.filter(e => e.row === i + 2);
                          const rowWarnings = warnings.filter(w => w.row === i + 2);
                          return (
                            <tr key={i} className={rowErrors.length > 0 ? 'bg-red-50/30' : rowWarnings.length > 0 ? 'bg-amber-50/30' : ''}>
                              <td className="p-4 font-mono text-stone-400">{i + 2}</td>
                              <td className="p-4 font-black text-stone-900">{s.ma_sinh_vien || '---'}</td>
                              <td className="p-4 font-bold text-stone-700">{s.ho_ten || '---'}</td>
                              <td className="p-4 text-stone-500">{s.ngay_sinh || '---'}</td>
                              <td className="p-4">
                                {rowErrors.length > 0 ? (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-black uppercase">Lỗi</span>
                                ) : rowWarnings.length > 0 ? (
                                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase">Cảnh báo</span>
                                ) : (
                                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase">Hợp lệ</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {mappedData.length > 10 && (
                    <div className="p-4 bg-stone-50 text-center text-xs text-stone-400 font-bold border-t border-stone-200">
                      Hiển thị 10 dòng đầu tiên của tổng số {mappedData.length} dòng
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-stone-100 flex items-center justify-end gap-4 bg-stone-50/30">
          <button 
            onClick={onClose}
            className="px-8 py-4 text-stone-600 hover:bg-stone-200 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleImport}
            disabled={!file || errors.length > 0 || isProcessing}
            className="px-10 py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-xl shadow-stone-200 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            <Save size={18} />
            {isProcessing ? 'Đang xử lý...' : 'Xác nhận Import'}
          </button>
        </div>
      </div>
    </div>
  );
}
