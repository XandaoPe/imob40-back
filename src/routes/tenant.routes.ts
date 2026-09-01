import { Router } from 'express';
import { createTenant, getTenantById, updateTenant } from '../controllers/tenant.controller';
import { upload } from '../middlewares/upload';

const router = Router();

router.post('/', upload.single('logo'), createTenant);
router.get('/:id', getTenantById);
router.put('/:id', upload.single('logo'), updateTenant);

export default router;