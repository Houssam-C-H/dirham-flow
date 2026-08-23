export type CurrencyDisplay = 'DH' | 'MAD';
export type AppLanguage = 'fr' | 'ar_darija' | 'en';
export type AppTheme = 'dark' | 'light';

export interface UserPreferences {
  currencyDisplay: CurrencyDisplay;
  language: AppLanguage;
  theme: AppTheme;
  cashSafetyBuffer: number;
}

export interface UserProfile {
  id: string;
  full_name: string;
  language: AppLanguage;
  currency: CurrencyDisplay;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}
