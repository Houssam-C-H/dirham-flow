import React from 'react';
import type { Account, SalaryConfig, SavingsGoal } from '../../../types/finance';
import type { Debt, OnboardingUserData } from '../../../types/onboarding';
import { formatCurrency } from '../../../utils/formatters';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { TRANSLATIONS } from '../../../utils/i18n';

interface StepSummaryProps {
  userData: OnboardingUserData | null;
  accounts: Account[];
  salaryConfig: SalaryConfig;
  debts: Debt[];
  goals: SavingsGoal[];
  asOfDate: string;
  onConfirm: () => void;
  onBack: () => void;
}

export const StepSummary: React.FC<StepSummaryProps> = ({
  userData,
  accounts,
  salaryConfig,
  debts,
  asOfDate,
  onConfirm,
  onBack
}) => {
  const { language, currencyDisplay } = useFinance();
  const t = TRANSLATIONS[language] || TRANSLATIONS.fr;

  const bankAccounts = accounts.filter(a => a.type === 'bank');
  const cashAccounts = accounts.filter(a => a.type === 'cash');
  const savingsAccounts = accounts.filter(a => a.type === 'savings');

  const bankTotal = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const cashTotal = cashAccounts.reduce((sum, a) => sum + a.balance, 0);
  const savingsTotal = savingsAccounts.reduce((sum, a) => sum + a.balance, 0);

  const debtsTotal = debts.reduce((sum, d) => sum + d.outstandingAmount, 0);
  const netWorthBaseline = bankTotal + cashTotal + savingsTotal - debtsTotal;

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          background: 'rgba(16, 185, 129, 0.2)',
          color: '#10B981',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.5rem'
        }}>
          <ShieldCheck size={28} />
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
          {t.step6Title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {userData?.fullName || 'Utilisateur'} • {asOfDate}
        </p>
      </div>

      {/* Summary Table Grid */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>🏦 Banques ({bankAccounts.length})</span>
          <span style={{ fontWeight: 600 }}>{formatCurrency(bankTotal, currencyDisplay)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>💵 Espèces (Cash Wallet)</span>
          <span style={{ fontWeight: 600, color: '#10B981' }}>{formatCurrency(cashTotal, currencyDisplay)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>💰 Épargne Dédiée</span>
          <span style={{ fontWeight: 600, color: '#3B82F6' }}>{formatCurrency(savingsTotal, currencyDisplay)}</span>
        </div>

        {debtsTotal > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>💳 Dettes ({debts.length})</span>
            <span style={{ fontWeight: 600, color: '#EF4444' }}>-{formatCurrency(debtsTotal, currencyDisplay)}</span>
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px dashed rgba(255,255,255,0.1)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
          <span>Patrimoine Net Baseline</span>
          <span style={{ color: '#10B981' }}>{formatCurrency(netWorthBaseline, currencyDisplay)}</span>
        </div>
      </div>

      {/* Salary & Fixed Expenses Info */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        borderRadius: '12px',
        padding: '1rem',
        fontSize: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>{t.monthlySalaryLabel}:</span>
          <span style={{ fontWeight: 600 }}>{formatCurrency(salaryConfig.monthlySalary, currencyDisplay)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>{t.payDayLabel}:</span>
          <span style={{ fontWeight: 600 }}>{salaryConfig.payDay}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onBack}>
          {t.btnBack}
        </button>
        <button type="button" className="btn btn-primary" style={{ flex: 1.5, padding: '0.85rem', fontWeight: 700 }} onClick={onConfirm}>
          <CheckCircle2 size={18} /> {t.btnConfirmUnlock}
        </button>
      </div>
    </div>
  );
};
