// src/routes/auth.routes.ts
import { Router } from 'express';
import { login, registerTenantAndAdmin } from '../controllers/auth.controller';

const router = Router();
router.post('/login', login);
router.post('/register-tenant', registerTenantAndAdmin);

export default router;