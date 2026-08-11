export interface OrderFormValues {
  userId: string;
  dueDate: string;
  items: OrderLine[];
}

export interface OrderLine {
  itemId: string;
  quantity: number;
}

export type DueDatePreset = '3' | '7' | '15' | 'custom';
