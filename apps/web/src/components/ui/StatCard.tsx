type StatTone = 'neutral' | 'success' | 'accent' | 'danger';

interface StatCardProps {
  label: string;
  value: string;
  tone?: StatTone;
}

const valueToneClasses: Record<StatTone, string> = {
  neutral: 'text-foreground',
  success: 'text-success',
  accent: 'text-accentInk',
  danger: 'text-danger',
};

export function StatCard({ label, value, tone = 'neutral' }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3.5 shadow-xs">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <p className={`mt-1.5 truncate text-xl font-semibold ${valueToneClasses[tone]}`}>{value}</p>
    </div>
  );
}
