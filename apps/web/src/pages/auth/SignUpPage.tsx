import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppNavigate } from '../../hooks/useAppNavigate';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ApiError } from '../../lib/api-client';
import { paths } from '../../routes/paths';

interface SignUpFormValues {
  organizationName: string;
  country: string;
  currency: string;
  name: string;
  email: string;
  password: string;
}

export function SignUpPage() {
  useDocumentTitle('Create account');
  const { signUp } = useAuth();
  const navigate = useAppNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>();

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await signUp({ ...values, role: 'ADMIN' });
      if (response.success) {
        toast.success(response.message);
        navigate((routes) => routes.dashboard.home, { replace: true });
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
        <h2 className="text-base font-semibold text-slate-900">Create your organization</h2>
        <p className="text-sm text-slate-500">Get started with Settle.</p>
      </div>

      <Input
        label="Organization name"
        error={errors.organizationName?.message}
        {...register('organizationName', { required: 'Organization name is required', minLength: 2 })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Country (ISO-2)"
          maxLength={2}
          error={errors.country?.message}
          {...register('country', { required: 'Required', minLength: 2, maxLength: 2 })}
        />
        <Input
          label="Currency (ISO-3)"
          maxLength={3}
          error={errors.currency?.message}
          {...register('currency', { required: 'Required', minLength: 3, maxLength: 3 })}
        />
      </div>
      <Input label="Your name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
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
        Create account
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to={paths.auth.signIn} className="font-medium text-slate-900 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
