import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders.api';
import { ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ButtonLink } from '../../components/ui/Button';
import { ListToolbar } from '../../components/ui/ListToolbar';
import { IconOrders } from '../../components/ui/Icons';
import { useOrganization } from '../../hooks/useOrganization';
import { formatCurrency, formatCount } from '../../lib/format-currency';
import { formatOrderStatus, orderStatusTone } from '../../lib/format-order-status';
import { formatOrderLabel } from '../../lib/format-order-id';
import { paths } from '../../routes/paths';
import { PaymentModal } from './PaymentModal';
import { OrderDetailsDrawer } from './OrderDetailsDrawer';
import { OrderRowActions } from './OrderRowActions';
import { ExportOrdersBar } from './ExportOrdersBar';
import type { OrderStatus, OrderWithStatus } from '../../types/order';
import type { TransactionType } from '../../types/transaction';

type StatusFilter = 'ALL' | OrderStatus;

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'PARTIALLY_PAID', label: 'Partial' },
  { id: 'OVERDUE', label: 'Overdue' },
  { id: 'PAID', label: 'Paid' },
];

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

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [paymentModal, setPaymentModal] = useState<{ order: OrderWithStatus; type: TransactionType } | null>(null);
  const [detailsOrderId, setDetailsOrderId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list().then((res) => res.data),
  });

  const tabCounts = useMemo(() => {
    const orders = data?.orders ?? [];
    const counts: Partial<Record<StatusFilter, number>> = { ALL: orders.length };
    for (const order of orders) {
      counts[order.status] = (counts[order.status] ?? 0) + 1;
    }
    return counts;
  }, [data?.orders]);

  const filteredOrders = useMemo(() => {
    let orders = data?.orders ?? [];
    if (statusFilter !== 'ALL') {
      orders = orders.filter((order) => order.status === statusFilter);
    }
    if (debouncedSearch) {
      orders = orders.filter((order) => {
        const label = formatOrderLabel(order._id).toLowerCase();
        const due = formatDueDate(order.dueDate).toLowerCase();
        return label.includes(debouncedSearch) || due.includes(debouncedSearch);
      });
    }
    return orders;
  }, [data?.orders, statusFilter, debouncedSearch]);

  const hasActiveFilters = statusFilter !== 'ALL' || debouncedSearch.length > 0;
  const hasOrders = (data?.orders.length ?? 0) > 0;

  const openPaymentModal = (order: OrderWithStatus, type: TransactionType) => {
    setPaymentModal({ order, type });
  };

  return (
    <div className="flex flex-col gap-6">
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
        <EmptyState
          title="Couldn't load orders"
          description={error instanceof ApiError ? error.message : undefined}
          onRetry={() => refetch()}
        />
      ) : !hasOrders ? (
        <EmptyState
          icon={<IconOrders className="h-5 w-5" />}
          title="No orders yet"
          description="Create your first order to start tracking payments and due dates."
          action={<ButtonLink to={paths.dashboard.ordersNew} size="sm">Add your first order</ButtonLink>}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <ExportOrdersBar />

          <ListToolbar
            tabs={STATUS_TABS.map((tab) => ({
              id: tab.id,
              label: tab.label,
              count: tabCounts[tab.id],
            }))}
            activeTab={statusFilter}
            onTabChange={(id) => setStatusFilter(id as StatusFilter)}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by order ID or due date…"
          />

          {filteredOrders.length === 0 ? (
            <EmptyState
              title="No matching orders"
              description="Try a different status or search term."
              action={
                hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('ALL');
                      setSearch('');
                    }}
                    className="text-sm font-medium text-muted hover:text-foreground hover:underline"
                  >
                    Clear filters
                  </button>
                ) : undefined
              }
            />
          ) : (
            <Card padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surfaceMuted/50">
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted">Due date</th>
                      <th className="hidden px-5 py-3 text-left text-xs font-medium text-muted sm:table-cell">Order</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted">Items</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-muted">Total</th>
                      <th className="hidden px-5 py-3 text-right text-xs font-medium text-muted md:table-cell">Paid</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted">Status</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-muted">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map((order) => {
                      const isSelected = detailsOrderId === order._id;
                      const balanceDue = order.totalAmount - order.amountPaid;
                      return (
                        <tr
                          key={order._id}
                          tabIndex={0}
                          onClick={() => setDetailsOrderId(order._id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setDetailsOrderId(order._id);
                            }
                          }}
                          className={`cursor-pointer transition-colors outline-none focus-visible:bg-surfaceMuted/50 ${
                            isSelected ? 'bg-surfaceMuted/70' : 'hover:bg-surfaceMuted/40'
                          }`}
                        >
                          <td
                            className={`whitespace-nowrap px-5 py-3.5 ${
                              order.status === 'OVERDUE' ? 'font-medium text-danger' : 'text-muted'
                            } ${isSelected ? 'border-l-2 border-l-accent' : 'border-l-2 border-l-transparent'}`}
                          >
                            {formatDueDate(order.dueDate)}
                          </td>
                          <td className="hidden whitespace-nowrap px-5 py-3.5 text-muted sm:table-cell">
                            {formatOrderLabel(order._id)}
                          </td>
                          <td className="px-5 py-3.5 text-muted">
                            {order.items.length} item{order.items.length === 1 ? '' : 's'}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <p className="tabular-nums font-medium text-foreground">{money(order.totalAmount)}</p>
                            {balanceDue > 0 && order.status !== 'PAID' ? (
                              <p className="tabular-nums text-xs text-muted md:hidden">{money(balanceDue)} due</p>
                            ) : null}
                          </td>
                          <td className="hidden tabular-nums px-5 py-3.5 text-right text-muted md:table-cell">
                            {money(order.amountPaid)}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge tone={orderStatusTone[order.status]}>{formatOrderStatus(order.status)}</Badge>
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
        </div>
      )}

      {paymentModal ? (
        <PaymentModal
          order={paymentModal.order}
          type={paymentModal.type}
          onClose={() => setPaymentModal(null)}
        />
      ) : null}

      {detailsOrderId ? (
        <OrderDetailsDrawer orderId={detailsOrderId} onClose={() => setDetailsOrderId(null)} />
      ) : null}
    </div>
  );
}
