import mongoose from 'mongoose';

export interface IOrganization {
    name: string;
    slug: string;
    ownerId: mongoose.Types.ObjectId;
    country: string;
    currency: string;
}

const organizationSchema = new mongoose.Schema<IOrganization>({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    country: {
        type: String,
        required: true,
        uppercase: true,
    },
    currency: {
        type: String,
        required: true,
        uppercase: true,
    },
}, {
    timestamps: true,
});

const Organization = mongoose.model<IOrganization>('Organization', organizationSchema);

export default Organization;
