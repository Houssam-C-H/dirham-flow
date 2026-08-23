import type { StorageAdapter, AppStateData } from './StorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const isUuid = (id: string): boolean => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export class SupabaseStorageAdapter implements StorageAdapter {
  private localAdapter = new LocalStorageAdapter();

  async loadState(): Promise<AppStateData> {
    if (!isSupabaseConfigured) {
      // Local mode when Supabase credentials are not set
      return this.localAdapter.loadState();
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      // Clear legacy storage keys containing stale sessions
      try {
        localStorage.removeItem('dirhamflow_app_state_v1');
        localStorage.removeItem('dirhamflow_app_state_v2');
      } catch (e) {}

      const local = await this.localAdapter.loadState();
      return {
        ...local,
        onboardingCompleted: false,
        user: null,
        accounts: [],
        transactions: [],
        budgets: [],
        bills: [],
        goals: []
      };
    }

    // 1. Fetch Profile (contains onboarding_completed flag)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.warn('Profile fetch warning:', profileError.message);
    }

    // 2. Fetch Accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id);

    if (accountsError) {
      console.warn('Accounts fetch warning:', accountsError.message);
    }

    // 3. Fetch Transactions
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (transError) {
      console.warn('Transactions fetch warning:', transError.message);
    }

    // 4. Fetch Budgets
    const { data: budgets } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id);

    // 5. Fetch Bills
    const { data: bills } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', user.id);

    // 6. Fetch Savings Goals
    const { data: goals } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id);

    const localPrefs = await this.localAdapter.loadState();

    const userEmail = user.email || '';
    const rawName = profile?.full_name || user.user_metadata?.full_name || '';
    const computedName = rawName && rawName !== userEmail ? rawName : (userEmail.split('@')[0] || 'Utilisateur');

    const hasAccountsInDb = accounts && accounts.length > 0;
    const isOnboardingCompleted = (profile?.onboarding_completed ?? false) || hasAccountsInDb;

    return {
      onboardingCompleted: isOnboardingCompleted,
      user: {
        fullName: computedName,
        email: userEmail,
        language: (profile?.language as any) || localPrefs.user?.language || 'fr'
      },
      accounts: (accounts && accounts.length > 0)
        ? accounts.map(a => ({
            id: a.id,
            name: a.name,
            type: a.type,
            balance: parseFloat(a.balance || 0),
            openingBalance: parseFloat(a.balance || 0),
            openingBalanceDate: a.created_at,
            bankName: a.bank_name || undefined,
            color: a.color || '#10b981',
            icon: a.icon || 'wallet'
          }))
        : localPrefs.accounts,

      transactions: (transactions || []).map(t => ({
        id: t.id,
        accountId: t.account_id,
        categoryId: t.category,
        amount: parseFloat(t.amount || 0),
        type: t.type,
        description: t.description || '',
        date: t.date,
        currency: 'MAD' as const,
        transactionDate: t.date,
        source: 'manual' as const,
        createdAt: t.created_at,
        updatedAt: t.created_at
      })),

      categories: localPrefs.categories,

      budgets: (budgets || []).map(b => ({
        categoryId: b.id,
        limit: parseFloat(b.total_income || 0),
        period: 'monthly'
      })),

      bills: (bills || []).map(b => ({
        id: b.id,
        name: b.name,
        provider: b.provider || b.name,
        amount: parseFloat(b.amount || 0),
        dueDate: typeof b.due_day === 'number' ? b.due_day : parseInt(b.due_day || '1', 10),
        categoryId: b.category || 'general',
        accountId: b.account_id || '',
        isPaidThisMonth: Boolean(b.is_paid),
        icon: b.icon || 'receipt'
      })),

      goals: (goals || []).map(g => ({
        id: g.id,
        title: g.title,
        targetAmount: parseFloat(g.target_amount || 0),
        currentAmount: parseFloat(g.current_amount || 0),
        targetDate: g.target_date,
        categoryIcon: g.category_icon || 'target',
        color: g.color || '#3b82f6',
        isCompleted: parseFloat(g.current_amount || 0) >= parseFloat(g.target_amount || 1)
      })),

      recurring: [],
      debts: [],
      salaryConfig: localPrefs.salaryConfig,
      linkedTransfers: [],
      preferences: localPrefs.preferences,
      seasonalConfig: localPrefs.seasonalConfig
    };
  }

  async saveState(state: AppStateData): Promise<void> {
    // Save UI preferences locally
    await this.localAdapter.saveState(state);

    if (!isSupabaseConfigured) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // 1. Save profile state including onboarding completion
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: state.user?.fullName,
        language: state.user?.language || 'fr',
        currency: state.preferences?.currencyDisplay || 'MAD',
        onboarding_completed: state.onboardingCompleted,
        updated_at: new Date().toISOString()
      });

      // 2. Persist Accounts to Supabase
      if (state.accounts && state.accounts.length > 0) {
        for (const acc of state.accounts) {
          const accPayload: any = {
            user_id: user.id,
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            currency: 'MAD',
            bank_name: acc.bankName || acc.name,
            updated_at: new Date().toISOString()
          };
          if (isUuid(acc.id)) {
            accPayload.id = acc.id;
          }
          await supabase.from('accounts').upsert(accPayload);
        }
      }

      // 3. Persist Bills to Supabase
      if (state.bills && state.bills.length > 0) {
        for (const b of state.bills) {
          const billPayload: any = {
            user_id: user.id,
            name: b.name,
            amount: b.amount,
            due_day: typeof b.dueDate === 'number' ? b.dueDate : 1,
            is_paid: b.isPaidThisMonth,
            category: b.categoryId || 'Fixe'
          };
          if (isUuid(b.id)) {
            billPayload.id = b.id;
          }
          await supabase.from('bills').upsert(billPayload);
        }
      }

      // 4. Persist Transactions to Supabase
      if (state.transactions && state.transactions.length > 0) {
        for (const t of state.transactions) {
          const txPayload: any = {
            user_id: user.id,
            account_id: isUuid(t.accountId) ? t.accountId : null,
            category: t.categoryId || 'general',
            amount: t.amount,
            type: t.type,
            description: t.description,
            date: t.transactionDate || new Date().toISOString().split('T')[0]
          };
          if (isUuid(t.id)) {
            txPayload.id = t.id;
          }
          await supabase.from('transactions').upsert(txPayload);
        }
      }
    } catch (err) {
      console.error('Error persisting state to Supabase:', err);
    }
  }

  async resetToDemoData(): Promise<AppStateData> {
    return this.localAdapter.resetToDemoData();
  }
}
