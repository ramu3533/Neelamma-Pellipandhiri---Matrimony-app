import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { likeProfile, getReceivedLikes, getSentLikes } from '../controllers/likeController';

const router = Router();

router.use(protect);

router.post('/:profileUserId', likeProfile);
router.get('/received', getReceivedLikes);
router.get('/sent', getSentLikes);

export default router;