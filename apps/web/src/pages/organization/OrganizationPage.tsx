import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { organizationsApi } from '../../api/organizations.api';
import { ApiError } from '../../lib/api-client';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FormField, FormPageShell, FormSection, FormActions } from '../../components/ui/FormLayout';
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

  if (isError || (!isLoading && !data)) {
    return (
      <FormPageShell title="Organization" description="Details about your organization.">
        <EmptyState
          title="Couldn't load organization"
          description={error instanceof ApiError ? error.message : undefined}
        />
      </FormPageShell>
    );
  }

  return (
    <FormPageShell
      title="Organization"
      description="Details about your organization."
      isLoading={isLoading}
    >
      {data ? <OrganizationForm key={data._id} organization={data} isAdmin={isAdmin} /> : null}
    </FormPageShell>
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
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-5">
      <FormSection title="Organization details">
        <FormField label="Name" error={errors.name?.message}>
          <Input disabled={!isAdmin} {...register('name', { required: 'Name is required' })} />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Country (ISO-2)" error={errors.country?.message}>
            <Input
              disabled={!isAdmin}
              maxLength={2}
              {...register('country', { required: 'Required', minLength: 2, maxLength: 2 })}
            />
          </FormField>

          <FormField label="Currency (ISO-3)" error={errors.currency?.message}>
            <Input
              disabled={!isAdmin}
              maxLength={3}
              {...register('currency', { required: 'Required', minLength: 3, maxLength: 3 })}
            />
          </FormField>
        </div>
      </FormSection>

      {isAdmin ? (
        <FormActions>
          <Button type="submit" isLoading={isSubmitting}>
            Save changes
          </Button>
        </FormActions>
      ) : (
        <p className="text-sm text-mutedForeground">Only organization admins can edit these details.</p>
      )}
    </form>
  );
}
