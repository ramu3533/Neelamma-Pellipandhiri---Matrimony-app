import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getMessagesForConversation , markMessagesAsRead } from '../controllers/messageController';

const router = Router();

router.use(protect);

router.get('/:conversationId', getMessagesForConversation);

router.put('/read/:conversationId', markMessagesAsRead);
export default router;