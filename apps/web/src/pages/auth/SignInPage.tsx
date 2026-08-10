import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInPayload>();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? paths.dashboard.home;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values);
      navigate(from, { replace: true });
    } catch (err) {
      setError('root', { message: err instanceof ApiError ? err.message : 'Something went wrong' });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Sign in</h2>
        <p className="text-sm text-slate-500">Welcome back to Settle.</p>
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

      {errors.root ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Sign in
      </Button>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <Link to={paths.auth.forgotPassword} className="hover:text-slate-900">
          Forgot password?
        </Link>
        <Link to={paths.auth.signUp} className="hover:text-slate-900">
          Create account
        </Link>
      </div>
    </form>
  );
}
