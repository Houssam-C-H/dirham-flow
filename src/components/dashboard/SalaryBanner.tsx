import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { calculateDailyBudget } from '../../utils/calculations';
import { formatDateFrench } from '../../utils/dates';
import { Zap } from 'lucide-react';

export const SalaryBanner: React.FC = () => {
  const { state, currencyDisplay } = useFinance();
  const { monthlySalary, payDay, nextPayDate } = state.salaryConfig;

  // Calculate current month's expenses since last payday
  const currentMonthExpenses = state.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const remainingSalary = Math.max(0, monthlySalary - currentMonthExpenses);
  const { dailyBudget, daysLeft } = calculateDailyBudget(remainingSalary, payDay);

  return (
    <div className="glass-card" style={{
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))',
      border: '1px solid rgba(16, 185, 129, 0.3)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        {/* Left Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontWeight: 600, fontSize: '0.85rem' }}>
            <Zap size={16} /> Cycles de Salaire Marocain (Jour {payDay})
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.3rem 0 0.1rem 0' }}>
            Salaire Mensuel: {formatCurrency(monthlySalary, currencyDisplay)}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Prochain salaire le: <strong>{formatDateFrench(nextPayDate || '2026-08-25')}</strong> (dans {daysLeft} jours)
          </p>
        </div>

        {/* Highlighted Daily Budget Calculation Pill */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '18px',
          padding: '1rem 1.5rem',
          textAlign: 'center',
          minWidth: '220px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Budget Quotidien Disponible
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981', margin: '0.2rem 0' }}>
            ≈ {formatCurrency(dailyBudget, currencyDisplay)} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>/ jour</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Sur les {daysLeft} prochains jours
          </span>
        </div>
      </div>
    </div>
  );
};
