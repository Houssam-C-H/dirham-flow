import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Calendar as CalendarIcon } from 'lucide-react';

export const FinancialCalendarTimeline: React.FC = () => {
  const { state, currencyDisplay } = useFinance();
  const { monthlySalary } = state.salaryConfig;

  // Build timeline sequence: Payday 25th -> Rent 1st -> Internet 5th -> Electricity 8th -> Next Payday 25th
  const events = [
    { date: '23 Août', title: "Aujourd'hui", type: 'current', amount: 0, icon: '📌' },
    { date: `25 Août`, title: `Vers. Salaire (${formatCurrency(monthlySalary, currencyDisplay)})`, type: 'income', amount: monthlySalary, icon: '💰' },
    { date: `1 Sept.`, title: 'Loyer Appartement (-2,500 DH)', type: 'bill', amount: -2500, icon: '🏠' },
    { date: `5 Sept.`, title: 'Fibre Optique (-250 DH)', type: 'bill', amount: -250, icon: '📡' },
    { date: `8 Sept.`, title: 'Facture Électricité (-350 DH)', type: 'bill', amount: -350, icon: '💡' },
    { date: `25 Sept.`, title: 'Prochain Salaire Mensuel', type: 'income', amount: monthlySalary, icon: '🎉' }
  ];

  return (
    <div className="glass-card">
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarIcon size={18} color="var(--color-primary)" /> Calendrier Financier & Anticipation Payday
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          "Que va-t-il se passer avant mon prochain salaire ?"
        </p>
      </div>

      {/* Horizontal / Vertical Timeline Flow */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        position: 'relative'
      }}>
        {events.map((evt, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.1rem',
              background: evt.type === 'current'
                ? 'rgba(16, 185, 129, 0.12)'
                : evt.type === 'income'
                ? 'rgba(59, 130, 246, 0.1)'
                : 'rgba(255,255,255,0.02)',
              border: evt.type === 'current' ? '1px solid #10B981' : '1px solid var(--border-color)',
              borderRadius: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span style={{ fontSize: '1.3rem' }}>{evt.icon}</span>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{evt.date}</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{evt.title}</div>
              </div>
            </div>

            {evt.amount !== 0 && (
              <div style={{
                fontWeight: 700,
                fontSize: '1rem',
                color: evt.amount > 0 ? '#10B981' : '#EF4444'
              }}>
                {evt.amount > 0 ? '+' : ''}{formatCurrency(evt.amount, currencyDisplay)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
