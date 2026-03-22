import React, { useState } from 'react';
import { 
  Monitor, 
  Search, 
  UserCheck, 
  UserX, 
  Eye, 
  Settings,
  ShieldAlert
} from 'lucide-react';
import { Student } from '../types';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface StudentUIManagementProps {
  students: Student[];
  onPreview: (studentId: string) => void;
}

export default function StudentUIManagement({ students, onPreview }: StudentUIManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s => 
    s.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.ma_sinh_vien.includes(searchTerm)
  );

  const toggleAllowEdit = async (student: Student) => {
    try {
      await updateDoc(doc(db, 'students', student.id), {
        allow_edit: !student.allow_edit
      });
    } catch (error) {
      console.error("Error updating allow_edit:", error);
    }
  };

  const toggleAllEdit = async (allow: boolean) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ${allow ? 'cho phép' : 'chặn'} tất cả sinh viên tự chỉnh sửa hồ sơ?`)) return;
    
    for (const student of students) {
      if (student.allow_edit !== allow) {
        await updateDoc(doc(db, 'students', student.id), {
          allow_edit: allow
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Settings className="text-stone-500" />
              Cấu hình chung
            </h3>
            <p className="text-sm text-stone-500">Thiết lập quyền hạn truy cập cho toàn bộ sinh viên trong lớp</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => toggleAllEdit(true)}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all flex items-center gap-2"
            >
              <UserCheck size={16} />
              Cho phép tất cả
            </button>
            <button 
              onClick={() => toggleAllEdit(false)}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-bold hover:bg-red-100 transition-all flex items-center gap-2"
            >
              <UserX size={16} />
              Chặn tất cả
            </button>
          </div>
        </div>
      </div>

      {/* Student List for UI Mgmt */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-stone-900">Danh sách quyền hạn sinh viên</h3>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm sinh viên..." 
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50">
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Sinh viên</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Email đăng ký</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Quyền tự sửa</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-500 font-bold text-xs">
                        {student.ho_ten.split(' ').pop()?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{student.ho_ten}</p>
                        <p className="text-xs text-stone-500 font-mono">{student.ma_sinh_vien}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-stone-600">{student.gmail || 'Chưa cập nhật'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleAllowEdit(student)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border transition-all ${
                        student.allow_edit 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-stone-100 text-stone-500 border-stone-200'
                      }`}
                    >
                      {student.allow_edit ? 'Đang bật' : 'Đang tắt'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onPreview(student.id)}
                        className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Xem thử giao diện SV"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-12 text-center">
            <Monitor size={48} className="mx-auto text-stone-200 mb-4" />
            <p className="text-stone-500">Không tìm thấy sinh viên nào khớp với tìm kiếm.</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
          <ShieldAlert size={20} className="text-blue-500" />
        </div>
        <div>
          <h4 className="text-blue-900 font-bold mb-1">Lưu ý về quyền tự sửa</h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            Khi bật "Quyền tự sửa", sinh viên có thể tự cập nhật các thông tin cơ bản như số điện thoại, địa chỉ, quê quán. 
            Các thông tin về điểm số và rèn luyện vẫn sẽ do Giảng viên quản lý.
          </p>
        </div>
      </div>
    </div>
  );
}
