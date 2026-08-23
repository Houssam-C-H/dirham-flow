import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { calculateLiquidBalance } from '../../utils/calculations';

export const QuickDarijaBanner: React.FC = () => {
  const { state, currencyDisplay } = useFinance();

  const totalSpentMonth = state.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const liquidMoney = calculateLiquidBalance(state.accounts);

  return (
    <div className="glass-card" style={{
      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
      border: '1px solid rgba(245, 158, 11, 0.25)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            fontSize: '1.8rem',
            background: 'rgba(245, 158, 11, 0.2)',
            padding: '0.5rem 0.75rem',
            borderRadius: '12px'
          }}>
            🇲🇦
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Tajawal', color: '#F59E0B' }}>
              فين مشاو فلوسك هاد الشهر؟
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Aperçu en Darija marocaine
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'Tajawal' }}>
              هاد الشهر صرفتي:
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EF4444' }}>
              {formatCurrency(totalSpentMonth, currencyDisplay)}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'Tajawal' }}>
              باقي ليك فلوس سايبة:
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10B981' }}>
              {formatCurrency(liquidMoney, currencyDisplay)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
