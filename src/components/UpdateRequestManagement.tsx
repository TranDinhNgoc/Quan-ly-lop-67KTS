import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UpdateRequest, Student } from '../types';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function UpdateRequestManagement() {
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'update_requests'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UpdateRequest)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (request: UpdateRequest) => {
    const cleanData = Object.fromEntries(
      Object.entries(request.requestedData).filter(([_, v]) => v !== undefined)
    );
    await updateDoc(doc(db, 'students', request.studentId), cleanData);
    await updateDoc(doc(db, 'update_requests', request.id), { status: 'approved' });
  };

  const handleReject = async (request: UpdateRequest) => {
    await updateDoc(doc(db, 'update_requests', request.id), { status: 'rejected' });
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold">Quản lý yêu cầu cập nhật</h2>
      <div className="space-y-4">
        {requests.map(req => (
          <div key={req.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="font-bold text-lg mb-2">{req.studentName} ({req.studentEmail})</h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="font-bold text-stone-500">Thông tin mới:</p>
                <pre className="bg-stone-50 p-2 rounded">{JSON.stringify(req.requestedData, null, 2)}</pre>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleApprove(req)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl flex items-center gap-2"><CheckCircle2 size={18} /> Phê duyệt</button>
              <button onClick={() => handleReject(req)} className="px-4 py-2 bg-red-600 text-white rounded-xl flex items-center gap-2"><XCircle size={18} /> Từ chối</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
