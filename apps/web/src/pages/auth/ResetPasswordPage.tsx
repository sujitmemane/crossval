import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAppNavigate } from '../../hooks/useAppNavigate';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../api/auth.api';
import { ApiError } from '../../lib/api-client';
import { paths } from '../../routes/paths';

interface ResetPasswordFormValues {
  newPassword: string;
}

export function ResetPasswordPage() {
  useDocumentTitle('Reset password');
  const [searchParams] = useSearchParams();
  const navigate = useAppNavigate();
  const token = searchParams.get('token') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>();

  const resetPassword = useMutation({ mutationFn: authApi.resetPassword });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      toast.error('This reset link is invalid or has expired.');
      return;
    }

    try {
      const response = await resetPassword.mutateAsync({ token, ...values });
      if (response.success) {
        toast.success(response.message);
        navigate((routes) => routes.auth.signIn, { replace: true });
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Reset password</h2>
        <p className="text-sm text-muted">Choose a new password for your account.</p>
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

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Reset password
      </Button>

      <Link to={paths.auth.signIn} className="text-center text-sm text-muted hover:text-foreground">
        Back to sign in
      </Link>
    </form>
  );
}
