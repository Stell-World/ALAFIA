import { Router } from 'express';
import { postChatMessage } from '../controllers/chat.controller.js';

const router = Router();
router.post('/', postChatMessage);

export default router;
