import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Button } from '../../components/ui/Button';
import { FormPageShell, FormSection } from '../../components/ui/FormLayout';
import { formatCurrency } from '../../lib/format-currency';
import { CustomerPicker } from './order-form/CustomerPicker';
import { DueDatePicker } from './order-form/DueDatePicker';
import { ItemPicker } from './order-form/ItemPicker';
import { OrderLines } from './order-form/OrderLines';
import { useOrderForm } from './order-form/useOrderForm';

export function OrderFormPage() {
  const form = useOrderForm();
  useDocumentTitle(form.isEditMode ? 'Edit order' : 'Add order');

  return (
    <FormPageShell
      title={form.isEditMode ? 'Edit order' : 'Add order'}
      description={form.isEditMode ? "Update this order's details." : 'Create a new order for a customer.'}
      back={{ label: 'Back to orders', onClick: form.goBack }}
      isLoading={form.isLoading}
      notFound={form.isNotFound ? { title: 'Order not found', description: 'This order may have been removed.' } : undefined}
    >
      <form onSubmit={form.onSubmit} className="flex max-w-2xl flex-col gap-5">
        <FormSection>
          <CustomerPicker
            customers={form.customers}
            value={form.watchedUserId}
            error={form.errors.userId?.message}
            onSelect={form.setCustomer}
          />

          <DueDatePicker
            value={form.watchedDueDate}
            preset={form.dueDatePreset}
            error={form.errors.dueDate?.message}
            onPresetChange={form.setDueDateFromPreset}
            onCustomDateChange={form.setDueDate}
          />
        </FormSection>

        <section className="flex flex-col gap-3">
          <p className="text-xs font-medium text-muted">Items · click to add</p>

          {form.itemsLocked ? (
            <p className="text-xs text-muted">This order is fully paid, so its items can no longer be changed.</p>
          ) : null}

          <ItemPicker
            items={form.items}
            orderLines={form.orderLines}
            currency={form.currency}
            locked={form.itemsLocked}
            onAdd={form.addItemToOrder}
          />

          <OrderLines
            items={form.items}
            orderLines={form.orderLines}
            lineTotals={form.lineTotals}
            currency={form.currency}
            locked={form.itemsLocked}
            onIncrement={form.incrementItem}
            onDecrement={form.decrementItem}
            onRemove={form.removeItem}
          />

          {form.errors.items?.message ? (
            <p className="text-xs text-danger">{form.errors.items.message as string}</p>
          ) : null}
        </section>

        <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
          <p className="text-xs font-medium text-muted">Total</p>
          <p className="tabular-nums text-base font-semibold text-foreground">
            {formatCurrency(form.orderTotal, form.currency)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            isLoading={form.isSubmitting}
            disabled={form.customers.length === 0 || form.items.length === 0}
          >
            {form.isEditMode ? 'Save changes' : 'Create order'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={form.goBack}>
            Cancel
          </Button>
        </div>
      </form>
    </FormPageShell>
  );
}
