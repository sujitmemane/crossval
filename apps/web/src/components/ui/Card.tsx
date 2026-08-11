import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md';
  hover?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
};

export function Card({ children, padding = 'sm', hover = false, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface shadow-xs ${paddingClasses[padding]} ${
        hover ? 'transition-colors hover:border-borderInput hover:shadow-sm' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
