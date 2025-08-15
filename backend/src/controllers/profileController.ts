// import { Request, Response } from 'express';
// import pool from '../config/db';
// import { AuthRequest } from '../middleware/authMiddleware';

// // --- NEW FUNCTION: Gets ALL profiles for counting, bypassing the limit ---
// export const getAllProfiles = async (req: AuthRequest, res: Response) => {
//   try {
//     const result = await pool.query('SELECT user_id FROM profiles'); // Only need IDs for counting
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Failed to get all profiles count", error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Gets a limited list of profiles for the browse page view
// export const getProfiles = async (req: AuthRequest, res: Response) => {
//   const currentUserId = req.user?.id;
//   try {
//     const userStatusRes = await pool.query('SELECT is_premium FROM users WHERE user_id = $1', [currentUserId]);
//     const isPremium = userStatusRes.rows[0]?.is_premium || false;
//     let query;
//     if (isPremium) {
//       query = 'SELECT * FROM profiles';
//     } else {
//       query = 'SELECT * FROM profiles LIMIT 6';
//     }
//     const result = await pool.query(query);
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Failed to get profiles", error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Gets all details for a single profile for the popup modal
// export const getSingleProfile = async (req: AuthRequest, res: Response) => {
//   const { userId: profileToViewId } = req.params;
//   const currentUserId = req.user?.id;
//   const client = await pool.connect();
//   try {
//     const userStatusRes = await client.query('SELECT is_premium, profile_views_count FROM users WHERE user_id = $1', [currentUserId]);
//     const { is_premium, profile_views_count } = userStatusRes.rows[0];

//     if (!is_premium && profile_views_count >= 6) {
//       client.release();
//       return res.status(403).json({ 
//         message: 'You have reached your free profile view limit. Please subscribe to view more profiles.',
//         limitReached: true
//       });
//     }

//     const profileResult = await client.query(
//       `
//       SELECT
//         p.*, u.about_me,
//         COALESCE((SELECT json_agg(json_build_object('image_id', pi.image_id, 'image_url', pi.image_url) ORDER BY pi.created_at DESC)
//            FROM profile_images pi WHERE pi.user_id = p.user_id), '[]'::json) AS images
//       FROM profiles p JOIN users u ON p.user_id = u.user_id
//       WHERE p.user_id = $1
//       `,
//       [profileToViewId]
//     );

//     if (profileResult.rows.length === 0) {
//       client.release();
//       return res.status(404).json({ message: 'Profile not found.' });
//     }

//     if (!is_premium) {
//       await client.query('UPDATE users SET profile_views_count = profile_views_count + 1 WHERE user_id = $1', [currentUserId]);
//     }
    
//     client.release();
//     res.json(profileResult.rows[0]);
//   } catch (error) {
//     client.release();
//     console.error("Failed to get single profile:", error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// import { Request, Response } from 'express';
// import pool from '../config/db';
// import { AuthRequest } from '../middleware/authMiddleware';

// // --- NEW FUNCTION: Gets ALL profiles for counting, bypassing the limit ---
// export const getAllProfiles = async (req: AuthRequest, res: Response) => {
//   try {
//     const result = await pool.query('SELECT user_id FROM profiles');
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Failed to get all profiles count", error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // --- DEFINITIVE FIX: getProfiles now correctly handles premium vs. non-premium users ---
// export const getProfiles = async (req: AuthRequest, res: Response) => {
//   const currentUserId = req.user?.id;

//   try {
//     const userStatusRes = await pool.query('SELECT is_premium FROM users WHERE user_id = $1', [currentUserId]);
//     const isPremium = userStatusRes.rows[0]?.is_premium || false;

//     let query;
//     // If the user is premium, fetch all profiles.
//     if (isPremium) {
//       query = 'SELECT * FROM profiles';
//     } else {
//       // If the user is NOT premium, fetch only the first 6 profiles.
//       query = 'SELECT * FROM profiles LIMIT 6';
//     }

//     const result = await pool.query(query);
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Failed to get profiles", error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Gets all details for a single profile for the popup modal
// export const getSingleProfile = async (req: AuthRequest, res: Response) => {
//   const { userId: profileToViewId } = req.params;
//   const currentUserId = req.user?.id;
//   const client = await pool.connect();

//   try {
//     const userStatusRes = await client.query('SELECT is_premium, profile_views_count FROM users WHERE user_id = $1', [currentUserId]);
//     const { is_premium, profile_views_count } = userStatusRes.rows[0];

//     // This check is mainly for the popup modal now.
//     if (!is_premium && profile_views_count >= 6) {
//       client.release();
//       return res.status(403).json({ 
//         message: 'You have reached your free profile view limit. Please subscribe to view more profiles.',
//         limitReached: true
//       });
//     }

//     const profileResult = await client.query(
//       `
//       SELECT
//         p.*, u.about_me,
//         COALESCE(
//           (SELECT json_agg(json_build_object('image_id', pi.image_id, 'image_url', pi.image_url) ORDER BY pi.created_at DESC)
//            FROM profile_images pi WHERE pi.user_id = p.user_id), '[]'::json
//         ) AS images
//       FROM profiles p JOIN users u ON p.user_id = u.user_id
//       WHERE p.user_id = $1
//       `,
//       [profileToViewId]
//     );

//     if (profileResult.rows.length === 0) {
//       client.release();
//       return res.status(404).json({ message: 'Profile not found.' });
//     }

//     if (!is_premium) {
//       await client.query('UPDATE users SET profile_views_count = profile_views_count + 1 WHERE user_id = $1', [currentUserId]);
//     }
    
//     client.release();
//     res.json(profileResult.rows[0]);
//   } catch (error) {
//     client.release();
//     console.error("Failed to get single profile:", error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// Gets ALL profiles for counting, bypassing the limit
export const getAllProfiles = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT user_id FROM profiles');
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to get all profiles count", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Gets a limited (or full) list of profiles based on subscription status
export const getProfiles = async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?.id;
  try {
    const userStatusRes = await pool.query('SELECT is_premium FROM users WHERE user_id = $1', [currentUserId]);
    const isPremium = userStatusRes.rows[0]?.is_premium || false;

    let query;
    if (isPremium) {
      query = 'SELECT * FROM profiles';
    } else {
      query = 'SELECT * FROM profiles LIMIT 6';
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to get profiles", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Gets all details for a single profile, enforcing the view limit for the modal
export const getSingleProfile = async (req: AuthRequest, res: Response) => {
  const { userId: profileToViewId } = req.params;
  const currentUserId = req.user?.id;
  const client = await pool.connect();
  try {
    const userStatusRes = await client.query('SELECT is_premium, profile_views_count FROM users WHERE user_id = $1', [currentUserId]);
    const { is_premium, profile_views_count } = userStatusRes.rows[0];

    if (!is_premium && profile_views_count >= 6) {
      client.release();
      return res.status(403).json({ 
        message: 'You have reached your free profile view limit. Please subscribe to view more profiles.',
        limitReached: true
      });
    }

    const profileResult = await client.query(
      `
      SELECT
        p.*, u.about_me,
        COALESCE((SELECT json_agg(json_build_object('image_id', pi.image_id, 'image_url', pi.image_url) ORDER BY pi.created_at DESC)
           FROM profile_images pi WHERE pi.user_id = p.user_id), '[]'::json) AS images
      FROM profiles p JOIN users u ON p.user_id = u.user_id
      WHERE p.user_id = $1
      `,
      [profileToViewId]
    );

    if (profileResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: 'Profile not found.' });
    }

    if (!is_premium) {
      await client.query('UPDATE users SET profile_views_count = profile_views_count + 1 WHERE user_id = $1', [currentUserId]);
    }
    
    client.release();
    res.json(profileResult.rows[0]);
  } catch (error) {
    client.release();
    console.error("Failed to get single profile:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};