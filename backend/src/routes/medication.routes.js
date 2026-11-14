import { Router } from 'express';
import { requireSessionConfig } from '../middlewares/requireSessionConfig.js';
import { requireAuthenticatedUser } from '../middlewares/requireAuthenticatedUser.js';
import {
  listMedications,
  createMedication,
  updateMedication,
  deleteMedication
} from '../controllers/medication.controller.js';

const router = Router();
router.use(requireSessionConfig, requireAuthenticatedUser);
router.get('/', listMedications);
router.post('/', createMedication);
router.patch('/:id', updateMedication);
router.delete('/:id', deleteMedication);

export default router;
