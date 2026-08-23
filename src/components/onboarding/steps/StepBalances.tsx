import React from 'react';
import type { Account } from '../../../types/finance';
import { Calendar, Info } from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { TRANSLATIONS } from '../../../utils/i18n';

interface StepBalancesProps {
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
  asOfDate: string;
  setAsOfDate: (date: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepBalances: React.FC<StepBalancesProps> = ({
  accounts,
  setAccounts,
  asOfDate,
  setAsOfDate,
  onNext,
  onBack
}) => {
  const { language } = useFinance();
  const t = TRANSLATIONS[language] || TRANSLATIONS.fr;

  const handleBalanceChange = (accId: string, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setAccounts(
        accounts.map(a =>
          a.id === accId ? { ...a, balance: num, openingBalance: num } : a
        )
      );
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.2rem' }}>
        {t.step2Title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        {t.step2Subtitle}
      </p>

      {/* Info Callout */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        padding: '0.85rem 1rem',
        fontSize: '0.85rem',
        color: '#3B82F6',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem'
      }}>
        <Info size={20} />
        <div>
          <strong>Réconciliation:</strong>
          <div style={{ fontFamily: 'monospace', marginTop: '0.2rem', color: 'var(--text-main)', fontSize: '0.8rem' }}>
            Solde Calculé = Solde d'Ouverture + Revenus - Dépenses ± Transferts
          </div>
        </div>
      </div>

      {/* As of Date input */}
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label className="form-label">{t.asOfDateLabel}</label>
        <div style={{ position: 'relative', maxWidth: '300px' }}>
          <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="date"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            value={asOfDate}
            onChange={e => setAsOfDate(e.target.value)}
          />
        </div>
      </div>

      {/* Balances list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {accounts.map(acc => (
          <div
            key={acc.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{acc.name}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Solde au {asOfDate}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                className="form-input"
                style={{ width: '150px', fontSize: '1.1rem', fontWeight: 700, textAlign: 'right' }}
                value={acc.balance}
                onChange={e => handleBalanceChange(acc.id, e.target.value)}
              />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>DH</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onBack}>
          {t.btnBack}
        </button>
        <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={onNext}>
          {t.btnContinue}
        </button>
      </div>
    </div>
  );
};
