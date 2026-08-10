import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../../api/items.api';
import { ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';

export function ItemsPage() {
  useDocumentTitle('Items');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsApi.list().then((res) => res.data),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Items" description="Manage the products and services your organization sells." />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load items" description={error instanceof ApiError ? error.message : undefined} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No items yet" description="Items you add will show up here." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.items.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.rate}</td>
                  <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-3">
                    <Badge tone={item.status === 'AVAILABLE' ? 'success' : 'neutral'}>{item.status}</Badge>
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
