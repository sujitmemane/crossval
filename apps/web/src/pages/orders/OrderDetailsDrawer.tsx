import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders.api';
import { itemsApi } from '../../api/items.api';
import { ITEMS_CATALOG_LIMIT, itemsQueryKeys } from '../../lib/items-query-keys';
import { usersApi } from '../../api/users.api';
import { transactionsApi } from '../../api/transactions.api';
import { auditLogsApi } from '../../api/audit-logs.api';
import { Drawer } from '../../components/ui/Drawer';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { PaymentModal } from './PaymentModal';
import { OrderRowActions } from './OrderRowActions';
import type { AuditLog } from '../../types/audit-log';
import type { TransactionType } from '../../types/transaction';
import { useOrganization } from '../../hooks/useOrganization';
import { formatCurrency } from '../../lib/format-currency';
import { formatOrderLabel } from '../../lib/format-order-id';
import { formatOrderStatus, orderStatusTone } from '../../lib/format-order-status';

type Tab = 'overview' | 'audit';

function describeAuditLog(log: AuditLog, money: (value: number) => string): string | null {
  const metadata = log.metadata ?? {};

  switch (log.action) {
    case 'PAYMENT_RECEIVED':
    case 'PAYMENT_REFUNDED':
      return typeof metadata.amount === 'number' ? `Amount: ${money(metadata.amount)}` : null;
    case 'ORDER_DUE_DATE_UPDATED':
      return metadata.oldDueDate && metadata.newDueDate
        ? `${new Date(metadata.oldDueDate as string).toLocaleDateString()} → ${new Date(
            metadata.newDueDate as string,
          ).toLocaleDateString()}`
        : null;
    case 'ORDER_ITEMS_UPDATED':
      return typeof metadata.oldTotalAmount === 'number' && typeof metadata.newTotalAmount === 'number'
        ? `Total: ${money(metadata.oldTotalAmount)} → ${money(metadata.newTotalAmount)}`
        : null;
    default:
      return typeof metadata.from === 'string' && typeof metadata.to === 'string'
        ? `${metadata.from} → ${metadata.to}`
        : null;
  }
}

interface OrderDetailsDrawerProps {
  orderId: string;
  onClose: () => void;
}

export function OrderDetailsDrawer({ orderId, onClose }: OrderDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [paymentType, setPaymentType] = useState<TransactionType | null>(null);
  const { data: organization } = useOrganization();
  const currency = organization?.currency ?? 'USD';
  const money = (value: number) => formatCurrency(value, currency);

  const { data: ordersData } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list().then((res) => res.data),
  });

  const order = ordersData?.orders.find((entry) => entry._id === orderId);

  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['user', order?.userId],
    queryFn: () => usersApi.getById(order!.userId).then((res) => res.data),
    enabled: Boolean(order?.userId),
  });

  const { data: itemsData } = useQuery({
    queryKey: itemsQueryKeys.catalog(),
    queryFn: () => itemsApi.list({ limit: ITEMS_CATALOG_LIMIT }).then((res) => res.data),
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions', orderId],
    queryFn: () => transactionsApi.listByOrder(orderId).then((res) => res.data),
    enabled: Boolean(order),
  });

  const { data: auditLogs, isLoading: isLoadingAuditLogs } = useQuery({
    queryKey: ['audit-logs', 'order', orderId],
    queryFn: () => auditLogsApi.listByOrder(orderId).then((res) => res.data),
    enabled: activeTab === 'audit' && Boolean(order),
  });

  if (!order) {
    return (
      <Drawer title="Order details" onClose={onClose}>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </Drawer>
    );
  }

  const itemsById = new Map((itemsData?.items ?? []).map((item) => [item._id, item]));
  const balanceDue = order.totalAmount - order.amountPaid;
  const paidPercent = order.totalAmount > 0 ? Math.min(100, (order.amountPaid / order.totalAmount) * 100) : 0;

  return (
    <>
      <Drawer
        title={formatOrderLabel(order._id)}
        onClose={onClose}
        footer={
          <OrderRowActions
            order={order}
            currency={currency}
            variant="footer"
            onPayment={(_order, type) => setPaymentType(type)}
          />
        }
      >
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Badge tone={orderStatusTone[order.status]}>{formatOrderStatus(order.status)}</Badge>
              <span className="text-sm text-muted">
                {order.items.length} item{order.items.length === 1 ? '' : 's'} · {money(order.totalAmount)}
              </span>
            </div>

            <div className="rounded-md border border-border bg-surfaceMuted/30 p-3">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Payment progress</span>
                <span className="tabular-nums">{paidPercent.toFixed(0)}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surfaceMuted">
                <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${paidPercent}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-muted">Paid {money(order.amountPaid)}</span>
                <span className="font-medium text-foreground">{money(balanceDue)} due</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 border-b border-border">
            {(['overview', 'audit'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`-mb-px border-b-2 pb-2 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-accent text-foreground'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                {tab === 'audit' ? 'Audit log' : tab}
              </button>
            ))}
          </div>

          {activeTab === 'overview' ? (
            <div className="flex flex-col gap-7">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Customer</p>
                {isLoadingCustomer ? (
                  <p className="text-sm text-mutedForeground">Loading…</p>
                ) : customer ? (
                  <>
                    <p className="text-sm font-medium text-foreground">{customer.name}</p>
                    <p className="text-sm text-muted">{customer.email}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted">{order.userId}</p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Due date</p>
                <p className={`text-sm ${order.status === 'OVERDUE' ? 'font-medium text-danger' : 'text-foreground'}`}>
                  {new Date(order.dueDate).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Created</p>
                  <p className="text-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Updated</p>
                  <p className="text-foreground">{new Date(order.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Items</p>
                <div className="overflow-hidden rounded-md border border-border">
                  <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-surfaceMuted text-left text-xs font-medium text-muted">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2">Qty</th>
                        <th className="px-3 py-2">Rate</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {order.items.map((line) => (
                        <tr key={line._id}>
                          <td className="px-3 py-2 text-foreground">
                            {itemsById.get(line.itemId)?.name ?? line.itemId}
                          </td>
                          <td className="px-3 py-2 text-muted">{line.quantity}</td>
                          <td className="px-3 py-2 tabular-nums text-muted">{money(line.rate)}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-muted">
                            {money(line.rate * line.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Transaction history</p>
                {isLoadingTransactions ? (
                  <div className="flex justify-center py-6">
                    <Spinner size="sm" />
                  </div>
                ) : !transactions || transactions.length === 0 ? (
                  <EmptyState
                    title="No transactions yet"
                    description="Payments and refunds for this order will appear here."
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction._id}
                        className="flex items-start justify-between rounded-md border border-border px-3 py-2 text-sm"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge tone={transaction.type === 'PAYMENT' ? 'success' : 'warning'}>
                              {transaction.type}
                            </Badge>
                            <span className="text-muted">{transaction.method ?? '—'}</span>
                          </div>
                          {transaction.note ? <p className="mt-1 text-muted">{transaction.note}</p> : null}
                          <p className="mt-1 text-xs text-mutedForeground">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="tabular-nums font-medium text-foreground">{money(transaction.amount)}</p>
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
            <EmptyState
              title="No audit activity"
              description="Changes to this order will be recorded here automatically."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {[...auditLogs]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((log) => {
                  const description = describeAuditLog(log, money);
                  return (
                    <li key={log._id} className="flex flex-col gap-1 rounded-md border border-border px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge>{log.action.replaceAll('_', ' ')}</Badge>
                        <span className="shrink-0 text-xs text-mutedForeground">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {description ? <p className="text-sm text-muted">{description}</p> : null}
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </Drawer>

      {paymentType ? (
        <PaymentModal order={order} type={paymentType} onClose={() => setPaymentType(null)} />
      ) : null}
    </>
  );
}
