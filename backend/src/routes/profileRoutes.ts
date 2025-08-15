// import { Router } from 'express';
// import multer from 'multer';
// import path from 'path';
// import { getProfiles, getSingleProfile ,getAllProfiles } from '../controllers/profileController';
// import {
//   getMyProfile,
//   updateProfileInterests,
//   uploadProfileImages,
//   deleteProfileImage,
//   setMainProfilePicture,
//   uploadMainProfilePicture, // Import the new, dedicated upload function
// } from '../controllers/userProfileController';
// import { protect } from '../middleware/authMiddleware';

// const router = Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`),
// });

// const fileFilter = (req: any, file: any, cb: any) => {
//   const allowedTypes = /jpeg|jpg|png|gif|webp/;
//   if (allowedTypes.test(file.mimetype) && allowedTypes.test(path.extname(file.originalname).toLowerCase())) {
//     return cb(null, true);
//   }
//   cb('Error: File type not allowed!');
// };

// const upload = multer({ storage, fileFilter });

// // --- UPDATED ROUTES ---
// router.get('/all', protect, getAllProfiles);
// router.get('/me', protect, getMyProfile);
// router.get('/:userId', protect, getSingleProfile);
// router.get('/', protect, getProfiles);
// router.put('/interests', protect, updateProfileInterests);

// // Route for setting an existing gallery image as the main profile picture
// router.put('/picture', protect, setMainProfilePicture);

// // Route for UPLOADING a new main profile picture (e.g., from the cropper)
// router.post('/picture', protect, upload.single('profileImage'), uploadMainProfilePicture);

// // Route for uploading multiple images to the gallery
// router.post('/images', protect, upload.array('profileImages', 5), uploadProfileImages);

// // Route for deleting a single image from the gallery
// router.delete('/images/:imageId', protect, deleteProfileImage);

// export default router;

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getProfiles, getSingleProfile, getAllProfiles } from '../controllers/profileController';
import {
  getMyProfile,
  updateProfileInterests,
  uploadProfileImages,
  deleteProfileImage,
  setMainProfilePicture,
  uploadMainProfilePicture,
} from '../controllers/userProfileController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Multer configuration for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`),
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  if (allowedTypes.test(file.mimetype) && allowedTypes.test(path.extname(file.originalname).toLowerCase())) {
    return cb(null, true);
  }
  cb('Error: File type not allowed!');
};

const upload = multer({ storage, fileFilter });

// --- DEFINITIVE FIX: CORRECTED ROUTE ORDER ---
// Specific routes must come BEFORE generic parameterized routes.

// 1. Specific string routes ('/me', '/all')
router.get('/me', protect, getMyProfile); // Fetches the logged-in user's own profile
router.get('/all', protect, getAllProfiles); // Fetches all profiles for counting

// 2. Generic browse route
router.get('/', protect, getProfiles); // Fetches a list of profiles (limited or full based on subscription)

// 3. Generic parameterized route ('/:userId') - This MUST be last for GET requests
router.get('/:userId', protect, getSingleProfile); // Fetches a single user's profile by their ID

// --- PUT, POST, and DELETE Routes ---

// Route for UPLOADING a new main profile picture (e.g., from the cropper)
router.post('/picture', protect, upload.single('profileImage'), uploadMainProfilePicture);

// Route for setting an existing gallery image as the main profile picture
router.put('/picture', protect, setMainProfilePicture);

// Route for uploading multiple images to the gallery
router.post('/images', protect, upload.array('profileImages', 5), uploadProfileImages);

// Route for deleting a single image from the gallery
router.delete('/images/:imageId', protect, deleteProfileImage);

// Route for updating interests
router.put('/interests', protect, updateProfileInterests);

export default router;