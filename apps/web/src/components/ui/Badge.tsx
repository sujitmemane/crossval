import type { ReactNode } from 'react';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-surfaceMuted text-muted',
  success: 'bg-successSoft text-successInk',
  warning: 'bg-warningSoft text-warningInk',
  danger: 'bg-dangerSoft text-dangerInk',
};

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
