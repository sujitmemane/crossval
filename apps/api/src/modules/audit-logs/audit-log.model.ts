import mongoose from 'mongoose';

export const AUDIT_ACTIONS = [
    "ORDER_CREATED",
    "ORDER_ITEMS_UPDATED",
    "ORDER_DUE_DATE_UPDATED",
    "ORDER_CUSTOMER_REASSIGNED",
    "PAYMENT_RECEIVED",
    "PAYMENT_REFUNDED",
    "ORDER_PENDING",
    "ORDER_PARTIALLY_PAID",
    "ORDER_PAID",
    "ORDER_OVERDUE",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface IAuditLog {
    organizationId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    action: AuditAction;
    metadata?: Record<string, unknown>;
}

const auditLogSchema = new mongoose.Schema<IAuditLog>({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    action: {
        type: String,
        enum: AUDIT_ACTIONS,
        required: true,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
