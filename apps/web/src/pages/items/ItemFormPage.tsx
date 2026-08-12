import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { itemsApi } from '../../api/items.api';
import { ITEMS_CATALOG_LIMIT, itemsQueryKeys } from '../../lib/items-query-keys';
import { ApiError } from '../../lib/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAppNavigate } from '../../hooks/useAppNavigate';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { FormActions, FormField, FormPageShell, FormSection, OptionPicker } from '../../components/ui/FormLayout';
import type { CreateItemPayload, ItemStatus } from '../../types/item';

interface ItemFormValues {
  name: string;
  description: string;
  quantity: number;
  rate: number;
  status: ItemStatus;
}

const defaultValues: ItemFormValues = { name: '', description: '', quantity: 0, rate: 0, status: 'AVAILABLE' };

const STATUS_OPTIONS: { id: ItemStatus; label: string }[] = [
  { id: 'AVAILABLE', label: 'Available' },
  { id: 'UNAVAILABLE', label: 'Unavailable' },
];

export function ItemFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  useDocumentTitle(isEditMode ? 'Edit item' : 'Add item');
  const navigate = useAppNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: itemsQueryKeys.catalog(),
    queryFn: () => itemsApi.list({ limit: ITEMS_CATALOG_LIMIT }).then((res) => res.data),
    enabled: isEditMode,
  });

  const item = isEditMode ? data?.items.find((entry) => entry._id === id) : undefined;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormValues>({ defaultValues });

  const status = watch('status');

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

  const goBack = () => navigate((routes) => routes.dashboard.items);

  return (
    <FormPageShell
      title={isEditMode ? 'Edit item' : 'Add item'}
      description={isEditMode ? "Update this item's details." : 'Create a new product or service to sell.'}
      back={{ label: 'Back to items', onClick: goBack }}
      isLoading={isEditMode && isLoading}
      notFound={isEditMode && !isLoading && !item ? { title: 'Item not found', description: 'This item may have been removed.' } : undefined}
    >
      <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-5">
        <FormSection title="Details">
          <FormField label="Name" error={errors.name?.message}>
            <Input {...register('name', { required: 'Name is required' })} />
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <Textarea rows={3} {...register('description')} placeholder="Optional short description" />
          </FormField>
        </FormSection>

        <FormSection title="Pricing & inventory">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Quantity" error={errors.quantity?.message}>
              <Input
                type="number"
                min={0}
                {...register('quantity', {
                  required: 'Required',
                  min: { value: 0, message: 'Must be 0 or more' },
                  valueAsNumber: true,
                })}
              />
            </FormField>

            <FormField label="Rate" error={errors.rate?.message}>
              <Input
                type="number"
                min={0}
                step="0.01"
                {...register('rate', {
                  required: 'Required',
                  min: { value: 0, message: 'Must be 0 or more' },
                  valueAsNumber: true,
                })}
              />
            </FormField>
          </div>

          <OptionPicker
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={(value) => setValue('status', value, { shouldDirty: true })}
          />
        </FormSection>

        <FormActions>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Add item'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={goBack}>
            Cancel
          </Button>
        </FormActions>
      </form>
    </FormPageShell>
  );
}
