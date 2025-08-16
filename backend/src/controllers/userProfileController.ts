import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';


const processImage = async (file: Express.Multer.File) => {
  const newFilename = `${file.fieldname}-${Date.now()}.webp`;
  const newPath = path.join('uploads/', newFilename);

  await sharp(file.path)
    .resize(800, 800, { fit: 'cover' }) // Resize to a max of 800x800
    .toFormat('webp')                 // Convert to modern, efficient WebP format
    .webp({ quality: 80 })            // Set WebP quality
    .toFile(newPath);

  // Delete the original temporary file
  fs.unlinkSync(file.path);

  return newPath.replace(/\\/g, "/"); // Return the new, optimized path
};

// Get the logged-in user's own complete profile for the dashboard
export const getMyProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    try {
        const result = await pool.query(
            `
            SELECT
                p.*,
                u.about_me,
                COALESCE(
                  (SELECT json_agg(json_build_object('image_id', pi.image_id, 'image_url', pi.image_url) ORDER BY pi.created_at DESC)
                   FROM profile_images pi
                   WHERE pi.user_id = p.user_id),
                  '[]'::json
                ) AS images
            FROM profiles p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.user_id = $1
            `,
            [userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profile not found for this user.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Failed to get user profile", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Dedicated function to upload/update the MAIN profile picture
export const uploadMainProfilePicture = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file.' });
    }
    
    try {
        const optimizedImageUrl = await processImage(req.file);
        
        const result = await pool.query(
            'UPDATE profiles SET image = $1 WHERE user_id = $2 RETURNING image',
            [optimizedImageUrl, userId]
        );
        res.status(200).json({
            message: 'Profile picture updated successfully.',
            image: result.rows[0].image
        });
    } catch (error) {
        console.error("Failed to update main profile picture", error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Sets an existing gallery image as the main profile picture
export const setMainProfilePicture = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ message: 'Image URL is required.' });
    }

    try {
        const result = await pool.query(
            'UPDATE profiles SET image = $1 WHERE user_id = $2 RETURNING image',
            [imageUrl, userId]
        );
        res.status(200).json({ message: 'Profile picture updated successfully.', image: result.rows[0].image });
    } catch (error) {
        console.error("Failed to set main profile picture", error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Upload multiple images to the gallery
export const uploadProfileImages = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'Please upload at least one file.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const file of files) {
      const optimizedImageUrl = await processImage(file);
      await client.query(
        'INSERT INTO profile_images (user_id, image_url) VALUES ($1, $2)',
        [userId, optimizedImageUrl]
      );
    }
    await client.query('COMMIT');

    const newImages = await client.query('SELECT image_id, image_url FROM profile_images WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.status(201).json({
        message: 'Images uploaded successfully',
        images: newImages.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Image upload failed", error);
    res.status(500).json({ message: 'Server error during image upload.' });
  } finally {
    client.release();
  }
};
// Delete a single profile image from the gallery
export const deleteProfileImage = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { imageId } = req.params;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const imageRes = await client.query(
            'SELECT image_url FROM profile_images WHERE image_id = $1 AND user_id = $2',
            [imageId, userId]
        );

        if (imageRes.rows.length === 0) {
            return res.status(404).json({ message: 'Image not found or you are not authorized to delete it.' });
        }

        const imageUrl = imageRes.rows[0].image_url;
        
        await client.query('DELETE FROM profile_images WHERE image_id = $1', [imageId]);

        const filePath = path.join(__dirname, '../../', imageUrl);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Failed to delete image file:", err);
            }
        });
        
        // Check if the deleted image was the main profile picture and clear it if so
        await client.query(`UPDATE profiles SET image = NULL WHERE user_id = $1 AND image = $2`, [userId, imageUrl]);

        await client.query('COMMIT');
        res.status(200).json({ message: 'Image deleted successfully.' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Image deletion failed", error);
        res.status(500).json({ message: 'Server error during image deletion.' });
    } finally {
        client.release();
    }
};

// THIS IS THE DEFINITIVE REPLACEMENT FUNCTION
export const updateProfileInterests = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  // We expect req.body to be { interests: [...] }
  let { interests } = req.body; 

  try {
    // --- THIS IS THE CRITICAL FIX ---
    // Defensively check the type of 'interests'. If it's a string, parse it.
    // This handles cases where middleware or other processes might stringify the array.
    if (typeof interests === 'string') {
      try {
        interests = JSON.parse(interests);
      } catch (e) {
        return res.status(400).json({ message: 'Interests string is not valid JSON.' });
      }
    }

    // Now, perform the validation check on the (potentially parsed) interests.
    if (!Array.isArray(interests)) {
      return res.status(400).json({ message: 'Interests must be an array of strings.' });
    }

    // The 'pg' driver correctly handles JS arrays. Pass it directly.
    await pool.query(
      'UPDATE profiles SET interests = $1 WHERE user_id = $2',
      [interests, userId]
    );
    
    res.status(200).json({ message: 'Interests updated successfully' });
  } catch (error) {
    console.error("Failed to update interests", error);
    // Add more detailed logging for debugging if needed
    if (error instanceof Error) {
        console.error("Error details:", error.message);
    }
    res.status(500).json({ message: 'Server error' });
  }
};
