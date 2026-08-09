import mongoose from 'mongoose';
import Transaction, { ITransaction } from './transaction.model';

export const createTransaction = async (transaction: ITransaction, session?: mongoose.ClientSession) => {
    const [created] = await Transaction.create([transaction], { session });
    return created;
};

export const getTransactionsByOrderId = async (organizationId: string, orderId: string): Promise<ITransaction[]> => {
    return await Transaction.find({ organizationId: new mongoose.Types.ObjectId(organizationId), orderId: new mongoose.Types.ObjectId(orderId) });
};
