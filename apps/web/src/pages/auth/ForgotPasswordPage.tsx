import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiFetch, ApiError } from '../../lib/api-client';
import { paths } from '../../routes/paths';

export function ForgotPasswordPage() {
  useDocumentTitle('Forgot password');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await apiFetch('/auth/forgot-password', { method: 'POST', data: { email }, skipAuth: true });
      setIsSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <div className="flex flex-col gap-3 text-center">
        <h2 className="text-base font-semibold text-slate-900">Check your email</h2>
        <p className="text-sm text-slate-500">If an account exists for {email}, a reset link is on its way.</p>
        <Link to={paths.signIn} className="text-sm font-medium text-slate-900 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Forgot password</h2>
        <p className="text-sm text-slate-500">We'll email you a link to reset it.</p>
      </div>

      <Input
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Send reset link
      </Button>

      <Link to={paths.signIn} className="text-center text-sm text-slate-500 hover:text-slate-900">
        Back to sign in
      </Link>
    </form>
  );
}
