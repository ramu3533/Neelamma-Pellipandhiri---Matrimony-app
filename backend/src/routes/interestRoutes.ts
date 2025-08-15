import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  sendInterest,
  getReceivedInterests,
  getSentInterests,
  respondToInterest,
  getAcceptedInterests, // Import the new function
} from '../controllers/interestController';

const router = Router();

// All interest routes are protected
router.use(protect);

router.post('/send', sendInterest);
router.get('/received', getReceivedInterests);
router.get('/sent', getSentInterests);
router.get('/accepted', getAcceptedInterests); // Add the new route
router.put('/respond/:interestId', respondToInterest);

export default router;