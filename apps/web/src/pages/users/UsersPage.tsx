import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import type { UsersResponse } from '../../types/user';

export function UsersPage() {
  useDocumentTitle('Users');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<UsersResponse>('/users').then((res) => res.data),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Users" description="Manage teammates and their access to this organization." />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load users" description={error instanceof ApiError ? error.message : undefined} />
      ) : !data || data.users.length === 0 ? (
        <EmptyState title="No users yet" description="Teammates you add will show up here." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.users.map((orgUser) => (
                <tr key={orgUser._id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{orgUser.name}</td>
                  <td className="px-4 py-3 text-slate-600">{orgUser.email}</td>
                  <td className="px-4 py-3">
                    <Badge tone={orgUser.role === 'ADMIN' ? 'success' : 'neutral'}>{orgUser.role}</Badge>
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
