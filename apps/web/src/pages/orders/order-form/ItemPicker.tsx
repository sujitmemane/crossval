import { formatCurrency } from '../../../lib/format-currency';
import type { Item } from '../../../types/item';
import type { OrderLine } from './types';

interface ItemPickerProps {
  items: Item[];
  orderLines: OrderLine[];
  currency: string;
  locked: boolean;
  onAdd: (itemId: string) => void;
}

export function ItemPicker({ items, orderLines, currency, locked, onAdd }: ItemPickerProps) {
  const linesById = new Map(orderLines.map((line) => [line.itemId, line.quantity]));
  const availableItems = items.filter((item) => item.status === 'AVAILABLE');

  if (availableItems.length === 0) {
    return <p className="text-sm text-muted">No available items. Add an item first.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
      {availableItems.map((item) => {
        const inOrderQty = linesById.get(item._id) ?? 0;
        const isInOrder = inOrderQty > 0;

        return (
          <button
            key={item._id}
            type="button"
            disabled={locked}
            onClick={() => onAdd(item._id)}
            className={`rounded-md border px-2.5 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              isInOrder
                ? 'border-accent/30 bg-accentSoft/30 hover:bg-accentSoft/50'
                : 'border-border bg-surface hover:bg-surfaceMuted/40'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <p className="truncate text-xs font-medium text-foreground">{item.name}</p>
              {isInOrder ? (
                <span className="shrink-0 rounded bg-accent px-1 py-px text-[10px] font-medium text-white">
                  ×{inOrderQty}
                </span>
              ) : null}
            </div>
            <p className="tabular-nums mt-0.5 text-xs font-semibold text-foreground">
              {formatCurrency(item.rate, currency)}
            </p>
          </button>
        );
      })}
    </div>
  );
}
