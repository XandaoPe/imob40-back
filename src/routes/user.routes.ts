// backend/src/routes/user.routes.ts
import { Router } from 'express';
import { createBroker, getBrokersByTenant, updateBroker } from '../controllers/user.controller';

const router = Router();

router.post('/', createBroker);
router.get('/tenant/:tenantId', getBrokersByTenant);
router.put('/:id', updateBroker);

export default router;