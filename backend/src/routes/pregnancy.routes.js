import { Router } from 'express';
import { requireSessionConfig } from '../middlewares/requireSessionConfig.js';
import { requireAuthenticatedUser } from '../middlewares/requireAuthenticatedUser.js';
import { getPregnancyRecord, putPregnancyRecord, deletePregnancyRecord } from '../controllers/pregnancy.controller.js';

const router = Router();
router.use(requireSessionConfig, requireAuthenticatedUser);
router.get('/', getPregnancyRecord);
router.put('/', putPregnancyRecord);
router.delete('/', deletePregnancyRecord);

export default router;
