import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../../api/items.api';
import { usersApi } from '../../api/users.api';
import { transactionsApi } from '../../api/transactions.api';
import { auditLogsApi } from '../../api/audit-logs.api';
import { Drawer } from '../../components/ui/Drawer';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import type { OrderStatus, OrderWithStatus } from '../../types/order';
import type { AuditLog } from '../../types/audit-log';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

const statusTone: Record<OrderStatus, BadgeTone> = {
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  OVERDUE: 'danger',
  PENDING: 'neutral',
};

type Tab = 'overview' | 'audit';

function describeAuditLog(log: AuditLog): string | null {
  const metadata = log.metadata ?? {};

  switch (log.action) {
    case 'PAYMENT_RECEIVED':
    case 'PAYMENT_REFUNDED':
      return typeof metadata.amount === 'number' ? `Amount: ${metadata.amount}` : null;
    case 'ORDER_DUE_DATE_UPDATED':
      return metadata.oldDueDate && metadata.newDueDate
        ? `${new Date(metadata.oldDueDate as string).toLocaleDateString()} → ${new Date(
            metadata.newDueDate as string,
          ).toLocaleDateString()}`
        : null;
    case 'ORDER_ITEMS_UPDATED':
      return typeof metadata.oldTotalAmount === 'number' && typeof metadata.newTotalAmount === 'number'
        ? `Total: ${metadata.oldTotalAmount} → ${metadata.newTotalAmount}`
        : null;
    default:
      return typeof metadata.from === 'string' && typeof metadata.to === 'string'
        ? `${metadata.from} → ${metadata.to}`
        : null;
  }
}

interface OrderDetailsDrawerProps {
  order: OrderWithStatus;
  onClose: () => void;
}

export function OrderDetailsDrawer({ order, onClose }: OrderDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['user', order.userId],
    queryFn: () => usersApi.getById(order.userId).then((res) => res.data),
  });

  const { data: itemsData } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsApi.list().then((res) => res.data),
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions', order._id],
    queryFn: () => transactionsApi.listByOrder(order._id).then((res) => res.data),
  });

  const { data: auditLogs, isLoading: isLoadingAuditLogs } = useQuery({
    queryKey: ['audit-logs', 'order', order._id],
    queryFn: () => auditLogsApi.listByOrder(order._id).then((res) => res.data),
    enabled: activeTab === 'audit',
  });

  const itemsById = new Map((itemsData?.items ?? []).map((item) => [item._id, item]));
  const balanceDue = order.totalAmount - order.amountPaid;

  return (
    <Drawer title="Order details" onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div className="flex gap-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`-mb-px border-b-2 pb-2 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`-mb-px border-b-2 pb-2 text-sm font-medium transition-colors ${
              activeTab === 'audit'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Audit log
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Customer</p>
                {isLoadingCustomer ? (
                  <p className="text-sm text-slate-400">Loading…</p>
                ) : customer ? (
                  <>
                    <p className="text-sm font-medium text-slate-900">{customer.name}</p>
                    <p className="text-sm text-slate-500">{customer.email}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">{order.userId}</p>
                )}
              </div>
              <Badge tone={statusTone[order.status]}>{order.status.replaceAll('_', ' ')}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Due date</p>
                <p className="text-slate-900">{new Date(order.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Created</p>
                <p className="text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Items</p>
              <div className="overflow-hidden rounded-md border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2">Rate</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {order.items.map((line) => (
                      <tr key={line._id}>
                        <td className="px-3 py-2 text-slate-900">{itemsById.get(line.itemId)?.name ?? line.itemId}</td>
                        <td className="px-3 py-2 text-slate-600">{line.quantity}</td>
                        <td className="px-3 py-2 text-slate-600">{line.rate}</td>
                        <td className="px-3 py-2 text-right text-slate-600">
                          {(line.rate * line.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-1 border-t border-slate-200 pt-3 text-sm">
              <div className="flex items-center justify-between">
                <p className="text-slate-500">Total</p>
                <p className="text-slate-900">{order.totalAmount.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-slate-500">Paid</p>
                <p className="text-slate-900">{order.amountPaid.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between font-medium">
                <p className="text-slate-700">Balance due</p>
                <p className="text-slate-900">{balanceDue.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Transaction history</p>
              {isLoadingTransactions ? (
                <div className="flex justify-center py-6">
                  <Spinner size="sm" />
                </div>
              ) : !transactions || transactions.length === 0 ? (
                <p className="text-sm text-slate-500">No payments or refunds recorded yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-start justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge tone={transaction.type === 'PAYMENT' ? 'success' : 'warning'}>
                            {transaction.type}
                          </Badge>
                          <span className="text-slate-500">{transaction.method ?? '—'}</span>
                        </div>
                        {transaction.note ? <p className="mt-1 text-slate-500">{transaction.note}</p> : null}
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="font-medium text-slate-900">{transaction.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : isLoadingAuditLogs ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : !auditLogs || auditLogs.length === 0 ? (
          <p className="text-sm text-slate-500">No audit activity recorded for this order yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {[...auditLogs]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((log) => {
                const description = describeAuditLog(log);
                return (
                  <li key={log._id} className="flex flex-col gap-1 rounded-md border border-slate-200 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <Badge>{log.action.replaceAll('_', ' ')}</Badge>
                      <span className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    {description ? <p className="text-sm text-slate-600">{description}</p> : null}
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </Drawer>
  );
}
