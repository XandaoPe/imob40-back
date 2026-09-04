// backend/src/models/deal.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IDeal extends Document {
    tenantId: Types.ObjectId;
    propertyId: Types.ObjectId;
    brokerId: Types.ObjectId;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientDocument?: string;
    type: 'SALE' | 'RENT';
    stage: 'PROSPECTING' | 'VISIT' | 'PROPOSAL' | 'NEGOTIATION' | 'CONTRACT' | 'CLOSED_WON' | 'CLOSED_LOST';
    agreedPrice: number;
    commissionRate: number;
    commissionAmount: number;
    brokerCommissionAmount: number;
    closingDate?: Date;
    rentalDetails?: {
        contractDurationMonths: number;
        depositAmount: number;
        guaranteeType: string;
    };
    saleDetails?: {
        paymentMethod: string;
        deedNumber?: string;
    };
    documents: { name: string; url: string; uploadedAt: Date }[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DealSchema = new Schema<IDeal>({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    brokerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, required: true, trim: true },
    clientPhone: { type: String, required: true, trim: true },
    clientDocument: { type: String, trim: true },
    type: { type: String, enum: ['SALE', 'RENT'], default: 'SALE', required: true },
    stage: {
        type: String,
        enum: ['PROSPECTING', 'VISIT', 'PROPOSAL', 'NEGOTIATION', 'CONTRACT', 'CLOSED_WON', 'CLOSED_LOST'],
        default: 'PROSPECTING',
        required: true
    },
    agreedPrice: { type: Number, required: true },
    commissionRate: { type: Number, default: 6 },
    commissionAmount: { type: Number, required: true },
    brokerCommissionAmount: { type: Number, required: true },
    closingDate: { type: Date },
    rentalDetails: {
        contractDurationMonths: Number,
        depositAmount: Number,
        guaranteeType: String,
    },
    saleDetails: {
        paymentMethod: String,
        deedNumber: String,
    },
    documents: [{
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    notes: { type: String, trim: true }
}, { timestamps: true });

export const Deal = model<IDeal>('Deal', DealSchema);