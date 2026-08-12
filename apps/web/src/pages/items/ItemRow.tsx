import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../lib/format-currency';
import { paths } from '../../routes/paths';
import type { Item } from '../../types/item';

interface ItemRowProps {
  item: Item;
  currency: string;
}

function itemInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatStatus(status: Item['status']) {
  return status === 'AVAILABLE' ? 'Available' : 'Unavailable';
}

export function ItemRow({ item, currency }: ItemRowProps) {
  const isAvailable = item.status === 'AVAILABLE';

  return (
    <div className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surfaceMuted/40">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
          isAvailable ? 'bg-accentSoft text-accentInk' : 'bg-surfaceMuted text-muted'
        }`}
      >
        {itemInitials(item.name)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{item.name}</p>
        <p className="truncate text-sm text-muted">
          {item.description ?? (isAvailable ? `${item.quantity} in stock` : 'Not available for sale')}
        </p>
      </div>

      <div className="hidden text-right sm:block">
        <p className="text-xs text-muted">Qty</p>
        <p className="tabular-nums text-sm font-medium text-foreground">{item.quantity.toLocaleString()}</p>
      </div>

      <div className="shrink-0 text-right">
        <p className="tabular-nums text-sm font-semibold text-foreground">{formatCurrency(item.rate, currency)}</p>
      </div>

      <span className="hidden shrink-0 sm:inline-flex">
        <Badge tone={isAvailable ? 'success' : 'neutral'}>{formatStatus(item.status)}</Badge>
      </span>

      <Link
        to={paths.dashboard.itemEdit(item._id)}
        className="shrink-0 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        Edit
      </Link>
    </div>
  );
}
