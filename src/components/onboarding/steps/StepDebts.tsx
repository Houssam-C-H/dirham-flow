import React, { useState } from 'react';
import type { Debt, DebtType } from '../../../types/onboarding';
import { Plus, Trash2 } from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { TRANSLATIONS } from '../../../utils/i18n';

interface StepDebtsProps {
  debts: Debt[];
  setDebts: (debts: Debt[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepDebts: React.FC<StepDebtsProps> = ({ debts, setDebts, onNext, onBack }) => {
  const { language } = useFinance();
  const t = TRANSLATIONS[language] || TRANSLATIONS.fr;

  const [hasDebt, setHasDebt] = useState<boolean>(debts.length > 0);
  const [debtName, setDebtName] = useState<string>('Carte de Crédit CIH (Achats différés)');
  const [debtType, setDebtType] = useState<DebtType>('credit_card');
  const [outstanding, setOutstanding] = useState<string>('2400');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('600');
  const [dueDate] = useState<number>(15);

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const outNum = parseFloat(outstanding);
    const payNum = parseFloat(monthlyPayment);
    if (isNaN(outNum) || isNaN(payNum)) return;

    const newDebt: Debt = {
      id: `debt_${Date.now()}`,
      name: debtName || 'Crédit / Dette',
      type: debtType,
      outstandingAmount: outNum,
      monthlyPayment: payNum,
      dueDate
    };

    setDebts([...debts, newDebt]);
    setDebtName('Autre crédit');
    setOutstanding('0');
  };

  const handleRemove = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.2rem' }}>
        {t.step4Title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        {t.step4Subtitle}
      </p>

      {/* Choice */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`btn ${!hasDebt ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1 }}
          onClick={() => { setHasDebt(false); setDebts([]); }}
        >
          {t.btnNoDebt}
        </button>

        <button
          type="button"
          className={`btn ${hasDebt ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, background: hasDebt ? '#EF4444' : undefined }}
          onClick={() => setHasDebt(true)}
        >
          {t.btnYesDebt}
        </button>
      </div>

      {hasDebt && (
        <>
          <form onSubmit={handleAddDebt} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{t.debtTypeLabel}</label>
                <select className="form-select" value={debtType} onChange={e => setDebtType(e.target.value as DebtType)}>
                  <option value="credit_card">💳 Solde Carte Crédit Différé</option>
                  <option value="personal_loan">🏦 Crédit à la Consommation</option>
                  <option value="car_loan">🚗 Crédit Automobile</option>
                  <option value="family_loan">🤝 Dette Personnelle / Familiale</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{t.debtNameLabel}</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={debtName}
                  onChange={e => setDebtName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{t.outstandingLabel}</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  style={{ fontWeight: 700, color: '#EF4444' }}
                  value={outstanding}
                  onChange={e => setOutstanding(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{t.monthlyPaymentLabel}</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  style={{ fontWeight: 700 }}
                  value={monthlyPayment}
                  onChange={e => setMonthlyPayment(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              <Plus size={16} /> {t.btnAddDebt}
            </button>
          </form>

          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
            {debts.map(d => (
              <div
                key={d.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '12px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{d.name}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Mensualité: {d.monthlyPayment} DH / mois
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 800, color: '#EF4444', fontSize: '1.05rem' }}>
                    -{d.outstandingAmount} DH
                  </span>
                  <button type="button" onClick={() => handleRemove(d.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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
