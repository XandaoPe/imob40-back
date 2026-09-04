// backend/src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { User } from '../models/user.model';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const createBroker = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tenantId, name, email, password, creci, phone, bio, role, requesterRole, avatarUrl } = req.body;

        if (requesterRole && requesterRole !== 'ADMIN' && requesterRole !== 'SUPER_ADMIN') {
            res.status(403).json({ error: 'Acesso negado. Apenas administradores podem cadastrar corretores.' });
            return;
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ error: 'E-mail já cadastrado.' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password || '123456', salt);

        const user = new User({
            tenantId: tenantId ? new mongoose.Types.ObjectId(tenantId) : undefined,
            name,
            email,
            passwordHash,
            creci,
            phone,
            avatarUrl: avatarUrl || '',
            bio,
            role: role || 'BROKER',
            status: 'ACTIVE'
        });

        await user.save();
        res.status(201).json({
            _id: user._id,
            tenantId: user.tenantId,
            name: user.name,
            email: user.email,
            creci: user.creci,
            phone: user.phone,
            role: user.role,
            status: user.status,
            avatarUrl: user.avatarUrl
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getBrokersByTenant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tenantId } = req.params;
        const query: any = {};

        if (tenantId && tenantId !== 'all') {
            const singleTenantId = typeof tenantId === 'string' ? tenantId : tenantId[0];
            query.tenantId = mongoose.Types.ObjectId.isValid(singleTenantId)
                ? new mongoose.Types.ObjectId(singleTenantId)
                : singleTenantId;
        }

        const brokers = await User.find(query).select('-passwordHash');
        res.status(200).json(brokers);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateBroker = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData: any = { ...req.body };

        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.passwordHash = await bcrypt.hash(updateData.password, salt);
            delete updateData.password;
        }
        if (updateData.tenantId && mongoose.Types.ObjectId.isValid(updateData.tenantId)) {
            updateData.tenantId = new mongoose.Types.ObjectId(updateData.tenantId);
        }

        const broker = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-passwordHash');
        if (!broker) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }
        res.status(200).json(broker);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};