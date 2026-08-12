import type { ReactNode } from 'react';
import { PageHeader } from './PageHeader';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';
import { IconChevronLeft } from './Icons';

interface FormPageShellProps {
  title: string;
  description?: string;
  back?: {
    label: string;
    onClick: () => void;
  };
  isLoading?: boolean;
  notFound?: {
    title: string;
    description?: string;
  };
  children: ReactNode;
}

export function FormPageShell({
  title,
  description,
  back,
  isLoading,
  notFound,
  children,
}: FormPageShellProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-border bg-surface shadow-xs">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound) {
    return <EmptyState title={notFound.title} description={notFound.description} />;
  }

  return (
    <div className="flex flex-col gap-5">
      {back ? (
        <button
          type="button"
          onClick={back.onClick}
          className="flex w-fit items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <IconChevronLeft className="h-4 w-4" />
          {back.label}
        </button>
      ) : null}

      <PageHeader title={title} description={description} />
      {children}
    </div>
  );
}

interface FormSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, children, className = '' }: FormSectionProps) {
  return (
    <section className={`flex flex-col gap-4 rounded-md border border-border bg-surface p-4 ${className}`}>
      {title ? <p className="text-xs font-medium text-muted">{title}</p> : null}
      {children}
    </section>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted">{label}</p>
      {children}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

interface OptionPickerProps<T extends string> {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}

export function OptionPicker<T extends string>({ label, value, options, onChange }: OptionPickerProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isActive = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'border-foreground bg-foreground text-white'
                  : 'border-border bg-surface text-muted hover:border-borderInput hover:text-foreground'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}
