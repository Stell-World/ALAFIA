import { Router } from 'express';
import { requireSessionConfig } from '../middlewares/requireSessionConfig.js';
import { requireAuthenticatedUser } from '../middlewares/requireAuthenticatedUser.js';
import {
  listMeasurements,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement
} from '../controllers/patient.controller.js';

const router = Router();
router.use(requireSessionConfig, requireAuthenticatedUser);
router.get('/', listMeasurements);
router.post('/', createMeasurement);
router.patch('/:id', updateMeasurement);
router.delete('/:id', deleteMeasurement);

export default router;
