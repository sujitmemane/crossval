interface OrderItemForTotal {
    quantity: number;
    rate: number;
}

export const calculateOrderTotal = (items: OrderItemForTotal[]): number => {
    return items.reduce((total, item) => total + item.quantity * item.rate, 0);
};
