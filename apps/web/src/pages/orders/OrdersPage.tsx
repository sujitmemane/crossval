import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../api/orders.api';
import { ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { paths } from '../../routes/paths';
import { PaymentModal } from './PaymentModal';
import { OrderDetailsDrawer } from './OrderDetailsDrawer';
import type { OrderStatus, OrderWithStatus } from '../../types/order';
import type { TransactionType } from '../../types/transaction';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

const statusTone: Record<OrderStatus, BadgeTone> = {
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  OVERDUE: 'danger',
  PENDING: 'neutral',
};

export function OrdersPage() {
  useDocumentTitle('Orders');

  const [paymentModal, setPaymentModal] = useState<{ order: OrderWithStatus; type: TransactionType } | null>(null);
  const [detailsOrder, setDetailsOrder] = useState<OrderWithStatus | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list().then((res) => res.data),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Orders"
        description="Track dues and payment status across customer orders."
        actions={
          <Link
            to={paths.dashboard.ordersNew}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            Add order
          </Link>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load orders" description={error instanceof ApiError ? error.message : undefined} />
      ) : !data || data.orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders you create will show up here." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Due date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.orders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => setDetailsOrder(order)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-slate-600">{new Date(order.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-600">{order.items.length}</td>
                  <td className="px-4 py-3 text-slate-600">{order.totalAmount}</td>
                  <td className="px-4 py-3 text-slate-600">{order.amountPaid}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[order.status]}>{order.status.replaceAll('_', ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        disabled={order.amountPaid >= order.totalAmount}
                        onClick={(event) => {
                          event.stopPropagation();
                          setPaymentModal({ order, type: 'PAYMENT' });
                        }}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
                      >
                        Pay
                      </button>
                      <button
                        type="button"
                        disabled={order.amountPaid <= 0}
                        onClick={(event) => {
                          event.stopPropagation();
                          setPaymentModal({ order, type: 'REFUND' });
                        }}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
                      >
                        Refund
                      </button>
                      <Link
                        to={paths.dashboard.orderEdit(order._id)}
                        onClick={(event) => event.stopPropagation()}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paymentModal ? (
        <PaymentModal
          order={paymentModal.order}
          type={paymentModal.type}
          onClose={() => setPaymentModal(null)}
        />
      ) : null}

      {detailsOrder ? <OrderDetailsDrawer order={detailsOrder} onClose={() => setDetailsOrder(null)} /> : null}
    </div>
  );
}
