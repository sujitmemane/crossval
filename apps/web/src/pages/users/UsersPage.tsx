import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { usersApi } from '../../api/users.api';
import { ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { paths } from '../../routes/paths';

export function UsersPage() {
  useDocumentTitle('Users');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((res) => res.data),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description="Manage teammates and their access to this organization."
        actions={
          <Link
            to={paths.dashboard.usersNew}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-button px-4 py-2 text-sm font-medium text-buttonText transition-colors hover:bg-primaryMuted"
          >
            Add user
          </Link>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load users" description={error instanceof ApiError ? error.message : undefined} />
      ) : !data || data.users.length === 0 ? (
        <EmptyState title="No users yet" description="Teammates you add will show up here." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-surfaceMuted text-left text-xs font-medium uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {data.users.map((orgUser) => (
                <tr key={orgUser._id}>
                  <td className="px-4 py-3 font-medium text-foreground">{orgUser.name}</td>
                  <td className="px-4 py-3 text-muted">{orgUser.email}</td>
                  <td className="px-4 py-3">
                    <Badge tone={orgUser.role === 'ADMIN' ? 'success' : 'neutral'}>{orgUser.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={paths.dashboard.userEdit(orgUser._id)}
                      className="text-sm font-medium text-muted hover:text-foreground hover:underline"
                    >
                      Edit
                    </Link>
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
