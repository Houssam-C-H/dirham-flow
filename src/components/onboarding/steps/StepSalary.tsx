import React from 'react';
import type { SalaryConfig, Account, EmploymentType } from '../../../types/finance';
import { useFinance } from '../../../context/FinanceContext';
import { TRANSLATIONS } from '../../../utils/i18n';

interface StepSalaryProps {
  salaryConfig: SalaryConfig;
  setSalaryConfig: (config: SalaryConfig) => void;
  accounts: Account[];
  onNext: () => void;
  onBack: () => void;
}

export const StepSalary: React.FC<StepSalaryProps> = ({
  salaryConfig,
  setSalaryConfig,
  accounts,
  onNext,
  onBack
}) => {
  const { language } = useFinance();
  const t = TRANSLATIONS[language] || TRANSLATIONS.fr;

  const empType = salaryConfig.employmentType || 'monthly_salary';

  return (
    <div>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.2rem' }}>
        {t.step3Title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        {t.step3Subtitle}
      </p>

      {/* Employment Type Toggle */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { type: 'monthly_salary', title: '💼 Salaire Fixe Mensuel', desc: 'Versé le 25 du mois...' },
          { type: 'self_employed', title: '🚀 Indépendant / Irrégulier', desc: 'Revenus variables' },
          { type: 'none', title: '❌ Pas de Salaire Régulier', desc: 'Gestion du capital actuel' }
        ].map(item => (
          <button
            key={item.type}
            type="button"
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border: empType === item.type ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
              background: empType === item.type ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)',
              color: 'var(--text-main)',
              textAlign: 'left',
              cursor: 'pointer'
            }}
            onClick={() => setSalaryConfig({ ...salaryConfig, employmentType: item.type as EmploymentType })}
          >
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{item.desc}</div>
          </button>
        ))}
      </div>

      {empType === 'monthly_salary' && (
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{t.monthlySalaryLabel}</label>
              <input
                type="number"
                className="form-input"
                style={{ fontSize: '1.1rem', fontWeight: 700 }}
                value={salaryConfig.monthlySalary}
                onChange={e => setSalaryConfig({ ...salaryConfig, monthlySalary: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{t.payDayLabel}</label>
              <select
                className="form-select"
                value={salaryConfig.payDay}
                onChange={e => setSalaryConfig({ ...salaryConfig, payDay: parseInt(e.target.value) })}
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
                value={salaryConfig.targetAccountId || accounts[0]?.id}
                onChange={e => setSalaryConfig({ ...salaryConfig, targetAccountId: e.target.value })}
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({acc.bankName})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
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
