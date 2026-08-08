import mongoose from 'mongoose';

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "CUSTOMER";
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
}, {
    timestamps: true,
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;