export type TransactionType = 'income' | 'expense' | 'transfer' | 'refund' | 'adjustment';

export type TransactionSource = 'manual' | 'import' | 'recurring' | 'system';

export interface Transaction {
  id: string;
  userId?: string;
  accountId: string;
  toAccountId?: string; // Used when type === 'transfer'
  categoryId?: string;
  type: TransactionType;
  amount: number;
  currency: 'MAD';
  description: string;
  transactionDate: string; // YYYY-MM-DD
  merchant?: string;
  recurring?: boolean;
  recurringId?: string;
  transferId?: string; // Shared ID linking the withdrawal & deposit sides of a transfer
  source: TransactionSource;
  createdAt: string;
  updatedAt: string;
}

export interface LinkedTransfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
  date: string;
  withdrawalTransactionId: string;
  depositTransactionId: string;
}
