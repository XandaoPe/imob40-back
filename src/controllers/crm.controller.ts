// backend/src/controllers/crm.controller.ts
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Deal } from '../models/deal.model';
import { Property } from '../models/property.model';
import { Client } from '../models/client.model';

export const createDeal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tenantId, propertyId, brokerId, agreedPrice, commissionRate, stage, type, closingDate, clientId, ...rest } = req.body;

        const rate = commissionRate || 6;
        const commissionAmount = (agreedPrice * rate) / 100;
        const brokerCommissionAmount = commissionAmount * 0.5;

        const deal = new Deal({
            ...rest,
            tenantId: new Types.ObjectId(tenantId),
            propertyId: new Types.ObjectId(propertyId),
            brokerId: new Types.ObjectId(brokerId),
            clientId: clientId ? new Types.ObjectId(clientId) : undefined,
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

            if (clientId) {
                await Client.findByIdAndUpdate(clientId, {
                    status: 'CLOSED_DEAL',
                    $push: {
                        history: {
                            date: new Date(),
                            action: 'NEGOCIO_FECHADO',
                            description: `Negócio fechado com sucesso no CRM (${type === 'SALE' ? 'Venda' : 'Locação'})`,
                            brokerName: 'Sistema CRM'
                        }
                    }
                });
            }
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
            .populate('clientId', 'name email phone document')
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
            .populate('clientId', 'name email phone document')
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

        if (updateData.clientId) {
            updateData.clientId = new Types.ObjectId(updateData.clientId);
        }

        if (updateData.agreedPrice && updateData.commissionRate) {
            updateData.commissionAmount = (updateData.agreedPrice * updateData.commissionRate) / 100;
            updateData.brokerCommissionAmount = updateData.commissionAmount * 0.5;
        }

        if (updateData.stage === 'CLOSED_WON') {
            updateData.closingDate = new Date();
        }

        const updatedDeal = await Deal.findByIdAndUpdate(id, updateData, { new: true })
            .populate('propertyId')
            .populate('brokerId')
            .populate('clientId');

        if (!updatedDeal) {
            res.status(404).json({ error: 'Negócio não encontrado.' });
            return;
        }

        if (updateData.stage === 'CLOSED_WON' && updatedDeal.propertyId) {
            const propId = (updatedDeal.propertyId as any)._id || updatedDeal.propertyId;
            const newPropertyStatus = updatedDeal.type === 'SALE' ? 'SOLD' : 'RENTED';
            await Property.findByIdAndUpdate(propId, { status: newPropertyStatus });

            if (updatedDeal.clientId) {
                const clientId = (updatedDeal.clientId as any)._id || updatedDeal.clientId;
                await Client.findByIdAndUpdate(clientId, {
                    status: 'CLOSED_DEAL',
                    $push: {
                        history: {
                            date: new Date(),
                            action: 'NEGOCIO_FECHADO',
                            description: `Contrato fechado com sucesso no CRM`,
                            brokerName: 'Sistema CRM'
                        }
                    }
                });
            }
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