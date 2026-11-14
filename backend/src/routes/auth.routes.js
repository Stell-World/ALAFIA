import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  logout,
  me
} from '../controllers/auth.controller.js';
import { requireSessionConfig } from '../middlewares/requireSessionConfig.js';

const router = Router();
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessayez dans quelques minutes.' }
});

router.use(requireSessionConfig);
router.post('/register', loginLimit, register);
router.post('/login', loginLimit, login);
router.post('/logout', logout);
router.get('/me', me);

export default router;
