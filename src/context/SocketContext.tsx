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

  // THIS IS THE CORRECT REPLACEMENT BLOCK
useEffect(() => {
  // If the user is not logged in, there is nothing to do.
  if (!user) {
    // If a socket connection already exists, disconnect it.
    if (socket) {
      socket.close();
      setSocket(null);
    }
    return;
  }

  // --- THIS IS THE CRITICAL CONNECTION LOGIC ---
  // Connect to the backend using the environment variable.
  const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
    // Force WebSocket transport for reliability on cloud platforms.
    transports: ['websocket'],
    // Ensure authentication token is sent if needed in the future.
    withCredentials: true,
  });

  setSocket(newSocket);

  // Join the user-specific room for notifications.
  newSocket.emit('join_room', user.user_id);

  // --- Notification Listeners (Push Notifications, etc.) ---
  newSocket.on('new_interest_request', (data) => {
    showNotification('New Interest!', { body: data.message });
  });

  newSocket.on('interest_response', (data) => {
    showNotification('Interest Response', { body: data.message });
  });
  
  newSocket.on('new_message_notification', (data) => {
    showNotification(`New Message from ${data.senderName}`, {
      body: data.message,
      icon: '/favicon.ico'
    });
  });

  // Cleanup function to run when the component unmounts or user changes.
  return () => {
    newSocket.close();
  };
}, [user]); // This effect ONLY re-runs when the user logs in or out.

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
