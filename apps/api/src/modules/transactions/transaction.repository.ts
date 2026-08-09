import mongoose from 'mongoose';
import Transaction from './transaction.model';

export const getAmountPaidForOrder = async (orderId: string, organizationId: string): Promise<number> => {
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
    ]);

    return result?.total ?? 0;
};
