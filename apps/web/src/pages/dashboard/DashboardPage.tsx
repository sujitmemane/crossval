import type { ComponentType, ReactNode, SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '../../hooks/useOrganization';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { Kbd } from '../../components/ui/Kbd';
import { IconItems, IconOrders, IconTrendUp, IconUsers, IconWallet } from '../../components/ui/Icons';
import { ordersApi } from '../../api/orders.api';
import { ApiError } from '../../lib/api-client';
import { CREATE_SHORTCUTS } from '../../lib/keyboard-shortcuts';
import { formatCount, formatCurrency, formatPercent } from '../../lib/format-currency';
import { paths } from '../../routes/paths';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const shortcutIcons: Record<string, IconComponent> = {
  O: IconOrders,
  I: IconItems,
  U: IconUsers,
};

function StatTile({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'neutral' | 'danger';
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5 shadow-xs">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={`mt-1 text-lg font-semibold tracking-tight ${tone === 'danger' ? 'text-danger' : 'text-foreground'}`}>
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-mutedForeground">{hint}</p> : null}
    </div>
  );
}

function HighlightStat({ label, value, icon, tone }: { label: string; value: string; icon: ReactNode; tone: 'accent' | 'danger' }) {
  const iconBg = tone === 'accent' ? 'bg-accentSoft text-accent' : 'bg-dangerSoft text-danger';

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 shadow-xs">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
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
  const visibleShortcuts = CREATE_SHORTCUTS.filter((shortcut) => !shortcut.adminOnly || user?.role === 'ADMIN');

  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description={
          organization
            ? `${organization.name} · amounts in ${currency}`
            : 'Monitor collections and track overdue accounts.'
        }
        badge={<Badge tone="neutral">{currency}</Badge>}
      />

      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Quick actions</h2>
            <p className="mt-0.5 text-sm text-muted">Create something new — or press the key anywhere.</p>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-3 ${visibleShortcuts.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {visibleShortcuts.map((shortcut) => {
            const Icon = shortcutIcons[shortcut.key];
            return (
              <Link
                key={shortcut.key}
                to={shortcut.path}
                className="group relative overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-xs transition-all hover:border-accent/40 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <Kbd>{shortcut.key}</Kbd>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surfaceMuted text-muted transition-colors group-hover:bg-accentSoft group-hover:text-accent">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground">{shortcut.label}</p>
                  <p className="mt-0.5 text-sm text-muted">{shortcut.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {isLoadingStats ? (
        <div className="flex justify-center rounded-xl border border-border bg-surface py-16 shadow-xs">
          <Spinner size="lg" />
        </div>
      ) : isStatsError ? (
        <EmptyState
          title="Couldn't load stats"
          description={statsError instanceof ApiError ? statsError.message : undefined}
        />
      ) : stats ? (
        <section className="flex flex-col gap-4">
          <div className="rounded-xl bg-brandDark p-5 text-white shadow-sm md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm text-white/70">Total collected</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">{money(stats.totalCollected)}</p>
                <p className="mt-2 text-sm text-accentSoft">
                  {formatPercent(collectionRate)} of {money(stats.totalOrderValue, true)} order value
                </p>
              </div>
              <Link
                to={paths.dashboard.orders}
                className="inline-flex w-fit items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                View all orders
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <HighlightStat
              label="Order value"
              value={money(stats.totalOrderValue)}
              icon={<IconTrendUp className="h-4 w-4" />}
              tone="accent"
            />
            <HighlightStat
              label="Amount due"
              value={money(stats.amountDue)}
              icon={<IconWallet className="h-4 w-4" />}
              tone="danger"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile label="Total orders" value={formatCount(stats.totalOrders)} hint="Active in ledger" />
            <StatTile
              label="Overdue amount"
              value={money(stats.overdueAmount)}
              hint={`${formatCount(stats.overdueOrders)} overdue orders`}
              tone="danger"
            />
            <StatTile label="Outstanding" value={money(stats.amountDue)} hint={`Currency: ${currency}`} />
          </div>
        </section>
      ) : null}

    </div>
  );
}
