import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { TRANSLATIONS } from '../../utils/i18n';
import type { SeasonalMode } from '../../types/finance';

export const SeasonalModesView: React.FC = () => {
  const { state, currencyDisplay, activeMode, setActiveMode, language } = useFinance();
  const t = TRANSLATIONS[language] || TRANSLATIONS.fr;

  const [modeBudgetInput, setModeBudgetInput] = useState<string>('2000');

  const modes: Array<{ id: SeasonalMode; label: string; icon: string; color: string }> = [
    { id: 'ramadan', label: t.modeRamadan, icon: '🌙', color: '#10B981' },
    { id: 'eid', label: t.modeEid, icon: '🐏', color: '#F59E0B' },
    { id: 'standard', label: t.modeSummer, icon: '🎉', color: '#3B82F6' },
    { id: 'standard', label: t.modeWedding, icon: '💍', color: '#EC4899' }
  ];

  const currentModeObj = modes.find(m => m.id === activeMode) || modes[0];

  // Calculate seasonal category expenses
  const seasonalSpent = state.transactions
    .filter(t => t.type === 'expense' && (t.description.toLowerCase().includes('ramadan') || t.description.toLowerCase().includes('eid') || t.description.toLowerCase().includes('courses')))
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetLimit = parseFloat(modeBudgetInput) || 2000;
  const remaining = Math.max(0, budgetLimit - seasonalSpent);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Screen Question Header & Mode Selector */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.95))' }}>
        <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 700, textTransform: 'uppercase' }}>
          {t.seasonalQuestionHeader}
        </span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.3rem 0 1.25rem 0' }}>
          {t.chooseActivePeriod}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {modes.map((m, idx) => (
            <button
              key={`${m.id}_${idx}`}
              type="button"
              onClick={() => setActiveMode(m.id)}
              style={{
                padding: '0.85rem',
                borderRadius: '12px',
                border: activeMode === m.id ? `2px solid ${m.color}` : '1px solid var(--border-color)',
                background: activeMode === m.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                color: activeMode === m.id ? m.color : 'var(--text-muted)',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span>{m.icon}</span> {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Mode Summary Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: currentModeObj.color }}>
              <span>{currentModeObj.icon}</span> {t.activeModeTitle} {currentModeObj.label}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.dedicatedBudgetSubtitle}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.budgetAllocatedLabel}</span>
            <input
              type="number"
              className="form-input"
              style={{ width: '110px', fontWeight: 800, textAlign: 'right' }}
              value={modeBudgetInput}
              onChange={e => setModeBudgetInput(e.target.value)}
            />
            <span style={{ fontWeight: 700 }}>DH</span>
          </div>
        </div>

        {/* 3 Metric Cards: Budget | Dépensé | Reste */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.seasonalBudgetLabel}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              <bdi>{formatCurrency(budgetLimit, currencyDisplay)}</bdi>
            </div>
          </div>

          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: '#EF4444' }}>{t.spentThisMonthLabel}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EF4444' }}>
              <bdi>{formatCurrency(seasonalSpent, currencyDisplay)}</bdi>
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: '#10B981' }}>{t.remainingAvailableLabel}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>
              <bdi>{formatCurrency(remaining, currencyDisplay)}</bdi>
            </div>
          </div>
        </div>

        {/* Essential Categories */}
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem' }}>{t.periodCategoriesLabel}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem' }}>
          {[
            { name: `🍲 ${t.catCourses}`, defaultAmt: '1 200 DH' },
            { name: `🎁 ${t.catGifts}`, defaultAmt: '400 DH' },
            { name: `🕌 ${t.catSadaqa}`, defaultAmt: '200 DH' },
            { name: `👨‍👩‍👧 ${t.catFamily}`, defaultAmt: '200 DH' }
          ].map((cat, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: '10px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{cat.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t.plannedLabel} {cat.defaultAmt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
