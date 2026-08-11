import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ordersApi } from '../../api/orders.api';
import { ApiError } from '../../lib/api-client';
import { paths } from '../../routes/paths';

interface QuickLink {
  to: string;
  title: string;
  description: string;
  adminOnly?: boolean;
}

const quickLinks: QuickLink[] = [
  { to: paths.dashboard.orders, title: 'Orders', description: 'Track dues and payment status across customer orders.' },
  { to: paths.dashboard.items, title: 'Items', description: 'Manage the products and services you sell.' },
  { to: paths.dashboard.users, title: 'Users', description: 'Invite teammates and manage roles.', adminOnly: true },
];

const countFormatter = new Intl.NumberFormat('en-US');
const amountFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compactAmountFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

function formatAmount(value: number) {
  return Math.abs(value) >= 100000 ? compactAmountFormatter.format(value) : amountFormatter.format(value);
}

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();

  const { data: stats, isLoading: isLoadingStats, isError: isStatsError, error: statsError } = useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: () => ordersApi.stats().then((res) => res.data),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Welcome back, ${user?.name ?? ''}`} description="Here's a quick jump-off point for Settle." />

      {isLoadingStats ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : isStatsError ? (
        <EmptyState
          title="Couldn't load stats"
          description={statsError instanceof ApiError ? statsError.message : undefined}
        />
      ) : stats ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total orders" value={countFormatter.format(stats.totalOrders)} />
          <StatCard label="Total order value" value={formatAmount(stats.totalOrderValue)} />
          <StatCard label="Total collected" value={formatAmount(stats.totalCollected)} />
          <StatCard label="Amount due" value={formatAmount(stats.amountDue)} />
          <StatCard label="Overdue amount" value={formatAmount(stats.overdueAmount)} tone="danger" />
          <StatCard label="Overdue orders" value={countFormatter.format(stats.overdueOrders)} tone="danger" />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks
          .filter((link) => !link.adminOnly || user?.role === 'ADMIN')
          .map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">{link.title}</p>
              <p className="mt-1 text-sm text-slate-500">{link.description}</p>
            </Link>
          ))}
      </div>
    </div>
  );
}
