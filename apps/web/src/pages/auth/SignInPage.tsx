import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ApiError } from '../../lib/api-client';
import { paths } from '../../routes/paths';
import type { SignInPayload } from '../../types/auth';

export function SignInPage() {
  useDocumentTitle('Sign in');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInPayload>();

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await signIn(values);
      if (response.success) {
        toast.success(response.message);
        navigate(paths.dashboard.home, { replace: true });
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
        <h2 className="text-base font-semibold text-foreground">Sign in</h2>
        <p className="text-sm text-muted">Welcome back to Settle.</p>
      </div>

      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email', { required: 'Email is required' })}
      />
      <Input
        label="Password"
        type="password"
        error={errors.password?.message}
        {...register('password', {
          required: 'Password is required',
          minLength: { value: 8, message: 'Must be at least 8 characters' },
        })}
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Sign in
      </Button>

      <div className="flex items-center justify-between text-sm text-muted">
        <Link to={paths.auth.forgotPassword} className="hover:text-foreground">
          Forgot password?
        </Link>
        <Link to={paths.auth.signUp} className="hover:text-foreground">
          Create account
        </Link>
      </div>
    </form>
  );
}
