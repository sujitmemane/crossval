import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '../components/ui/Button';
import { paths } from '../routes/paths';

export function NotFoundPage() {
  useDocumentTitle('Not found');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-center">
      <p className="text-sm font-medium text-slate-400">404</p>
      <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
      <p className="max-w-sm text-sm text-slate-500">The page you're looking for doesn't exist or may have moved.</p>
      <Link to={paths.home}>
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
    </div>
  );
}
