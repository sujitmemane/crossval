import mongoose from 'mongoose';

export interface IItem {
    name: string;
    description?: string;
    quantity: number;
    rate: number;
    status: "AVAILABLE" | "UNAVAILABLE";
}

const itemSchema = new mongoose.Schema<IItem>({
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