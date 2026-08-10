import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import type { OrderStatus, OrdersResponse } from '../../types/order';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

const statusTone: Record<OrderStatus, BadgeTone> = {
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  OVERDUE: 'danger',
  PENDING: 'neutral',
};

export function OrdersPage() {
  useDocumentTitle('Orders');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiFetch<OrdersResponse>('/orders').then((res) => res.data),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Orders" description="Track dues and payment status across customer orders." />

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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-4 py-3 text-slate-600">{new Date(order.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-600">{order.items.length}</td>
                  <td className="px-4 py-3 text-slate-600">{order.totalAmount}</td>
                  <td className="px-4 py-3 text-slate-600">{order.amountPaid}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[order.status]}>{order.status.replaceAll('_', ' ')}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
