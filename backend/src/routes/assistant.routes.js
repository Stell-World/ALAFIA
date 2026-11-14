import { Router } from 'express';
import { postAssistantMessage } from '../controllers/assistant.controller.js';

const router = Router();

router.post('/', postAssistantMessage);

export default router;