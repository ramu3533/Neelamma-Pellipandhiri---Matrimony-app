// import { Response } from 'express';
// import pool from '../config/db';
// import { AuthRequest } from '../middleware/authMiddleware';

// // --- NEW FUNCTION TO GET ALL ACCEPTED CHATS ---
// export const getAcceptedInterests = async (req: AuthRequest, res: Response) => {
//   const userId = req.user?.id;
//   try {
//     // This SQL query uses UNION to combine two searches:
//     // 1. Where the current user was the SENDER of an accepted request.
//     // 2. Where the current user was the RECEIVER of an accepted request.
//     // It correctly fetches the OTHER user's details in both cases.
//     const result = await pool.query(
//       `
//       -- Select chats where I was the sender
//       SELECT i.interest_id, i.status, u.user_id, u.first_name, u.last_name, p.image 
//       FROM interests i
//       JOIN users u ON i.receiver_id = u.user_id
//       JOIN profiles p ON u.user_id = p.user_id
//       WHERE i.sender_id = $1 AND i.status = 'accepted'
      
//       UNION
      
//       -- Select chats where I was the receiver
//       SELECT i.interest_id, i.status, u.user_id, u.first_name, u.last_name, p.image 
//       FROM interests i
//       JOIN users u ON i.sender_id = u.user_id
//       JOIN profiles p ON u.user_id = p.user_id
//       WHERE i.receiver_id = $1 AND i.status = 'accepted'
//       `,
//       [userId]
//     );
//     res.json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Failed to fetch accepted interests.' });
//   }
// };

// // --- NO CHANGES TO OTHER FUNCTIONS ---

// export const sendInterest = async (req: AuthRequest, res: Response) => {
//   const senderId = req.user?.id;
//   const { receiverId } = req.body;
//   if (!receiverId) return res.status(400).json({ message: 'Receiver ID is required.' });
//   try {
//     const result = await pool.query('INSERT INTO interests (sender_id, receiver_id, status) VALUES ($1, $2, $3) RETURNING *', [senderId, receiverId, 'pending']);
//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to send interest. You may have already sent one.' });
//   }
// };

// export const getReceivedInterests = async (req: AuthRequest, res: Response) => {
//   const userId = req.user?.id;
//   try {
//     const result = await pool.query(`SELECT i.interest_id, i.status, u.user_id, u.first_name, u.last_name, p.image FROM interests i JOIN users u ON i.sender_id = u.user_id JOIN profiles p ON u.user_id = p.user_id WHERE i.receiver_id = $1 ORDER BY i.created_at DESC`, [userId]);
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch received interests.' });
//   }
// };

// export const getSentInterests = async (req: AuthRequest, res: Response) => {
//   const userId = req.user?.id;
//   try {
//     const result = await pool.query(`SELECT i.interest_id, i.status, u.user_id, u.first_name, u.last_name, p.image FROM interests i JOIN users u ON i.receiver_id = u.user_id JOIN profiles p ON u.user_id = p.user_id WHERE i.sender_id = $1 ORDER BY i.created_at DESC`, [userId]);
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch sent interests.' });
//   }
// };

// export const respondToInterest = async (req: AuthRequest, res: Response) => {
//   const currentUserId = req.user?.id;
//   const { interestId } = req.params;
//   const { status } = req.body;
//   const io = req.io;
//   if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status.' });
//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');
//     const interestUpdate = await client.query('UPDATE interests SET status = $1 WHERE interest_id = $2 AND receiver_id = $3 RETURNING *', [status, interestId, currentUserId]);
//     if (interestUpdate.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).json({ message: 'Interest not found or you are not authorized.' });
//     }
//     const updatedInterest = interestUpdate.rows[0];
//     const { sender_id, receiver_id } = updatedInterest;
//     if (status === 'accepted') {
//       await client.query(`INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) ON CONFLICT (user1_id, user2_id) DO NOTHING`, [Math.min(sender_id, receiver_id), Math.max(sender_id, receiver_id)]);
//     }
//     await client.query('COMMIT');
//     const responder = await client.query('SELECT first_name FROM users WHERE user_id = $1', [currentUserId]);
//     const responderName = responder.rows[0].first_name;
//     io.to(sender_id.toString()).emit('interest_response', { message: `${responderName} has ${status} your interest request.` });
//     const updatedInterestForSender = { ...updatedInterest, user_id: receiver_id };
//     const updatedInterestForReceiver = { ...updatedInterest, user_id: sender_id };
//     io.to(sender_id.toString()).emit('interest_status_updated', updatedInterestForSender);
//     io.to(receiver_id.toString()).emit('interest_status_updated', updatedInterestForReceiver);
//     res.json(updatedInterest);
//   } catch (error) {
//     await client.query('ROLLBACK');
//     res.status(500).json({ message: 'Failed to respond to interest.' });
//   } finally {
//     client.release();
//   }
// };

import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// --- UPDATED: sendInterest now requires premium membership ---
export const sendInterest = async (req: AuthRequest, res: Response) => {
  const senderId = req.user?.id;
  const { receiverId } = req.body;

  if (!receiverId) {
    return res.status(400).json({ message: 'Receiver ID is required.' });
  }

  try {
    // 1. Check if the sender is a premium user
    const userStatusRes = await pool.query('SELECT is_premium FROM users WHERE user_id = $1', [senderId]);
    if (!userStatusRes.rows[0]?.is_premium) {
      return res.status(403).json({ message: 'Sending interest is a premium feature. Please subscribe to continue.' });
    }

    // 2. If premium, proceed to create the interest request
    const result = await pool.query(
      'INSERT INTO interests (sender_id, receiver_id, status) VALUES ($1, $2, $3) RETURNING *',
      [senderId, receiverId, 'pending']
    );
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    if ((error as any).code === '23505') {
        return res.status(409).json({ message: 'You have already sent an interest to this profile.' });
    }
    res.status(500).json({ message: 'Failed to send interest.' });
  }
};

// --- NO CHANGES TO OTHER FUNCTIONS IN THIS FILE ---

export const getReceivedInterests = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const result = await pool.query(`SELECT i.interest_id, i.status, u.user_id, u.first_name, u.last_name, p.image FROM interests i JOIN users u ON i.sender_id = u.user_id JOIN profiles p ON u.user_id = p.user_id WHERE i.receiver_id = $1 ORDER BY i.created_at DESC`, [userId]);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch received interests.' }); }
};

export const getSentInterests = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const result = await pool.query(`SELECT i.interest_id, i.status, u.user_id, u.first_name, u.last_name, p.image FROM interests i JOIN users u ON i.receiver_id = u.user_id JOIN profiles p ON u.user_id = p.user_id WHERE i.sender_id = $1 ORDER BY i.created_at DESC`, [userId]);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch sent interests.' }); }
};

export const respondToInterest = async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const { interestId } = req.params;
  const { status } = req.body;
  const io = req.io;
  if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const interestUpdate = await client.query('UPDATE interests SET status = $1 WHERE interest_id = $2 AND receiver_id = $3 RETURNING *', [status, interestId, currentUserId]);
    if (interestUpdate.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Interest not found or you are not authorized.' });
    }
    const updatedInterest = interestUpdate.rows[0];
    const { sender_id, receiver_id } = updatedInterest;
    if (status === 'accepted') {
      await client.query(`INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) ON CONFLICT (user1_id, user2_id) DO NOTHING`, [Math.min(sender_id, receiver_id), Math.max(sender_id, receiver_id)]);
    }
    await client.query('COMMIT');
    if (io) {
  const responder = await client.query('SELECT first_name FROM users WHERE user_id = $1', [currentUserId]);
  const responderName = responder.rows[0].first_name;
  
  // Notify the original sender of the response
  io.to(sender_id.toString()).emit('interest_response', { 
    message: `${responderName} has ${status} your interest request.` 
  });
  
  // Send a real-time update to both users so their UI can refresh
  const updatedInterestForSender = { ...updatedInterest, user_id: receiver_id };
  const updatedInterestForReceiver = { ...updatedInterest, user_id: sender_id };
  io.to(sender_id.toString()).emit('interest_status_updated', updatedInterestForSender);
  io.to(receiver_id.toString()).emit('interest_status_updated', updatedInterestForReceiver);
}
    res.json(updatedInterest);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Failed to respond to interest.' });
  } finally {
    client.release();
  }
};

export const getAcceptedInterests = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const result = await pool.query(`
      SELECT i.interest_id, i.status, u.user_id, u.first_name, u.last_name, p.image 
      FROM interests i JOIN users u ON i.receiver_id = u.user_id JOIN profiles p ON u.user_id = p.user_id
      WHERE i.sender_id = $1 AND i.status = 'accepted'
      UNION
      SELECT i.interest_id, i.status, u.user_id, u.first_name, u.last_name, p.image 
      FROM interests i JOIN users u ON i.sender_id = u.user_id JOIN profiles p ON u.user_id = p.user_id
      WHERE i.receiver_id = $1 AND i.status = 'accepted'
    `, [userId]);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch accepted interests.' }); }
};
