import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '../../hooks/useOrganization';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ButtonLink } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SectionHeader } from '../../components/ui/Card';
import { IconChevronRight, IconItems, IconOrders, IconTrendUp, IconUsers, IconWallet } from '../../components/ui/Icons';
import { ordersApi } from '../../api/orders.api';
import { ApiError } from '../../lib/api-client';
import { formatCount, formatCurrency, formatPercent } from '../../lib/format-currency';
import { paths } from '../../routes/paths';

interface QuickLink {
  to: string;
  title: string;
  description: string;
  icon: typeof IconOrders;
  adminOnly?: boolean;
}

const quickLinks: QuickLink[] = [
  {
    to: paths.dashboard.orders,
    title: 'Orders',
    description: 'Track dues and payment status.',
    icon: IconOrders,
  },
  {
    to: paths.dashboard.items,
    title: 'Items',
    description: 'Manage products and services.',
    icon: IconItems,
  },
  {
    to: paths.dashboard.users,
    title: 'Users',
    description: 'Invite teammates and manage roles.',
    icon: IconUsers,
    adminOnly: true,
  },
];

interface AccountCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: 'neutral' | 'success' | 'danger';
}

function AccountCard({ label, value, hint, tone = 'neutral' }: AccountCardProps) {
  const valueClass =
    tone === 'success' ? 'text-success' : tone === 'danger' ? 'text-danger' : 'text-foreground';

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={`mt-1 text-lg font-semibold tracking-tight ${valueClass}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-mutedForeground">{hint}</p> : null}
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  tone: 'accent' | 'danger';
}

function SummaryCard({ label, value, icon, tone }: SummaryCardProps) {
  const iconBg = tone === 'accent' ? 'bg-accentSoft text-accent' : 'bg-dangerSoft text-danger';

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="truncate text-base font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { data: organization } = useOrganization();
  const currency = organization?.currency ?? 'USD';

  const { data: stats, isLoading: isLoadingStats, isError: isStatsError, error: statsError } = useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: () => ordersApi.stats().then((res) => res.data),
  });

  const collectionRate =
    stats && stats.totalOrderValue > 0 ? (stats.totalCollected / stats.totalOrderValue) * 100 : 0;

  const money = (value: number, compact = false) => formatCurrency(value, currency, compact);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={organization ? `${organization.name} · all amounts in ${currency}` : 'Monitor collections and track overdue accounts.'}
        badge={<Badge tone="neutral">{currency}</Badge>}
        actions={<ButtonLink to={paths.dashboard.ordersNew}>New order</ButtonLink>}
      />

      {isLoadingStats ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : isStatsError ? (
        <EmptyState
          title="Couldn't load stats"
          description={statsError instanceof ApiError ? statsError.message : undefined}
        />
      ) : stats ? (
        <>
          <section className="rounded-xl bg-brandDark p-5 text-white shadow-sm md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-white/70">Total collected</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">{money(stats.totalCollected)}</p>
                <p className="mt-2 text-sm text-accentSoft">
                  {formatPercent(collectionRate)} of {money(stats.totalOrderValue, true)} order value
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ButtonLink to={paths.dashboard.ordersNew} className="bg-accent hover:bg-accentMuted">
                  New order
                </ButtonLink>
                <Link
                  to={paths.dashboard.orders}
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  View orders
                </Link>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <SummaryCard
              label="Order value"
              value={money(stats.totalOrderValue)}
              icon={<IconTrendUp className="h-5 w-5" />}
              tone="accent"
            />
            <SummaryCard
              label="Amount due"
              value={money(stats.amountDue)}
              icon={<IconWallet className="h-5 w-5" />}
              tone="danger"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <AccountCard label="Total orders" value={formatCount(stats.totalOrders)} hint="Active in ledger" />
            <AccountCard
              label="Overdue amount"
              value={money(stats.overdueAmount)}
              hint={`${formatCount(stats.overdueOrders)} overdue orders`}
              tone="danger"
            />
            <AccountCard
              label="Outstanding"
              value={money(stats.amountDue)}
              hint={`Currency: ${currency}`}
            />
          </div>
        </>
      ) : null}

      <section>
        <SectionHeader title="Quick links" description="Jump to common workflows." />
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
          {quickLinks
            .filter((link) => !link.adminOnly || user?.role === 'ADMIN')
            .map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surfaceMuted/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surfaceMuted text-muted transition-colors group-hover:bg-accentSoft group-hover:text-accent">
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{link.title}</p>
                    <p className="text-sm text-muted">{link.description}</p>
                  </div>
                  <IconChevronRight className="h-4 w-4 shrink-0 text-mutedForeground group-hover:text-muted" />
                </Link>
              );
            })}
        </div>
      </section>
    </div>
  );
}
