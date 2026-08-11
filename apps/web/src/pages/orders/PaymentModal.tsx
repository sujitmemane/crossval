import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { transactionsApi } from '../../api/transactions.api';
import { ApiError } from '../../lib/api-client';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
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

export function PaymentModal({ order, type, onClose }: PaymentModalProps) {
  const queryClient = useQueryClient();
  const isRefund = type === 'REFUND';
  const maxAmount = isRefund ? order.amountPaid : order.totalAmount - order.amountPaid;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({ defaultValues: { amount: maxAmount, method: 'CASH', note: '' } });

  const createTransaction = useMutation({ mutationFn: transactionsApi.create });

  const onSubmit = handleSubmit(async (values) => {
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
        toast.success(response.message);
        onClose();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  });

  return (
    <Modal title={isRefund ? 'Refund payment' : 'Record payment'} onClose={onClose}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label={`Amount (max ${maxAmount.toFixed(2)})`}
          type="number"
          min={0.01}
          step="0.01"
          error={errors.amount?.message}
          {...register('amount', {
            required: 'Amount is required',
            min: { value: 0.01, message: 'Must be greater than 0' },
            max: { value: maxAmount, message: `Cannot exceed ${maxAmount.toFixed(2)}` },
            valueAsNumber: true,
          })}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="method" className="text-sm font-medium text-slate-700">
            Method
          </label>
          <select
            id="method"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition-colors focus:border-slate-900"
            {...register('method')}
          >
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank transfer</option>
            <option value="CARD">Card</option>
            <option value="UPI">UPI</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="note" className="text-sm font-medium text-slate-700">
            Note (optional)
          </label>
          <textarea
            id="note"
            rows={3}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition-colors focus:border-slate-900"
            {...register('note')}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" isLoading={isSubmitting}>
            {isRefund ? 'Refund' : 'Record payment'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
