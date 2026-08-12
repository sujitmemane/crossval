import { useState } from 'react';
import toast from 'react-hot-toast';
import { ordersApi } from '../../api/orders.api';
import { ApiError } from '../../lib/api-client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function ExportOrdersBar() {
  const [startDate, setStartDate] = useState(() => toDateInputValue(startOfMonth()));
  const [endDate, setEndDate] = useState(() => toDateInputValue(new Date()));
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (startDate > endDate) {
      toast.error('Start date must be before end date');
      return;
    }

    setIsExporting(true);
    try {
      await ordersApi.exportCsv({ startDate, endDate });
      toast.success('Orders CSV downloaded');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not export orders');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-foreground">Export orders</p>
        <p className="mt-0.5 text-sm text-muted">
          Download a CSV for the selected created date range. All dates in the file are shown in UTC.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Input
            label="From"
            type="date"
            value={startDate}
            max={endDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>

        <div className="w-40">
          <Input
            label="To"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>

        <Button type="button" variant="secondary" isLoading={isExporting} onClick={handleExport}>
          Download CSV
        </Button>
      </div>
    </div>
  );
}
