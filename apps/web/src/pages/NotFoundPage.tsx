import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '../components/ui/Button';
import { paths } from '../routes/paths';

export function NotFoundPage() {
  useDocumentTitle('Not found');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-center">
      <p className="text-sm font-medium text-mutedForeground">404</p>
      <h1 className="text-xl font-semibold text-foreground">Page not found</h1>
      <p className="max-w-sm text-sm text-muted">The page you're looking for doesn't exist or may have moved.</p>
      <Link to={paths.dashboard.home}>
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
    </div>
  );
}
