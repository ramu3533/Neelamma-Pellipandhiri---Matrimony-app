// import { Router } from 'express';
// // Add getMe to imports
// import { register, login, getMe } from '../controllers/authController';
// // Import the protect middleware
// import { protect } from '../middleware/authMiddleware';

// const router = Router();

// router.post('/register', register);
// router.post('/login', login);
// // Add the new protected route
// router.get('/me', protect, getMe);

// export default router;

import { Router } from 'express';
import { 
    register, 
    login, 
    getMe, 
    verifyRegistration, 
    verifyLogin 
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/verify-registration', verifyRegistration);

router.post('/login', login);
router.post('/verify-login', verifyLogin);

router.get('/me', protect, getMe);

export default router;