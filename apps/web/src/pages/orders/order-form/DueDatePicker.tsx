import { Input } from '../../../components/ui/Input';
import type { DueDatePreset } from './types';
import { DUE_DATE_PRESETS, addDaysFromToday, formatDueDateLabel } from './utils';

interface DueDatePickerProps {
  value: string;
  preset: DueDatePreset;
  error?: string;
  onPresetChange: (preset: DueDatePreset, date: string) => void;
  onCustomDateChange: (date: string) => void;
}

export function DueDatePicker({ value, preset, error, onPresetChange, onCustomDateChange }: DueDatePickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted">Due date</p>
      <div className="flex flex-wrap gap-1.5">
        {DUE_DATE_PRESETS.map((option) => {
          const isActive = preset === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                if (option.days) {
                  onPresetChange(option.id, addDaysFromToday(option.days));
                } else {
                  onPresetChange('custom', value || addDaysFromToday(7));
                }
              }}
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
      {preset === 'custom' ? (
        <Input type="date" value={value} onChange={(event) => onCustomDateChange(event.target.value)} error={error} />
      ) : (
        <p className="text-xs text-muted">
          Due <span className="font-medium text-foreground">{formatDueDateLabel(value)}</span>
        </p>
      )}
      {preset !== 'custom' && error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
