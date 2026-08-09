export function isRefundAllowed(amountPaid: number, refundAmount: number): boolean {
    return refundAmount <= amountPaid;
}

export function isPaymentAllowed(amountPaid: number, totalAmount: number, paymentAmount: number): boolean {
    return amountPaid + paymentAmount <= totalAmount;
}
