export type CategoryGroup = 'daily' | 'household' | 'moroccan' | 'ramadan' | 'eid';

export interface Category {
  id: string;
  name: string;
  nameDarija?: string;
  icon: string;
  group: CategoryGroup;
  defaultLimit: number;
  color: string;
}

export interface CategoryBudget {
  categoryId: string;
  limit: number;
  period: string; // Format: YYYY-MM
}

export interface RecurringTransaction {
  id: string;
  accountId: string;
  categoryId?: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'monthly' | 'weekly' | 'yearly';
  dayOfMonth: number;
  description: string;
  merchant?: string;
  nextOccurrence: string; // YYYY-MM-DD
  active: boolean;
}

export interface Bill {
  id: string;
  name: string;
  provider: string; // e.g. Redal, Lydec, Radeema, ONEE, Orange, Inwi, IAM, Rent
  amount: number;
  dueDate: number; // Day of the month (1-31)
  categoryId: string;
  accountId: string;
  isPaidThisMonth: boolean;
  icon: string;
  autoPay?: boolean;
}
