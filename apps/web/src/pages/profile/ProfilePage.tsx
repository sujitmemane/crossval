import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import type { AuthUser } from '../../types/auth';

export function ProfilePage() {
  useDocumentTitle('Profile');

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<AuthUser>('/users/me').then((res) => res.data),
  });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Profile" description="Manage your personal account details." />

      {isLoading || !me ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <ProfileDetailsForm key={me._id} me={me} />
          <PasswordForm />
        </>
      )}
    </div>
  );
}

interface ProfileDetailsFormValues {
  name: string;
  email: string;
}

function ProfileDetailsForm({ me }: { me: AuthUser }) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ProfileDetailsFormValues>({ defaultValues: { name: me.name, email: me.email } });

  const updateProfile = useMutation({
    mutationFn: (payload: ProfileDetailsFormValues) => apiFetch<AuthUser>('/users/me', { method: 'PATCH', data: payload }),
  });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors('root');
    try {
      await updateProfile.mutateAsync(values);
    } catch (err) {
      setError('root', { message: err instanceof ApiError ? err.message : 'Something went wrong' });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
      <h2 className="text-sm font-semibold text-slate-900">Personal details</h2>
      <Input label="Name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email', { required: 'Email is required' })}
      />
      {errors.root ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}
      {isSubmitSuccessful && !errors.root ? <p className="text-sm text-emerald-600">Profile updated.</p> : null}
      <Button type="submit" isLoading={isSubmitting} className="w-fit">
        Save profile
      </Button>
    </form>
  );
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
}

function PasswordForm() {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<PasswordFormValues>();

  const changePassword = useMutation({
    mutationFn: (payload: PasswordFormValues) => apiFetch('/users/me/password', { method: 'PATCH', data: payload }),
  });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors('root');
    try {
      await changePassword.mutateAsync(values);
      reset({ currentPassword: '', newPassword: '' }, { keepIsSubmitSuccessful: true });
    } catch (err) {
      setError('root', { message: err instanceof ApiError ? err.message : 'Something went wrong' });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
      <h2 className="text-sm font-semibold text-slate-900">Change password</h2>
      <Input
        label="Current password"
        type="password"
        error={errors.currentPassword?.message}
        {...register('currentPassword', { required: 'Current password is required' })}
      />
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
      {isSubmitSuccessful && !errors.root ? <p className="text-sm text-emerald-600">Password changed.</p> : null}
      <Button type="submit" isLoading={isSubmitting} className="w-fit">
        Update password
      </Button>
    </form>
  );
}
