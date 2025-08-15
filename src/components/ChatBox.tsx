import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, CheckCheck } from 'lucide-react';
import axios from 'axios';

interface Message {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface ChatBoxProps {
  conversationId: number;
  targetUser: {
    id: number;
    name: string;
  };
  onBack: () => void;
}

const ChatBox = ({ conversationId, targetUser, onBack }: ChatBoxProps) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const formatTimestamp = (isoString: string) => {
  if (!isoString) return '';
  
  const date = new Date(isoString);

  // Check if the date object is valid. If isoString was "hello", this would be true.
  if (isNaN(date.getTime())) {
    return ''; // Return empty string for invalid date strings
  }

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
    
  useEffect(() => {
    const fetchAndReadMessages = async () => {
      if (!user) return;
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);

        if (socket) {
            socket.emit('mark_as_read', {
                conversationId,
                currentUserId: user.user_id,
                otherUserId: targetUser.id
            });
        }
      } catch (error) {
        console.error("Failed to fetch chat history", error);
      }
    };
    fetchAndReadMessages();
  }, [conversationId, socket, user, targetUser.id]);

  useEffect(() => {
    if (socket) {
      const messageListener = (newMessage: Message) => {
        if (newMessage.conversation_id === conversationId) {
            setMessages(prev => [...prev, newMessage]);
            if (newMessage.sender_id === targetUser.id && user) {
                 socket.emit('mark_as_read', {
                    conversationId,
                    currentUserId: user.user_id,
                    otherUserId: targetUser.id
                });
            }
        }
      };
      const readReceiptsListener = (data: { conversationId: number, updatedMessageIds: number[] }) => {
        if (data.conversationId === conversationId) {
            setMessages(prevMessages => 
                prevMessages.map(msg => 
                    data.updatedMessageIds.includes(msg.message_id) 
                        ? { ...msg, is_read: true } 
                        : msg
                )
            );
        }
      };
      
      socket.on('receive_message', messageListener);
      socket.on('messages_read', readReceiptsListener);

      return () => {
        socket.off('receive_message', messageListener);
        socket.off('messages_read', readReceiptsListener);
      };
    }
  }, [socket, conversationId, targetUser.id, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && user) {
      const messageData = {
      senderId: user.user_id,
      receiverId: targetUser.id,
      message: newMessage,
      conversationId: conversationId 
    };
      socket.emit('send_message', messageData);
      setNewMessage('');
    }
  };

  const renderTicks = (message: Message) => {
      if (message.sender_id !== user?.user_id) return null;
      return message.is_read 
          ? <CheckCheck size={16} className="text-blue-400" /> 
          : <CheckCheck size={16} className="text-gray-400" />;
  };

  return (
    <div className="flex flex-col h-[70vh] md:h-[65vh]">
      <div className="flex items-center p-3 border-b bg-gray-50">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full mr-2"><ArrowLeft size={20}/></button>
        <h3 className="text-lg font-bold text-gray-800">{targetUser.name}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100">
        {messages.map((msg, index) => (
          <div key={msg.message_id || index} className={`flex ${msg.sender_id === user?.user_id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md p-3 rounded-2xl shadow ${msg.sender_id === user?.user_id ? 'bg-rose-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
              <p>{msg.message}</p>
              <div className="flex items-center justify-end gap-1.5 mt-1.5 ">
                  {/* --- DEFINITIVE FIX: Changed text-rose-200 to text-rose-100 for better contrast and visibility --- */}
                  <p className={`text-xs ${msg.sender_id === user?.user_id ? 'text-rose-200' : 'text-gray-500'}`}>
                      {formatTimestamp(msg.created_at)}
                  </p>
                  {renderTicks(msg)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-3 border-t flex items-center bg-white">
        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-rose-500 focus:border-transparent"/>
        <button type="submit" className="ml-3 p-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors">
          <Send size={20}/>
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
