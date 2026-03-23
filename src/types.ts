export interface AcademicRecord {
  diem_trung_binh: number;
  so_tin_chi_no: number;
  so_mon_truot: number;
  so_buoi_vang: number;
  vi_pham_thi_cu: boolean;
}

export interface ConductRecord {
  diem_ren_luyen: number;
  vi_pham_ky_luat: number;
  muc_do_vi_pham: 'low' | 'medium' | 'high' | 'none';
}

export interface ActivityRecord {
  tham_gia_clb: boolean;
  so_hoat_dong_tham_gia: number;
  vai_tro: 'member' | 'core' | 'leader' | 'none';
  giai_thuong: number;
}

export interface InteractionRecord {
  tuong_tac_giang_vien: 'low' | 'medium' | 'high';
  phan_hoi_som: boolean;
  tinh_than_hoc_tap: number; // 1-5
}

export interface Student {
  id: string;
  ma_sinh_vien: string;
  ho_ten: string;
  gioi_tinh: 'Nam' | 'Nữ';
  ngay_sinh: string;
  que_quan: string;
  cho_o_hien_nay: string;
  so_dien_thoai: string;
  gmail: string;
  email_truong: string;
  chuc_danh?: string;
  ghi_chu?: string;
  allow_edit?: boolean;
  ngay_vao_doan?: string;
  ngay_vao_dang?: string;
  academic: AcademicRecord;
  conduct: ConductRecord;
  activity: ActivityRecord;
  interaction: InteractionRecord;
  risk_score: number;
  potential_score: number;
  risk_level: 'low' | 'medium' | 'high';
  potential_level: 'none' | 'potential' | 'excellent';
  is_authenticated?: boolean;
  is_online?: boolean;
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type PotentialLevel = 'none' | 'potential' | 'excellent';

export interface HistoryRecord {
  id: string;
  studentId: string;
  studentName: string;
  changedBy: string;
  changedByName: string;
  timestamp: any;
  type: 'create' | 'update' | 'delete';
  details: string;
  message: string;
  readBy: string[];
}
