import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  User, 
  GraduationCap, 
  ShieldCheck, 
  Zap, 
  MessageSquare,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { Student } from '../types';
import { getActionSuggestions } from '../utils/scoring';
import { formatDate } from '../utils/format';
import ChatBox from './ChatBox';
import { User as FirebaseUser } from 'firebase/auth';

interface StudentDetailProps {
  student: Student;
  isAdmin: boolean;
  user: FirebaseUser;
  onBack?: () => void;
  onUpdate: (data: Partial<Student>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function StudentDetail({ student, isAdmin, user, onBack, onUpdate, onDelete }: StudentDetailProps) {
  if (!student) return null;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Student>(student);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canEdit = isAdmin || student.allow_edit;

  const suggestions = getActionSuggestions(student);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        {onBack ? (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Quay lại danh sách
          </button>
        ) : <div />}
        
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-all"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-emerald-100 disabled:opacity-50"
              >
                <Save size={18} />
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </>
          ) : (
            <>
              {isAdmin && (
                <div className="relative">
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Xóa sinh viên"
                  >
                    <Trash2 size={20} />
                  </button>

                  {showDeleteConfirm && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-stone-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in duration-200">
                      <p className="text-sm font-bold text-stone-900 mb-4">Bạn có chắc chắn muốn xóa sinh viên này?</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 py-2 text-xs font-bold text-stone-500 hover:bg-stone-50 rounded-lg transition-all"
                        >
                          Hủy
                        </button>
                        <button 
                          onClick={() => {
                            onDelete(student.id);
                            setShowDeleteConfirm(false);
                          }}
                          className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-md shadow-red-100"
                        >
                          Xác nhận xóa
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {canEdit && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold transition-all shadow-md"
                >
                  Chỉnh sửa hồ sơ
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm text-center">
            <div className="w-24 h-24 bg-stone-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-stone-400 border-4 border-white shadow-inner">
              <User size={48} />
            </div>
            <h3 className="text-2xl font-bold text-stone-900">{student.ho_ten}</h3>
            <p className="text-stone-500 font-mono mb-6">{student.ma_sinh_vien}</p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge 
                type={student.risk_level === 'high' ? 'danger' : student.risk_level === 'medium' ? 'warning' : 'success'}
                label={student.risk_level === 'high' ? 'Nguy cơ cao' : student.risk_level === 'medium' ? 'Cần chú ý' : 'An toàn'}
              />
              {student.potential_level !== 'none' && (
                <Badge 
                  type={student.potential_level === 'excellent' ? 'premium' : 'info'}
                  label={student.potential_level === 'excellent' ? 'Xuất sắc' : 'Tiềm năng'}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-6">
              <div className="text-center">
                <p className="text-xs text-stone-400 uppercase font-bold mb-1">Risk Score</p>
                <p className={`text-xl font-black ${student.risk_score > 60 ? 'text-red-600' : 'text-stone-900'}`}>{student.risk_score}</p>
              </div>
              <div className="text-center border-l border-stone-100">
                <p className="text-xs text-stone-400 uppercase font-bold mb-1">Potential</p>
                <p className={`text-xl font-black ${student.potential_score > 70 ? 'text-emerald-600' : 'text-stone-900'}`}>{student.potential_score}</p>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-6 pt-6 border-t border-stone-100">
                <div className="flex items-center justify-between bg-stone-50 p-4 rounded-2xl">
                  <div className="text-left">
                    <p className="text-xs font-bold text-stone-900 uppercase">Quyền tự sửa</p>
                    <p className="text-[10px] text-stone-500">Cho phép SV tự cập nhật hồ sơ</p>
                  </div>
                  <button 
                    onClick={() => onUpdate({ allow_edit: !student.allow_edit })}
                    className={`w-12 h-6 rounded-full transition-all relative ${student.allow_edit ? 'bg-emerald-500' : 'bg-stone-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${student.allow_edit ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Suggestions */}
          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
            <h4 className="text-emerald-900 font-bold mb-4 flex items-center gap-2">
              <Lightbulb size={18} />
              Gợi ý hành động
            </h4>
            <ul className="space-y-3">
              {suggestions.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-emerald-800 leading-relaxed">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          
          <ChatBox studentId={student.id} user={user} isAdmin={isAdmin} />
        </div>

        {/* Details Tabs/Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Section title="Thông tin cơ bản" icon={<User size={20} className="text-blue-500" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Họ và tên" value={student.ho_ten} editing={isEditing} onChange={(v) => updateField('ho_ten', v)} />
              <Field label="Mã sinh viên" value={student.ma_sinh_vien} editing={isEditing} onChange={(v) => updateField('ma_sinh_vien', v)} />
              <Field label="Ngày sinh" value={student.ngay_sinh} type="date" editing={isEditing} onChange={(v) => updateField('ngay_sinh', v)} />
              <Field label="Gmail" value={student.gmail} type="email" editing={isEditing} onChange={(v) => updateField('gmail', v)} />
              <Field label="Email trường" value={student.email_truong} type="email" editing={isEditing} onChange={(v) => updateField('email_truong', v)} />
              <Field label="Quê quán" value={student.que_quan} editing={isEditing} onChange={(v) => updateField('que_quan', v)} />
              <Field label="Chỗ ở hiện nay" value={student.cho_o_hien_nay} editing={isEditing} onChange={(v) => updateField('cho_o_hien_nay', v)} />
              <Field label="Số điện thoại" value={student.so_dien_thoai} editing={isEditing} onChange={(v) => updateField('so_dien_thoai', v)} />
              <Field label="Chức danh" value={student.chuc_danh} editing={isEditing} onChange={(v) => updateField('chuc_danh', v)} />
              <Field label="Ngày vào Đoàn" value={student.ngay_vao_doan} type="date" editing={isEditing} onChange={(v) => updateField('ngay_vao_doan', v)} />
              <Field label="Ngày vào Đảng" value={student.ngay_vao_dang} type="date" editing={isEditing} onChange={(v) => updateField('ngay_vao_dang', v)} />
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Giới tính</label>
                {isEditing ? (
                  <select 
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={formData.gioi_tinh}
                    onChange={(e) => updateField('gioi_tinh', e.target.value)}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                ) : (
                  <p className="font-bold text-stone-900">{student.gioi_tinh}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Field label="Ghi chú" value={student.ghi_chu} editing={isEditing} onChange={(v) => updateField('ghi_chu', v)} />
              </div>
            </div>
          </Section>

          {/* Academic Info */}
          <Section title="Kết quả Học tập" icon={<GraduationCap size={20} className="text-emerald-500" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="GPA" value={student.academic.diem_trung_binh} type="number" editing={isEditing && isAdmin} onChange={(v) => updateField('academic.diem_trung_binh', parseFloat(v))} />
              <Field label="Số tín chỉ nợ" value={student.academic.so_tin_chi_no} type="number" editing={isEditing && isAdmin} onChange={(v) => updateField('academic.so_tin_chi_no', parseInt(v))} />
              <Field label="Số môn trượt" value={student.academic.so_mon_truot} type="number" editing={isEditing && isAdmin} onChange={(v) => updateField('academic.so_mon_truot', parseInt(v))} />
              <Field label="Số buổi vắng" value={student.academic.so_buoi_vang} type="number" editing={isEditing && isAdmin} onChange={(v) => updateField('academic.so_buoi_vang', parseInt(v))} />
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Vi phạm thi cử</label>
                {isEditing && isAdmin ? (
                  <select 
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={formData.academic.vi_pham_thi_cu ? 'true' : 'false'}
                    onChange={(e) => updateField('academic.vi_pham_thi_cu', e.target.value === 'true')}
                  >
                    <option value="false">Không</option>
                    <option value="true">Có vi phạm</option>
                  </select>
                ) : (
                  <p className={`font-bold ${student.academic.vi_pham_thi_cu ? 'text-red-600' : 'text-stone-900'}`}>
                    {student.academic.vi_pham_thi_cu ? 'Có vi phạm' : 'Không'}
                  </p>
                )}
              </div>
            </div>
          </Section>

          {/* Conduct & Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="Rèn luyện" icon={<ShieldCheck size={20} className="text-amber-500" />}>
              <div className="space-y-4">
                <Field label="Điểm rèn luyện" value={student.conduct.diem_ren_luyen} type="number" editing={isEditing && isAdmin} onChange={(v) => updateField('conduct.diem_ren_luyen', parseInt(v))} />
                <Field label="Vi phạm kỷ luật" value={student.conduct.vi_pham_ky_luat} type="number" editing={isEditing && isAdmin} onChange={(v) => updateField('conduct.vi_pham_ky_luat', parseInt(v))} />
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Mức độ vi phạm</label>
                  {isEditing && isAdmin ? (
                    <select 
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.conduct.muc_do_vi_pham}
                      onChange={(e) => updateField('conduct.muc_do_vi_pham', e.target.value)}
                    >
                      <option value="none">Không</option>
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Nghiêm trọng</option>
                    </select>
                  ) : (
                    <p className="font-bold text-stone-900 capitalize">{student.conduct.muc_do_vi_pham}</p>
                  )}
                </div>
              </div>
            </Section>

            <Section title="Hoạt động" icon={<Zap size={20} className="text-purple-500" />}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-400 uppercase">Tham gia CLB</label>
                  {isEditing && isAdmin ? (
                    <input 
                      type="checkbox" 
                      checked={formData.activity.tham_gia_clb} 
                      onChange={(e) => updateField('activity.tham_gia_clb', e.target.checked)}
                      className="w-5 h-5 accent-emerald-600"
                    />
                  ) : (
                    <p className="font-bold text-stone-900">{student.activity.tham_gia_clb ? 'Có' : 'Không'}</p>
                  )}
                </div>
                <Field label="Số hoạt động" value={student.activity.so_hoat_dong_tham_gia} type="number" editing={isEditing && isAdmin} onChange={(v) => updateField('activity.so_hoat_dong_tham_gia', parseInt(v))} />
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Vai trò</label>
                  {isEditing && isAdmin ? (
                    <select 
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.activity.vai_tro}
                      onChange={(e) => updateField('activity.vai_tro', e.target.value)}
                    >
                      <option value="none">Không</option>
                      <option value="member">Thành viên</option>
                      <option value="core">Nòng cốt</option>
                      <option value="leader">Lãnh đạo</option>
                    </select>
                  ) : (
                    <p className="font-bold text-stone-900 capitalize">{student.activity.vai_tro}</p>
                  )}
                </div>
              </div>
            </Section>
          </div>

          {/* Interaction */}
          <Section title="Tương tác & Thái độ" icon={<MessageSquare size={20} className="text-indigo-500" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Tương tác GV</label>
                {isEditing && isAdmin ? (
                  <select 
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={formData.interaction.tuong_tac_giang_vien}
                    onChange={(e) => updateField('interaction.tuong_tac_giang_vien', e.target.value)}
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Tích cực</option>
                  </select>
                ) : (
                  <p className="font-bold text-stone-900 capitalize">{student.interaction.tuong_tac_giang_vien}</p>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <label className="text-xs font-bold text-stone-400 uppercase mb-2">Phản hồi sớm</label>
                {isEditing && isAdmin ? (
                  <input 
                    type="checkbox" 
                    checked={formData.interaction.phan_hoi_som} 
                    onChange={(e) => updateField('interaction.phan_hoi_som', e.target.checked)}
                    className="w-5 h-5 accent-emerald-600"
                  />
                ) : (
                  <p className="font-bold text-stone-900">{student.interaction.phan_hoi_som ? 'Có' : 'Không'}</p>
                )}
              </div>
              <Field label="Tinh thần học tập (1-5)" value={student.interaction.tinh_than_hoc_tap} type="number" editing={isEditing && isAdmin} onChange={(v) => updateField('interaction.tinh_than_hoc_tap', parseInt(v))} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
      <h4 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
        {icon}
        {title}
      </h4>
      {children}
    </div>
  );
}

function Field({ label, value, type = 'text', editing, onChange }: { label: string, value: any, type?: string, editing: boolean, onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-bold text-stone-400 uppercase mb-2">{label}</label>
      {editing ? (
        <input 
          type={type}
          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <p className="font-bold text-stone-900">{type === 'date' ? formatDate(value) : (value || '---')}</p>
      )}
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
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${styles[type]}`}>
      {label}
    </span>
  );
}
