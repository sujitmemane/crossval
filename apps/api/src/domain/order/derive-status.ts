export type OrderStatus = "pending" | "partially_paid" | "paid" | "overdue";

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
  if (amountPaid >= totalAmount) return "paid";
  if (now > dueDate) return "overdue";
  if (amountPaid > 0) return "partially_paid";
  return "pending";
}
