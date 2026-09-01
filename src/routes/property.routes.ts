import { Router } from 'express';
import {
    createProperty,
    getPublicProperties,
    getPropertiesByTenant,
    getPropertyById,
    updateProperty,
    deleteProperty,
    getPropertyChangeLogs
} from '../controllers/property.controller';

const router = Router();

router.post('/', createProperty);
router.get('/public', getPublicProperties);
router.get('/public/:tenantId', getPublicProperties);
router.get('/public/tenant/:tenantId', getPublicProperties);
router.get('/logs/all', getPropertyChangeLogs);
router.get('/logs/tenant/:tenantId', getPropertyChangeLogs);
router.get('/tenant/:tenantId', getPropertiesByTenant);
router.get('/:id', getPropertyById);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

export default router;