import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { usersApi } from '../../api/users.api';
import { ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAppNavigate } from '../../hooks/useAppNavigate';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { paths } from '../../routes/paths';
import type { UserRole } from '../../types/auth';
import type { UpdateUserPayload } from '../../types/user';

interface UserFormValues {
  name: string;
  email: string;
  role: UserRole;
}

interface CreatedCredentials {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const defaultValues: UserFormValues = { name: '', email: '', role: 'CUSTOMER' };

const PASSWORD_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';

function generateTempPassword(length = 12) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => PASSWORD_CHARSET[byte % PASSWORD_CHARSET.length]).join('');
}

export function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  useDocumentTitle(isEditMode ? 'Edit user' : 'Add user');
  const navigate = useAppNavigate();
  const queryClient = useQueryClient();

  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<'password' | 'message' | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getById(id as string).then((res) => res.data),
    enabled: isEditMode,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({ defaultValues });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email, role: user.role });
    }
  }, [user, reset]);

  const createUser = useMutation({ mutationFn: usersApi.create });
  const updateUser = useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersApi.update(id as string, payload),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditMode) {
        const response = await updateUser.mutateAsync({ name: values.name, email: values.email, role: values.role });
        if (response.success) {
          await queryClient.invalidateQueries({ queryKey: ['users'] });
          toast.success(response.message);
          navigate((routes) => routes.dashboard.users);
        } else {
          toast.error(response.message);
        }
        return;
      }

      const password = generateTempPassword();
      const response = await createUser.mutateAsync({ name: values.name, email: values.email, password, role: values.role });
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success(response.message);
        setCreatedCredentials({ name: values.name, email: values.email, password, role: values.role });
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  });

  const copyToClipboard = async (text: string, field: 'password' | 'message') => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const invitationMessage = createdCredentials
    ? `Hi ${createdCredentials.name},

You've been added as ${createdCredentials.role === 'ADMIN' ? 'an admin' : 'a customer'}.

Sign in here: ${window.location.origin}${paths.auth.signIn}
Email: ${createdCredentials.email}
Temporary password: ${createdCredentials.password}

Please sign in and change your password.`
    : '';

  if (isEditMode && isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isEditMode && !user) {
    return <EmptyState title="User not found" description="This user may have been removed." />;
  }

  if (createdCredentials) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="User created" description="Copy these details and send them to the new teammate." />

        <div className="flex max-w-md flex-col gap-4 rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Email</p>
            <p className="text-sm text-foreground">{createdCredentials.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Temporary password</p>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 rounded-md border border-borderInput bg-surfaceMuted px-3 py-2 text-sm text-foreground">
                {createdCredentials.password}
              </code>
              <Button type="button" variant="secondary" onClick={() => copyToClipboard(createdCredentials.password, 'password')}>
                {copiedField === 'password' ? 'Copied' : 'Copy'}
              </Button>
            </div>
            {createdCredentials.role === 'ADMIN' ? (
              <p className="mt-1 text-xs text-muted">This has also been emailed to them.</p>
            ) : (
              <p className="mt-1 text-xs text-muted">This won't be shown again — copy it now.</p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Message to send</p>
            <textarea
              readOnly
              rows={7}
              value={invitationMessage}
              className="mt-1 w-full resize-none rounded-md border border-borderInput bg-surfaceMuted px-3 py-2 text-sm text-foreground outline-none"
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button
              type="button"
              variant="secondary"
              className="mt-2"
              onClick={() => copyToClipboard(invitationMessage, 'message')}
            >
              {copiedField === 'message' ? 'Copied' : 'Copy message'}
            </Button>
          </div>

          <Button type="button" onClick={() => navigate((routes) => routes.dashboard.users)}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isEditMode ? 'Edit user' : 'Add user'}
        description={
          isEditMode
            ? "Update this teammate's details."
            : 'Invite a new teammate to your organization. A temporary password will be generated for them.'
        }
      />

      <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
        <Input label="Name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />

        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="role" className="text-sm font-medium text-foreground">
            Role
          </label>
          <select
            id="role"
            className="rounded-md border border-borderInput bg-surfaceInput px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
            {...register('role')}
          >
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Add user'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate((routes) => routes.dashboard.users)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
