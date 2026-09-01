import { Request, Response } from 'express';
import { Tenant } from '../models/tenant.model';
import { User } from '../models/user.model';
import { Property } from '../models/property.model';
import bcrypt from 'bcryptjs';

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