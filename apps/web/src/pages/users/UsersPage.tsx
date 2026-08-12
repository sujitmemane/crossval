import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../api/users.api';
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
import { IconUsers } from '../../components/ui/Icons';
import { formatCount } from '../../lib/format-currency';
import { paths } from '../../routes/paths';

type RoleFilter = 'ALL' | 'ADMIN' | 'CUSTOMER';

const ROLE_TABS: { id: RoleFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'ADMIN', label: 'Admins' },
  { id: 'CUSTOMER', label: 'Customers' },
];

export function UsersPage() {
  useDocumentTitle('Users');

  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((res) => res.data),
  });

  const tabCounts = useMemo(() => {
    const users = data?.users ?? [];
    return {
      ALL: users.length,
      ADMIN: users.filter((user) => user.role === 'ADMIN').length,
      CUSTOMER: users.filter((user) => user.role === 'CUSTOMER').length,
    };
  }, [data?.users]);

  const filteredUsers = useMemo(() => {
    let users = data?.users ?? [];
    if (roleFilter !== 'ALL') {
      users = users.filter((user) => user.role === roleFilter);
    }
    if (debouncedSearch) {
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(debouncedSearch) ||
          user.email.toLowerCase().includes(debouncedSearch),
      );
    }
    return users;
  }, [data?.users, roleFilter, debouncedSearch]);

  const hasActiveFilters = roleFilter !== 'ALL' || debouncedSearch.length > 0;
  const hasUsers = (data?.users.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        badge={data ? <Badge tone="neutral">{formatCount(data.pagination.total)} total</Badge> : undefined}
        description="Manage teammates and customers in your organization."
        actions={<ButtonLink to={paths.dashboard.usersNew}>Add user</ButtonLink>}
      />

      {isLoading ? (
        <Card padding="none" className="flex min-h-[320px] items-center justify-center">
          <Spinner size="lg" />
        </Card>
      ) : isError ? (
        <EmptyState
          title="Couldn't load users"
          description={error instanceof ApiError ? error.message : undefined}
          onRetry={() => refetch()}
        />
      ) : !hasUsers ? (
        <EmptyState
          icon={<IconUsers className="h-5 w-5" />}
          title="No users yet"
          description="Add customers to assign orders, or invite admins to help manage your organization."
          action={<ButtonLink to={paths.dashboard.usersNew} size="sm">Add your first user</ButtonLink>}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <ListToolbar
            tabs={ROLE_TABS.map((tab) => ({
              id: tab.id,
              label: tab.label,
              count: tabCounts[tab.id],
            }))}
            activeTab={roleFilter}
            onTabChange={(id) => setRoleFilter(id as RoleFilter)}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name or email…"
          />

          {filteredUsers.length === 0 ? (
            <EmptyState
              title="No matching users"
              description="Try a different role or search term."
              action={
                hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRoleFilter('ALL');
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
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted">Name</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted">Email</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted">Role</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-muted">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((orgUser) => (
                      <tr key={orgUser._id} className="transition-colors hover:bg-surfaceMuted/40">
                        <td className="px-5 py-3.5 font-medium text-foreground">{orgUser.name}</td>
                        <td className="px-5 py-3.5 text-muted">{orgUser.email}</td>
                        <td className="px-5 py-3.5">
                          <Badge tone={orgUser.role === 'ADMIN' ? 'success' : 'neutral'}>{orgUser.role}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            to={paths.dashboard.userEdit(orgUser._id)}
                            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
