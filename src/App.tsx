import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  Star, 
  PlusCircle, 
  LogOut, 
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  UserCircle,
  FileSpreadsheet,
  UserCheck,
  BookOpen,
  Award,
  BarChart3
} from 'lucide-react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Student } from './types';
import { calculateScores } from './utils/scoring';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentDetail from './components/StudentDetail';
import AddStudentModal from './components/AddStudentModal';
import ImportExcelModal from './components/ImportExcelModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'student' | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'officers' | 'warnings' | 'potential' | 'conduct' | 'conduct-25-26' | 'conduct-26-27' | 'conduct-27-28' | 'conduct-28-29' | 'summary' | 'summary-25-26' | 'summary-26-27' | 'summary-27-28' | 'summary-28-29' | 'summary-internship' | 'summary-thesis' | 'my-profile'>('dashboard');
  const [isClassMgmtOpen, setIsClassMgmtOpen] = useState(true);
  const [isConductOpen, setIsConductOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const ADMIN_EMAIL = "manamedruby@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        if (u.email === ADMIN_EMAIL) {
          setRole('admin');
        } else {
          setRole('student');
          setActiveTab('my-profile');
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    let q = query(collection(db, 'students'), orderBy('ho_ten', 'asc'));
    
    // If student, they can only see their own record if the rules allow it
    // But for the UI, we filter it here too
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      
      if (user.email === ADMIN_EMAIL) {
        setStudents(studentData);
      } else {
        const myRecord = studentData.filter(s => s.gmail === user.email);
        setStudents(myRecord);
        if (myRecord.length > 0) {
          setSelectedStudentId(myRecord[0].id);
        }
      }
    }, (error) => {
      console.error("Firestore Error: ", error);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || students.length > 0) return;

    // Only add mock data if the collection is empty
    const addMockData = async () => {
      const mockStudents = [
        { ma_sinh_vien: "2554104718", ho_ten: "Nguyễn Bảo Anh", gioi_tinh: "Nữ", ngay_sinh: "2007-05-19", so_dien_thoai: "0397356988" },
        { ma_sinh_vien: "2554104719", ho_ten: "Nguyễn Thị Ngọc Anh", gioi_tinh: "Nữ", ngay_sinh: "2006-06-16", so_dien_thoai: "326168312" },
        { ma_sinh_vien: "2554104717", ho_ten: "Đào Thị Tú Anh", gioi_tinh: "Nữ", ngay_sinh: "2007-02-23", so_dien_thoai: "0326048714" },
        { ma_sinh_vien: "2554104720", ho_ten: "Trần Phương Anh", gioi_tinh: "Nữ", ngay_sinh: "2007-05-03", so_dien_thoai: "0839352007" },
        { ma_sinh_vien: "2554104721", ho_ten: "Mai Thị Quỳnh Ánh", gioi_tinh: "Nữ", ngay_sinh: "2007-06-03", so_dien_thoai: "0343675981", chuc_danh: "Phó Bí thư" },
        { ma_sinh_vien: "2554104722", ho_ten: "Trần Thị Ngọc Ánh", gioi_tinh: "Nữ", ngay_sinh: "2007-04-14", so_dien_thoai: "0833542415" },
        { ma_sinh_vien: "2554104723", ho_ten: "Nguyễn Gia Bảo", gioi_tinh: "Nam", ngay_sinh: "2007-11-25", so_dien_thoai: "0982785830" },
        { ma_sinh_vien: "2554104725", ho_ten: "Nguyễn Linh Chi", gioi_tinh: "Nữ", ngay_sinh: "2007-11-05", so_dien_thoai: "981748569" },
        { ma_sinh_vien: "2554104724", ho_ten: "Lê Quỳnh Chi", gioi_tinh: "Nữ", ngay_sinh: "2007-07-05", so_dien_thoai: "0986402780" },
        { ma_sinh_vien: "2554104726", ho_ten: "Nguyễn Thị Khánh Chinh", gioi_tinh: "Nữ", ngay_sinh: "2007-07-17", so_dien_thoai: "0395067807" },
        { ma_sinh_vien: "2554104727", ho_ten: "Nguyễn Hữu Đăng", gioi_tinh: "Nam", ngay_sinh: "2007-08-09", so_dien_thoai: "0986214729" },
        { ma_sinh_vien: "2554104728", ho_ten: "Nguyễn Thị Dịu", gioi_tinh: "Nữ", ngay_sinh: "2007-03-05", so_dien_thoai: "0399749774", chuc_danh: "Lớp trưởng" },
        { ma_sinh_vien: "2554104729", ho_ten: "Nguyễn Văn Đông", gioi_tinh: "Nam", ngay_sinh: "2007-04-27", so_dien_thoai: "0382786023" },
        { ma_sinh_vien: "2554104730", ho_ten: "Nguyễn Minh Đức", gioi_tinh: "Nam", ngay_sinh: "2007-03-27", so_dien_thoai: "0386067307" },
        { ma_sinh_vien: "2554104731", ho_ten: "Hán Kim Dung", gioi_tinh: "Nữ", ngay_sinh: "2007-10-07", so_dien_thoai: "0974169607" },
        { ma_sinh_vien: "2554104732", ho_ten: "Nguyễn Ngọc Duyên", gioi_tinh: "Nữ", ngay_sinh: "2007-04-26", so_dien_thoai: "0382083686" },
        { ma_sinh_vien: "2554104733", ho_ten: "Cao Thị Thu Giang", gioi_tinh: "Nữ", ngay_sinh: "2007-12-09", so_dien_thoai: "0336912086" },
        { ma_sinh_vien: "2554104734", ho_ten: "Nguyễn Hương Giang", gioi_tinh: "Nữ", ngay_sinh: "2007-12-23", so_dien_thoai: "0911530287" },
        { ma_sinh_vien: "2554104735", ho_ten: "Trần Hương Giang", gioi_tinh: "Nữ", ngay_sinh: "2007-12-18", so_dien_thoai: "0325218656" },
        { ma_sinh_vien: "2554104736", ho_ten: "Nguyễn Thị Diệu Hải", gioi_tinh: "Nữ", ngay_sinh: "2007-01-17", so_dien_thoai: "0984812951" },
        { ma_sinh_vien: "2554104737", ho_ten: "Nguyễn Thị Thu Hằng", gioi_tinh: "Nữ", ngay_sinh: "2007-07-27", so_dien_thoai: "0382404787" },
        { ma_sinh_vien: "2554104738", ho_ten: "Lê Thị Thu Hảo", gioi_tinh: "Nữ", ngay_sinh: "2007-09-07", so_dien_thoai: "0326070239" },
        { ma_sinh_vien: "2554104739", ho_ten: "Nguyễn Thu Hiền", gioi_tinh: "Nữ", ngay_sinh: "2007-12-04", so_dien_thoai: "0398252665" },
        { ma_sinh_vien: "2554104740", ho_ten: "Trần Thị Thu Hiền", gioi_tinh: "Nữ", ngay_sinh: "2007-12-20", so_dien_thoai: "0389306593" },
        { ma_sinh_vien: "2554104741", ho_ten: "Nguyễn Tạ Hiệp", gioi_tinh: "Nam", ngay_sinh: "2006-01-24", so_dien_thoai: "0368505233" },
        { ma_sinh_vien: "2554104742", ho_ten: "Vũ Trọng Hiếu", gioi_tinh: "Nam", ngay_sinh: "2007-03-09", so_dien_thoai: "0348795628", chuc_danh: "Lớp phó đời sống" },
        { ma_sinh_vien: "2554104743", ho_ten: "Đoàn Thị Hương", gioi_tinh: "Nữ", ngay_sinh: "2007-07-01", so_dien_thoai: "0349943406" },
        { ma_sinh_vien: "2554104744", ho_ten: "Lê Thu Hường", gioi_tinh: "Nữ", ngay_sinh: "2007-09-24", so_dien_thoai: "0342548200" },
        { ma_sinh_vien: "2554104745", ho_ten: "Nguyễn Thanh Hường", gioi_tinh: "Nữ", ngay_sinh: "2007-09-04", so_dien_thoai: "0396498158" },
        { ma_sinh_vien: "2554104746", ho_ten: "Phùng Quang Huy", gioi_tinh: "Nam", ngay_sinh: "2007-11-06", so_dien_thoai: "0366601546" },
        { ma_sinh_vien: "2554104747", ho_ten: "Nguyễn Khánh Huyền", gioi_tinh: "Nữ", ngay_sinh: "2007-05-15", so_dien_thoai: "0326401182" },
        { ma_sinh_vien: "2554104748", ho_ten: "Nguyễn Văn Huỳnh", gioi_tinh: "Nam", ngay_sinh: "2007-01-05", so_dien_thoai: "0889389445" },
        { ma_sinh_vien: "2554104749", ho_ten: "Đàm Anh Khôi", gioi_tinh: "Nam", ngay_sinh: "2007-12-28", so_dien_thoai: "0335902508" },
        { ma_sinh_vien: "2554104750", ho_ten: "Nguyễn Hoàng Kỳ", gioi_tinh: "Nam", ngay_sinh: "2007-11-18", so_dien_thoai: "0392718876" },
        { ma_sinh_vien: "2554104751", ho_ten: "Lê Ngọc Diệu Linh", gioi_tinh: "Nữ", ngay_sinh: "2007-08-12", so_dien_thoai: "0355888407" },
        { ma_sinh_vien: "2554104753", ho_ten: "Trần Mai Linh", gioi_tinh: "Nữ", ngay_sinh: "2007-02-17", so_dien_thoai: "0565938011" },
        { ma_sinh_vien: "2554104752", ho_ten: "Nguyễn Thị Thùy Linh", gioi_tinh: "Nữ", ngay_sinh: "2007-01-08", so_dien_thoai: "0976235713" },
        { ma_sinh_vien: "2554104754", ho_ten: "Nguyễn Thị Hương Mai", gioi_tinh: "Nữ", ngay_sinh: "2007-03-22", so_dien_thoai: "0963901584", chuc_danh: "Bí thư" },
        { ma_sinh_vien: "2554104755", ho_ten: "Vũ Thị Ngọc Mai", gioi_tinh: "Nữ", ngay_sinh: "2007-10-15", so_dien_thoai: "0387251510" },
        { ma_sinh_vien: "2554104756", ho_ten: "Lê Văn Mạnh", gioi_tinh: "Nam", ngay_sinh: "2007-04-29", so_dien_thoai: "0889345283" },
        { ma_sinh_vien: "2554104757", ho_ten: "Chu Đức Minh", gioi_tinh: "Nam", ngay_sinh: "2007-04-25", so_dien_thoai: "0762585207" },
        { ma_sinh_vien: "2554104760", ho_ten: "Phạm Quang Minh", gioi_tinh: "Nam", ngay_sinh: "2007-01-05", so_dien_thoai: "0564650999" },
        { ma_sinh_vien: "2554104759", ho_ten: "Hoàng Lê Bảo Minh", gioi_tinh: "Nam", ngay_sinh: "2006-02-27", so_dien_thoai: "0389776538" },
        { ma_sinh_vien: "2554104758", ho_ten: "Đỗ Đức Minh", gioi_tinh: "Nam", ngay_sinh: "2007-11-06", so_dien_thoai: "0372127307" },
        { ma_sinh_vien: "2554104761", ho_ten: "Nguyễn Hà My", gioi_tinh: "Nữ", ngay_sinh: "2007-12-16", so_dien_thoai: "0889038928", chuc_danh: "Lớp phó học tập" },
        { ma_sinh_vien: "2554104762", ho_ten: "Tạ Thiên Mỹ", gioi_tinh: "Nữ", ngay_sinh: "2007-11-14", so_dien_thoai: "0343293207" },
        { ma_sinh_vien: "2554104763", ho_ten: "Nguyễn Nhật Nam", gioi_tinh: "Nam", ngay_sinh: "2006-09-10", so_dien_thoai: "0975561979" },
        { ma_sinh_vien: "2554104764", ho_ten: "Nguyễn Văn Nhất", gioi_tinh: "Nam", ngay_sinh: "2007-04-16", so_dien_thoai: "383372811" },
        { ma_sinh_vien: "2554104765", ho_ten: "Đỗ Thiên Như", gioi_tinh: "Nữ", ngay_sinh: "2007-11-19", so_dien_thoai: "0974465288" },
        { ma_sinh_vien: "2554104766", ho_ten: "Phạm Thị Nhung", gioi_tinh: "Nữ", ngay_sinh: "2007-06-14", so_dien_thoai: "0964786393" },
        { ma_sinh_vien: "2554104767", ho_ten: "Tăng Phương Nhung", gioi_tinh: "Nữ", ngay_sinh: "2007-06-30", so_dien_thoai: "0971804207" },
        { ma_sinh_vien: "2554104768", ho_ten: "Dương Mai Linh Phương", gioi_tinh: "Nữ", ngay_sinh: "2007-06-16", so_dien_thoai: "0988929318" },
        { ma_sinh_vien: "2554104770", ho_ten: "Nguyễn Minh Phương", gioi_tinh: "Nữ", ngay_sinh: "2007-09-17", so_dien_thoai: "0866098700" },
        { ma_sinh_vien: "2554104769", ho_ten: "Lê Hà Phương", gioi_tinh: "Nữ", ngay_sinh: "2007-03-22", so_dien_thoai: "0368628950" },
        { ma_sinh_vien: "2554104772", ho_ten: "Nguyễn Ngọc Tân", gioi_tinh: "Nam", ngay_sinh: "2004-03-22", so_dien_thoai: "0366067135" },
        { ma_sinh_vien: "2554104773", ho_ten: "Đỗ Thị Phương Thảo", gioi_tinh: "Nữ", ngay_sinh: "2007-02-18", so_dien_thoai: "0984788801" },
        { ma_sinh_vien: "2554104774", ho_ten: "Nguyễn Thị Thơm", gioi_tinh: "Nữ", ngay_sinh: "2007-02-15", so_dien_thoai: "0818922207" },
        { ma_sinh_vien: "2554104775", ho_ten: "Nguyễn Lê Hoài Thu", gioi_tinh: "Nữ", ngay_sinh: "2007-01-27", so_dien_thoai: "989504359" },
        { ma_sinh_vien: "2554104777", ho_ten: "Trần Thị Minh Thư", gioi_tinh: "Nữ", ngay_sinh: "2007-12-03", so_dien_thoai: "0868610596" },
        { ma_sinh_vien: "2554104776", ho_ten: "Lê Minh Thư", gioi_tinh: "Nữ", ngay_sinh: "2007-04-14", so_dien_thoai: "0961735410" },
        { ma_sinh_vien: "2554104778", ho_ten: "Ngô Minh Thuận", gioi_tinh: "Nam", ngay_sinh: "2007-01-16", so_dien_thoai: "0326729422" },
        { ma_sinh_vien: "2554104779", ho_ten: "Trần Phương Thúy", gioi_tinh: "Nữ", ngay_sinh: "2007-04-19", so_dien_thoai: "0837118220" },
        { ma_sinh_vien: "2554104780", ho_ten: "Nguyễn Thu Thủy", gioi_tinh: "Nữ", ngay_sinh: "2007-07-25", so_dien_thoai: "0343822490" },
        { ma_sinh_vien: "2554104781", ho_ten: "Trần Thị Thủy", gioi_tinh: "Nữ", ngay_sinh: "2007-01-24", so_dien_thoai: "0867794712" },
        { ma_sinh_vien: "2554104782", ho_ten: "Nguyễn Văn Toàn", gioi_tinh: "Nam", ngay_sinh: "2005-07-18", so_dien_thoai: "0367425212", chuc_danh: "SV xuất sắc đầu vào" },
        { ma_sinh_vien: "2554104783", ho_ten: "Lê Bảo Trâm", gioi_tinh: "Nữ", ngay_sinh: "2007-05-23", so_dien_thoai: "0338835056" },
        { ma_sinh_vien: "2554104786", ho_ten: "Trần Thị Thùy Trang", gioi_tinh: "Nữ", ngay_sinh: "2007-07-31", so_dien_thoai: "0382066007" },
        { ma_sinh_vien: "2554104785", ho_ten: "Nguyễn Thị Minh Trang", gioi_tinh: "Nữ", ngay_sinh: "2007-01-01", so_dien_thoai: "0338525408" },
        { ma_sinh_vien: "2554104784", ho_ten: "Nguyễn Thị Kiều Trang", gioi_tinh: "Nữ", ngay_sinh: "2007-09-02", so_dien_thoai: "0982950207" },
        { ma_sinh_vien: "2554104788", ho_ten: "Phạm Thị Vân", gioi_tinh: "Nữ", ngay_sinh: "2006-01-20", so_dien_thoai: "0355534083" },
        { ma_sinh_vien: "2554104787", ho_ten: "Bùi Thị Thảo Vân", gioi_tinh: "Nữ", ngay_sinh: "2007-07-02", so_dien_thoai: "0388783392" },
        { ma_sinh_vien: "2554104789", ho_ten: "Ngô Phương Việt", gioi_tinh: "Nam", ngay_sinh: "2007-03-31", so_dien_thoai: "0862554003" },
        { ma_sinh_vien: "2554104790", ho_ten: "Vũ Quang Vinh", gioi_tinh: "Nam", ngay_sinh: "2007-11-18", so_dien_thoai: "0936373081" },
        { ma_sinh_vien: "2554104791", ho_ten: "Nguyễn Đăng Vũ", gioi_tinh: "Nam", ngay_sinh: "2007-09-12", so_dien_thoai: "0366584775" },
        { ma_sinh_vien: "2554104792", ho_ten: "Trần Hải Yến", gioi_tinh: "Nữ", ngay_sinh: "2007-05-20", so_dien_thoai: "0339539326" }
      ];

      for (const s of mockStudents) {
        const scores = calculateScores(s as any);
        // Default values for missing fields
        const fullStudent = {
          ...s,
          que_quan: "Chưa cập nhật",
          cho_o_hien_nay: "Chưa cập nhật",
          gmail: `${s.ma_sinh_vien}@gmail.com`,
          email_truong: `${s.ma_sinh_vien}@tlu.edu.vn`,
          chuc_danh: (s as any).chuc_danh || "",
          ghi_chu: "",
          ngay_vao_doan: "",
          ngay_vao_dang: "",
          allow_edit: false,
          academic: { diem_trung_binh: 2.5 + Math.random() * 1.5, so_tin_chi_no: 0, so_mon_truot: 0, so_buoi_vang: 0, vi_pham_thi_cu: false },
          conduct: { diem_ren_luyen: 70 + Math.random() * 30, vi_pham_ky_luat: 0, muc_do_vi_pham: "none" },
          activity: { tham_gia_clb: false, so_hoat_dong_tham_gia: 0, vai_tro: "none", giai_thuong: 0 },
          interaction: { tuong_tac_giang_vien: "medium", phan_hoi_som: true, tinh_than_hoc_tap: 4 },
          ...scores
        };
        await addDoc(collection(db, 'students'), fullStudent);
      }
    };

    // We check again inside to avoid race conditions
    const checkAndAdd = async () => {
      const q = query(collection(db, 'students'));
      const snapshot = await getDocFromServer(doc(db, 'test', 'check')); // Just a dummy check
      // Actually, we already have students in state from the other useEffect
      // but it might be empty initially. Let's use a timeout or a flag.
    };
    
    // Simple way: if students is empty after 2 seconds of being logged in
    const timer = setTimeout(() => {
      if (students.length === 0) {
        addMockData();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, students.length]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-stone-200"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">EduTrack Pro</h1>
          <p className="text-stone-500 mb-8">Hệ thống quản lý lớp học thông minh dành cho Giảng viên & Sinh viên</p>
          <button 
            onClick={handleLogin}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-200"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 bg-white rounded-full p-1" alt="Google" />
            Đăng nhập với Google
          </button>
          <p className="mt-6 text-xs text-stone-400">
            Sử dụng email đã đăng ký để truy cập hệ thống.
          </p>
        </motion.div>
      </div>
    );
  }

  const isAdmin = role === 'admin';
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-stone-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">E</div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">EduTrack Pro</h1>
          </div>

          <nav className="space-y-1">
            {isAdmin ? (
              <>
                <NavItem 
                  icon={<LayoutDashboard size={20} />} 
                  label="Tổng quan" 
                  active={activeTab === 'dashboard'} 
                  onClick={() => { setActiveTab('dashboard'); setSelectedStudentId(null); }} 
                />
                
                <div className="space-y-1">
                  <button 
                    onClick={() => setIsClassMgmtOpen(!isClassMgmtOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-stone-500 hover:bg-stone-50 hover:text-stone-900 rounded-xl transition-all text-sm font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen size={20} />
                      <span>Thông tin chung</span>
                    </div>
                    {isClassMgmtOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {isClassMgmtOpen && (
                    <div className="pl-9 space-y-1">
                      <NavItem 
                        icon={<Users size={18} />} 
                        label="Danh sách lớp" 
                        active={activeTab === 'students'} 
                        onClick={() => { setActiveTab('students'); setSelectedStudentId(null); }} 
                        isSubItem
                      />
                      <NavItem 
                        icon={<UserCheck size={18} />} 
                        label="Ban cán sự lớp" 
                        active={activeTab === 'officers'} 
                        onClick={() => { setActiveTab('officers'); setSelectedStudentId(null); }} 
                        isSubItem
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <button 
                    onClick={() => setIsConductOpen(!isConductOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-stone-500 hover:bg-stone-50 hover:text-stone-900 rounded-xl transition-all text-sm font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <Award size={20} />
                      <span>Điểm rèn luyện</span>
                    </div>
                    {isConductOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {isConductOpen && (
                    <div className="pl-9 space-y-1">
                      <NavItem 
                        icon={<ChevronRight size={14} />} 
                        label="Điểm rèn luyện 25-26" 
                        active={activeTab === 'conduct-25-26'} 
                        onClick={() => { setActiveTab('conduct-25-26'); setSelectedStudentId(null); }} 
                        isSubItem
                      />
                      <NavItem 
                        icon={<ChevronRight size={14} />} 
                        label="Điểm rèn luyện 26-27" 
                        active={activeTab === 'conduct-26-27'} 
                        onClick={() => { setActiveTab('conduct-26-27'); setSelectedStudentId(null); }} 
                        isSubItem
                      />
                      <NavItem 
                        icon={<ChevronRight size={14} />} 
                        label="Điểm rèn luyện 27-28" 
                        active={activeTab === 'conduct-27-28'} 
                        onClick={() => { setActiveTab('conduct-27-28'); setSelectedStudentId(null); }} 
                        isSubItem
                      />
                      <NavItem 
                        icon={<ChevronRight size={14} />} 
                        label="Điểm rèn luyện 28-29" 
                        active={activeTab === 'conduct-28-29'} 
                        onClick={() => { setActiveTab('conduct-28-29'); setSelectedStudentId(null); }} 
                        isSubItem
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <button 
                    onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-stone-500 hover:bg-stone-50 hover:text-stone-900 rounded-xl transition-all text-sm font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 size={20} />
                      <span>Điểm tổng hợp</span>
                    </div>
                    {isSummaryOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {isSummaryOpen && (
                    <div className="pl-9 space-y-1">
                      <NavItem 
                        icon={<ChevronRight size={14} />} 
                        label="Điểm tổng hợp 25-26" 
                        active={activeTab === 'summary-25-26'} 
                        onClick={() => { setActiveTab('summary-25-26'); setSelectedStudentId(null); }} 
                        isSubItem
                      />
                      <NavItem 
                        icon={<ChevronRight size={14} />} 
                        label="Điểm tổng hợp 26-27" 
                        active={activeTab === 'summary-26-27'} 
                        onClick={() => { setActiveTab('summary-26-27'); setSelectedStudentId(null); }} 
                        isSubItem
                      />
                      <NavItem 
                        icon={<ChevronRight size={14} />} 
                        label="Điểm tổng hợp 27-28" 
                        active={activeTab === 'summary-27-28'} 
                        onClick={() => { setActiveTab('summary-27-28'); setSelectedStudentId(null); }} 
                        isSubItem
                      />
                      <NavItem 
                        icon={<ChevronRight size={14} />} 
                        label="Điểm tổng hợp 28-29" 
                        active={activeTab === 'summary-28-29'} 
                        onClick={() => { setActiveTab('summary-28-29'); setSelectedStudentId(null); }} 
                        isSubItem
                      />
                      <NavItem 
                        icon={<ChevronRight size={14} />} 
                        label="Điểm thực tập nghề nghiệp" 
                        active={activeTab === 'summary-internship'} 
                        onClick={() => { setActiveTab('summary-internship'); setSelectedStudentId(null); }} 
                        isSubItem
                      />
                      <NavItem 
                        icon={<ChevronRight size={14} />} 
                        label="Điểm khóa luận tốt nghiệp" 
                        active={activeTab === 'summary-thesis'} 
                        onClick={() => { setActiveTab('summary-thesis'); setSelectedStudentId(null); }} 
                        isSubItem
                      />
                    </div>
                  )}
                </div>

                <NavItem 
                  icon={<AlertTriangle size={20} />} 
                  label="Cảnh báo sớm" 
                  active={activeTab === 'warnings'} 
                  onClick={() => { setActiveTab('warnings'); setSelectedStudentId(null); }} 
                />
                <NavItem 
                  icon={<Star size={20} />} 
                  label="Tiềm năng" 
                  active={activeTab === 'potential'} 
                  onClick={() => { setActiveTab('potential'); setSelectedStudentId(null); }} 
                />
              </>
            ) : (
              <NavItem 
                icon={<UserCircle size={20} />} 
                label="Hồ sơ của tôi" 
                active={activeTab === 'my-profile'} 
                onClick={() => { setActiveTab('my-profile'); if (students.length > 0) setSelectedStudentId(students[0].id); }} 
              />
            )}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-stone-100">
          <div className="flex items-center gap-3 mb-6">
            <img src={user.photoURL || ''} className="w-10 h-10 rounded-full border-2 border-emerald-100" alt="Avatar" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-stone-900 truncate">{user.displayName}</p>
              <p className="text-xs text-stone-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-medium"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
              <h2 className="text-2xl font-bold text-stone-900">
                {activeTab === 'dashboard' && 'Bảng điều khiển'}
                {activeTab === 'students' && 'Danh sách lớp'}
                {activeTab === 'officers' && 'Ban cán sự lớp'}
                {activeTab === 'conduct' && 'Điểm rèn luyện'}
                {activeTab === 'conduct-25-26' && 'Điểm rèn luyện 25-26'}
                {activeTab === 'conduct-26-27' && 'Điểm rèn luyện 26-27'}
                {activeTab === 'conduct-27-28' && 'Điểm rèn luyện 27-28'}
                {activeTab === 'conduct-28-29' && 'Điểm rèn luyện 28-29'}
                {activeTab === 'summary' && 'Điểm tổng hợp'}
                {activeTab === 'summary-25-26' && 'Điểm tổng hợp 25-26'}
                {activeTab === 'summary-26-27' && 'Điểm tổng hợp 26-27'}
                {activeTab === 'summary-27-28' && 'Điểm tổng hợp 27-28'}
                {activeTab === 'summary-28-29' && 'Điểm tổng hợp 28-29'}
                {activeTab === 'summary-internship' && 'Điểm thực tập nghề nghiệp'}
                {activeTab === 'summary-thesis' && 'Điểm khóa luận tốt nghiệp'}
                {activeTab === 'warnings' && 'Hệ thống Cảnh báo sớm'}
                {activeTab === 'potential' && 'Sinh viên Tiềm năng'}
                {activeTab === 'my-profile' && 'Hồ sơ cá nhân'}
              </h2>
              <p className="text-sm text-stone-500">
                {activeTab === 'dashboard' && 'Theo dõi tình hình lớp học thời gian thực'}
                {activeTab === 'students' && `Tổng số ${students.length} sinh viên`}
                {activeTab === 'officers' && `Tổng số ${students.filter(s => s.chuc_danh && s.chuc_danh.trim() !== "").length} cán sự`}
                {activeTab === 'conduct' && 'Quản lý và theo dõi điểm rèn luyện sinh viên'}
                {activeTab.startsWith('conduct-') && 'Theo dõi điểm rèn luyện chi tiết theo năm học'}
                {activeTab === 'summary' && 'Thống kê và tổng hợp kết quả học tập'}
                {activeTab.startsWith('summary-') && 'Thống kê kết quả học tập chi tiết'}
                {activeTab === 'warnings' && 'Phát hiện sinh viên có nguy cơ cao'}
                {activeTab === 'potential' && 'Phát hiện nhân tố xuất sắc'}
                {activeTab === 'my-profile' && 'Kiểm tra và cập nhật thông tin cá nhân'}
              </p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="px-5 py-2.5 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold flex items-center gap-2 transition-all border border-blue-100"
              >
                <FileSpreadsheet size={18} />
                Import Excel
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md shadow-emerald-100"
              >
                <PlusCircle size={18} />
                Thêm sinh viên
              </button>
            </div>
          )}
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {selectedStudentId && selectedStudent ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StudentDetail 
                  student={selectedStudent!} 
                  isAdmin={isAdmin}
                  onBack={isAdmin ? () => setSelectedStudentId(null) : undefined} 
                  onUpdate={async (data) => {
                    const scores = calculateScores(data);
                    await updateDoc(doc(db, 'students', selectedStudentId), { ...data, ...scores });
                  }}
                  onDelete={async (id) => {
                    await deleteDoc(doc(db, 'students', id));
                    setSelectedStudentId(null);
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {activeTab === 'dashboard' && <Dashboard students={students} onSelectStudent={setSelectedStudentId} />}
                {activeTab === 'students' && <StudentList students={students} onSelectStudent={setSelectedStudentId} />}
                {activeTab === 'officers' && <StudentList students={students.filter(s => s.chuc_danh && s.chuc_danh.trim() !== "")} onSelectStudent={setSelectedStudentId} />}
                {activeTab === 'conduct' && <StudentList students={students} onSelectStudent={setSelectedStudentId} />}
                {activeTab.startsWith('conduct-') && <StudentList students={students} onSelectStudent={setSelectedStudentId} />}
                {activeTab === 'summary' && <StudentList students={students} onSelectStudent={setSelectedStudentId} />}
                {activeTab.startsWith('summary-') && <StudentList students={students} onSelectStudent={setSelectedStudentId} />}
                {activeTab === 'warnings' && <StudentList students={students.filter(s => s.risk_level === 'high' || s.risk_level === 'medium')} onSelectStudent={setSelectedStudentId} filterType="risk" />}
                {activeTab === 'potential' && <StudentList students={students.filter(s => s.potential_level !== 'none')} onSelectStudent={setSelectedStudentId} filterType="potential" />}
                {activeTab === 'my-profile' && students.length === 0 && (
                  <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center">
                    <UserCircle size={64} className="mx-auto text-stone-300 mb-4" />
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Không tìm thấy hồ sơ</h3>
                    <p className="text-stone-500">Email {user.email} chưa được đăng ký trong hệ thống sinh viên. Vui lòng liên hệ Giảng viên.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Add Student Modal */}
      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={async (data) => {
          const scores = calculateScores(data);
          await addDoc(collection(db, 'students'), { ...data, ...scores });
          setIsAddModalOpen(false);
        }}
      />

      <ImportExcelModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingIds={new Set(students.map(s => s.ma_sinh_vien))}
        onImport={async (studentsData) => {
          for (const s of studentsData) {
            await addDoc(collection(db, 'students'), s);
          }
          setIsImportModalOpen(false);
        }}
      />
    </div>
  );
}

function NavItem({ icon, label, active, onClick, isSubItem }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, isSubItem?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
        active 
          ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
          : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
      } ${isSubItem ? 'py-2 px-3' : ''}`}
    >
      {icon}
      {label}
    </button>
  );
}
