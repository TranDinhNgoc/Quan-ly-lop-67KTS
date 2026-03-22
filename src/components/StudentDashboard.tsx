import React from 'react';
import { 
  User, 
  GraduationCap, 
  AlertCircle, 
  Lightbulb,
  Award,
  ShieldCheck,
  Zap,
  MessageSquare
} from 'lucide-react';
import { Student } from '../types';
import { getActionSuggestions } from '../utils/scoring';
import { motion } from 'framer-motion';

interface StudentDashboardProps {
  student: Student;
}

export default function StudentDashboard({ student }: StudentDashboardProps) {
  const suggestions = getActionSuggestions(student);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Chào mừng, {student.ho_ten}!</h2>
          <p className="text-emerald-100 opacity-90">Dưới đây là tổng quan về kết quả học tập và rèn luyện của bạn.</p>
        </div>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-emerald-400 opacity-20 rounded-full blur-2xl" />
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<User className="text-blue-500" />} 
          label="Họ và tên" 
          value={student.ho_ten} 
          color="blue"
        />
        <StatCard 
          icon={<GraduationCap className="text-emerald-500" />} 
          label="Mã số sinh viên" 
          value={student.ma_sinh_vien} 
          color="emerald"
        />
        <StatCard 
          icon={<Award className="text-amber-500" />} 
          label="GPA hiện tại" 
          value={student.academic.diem_trung_binh.toFixed(2)} 
          color="amber"
          subValue={student.academic.diem_trung_binh >= 3.6 ? 'Xuất sắc' : student.academic.diem_trung_binh >= 3.2 ? 'Giỏi' : student.academic.diem_trung_binh >= 2.5 ? 'Khá' : 'Trung bình'}
        />
        <StatCard 
          icon={<ShieldCheck className="text-purple-500" />} 
          label="Điểm rèn luyện" 
          value={student.conduct.diem_ren_luyen.toString()} 
          color="purple"
          subValue={student.conduct.diem_ren_luyen >= 90 ? 'Xuất sắc' : student.conduct.diem_ren_luyen >= 80 ? 'Tốt' : student.conduct.diem_ren_luyen >= 65 ? 'Khá' : 'Trung bình'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommendation Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
            <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
              <Lightbulb className="text-amber-500" />
              Khuyến cáo & Gợi ý hành động
            </h3>
            <div className="space-y-4">
              {suggestions.length > 0 ? (
                suggestions.map((s, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                      <Zap size={20} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-stone-800 leading-relaxed">{s}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-stone-500 italic">Hiện tại không có khuyến cáo nào đặc biệt. Hãy tiếp tục duy trì phong độ!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-6">Tình trạng hồ sơ</h3>
            <div className="space-y-6">
              <StatusItem 
                label="Mức độ rủi ro" 
                value={student.risk_level === 'high' ? 'Nguy cơ cao' : student.risk_level === 'medium' ? 'Cần chú ý' : 'An toàn'}
                type={student.risk_level === 'high' ? 'danger' : student.risk_level === 'medium' ? 'warning' : 'success'}
              />
              <StatusItem 
                label="Xếp loại tiềm năng" 
                value={student.potential_level === 'excellent' ? 'Xuất sắc' : student.potential_level === 'potential' ? 'Tiềm năng' : 'Bình thường'}
                type={student.potential_level === 'excellent' ? 'premium' : student.potential_level === 'potential' ? 'info' : 'neutral'}
              />
              <div className="pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-stone-500">Tín chỉ nợ</span>
                  <span className={`font-bold ${student.academic.so_tin_chi_no > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {student.academic.so_tin_chi_no}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Số buổi vắng</span>
                  <span className={`font-bold ${student.academic.so_buoi_vang > 5 ? 'text-amber-500' : 'text-stone-900'}`}>
                    {student.academic.so_buoi_vang}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
            <h4 className="text-indigo-900 font-bold mb-2 flex items-center gap-2">
              <MessageSquare size={18} />
              Ghi chú từ Giảng viên
            </h4>
            <p className="text-sm text-indigo-800 leading-relaxed italic">
              {student.ghi_chu || "Chưa có ghi chú đặc biệt nào từ Giảng viên."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, color }: { icon: React.ReactNode, label: string, value: string, subValue?: string, color: string }) {
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-50',
    emerald: 'bg-emerald-50',
    amber: 'bg-amber-50',
    purple: 'bg-purple-50'
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${bgColors[color]} rounded-2xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-xs font-bold text-stone-400 uppercase mb-1">{label}</p>
      <p className="text-xl font-black text-stone-900 truncate" title={value}>{value}</p>
      {subValue && <p className="text-xs font-medium text-stone-500 mt-1">{subValue}</p>}
    </div>
  );
}

function StatusItem({ label, value, type }: { label: string, value: string, type: 'success' | 'warning' | 'danger' | 'info' | 'premium' | 'neutral' }) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    premium: 'bg-purple-50 text-purple-700 border-purple-100',
    neutral: 'bg-stone-50 text-stone-700 border-stone-100',
  };

  return (
    <div>
      <p className="text-xs font-bold text-stone-400 uppercase mb-2">{label}</p>
      <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${styles[type]}`}>
        {value}
      </span>
    </div>
  );
}
