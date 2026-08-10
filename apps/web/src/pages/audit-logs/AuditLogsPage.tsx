import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '../../api/audit-logs.api';
import { ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';

export function AuditLogsPage() {
  useDocumentTitle('Audit Logs');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => auditLogsApi.list().then((res) => res.data),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Audit Logs" description="A history of order and payment activity across your organization." />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load audit logs" description={error instanceof ApiError ? error.message : undefined} />
      ) : !data || data.logs.length === 0 ? (
        <EmptyState title="No activity yet" description="Order and payment events will show up here." />
      ) : (
        <ul className="flex flex-col gap-2">
          {data.logs.map((log) => (
            <li
              key={log._id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <div>
                <Badge>{log.action.replaceAll('_', ' ')}</Badge>
                <p className="mt-1 text-xs text-slate-400">Order {log.orderId}</p>
              </div>
              <span className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
