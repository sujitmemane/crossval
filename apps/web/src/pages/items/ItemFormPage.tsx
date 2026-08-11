import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { itemsApi } from '../../api/items.api';
import { ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAppNavigate } from '../../hooks/useAppNavigate';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { CreateItemPayload, ItemStatus } from '../../types/item';

interface ItemFormValues {
  name: string;
  description: string;
  quantity: number;
  rate: number;
  status: ItemStatus;
}

const defaultValues: ItemFormValues = { name: '', description: '', quantity: 0, rate: 0, status: 'AVAILABLE' };

export function ItemFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  useDocumentTitle(isEditMode ? 'Edit item' : 'Add item');
  const navigate = useAppNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsApi.list().then((res) => res.data),
    enabled: isEditMode,
  });

  const item = isEditMode ? data?.items.find((it) => it._id === id) : undefined;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormValues>({ defaultValues });

  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        description: item.description ?? '',
        quantity: item.quantity,
        rate: item.rate,
        status: item.status,
      });
    }
  }, [item, reset]);

  const createItem = useMutation({ mutationFn: itemsApi.create });
  const updateItem = useMutation({
    mutationFn: (payload: Partial<CreateItemPayload>) => itemsApi.update(id as string, payload),
  });

  const onSubmit = handleSubmit(async (values) => {
    const payload: CreateItemPayload = {
      name: values.name,
      description: values.description || undefined,
      quantity: Number(values.quantity),
      rate: Number(values.rate),
      status: values.status,
    };

    console.log("onSubmit", payload);

    try {
      const response = isEditMode ? await updateItem.mutateAsync(payload) : await createItem.mutateAsync(payload);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ['items'] });
        toast.success(response.message);
        navigate((routes) => routes.dashboard.items);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  });

  if (isEditMode && isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isEditMode && !item) {
    return <EmptyState title="Item not found" description="This item may have been removed." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isEditMode ? 'Edit item' : 'Add item'}
        description={isEditMode ? "Update this item's details." : 'Create a new product or service to sell.'}
      />

      <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
        <Input label="Name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />

        <Input label="Description" error={errors.description?.message} {...register('description')} />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Quantity"
            type="number"
            min={0}
            error={errors.quantity?.message}
            {...register('quantity', {
              required: 'Required',
              min: { value: 0, message: 'Must be 0 or more' },
              valueAsNumber: true,
            })}
          />
          <Input
            label="Rate"
            type="number"
            min={0}
            step="0.01"
            error={errors.rate?.message}
            {...register('rate', {
              required: 'Required',
              min: { value: 0, message: 'Must be 0 or more' },
              valueAsNumber: true,
            })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-sm font-medium text-foreground">
            Status
          </label>
          <select
            id="status"
            className="rounded-md border border-borderInput bg-surfaceInput px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
            {...register('status')}
          >
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Add item'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate((routes) => routes.dashboard.items)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
