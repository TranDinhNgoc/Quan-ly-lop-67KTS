import React from 'react';
import { Clock, User, AlertCircle, CheckCircle, PlusCircle, Trash2, Edit } from 'lucide-react';
import { HistoryRecord } from '../types';
import { formatDate } from '../utils/format';

interface HistoryProps {
  history: HistoryRecord[];
}

export default function History({ history }: HistoryProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'create': return <PlusCircle className="text-emerald-500" size={20} />;
      case 'update': return <Edit className="text-blue-500" size={20} />;
      case 'delete': return <Trash2 className="text-red-500" size={20} />;
      default: return <Clock className="text-stone-400" size={20} />;
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '---';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Clock size={24} className="text-emerald-600" />
            Lịch sử thay đổi & Thông báo
          </h3>
          <p className="text-stone-500 text-sm mt-1">Theo dõi tất cả các thay đổi trong hệ thống</p>
        </div>

        <div className="divide-y divide-stone-100">
          {history.length === 0 ? (
            <div className="p-12 text-center">
              <Clock size={48} className="mx-auto text-stone-200 mb-4" />
              <p className="text-stone-500">Chưa có lịch sử thay đổi nào.</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="p-6 hover:bg-stone-50 transition-colors">
                <div className="flex gap-4">
                  <div className="mt-1">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-stone-900">{item.message}</h4>
                      <span className="text-xs text-stone-400 font-medium">{formatTimestamp(item.timestamp)}</span>
                    </div>
                    <p className="text-sm text-stone-600 mb-3">
                      Sinh viên: <span className="font-semibold">{item.studentName}</span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-100 w-fit px-3 py-1.5 rounded-full">
                      <User size={12} />
                      Thực hiện bởi: <span className="font-bold text-stone-700">{item.changedByName}</span>
                    </div>
                    {item.details && (
                      <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-100">
                        <p className="text-[10px] font-bold text-stone-400 uppercase mb-2">Chi tiết thay đổi</p>
                        <pre className="text-xs text-stone-600 overflow-x-auto whitespace-pre-wrap font-mono">
                          {item.details}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
