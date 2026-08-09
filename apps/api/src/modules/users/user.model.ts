import mongoose from 'mongoose';

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "CUSTOMER";
    organizationId?: mongoose.Types.ObjectId;
    isOrganizationConfigured?: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["ADMIN", "CUSTOMER"],
        default: "CUSTOMER",
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
    },
    isOrganizationConfigured: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
}, {
    timestamps: true,
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;