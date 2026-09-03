// backend/src/models/property.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IPropertyChangeLog {
  date: Date;
  userId: Types.ObjectId;
  userName?: string;
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  } | string>;
}

export interface IProperty extends Document {
  tenantId: Types.ObjectId;
  brokerId: Types.ObjectId;
  title: string;
  description: string;
  type: 'HOUSE' | 'APARTMENT' | 'LAND' | 'COMMERCIAL';
  purpose: 'SALE' | 'RENT';
  price: number;
  condoFee?: number;
  taxFee?: number;
  location: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number]; // [longitude, latitude]
    };
  };
  features: {
    bedrooms: number;
    suites: number;
    bathrooms: number;
    parkingSpaces: number;
    usableArea: number;
    totalArea: number;
  };
  amenities: string[];
  images: {
    url: string;
    isCover: boolean;
    order: number;
  }[];
  status: 'AVAILABLE' | 'SOLD' | 'RENTED' | 'INACTIVE';
  changeLogs: IPropertyChangeLog[];
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  brokerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL'], required: true },
  purpose: { type: String, enum: ['SALE', 'RENT'], required: true },
  price: { type: Number, required: true },
  condoFee: { type: Number, default: 0 },
  taxFee: { type: Number, default: 0 },
  location: {
    cep: { type: String, required: true },
    street: { type: String, required: true },
    number: { type: String, required: true },
    neighborhood: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    }
  },
  features: {
    bedrooms: { type: Number, default: 0 },
    suites: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    parkingSpaces: { type: Number, default: 0 },
    usableArea: { type: Number, required: true },
    totalArea: { type: Number, required: true }
  },
  amenities: [{ type: String }],
  images: [{
    url: { type: String, required: true },
    isCover: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
  status: { type: String, enum: ['AVAILABLE', 'SOLD', 'RENTED', 'INACTIVE'], default: 'AVAILABLE' },
  changeLogs: [{
    date: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    changes: [{ type: Schema.Types.Mixed }]
  }]
}, {
  timestamps: true
});

PropertySchema.index({ 'location.coordinates': '2dsphere' });
PropertySchema.index({ tenantId: 1, status: 1 });

export const Property = model<IProperty>('Property', PropertySchema);