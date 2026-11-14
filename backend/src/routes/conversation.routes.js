import { Router } from 'express';
import { requireSessionConfig } from '../middlewares/requireSessionConfig.js';
import { requireAuthenticatedUser } from '../middlewares/requireAuthenticatedUser.js';
import {
  listConversations,
  createConversation,
  getConversation,
  deleteConversation
} from '../controllers/conversation.controller.js';

const router = Router();
router.use(requireSessionConfig, requireAuthenticatedUser);
router.get('/', listConversations);
router.post('/', createConversation);
router.get('/:id', getConversation);
router.delete('/:id', deleteConversation);

export default router;
