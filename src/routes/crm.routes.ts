// backend/src/routes/crm.routes.ts
import { Router } from 'express';
import {
    createDeal,
    getDealsByTenant,
    getAllDealsGlobal,
    updateDeal,
    deleteDeal
} from '../controllers/crm.controller';

const router = Router();

router.post('/', createDeal);
router.get('/tenant/:tenantId', getDealsByTenant);
router.get('/all', getAllDealsGlobal);
router.put('/:id', updateDeal);
router.delete('/:id', deleteDeal);

export default router;