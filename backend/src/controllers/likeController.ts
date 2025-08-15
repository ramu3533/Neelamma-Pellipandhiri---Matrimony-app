import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// Like a user's profile
export const likeProfile = async (req: AuthRequest, res: Response) => {
  const likerId = req.user?.id;
  const { profileUserId } = req.params; // The ID of the user whose profile is being liked

  if (!profileUserId) {
    return res.status(400).json({ message: 'Liked user ID is required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO likes (liker_id, liked_id) VALUES ($1, $2) RETURNING *',
      [likerId, profileUserId]
    );

    // After successfully liking, emit a notification
    const liker = await pool.query('SELECT first_name FROM users WHERE user_id = $1', [likerId]);
    const likerName = liker.rows[0].first_name;
    req.io.to(profileUserId.toString()).emit('new_like_notification', {
      message: `${likerName} liked your profile!`
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    // 23505 is the PostgreSQL error code for unique violation
    if ((error as any).code === '23505') {
        return res.status(409).json({ message: 'You have already liked this profile.' });
    }
    res.status(500).json({ message: 'Failed to like profile.' });
  }
};

// Get a list of users who liked the current user's profile
export const getReceivedLikes = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.first_name, u.last_name, p.image
       FROM likes l
       JOIN users u ON l.liker_id = u.user_id
       JOIN profiles p ON u.user_id = p.user_id
       WHERE l.liked_id = $1
       ORDER BY l.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch received likes.' });
  }
};

// Get a list of profiles that the current user has liked
export const getSentLikes = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const result = await pool.query(
      `SELECT liked_id FROM likes WHERE liker_id = $1`,
      [userId]
    );
    // Return an array of just the user IDs for easy lookup on the frontend
    res.json(result.rows.map(row => row.liked_id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch sent likes.' });
  }
};