import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { calculateDailyBudget } from '../../utils/calculations';
import { Wallet, CheckCircle2 } from 'lucide-react';
import { TRANSLATIONS } from '../../utils/i18n';

export const SalaryPlannerView: React.FC = () => {
  const { state, currencyDisplay, updateSalaryConfig, language } = useFinance();
  const { monthlySalary, payDay, targetAccountId } = state.salaryConfig;
  const t = TRANSLATIONS[language] || TRANSLATIONS.fr;

  const [salaryInput, setSalaryInput] = useState<string>(monthlySalary.toString());
  const [payDayInput, setPayDayInput] = useState<number>(payDay);
  const [selectedAccId, setSelectedAccId] = useState<string>(targetAccountId || state.accounts[0]?.id || '');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const numSalary = parseFloat(salaryInput);
    if (!isNaN(numSalary) && numSalary > 0) {
      updateSalaryConfig({
        ...state.salaryConfig,
        monthlySalary: numSalary,
        payDay: payDayInput,
        targetAccountId: selectedAccId
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  // Compute allocated expenses sum
  const allocations = state.salaryConfig.allocations || {};
  const totalAllocatedExpenses = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  const remainingSalary = Math.max(0, monthlySalary - totalAllocatedExpenses);
  const { dailyBudget } = calculateDailyBudget(remainingSalary, payDay);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Streamlined Salary Header Form */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={20} color="var(--color-primary)" /> {language === 'ar_darija' ? 'الخلصة و ميزانية اليوم' : 'Mon Salaire & Paye'}
          </h3>
          {savedSuccess && (
            <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={14} /> Enregistré !
            </span>
          )}
        </div>

        <form onSubmit={handleSaveConfig} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t.monthlySalaryLabel}</label>
            <input
              type="number"
              className="form-input"
              style={{ fontSize: '1.1rem', fontWeight: 700 }}
              value={salaryInput}
              onChange={e => setSalaryInput(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t.payDayLabel}</label>
            <select
              className="form-select"
              style={{ fontSize: '1rem' }}
              value={payDayInput}
              onChange={e => setPayDayInput(parseInt(e.target.value))}
            >
              {[1, 5, 10, 15, 20, 25, 28, 30].map(day => (
                <option key={day} value={day}>Le {day} du mois</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t.targetAccountLabel}</label>
            <select
              className="form-select"
              value={selectedAccId}
              onChange={e => setSelectedAccId(e.target.value)}
            >
              {state.accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '44px' }}>
            Mettre à jour
          </button>
        </form>
      </div>

      {/* Simplified Salary Breakdown & Daily Budget */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Répartition du Salaire</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {formatCurrency(monthlySalary, currencyDisplay)}
            </div>
          </div>

          <div style={{ textAlign: 'right', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.65rem 1rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>Budget Quotidien Disponible:</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981' }}>
              ≈ {formatCurrency(dailyBudget, currencyDisplay)} / jour
            </div>
          </div>
        </div>

        {/* Breakdown List */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Salaire Entrant Net</span>
            <span style={{ fontWeight: 700, color: '#10B981' }}>{formatCurrency(monthlySalary, currencyDisplay)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Dépenses & Allocations Prévisionnelles</span>
            <span style={{ fontWeight: 700, color: '#EF4444' }}>-{formatCurrency(totalAllocatedExpenses, currencyDisplay)}</span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px dashed rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800 }}>
            <span>Solde Libre Restant</span>
            <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(remainingSalary, currencyDisplay)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
