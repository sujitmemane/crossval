import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = '', name, ...rest }: InputProps) {
  const inputId = id ?? name;

  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        name={name}
        className={`rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:border-slate-900 ${
          error ? 'border-red-500' : 'border-slate-300'
        } ${className}`}
        {...rest}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
