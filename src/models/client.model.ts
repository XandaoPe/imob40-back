// backend/src/models/client.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IClientHistory {
    date: Date;
    action: string; // Ex: 'CADASTRO', 'NOVA_COMPRA', 'NOVO_IMOVEL_VENDA', 'VISITA', 'DESISTENCIA', 'CONTRATO_FECHADO'
    description: string;
    dealId?: Types.ObjectId;
    propertyId?: Types.ObjectId;
    brokerName?: string;
}

export interface IClient extends Document {
    tenantId: Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    document: string; // CPF ou CNPJ formatado
    roles: ('BUYER' | 'SELLER')[]; // Pode ser Comprador, Vendedor ou Ambos
    status: 'ACTIVE' | 'INACTIVE' | 'CLOSED_DEAL' | 'GAVE_UP';
    address?: {
        cep: string;
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
    };
    notes?: string;
    history: IClientHistory[];
    createdAt: Date;
    updatedAt: Date;
}

const ClientHistorySchema = new Schema<IClientHistory>({
    date: { type: Date, default: Date.now },
    action: { type: String, required: true },
    description: { type: String, required: true },
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal' },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
    brokerName: { type: String }
});

const ClientSchema = new Schema<IClient>({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    document: { type: String, trim: true }, // CPF / CNPJ
    roles: {
        type: [{ type: String, enum: ['BUYER', 'SELLER'] }],
        required: true,
        default: ['BUYER']
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'CLOSED_DEAL', 'GAVE_UP'],
        default: 'ACTIVE'
    },
    address: {
        cep: String,
        street: String,
        number: String,
        neighborhood: String,
        city: String,
        state: String,
    },
    notes: { type: String, trim: true },
    history: [ClientHistorySchema]
}, { timestamps: true });

ClientSchema.index({ tenantId: 1, document: 1 });

export const Client = model<IClient>('Client', ClientSchema);