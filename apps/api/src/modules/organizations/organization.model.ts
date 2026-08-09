import mongoose from 'mongoose';

export interface IOrganization {
    name: string;
    slug: string;
    ownerId: mongoose.Types.ObjectId;
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
}, {
    timestamps: true,
});

const Organization = mongoose.model<IOrganization>('Organization', organizationSchema);

export default Organization;
