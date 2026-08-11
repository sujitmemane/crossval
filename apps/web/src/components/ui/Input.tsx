import type { InputHTMLAttributes, Ref } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ label, error, id, className = '', name, ref, ...rest }: InputProps) {
  const inputId = id ?? name;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        name={name}
        className={`rounded-lg border bg-surfaceInput px-3 py-2.5 text-sm text-foreground shadow-xs outline-none transition-all placeholder:text-mutedForeground focus:border-accent focus:ring-2 focus:ring-accent/20 ${
          error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-borderInput'
        } ${className}`}
        {...rest}
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
