import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import type { OrdersResponse } from '../../types/order';
import type { Transaction } from '../../types/transaction';

export function TransactionsPage() {
  useDocumentTitle('Transactions');
  const [orderId, setOrderId] = useState('');

  const ordersQuery = useQuery({
    queryKey: ['orders', 'picker'],
    queryFn: () => apiFetch<OrdersResponse>('/orders', { params: { limit: 100 } }).then((res) => res.data),
  });

  const transactionsQuery = useQuery({
    queryKey: ['transactions', orderId],
    queryFn: () => apiFetch<Transaction[]>('/transactions', { params: { orderId } }).then((res) => res.data),
    enabled: orderId.length > 0,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Transactions" description="Payments and refunds recorded against an order." />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Order</span>
        <select
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          value={orderId}
          onChange={(event) => setOrderId(event.target.value)}
        >
          <option value="">Select an order…</option>
          {ordersQuery.data?.orders.map((order) => (
            <option key={order._id} value={order._id}>
              {order._id} · due {new Date(order.dueDate).toLocaleDateString()}
            </option>
          ))}
        </select>
      </label>

      {!orderId ? (
        <EmptyState title="Pick an order" description="Select an order above to see its transactions." />
      ) : transactionsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : transactionsQuery.isError ? (
        <EmptyState
          title="Couldn't load transactions"
          description={transactionsQuery.error instanceof ApiError ? transactionsQuery.error.message : undefined}
        />
      ) : !transactionsQuery.data || transactionsQuery.data.length === 0 ? (
        <EmptyState title="No transactions yet" description="Payments and refunds for this order will show up here." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {transactionsQuery.data.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="px-4 py-3">
                    <Badge tone={transaction.type === 'PAYMENT' ? 'success' : 'warning'}>{transaction.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{transaction.amount}</td>
                  <td className="px-4 py-3 text-slate-600">{transaction.method ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{transaction.note ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(transaction.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
