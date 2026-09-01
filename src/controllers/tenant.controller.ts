import { Request, Response } from 'express';
import { Tenant } from '../models/tenant.model';

export const createTenant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, tradeName, cnpj, creci, domain, settings } = req.body;
        const logoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

        const tenantExists = await Tenant.findOne({ cnpj });
        if (tenantExists) {
            res.status(400).json({ error: 'Já existe uma imobiliária cadastrada com este CNPJ.' });
            return;
        }

        const tenant = new Tenant({
            name,
            tradeName,
            cnpj,
            creci,
            logoUrl,
            domain,
            settings: settings ? JSON.parse(settings) : undefined
        });

        await tenant.save();
        res.status(201).json(tenant);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTenantById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const tenant = await Tenant.findById(id);
        if (!tenant) {
            res.status(404).json({ error: 'Imobiliária não encontrada.' });
            return;
        }
        res.status(200).json(tenant);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTenant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData: any = { ...req.body };

        if (req.file) {
            updateData.logoUrl = `/uploads/${req.file.filename}`;
        }
        if (updateData.settings && typeof updateData.settings === 'string') {
            updateData.settings = JSON.parse(updateData.settings);
        }

        const tenant = await Tenant.findByIdAndUpdate(id, updateData, { new: true });
        if (!tenant) {
            res.status(404).json({ error: 'Imobiliária não encontrada.' });
            return;
        }
        res.status(200).json(tenant);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};