import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { organizationsApi } from '../../api/organizations.api';
import { ApiError } from '../../lib/api-client';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Organization, UpdateOrganizationPayload } from '../../types/organization';

export function OrganizationPage() {
  useDocumentTitle('Organization');
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['organization'],
    queryFn: () => organizationsApi.getMe().then((res) => res.data),
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

function OrganizationForm({ organization, isAdmin }: { organization: Organization; isAdmin: boolean }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateOrganizationPayload>({
    defaultValues: {
      name: organization.name,
      country: organization.country,
      currency: organization.currency,
    },
  });

  const updateOrganization = useMutation({
    mutationFn: (payload: UpdateOrganizationPayload) => organizationsApi.updateMe(payload),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await updateOrganization.mutateAsync(values);
      if (response.success) {
        queryClient.setQueryData(['organization'], response.data);
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
