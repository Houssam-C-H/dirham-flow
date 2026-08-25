import type { StorageAdapter, AppStateData } from './storage/StorageAdapter';
import { LocalStorageAdapter } from './storage/LocalStorageAdapter';
import { ApiAdapter } from './storage/ApiAdapter';
import type { Transaction, LinkedTransfer } from '../types/transaction';
import type { AffordabilityAssessment } from '../types/finance';
import { evaluateAffordability as runAffordabilityEngine } from '../utils/calculations';

export class FinanceService {
  private adapter: StorageAdapter;

  constructor(adapter?: StorageAdapter) {
    if (adapter) {
      this.adapter = adapter;
    } else {
      const useApi = (import.meta as any).env?.VITE_USE_API === 'true';
      this.adapter = useApi ? new ApiAdapter() : new LocalStorageAdapter();
    }
  }

  async loadInitialData(): Promise<AppStateData> {
    return await this.adapter.loadState();
  }

  async saveData(state: AppStateData): Promise<void> {
    await this.adapter.saveState(state);
  }

  async resetDemoData(): Promise<AppStateData> {
    return await this.adapter.resetToDemoData();
  }

  /**
   * Executes a Bank -> Cash (or Account -> Account) linked transfer cleanly.
   * Modifies account balances and records a linked transfer without creating an artificial expense.
   */
  executeLinkedTransfer(
    state: AppStateData,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string,
    date: string = new Date().toISOString().split('T')[0]
  ): AppStateData {
    if (amount <= 0 || fromAccountId === toAccountId) return state;

    const fromAcc = state.accounts.find(a => a.id === fromAccountId);
    const toAcc = state.accounts.find(a => a.id === toAccountId);

    if (!fromAcc || !toAcc) return state;

    // Collision-safe IDs: timestamp + random suffix handles rapid sequential inserts
    const transferId = `tr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const txId = `tx_tr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Update account balances
    const updatedAccounts = state.accounts.map(acc => {
      if (acc.id === fromAccountId) {
        return { ...acc, balance: acc.balance - amount };
      }
      if (acc.id === toAccountId) {
        return { ...acc, balance: acc.balance + amount };
      }
      return acc;
    });

    const newTransferTx: Transaction = {
      id: txId,
      accountId: fromAccountId,
      toAccountId: toAccountId,
      type: 'transfer',
      amount: amount,
      currency: 'MAD',
      description: description || `Transfert ${fromAcc.name} → ${toAcc.name}`,
      transactionDate: date,
      transferId: transferId,
      source: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newLinkedTransfer: LinkedTransfer = {
      id: transferId,
      fromAccountId,
      toAccountId,
      amount,
      description: description || `Transfert ${fromAcc.name} → ${toAcc.name}`,
      date,
      withdrawalTransactionId: txId,
      depositTransactionId: txId
    };

    return {
      ...state,
      accounts: updatedAccounts,
      transactions: [newTransferTx, ...state.transactions],
      linkedTransfers: [newLinkedTransfer, ...state.linkedTransfers]
    };
  }

  /**
   * Adds an income or expense transaction, updating target account balance.
   */
  addTransaction(state: AppStateData, txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'currency'>): AppStateData {
    // Collision-safe ID: timestamp + random suffix handles rapid batch imports
    const newId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newTx: Transaction = {
      ...txData,
      id: newId,
      currency: 'MAD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update target account balance
    const updatedAccounts = state.accounts.map(acc => {
      if (acc.id === txData.accountId) {
        let newBal = acc.balance;
        if (txData.type === 'expense') {
          newBal -= txData.amount;
        } else if (txData.type === 'income' || txData.type === 'refund') {
          newBal += txData.amount;
        }
        return { ...acc, balance: newBal };
      }
      return acc;
    });

    return {
      ...state,
      accounts: updatedAccounts,
      transactions: [newTx, ...state.transactions]
    };
  }

  /**
   * Marks a bill as paid and records the corresponding expense transaction.
   */
  markBillPaid(state: AppStateData, billId: string): AppStateData {
    const bill = state.bills.find(b => b.id === billId);
    if (!bill || bill.isPaidThisMonth) return state;

    const updatedBills = state.bills.map(b => (b.id === billId ? { ...b, isPaidThisMonth: true } : b));

    const todayStr = new Date().toISOString().split('T')[0];

    const updatedState = this.addTransaction(
      { ...state, bills: updatedBills },
      {
        accountId: bill.accountId,
        categoryId: bill.categoryId,
        type: 'expense',
        amount: bill.amount,
        description: `Paiement Facture: ${bill.name} (${bill.provider})`,
        transactionDate: todayStr,
        merchant: bill.provider,
        source: 'recurring'
      }
    );

    return updatedState;
  }

  /**
   * Adds a deposit to a savings goal and deducts the amount from the source account.
   * Moved here from FinanceContext so business logic stays in the service layer.
   */
  addSavingsDeposit(
    state: AppStateData,
    goalId: string,
    amount: number,
    sourceAccountId: string
  ): AppStateData {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return state;

    const newCurrent = goal.currentAmount + amount;
    const updatedGoals = state.goals.map(g =>
      g.id === goalId
        ? { ...g, currentAmount: newCurrent, isCompleted: newCurrent >= g.targetAmount }
        : g
    );

    const updatedAccounts = state.accounts.map(acc =>
      acc.id === sourceAccountId ? { ...acc, balance: acc.balance - amount } : acc
    );

    return { ...state, goals: updatedGoals, accounts: updatedAccounts };
  }

  /**
   * Evaluates affordability of an item using the 4-tier decision engine.
   * Uses preferences.cashSafetyBuffer as the single source of truth.
   */
  evaluateAffordabilityForItem(state: AppStateData, itemName: string, price: number): AffordabilityAssessment {
    const unpaidBills = state.bills.filter(b => !b.isPaidThisMonth);
    
    // Estimate unspent budget remainder across categories
    const periodSpent = state.transactions
      .filter(t => t.type === 'expense' && t.categoryId)
      .reduce((acc, t) => {
        acc[t.categoryId!] = (acc[t.categoryId!] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const reservedBudgetTotal = state.budgets.reduce((sum, b) => {
      const spent = periodSpent[b.categoryId] || 0;
      const remaining = Math.max(0, b.limit - spent);
      return sum + remaining;
    }, 0);

    const savingsCommitments = state.goals
      .filter(g => !g.isCompleted)
      .reduce((sum, g) => sum + Math.min(500, g.targetAmount - g.currentAmount), 0);

    return runAffordabilityEngine(
      itemName,
      price,
      state.accounts,
      unpaidBills,
      reservedBudgetTotal,
      savingsCommitments,
      state.preferences.cashSafetyBuffer || 2000
    );
  }
}
