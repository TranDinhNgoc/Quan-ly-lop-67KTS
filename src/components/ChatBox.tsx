import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { ChatMessage } from '../types';
import { User } from 'firebase/auth';

interface ChatBoxProps {
  studentId: string;
  user: User;
  isAdmin: boolean;
}

export default function ChatBox({ studentId, user, isAdmin }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'chat_messages'),
      where('studentId', '==', studentId),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
    });
    return () => unsubscribe();
  }, [studentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await addDoc(collection(db, 'chat_messages'), {
      studentId,
      senderId: user.uid,
      senderName: isAdmin ? 'Admin' : user.displayName || 'Sinh viên',
      message: newMessage,
      timestamp: serverTimestamp(),
      read: false
    });
    setNewMessage('');
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border h-[400px] flex flex-col">
      <h2 className="text-xl font-bold mb-4">Trao đổi với {isAdmin ? 'sinh viên' : 'Admin'}</h2>
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`p-3 rounded-2xl max-w-[80%] ${msg.senderId === user.uid ? 'bg-emerald-100 ml-auto' : 'bg-stone-100'}`}>
            <p className="text-xs font-bold text-stone-500">{msg.senderName}</p>
            <p>{msg.message}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-3 border rounded-xl"
          placeholder="Nhập tin nhắn..."
        />
        <button onClick={sendMessage} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">Gửi</button>
      </div>
    </div>
  );
}
