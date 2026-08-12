import { useState } from 'react';
import { ButtonLink } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { paths } from '../../../routes/paths';
import type { OrgUser } from '../../../types/user';
import { getInitials } from './utils';

interface CustomerPickerProps {
  customers: OrgUser[];
  value: string;
  error?: string;
  onSelect: (userId: string) => void;
}

export function CustomerPicker({ customers, value, error, onSelect }: CustomerPickerProps) {
  const [search, setSearch] = useState('');
  const selected = customers.find((customer) => customer._id === value);

  const filtered = customers.filter((customer) => {
    if (!search.trim()) return true;
    const query = search.trim().toLowerCase();
    return customer.name.toLowerCase().includes(query) || customer.email.toLowerCase().includes(query);
  });

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted">Customer</p>
        {customers.length > 0 ? (
          <span className="text-xs text-mutedForeground">{filtered.length} shown</span>
        ) : null}
      </div>

      {selected ? (
        <div className="flex items-center gap-2 rounded-md border border-foreground/15 bg-surfaceMuted/50 px-2.5 py-1.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-[10px] font-semibold text-foreground">
            {getInitials(selected.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">{selected.name}</p>
            <p className="truncate text-[11px] text-muted">{selected.email}</p>
          </div>
          <button
            type="button"
            onClick={() => onSelect('')}
            className="text-[11px] font-medium text-muted hover:text-foreground"
          >
            Change
          </button>
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surfaceMuted/30 px-3 py-4 text-center">
          <p className="text-xs text-muted">No customers yet. Add one to assign this order.</p>
          <ButtonLink to={paths.dashboard.usersNew} size="sm" className="mt-3">
            Add customer
          </ButtonLink>
        </div>
      ) : (
        <>
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="max-h-40 overflow-y-auto rounded-md border border-border">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-muted">No customers match your search.</p>
            ) : (
              filtered.map((customer) => (
                <button
                  key={customer._id}
                  type="button"
                  onClick={() => onSelect(customer._id)}
                  className="flex w-full items-center gap-2 border-b border-border px-2.5 py-2 text-left transition-colors last:border-b-0 hover:bg-surfaceMuted/50"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surfaceMuted text-[10px] font-semibold text-foreground">
                    {getInitials(customer.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{customer.name}</p>
                    <p className="truncate text-[11px] text-muted">{customer.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
