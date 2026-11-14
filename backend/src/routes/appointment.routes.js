import { Router } from 'express';
import { requireSessionConfig } from '../middlewares/requireSessionConfig.js';
import { requireAuthenticatedUser } from '../middlewares/requireAuthenticatedUser.js';
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointment.controller.js';

const router = Router();
router.use(requireSessionConfig, requireAuthenticatedUser);
router.get('/', listAppointments);
router.post('/', createAppointment);
router.patch('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
