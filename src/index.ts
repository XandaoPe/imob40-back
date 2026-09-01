// backend/src/index.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';
import tenantRoutes from './routes/tenant.routes';
import userRoutes from './routes/user.routes';
import propertyRoutes from './routes/property.routes';
import authRoutes from './routes/auth.routes';
import superAdminRoutes from './routes/superAdmin.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/super-admin', superAdminRoutes);

app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'API do Sistema Imobiliário rodando com sucesso!' });
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
});