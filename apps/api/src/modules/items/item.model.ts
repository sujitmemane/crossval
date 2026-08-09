import mongoose from 'mongoose';

export interface IItem {
    organizationId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    quantity: number;
    rate: number;
    status: "AVAILABLE" | "UNAVAILABLE";
}

const itemSchema = new mongoose.Schema<IItem>({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
    },
    rate: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["AVAILABLE", "UNAVAILABLE"],
        default: "AVAILABLE",
    },
}, {
    timestamps: true,
});

const Item = mongoose.model<IItem>('Item', itemSchema);

export default Item;