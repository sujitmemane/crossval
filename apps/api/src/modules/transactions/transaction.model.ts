import mongoose from 'mongoose';

export interface ITransaction {
    organizationId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    amount: number;
    type: "PAYMENT" | "REFUND";
    method?: "CASH" | "BANK_TRANSFER" | "CARD" | "UPI" | "OTHER";
    note?: string;
}

const transactionSchema = new mongoose.Schema<ITransaction>({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ["PAYMENT", "REFUND"],
        required: true,
    },
    method: {
        type: String,
        enum: ["CASH", "BANK_TRANSFER", "CARD", "UPI", "OTHER"],
    },
    note: {
        type: String,
    },
}, {
    timestamps: true,
});

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;