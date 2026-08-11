import { formatCurrency } from '../../../lib/format-currency';
import type { Item } from '../../../types/item';
import type { OrderLine } from './types';

interface OrderLinesProps {
  items: Item[];
  orderLines: OrderLine[];
  lineTotals: number[];
  currency: string;
  locked: boolean;
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  onRemove: (itemId: string) => void;
}

export function OrderLines({
  items,
  orderLines,
  lineTotals,
  currency,
  locked,
  onIncrement,
  onDecrement,
  onRemove,
}: OrderLinesProps) {
  const itemsById = new Map(items.map((item) => [item._id, item]));

  if (orderLines.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border px-3 py-5 text-center">
        <p className="text-xs text-muted">Click items above to add.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
      {orderLines.map((line, index) => {
        const item = itemsById.get(line.itemId);
        if (!item) return null;

        return (
          <div key={line.itemId} className="flex items-center gap-2 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">{item.name}</p>
              <p className="tabular-nums text-[11px] text-muted">{formatCurrency(item.rate, currency)} ea</p>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                disabled={locked}
                onClick={() => onDecrement(line.itemId)}
                className="flex h-6 w-6 items-center justify-center rounded border border-border text-xs text-muted hover:bg-surfaceMuted hover:text-foreground disabled:opacity-40"
                aria-label={`Decrease ${item.name} quantity`}
              >
                −
              </button>
              <span className="tabular-nums w-6 text-center text-xs font-semibold">{line.quantity}</span>
              <button
                type="button"
                disabled={locked}
                onClick={() => onIncrement(line.itemId)}
                className="flex h-6 w-6 items-center justify-center rounded border border-border text-xs text-muted hover:bg-surfaceMuted hover:text-foreground disabled:opacity-40"
                aria-label={`Increase ${item.name} quantity`}
              >
                +
              </button>
            </div>

            <p className="tabular-nums w-20 text-right text-xs font-semibold text-foreground">
              {formatCurrency(lineTotals[index] ?? 0, currency)}
            </p>

            <button
              type="button"
              disabled={locked}
              onClick={() => onRemove(line.itemId)}
              className="text-[11px] font-medium text-muted hover:text-foreground disabled:opacity-40"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
