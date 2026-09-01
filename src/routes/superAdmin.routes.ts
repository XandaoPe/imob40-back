// src/routes/superAdmin.routes.ts
import { Router } from 'express';
import { getAllData, updateAnyRecord } from '../controllers/superAdmin.controller';

const router = Router();
router.get('/all-data', getAllData);
router.put('/:modelType/:id', updateAnyRecord);

export default router;