// backend/src/controllers/tenant.controller.ts
import { Request, Response } from 'express';
import { Tenant } from '../models/tenant.model';

export const createTenant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, tradeName, cnpj, creci, domain, settings, images } = req.body;
        const logoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

        const tenantExists = await Tenant.findOne({ cnpj });
        if (tenantExists) {
            res.status(400).json({ error: 'Já existe uma imobiliária cadastrada com este CNPJ.' });
            return;
        }

        let parsedImages = images;
        if (typeof images === 'string') {
            parsedImages = JSON.parse(images);
        }

        const formattedImages = Array.isArray(parsedImages) ? parsedImages.map((img: any, idx: number) => ({
            url: img.url,
            isCover: img.isCover !== undefined ? img.isCover : (idx === 0),
            order: img.order !== undefined ? img.order : idx
        })) : [];

        if (formattedImages.length > 0 && !formattedImages.some((img: any) => img.isCover)) {
            formattedImages[0].isCover = true;
        }

        const tenant = new Tenant({
            name,
            tradeName,
            cnpj,
            creci,
            logoUrl,
            images: formattedImages,
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