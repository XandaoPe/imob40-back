import { Schema, model, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  tradeName: string;
  cnpj: string;
  creci: string;
  logoUrl?: string;
  domain?: string;
  settings: {
    primaryColor: string;
    whatsappContact: string;
  };
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>({
  name: { type: String, required: true },
  tradeName: { type: String, required: true },
  cnpj: { type: String, required: true, unique: true },
  creci: { type: String, required: true },
  logoUrl: { type: String },
  domain: { type: String },
  settings: {
    primaryColor: { type: String, default: '#2563eb' },
    whatsappContact: { type: String, required: true }
  },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'INACTIVE'], default: 'ACTIVE' }
}, {
  timestamps: true
});

export const Tenant = model<ITenant>('Tenant', TenantSchema);