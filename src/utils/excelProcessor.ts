import * as XLSX from 'xlsx';
import { Student } from '../types';

export interface ValidationResult {
  row: number;
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface ParseResult {
  data: Partial<Student>[];
  errors: ValidationResult[];
  warnings: ValidationResult[];
  headers: string[];
  mapping: Record<string, string>;
}

const COLUMN_ALIASES: Record<string, string[]> = {
  ma_sinh_vien: ["mssv", "ma sv", "student id", "mã sinh viên", "mã sv", "id"],
  ho_ten: ["họ tên", "ho ten", "full name", "họ và tên", "tên"],
  ngay_sinh: ["ngày sinh", "dob", "birth date", "ngay sinh", "năm sinh"],
  que_quan: ["quê quán", "địa chỉ", "address", "que quan", "nơi sinh"],
  ngay_vao_doan: ["ngày vào đoàn", "ngay vao doan", "ngày đoàn"],
  ngay_vao_dang: ["ngày vào đảng", "ngay vao dang", "ngày đảng"],
  gioi_tinh: ["giới tính", "gioi tinh", "gender", "phái"],
  so_dien_thoai: ["số điện thoại", "sdt", "phone", "số đt", "điện thoại"],
  gmail: ["gmail", "email", "thư điện tử gmail", "email cá nhân"],
  email_truong: ["email trường", "email tlu", "thư điện tử trường", "email @tlu.edu.vn"],
  cho_o_hien_nay: ["chỗ ở hiện nay", "địa chỉ hiện tại", "cho o hien nay", "tạm trú"],
  chuc_danh: ["chức danh", "chức vụ", "chuc danh", "chuc vu", "vị trí"],
  ghi_chu: ["ghi chú", "ghi chu", "note"]
};

/**
 * Normalizes a string for comparison (lowercase, remove accents/special chars if needed)
 */
const normalizeHeader = (header: string): string => {
  return header.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, " "); // Replace special chars with space
};

/**
 * Finds the best matching field for a given header
 */
export const findBestMatch = (header: string): string | null => {
  const normalized = normalizeHeader(header);
  
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.some(alias => normalizeHeader(alias) === normalized || normalized.includes(normalizeHeader(alias)))) {
      return field;
    }
  }
  return null;
};

/**
 * Parses Excel Serial Date or String Date to ISO YYYY-MM-DD
 */
export const parseExcelDate = (val: any): string | null => {
  if (!val) return null;
  
  // If it's already a Date object (SheetJS with cellDates: true)
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return val.toISOString().split('T')[0];
  }

  // If it's a number (Excel serial date)
  if (typeof val === 'number') {
    const date = XLSX.SSF.parse_date_code(val);
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }

  // If it's a string, try common formats
  const str = String(val).trim();
  const ddmmyyyy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
  const yyyymmdd = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/;

  let match = str.match(ddmmyyyy);
  if (match) {
    return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  }

  match = str.match(yyyymmdd);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
};

export const validateStudentData = (data: Partial<Student>[], existingIds: Set<string>): { errors: ValidationResult[], warnings: ValidationResult[] } => {
  const errors: ValidationResult[] = [];
  const warnings: ValidationResult[] = [];
  const seenIdsInFile = new Set<string>();

  data.forEach((student, index) => {
    const rowNum = index + 2; // Assuming header is row 1

    // Critical Errors
    if (!student.ma_sinh_vien) {
      errors.push({ row: rowNum, field: 'ma_sinh_vien', message: 'Thiếu Mã sinh viên', type: 'error' });
    } else {
      if (seenIdsInFile.has(student.ma_sinh_vien)) {
        errors.push({ row: rowNum, field: 'ma_sinh_vien', message: `Trùng Mã sinh viên trong file: ${student.ma_sinh_vien}`, type: 'error' });
      }
      if (existingIds.has(student.ma_sinh_vien)) {
        errors.push({ row: rowNum, field: 'ma_sinh_vien', message: `Mã sinh viên đã tồn tại trên hệ thống: ${student.ma_sinh_vien}`, type: 'error' });
      }
      seenIdsInFile.add(student.ma_sinh_vien);
    }

    if (!student.ho_ten) {
      errors.push({ row: rowNum, field: 'ho_ten', message: 'Thiếu Họ và tên', type: 'error' });
    }

    if (!student.ngay_sinh) {
      errors.push({ row: rowNum, field: 'ngay_sinh', message: 'Ngày sinh không hợp lệ hoặc bị thiếu', type: 'error' });
    } else {
      const birthDate = new Date(student.ngay_sinh);
      if (birthDate > new Date()) {
        warnings.push({ row: rowNum, field: 'ngay_sinh', message: 'Ngày sinh lớn hơn ngày hiện tại', type: 'warning' });
      }
    }

    // Warnings
    if (student.ho_ten && student.ho_ten.length < 3) {
      warnings.push({ row: rowNum, field: 'ho_ten', message: 'Tên quá ngắn (< 3 ký tự)', type: 'warning' });
    }

    if (!student.que_quan) {
      warnings.push({ row: rowNum, field: 'que_quan', message: 'Thiếu Quê quán', type: 'warning' });
    }
  });

  return { errors, warnings };
};

export const exportToExcel = (students: Student[], fileName: string = 'Danh_sach_sinh_vien.xlsx') => {
  const exportData = students.map((s, index) => ({
    'STT': index + 1,
    'Họ và tên': s.ho_ten,
    'Mã sinh viên': s.ma_sinh_vien,
    'Giới tính': s.gioi_tinh,
    'Ngày sinh': s.ngay_sinh,
    'Gmail': s.gmail || '',
    'Email trường': s.email_truong || '',
    'Số điện thoại': s.so_dien_thoai,
    'Quê quán': s.que_quan,
    'Chỗ ở hiện nay': s.cho_o_hien_nay,
    'Chức danh': s.chuc_danh || '',
    'Ghi chú': s.ghi_chu || '',
    'GPA': s.academic.diem_trung_binh,
    'Điểm rèn luyện': s.conduct.diem_ren_luyen,
    'Tín chỉ nợ': s.academic.so_tin_chi_no,
    'Số buổi vắng': s.academic.so_buoi_vang,
    'Mức độ rủi ro': s.risk_level === 'high' ? 'Cao' : s.risk_level === 'medium' ? 'Trung bình' : 'Thấp'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sinh viên');
  
  // Generate buffer and trigger download
  XLSX.writeFile(workbook, fileName);
};
