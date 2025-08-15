import { Router } from 'express';
import { getSuccessStories } from '../controllers/successStoryController';

const router = Router();

router.get('/', getSuccessStories);

export default router;