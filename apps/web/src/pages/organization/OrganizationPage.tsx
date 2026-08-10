import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
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

interface OrganizationFormState {
  name: string;
  country: string;
  currency: string;
}

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

function OrganizationForm({ organization, isAdmin }: { organization: Organization; isAdmin: boolean }) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<OrganizationFormState>({
    name: organization.name,
    country: organization.country,
    currency: organization.currency,
  });
  const [saveError, setSaveError] = useState<string | null>(null);

  const updateOrganization = useMutation({
    mutationFn: (payload: OrganizationFormState) =>
      apiFetch<Organization>('/organizations/me', { method: 'PATCH', data: payload }).then((res) => res.data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['organization'], updated);
    },
  });

  const updateField = (field: keyof OrganizationFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaveError(null);
    try {
      await updateOrganization.mutateAsync(form);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <Input label="Name" value={form.name} onChange={updateField('name')} disabled={!isAdmin} required />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Country (ISO-2)"
          value={form.country}
          onChange={updateField('country')}
          disabled={!isAdmin}
          maxLength={2}
          required
        />
        <Input
          label="Currency (ISO-3)"
          value={form.currency}
          onChange={updateField('currency')}
          disabled={!isAdmin}
          maxLength={3}
          required
        />
      </div>

      {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}

      {isAdmin ? (
        <Button type="submit" isLoading={updateOrganization.isPending} className="w-fit">
          Save changes
        </Button>
      ) : (
        <p className="text-sm text-slate-400">Only organization admins can edit these details.</p>
      )}
    </form>
  );
}
