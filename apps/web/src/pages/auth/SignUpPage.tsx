import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ApiError } from '../../lib/api-client';
import { paths } from '../../routes/paths';

interface SignUpFormState {
  organizationName: string;
  country: string;
  currency: string;
  name: string;
  email: string;
  password: string;
}

const initialState: SignUpFormState = {
  organizationName: '',
  country: '',
  currency: '',
  name: '',
  email: '',
  password: '',
};

export function SignUpPage() {
  useDocumentTitle('Create account');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<SignUpFormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof SignUpFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signUp({ ...form, role: 'ADMIN' });
      navigate(paths.home, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Create your organization</h2>
        <p className="text-sm text-slate-500">Get started with Settle.</p>
      </div>

      <Input
        label="Organization name"
        name="organizationName"
        value={form.organizationName}
        onChange={updateField('organizationName')}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Country (ISO-2)"
          name="country"
          value={form.country}
          onChange={updateField('country')}
          maxLength={2}
          required
        />
        <Input
          label="Currency (ISO-3)"
          name="currency"
          value={form.currency}
          onChange={updateField('currency')}
          maxLength={3}
          required
        />
      </div>
      <Input label="Your name" name="name" value={form.name} onChange={updateField('name')} required />
      <Input
        label="Email"
        type="email"
        name="email"
        value={form.email}
        onChange={updateField('email')}
        required
      />
      <Input
        label="Password"
        type="password"
        name="password"
        value={form.password}
        onChange={updateField('password')}
        minLength={8}
        required
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Create account
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to={paths.signIn} className="font-medium text-slate-900 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
