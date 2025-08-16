import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import pool from './config/db';
import fs from 'fs';
import { promisify } from 'util';

import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import successStoryRoutes from './routes/successStoryRoutes';
import contactRoutes from './routes/contactRoutes';
import interestRoutes from './routes/interestRoutes';
import conversationRoutes from './routes/conversationRoutes';
import messageRoutes from './routes/messageRoutes';
import likeRoutes from './routes/likeRoutes';
import stripeRoutes from './routes/stripeRoutes';

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

dotenv.config();

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:5173', // Your local frontend
  process.env.FRONTEND_URL  // Your deployed Vercel frontend URL from .env
].filter(Boolean); 

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true 
};

app.use(cors({
  origin: process.env.FRONTEND_URL, 
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }
});
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/success-stories', successStoryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/stripe', stripeRoutes);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId.toString());
    console.log(`User ${socket.id} (User ID: ${userId}) joined room ${userId}`);
  });

// THIS IS THE CORRECT REPLACEMENT BLOCK
socket.on('send_message', async (data) => {
  try {
    const { senderId, receiverId, message } = data;

    // The backend correctly finds the conversation ID itself.
    const user1 = Math.min(senderId, receiverId);
    const user2 = Math.max(senderId, receiverId);
    const convoRes = await pool.query('SELECT conversation_id FROM conversations WHERE user1_id = $1 AND user2_id = $2', [user1, user2]);
    
    // Proceed only if a conversation exists between the two users.
    if (convoRes.rows.length > 0) {
      const conversationId = convoRes.rows[0].conversation_id;
      
      // Insert the message and return the newly created row.
      const messageRes = await pool.query(
        'INSERT INTO messages (conversation_id, sender_id, receiver_id, message_text) VALUES ($1, $2, $3, $4) RETURNING message_id, conversation_id, sender_id, receiver_id, message_text as message, created_at, is_read', 
        [conversationId, senderId, receiverId, message]
      );
      const newMessage = messageRes.rows[0];

      // Emit the full message object back to both users.
      io.to(receiverId.toString()).emit('receive_message', newMessage);
      io.to(senderId.toString()).emit('receive_message', newMessage);
      
      // Send a specific notification for push notifications.
      const senderRes = await pool.query('SELECT first_name FROM users WHERE user_id = $1', [senderId]);
      io.to(receiverId.toString()).emit('new_message_notification', {
        senderName: senderRes.rows[0].first_name,
        message: newMessage.message,
      });
    } else {
      console.error(`No conversation found between users ${senderId} and ${receiverId}.`);
    }
  } catch (error) { 
    console.error("Failed to save or send message:", error); 
  }
});

  socket.on('mark_as_read', async (data) => {
    try {
      const { conversationId, currentUserId, otherUserId } = data;

      const res = await pool.query(
        'UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND sender_id = $2 AND receiver_id = $3 AND is_read = FALSE RETURNING message_id',
        [conversationId, otherUserId, currentUserId]
      );
      
      const updatedMessageIds = res.rows.map(row => row.message_id);

      if (updatedMessageIds.length > 0) {
        io.to(otherUserId.toString()).emit('messages_read', { 
          conversationId,
          updatedMessageIds
        });
      }
    } catch(error) {
        console.error("Failed to mark messages as read via socket:", error);
    }
  });
  
  socket.on('send_interest_notification', (data) => {
    io.to(data.receiverId.toString()).emit('new_interest_request', {
      message: `${data.senderName} has sent you an interest request!`,
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0'; // Explicitly listen on all network interfaces

server.listen(Number(PORT), HOST, () => {
  console.log(`Server with Socket.IO running on http://${HOST}:${PORT}`);
});

declare global {
  namespace Express {
    export interface Request {
      io: Server;
    }
  }
}
