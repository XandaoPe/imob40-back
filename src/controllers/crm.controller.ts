// backend/src/controllers/crm.controller.ts
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Deal } from '../models/deal.model';
import { Property } from '../models/property.model';

export const createDeal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tenantId, propertyId, brokerId, agreedPrice, commissionRate, stage, type, closingDate, ...rest } = req.body;

        const rate = commissionRate || 6;
        const commissionAmount = (agreedPrice * rate) / 100;
        const brokerCommissionAmount = commissionAmount * 0.5;

        const deal = new Deal({
            ...rest,
            tenantId: new Types.ObjectId(tenantId),
            propertyId: new Types.ObjectId(propertyId),
            brokerId: new Types.ObjectId(brokerId),
            agreedPrice,
            commissionRate: rate,
            commissionAmount,
            brokerCommissionAmount,
            type,
            stage,
            closingDate: stage === 'CLOSED_WON' ? new Date() : closingDate
        });

        const savedDeal = await deal.save();

        if (stage === 'CLOSED_WON') {
            const newPropertyStatus = type === 'SALE' ? 'SOLD' : 'RENTED';
            await Property.findByIdAndUpdate(propertyId, { status: newPropertyStatus });
        }

        res.status(201).json(savedDeal);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Erro ao criar negócio no CRM.' });
    }
};

export const getDealsByTenant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tenantId } = req.params;
        const singleTenantId = Array.isArray(tenantId) ? tenantId[0] : tenantId;

        const deals = await Deal.find({ tenantId: new Types.ObjectId(singleTenantId) })
            .populate('propertyId', 'title price location images type purpose status')
            .populate('brokerId', 'name email phone creci avatarUrl')
            .sort({ createdAt: -1 });
        res.json(deals);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Erro ao buscar negócios.' });
    }
};

export const getAllDealsGlobal = async (_req: Request, res: Response): Promise<void> => {
    try {
        const deals = await Deal.find()
            .populate('propertyId', 'title price location images type purpose status')
            .populate('brokerId', 'name email phone creci avatarUrl')
            .sort({ createdAt: -1 });
        res.json(deals);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Erro ao buscar todos os negócios.' });
    }
};

export const updateDeal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (updateData.agreedPrice && updateData.commissionRate) {
            updateData.commissionAmount = (updateData.agreedPrice * updateData.commissionRate) / 100;
            updateData.brokerCommissionAmount = updateData.commissionAmount * 0.5;
        }

        if (updateData.stage === 'CLOSED_WON') {
            updateData.closingDate = new Date();
        }

        const updatedDeal = await Deal.findByIdAndUpdate(id, updateData, { new: true })
            .populate('propertyId')
            .populate('brokerId');

        if (!updatedDeal) {
            res.status(404).json({ error: 'Negócio não encontrado.' });
            return;
        }

        if (updateData.stage === 'CLOSED_WON' && updatedDeal.propertyId) {
            const propId = (updatedDeal.propertyId as any)._id || updatedDeal.propertyId;
            const newPropertyStatus = updatedDeal.type === 'SALE' ? 'SOLD' : 'RENTED';
            await Property.findByIdAndUpdate(propId, { status: newPropertyStatus });
        }

        res.json(updatedDeal);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Erro ao atualizar negócio.' });
    }
};

export const deleteDeal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deleted = await Deal.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({ error: 'Negócio não encontrado.' });
            return;
        }
        res.json({ message: 'Negócio excluído com sucesso.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Erro ao excluir negócio.' });
    }
};