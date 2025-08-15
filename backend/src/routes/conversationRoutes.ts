import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getConversationByUsers } from '../controllers/conversationController';

const router = Router();

router.use(protect);

router.get('/:otherUserId', getConversationByUsers);

export default router;