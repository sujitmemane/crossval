import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { itemsApi } from '../../api/items.api';
import { ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { paths } from '../../routes/paths';

export function ItemsPage() {
  useDocumentTitle('Items');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsApi.list().then((res) => res.data),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Items"
        description="Manage the products and services your organization sells."
        actions={
          <Link
            to={paths.dashboard.itemsNew}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-button px-4 py-2 text-sm font-medium text-buttonText transition-colors hover:bg-primaryMuted"
          >
            Add item
          </Link>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load items" description={error instanceof ApiError ? error.message : undefined} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No items yet" description="Items you add will show up here." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-surfaceMuted text-left text-xs font-medium uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {data.items.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                  <td className="px-4 py-3 text-muted">{item.rate}</td>
                  <td className="px-4 py-3 text-muted">{item.quantity}</td>
                  <td className="px-4 py-3">
                    <Badge tone={item.status === 'AVAILABLE' ? 'success' : 'neutral'}>{item.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={paths.dashboard.itemEdit(item._id)}
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
