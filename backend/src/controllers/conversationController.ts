import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// Get a conversation between the logged-in user and another user
export const getConversationByUsers = async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const { otherUserId } = req.params;

  // Ensure IDs are ordered consistently to match the database constraint
  const user1 = Math.min(Number(currentUserId), Number(otherUserId));
  const user2 = Math.max(Number(currentUserId), Number(otherUserId));

  try {
    const result = await pool.query(
      'SELECT conversation_id FROM conversations WHERE user1_id = $1 AND user2_id = $2',
      [user1, user2]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to get conversation", error);
    res.status(500).json({ message: 'Server error' });
  }
};