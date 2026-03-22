import React, { useState } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { Student } from '../types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Partial<Student>) => Promise<void>;
}

export default function AddStudentModal({ isOpen, onClose, onAdd }: AddStudentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({
    ma_sinh_vien: '',
    ho_ten: '',
    ngay_sinh: '',
    que_quan: '',
    gioi_tinh: 'Nữ',
    cho_o_hien_nay: '',
    so_dien_thoai: '',
    gmail: '',
    email_truong: '',
    chuc_danh: '',
    ghi_chu: '',
    academic: {
      diem_trung_binh: 0,
      so_tin_chi_no: 0,
      so_mon_truot: 0,
      so_buoi_vang: 0,
      vi_pham_thi_cu: false
    },
    conduct: {
      diem_ren_luyen: 0,
      vi_pham_ky_luat: 0,
      muc_do_vi_pham: 'none'
    },
    activity: {
      tham_gia_clb: false,
      so_hoat_dong_tham_gia: 0,
      vai_tro: 'none',
      giai_thuong: 0
    },
    interaction: {
      tuong_tac_giang_vien: 'medium',
      phan_hoi_som: true,
      tinh_than_hoc_tap: 5
    }
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ma_sinh_vien || !formData.ho_ten) {
      alert('Vui lòng nhập đầy đủ MSSV và Họ tên');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (path: string, value: any) => {
    const keys = path.split('.');
    if (keys.length === 1) {
      setFormData({ ...formData, [keys[0]]: value });
    } else {
      const [parent, child] = keys;
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent as keyof Student] as any),
          [child]: value
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900">Thêm sinh viên mới</h3>
              <p className="text-xs text-stone-500">Nhập thông tin cơ bản để bắt đầu theo dõi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <X size={20} className="text-stone-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Họ và tên *</label>
              <input 
                required
                type="text" 
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.ho_ten}
                onChange={(e) => updateField('ho_ten', e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Mã sinh viên *</label>
              <input 
                required
                type="text" 
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.ma_sinh_vien}
                onChange={(e) => updateField('ma_sinh_vien', e.target.value)}
                placeholder="SV123456"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Giới tính</label>
              <select 
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.gioi_tinh}
                onChange={(e) => updateField('gioi_tinh', e.target.value)}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Ngày sinh</label>
              <input 
                type="date" 
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.ngay_sinh}
                onChange={(e) => updateField('ngay_sinh', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Quê quán</label>
              <input 
                type="text" 
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.que_quan}
                onChange={(e) => updateField('que_quan', e.target.value)}
                placeholder="Hà Nội"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Chỗ ở hiện nay</label>
              <input 
                type="text" 
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.cho_o_hien_nay}
                onChange={(e) => updateField('cho_o_hien_nay', e.target.value)}
                placeholder="Ký túc xá A"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Số điện thoại</label>
              <input 
                type="tel" 
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.so_dien_thoai}
                onChange={(e) => updateField('so_dien_thoai', e.target.value)}
                placeholder="0912345678"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Gmail</label>
              <input 
                type="email" 
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.gmail}
                onChange={(e) => updateField('gmail', e.target.value)}
                placeholder="student@gmail.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Email trường</label>
              <input 
                type="email" 
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.email_truong}
                onChange={(e) => updateField('email_truong', e.target.value)}
                placeholder="student@tlu.edu.vn"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Chức danh</label>
              <input 
                type="text" 
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.chuc_danh}
                onChange={(e) => updateField('chuc_danh', e.target.value)}
                placeholder="Lớp trưởng"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Ghi chú</label>
              <input 
                type="text" 
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.ghi_chu}
                onChange={(e) => updateField('ghi_chu', e.target.value)}
                placeholder="Nhập ghi chú thêm..."
              />
            </div>
          </div>

          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <h4 className="text-sm font-bold text-emerald-900 mb-4">Dữ liệu học tập ban đầu</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">GPA</label>
                <input 
                  type="number" step="0.1" min="0" max="4"
                  className="w-full p-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={formData.academic?.diem_trung_binh}
                  onChange={(e) => updateField('academic.diem_trung_binh', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">Điểm rèn luyện</label>
                <input 
                  type="number" min="0" max="100"
                  className="w-full p-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={formData.conduct?.diem_ren_luyen}
                  onChange={(e) => updateField('conduct.diem_ren_luyen', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">Tín chỉ nợ</label>
                <input 
                  type="number" min="0"
                  className="w-full p-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={formData.academic?.so_tin_chi_no}
                  onChange={(e) => updateField('academic.so_tin_chi_no', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-stone-600 hover:bg-stone-100 rounded-xl font-bold transition-all"
            >
              Hủy
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-50"
            >
              <Save size={18} />
              {isSubmitting ? 'Đang xử lý...' : 'Thêm sinh viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
