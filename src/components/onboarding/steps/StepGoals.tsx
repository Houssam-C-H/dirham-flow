import React, { useState } from 'react';
import type { SavingsGoal } from '../../../types/finance';
import { Plus, Trash2 } from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { TRANSLATIONS } from '../../../utils/i18n';

interface StepGoalsProps {
  goals: SavingsGoal[];
  setGoals: (goals: SavingsGoal[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepGoals: React.FC<StepGoalsProps> = ({ goals, setGoals, onNext, onBack }) => {
  const { language } = useFinance();
  const t = TRANSLATIONS[language] || TRANSLATIONS.fr;

  const [title, setTitle] = useState<string>('Fonds d\'Urgence (3 Mois)');
  const [icon, setIcon] = useState<string>('🎯');
  const [targetAmt, setTargetAmt] = useState<string>('15000');
  const [currentAmt, setCurrentAmt] = useState<string>('4000');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmt);
    const current = parseFloat(currentAmt) || 0;
    if (isNaN(target) || target <= 0) return;

    const newGoal: SavingsGoal = {
      id: `goal_onb_${Date.now()}`,
      title: title || 'Objectif d\'Épargne',
      targetAmount: target,
      currentAmount: current,
      categoryIcon: icon,
      color: '#10B981',
      isCompleted: current >= target
    };

    setGoals([...goals, newGoal]);
    setTitle('Achat Prochain');
    setTargetAmt('5000');
    setCurrentAmt('0');
  };

  const handleRemove = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.2rem' }}>
        {t.step5Title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        {t.step5Subtitle}
      </p>

      {/* Form */}
      <form onSubmit={handleAddGoal} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t.goalTitleLabel}</label>
            <input
              type="text"
              required
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Icône</label>
            <select className="form-select" value={icon} onChange={e => setIcon(e.target.value)}>
              <option value="🎯">🎯 Fonds d'Urgence</option>
              <option value="🚗">🚗 Achat Voiture</option>
              <option value="🏠">🏠 Caution Loyer</option>
              <option value="✈️">✈️ Voyage / Omra</option>
              <option value="💍">💍 Mariage (العرس)</option>
              <option value="💻">💻 Ordinateur / High-tech</option>
              <option value="🎓">🎓 Éducation / Études</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t.goalTargetLabel}</label>
            <input
              type="number"
              required
              className="form-input"
              style={{ fontWeight: 700 }}
              value={targetAmt}
              onChange={e => setTargetAmt(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t.goalSavedLabel}</label>
            <input
              type="number"
              className="form-input"
              style={{ fontWeight: 700, color: '#10B981' }}
              value={currentAmt}
              onChange={e => setCurrentAmt(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
          <Plus size={16} /> {t.btnAddGoal}
        </button>
      </form>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
        {goals.map(g => (
          <div
            key={g.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{g.categoryIcon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{g.title}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {g.currentAmount} DH sur {g.targetAmount} DH ({Math.round((g.currentAmount / g.targetAmount) * 100)}%)
                </span>
              </div>
            </div>

            <button type="button" onClick={() => handleRemove(g.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
              <Trash2 size={16} />
            </button>
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
