import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { itemsApi } from '../../../api/items.api';
import { ITEMS_CATALOG_LIMIT, itemsQueryKeys } from '../../../lib/items-query-keys';
import { usersApi } from '../../../api/users.api';
import { ordersApi } from '../../../api/orders.api';
import { ApiError } from '../../../lib/api-client';
import { useAppNavigate } from '../../../hooks/useAppNavigate';
import { useOrganization } from '../../../hooks/useOrganization';
import type { CreateOrderPayload, UpdateOrderPayload } from '../../../types/order';
import type { DueDatePreset, OrderFormValues, OrderLine } from './types';
import { addDaysFromToday, detectDueDatePreset, normalizeItems } from './utils';

const emptyDefaults: OrderFormValues = { userId: '', dueDate: '', items: [] };

export function useOrderForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useAppNavigate();
  const queryClient = useQueryClient();
  const { data: organization } = useOrganization();
  const currency = organization?.currency ?? 'USD';

  const [dueDatePreset, setDueDatePreset] = useState<DueDatePreset>('7');

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list().then((res) => res.data),
    enabled: isEditMode,
  });

  const order = isEditMode ? ordersData?.orders.find((entry) => entry._id === id) : undefined;
  const isFullyPaid = Boolean(order && order.amountPaid >= order.totalAmount);
  const itemsLocked = isEditMode && isFullyPaid;

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['users', { role: 'CUSTOMER' }],
    queryFn: () => usersApi.list({ role: 'CUSTOMER' }).then((res) => res.data),
  });

  const { data: itemsData, isLoading: isLoadingItems } = useQuery({
    queryKey: itemsQueryKeys.catalog(),
    queryFn: () => itemsApi.list({ limit: ITEMS_CATALOG_LIMIT }).then((res) => res.data),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    defaultValues: { ...emptyDefaults, dueDate: addDaysFromToday(7) },
  });

  const watchedUserId = useWatch({ control, name: 'userId' });
  const watchedDueDate = useWatch({ control, name: 'dueDate' });
  const watchedItems = useWatch({ control, name: 'items' }) ?? [];

  useEffect(() => {
    register('userId', { required: 'Customer is required' });
    register('dueDate', { required: 'Due date is required' });
    register('items', {
      validate: (lines) => (lines.length > 0 ? true : 'Add at least one item'),
    });
  }, [register]);

  useEffect(() => {
    if (!order) return;
    const dueDate = order.dueDate.slice(0, 10);
    reset({
      userId: order.userId,
      dueDate,
      items: order.items.map((line) => ({ itemId: line.itemId, quantity: line.quantity })),
    });
    setDueDatePreset(detectDueDatePreset(dueDate));
  }, [order, reset]);

  const customers = customersData?.users ?? [];
  const items = itemsData?.items ?? [];

  const itemsById = useMemo(() => new Map(items.map((item) => [item._id, item])), [items]);
  const orderLines = watchedItems.filter((line) => line.itemId);

  const lineTotals = orderLines.map((line) => {
    const item = itemsById.get(line.itemId);
    return item ? item.rate * line.quantity : 0;
  });
  const orderTotal = lineTotals.reduce((sum, total) => sum + total, 0);

  const updateOrderLines = (nextLines: OrderLine[]) => {
    setValue('items', nextLines, { shouldValidate: true, shouldDirty: true });
  };

  const addItemToOrder = (itemId: string) => {
    const existing = orderLines.find((line) => line.itemId === itemId);
    if (existing) {
      updateOrderLines(
        orderLines.map((line) =>
          line.itemId === itemId ? { ...line, quantity: line.quantity + 1 } : line,
        ),
      );
      return;
    }
    updateOrderLines([...orderLines, { itemId, quantity: 1 }]);
  };

  const decrementItem = (itemId: string) => {
    const line = orderLines.find((entry) => entry.itemId === itemId);
    if (!line) return;
    if (line.quantity <= 1) {
      updateOrderLines(orderLines.filter((entry) => entry.itemId !== itemId));
      return;
    }
    updateOrderLines(
      orderLines.map((entry) =>
        entry.itemId === itemId ? { ...entry, quantity: entry.quantity - 1 } : entry,
      ),
    );
  };

  const removeItem = (itemId: string) => {
    updateOrderLines(orderLines.filter((entry) => entry.itemId !== itemId));
  };

  const setCustomer = (userId: string) => {
    setValue('userId', userId, { shouldValidate: true, shouldDirty: true });
  };

  const setDueDate = (date: string) => {
    setValue('dueDate', date, { shouldValidate: true, shouldDirty: true });
  };

  const setDueDateFromPreset = (preset: DueDatePreset, date: string) => {
    setDueDatePreset(preset);
    setDueDate(date);
  };

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

  const goBack = () => navigate((routes) => routes.dashboard.orders);

  const isLoading = (isEditMode && isLoadingOrders) || isLoadingCustomers || isLoadingItems;
  const isNotFound = isEditMode && !isLoading && !order;

  return {
    isEditMode,
    isLoading,
    isNotFound,
    itemsLocked,
    currency,
    customers,
    items,
    orderLines,
    lineTotals,
    orderTotal,
    watchedUserId,
    watchedDueDate,
    dueDatePreset,
    errors,
    isSubmitting,
    onSubmit,
    goBack,
    setCustomer,
    setDueDate,
    setDueDateFromPreset,
    addItemToOrder,
    incrementItem: addItemToOrder,
    decrementItem,
    removeItem,
  };
}
