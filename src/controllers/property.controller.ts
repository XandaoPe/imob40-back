// backend/src/controllers/property.controller.ts
import { Request, Response } from 'express';
import { Property } from '../models/property.model';
import mongoose from 'mongoose';

export const createProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            tenantId,
            brokerId,
            title,
            description,
            type,
            purpose,
            price,
            condoFee,
            taxFee,
            location,
            features,
            amenities,
            images,
            userName
        } = req.body;

        const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
        const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
        const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
        const parsedImages = typeof images === 'string' ? JSON.parse(images) : (images || []);

        const formattedImages = parsedImages.map((img: any, index: number) => ({
            url: img.url,
            isCover: img.isCover !== undefined ? img.isCover : (index === 0),
            order: img.order !== undefined ? img.order : index
        }));

        if (formattedImages.length > 0 && !formattedImages.some((img: any) => img.isCover)) {
            formattedImages[0].isCover = true;
        }

        const initialLog = {
            date: new Date(),
            userId: mongoose.Types.ObjectId.isValid(brokerId) ? new mongoose.Types.ObjectId(brokerId) : brokerId,
            userName: userName || 'Corretor/Admin',
            changes: ['Imóvel cadastrado no sistema']
        };

        const property = new Property({
            tenantId: mongoose.Types.ObjectId.isValid(tenantId) ? new mongoose.Types.ObjectId(tenantId) : tenantId,
            brokerId: mongoose.Types.ObjectId.isValid(brokerId) ? new mongoose.Types.ObjectId(brokerId) : brokerId,
            title,
            description,
            type,
            purpose,
            price,
            condoFee: condoFee || 0,
            taxFee: taxFee || 0,
            location: parsedLocation,
            features: parsedFeatures,
            amenities: parsedAmenities || [],
            images: formattedImages,
            changeLogs: [initialLog]
        });

        await property.save();
        res.status(201).json(property);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPublicProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tenantId } = req.params;
        const query: any = { status: 'AVAILABLE' };

        if (tenantId) {
            const singleTenantId = typeof tenantId === 'string' ? tenantId : tenantId[0];
            query.tenantId = mongoose.Types.ObjectId.isValid(singleTenantId)
                ? new mongoose.Types.ObjectId(singleTenantId)
                : singleTenantId;
        }

        const properties = await Property.find(query)
            .populate('brokerId', 'name phone email avatarUrl creci')
            .populate('tenantId', 'name tradeName');

        res.status(200).json(properties);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPropertiesByTenant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tenantId } = req.params;
        const { role } = req.query;

        let query: any = {};
        if (role !== 'SUPER_ADMIN' && tenantId) {
            const singleTenantId = typeof tenantId === 'string' ? tenantId : tenantId[0];
            query.tenantId = mongoose.Types.ObjectId.isValid(singleTenantId)
                ? new mongoose.Types.ObjectId(singleTenantId)
                : singleTenantId;
        }

        const properties = await Property.find(query).populate('brokerId', 'name phone email creci');
        res.status(200).json(properties);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const property = await Property.findById(id).populate('brokerId', 'name phone email avatarUrl creci bio');
        if (!property) {
            res.status(404).json({ error: 'Imóvel não encontrado.' });
            return;
        }
        res.status(200).json(property);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData: any = { ...req.body };
        const userName = updateData.userName;
        delete updateData.userName;

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

        const existingProperty = await Property.findById(id);
        if (!existingProperty) {
            res.status(404).json({ error: 'Imóvel não encontrado.' });
            return;
        }

        const changesList: any[] = [];

        if (updateData.title !== undefined && updateData.title !== existingProperty.title) {
            changesList.push({
                field: 'Título',
                oldValue: existingProperty.title,
                newValue: updateData.title
            });
        }
        if (updateData.price !== undefined && updateData.price !== existingProperty.price) {
            changesList.push({
                field: 'Preço',
                oldValue: existingProperty.price,
                newValue: updateData.price
            });
        }
        if (updateData.description !== undefined && updateData.description !== existingProperty.description) {
            changesList.push({
                field: 'Descrição',
                oldValue: existingProperty.description,
                newValue: updateData.description
            });
        }
        if (updateData.type !== undefined && updateData.type !== existingProperty.type) {
            changesList.push({
                field: 'Tipo',
                oldValue: existingProperty.type,
                newValue: updateData.type
            });
        }
        if (updateData.purpose !== undefined && updateData.purpose !== existingProperty.purpose) {
            changesList.push({
                field: 'Finalidade',
                oldValue: existingProperty.purpose,
                newValue: updateData.purpose
            });
        }
        if (updateData.status !== undefined && updateData.status !== existingProperty.status) {
            changesList.push({
                field: 'Status',
                oldValue: existingProperty.status,
                newValue: updateData.status
            });
        }
        if (updateData.amenities !== undefined && JSON.stringify(updateData.amenities) !== JSON.stringify(existingProperty.amenities)) {
            changesList.push({
                field: 'Diferenciais',
                oldValue: existingProperty.amenities,
                newValue: updateData.amenities
            });
        }
        if (updateData.images !== undefined && JSON.stringify(updateData.images) !== JSON.stringify(existingProperty.images)) {
            changesList.push({
                field: 'Imagens',
                oldValue: `${existingProperty.images?.length || 0} imagem(ns)`,
                newValue: `${updateData.images?.length || 0} imagem(ns)`
            });
        }

        if (changesList.length === 0) {
            changesList.push({
                field: 'Geral',
                oldValue: null,
                newValue: 'Imóvel atualizado'
            });
        }

        const newLog = {
            date: new Date(),
            userId: updateData.brokerId || existingProperty.brokerId,
            userName: userName || 'Usuário',
            changes: changesList
        };

        const property = await Property.findByIdAndUpdate(
            id,
            {
                ...updateData,
                $push: { changeLogs: newLog }
            },
            { new: true }
        );

        res.status(200).json(property);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const property = await Property.findByIdAndDelete(id);
        if (!property) {
            res.status(404).json({ error: 'Imóvel não encontrado.' });
            return;
        }
        res.status(200).json({ message: 'Imóvel excluído com sucesso.', property });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPropertyChangeLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tenantId } = req.params;
        const { role } = req.query;

        let query: any = {};
        if (role !== 'SUPER_ADMIN' && tenantId) {
            const singleTenantId = typeof tenantId === 'string' ? tenantId : tenantId[0];
            query.tenantId = mongoose.Types.ObjectId.isValid(singleTenantId)
                ? new mongoose.Types.ObjectId(singleTenantId)
                : singleTenantId;
        }

        const properties = await Property.find(query).select('title tenantId changeLogs').populate('tenantId', 'name tradeName');

        let allLogs: any[] = [];
        properties.forEach((prop: any) => {
            if (prop.changeLogs && prop.changeLogs.length > 0) {
                prop.changeLogs.forEach((log: any) => {
                    allLogs.push({
                        propertyId: prop._id,
                        propertyTitle: prop.title,
                        tenantName: prop.tenantId?.name || 'Imobiliária',
                        date: log.date,
                        userId: log.userId,
                        userName: log.userName || 'Usuário',
                        changes: log.changes
                    });
                });
            }
        });

        allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.status(200).json(allLogs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};