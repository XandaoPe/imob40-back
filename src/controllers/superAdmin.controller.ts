// backend/src/controllers/superAdmin.controller.ts
import { Request, Response } from 'express';
import { Tenant } from '../models/tenant.model';
import { User } from '../models/user.model';
import { Property } from '../models/property.model';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const getAllData = async (req: Request, res: Response): Promise<void> => {
    try {
        const tenants = await Tenant.find();
        const users = await User.find().select('-passwordHash');
        const properties = await Property.find();

        res.status(200).json({ tenants, users, properties });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAnyRecord = async (req: Request, res: Response): Promise<void> => {
    try {
        const { modelType, id } = req.params; // modelType: 'tenant' | 'user' | 'property'
        const updateData = { ...req.body };

        if (modelType === 'user' && updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.passwordHash = await bcrypt.hash(updateData.password, salt);
            delete updateData.password;
        }

        if (modelType === 'tenant') {
            if (updateData.settings && typeof updateData.settings === 'string') {
                updateData.settings = JSON.parse(updateData.settings);
            }
            if (updateData.images && typeof updateData.images === 'string') {
                updateData.images = JSON.parse(updateData.images);
            }
            if (updateData.images && Array.isArray(updateData.images)) {
                updateData.images = updateData.images.map((img: any, index: number) => ({
                    url: img.url,
                    isCover: img.isCover !== undefined ? img.isCover : (index === 0),
                    order: img.order !== undefined ? img.order : index
                }));
                if (updateData.images.length > 0 && !updateData.images.some((img: any) => img.isCover)) {
                    updateData.images[0].isCover = true;
                }
            }
        }

        if (modelType === 'property') {
            if (updateData.location && typeof updateData.location === 'string') {
                updateData.location = JSON.parse(updateData.location);
            }
            if (updateData.features && typeof updateData.features === 'string') {
                updateData.features = JSON.parse(updateData.features);
            }
            if (updateData.amenities && typeof updateData.amenities === 'string') {
                updateData.amenities = JSON.parse(updateData.amenities);
            }
            if (updateData.images && typeof updateData.images === 'string') {
                updateData.images = JSON.parse(updateData.images);
            }

            if (updateData.tenantId && mongoose.Types.ObjectId.isValid(updateData.tenantId)) {
                updateData.tenantId = new mongoose.Types.ObjectId(updateData.tenantId);
            }
            if (updateData.brokerId && mongoose.Types.ObjectId.isValid(updateData.brokerId)) {
                updateData.brokerId = new mongoose.Types.ObjectId(updateData.brokerId);
            }

            if (updateData.images && Array.isArray(updateData.images)) {
                updateData.images = updateData.images.map((img: any, index: number) => ({
                    url: img.url,
                    isCover: img.isCover !== undefined ? img.isCover : (index === 0),
                    order: img.order !== undefined ? img.order : index
                }));
                if (updateData.images.length > 0 && !updateData.images.some((img: any) => img.isCover)) {
                    updateData.images[0].isCover = true;
                }
            }
        }

        let updatedRecord;
        if (modelType === 'tenant') {
            updatedRecord = await Tenant.findByIdAndUpdate(id, updateData, { new: true });
        } else if (modelType === 'user') {
            updatedRecord = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-passwordHash');
        } else if (modelType === 'property') {
            updatedRecord = await Property.findByIdAndUpdate(id, updateData, { new: true });
        } else {
            res.status(400).json({ error: 'Tipo de modelo inválido.' });
            return;
        }

        if (!updatedRecord) {
            res.status(404).json({ error: 'Registro não encontrado.' });
            return;
        }

        res.status(200).json({ message: 'Atualizado com sucesso!', updatedRecord });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};