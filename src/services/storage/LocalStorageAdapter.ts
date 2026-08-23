import type { StorageAdapter, AppStateData } from './StorageAdapter';

const STORAGE_KEY = 'dirhamflow_app_state_v1';

export const INITIAL_DEMO_DATA: AppStateData = {
  onboardingCompleted: false,
  user: {
    fullName: '',
    email: '',
    language: 'fr'
  },
  accounts: [
    {
      id: 'acc_cash',
      name: '💵 Espèces (Cash)',
      type: 'cash',
      balance: 0,
      openingBalance: 0,
      openingBalanceDate: new Date().toISOString().split('T')[0],
      institutionId: 'inst_cash',
      color: '#10B981',
      icon: 'Banknote',
      isDefault: true
    },
    {
      id: 'acc_attijari',
      name: '🏦 Attijariwafa Bank',
      type: 'bank',
      balance: 0,
      openingBalance: 0,
      openingBalanceDate: new Date().toISOString().split('T')[0],
      institutionId: 'inst_attijari',
      bankName: 'Attijariwafa Bank',
      accountNumber: '•••• 4829',
      color: '#F59E0B',
      icon: 'Building2'
    },
    {
      id: 'acc_savings',
      name: '💰 Compte Épargne',
      type: 'savings',
      balance: 0,
      openingBalance: 0,
      openingBalanceDate: new Date().toISOString().split('T')[0],
      institutionId: 'inst_cih',
      bankName: 'CIH Bank',
      accountNumber: '•••• 9102',
      color: '#3B82F6',
      icon: 'PiggyBank'
    }
  ],
  categories: [
    // Daily (Clean 0 DH Default Limits)
    { id: 'cat_food', name: '🍞 Nourriture', nameDarija: 'الماكلة', icon: '🍞', group: 'daily', defaultLimit: 0, color: '#F59E0B' },
    { id: 'cat_cafes', name: '☕ Cafés', nameDarija: 'القهوة', icon: '☕', group: 'daily', defaultLimit: 0, color: '#D97706' },
    { id: 'cat_restaurants', name: '🍔 Restaurants', nameDarija: 'السناك و الريسطو', icon: '🍔', group: 'daily', defaultLimit: 0, color: '#EF4444' },
    { id: 'cat_groceries', name: '🛒 Groceries (Marjane/BIM)', nameDarija: 'التسوق و السويقة', icon: '🛒', group: 'daily', defaultLimit: 0, color: '#10B981' },
    { id: 'cat_transport', name: '🚕 Transport (Taxi/Careem)', nameDarija: 'الطاكسي و الطرانسبور', icon: '🚕', group: 'daily', defaultLimit: 0, color: '#3B82F6' },
    { id: 'cat_fuel', name: '⛽ Fuel (Essence/Gasoil)', nameDarija: 'المازوط و المازوت', icon: '⛽', group: 'daily', defaultLimit: 0, color: '#6366F1' },
    { id: 'cat_phone_internet', name: '📱 Téléphone & Internet', nameDarija: 'الريشارژ و الأنترنيت', icon: '📱', group: 'daily', defaultLimit: 0, color: '#8B5CF6' },
    { id: 'cat_health', name: '💊 Santé & Pharmacie', nameDarija: 'الفارماسي و الطبيب', icon: '💊', group: 'daily', defaultLimit: 0, color: '#EC4899' },
    { id: 'cat_clothing', name: '👕 Vêtements', nameDarija: 'الحوايج', icon: '👕', group: 'daily', defaultLimit: 0, color: '#14B8A6' },
    { id: 'cat_entertainment', name: '🎮 Sorties & Loisirs', nameDarija: 'النشاط و اللعب', icon: '🎮', group: 'daily', defaultLimit: 0, color: '#A855F7' },

    // Household (Clean 0 DH Default Limits)
    { id: 'cat_rent', name: '🏠 Loyer', nameDarija: 'الكرا', icon: '🏠', group: 'household', defaultLimit: 0, color: '#64748B' },
    { id: 'cat_electricity', name: '💡 Électricité (ONEE/Redal)', nameDarija: 'الضو', icon: '💡', group: 'household', defaultLimit: 0, color: '#EAB308' },
    { id: 'cat_water', name: '💧 Eau (Redal/Lydec)', nameDarija: 'الما', icon: '💧', group: 'household', defaultLimit: 0, color: '#06B6D4' },
    { id: 'cat_gas', name: '🔥 Gaz (Bouteille)', nameDarija: 'البوطة', icon: '🔥', group: 'household', defaultLimit: 0, color: '#F97316' },
    { id: 'cat_internet_home', name: '📡 Fibre Internet Maison', nameDarija: 'الفيبر د الدار', icon: '📡', group: 'household', defaultLimit: 0, color: '#0284C7' },

    // Moroccan Specific (Clean 0 DH Default Limits)
    { id: 'cat_family', name: '👨‍👩‍👦 Aide Familiale (Daraouia)', nameDarija: 'المساعدة د الوالدين', icon: '👨‍👩‍👦', group: 'moroccan', defaultLimit: 0, color: '#F43F5E' },
    { id: 'cat_sadaqa', name: '🕌 Sadaqa / Charité', nameDarija: 'الصدقة و الزكاة', icon: '🕌', group: 'moroccan', defaultLimit: 0, color: '#059669' },
    { id: 'cat_gifts', name: '🎁 Cadeaux & Fêtes', nameDarija: 'الهدايا و العراضات', icon: '🎁', group: 'moroccan', defaultLimit: 0, color: '#D946EF' },
    { id: 'cat_wedding', name: '💍 Mariage / Événement', nameDarija: 'العرس و المناسبات', icon: '💍', group: 'moroccan', defaultLimit: 0, color: '#FB7185' },
    { id: 'cat_car_maint', name: '🚗 Entretien Voiture / Vidange', nameDarija: 'الديدونج و الطوموبيل', icon: '🚗', group: 'moroccan', defaultLimit: 0, color: '#475569' }
  ],
  budgets: [],
  bills: [],
  recurring: [],
  debts: [],
  salaryConfig: {
    monthlySalary: 0,
    payDay: 25,
    employmentType: 'monthly_salary',
    cashSafetyBuffer: 2000,
    nextPayDate: new Date().toISOString().split('T')[0],
    allocations: {}
  },
  goals: [],
  transactions: [],
  linkedTransfers: [],
  preferences: {
    currencyDisplay: 'DH',
    language: 'fr',
    theme: 'dark',
    cashSafetyBuffer: 2000
  },
  seasonalConfig: {
    activeMode: 'standard',
    ramadanBudget: 0,
    eidBudget: 0
  }
};

export class LocalStorageAdapter implements StorageAdapter {
  async loadState(): Promise<AppStateData> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        await this.saveState(INITIAL_DEMO_DATA);
        return INITIAL_DEMO_DATA;
      }
      const parsed = JSON.parse(raw) as AppStateData;
      return { ...INITIAL_DEMO_DATA, ...parsed };
    } catch (e) {
      console.warn('LocalStorageAdapter read error, fallback to initial state:', e);
      return INITIAL_DEMO_DATA;
    }
  }

  async saveState(state: AppStateData): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('LocalStorageAdapter write error:', e);
    }
  }

  async resetToDemoData(): Promise<AppStateData> {
    await this.saveState(INITIAL_DEMO_DATA);
    return INITIAL_DEMO_DATA;
  }
}
