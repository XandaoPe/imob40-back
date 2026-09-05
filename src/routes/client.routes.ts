// backend/src/routes/client.routes.ts
import { Router } from 'express';
import {
    createClient,
    searchClients,
    getClientsByTenant,
    getAllClientsGlobal,
    getClientById,
    updateClient,
    deleteClient
} from '../controllers/client.controller';

const router = Router();

router.post('/', createClient);
router.get('/search', searchClients);
router.get('/tenant/:tenantId', getClientsByTenant);
router.get('/all', getAllClientsGlobal);
router.get('/:id', getClientById);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;