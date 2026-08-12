import { useEffect, useState } from 'react';
import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import { itemsApi } from '../../api/items.api';
import { ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useOrganization } from '../../hooks/useOrganization';
import { itemsQueryKeys } from '../../lib/items-query-keys';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ListToolbar } from '../../components/ui/ListToolbar';
import { formatCount } from '../../lib/format-currency';
import { paths } from '../../routes/paths';
import { ItemRow } from './ItemRow';
import type { ItemStatus } from '../../types/item';

type StatusFilter = 'ALL' | ItemStatus;

const PAGE_SIZE = 20;
const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'AVAILABLE', label: 'Available' },
  { id: 'UNAVAILABLE', label: 'Unavailable' },
];

export function ItemsPage() {
  useDocumentTitle('Items');
  const { data: organization } = useOrganization();
  const currency = organization?.currency ?? 'USD';

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  const listParams = {
    ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: itemsQueryKeys.list(listParams),
    queryFn: () => itemsApi.list(listParams).then((res) => res.data),
    placeholderData: keepPreviousData,
  });

  const countQueries = useQueries({
    queries: STATUS_TABS.map((tab) => ({
      queryKey: itemsQueryKeys.count(tab.id),
      queryFn: () =>
        itemsApi
          .list({
            ...(tab.id !== 'ALL' ? { status: tab.id } : {}),
            page: 1,
            limit: 1,
          })
          .then((res) => res.data.pagination.total),
      staleTime: 30_000,
    })),
  });

  const tabCounts = Object.fromEntries(
    STATUS_TABS.map((tab, index) => [tab.id, countQueries[index]?.data]),
  ) as Partial<Record<StatusFilter, number>>;

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1;
  const hasActiveFilters = statusFilter !== 'ALL' || debouncedSearch.length > 0;
  const allCountQuery = countQueries[0];
  const isCatalogEmpty = allCountQuery?.isSuccess && allCountQuery.data === 0;
  const showInitialLoading = isLoading && !data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Items"
        badge={
          allCountQuery.data !== undefined ? (
            <Badge tone="neutral">{formatCount(allCountQuery.data)} total</Badge>
          ) : undefined
        }
        description="Manage the products and services your organization sells."
        actions={<ButtonLink to={paths.dashboard.itemsNew}>Add item</ButtonLink>}
      />

      {showInitialLoading ? (
        <Card padding="none" className="flex min-h-[320px] items-center justify-center">
          <Spinner size="lg" />
        </Card>
      ) : isError ? (
        <EmptyState title="Couldn't load items" description={error instanceof ApiError ? error.message : undefined} />
      ) : isCatalogEmpty ? (
        <EmptyState
          title="No items yet"
          description="Items you add will show up here."
          action={<ButtonLink to={paths.dashboard.itemsNew} size="sm">Add your first item</ButtonLink>}
        />
      ) : (
        <div className="flex flex-col gap-4">
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
            searchPlaceholder="Search by name…"
          />

          {items.length === 0 ? (
            <EmptyState
              title="No matching items"
              description="Try a different search or clear your filters."
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
            <Card padding="none" className={`overflow-hidden ${isFetching ? 'opacity-80' : ''}`}>
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <ItemRow key={item._id} item={item} currency={currency} />
                ))}
              </div>

              {pagination && pagination.total > PAGE_SIZE ? (
                <div className="flex items-center justify-between border-t border-border bg-surfaceMuted/30 px-5 py-3 text-sm">
                  <p className="text-muted">
                    Showing {(pagination.page - 1) * pagination.limit + 1}–
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {formatCount(pagination.total)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={page <= 1 || isFetching}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      Previous
                    </Button>
                    <span className="tabular-nums text-muted">
                      {pagination.page} / {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={page >= totalPages || isFetching}
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
