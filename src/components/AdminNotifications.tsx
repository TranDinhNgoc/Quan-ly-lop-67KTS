import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { UpdateRequest } from '../types';

export default function AdminNotifications() {
  const [requests, setRequests] = useState<UpdateRequest[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'update_requests'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UpdateRequest)));
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (request: UpdateRequest) => {
    await updateDoc(doc(db, 'update_requests', request.id), { status: 'approved' });
    const cleanData = Object.fromEntries(
      Object.entries(request.requestedData).filter(([_, v]) => v !== undefined)
    );
    await updateDoc(doc(db, 'students', request.studentId), cleanData);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border">
      <h2 className="text-xl font-bold mb-4">Yêu cầu cập nhật từ sinh viên</h2>
      {requests.map(req => (
        <div key={req.id} className="p-4 border rounded-xl mb-3 flex justify-between items-center">
          <div>
            <p className="font-bold">{req.studentName}</p>
            <p className="text-sm text-stone-500">Yêu cầu thay đổi: {JSON.stringify(req.requestedData)}</p>
          </div>
          <button onClick={() => handleApprove(req)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">Duyệt</button>
        </div>
      ))}
    </div>
  );
}
