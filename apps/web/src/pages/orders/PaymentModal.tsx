import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { transactionsApi } from '../../api/transactions.api';
import { ApiError } from '../../lib/api-client';
import { useOrganization } from '../../hooks/useOrganization';
import { formatCurrency } from '../../lib/format-currency';
import { formatOrderLabel } from '../../lib/format-order-id';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { FormField, OptionPicker } from '../../components/ui/FormLayout';
import type { TransactionMethod, TransactionType } from '../../types/transaction';
import type { OrderWithStatus } from '../../types/order';

interface PaymentModalProps {
  order: OrderWithStatus;
  type: TransactionType;
  onClose: () => void;
}

interface PaymentFormValues {
  amount: number;
  method: TransactionMethod;
  note: string;
}

const METHOD_OPTIONS: { id: TransactionMethod; label: string }[] = [
  { id: 'CASH', label: 'Cash' },
  { id: 'BANK_TRANSFER', label: 'Bank transfer' },
  { id: 'CARD', label: 'Card' },
  { id: 'UPI', label: 'UPI' },
  { id: 'OTHER', label: 'Other' },
];

export function PaymentModal({ order, type, onClose }: PaymentModalProps) {
  const queryClient = useQueryClient();
  const { data: organization } = useOrganization();
  const currency = organization?.currency ?? 'USD';
  const money = (value: number) => formatCurrency(value, currency);

  const isRefund = type === 'REFUND';
  const balanceDue = order.totalAmount - order.amountPaid;
  const maxAmount = isRefund ? order.amountPaid : balanceDue;
  const orderLabel = formatOrderLabel(order._id);

  const [confirmRefund, setConfirmRefund] = useState(false);
  const [pendingValues, setPendingValues] = useState<PaymentFormValues | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    defaultValues: { amount: maxAmount, method: 'CASH', note: '' },
  });

  const amount = watch('amount');
  const method = watch('method');

  const createTransaction = useMutation({ mutationFn: transactionsApi.create });

  const submitTransaction = async (values: PaymentFormValues) => {
    try {
      const response = await createTransaction.mutateAsync({
        orderId: order._id,
        amount: Number(values.amount),
        type,
        method: values.method,
        note: values.note || undefined,
        idempotencyKey: crypto.randomUUID(),
      });

      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ['orders'] });
        await queryClient.invalidateQueries({ queryKey: ['transactions', order._id] });
        await queryClient.invalidateQueries({ queryKey: ['audit-logs', 'order', order._id] });
        toast.success(response.message);
        onClose();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (isRefund && !confirmRefund) {
      setPendingValues(values);
      setConfirmRefund(true);
      return;
    }
    await submitTransaction(values);
  });

  const fillMaxAmount = () => {
    setValue('amount', maxAmount, { shouldDirty: true, shouldValidate: true });
  };

  const paidPercent = order.totalAmount > 0 ? Math.min(100, (order.amountPaid / order.totalAmount) * 100) : 0;

  if (confirmRefund && pendingValues) {
    return (
      <Modal
        title="Confirm refund"
        description={`You are about to refund ${money(pendingValues.amount)} on order ${orderLabel}.`}
        onClose={() => {
          setConfirmRefund(false);
          setPendingValues(null);
        }}
        tone="warning"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setConfirmRefund(false);
                setPendingValues(null);
              }}
            >
              Go back
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isSubmitting}
              onClick={() => submitTransaction(pendingValues)}
            >
              Yes, issue refund
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted">
          This will reduce the amount paid on the order and cannot be undone from here. Make sure the refund amount is
          correct before continuing.
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      title={isRefund ? 'Issue refund' : 'Record payment'}
      description={`Order ${orderLabel} · ${isRefund ? 'Return money to the customer' : 'Apply a payment to this order'}`}
      onClose={onClose}
      tone={isRefund ? 'warning' : 'success'}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="payment-form"
            variant={isRefund ? 'secondary' : 'primary'}
            isLoading={isSubmitting}
            disabled={maxAmount <= 0}
          >
            {isRefund ? 'Review refund' : 'Record payment'}
          </Button>
        </div>
      }
    >
      <form id="payment-form" onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="rounded-md border border-border bg-surfaceMuted/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted">Order summary</p>
            <p className="text-xs text-mutedForeground">{order.items.length} items</p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted">Total</p>
              <p className="tabular-nums font-medium text-foreground">{money(order.totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Paid</p>
              <p className="tabular-nums font-medium text-foreground">{money(order.amountPaid)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">{isRefund ? 'Refundable' : 'Balance due'}</p>
              <p className={`tabular-nums font-semibold ${isRefund ? 'text-warningInk' : 'text-accentInk'}`}>
                {money(maxAmount)}
              </p>
            </div>
          </div>

          {!isRefund ? (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-surfaceMuted">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${paidPercent}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted">{paidPercent.toFixed(0)}% paid</p>
            </div>
          ) : null}
        </div>

        <FormField
          label={isRefund ? 'Refund amount' : 'Payment amount'}
          error={errors.amount?.message}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0.01}
                step="0.01"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Must be greater than 0' },
                  max: { value: maxAmount, message: `Cannot exceed ${money(maxAmount)}` },
                  valueAsNumber: true,
                })}
              />
              <Button type="button" variant="secondary" size="sm" onClick={fillMaxAmount} disabled={maxAmount <= 0}>
                {isRefund ? 'All paid' : 'Full balance'}
              </Button>
            </div>
            <p className="text-xs text-muted">
              Max {money(maxAmount)}
              {amount > 0 ? ` · You’re entering ${money(amount)}` : null}
            </p>
          </div>
        </FormField>

        <OptionPicker
          label="Payment method"
          value={method}
          options={METHOD_OPTIONS}
          onChange={(value) => setValue('method', value, { shouldDirty: true })}
        />

        <FormField label="Note (optional)">
          <Textarea
            rows={3}
            placeholder={isRefund ? 'Reason for refund…' : 'Receipt number, reference, etc.'}
            {...register('note')}
          />
        </FormField>
      </form>
    </Modal>
  );
}
