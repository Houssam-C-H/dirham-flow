import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { calculateNetWorth, calculateLiquidBalance } from '../../utils/calculations';
import { Wallet, Landmark, PiggyBank, CreditCard, ArrowUpRight } from 'lucide-react';

export const NetWorthCard: React.FC = () => {
  const { state, currencyDisplay } = useFinance();
  const netWorth = calculateNetWorth(state.accounts);
  const liquidMoney = calculateLiquidBalance(state.accounts);

  const cashAccount = state.accounts.find(a => a.type === 'cash');
  const bankAccounts = state.accounts.filter(a => a.type === 'bank');
  const savingsAccounts = state.accounts.filter(a => a.type === 'savings');
  const creditAccounts = state.accounts.filter(a => a.type === 'credit');

  const bankTotal = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const savingsTotal = savingsAccounts.reduce((sum, a) => sum + a.balance, 0);
  const creditTotal = creditAccounts.reduce((sum, a) => sum + a.balance, 0);
  const cashBalance = cashAccount ? cashAccount.balance : 0;

  return (
    <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Patrimoine Net Total (Solde Net)
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 700, color: '#FFF', margin: '0.2rem 0' }}>
            {formatCurrency(netWorth, currencyDisplay)}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#10B981' }}>
            <ArrowUpRight size={16} />
            <span>Liquidités disponibles: <strong>{formatCurrency(liquidMoney, currencyDisplay)}</strong></span>
          </div>
        </div>

        {/* Cash First-Class Badge */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '16px',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--color-primary)',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Wallet size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Espèces en main (Cash 💵)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10B981' }}>
              {formatCurrency(cashBalance, currencyDisplay)}
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '1.25rem 0' }} />

      {/* Account Breakdown Grid */}
      <div
        className="networth-breakdown"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem'
        }}
      >
        {/* Bank */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          padding: '0.85rem 1rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F59E0B', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
            <Landmark size={14} /> Banque ({bankAccounts.length})
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {formatCurrency(bankTotal, currencyDisplay)}
          </div>
        </div>

        {/* Savings */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          padding: '0.85rem 1rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3B82F6', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
            <PiggyBank size={14} /> Épargne ({savingsAccounts.length})
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {formatCurrency(savingsTotal, currencyDisplay)}
          </div>
        </div>

        {/* Credit Debt */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          padding: '0.85rem 1rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#EF4444', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
            <CreditCard size={14} /> Crédit / Différé
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#EF4444' }}>
            -{formatCurrency(creditTotal, currencyDisplay)}
          </div>
        </div>
      </div>
    </div>
  );
};
