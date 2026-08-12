import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '../../api/users.api';
import { ApiError } from '../../lib/api-client';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FormActions, FormField, FormPageShell, FormSection } from '../../components/ui/FormLayout';
import type { AuthUser } from '../../types/auth';
import type { ChangePasswordPayload, UpdateProfilePayload } from '../../types/user';

export function ProfilePage() {
  useDocumentTitle('Profile');
  const { user } = useAuth();

  return (
    <FormPageShell
      title="Profile"
      description="Manage your personal account details."
      isLoading={!user}
    >
      {user ? (
        <div className="flex max-w-2xl flex-col gap-5">
          <ProfileDetailsForm key={user._id} me={user} />
          <PasswordForm />
        </div>
      ) : null}
    </FormPageShell>
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
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <FormSection title="Personal details">
        <FormField label="Name" error={errors.name?.message}>
          <Input {...register('name', { required: 'Name is required' })} />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" {...register('email', { required: 'Email is required' })} />
        </FormField>
      </FormSection>

      <FormActions>
        <Button type="submit" isLoading={isSubmitting}>
          Save profile
        </Button>
      </FormActions>
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
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <FormSection title="Change password">
        <FormField label="Current password" error={errors.currentPassword?.message}>
          <Input
            type="password"
            {...register('currentPassword', { required: 'Current password is required' })}
          />
        </FormField>

        <FormField label="New password" error={errors.newPassword?.message}>
          <Input
            type="password"
            {...register('newPassword', {
              required: 'New password is required',
              minLength: { value: 8, message: 'Must be at least 8 characters' },
            })}
          />
        </FormField>
      </FormSection>

      <FormActions>
        <Button type="submit" isLoading={isSubmitting}>
          Update password
        </Button>
      </FormActions>
    </form>
  );
}
