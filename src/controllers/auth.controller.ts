import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Tenant } from '../models/tenant.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_jwt_super_imob';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { identifier, password } = req.body; // identifier pode ser email ou phone

        if (!identifier || !password) {
            res.status(400).json({ error: 'Informe o e-mail/telefone e a senha.' });
            return;
        }

        const user = await User.findOne({
            $or: [{ email: identifier.toLowerCase() }, { phone: identifier }]
        });

        if (!user || user.status !== 'ACTIVE') {
            res.status(401).json({ error: 'Credenciais inválidas ou usuário inativo.' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Credenciais inválidas.' });
            return;
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role, tenantId: user.tenantId },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                tenantId: user.tenantId
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const registerTenantAndAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            tenantName,
            tradeName,
            cnpj,
            creciTenant,
            adminName,
            adminEmail,
            adminPhone,
            adminPassword
        } = req.body;

        // 1. Verificar se tenant já existe por CNPJ
        const existingTenant = await Tenant.findOne({ cnpj });
        if (existingTenant) {
            res.status(400).json({ error: 'Já existe uma imobiliária cadastrada com este CNPJ.' });
            return;
        }

        // 2. Verificar se usuário já existe por email ou telefone
        const existingUser = await User.findOne({
            $or: [{ email: adminEmail.toLowerCase() }, { phone: adminPhone }]
        });
        if (existingUser) {
            res.status(400).json({ error: 'E-mail ou telefone já cadastrados no sistema.' });
            return;
        }

        // 3. Criar Tenant
        const tenant = new Tenant({
            name: tenantName,
            tradeName,
            cnpj,
            creci: creciTenant,
            settings: { primaryColor: '#2563eb', whatsappContact: adminPhone }
        });
        await tenant.save();

        // 4. Criar Usuário Admin do Tenant
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPassword, salt);

        const adminUser = new User({
            tenantId: tenant._id,
            name: adminName,
            email: adminEmail.toLowerCase(),
            phone: adminPhone,
            passwordHash,
            creci: creciTenant,
            role: 'ADMIN',
            status: 'ACTIVE'
        });
        await adminUser.save();

        const token = jwt.sign(
            { userId: adminUser._id, role: adminUser.role, tenantId: tenant._id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Imobiliária e Administrador criados com sucesso!',
            token,
            tenant,
            user: {
                id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
                tenantId: tenant._id
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};