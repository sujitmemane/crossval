import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { itemsApi } from '../../api/items.api';
import { usersApi } from '../../api/users.api';
import { ordersApi } from '../../api/orders.api';
import { ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAppNavigate } from '../../hooks/useAppNavigate';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { CreateOrderPayload, UpdateOrderPayload } from '../../types/order';

interface OrderFormValues {
  userId: string;
  dueDate: string;
  items: { itemId: string; quantity: number }[];
}

const emptyDefaults: OrderFormValues = { userId: '', dueDate: '', items: [{ itemId: '', quantity: 1 }] };

const normalizeItems = (items: { itemId: string; quantity: number }[]) =>
  [...items].map((item) => `${item.itemId}:${item.quantity}`).sort().join('|');

export function OrderFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  useDocumentTitle(isEditMode ? 'Edit order' : 'Add order');
  const navigate = useAppNavigate();
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list().then((res) => res.data),
    enabled: isEditMode,
  });

  const order = isEditMode ? ordersData?.orders.find((o) => o._id === id) : undefined;
  const isFullyPaid = Boolean(order && order.amountPaid >= order.totalAmount);

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['users', { role: 'CUSTOMER' }],
    queryFn: () => usersApi.list({ role: 'CUSTOMER' }).then((res) => res.data),
  });

  const { data: itemsData, isLoading: isLoadingItems } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsApi.list().then((res) => res.data),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({ defaultValues: emptyDefaults });

  useEffect(() => {
    if (order) {
      reset({
        userId: order.userId,
        dueDate: order.dueDate.slice(0, 10),
        items: order.items.map((line) => ({ itemId: line.itemId, quantity: line.quantity })),
      });
    }
  }, [order, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });

  const customers = customersData?.users ?? [];
  const items = itemsData?.items ?? [];
  const itemsById = new Map(items.map((item) => [item._id, item]));

  const selectedItemIds = new Set((watchedItems ?? []).map((line) => line.itemId).filter(Boolean));
  const canAddMoreItems = items.some((item) => item.status === 'AVAILABLE' && !selectedItemIds.has(item._id));

  const lineTotals = (watchedItems ?? []).map((line) => {
    const item = line.itemId ? itemsById.get(line.itemId) : undefined;
    return item ? item.rate * (Number(line.quantity) || 0) : 0;
  });
  const orderTotal = lineTotals.reduce((sum, total) => sum + total, 0);

  const createOrder = useMutation({ mutationFn: ordersApi.create });
  const updateOrder = useMutation({
    mutationFn: (payload: UpdateOrderPayload) => ordersApi.update(id as string, payload),
  });

  const onSubmit = handleSubmit(async (values) => {
    const currentItems = values.items.map((item) => ({ itemId: item.itemId, quantity: Number(item.quantity) }));

    try {
      let response;
      if (isEditMode) {
        const payload: UpdateOrderPayload = { userId: values.userId, dueDate: values.dueDate };
        const originalItems = (order?.items ?? []).map((line) => ({ itemId: line.itemId, quantity: line.quantity }));
        if (normalizeItems(originalItems) !== normalizeItems(currentItems)) {
          payload.items = currentItems;
        }
        response = await updateOrder.mutateAsync(payload);
      } else {
        const payload: CreateOrderPayload = { userId: values.userId, dueDate: values.dueDate, items: currentItems };
        response = await createOrder.mutateAsync(payload);
      }

      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ['orders'] });
        await queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
        toast.success(response.message);
        navigate((routes) => routes.dashboard.orders);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  });

  if ((isEditMode && isLoadingOrders) || isLoadingCustomers || isLoadingItems) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isEditMode && !order) {
    return <EmptyState title="Order not found" description="This order may have been removed." />;
  }

  const itemsLocked = isEditMode && isFullyPaid;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isEditMode ? 'Edit order' : 'Add order'}
        description={isEditMode ? "Update this order's details." : 'Create a new order for a customer.'}
      />

      <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="userId" className="text-sm font-medium text-slate-700">
              Customer
            </label>
            <select
              id="userId"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition-colors focus:border-slate-900"
              {...register('userId', { required: 'Customer is required' })}
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>
            {errors.userId ? <p className="text-xs text-red-600">{errors.userId.message}</p> : null}
            {customers.length === 0 ? (
              <p className="text-xs text-slate-500">No customers yet. Add one from the Users page first.</p>
            ) : null}
          </div>

          <Input
            label="Due date"
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate', { required: 'Due date is required' })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-700">Items</p>

          {itemsLocked ? (
            <p className="text-xs text-slate-500">This order is fully paid, so its items can no longer be changed.</p>
          ) : null}

          {items.length === 0 ? (
            <p className="text-sm text-slate-500">No items yet. Add an item first.</p>
          ) : (
            fields.map((field, index) => {
              const currentItemId = watchedItems?.[index]?.itemId;
              const selectableItems = items.filter(
                (item) => item._id === currentItemId || (item.status === 'AVAILABLE' && !selectedItemIds.has(item._id)),
              );

              return (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="flex flex-1 flex-col gap-1">
                    <select
                      disabled={itemsLocked}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition-colors focus:border-slate-900 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                      {...register(`items.${index}.itemId`, { required: 'Required' })}
                    >
                      <option value="">Select an item</option>
                      {selectableItems.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name} · {item.rate}
                          {item.status !== 'AVAILABLE' ? ' (unavailable)' : ''}
                        </option>
                      ))}
                    </select>
                    {errors.items?.[index]?.itemId ? (
                      <p className="text-xs text-red-600">{errors.items[index]?.itemId?.message}</p>
                    ) : null}
                  </div>

                  <div className="w-24">
                    <Input
                      type="number"
                      min={1}
                      disabled={itemsLocked}
                      error={errors.items?.[index]?.quantity?.message}
                      {...register(`items.${index}.quantity`, {
                        required: 'Required',
                        min: { value: 1, message: 'Min 1' },
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <p className="w-20 pt-2 text-right text-sm text-slate-600">{lineTotals[index]?.toFixed(2)}</p>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => remove(index)}
                    disabled={itemsLocked || fields.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              );
            })
          )}

          <Button
            type="button"
            variant="secondary"
            className="w-fit"
            onClick={() => append({ itemId: '', quantity: 1 })}
            disabled={itemsLocked || items.length === 0 || !canAddMoreItems}
          >
            Add item
          </Button>
          {!itemsLocked && items.length > 0 && !canAddMoreItems ? (
            <p className="text-xs text-slate-500">All available items are already added.</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <p className="text-sm font-medium text-slate-700">Total</p>
          <p className="text-sm font-semibold text-slate-900">{orderTotal.toFixed(2)}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" isLoading={isSubmitting} disabled={customers.length === 0 || items.length === 0}>
            {isEditMode ? 'Save changes' : 'Create order'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate((routes) => routes.dashboard.orders)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
