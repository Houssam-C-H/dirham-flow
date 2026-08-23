export interface Institution {
  id: string;
  name: string;
  code?: string;
  icon: string;
  isCustom?: boolean;
}

export const MOROCCAN_INSTITUTIONS: Institution[] = [
  { id: 'inst_cih', name: 'CIH Bank', code: 'CIH', icon: '🏦' },
  { id: 'inst_attijari', name: 'Attijariwafa Bank', code: 'ATW', icon: '🏦' },
  { id: 'inst_bp', name: 'Banque Populaire (BCP)', code: 'BCP', icon: '🏦' },
  { id: 'inst_bmce', name: 'Bank of Africa (BMCE)', code: 'BMCE', icon: '🏦' },
  { id: 'inst_bmci', name: 'BMCI', code: 'BMCI', icon: '🏦' },
  { id: 'inst_sgmb', name: 'Société Générale Maroc', code: 'SGMB', icon: '🏦' },
  { id: 'inst_cdm', name: 'Crédit du Maroc', code: 'CDM', icon: '🏦' },
  { id: 'inst_cash', name: 'Portefeuille Espèces (Cash)', code: 'CASH', icon: '💵' },
  { id: 'inst_ewallet', name: 'Portefeuille Électronique (E-Wallet)', code: 'EWA', icon: '📱' }
];

export type DebtType = 'credit_card' | 'personal_loan' | 'car_loan' | 'family_loan' | 'other';

export interface Debt {
  id: string;
  name: string;
  type: DebtType;
  outstandingAmount: number;
  monthlyPayment: number;
  dueDate: number; // Day of month (1-31)
  accountId?: string;
}

export interface AccountBalanceRecord {
  id: string;
  accountId: string;
  balance: number;
  balanceDate: string; // YYYY-MM-DD "As of" date
  source: 'opening' | 'reconciliation' | 'system';
  createdAt: string;
}

export interface OnboardingUserData {
  fullName: string;
  email: string;
  language: 'fr' | 'ar_darija' | 'en';
}
