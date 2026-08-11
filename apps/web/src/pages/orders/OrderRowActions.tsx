import { Link } from 'react-router-dom';
import { paths } from '../../routes/paths';
import type { OrderWithStatus } from '../../types/order';
import type { TransactionType } from '../../types/transaction';

interface OrderRowActionsProps {
  order: OrderWithStatus;
  onPayment: (order: OrderWithStatus, type: TransactionType) => void;
}

const actionBase =
  'inline-flex h-7 items-center px-2.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';

export function OrderRowActions({ order, onPayment }: OrderRowActionsProps) {
  const canPay = order.amountPaid < order.totalAmount;
  const canRefund = order.amountPaid > 0;

  return (
    <div
      className="inline-flex items-center overflow-hidden rounded-md border border-border bg-surface shadow-xs"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        disabled={!canPay}
        onClick={() => onPayment(order, 'PAYMENT')}
        className={`${actionBase} text-accent hover:bg-accentSoft disabled:hover:bg-transparent`}
      >
        Pay
      </button>

      <span className="h-4 w-px bg-border" aria-hidden />

      <button
        type="button"
        disabled={!canRefund}
        onClick={() => onPayment(order, 'REFUND')}
        className={`${actionBase} text-muted hover:bg-surfaceMuted hover:text-foreground disabled:hover:bg-transparent`}
      >
        Refund
      </button>

      <span className="h-4 w-px bg-border" aria-hidden />

      <Link
        to={paths.dashboard.orderEdit(order._id)}
        className={`${actionBase} text-foreground hover:bg-surfaceMuted`}
      >
        Edit
      </Link>
    </div>
  );
}
