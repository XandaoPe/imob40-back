// backend/src/controllers/client.controller.ts
import { Request, Response } from 'express';
import { Client } from '../models/client.model';
import mongoose from 'mongoose';

export const createClient = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tenantId, name, email, phone, document, roles, status, address, notes, brokerName } = req.body;

        const client = new Client({
            tenantId: new mongoose.Types.ObjectId(tenantId),
            name,
            email,
            phone,
            document,
            roles: roles || ['BUYER'],
            status: status || 'ACTIVE',
            address,
            notes,
            history: [{
                date: new Date(),
                action: 'CADASTRO',
                description: `Cliente cadastrado no sistema como ${roles?.join(' e ') || 'Comprador'}`,
                brokerName: brokerName || 'Administração'
            }]
        });

        await client.save();
        res.status(201).json(client);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Erro ao cadastrar cliente.' });
    }
};

export const searchClients = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tenantId, q } = req.query;
        const query = q ? String(q).trim() : '';

        const filter: any = {};
        if (tenantId) {
            filter.tenantId = new mongoose.Types.ObjectId(String(tenantId));
        }

        if (query) {
            const regex = new RegExp(query, 'i');
            filter.$or = [
                { name: regex },
                { email: regex },
                { phone: regex },
                { document: regex }
            ];
        }

        const clients = await Client.find(filter).limit(10).sort({ name: 1 });
        res.json(clients);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Erro ao buscar clientes.' });
    }
};

export const getClientsByTenant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tenantId } = req.params;
        const singleTenantId = Array.isArray(tenantId) ? tenantId[0] : tenantId;

        const clients = await Client.find({ tenantId: new mongoose.Types.ObjectId(singleTenantId) })
            .sort({ createdAt: -1 });
        res.json(clients);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Erro ao buscar clientes.' });
    }
};

export const getAllClientsGlobal = async (_req: Request, res: Response): Promise<void> => {
    try {
        const clients = await Client.find().sort({ createdAt: -1 });
        res.json(clients);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Erro ao buscar todos os clientes.' });
    }
};

export const getClientById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const client = await Client.findById(id).populate('history.dealId history.propertyId');
        if (!client) {
            res.status(404).json({ error: 'Cliente não encontrado.' });
            return;
        }
        res.json(client);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Erro ao buscar cliente.' });
    }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { actionDescription, brokerName, ...updateData } = req.body;

        const client = await Client.findById(id);
        if (!client) {
            res.status(404).json({ error: 'Cliente não encontrado.' });
            return;
        }

        Object.assign(client, updateData);

        if (actionDescription) {
            client.history.push({
                date: new Date(),
                action: 'ATUALIZACAO',
                description: actionDescription,
                brokerName: brokerName || 'Sistema'
            });
        }

        await client.save();
        res.json(client);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Erro ao atualizar cliente.' });
    }
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deleted = await Client.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({ error: 'Cliente não encontrado.' });
            return;
        }
        res.json({ message: 'Cliente excluído com sucesso.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Erro ao excluir cliente.' });
    }
};