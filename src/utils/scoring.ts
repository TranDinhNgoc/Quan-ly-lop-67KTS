import { Student } from '../types';

export function calculateScores(student: Partial<Student>): { 
  risk_score: number; 
  potential_score: number;
  risk_level: Student['risk_level'];
  potential_level: Student['potential_level'];
} {
  const academic = student.academic || { diem_trung_binh: 4, so_tin_chi_no: 0, so_mon_truot: 0, so_buoi_vang: 0, vi_pham_thi_cu: false };
  const conduct = student.conduct || { diem_ren_luyen: 100, vi_pham_ky_luat: 0, muc_do_vi_pham: 'none' };
  const activity = student.activity || { tham_gia_clb: false, so_hoat_dong_tham_gia: 0, vai_tro: 'none', giai_thuong: 0 };
  const interaction = student.interaction || { tuong_tac_giang_vien: 'medium', phan_hoi_som: true, tinh_than_hoc_tap: 5 };

  // 1. Risk Score Calculation (0-100)
  let riskScore = 0;
  
  // GPA (30%) - Max risk if GPA < 2.0
  if (academic.diem_trung_binh < 2.0) riskScore += 30;
  else if (academic.diem_trung_binh < 2.5) riskScore += 15;

  // Nợ tín chỉ (20%) - Max risk if > 6
  if (academic.so_tin_chi_no > 6) riskScore += 20;
  else if (academic.so_tin_chi_no > 0) riskScore += 10;

  // Vắng học (20%) - Max risk if > 20% (assuming 60 sessions total)
  if (academic.so_buoi_vang > 12) riskScore += 20;
  else if (academic.so_buoi_vang > 5) riskScore += 10;

  // Vi phạm (20%)
  if (academic.vi_pham_thi_cu || conduct.vi_pham_ky_luat > 0) riskScore += 20;
  if (conduct.muc_do_vi_pham === 'high') riskScore += 10; // Extra penalty

  // Rèn luyện thấp (10%)
  if (conduct.diem_ren_luyen < 50) riskScore += 10;
  else if (conduct.diem_ren_luyen < 65) riskScore += 5;

  riskScore = Math.min(100, riskScore);

  // 2. Potential Score Calculation (0-100)
  let potentialScore = 0;

  // GPA (30%)
  if (academic.diem_trung_binh >= 3.6) potentialScore += 30;
  else if (academic.diem_trung_binh >= 3.2) potentialScore += 20;
  else if (academic.diem_trung_binh >= 2.8) potentialScore += 10;

  // Rèn luyện (20%)
  if (conduct.diem_ren_luyen >= 90) potentialScore += 20;
  else if (conduct.diem_ren_luyen >= 80) potentialScore += 10;

  // Hoạt động (20%)
  if (activity.so_hoat_dong_tham_gia >= 5 || activity.tham_gia_clb) potentialScore += 20;
  else if (activity.so_hoat_dong_tham_gia >= 2) potentialScore += 10;

  // Lãnh đạo (15%)
  if (activity.vai_tro === 'leader') potentialScore += 15;
  else if (activity.vai_tro === 'core') potentialScore += 10;

  // Tương tác (15%)
  if (interaction.tuong_tac_giang_vien === 'high') potentialScore += 10;
  if (interaction.phan_hoi_som) potentialScore += 5;

  potentialScore = Math.min(100, potentialScore);

  // Classify
  let riskLevel: Student['risk_level'] = 'low';
  if (riskScore > 60) riskLevel = 'high';
  else if (riskScore > 30) riskLevel = 'medium';

  let potentialLevel: Student['potential_level'] = 'none';
  if (potentialScore > 85) potentialLevel = 'excellent';
  else if (potentialScore > 70) potentialLevel = 'potential';

  return { risk_score: riskScore, potential_score: potentialScore, risk_level: riskLevel, potential_level: potentialLevel };
}

export function getActionSuggestions(student: Student): string[] {
  const suggestions: string[] = [];
  
  if (student.risk_level === 'high') {
    suggestions.push('Gặp trực tiếp sinh viên để tìm hiểu nguyên nhân sa sút.');
    suggestions.push('Tư vấn lộ trình học tập và đăng ký tín chỉ hợp lý.');
    suggestions.push('Liên hệ gia đình nếu cần thiết.');
  } else if (student.risk_level === 'medium') {
    suggestions.push('Nhắc nhở về việc vắng học và nợ tín chỉ.');
    suggestions.push('Khuyến khích tham gia các nhóm học tập.');
  }

  if (student.potential_level === 'excellent') {
    suggestions.push('Đề cử nhận học bổng khuyến khích học tập.');
    suggestions.push('Giới thiệu tham gia các nhóm nghiên cứu khoa học.');
    suggestions.push('Cân nhắc bầu làm cán bộ lớp hoặc nòng cốt CLB.');
  } else if (student.potential_level === 'potential') {
    suggestions.push('Khuyến khích duy trì phong độ và tham gia nhiều hoạt động hơn.');
    suggestions.push('Gợi ý các cuộc thi chuyên môn.');
  }

  if (suggestions.length === 0) {
    suggestions.push('Tiếp tục theo dõi tình hình học tập định kỳ.');
  }

  return suggestions;
}
