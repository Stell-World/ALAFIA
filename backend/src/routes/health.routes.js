import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SANTÉ+ backend fonctionne.'
  });
});

export default router;