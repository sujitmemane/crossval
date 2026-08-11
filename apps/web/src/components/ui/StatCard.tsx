type StatTone = 'neutral' | 'danger';

interface StatCardProps {
  label: string;
  value: string;
  tone?: StatTone;
}

const valueToneClasses: Record<StatTone, string> = {
  neutral: 'text-slate-900',
  danger: 'text-red-600',
};

export function StatCard({ label, value, tone = 'neutral' }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${valueToneClasses[tone]}`}>{value}</p>
    </div>
  );
}
