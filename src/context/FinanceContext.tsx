import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppStateData } from '../services/storage/StorageAdapter';
import { FinanceService } from '../services/financeService';
import type { Transaction } from '../types/transaction';
import type { SalaryConfig, SeasonalMode, AffordabilityAssessment, StatementImportRow, SavingsGoal } from '../types/finance';
import type { CategoryBudget, CategoryGroup, Category } from '../types/budget';
import type { CurrencyDisplay, AppLanguage, AppTheme } from '../types/user';

interface FinanceContextType {
  state: AppStateData;
  loading: boolean;
  currencyDisplay: CurrencyDisplay;
  language: AppLanguage;
  theme: AppTheme;
  activeMode: SeasonalMode;
  
  saveAndSetState: (newState: AppStateData) => void;
  setCurrencyDisplay: (mode: CurrencyDisplay) => void;
  setLanguage: (lang: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
  setActiveMode: (mode: SeasonalMode) => void;
  
  executeLinkedTransfer: (fromAccId: string, toAccId: string, amount: number, description: string) => void;
  addTransaction: (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'currency'>) => void;
  markBillPaid: (billId: string) => void;
  updateSalaryConfig: (config: SalaryConfig) => void;
  updateSafetyBuffer: (bufferAmount: number) => void;
  addSavingsDeposit: (goalId: string, amount: number, sourceAccountId: string) => void;
  updateSavingsGoal: (goalId: string, updatedGoalData: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (goalId: string) => void;
  updateBudgetLimit: (categoryId: string, limit: number) => void;
  addCustomCategory: (name: string, icon: string, group: CategoryGroup, limit: number, nameDarija?: string) => void;
  importTransactions: (rows: StatementImportRow[], targetAccountId: string) => void;
  evaluateAffordability: (itemName: string, price: number) => AffordabilityAssessment;
  resetDemoData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const financeService = new FinanceService();

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppStateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    financeService.loadInitialData().then(data => {
      setState(data);
      setLoading(false);
    });
  }, []);

  const saveAndSetState = (newState: AppStateData) => {
    setState(newState);
    financeService.saveData(newState);
  };

  if (loading || !state) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0F172A',
        color: '#F8FAFC',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div className="spinner" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🇲🇦</div>
        <h2>Chargement de DirhamFlow...</h2>
        <p style={{ color: '#94A3B8' }}>Chargement de vos données financières en DH...</p>
      </div>
    );
  }

  const setCurrencyDisplay = (mode: CurrencyDisplay) => {
    const updated = {
      ...state,
      preferences: { ...state.preferences, currencyDisplay: mode }
    };
    saveAndSetState(updated);
  };

  const setLanguage = (lang: AppLanguage) => {
    const updated = {
      ...state,
      preferences: { ...state.preferences, language: lang }
    };
    saveAndSetState(updated);
  };

  const setTheme = (theme: AppTheme) => {
    const updated = {
      ...state,
      preferences: { ...state.preferences, theme }
    };
    saveAndSetState(updated);
  };

  const setActiveMode = (mode: SeasonalMode) => {
    const updated = {
      ...state,
      seasonalConfig: { ...state.seasonalConfig, activeMode: mode }
    };
    saveAndSetState(updated);
  };

  const executeLinkedTransfer = (fromAccId: string, toAccId: string, amount: number, description: string) => {
    const updated = financeService.executeLinkedTransfer(state, fromAccId, toAccId, amount, description);
    saveAndSetState(updated);
  };

  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'currency'>) => {
    const updated = financeService.addTransaction(state, txData);
    saveAndSetState(updated);
  };

  const markBillPaid = (billId: string) => {
    const updated = financeService.markBillPaid(state, billId);
    saveAndSetState(updated);
  };

  const updateSalaryConfig = (config: SalaryConfig) => {
    const updated = {
      ...state,
      salaryConfig: config
    };
    saveAndSetState(updated);
  };

  const updateSafetyBuffer = (bufferAmount: number) => {
    const updated = {
      ...state,
      preferences: { ...state.preferences, cashSafetyBuffer: bufferAmount },
      salaryConfig: { ...state.salaryConfig, cashSafetyBuffer: bufferAmount }
    };
    saveAndSetState(updated);
  };

  const addSavingsDeposit = (goalId: string, amount: number, sourceAccountId: string) => {
    if (amount <= 0) return;

    // Deduct from source account and add to goal
    const updatedAccounts = state.accounts.map(acc => 
      acc.id === sourceAccountId ? { ...acc, balance: acc.balance - amount } : acc
    );

    const updatedGoals = state.goals.map(g => {
      if (g.id === goalId) {
        const newAmt = g.currentAmount + amount;
        return {
          ...g,
          currentAmount: newAmt,
          isCompleted: newAmt >= g.targetAmount
        };
      }
      return g;
    });

    const targetGoal = state.goals.find(g => g.id === goalId);
    const txId = `tx_savings_${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      accountId: sourceAccountId,
      type: 'expense',
      amount,
      currency: 'MAD',
      description: `Épargne 🎯: ${targetGoal?.title || 'Objectif'}`,
      transactionDate: new Date().toISOString().split('T')[0],
      source: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveAndSetState({
      ...state,
      accounts: updatedAccounts,
      goals: updatedGoals,
      transactions: [newTx, ...state.transactions]
    });
  };

  const updateSavingsGoal = (goalId: string, updatedGoalData: Partial<SavingsGoal>) => {
    const updatedGoals = state.goals.map(g => {
      if (g.id === goalId) {
        const merged = { ...g, ...updatedGoalData };
        merged.isCompleted = merged.currentAmount >= merged.targetAmount;
        return merged;
      }
      return g;
    });
    saveAndSetState({ ...state, goals: updatedGoals });
  };

  const deleteSavingsGoal = (goalId: string) => {
    const updatedGoals = state.goals.filter(g => g.id !== goalId);
    saveAndSetState({ ...state, goals: updatedGoals });
  };

  const updateBudgetLimit = (categoryId: string, limit: number) => {
    const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const exists = state.budgets.some(b => b.categoryId === categoryId && b.period === period);

    let updatedBudgets: CategoryBudget[];
    if (exists) {
      updatedBudgets = state.budgets.map(b => b.categoryId === categoryId && b.period === period ? { ...b, limit } : b);
    } else {
      updatedBudgets = [...state.budgets, { categoryId, limit, period }];
    }

    saveAndSetState({
      ...state,
      budgets: updatedBudgets
    });
  };

  const addCustomCategory = (name: string, icon: string, group: CategoryGroup, limit: number, nameDarija?: string) => {
    const newCatId = `cat_custom_${Date.now()}`;
    const newCategory: Category = {
      id: newCatId,
      name,
      nameDarija: nameDarija || name,
      icon: icon || '🏷️',
      group,
      defaultLimit: limit,
      color: '#10B981'
    };

    const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const newBudget: CategoryBudget = {
      categoryId: newCatId,
      limit,
      period
    };

    saveAndSetState({
      ...state,
      categories: [...state.categories, newCategory],
      budgets: [...state.budgets, newBudget]
    });
  };

  const importTransactions = (rows: StatementImportRow[], targetAccountId: string) => {
    const selectedRows = rows.filter(r => r.selected);
    if (selectedRows.length === 0) return;

    let currentState = { ...state };
    for (const row of selectedRows) {
      currentState = financeService.addTransaction(currentState, {
        accountId: targetAccountId,
        categoryId: row.suggestedCategoryId,
        type: row.type,
        amount: row.amount,
        description: row.description,
        transactionDate: row.date,
        merchant: row.merchantName,
        source: 'import'
      });
    }

    saveAndSetState(currentState);
  };

  const evaluateAffordability = (itemName: string, price: number) => {
    return financeService.evaluateAffordabilityForItem(state, itemName, price);
  };

  const resetDemoData = async () => {
    const demo = await financeService.resetDemoData();
    setState(demo);
  };

  return (
    <FinanceContext.Provider
      value={{
        state,
        loading: false,
        currencyDisplay: state.preferences.currencyDisplay || 'DH',
        language: state.preferences.language || 'fr',
        theme: state.preferences.theme || 'dark',
        activeMode: state.seasonalConfig?.activeMode || 'standard',
        saveAndSetState,
        setCurrencyDisplay,
        setLanguage,
        setTheme,
        setActiveMode,
        executeLinkedTransfer,
        addTransaction,
        markBillPaid,
        updateSalaryConfig,
        updateSafetyBuffer,
        addSavingsDeposit,
        updateSavingsGoal,
        deleteSavingsGoal,
        updateBudgetLimit,
        addCustomCategory,
        importTransactions,
        evaluateAffordability,
        resetDemoData
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
