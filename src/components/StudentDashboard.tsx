import React, { useRef, useState } from 'react';
import { 
  User, 
  GraduationCap, 
  Lightbulb,
  Award,
  ShieldCheck,
  Zap,
  MessageSquare,
  Download,
  Loader2
} from 'lucide-react';
import { Student } from '../types';
import { getActionSuggestions } from '../utils/scoring';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface StudentDashboardProps {
  student: Student;
  onClosePreview?: () => void;
}

export default function StudentDashboard({ student, onClosePreview }: StudentDashboardProps) {
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const suggestions = getActionSuggestions(student);

  const getGPAClassification = (gpa: number) => {
    if (gpa >= 3.6) return 'Xuất sắc';
    if (gpa >= 3.2) return 'Giỏi';
    if (gpa >= 2.5) return 'Khá';
    return 'Trung bình';
  };

  const getConductClassification = (score: number) => {
    if (score >= 90) return 'Xuất sắc';
    if (score >= 80) return 'Tốt';
    if (score >= 65) return 'Khá';
    return 'Trung bình';
  };

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    
    setIsExporting(true);
    try {
      // Create a clone of the dashboard to modify for PDF
      const element = dashboardRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#f5f5f4', // Match stone-50
        onclone: (clonedDoc) => {
          // Hide elements that shouldn't be in the PDF
          const closeBtn = clonedDoc.querySelector('.close-preview-btn');
          const exportBtn = clonedDoc.querySelector('.export-btn');
          if (closeBtn) (closeBtn as HTMLElement).style.display = 'none';
          if (exportBtn) (exportBtn as HTMLElement).style.display = 'none';
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10; // Margin top

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Ho_so_sinh_vien_${student.ma_sinh_vien}.pdf`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Có lỗi xảy ra khi xuất hồ sơ. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div ref={dashboardRef} className="max-w-5xl mx-auto space-y-6 p-4 md:p-8 pb-24 relative bg-stone-50/30">
      {/* Welcome Header */}
      <div className="bg-[#0f9d58] rounded-[2rem] p-8 md:p-12 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Chào mừng, {student.ho_ten}!</h2>
            <p className="text-white/90 text-lg">Dưới đây là tổng quan về kết quả học tập và rèn luyện của bạn.</p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="hidden md:block opacity-20">
              <GraduationCap size={120} />
            </div>
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="export-btn bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all backdrop-blur-sm border border-white/30 disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
              {isExporting ? 'Đang xuất...' : 'Xuất hồ sơ (PDF)'}
            </button>
          </div>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          icon={<User className="text-blue-500" size={20} />} 
          label="Họ và tên" 
          value={student.ho_ten} 
          iconBg="bg-blue-50"
        />
        <StatCard 
          icon={<GraduationCap className="text-emerald-500" size={20} />} 
          label="Mã số sinh viên" 
          value={student.ma_sinh_vien} 
          iconBg="bg-emerald-50"
        />
        <StatCard 
          icon={<Award className="text-amber-500" size={20} />} 
          label="Điểm GPA" 
          value={student.academic.diem_trung_binh.toFixed(2)} 
          subValue={getGPAClassification(student.academic.diem_trung_binh)}
          iconBg="bg-amber-50"
        />
        <StatCard 
          icon={<ShieldCheck className="text-purple-500" size={20} />} 
          label="Điểm rèn luyện" 
          value={student.conduct.diem_ren_luyen.toString()} 
          subValue={getConductClassification(student.conduct.diem_ren_luyen)}
          iconBg="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendation Section */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-stone-100 shadow-sm h-full">
            <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-3">
              <Lightbulb className="text-amber-500" size={24} />
              Khuyến cáo & Gợi ý hành động
            </h3>
            <div className="space-y-4">
              {suggestions.length > 0 ? suggestions.map((s, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="flex gap-4 p-5 bg-stone-50/50 rounded-2xl border border-stone-100 items-center"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <Zap size={18} className="text-amber-500" />
                  </div>
                  <p className="text-stone-700 font-medium">{s}</p>
                </motion.div>
              )) : (
                <div className="flex gap-4 p-5 bg-stone-50/50 rounded-2xl border border-stone-100 items-center">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <ShieldCheck size={18} className="text-emerald-500" />
                  </div>
                  <p className="text-stone-700 font-medium">Duy trì phong độ học tập hiện tại.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Summary & Notes */}
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-stone-100 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-6">Tình trạng hồ sơ</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-stone-500">Mức độ rủi ro</p>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                  student.risk_level === 'high' ? 'bg-red-50 text-red-600' : 
                  student.risk_level === 'medium' ? 'bg-amber-50 text-amber-600' : 
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  {student.risk_level === 'high' ? 'Nguy cơ cao' : student.risk_level === 'medium' ? 'Cần chú ý' : 'Thấp'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-stone-500">Xếp loại tiềm năng</p>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                  student.potential_level === 'excellent' ? 'bg-blue-50 text-blue-600' : 
                  student.potential_level === 'potential' ? 'bg-emerald-50 text-emerald-600' : 
                  'bg-stone-50 text-stone-600'
                }`}>
                  {student.potential_level === 'excellent' ? 'Rất cao' : student.potential_level === 'potential' ? 'Cao' : 'Bình thường'}
                </span>
              </div>

              <div className="pt-4 space-y-3 border-t border-stone-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">Số tín chỉ nợ</span>
                  <span className={`px-4 py-1 rounded-full text-xs font-bold ${student.academic.so_tin_chi_no > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {student.academic.so_tin_chi_no}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">Số buổi vắng</span>
                  <span className={`px-4 py-1 rounded-full text-xs font-bold ${student.academic.so_buoi_vang > 5 ? 'bg-red-50 text-red-600' : student.academic.so_buoi_vang > 2 ? 'bg-amber-50 text-amber-600' : 'bg-stone-50 text-stone-600'}`}>
                    {student.academic.so_buoi_vang}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#f0f4ff] p-6 rounded-[2rem] border border-blue-50">
            <h4 className="text-blue-900 font-bold mb-3 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-600" />
              Ghi chú từ Giảng viên
            </h4>
            <p className="text-sm text-blue-800/80 leading-relaxed italic">
              {student.ghi_chu || "Em cần chú ý hơn trong việc tham gia các hoạt động của Đoàn Hội."}
            </p>
          </div>
        </div>
      </div>

      {/* Close Preview Button (Only for Admin Preview) */}
      {onClosePreview && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 close-preview-btn">
          <button 
            onClick={onClosePreview}
            className="bg-stone-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:bg-stone-800 transition-all flex items-center gap-3"
          >
            Đóng bản xem trước
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subValue, iconBg }: { icon: React.ReactNode, label: string, value: string, subValue?: string, iconBg: string }) {
  return (
    <div className="bg-white p-6 rounded-[1.5rem] border border-stone-100 shadow-sm">
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-black text-stone-900 truncate mb-1" title={value}>{value}</p>
      {subValue && <p className="text-xs font-medium text-stone-500">{subValue}</p>}
    </div>
  );
}
