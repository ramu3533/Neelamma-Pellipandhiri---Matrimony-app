import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

//Helper function to handle push notifications
const showNotification = (title: string, options: NotificationOptions) => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, options);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, options);
        }
      });
    }
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
     if(user && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    if (user) {
      // Establish connection when user logs in
      const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
          transports: ['websocket'] // Explicitly use websockets for better reliability
      });
      setSocket(newSocket);

      // Join a personal room for notifications
      newSocket.emit('join_room', user.user_id);

      // Listen for notifications
      newSocket.on('new_interest_request', (data) => {
          alert(data.message); // Simple alert for now
      });

      newSocket.on('interest_response', (data) => {
          alert(data.message); // Simple alert for now
      });
      newSocket.on('new_message_notification', (data) => {
          showNotification(`New Message from ${data.senderName}`, {
              body: data.message,
              icon: '/favicon.ico' // Optional: path to an icon
          });
      });

      // Cleanup on logout
      return () => {
        newSocket.close();
      };
    } else {
      // If there's no user, disconnect
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
