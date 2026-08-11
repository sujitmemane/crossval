import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '../../api/users.api';
import { ApiError } from '../../lib/api-client';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import type { AuthUser } from '../../types/auth';
import type { ChangePasswordPayload, UpdateProfilePayload } from '../../types/user';

export function ProfilePage() {
  useDocumentTitle('Profile');
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Profile" description="Manage your personal account details." />

      {!user ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <ProfileDetailsForm key={user._id} me={user} />
          <PasswordForm />
        </>
      )}
    </div>
  );
}

function ProfileDetailsForm({ me }: { me: AuthUser }) {
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfilePayload>({ defaultValues: { name: me.name, email: me.email } });

  const updateProfile = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => usersApi.updateMe(payload),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await updateProfile.mutateAsync(values);
      if (response.success) {
        setUser(response.data);
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
      <h2 className="text-sm font-semibold text-foreground">Personal details</h2>
      <Input label="Name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email', { required: 'Email is required' })}
      />
      <Button type="submit" isLoading={isSubmitting} className="w-fit">
        Save profile
      </Button>
    </form>
  );
}

function PasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordPayload>();

  const changePassword = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => usersApi.changePassword(payload),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await changePassword.mutateAsync(values);
      if (response.success) {
        toast.success(response.message);
        reset();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
      <h2 className="text-sm font-semibold text-foreground">Change password</h2>
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
      <Button type="submit" isLoading={isSubmitting} className="w-fit">
        Update password
      </Button>
    </form>
  );
}
