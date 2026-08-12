import { Link } from 'react-router-dom';
import { paths } from '../../routes/paths';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/format-currency';
import type { OrderWithStatus } from '../../types/order';
import type { TransactionType } from '../../types/transaction';

interface OrderRowActionsProps {
  order: OrderWithStatus;
  onPayment: (order: OrderWithStatus, type: TransactionType) => void;
  variant?: 'inline' | 'footer';
  currency?: string;
}

const actionBase =
  'inline-flex h-7 items-center px-2.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';

export function OrderRowActions({
  order,
  onPayment,
  variant = 'inline',
  currency = 'USD',
}: OrderRowActionsProps) {
  const canPay = order.amountPaid < order.totalAmount;
  const canRefund = order.amountPaid > 0;
  const balanceDue = order.totalAmount - order.amountPaid;
  const money = (value: number) => formatCurrency(value, currency);

  if (variant === 'footer') {
    return (
      <div className="flex w-full flex-col gap-3" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between rounded-md border border-border bg-surfaceMuted/30 px-3 py-2.5 text-sm">
          <div>
            <p className="text-xs text-muted">Balance due</p>
            <p className="tabular-nums font-semibold text-foreground">{money(balanceDue)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Paid so far</p>
            <p className="tabular-nums font-medium text-foreground">{money(order.amountPaid)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button type="button" disabled={!canPay} onClick={() => onPayment(order, 'PAYMENT')}>
            Record payment
          </Button>
          <Button type="button" variant="secondary" disabled={!canRefund} onClick={() => onPayment(order, 'REFUND')}>
            Issue refund
          </Button>
        </div>

        <Link
          to={paths.dashboard.orderEdit(order._id)}
          className="text-center text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          Edit order
        </Link>
      </div>
    );
  }

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
