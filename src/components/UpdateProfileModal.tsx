import React, { useState } from 'react';
import { Student } from '../types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export default function UpdateProfileModal({ isOpen, onClose, student }: UpdateProfileModalProps) {
  const [formData, setFormData] = useState<Partial<Student>>({});

  if (!isOpen) return null;

  const handleSubmit = async () => {
    await addDoc(collection(db, 'update_requests'), {
      studentId: student.id,
      studentName: student.ho_ten,
      studentEmail: student.gmail,
      studentEmailTruong: student.email_truong,
      requestedData: formData,
      status: 'pending',
      timestamp: serverTimestamp()
    });
    
    await addDoc(collection(db, 'notifications'), {
      type: 'update_request',
      message: `Sinh viên ${student.ho_ten} yêu cầu cập nhật thông tin.`,
      studentId: student.id,
      read: false,
      timestamp: serverTimestamp()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Yêu cầu cập nhật thông tin</h2>
        <input 
          type="text"
          placeholder="Số điện thoại mới..."
          className="w-full p-3 border rounded-xl mb-4"
          onChange={(e) => setFormData({...formData, so_dien_thoai: e.target.value})}
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-stone-100 rounded-xl">Hủy</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">Gửi yêu cầu</button>
        </div>
      </div>
    </div>
  );
}
