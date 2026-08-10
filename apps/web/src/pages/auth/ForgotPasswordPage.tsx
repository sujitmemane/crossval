import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiFetch, ApiError } from '../../lib/api-client';
import { paths } from '../../routes/paths';

interface ForgotPasswordFormValues {
  email: string;
}

export function ForgotPasswordPage() {
  useDocumentTitle('Forgot password');
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>();

  const onSubmit = handleSubmit(async (values) => {
    try {
      await apiFetch('/auth/forgot-password', { method: 'POST', data: values, skipAuth: true });
      setSentEmail(values.email);
      setIsSent(true);
    } catch (err) {
      setError('root', { message: err instanceof ApiError ? err.message : 'Something went wrong' });
    }
  });

  if (isSent) {
    return (
      <div className="flex flex-col gap-3 text-center">
        <h2 className="text-base font-semibold text-slate-900">Check your email</h2>
        <p className="text-sm text-slate-500">If an account exists for {sentEmail}, a reset link is on its way.</p>
        <Link to={paths.auth.signIn} className="text-sm font-medium text-slate-900 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Forgot password</h2>
        <p className="text-sm text-slate-500">We'll email you a link to reset it.</p>
      </div>

      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email', { required: 'Email is required' })}
      />

      {errors.root ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Send reset link
      </Button>

      <Link to={paths.auth.signIn} className="text-center text-sm text-slate-500 hover:text-slate-900">
        Back to sign in
      </Link>
    </form>
  );
}
