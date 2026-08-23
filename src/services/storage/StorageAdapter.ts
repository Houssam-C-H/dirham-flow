import type { Transaction, LinkedTransfer } from '../../types/transaction';
import type { Account, SalaryConfig, SavingsGoal, SeasonalConfig } from '../../types/finance';
import type { Category, CategoryBudget, Bill, RecurringTransaction } from '../../types/budget';
import type { UserPreferences } from '../../types/user';
import type { Debt, OnboardingUserData } from '../../types/onboarding';

export interface AppStateData {
  onboardingCompleted: boolean;
  user: OnboardingUserData | null;
  accounts: Account[];
  transactions: Transaction[];
  linkedTransfers: LinkedTransfer[];
  categories: Category[];
  budgets: CategoryBudget[];
  bills: Bill[];
  recurring: RecurringTransaction[];
  debts: Debt[];
  salaryConfig: SalaryConfig;
  goals: SavingsGoal[];
  preferences: UserPreferences;
  seasonalConfig: SeasonalConfig;
}

export interface StorageAdapter {
  loadState(): Promise<AppStateData>;
  saveState(state: AppStateData): Promise<void>;
  resetToDemoData(): Promise<AppStateData>;
}
