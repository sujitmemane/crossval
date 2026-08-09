import { calculateOrderTotal } from './calculate-total';

interface OrderItemForTotal {
    quantity: number;
    rate: number;
}

export function isOrderUpdateAllowed(amountPaid: number, currentTotalAmount: number, newItems: OrderItemForTotal[]): boolean {
    if (amountPaid >= currentTotalAmount) return false;

    const newTotalAmount = calculateOrderTotal(newItems);
    return newTotalAmount >= amountPaid;
}
