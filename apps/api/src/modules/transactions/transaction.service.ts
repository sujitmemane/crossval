import mongoose from "mongoose";
import { ITransaction } from "./transaction.model";
import { createTransaction as createTransactionRepo, getAmountPaidForOrder, getTransactionsByOrderId } from "./transaction.repository";
import { success } from "../../lib/response";
import { recordAuditLog } from "../audit-logs/audit-log.service";
import { AuditAction } from "../audit-logs/audit-log.model";
import { AppError } from "../../lib/errors";
import { findOrderById } from "../orders/order.repository";
import { deriveOrderStatus } from "../../domain/order/derive-status";

export const createTransaction = async (organizationId: string, userId: string, transaction: ITransaction) => {
    const {
        orderId,
        amount,
        type,
        method,
        note,
    } = transaction;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const order = await findOrderById(orderId.toString(), organizationId);
        if(!order) {
            throw new AppError('Order not found', 404);
        }

        const amountPaidBefore = await getAmountPaidForOrder(orderId.toString(), organizationId);
        const amountPaidAfter = amountPaidBefore + (type === 'REFUND' ? -amount : amount);

        const statusBefore = deriveOrderStatus({ totalAmount: order.totalAmount, amountPaid: amountPaidBefore, dueDate: order.dueDate });
        const statusAfter = deriveOrderStatus({ totalAmount: order.totalAmount, amountPaid: amountPaidAfter, dueDate: order.dueDate });

        const createdTransaction = await createTransactionRepo({
            organizationId: new mongoose.Types.ObjectId(organizationId),
            orderId,
            amount,
            type,
            method,
            note,
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
        throw error;
    } finally {
        session.endSession();
    }
};

export const getAllTransactionOfOrder = async (organizationId: string, orderId: string) => {
    const transactions = await getTransactionsByOrderId(organizationId, orderId);
    return success('Transactions fetched successfully', transactions);
};
