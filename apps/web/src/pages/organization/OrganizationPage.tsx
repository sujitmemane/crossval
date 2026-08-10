import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../lib/api-client';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Organization } from '../../types/organization';

export function OrganizationPage() {
  useDocumentTitle('Organization');
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['organization'],
    queryFn: () => apiFetch<Organization>('/organizations/me').then((res) => res.data),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Organization" description="Details about your organization." />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError || !data ? (
        <EmptyState
          title="Couldn't load organization"
          description={error instanceof ApiError ? error.message : undefined}
        />
      ) : (
        <OrganizationForm key={data._id} organization={data} isAdmin={isAdmin} />
      )}
    </div>
  );
}

interface OrganizationFormValues {
  name: string;
  country: string;
  currency: string;
}

function OrganizationForm({ organization, isAdmin }: { organization: Organization; isAdmin: boolean }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormValues>({
    defaultValues: {
      name: organization.name,
      country: organization.country,
      currency: organization.currency,
    },
  });

  const updateOrganization = useMutation({
    mutationFn: (payload: OrganizationFormValues) =>
      apiFetch<Organization>('/organizations/me', { method: 'PATCH', data: payload }).then((res) => res.data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['organization'], updated);
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors('root');
    try {
      await updateOrganization.mutateAsync(values);
    } catch (err) {
      setError('root', { message: err instanceof ApiError ? err.message : 'Something went wrong' });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
      <Input
        label="Name"
        disabled={!isAdmin}
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Country (ISO-2)"
          disabled={!isAdmin}
          maxLength={2}
          error={errors.country?.message}
          {...register('country', { required: 'Required', minLength: 2, maxLength: 2 })}
        />
        <Input
          label="Currency (ISO-3)"
          disabled={!isAdmin}
          maxLength={3}
          error={errors.currency?.message}
          {...register('currency', { required: 'Required', minLength: 3, maxLength: 3 })}
        />
      </div>

      {errors.root ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}

      {isAdmin ? (
        <Button type="submit" isLoading={isSubmitting} className="w-fit">
          Save changes
        </Button>
      ) : (
        <p className="text-sm text-slate-400">Only organization admins can edit these details.</p>
      )}
    </form>
  );
}
