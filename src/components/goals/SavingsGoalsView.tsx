import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Plus, PiggyBank, Edit2, Trash2, X } from 'lucide-react';
import type { SavingsGoal } from '../../types/finance';

export const SavingsGoalsView: React.FC = () => {
  const { state, currencyDisplay, addSavingsDeposit, updateSavingsGoal, deleteSavingsGoal, saveAndSetState } = useFinance();

  // Quick Deposit Modal state
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [selectedAccId, setSelectedAccId] = useState<string>(state.accounts[0]?.id || '');

  // Add Goal Modal state
  const [isAddGoalOpen, setIsAddGoalOpen] = useState<boolean>(false);
  const [goalName, setGoalName] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [alreadySaved, setAlreadySaved] = useState<string>('0');
  const [targetDate, setTargetDate] = useState<string>('2027-12-31');

  // Edit Goal Modal state
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editTarget, setEditTarget] = useState<string>('');
  const [editCurrent, setEditCurrent] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');

  const isRtl = state.preferences.language === 'ar_darija';

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (selectedGoalId && !isNaN(amt) && amt > 0) {
      addSavingsDeposit(selectedGoalId, amt, selectedAccId);
      setSelectedGoalId(null);
      setDepositAmount('');
    }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetAmount);
    const savedNum = parseFloat(alreadySaved) || 0;

    if (goalName.trim() && !isNaN(targetNum) && targetNum > 0) {
      const newGoal: SavingsGoal = {
        id: `goal_${Date.now()}`,
        title: goalName.trim(),
        targetAmount: targetNum,
        currentAmount: savedNum,
        targetDate: targetDate,
        categoryIcon: '🎯',
        color: '#3B82F6',
        isCompleted: savedNum >= targetNum
      };

      saveAndSetState({
        ...state,
        goals: [...state.goals, newGoal]
      });

      setIsAddGoalOpen(false);
      setGoalName('');
      setTargetAmount('');
      setAlreadySaved('0');
    }
  };

  const startEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditTarget(goal.targetAmount.toString());
    setEditCurrent(goal.currentAmount.toString());
    setEditDate(goal.targetDate || '2027-12-31');
  };

  const handleSaveEditGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    const targetNum = parseFloat(editTarget);
    const currentNum = parseFloat(editCurrent) || 0;

    if (editTitle.trim() && !isNaN(targetNum) && targetNum > 0) {
      updateSavingsGoal(editingGoal.id, {
        title: editTitle.trim(),
        targetAmount: targetNum,
        currentAmount: currentNum,
        targetDate: editDate
      });
      setEditingGoal(null);
    }
  };

  const handleDeleteGoal = (goalId: string, title: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer l'objectif "${title}" ?`)) {
      deleteSavingsGoal(goalId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Primary Action */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(15, 23, 42, 0.95))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#3B82F6', fontWeight: 700, textTransform: 'uppercase' }}>
              {isRtl ? 'أهداف التوفير — علاش كنوفّر؟' : 'Objectifs d\'Épargne — Pourquoi j’épargne ?'}
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>
              🎯 {isRtl ? 'أهدافي' : 'Mes objectifs'}
            </h2>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setIsAddGoalOpen(true)} style={{ fontWeight: 700 }}>
            <Plus size={16} /> {isRtl ? '+ هدف جديد' : '+ Nouvel objectif'}
          </button>
        </div>
      </div>

      {/* Visual Goals Grid or Encouraging Empty State */}
      {state.goals.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)' }}>
          <div style={{ fontSize: '3.2rem', marginBottom: '0.75rem' }}>🎯</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            {isRtl ? 'ما عندك حتى هدف توفير حالياً' : 'Aucun objectif d\'épargne pour l\'instant'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
            {isRtl
              ? 'اضغط على "+ هدف جديد" باش تبدا التوفير لمشروعك (سيارة، صندوق طوارئ، سفر، شقة...)'
              : 'Vous commencez à zéro ! Cliquez sur "+ Nouvel objectif" pour définir vos propres projets d\'épargne (Voiture, Urgence, Caution, Voyage...).'}
          </p>
          <button className="btn btn-primary" onClick={() => setIsAddGoalOpen(true)} style={{ fontWeight: 800, padding: '0.85rem 1.5rem', fontSize: '1rem' }}>
            <Plus size={18} /> {isRtl ? '+ هدف جديد' : '+ Nouvel objectif'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {state.goals.map(goal => {
            const ratio = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

            return (
              <div key={goal.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{goal.categoryIcon || '🎯'}</span> {goal.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-info">{ratio}%</span>
                      <button
                        onClick={() => startEditGoal(goal)}
                        title="Modifier cet objectif"
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id, goal.title)}
                        title="Supprimer cet objectif"
                        style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3B82F6', marginBottom: '0.2rem' }}>
                    <bdi>{formatCurrency(goal.currentAmount, currencyDisplay)}</bdi> <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ <bdi>{formatCurrency(goal.targetAmount, currencyDisplay)}</bdi></span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden', margin: '0.85rem 0' }}>
                    <div style={{ width: `${ratio}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6, #10B981)', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center', fontWeight: 600 }}
                  onClick={() => {
                    setSelectedGoalId(goal.id);
                    setDepositAmount('500');
                  }}
                >
                  <PiggyBank size={15} /> + Verser une épargne
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Deposit Modal - Rendered via React Portal */}
      {selectedGoalId && ReactDOM.createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setSelectedGoalId(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem'
          }}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '400px',
              width: '100%',
              background: '#0F172A',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>💰 Verser une épargne</h3>
              <button onClick={() => setSelectedGoalId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit}>
              <div className="form-group">
                <label className="form-label">Montant du virement (DH)</label>
                <input
                  type="number"
                  required
                  placeholder="500 DH"
                  className="form-input"
                  style={{ fontWeight: 800, fontSize: '1.2rem' }}
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prélever depuis le compte :</label>
                <select className="form-select" style={{ background: '#0F172A', color: '#F8FAFC' }} value={selectedAccId} onChange={e => setSelectedAccId(e.target.value)}>
                  {state.accounts.map(acc => (
                    <option key={acc.id} value={acc.id} style={{ background: '#0F172A', color: '#F8FAFC' }}>{acc.name} ({formatCurrency(acc.balance, currencyDisplay)})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedGoalId(null)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>
                  [ Confirmer le versement ]
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Add Goal Modal - Rendered via React Portal */}
      {isAddGoalOpen && ReactDOM.createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setIsAddGoalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem'
          }}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '420px',
              width: '100%',
              background: '#0F172A',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>+ Nouvel objectif</h3>
              <button onClick={() => setIsAddGoalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal}>
              <div className="form-group">
                <label className="form-label">Nom de l'objectif</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Voiture, PC, Urgence..."
                  className="form-input"
                  value={goalName}
                  onChange={e => setGoalName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Montant Cible (DH)</label>
                <input
                  type="number"
                  required
                  placeholder="30 000 DH"
                  className="form-input"
                  style={{ fontWeight: 800, fontSize: '1.1rem' }}
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Déjà économisé (DH)</label>
                <input
                  type="number"
                  placeholder="8 500 DH"
                  className="form-input"
                  style={{ fontWeight: 800, fontSize: '1.1rem' }}
                  value={alreadySaved}
                  onChange={e => setAlreadySaved(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date souhaitée</label>
                <input
                  type="date"
                  className="form-input"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddGoalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>
                  [ Créer l'objectif ]
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Goal Modal - Rendered via React Portal */}
      {editingGoal && ReactDOM.createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setEditingGoal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem'
          }}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '420px',
              width: '100%',
              background: '#0F172A',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>✏️ Modifier l'objectif</h3>
              <button onClick={() => setEditingGoal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditGoal}>
              <div className="form-group">
                <label className="form-label">Titre de l'objectif</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Montant Cible (DH)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  style={{ fontWeight: 800, fontSize: '1.1rem' }}
                  value={editTarget}
                  onChange={e => setEditTarget(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Épargne Actuelle (DH)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  style={{ fontWeight: 800, fontSize: '1.1rem' }}
                  value={editCurrent}
                  onChange={e => setEditCurrent(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date d'échéance</label>
                <input
                  type="date"
                  className="form-input"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingGoal(null)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>
                  [ Enregistrer ]
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
