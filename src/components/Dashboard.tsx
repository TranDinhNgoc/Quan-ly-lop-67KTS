import React from 'react';
import { 
  Users, 
  AlertTriangle, 
  Star, 
  TrendingUp,
  GraduationCap,
  Award,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Student } from '../types';

interface DashboardProps {
  students: Student[];
  onSelectStudent: (id: string) => void;
}

export default function Dashboard({ students, onSelectStudent }: DashboardProps) {
  const total = students.length;
  const highRisk = students.filter(s => s.risk_level === 'high').length;
  const mediumRisk = students.filter(s => s.risk_level === 'medium').length;
  const excellent = students.filter(s => s.potential_level === 'excellent').length;
  const potential = students.filter(s => s.potential_level === 'potential').length;

  const avgGPA = total > 0 ? (students.reduce((acc, s) => acc + s.academic.diem_trung_binh, 0) / total).toFixed(2) : 0;
  const avgConduct = total > 0 ? (students.reduce((acc, s) => acc + s.conduct.diem_ren_luyen, 0) / total).toFixed(0) : 0;

  const gpaData = [
    { name: '< 2.0', value: students.filter(s => s.academic.diem_trung_binh < 2.0).length },
    { name: '2.0 - 2.5', value: students.filter(s => s.academic.diem_trung_binh >= 2.0 && s.academic.diem_trung_binh < 2.5).length },
    { name: '2.5 - 3.2', value: students.filter(s => s.academic.diem_trung_binh >= 2.5 && s.academic.diem_trung_binh < 3.2).length },
    { name: '3.2 - 3.6', value: students.filter(s => s.academic.diem_trung_binh >= 3.2 && s.academic.diem_trung_binh < 3.6).length },
    { name: '>= 3.6', value: students.filter(s => s.academic.diem_trung_binh >= 3.6).length },
  ];

  const riskData = [
    { name: 'Nguy cơ cao', value: highRisk, color: '#ef4444' },
    { name: 'Cần chú ý', value: mediumRisk, color: '#f59e0b' },
    { name: 'Bình thường', value: total - highRisk - mediumRisk, color: '#10b981' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng sinh viên" 
          value={total} 
          icon={<Users className="text-blue-600" />} 
          bgColor="bg-blue-50" 
          description="Quy mô lớp hiện tại"
        />
        <StatCard 
          title="Nguy cơ cao" 
          value={highRisk} 
          icon={<AlertTriangle className="text-red-600" />} 
          bgColor="bg-red-50" 
          description={`+${mediumRisk} cần chú ý`}
          trend="negative"
        />
        <StatCard 
          title="Xuất sắc" 
          value={excellent} 
          icon={<Star className="text-amber-600" />} 
          bgColor="bg-amber-50" 
          description={`+${potential} tiềm năng`}
          trend="positive"
        />
        <StatCard 
          title="GPA Trung bình" 
          value={avgGPA} 
          icon={<GraduationCap className="text-emerald-600" />} 
          bgColor="bg-emerald-50" 
          description={`Rèn luyện: ${avgConduct}/100`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GPA Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" />
            Phân bố điểm GPA
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gpaData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-red-600" />
            Tình trạng học tập
          </h3>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 pr-8">
              {riskData.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-stone-600 font-medium">{item.name}</span>
                  <span className="text-sm text-stone-900 font-bold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Students / Recent Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Star size={20} className="text-amber-500" />
            Sinh viên xuất sắc nhất
          </h3>
          <div className="space-y-4">
            {students
              .sort((a, b) => b.potential_score - a.potential_score)
              .slice(0, 5)
              .map((s, i) => (
                <div 
                  key={s.id} 
                  onClick={() => onSelectStudent(s.id)}
                  className="flex items-center gap-4 p-3 hover:bg-stone-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-stone-100"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">{s.ho_ten}</p>
                    <p className="text-xs text-stone-500">GPA: {s.academic.diem_trung_binh} | Điểm TN: {s.potential_score}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">
                      {s.potential_level}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            Cảnh báo cần xử lý
          </h3>
          <div className="space-y-4">
            {students
              .filter(s => s.risk_level === 'high')
              .slice(0, 5)
              .map((s) => (
                <div 
                  key={s.id} 
                  onClick={() => onSelectStudent(s.id)}
                  className="flex items-center gap-4 p-3 hover:bg-stone-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-stone-100"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-700">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">{s.ho_ten}</p>
                    <p className="text-xs text-stone-500">Nợ tín chỉ: {s.academic.so_tin_chi_no} | Risk: {s.risk_score}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase">
                      Nguy cơ cao
                    </span>
                  </div>
                </div>
              ))}
            {students.filter(s => s.risk_level === 'high').length === 0 && (
              <div className="text-center py-8 text-stone-400 italic">Chưa có cảnh báo nguy cơ cao</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bgColor, description, trend }: { title: string, value: string | number, icon: React.ReactNode, bgColor: string, description: string, trend?: 'positive' | 'negative' }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend === 'positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {trend === 'positive' ? 'Tốt' : 'Cần chú ý'}
          </span>
        )}
      </div>
      <h4 className="text-stone-500 text-sm font-medium mb-1">{title}</h4>
      <p className="text-3xl font-bold text-stone-900 mb-2">{value}</p>
      <p className="text-xs text-stone-400">{description}</p>
    </div>
  );
}
