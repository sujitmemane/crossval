import mongoose from "mongoose";
import { ITransaction } from "./transaction.model";
import {
    createTransaction as createTransactionRepo,
    findTransactionByIdempotencyKey,
    getTransactionsByOrderId,
} from "./transaction.repository";
import { success } from "../../lib/response";
import { recordAuditLog } from "../audit-logs/audit-log.service";
import { AuditAction } from "../audit-logs/audit-log.model";
import { AppError } from "../../lib/errors";
import { findOrderById, applyOrderPayment } from "../orders/order.repository";
import { deriveOrderStatus } from "../../domain/order/derive-status";
import { isRefundAllowed, isPaymentAllowed } from "../../domain/payment/validate-payment";

const isDuplicateKeyError = (error: unknown): boolean =>
    typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;

const buildReplayResponse = async (organizationId: string, existing: NonNullable<Awaited<ReturnType<typeof findTransactionByIdempotencyKey>>>) => {
    const order = await findOrderById(existing.orderId.toString(), organizationId);
    const orderStatus = order
        ? deriveOrderStatus({ totalAmount: order.totalAmount, amountPaid: order.amountPaid, dueDate: order.dueDate })
        : undefined;
    return success('Transaction already processed', { transaction: existing, orderStatus });
};

export const createTransaction = async (organizationId: string, userId: string, transaction: ITransaction) => {
    const {
        orderId,
        amount,
        type,
        method,
        note,
        idempotencyKey,
    } = transaction;


    const existing = await findTransactionByIdempotencyKey(organizationId, idempotencyKey);
    if (existing) {
        return await buildReplayResponse(organizationId, existing);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const order = await findOrderById(orderId.toString(), organizationId);
        if(!order) {
            throw new AppError('Order not found', 404);
        }

        const overpaymentMessage = 'Payment amount would exceed the order total';
        const overrefundMessage = 'Refund amount cannot exceed the amount already paid';

        if (type === 'REFUND' && !isRefundAllowed(order.amountPaid, amount)) {
            throw new AppError(overrefundMessage, 400);
        }
        if (type === 'PAYMENT' && !isPaymentAllowed(order.amountPaid, order.totalAmount, amount)) {
            throw new AppError(overpaymentMessage, 400);
        }

        const signedAmount = type === 'REFUND' ? -amount : amount;
        const updatedOrder = await applyOrderPayment(orderId.toString(), organizationId, signedAmount, session);
        if (!updatedOrder) {
            throw new AppError(type === 'REFUND' ? overrefundMessage : overpaymentMessage, 400);
        }

        const amountPaidBefore = updatedOrder.amountPaid - signedAmount;
        const amountPaidAfter = updatedOrder.amountPaid;

        const statusBefore = deriveOrderStatus({ totalAmount: order.totalAmount, amountPaid: amountPaidBefore, dueDate: order.dueDate });
        const statusAfter = deriveOrderStatus({ totalAmount: order.totalAmount, amountPaid: amountPaidAfter, dueDate: order.dueDate });


        const createdTransaction = await createTransactionRepo({
            organizationId: new mongoose.Types.ObjectId(organizationId),
            orderId,
            amount,
            type,
            method,
            note,
            idempotencyKey,
        }, session);

        await recordAuditLog({
            organizationId,
            userId,
            orderId: orderId.toString(),
            action: type === 'REFUND' ? 'PAYMENT_REFUNDED' : 'PAYMENT_RECEIVED',
            metadata: {
                transactionId: createdTransaction._id.toString(),
                amount,
            },
        }, session);

        if (statusBefore !== statusAfter) {
            await recordAuditLog({
                organizationId,
                userId,
                orderId: orderId.toString(),
                action: `ORDER_${statusAfter}` as AuditAction,
                metadata: { from: statusBefore, to: statusAfter },
            }, session);
        }

        await session.commitTransaction();

        return success('Transaction created successfully', { transaction: createdTransaction, orderStatus: statusAfter });
    } catch (error) {
        await session.abortTransaction();

    
        if (isDuplicateKeyError(error)) {
            const existingAfterRace = await findTransactionByIdempotencyKey(organizationId, idempotencyKey);
            if (existingAfterRace) {
                return await buildReplayResponse(organizationId, existingAfterRace);
            }
        }

        throw error;
    } finally {
        session.endSession();
    }
};

export const getAllTransactionOfOrder = async (organizationId: string, orderId: string) => {
    const transactions = await getTransactionsByOrderId(organizationId, orderId);
    return success('Transactions fetched successfully', transactions);
};