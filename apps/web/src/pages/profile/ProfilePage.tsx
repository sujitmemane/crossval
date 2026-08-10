import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
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

function ProfileDetailsForm({ me }: { me: AuthUser }) {
  const [form, setForm] = useState({ name: me.name, email: me.email });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateProfile = useMutation({
    mutationFn: (payload: { name: string; email: string }) =>
      apiFetch<AuthUser>('/users/me', { method: 'PATCH', data: payload }),
  });

  const updateField = (field: 'name' | 'email') => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      await updateProfile.mutateAsync(form);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <h2 className="text-sm font-semibold text-slate-900">Personal details</h2>
      <Input label="Name" value={form.name} onChange={updateField('name')} required />
      <Input label="Email" type="email" value={form.email} onChange={updateField('email')} required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">Profile updated.</p> : null}
      <Button type="submit" isLoading={updateProfile.isPending} className="w-fit">
        Save profile
      </Button>
    </form>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const changePassword = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      apiFetch('/users/me/password', { method: 'PATCH', data: payload }),
  });

  const updateField = (field: 'currentPassword' | 'newPassword') => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      await changePassword.mutateAsync(form);
      setForm({ currentPassword: '', newPassword: '' });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <h2 className="text-sm font-semibold text-slate-900">Change password</h2>
      <Input
        label="Current password"
        type="password"
        value={form.currentPassword}
        onChange={updateField('currentPassword')}
        required
      />
      <Input
        label="New password"
        type="password"
        value={form.newPassword}
        onChange={updateField('newPassword')}
        minLength={8}
        required
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">Password changed.</p> : null}
      <Button type="submit" isLoading={changePassword.isPending} className="w-fit">
        Update password
      </Button>
    </form>
  );
}
