import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { usersApi } from '../../api/users.api';
import { ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAppNavigate } from '../../hooks/useAppNavigate';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import {
  FormActions,
  FormField,
  FormPageShell,
  FormSection,
  OptionPicker,
} from '../../components/ui/FormLayout';
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

const ROLE_OPTIONS: { id: UserRole; label: string }[] = [
  { id: 'CUSTOMER', label: 'Customer' },
  { id: 'ADMIN', label: 'Admin' },
];

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
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({ defaultValues });

  const role = watch('role');

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email, role: user.role });
    }
  }, [user, reset]);

  const createUser = useMutation({ mutationFn: usersApi.create });
  const updateUser = useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersApi.update(id as string, payload),
  });

  const goBack = () => navigate((routes) => routes.dashboard.users);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditMode) {
        const response = await updateUser.mutateAsync({ name: values.name, email: values.email, role: values.role });
        if (response.success) {
          await queryClient.invalidateQueries({ queryKey: ['users'] });
          toast.success(response.message);
          goBack();
        } else {
          toast.error(response.message);
        }
        return;
      }

      const password = generateTempPassword();
      const response = await createUser.mutateAsync({
        name: values.name,
        email: values.email,
        password,
        role: values.role,
      });
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

  if (createdCredentials) {
    return (
      <FormPageShell
        title="User created"
        description="Copy these details and send them to the new teammate."
        back={{ label: 'Back to users', onClick: goBack }}
      >
        <div className="flex max-w-2xl flex-col gap-5">
          <FormSection title="Login details">
            <FormField label="Email">
              <p className="text-sm text-foreground">{createdCredentials.email}</p>
            </FormField>

            <FormField label="Temporary password">
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md border border-borderInput bg-surfaceMuted px-3 py-2 text-sm text-foreground">
                  {createdCredentials.password}
                </code>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(createdCredentials.password, 'password')}
                >
                  {copiedField === 'password' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              {createdCredentials.role === 'ADMIN' ? (
                <p className="text-xs text-muted">This has also been emailed to them.</p>
              ) : (
                <p className="text-xs text-muted">This won't be shown again — copy it now.</p>
              )}
            </FormField>
          </FormSection>

          <FormSection title="Message to send">
            <textarea
              readOnly
              rows={7}
              value={invitationMessage}
              className="w-full resize-none rounded-lg border border-borderInput bg-surfaceInput px-3 py-2.5 text-sm text-foreground shadow-xs outline-none"
              onFocus={(event) => event.currentTarget.select()}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-fit"
              onClick={() => copyToClipboard(invitationMessage, 'message')}
            >
              {copiedField === 'message' ? 'Copied' : 'Copy message'}
            </Button>
          </FormSection>

          <FormActions>
            <Button type="button" onClick={goBack}>
              Done
            </Button>
          </FormActions>
        </div>
      </FormPageShell>
    );
  }

  return (
    <FormPageShell
      title={isEditMode ? 'Edit user' : 'Add user'}
      description={
        isEditMode
          ? "Update this teammate's details."
          : 'Invite a new teammate to your organization. A temporary password will be generated for them.'
      }
      back={{ label: 'Back to users', onClick: goBack }}
      isLoading={isEditMode && isLoading}
      notFound={
        isEditMode && !isLoading && !user
          ? { title: 'User not found', description: 'This user may have been removed.' }
          : undefined
      }
    >
      <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-5">
        <FormSection title="User details">
          <FormField label="Name" error={errors.name?.message}>
            <Input {...register('name', { required: 'Name is required' })} />
          </FormField>

          <FormField label="Email" error={errors.email?.message}>
            <Input type="email" {...register('email', { required: 'Email is required' })} />
          </FormField>

          <OptionPicker
            label="Role"
            value={role}
            options={ROLE_OPTIONS}
            onChange={(value) => setValue('role', value, { shouldDirty: true })}
          />
        </FormSection>

        <FormActions>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Add user'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={goBack}>
            Cancel
          </Button>
        </FormActions>
      </form>
    </FormPageShell>
  );
}
