import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    tenantId?: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    creci?: string;
    avatarUrl?: string;
    bio?: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'BROKER';
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: Date;
}

const userSchema = new Schema<IUser>({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: function (this: any) { return this.role !== 'SUPER_ADMIN'; } },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    creci: { type: String },
    avatarUrl: { type: String },
    bio: { type: String },
    role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'BROKER'], default: 'BROKER' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);