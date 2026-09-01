// backend/src/routes/user.routes.ts
import { Router } from 'express';
import { createBroker, getBrokersByTenant, updateBroker } from '../controllers/user.controller';
import { upload } from '../middlewares/upload';

const router = Router();

router.post('/', upload.single('avatar'), createBroker);
router.get('/tenant/:tenantId', getBrokersByTenant);
router.put('/:id', upload.single('avatar'), updateBroker);

export default router;