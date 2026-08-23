export type AccountType = 'cash' | 'bank' | 'credit' | 'savings' | 'ewallet';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  openingBalance?: number;
  openingBalanceDate?: string; // "As of" date e.g. 2026-08-23
  institutionId?: string;
  bankName?: string;
  accountNumber?: string;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export type EmploymentType = 'monthly_salary' | 'self_employed' | 'irregular' | 'none';

export interface SalaryConfig {
  monthlySalary: number;
  payDay: number; // e.g. 25
  employmentType?: EmploymentType;
  targetAccountId?: string;
  cashSafetyBuffer: number; // e.g. 2000 DH default safety cushion
  allocations: Record<string, number>; // categoryId -> allocation amount in DH
  nextPayDate: string; // YYYY-MM-DD
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  categoryIcon: string;
  color: string;
  isCompleted: boolean;
}

export type SeasonalMode = 'standard' | 'ramadan' | 'eid';

export interface SeasonalConfig {
  activeMode: SeasonalMode;
  ramadanBudget: number;
  eidBudget: number;
}

export type AffordabilityTier =
  | 'affordable'
  | 'affordable_impacts_goal'
  | 'not_recommended'
  | 'not_affordable';

export interface AffordabilityAssessment {
  itemName: string;
  itemPrice: number;
  liquidBalance: number;
  upcomingBillsTotal: number;
  reservedBudgetTotal: number;
  cashSafetyBuffer: number;
  savingsCommitments: number;
  discretionaryMoney: number;
  remainingDiscretionaryAfter: number;
  tier: AffordabilityTier;
  messageFr: string;
  messageDarija: string;
  recommendationDetails: string[];
}

export interface StatementImportRow {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  suggestedCategoryId: string;
  merchantName: string;
  confidence: 'high' | 'medium' | 'low';
  selected: boolean;
}
