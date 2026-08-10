import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiFetch, ApiError } from '../../lib/api-client';
import { paths } from '../../routes/paths';

export function ResetPasswordPage() {
  useDocumentTitle('Reset password');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!token) {
      setError('This reset link is invalid or has expired.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await apiFetch('/auth/reset-password', { method: 'POST', data: { token, newPassword }, skipAuth: true });
      navigate(paths.signIn, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Reset password</h2>
        <p className="text-sm text-slate-500">Choose a new password for your account.</p>
      </div>

      <Input
        label="New password"
        type="password"
        name="newPassword"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        minLength={8}
        required
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Reset password
      </Button>

      <Link to={paths.signIn} className="text-center text-sm text-slate-500 hover:text-slate-900">
        Back to sign in
      </Link>
    </form>
  );
}
