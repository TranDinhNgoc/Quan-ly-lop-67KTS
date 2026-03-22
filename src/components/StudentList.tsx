import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  MoreVertical,
  AlertCircle,
  CheckCircle,
  User,
  FileSpreadsheet
} from 'lucide-react';
import { Student } from '../types';
import { formatDate } from '../utils/format';
import { exportToExcel } from '../utils/excelProcessor';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StudentListProps {
  students: Student[];
  onSelectStudent: (id: string) => void;
  filterType?: 'risk' | 'potential';
}

export default function StudentList({ students, onSelectStudent, filterType }: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'gpa' | 'risk' | 'potential'>('name');

  const filteredStudents = students
    .filter(s => 
      s.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.ma_sinh_vien.includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.ho_ten.localeCompare(b.ho_ten);
      if (sortBy === 'gpa') return b.academic.diem_trung_binh - a.academic.diem_trung_binh;
      if (sortBy === 'risk') return b.risk_score - a.risk_score;
      if (sortBy === 'potential') return b.potential_score - a.potential_score;
      return 0;
    });

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-stone-100 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc MSSV..." 
            className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 border border-stone-200 rounded-2xl">
            <Filter size={16} className="text-stone-500" />
            <select 
              className="bg-transparent text-sm font-medium focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="name">Sắp xếp: Tên</option>
              <option value="gpa">Sắp xếp: GPA</option>
              <option value="risk">Sắp xếp: Nguy cơ</option>
              <option value="potential">Sắp xếp: Tiềm năng</option>
            </select>
          </div>

          <button 
            onClick={() => exportToExcel(filteredStudents)}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold transition-all shadow-md shadow-stone-100"
          >
            <FileSpreadsheet size={18} />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50/50">
              <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider w-16">STT</th>
              <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Sinh viên</th>
              <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Giới tính</th>
              <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Ngày sinh</th>
              <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Gmail</th>
              <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Email trường</th>
              <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Liên hệ</th>
              <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Chức danh</th>
              <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Ghi chú</th>
              <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredStudents.map((student, index) => (
              <tr 
                key={student.id} 
                className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                onClick={() => onSelectStudent(student.id)}
              >
                <td className="px-6 py-4 text-sm text-stone-400 font-medium">{index + 1}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">{student.ho_ten}</p>
                      <p className="text-xs font-mono text-stone-500">{student.ma_sinh_vien}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-stone-600">{student.gioi_tinh}</td>
                <td className="px-6 py-4 text-sm text-stone-600">{formatDate(student.ngay_sinh)}</td>
                <td className="px-6 py-4 text-sm text-stone-600">{student.gmail}</td>
                <td className="px-6 py-4 text-sm text-stone-600">{student.email_truong}</td>
                <td className="px-6 py-4">
                  <div className="text-xs space-y-0.5">
                    <p className="text-stone-600 font-medium">{student.so_dien_thoai}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-stone-600">{student.chuc_danh || ''}</td>
                <td className="px-6 py-4">
                  <p className="text-xs text-stone-500 italic">{student.ghi_chu || ''}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                    <ChevronRight size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredStudents.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-stone-300" />
            </div>
            <p className="text-stone-500 font-medium">Không tìm thấy sinh viên nào khớp với tìm kiếm</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ type, label }: { type: 'success' | 'warning' | 'danger' | 'info' | 'premium', label: string }) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    premium: 'bg-purple-50 text-purple-700 border-purple-100',
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
      styles[type]
    )}>
      {label}
    </span>
  );
}
