// backend/src/models/tenant.model.ts
import { Schema, model, Document } from 'mongoose';

export interface ITenantImage {
  url: string;
  isCover: boolean;
  order: number;
}

export interface ITenant extends Document {
  name: string;
  tradeName: string;
  cnpj: string;
  creci: string;
  logoUrl?: string;
  images: ITenantImage[];
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
  images: [{
    url: { type: String, required: true },
    isCover: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
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