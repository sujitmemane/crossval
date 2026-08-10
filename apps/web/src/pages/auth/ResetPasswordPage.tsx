import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAppNavigate } from '../../hooks/useAppNavigate';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiFetch, ApiError } from '../../lib/api-client';
import { paths } from '../../routes/paths';

interface ResetPasswordFormValues {
  newPassword: string;
}

export function ResetPasswordPage() {
  useDocumentTitle('Reset password');
  const [searchParams] = useSearchParams();
  const { toSignIn } = useAppNavigate();
  const token = searchParams.get('token') ?? '';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>();

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      setError('root', { message: 'This reset link is invalid or has expired.' });
      return;
    }

    try {
      await apiFetch('/auth/reset-password', { method: 'POST', data: { token, ...values }, skipAuth: true });
      toSignIn({ replace: true });
    } catch (err) {
      setError('root', { message: err instanceof ApiError ? err.message : 'Something went wrong' });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Reset password</h2>
        <p className="text-sm text-slate-500">Choose a new password for your account.</p>
      </div>

      <Input
        label="New password"
        type="password"
        error={errors.newPassword?.message}
        {...register('newPassword', {
          required: 'New password is required',
          minLength: { value: 8, message: 'Must be at least 8 characters' },
        })}
      />

      {errors.root ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Reset password
      </Button>

      <Link to={paths.auth.signIn} className="text-center text-sm text-slate-500 hover:text-slate-900">
        Back to sign in
      </Link>
    </form>
  );
}
