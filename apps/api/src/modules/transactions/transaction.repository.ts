import mongoose from 'mongoose';
import Transaction, { ITransaction } from './transaction.model';



export const createTransaction = async (transaction: ITransaction, session?: mongoose.ClientSession) => {
    const [created] = await Transaction.create([transaction], { session });
    return created;
};

export const getAmountPaidForOrder = async (orderId: string, organizationId: string, session?: mongoose.ClientSession): Promise<number> => {
    const [result] = await Transaction.aggregate([
        {
            $match: {
                orderId: new mongoose.Types.ObjectId(orderId),
                organizationId: new mongoose.Types.ObjectId(organizationId),
            },
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: {
                        $cond: [{ $eq: ['$type', 'REFUND'] }, { $multiply: ['$amount', -1] }, '$amount'],
                    },
                },
            },
        },
    ]).session(session ?? null);

    return result?.total ?? 0;
};



export const getTransactionsByOrderId= async(organizationId: string, orderId: string): Promise<ITransaction[]> => {
    return await Transaction.find({ organizationId: new mongoose.Types.ObjectId(organizationId), orderId: new mongoose.Types.ObjectId(orderId) });
}

export const getAmountPaidForOrders = async (orderIds: string[], organizationId: string): Promise<Map<string, number>> => {
    const results = await Transaction.aggregate([
        {
            $match: {
                orderId: { $in: orderIds.map((id) => new mongoose.Types.ObjectId(id)) },
                organizationId: new mongoose.Types.ObjectId(organizationId),
            },
        },
        {
            $group: {
                _id: '$orderId',
                total: {
                    $sum: {
                        $cond: [{ $eq: ['$type', 'REFUND'] }, { $multiply: ['$amount', -1] }, '$amount'],
                    },
                },
            },
        },
    ]);

    return new Map(results.map((result) => [result._id.toString(), result.total]));
};
