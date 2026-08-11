import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders.api';
import { ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ButtonLink } from '../../components/ui/Button';
import { useOrganization } from '../../hooks/useOrganization';
import { formatCurrency, formatCount } from '../../lib/format-currency';
import { paths } from '../../routes/paths';
import { PaymentModal } from './PaymentModal';
import { OrderDetailsDrawer } from './OrderDetailsDrawer';
import { OrderRowActions } from './OrderRowActions';
import type { OrderStatus, OrderWithStatus } from '../../types/order';
import type { TransactionType } from '../../types/transaction';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

const statusTone: Record<OrderStatus, BadgeTone> = {
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  OVERDUE: 'danger',
  PENDING: 'neutral',
};

function formatStatus(status: OrderStatus) {
  return status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDueDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function OrdersPage() {
  useDocumentTitle('Orders');
  const { data: organization } = useOrganization();
  const currency = organization?.currency ?? 'USD';
  const money = (value: number) => formatCurrency(value, currency);

  const [paymentModal, setPaymentModal] = useState<{ order: OrderWithStatus; type: TransactionType } | null>(null);
  const [detailsOrderId, setDetailsOrderId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list().then((res) => res.data),
  });

  const detailsOrder = data?.orders.find((order) => order._id === detailsOrderId) ?? null;

  const openPaymentModal = (order: OrderWithStatus, type: TransactionType) => {
    setPaymentModal({ order, type });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Orders"
        badge={data ? <Badge tone="neutral">{formatCount(data.pagination.total)} total</Badge> : undefined}
        description={
          organization
            ? `Track dues and payment status · amounts shown in ${organization.currency}`
            : 'Track dues and payment status across customer orders.'
        }
        actions={<ButtonLink to={paths.dashboard.ordersNew}>New order</ButtonLink>}
      />

      {isLoading ? (
        <Card padding="none" className="flex min-h-[320px] items-center justify-center">
          <Spinner size="lg" />
        </Card>
      ) : isError ? (
        <EmptyState title="Couldn't load orders" description={error instanceof ApiError ? error.message : undefined} />
      ) : !data || data.orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders you create will show up here."
          action={<ButtonLink to={paths.dashboard.ordersNew} size="sm">Add your first order</ButtonLink>}
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surfaceMuted/50">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted">Due date</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted">Items</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted">Total</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted">Paid</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.orders.map((order) => {
                  const isSelected = detailsOrder?._id === order._id;
                  return (
                    <tr
                      key={order._id}
                      onClick={() => setDetailsOrderId(order._id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-surfaceMuted/70' : 'hover:bg-surfaceMuted/40'
                      }`}
                    >
                      <td
                        className={`whitespace-nowrap px-5 py-3.5 ${
                          order.status === 'OVERDUE' ? 'font-medium text-danger' : 'text-muted'
                        } ${isSelected ? 'border-l-2 border-l-foreground' : 'border-l-2 border-l-transparent'}`}
                      >
                        {formatDueDate(order.dueDate)}
                      </td>
                      <td className="px-5 py-3.5 text-muted">
                        {order.items.length} item{order.items.length === 1 ? '' : 's'}
                      </td>
                      <td className="tabular-nums px-5 py-3.5 text-right font-medium text-foreground">
                        {money(order.totalAmount)}
                      </td>
                      <td className="tabular-nums px-5 py-3.5 text-right text-muted">{money(order.amountPaid)}</td>
                      <td className="px-5 py-3.5">
                        <Badge tone={statusTone[order.status]}>{formatStatus(order.status)}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <OrderRowActions order={order} onPayment={openPaymentModal} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {paymentModal ? (
        <PaymentModal
          order={paymentModal.order}
          type={paymentModal.type}
          onClose={() => setPaymentModal(null)}
        />
      ) : null}

      {detailsOrder ? <OrderDetailsDrawer order={detailsOrder} onClose={() => setDetailsOrderId(null)} /> : null}
    </div>
  );
}
