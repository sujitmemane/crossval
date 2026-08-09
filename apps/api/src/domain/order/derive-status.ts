export type OrderStatus = "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";

interface DeriveOrderStatusInput {
  totalAmount: number;
  amountPaid: number;
  dueDate: Date;
  now?: Date;
}

export function deriveOrderStatus({
  totalAmount,
  amountPaid,
  dueDate,
  now = new Date(),
}: DeriveOrderStatusInput): OrderStatus {
  if (amountPaid >= totalAmount) return "PAID";
  if (now > dueDate) return "OVERDUE";
  if (amountPaid > 0) return "PARTIALLY_PAID";
  return "PENDING";
}
