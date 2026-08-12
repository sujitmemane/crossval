import type { Ref, TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ error, className = '', ref, ...rest }: TextareaProps) {
  return (
    <textarea
      ref={ref}
      className={`w-full resize-none rounded-lg border bg-surfaceInput px-3 py-2.5 text-sm text-foreground shadow-xs outline-none transition-all placeholder:text-mutedForeground focus:border-accent focus:ring-2 focus:ring-accent/20 ${
        error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-borderInput'
      } ${className}`}
      {...rest}
    />
  );
}
