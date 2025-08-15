import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// Get all messages for a given conversation
export const getMessagesForConversation = async (req: AuthRequest, res: Response) => {
  const { conversationId } = req.params;
  try {
    const result = await pool.query(
      'SELECT sender_id, message_text as message FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to get messages", error);
    res.status(500).json({ message: 'Server error' });
  }
};


//Mark messages in a conversation as read
export const markMessagesAsRead = async (req: AuthRequest, res: Response) => {
    const { conversationId } = req.params;
    const currentUserId = req.user?.id;

    try {
        await pool.query(
            'UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND receiver_id = $2 AND is_read = FALSE',
            [conversationId, currentUserId]
        );
        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error("Failed to mark messages as read", error);
        res.status(500).json({ message: 'Server error' });
    }
};