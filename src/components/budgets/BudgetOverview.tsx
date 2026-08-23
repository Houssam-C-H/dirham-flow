import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { AlertTriangle, CheckCircle2, XCircle, Edit2, Check, Plus, X, Trash2, Edit3 } from 'lucide-react';
import type { CategoryGroup, Category } from '../../types/budget';

export const BudgetOverview: React.FC = () => {
  const { state, currencyDisplay, updateBudgetLimit, addCustomCategory, updateCategory, deleteCategory } = useFinance();

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<string>('');

  // Add Custom Category Modal State
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatDarija, setNewCatDarija] = useState<string>('');
  const [newCatIcon, setNewCatIcon] = useState<string>('🏷️');
  const [newCatGroup, setNewCatGroup] = useState<CategoryGroup>('daily');
  const [newCatLimit, setNewCatLimit] = useState<string>('500');

  // Full Category Edit Modal State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editDarija, setEditDarija] = useState<string>('');
  const [editIcon, setEditIcon] = useState<string>('');
  const [editGroup, setEditGroup] = useState<CategoryGroup>('daily');
  const [editLimit, setEditLimit] = useState<string>('500');

  // Delete Category Modal State
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Calculate actual spent per category this month
  const categorySpentMap = state.transactions
    .filter(t => t.type === 'expense' && t.categoryId)
    .reduce((acc, t) => {
      acc[t.categoryId!] = (acc[t.categoryId!] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const totalSpent = Object.values(categorySpentMap).reduce((sum, v) => sum + v, 0);
  const totalBudgetLimit = state.budgets.reduce((sum, b) => sum + b.limit, 0);

  const startQuickLimitEdit = (catId: string, currentLimit: number) => {
    setEditingCatId(catId);
    setEditLimitValue(currentLimit.toString());
  };

  const saveQuickLimitEdit = (catId: string) => {
    const num = parseFloat(editLimitValue);
    if (!isNaN(num) && num >= 0) {
      updateBudgetLimit(catId, num);
    }
    setEditingCatId(null);
  };

  const openFullEditModal = (cat: Category, currentLimit: number) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditDarija(cat.nameDarija || '');
    setEditIcon(cat.icon);
    setEditGroup(cat.group);
    setEditLimit(currentLimit.toString());
  };

  const handleSaveFullEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    const numLimit = parseFloat(editLimit);
    updateCategory(editingCategory.id, {
      name: editName.trim(),
      nameDarija: editDarija.trim() || undefined,
      icon: editIcon.trim() || '🏷️',
      group: editGroup
    });

    if (!isNaN(numLimit) && numLimit >= 0) {
      updateBudgetLimit(editingCategory.id, numLimit);
    }

    setEditingCategory(null);
  };

  const handleDeleteCategoryConfirm = () => {
    if (deletingCategory) {
      deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  const openAddCategoryForGroup = (groupKey: CategoryGroup) => {
    setNewCatGroup(groupKey);
    setIsAddCatModalOpen(true);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(newCatLimit);
    if (newCatName.trim() && !isNaN(limitNum) && limitNum >= 0) {
      addCustomCategory(newCatName, newCatIcon, newCatGroup, limitNum, newCatDarija);
      setIsAddCatModalOpen(false);
      setNewCatName('');
      setNewCatDarija('');
      setNewCatLimit('500');
    }
  };

  const groups: { key: CategoryGroup; label: string; icon: string }[] = [
    { key: 'daily', label: 'Dépenses Quotidiennes', icon: '🍞' },
    { key: 'household', label: 'Charges du Foyer & Maison', icon: '🏠' },
    { key: 'moroccan', label: 'Spécifique Maroc (Aide Familiale, Sadaqa, Mariage...)', icon: '🇲🇦' }
  ];

  const optionStyle = { background: '#0F172A', color: '#F8FAFC' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Overview Card with Custom Category Action */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Salaire & Budget — Combien puis-je dépenser ?
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.2rem 0' }}>
              Total Dépensé: {formatCurrency(totalSpent, currencyDisplay)}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Plafond global alloué: <strong>{formatCurrency(totalBudgetLimit, currencyDisplay)}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => openAddCategoryForGroup('daily')}
              style={{ fontWeight: 700, padding: '0.65rem 1rem' }}
            >
              <Plus size={16} /> Ajouter une catégorie personnalisée
            </button>

            <div style={{
              background: 'rgba(255,255,255,0.04)',
              padding: '0.75rem 1.25rem',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              textAlign: 'right'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reste du Budget</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: totalBudgetLimit - totalSpent >= 0 ? '#10B981' : '#EF4444' }}>
                <bdi>{formatCurrency(totalBudgetLimit - totalSpent, currencyDisplay)}</bdi>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Groups Breakdown */}
      {groups.map(group => {
        const groupCategories = state.categories.filter(c => c.group === group.key);

        return (
          <div key={group.key} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <span>{group.icon}</span> {group.label}
              </h3>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => openAddCategoryForGroup(group.key)}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                <Plus size={14} /> Ajouter une catégorie
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {groupCategories.map(cat => {
                const budgetObj = state.budgets.find(b => b.categoryId === cat.id);
                const limit = budgetObj ? budgetObj.limit : cat.defaultLimit;
                const spent = categorySpentMap[cat.id] || 0;
                const ratio = limit > 0 ? (spent / limit) * 100 : 0;

                let statusColor = '#10B981';
                let statusBadge = (
                  <span className="badge badge-success" style={{ gap: '4px' }}>
                    <CheckCircle2 size={12} /> Dans le budget
                  </span>
                );

                if (ratio >= 100) {
                  statusColor = '#EF4444';
                  statusBadge = (
                    <span className="badge badge-danger" style={{ gap: '4px' }}>
                      <XCircle size={12} /> 🔴 Budget dépassé ({Math.round(ratio)}%)
                    </span>
                  );
                } else if (ratio >= 80) {
                  statusColor = '#F59E0B';
                  statusBadge = (
                    <span className="badge badge-warning" style={{ gap: '4px' }}>
                      <AlertTriangle size={12} /> ⚠️ 80% du budget utilisé
                    </span>
                  );
                }

                return (
                  <div
                    key={cat.id}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '1.3rem' }}>{cat.icon}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{cat.name}</span>
                            {cat.nameDarija && (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'Tajawal' }}>
                                ({cat.nameDarija})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {statusBadge}

                        {/* Spent / Limit */}
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, fontSize: '1rem', color: statusColor }}>
                            <bdi>{formatCurrency(spent, currencyDisplay)}</bdi>
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {' / '}
                            {editingCatId === cat.id ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                  type="number"
                                  className="form-input"
                                  style={{ width: '90px', padding: '2px 6px', fontSize: '0.85rem', fontWeight: 700 }}
                                  value={editLimitValue}
                                  onChange={e => setEditLimitValue(e.target.value)}
                                />
                                <button className="btn btn-primary btn-sm" style={{ padding: '2px 6px' }} onClick={() => saveQuickLimitEdit(cat.id)}>
                                  <Check size={12} />
                                </button>
                              </span>
                            ) : (
                              <span
                                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                                onClick={() => startQuickLimitEdit(cat.id, limit)}
                                title="Cliquer pour modifier la limite"
                              >
                                <bdi>{formatCurrency(limit, currencyDisplay)}</bdi> <Edit2 size={11} style={{ opacity: 0.7 }} />
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Action Buttons: Full Edit & Delete */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => openFullEditModal(cat, limit)}
                            title="Modifier le nom, l'icône et le budget"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#EF4444' }}
                            onClick={() => setDeletingCategory(cat)}
                            title="Supprimer la catégorie"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(100, ratio)}%`,
                        height: '100%',
                        background: statusColor,
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Full Edit Category Modal Popup */}
      {editingCategory && ReactDOM.createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setEditingCategory(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.8)',
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
              maxWidth: '460px',
              width: '100%',
              background: '#0F172A',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>✏️ Modifier la Catégorie</h3>
              <button onClick={() => setEditingCategory(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFullEdit}>
              <div className="form-group">
                <label className="form-label">Nom de la catégorie (FR)</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nom en Darija (Optionnel)</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'Tajawal' }}
                  value={editDarija}
                  onChange={e => setEditDarija(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emoji / Icône</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editIcon}
                  onChange={e => setEditIcon(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Groupe</label>
                <select className="form-select" value={editGroup} onChange={e => setEditGroup(e.target.value as CategoryGroup)} style={{ background: '#0F172A', color: '#F8FAFC' }}>
                  <option value="daily" style={optionStyle}>🍞 Dépenses Quotidiennes</option>
                  <option value="household" style={optionStyle}>🏠 Charges du Foyer & Maison</option>
                  <option value="moroccan" style={optionStyle}>🇲🇦 Spécifique Maroc</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Limite Mensuelle Allouée (DH)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  style={{ fontWeight: 800, fontSize: '1.2rem' }}
                  value={editLimit}
                  onChange={e => setEditLimit(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingCategory(null)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Category Confirmation Modal Popup */}
      {deletingCategory && ReactDOM.createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setDeletingCategory(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
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
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: '#EF4444'
            }}>
              <Trash2 size={28} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EF4444', marginBottom: '0.5rem' }}>
              Supprimer la Catégorie ?
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Êtes-vous sûr de vouloir supprimer la catégorie <strong>{deletingCategory.icon} {deletingCategory.name}</strong> ?
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeletingCategory(null)}>
                Annuler
              </button>
              <button
                type="button"
                className="btn"
                style={{ flex: 1, background: '#EF4444', color: '#FFF', fontWeight: 700 }}
                onClick={handleDeleteCategoryConfirm}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Custom Category Modal Popup */}
      {isAddCatModalOpen && ReactDOM.createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setIsAddCatModalOpen(false)}
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
              maxWidth: '460px',
              width: '100%',
              background: '#0F172A',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>➕ Ajouter une catégorie personnalisée</h3>
              <button onClick={() => setIsAddCatModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label className="form-label">Nom de la catégorie / dépense</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Abonnement Salle de Sport, Assurance..."
                  className="form-input"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nom en Darija (Optionnel)</label>
                <input
                  type="text"
                  placeholder="ex: لاصال د السبور"
                  className="form-input"
                  style={{ fontFamily: 'Tajawal' }}
                  value={newCatDarija}
                  onChange={e => setNewCatDarija(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Icône / Emoji</label>
                <select className="form-select" value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} style={{ background: '#0F172A', color: '#F8FAFC' }}>
                  <option value="🏋️‍♂️" style={optionStyle}>🏋️‍♂️ Sport / Salle de sport</option>
                  <option value="🎬" style={optionStyle}>🎬 Streaming / Netflix / Spotify</option>
                  <option value="🛡️" style={optionStyle}>🛡️ Assurance / Mutuelle</option>
                  <option value="📚" style={optionStyle}>📚 Livres & Formation</option>
                  <option value="🐾" style={optionStyle}>🐾 Animaux / Vétérinaire</option>
                  <option value="🧹" style={optionStyle}>🧹 Menage / Femme de ménage</option>
                  <option value="☕" style={optionStyle}>☕ Cafés & Pauses</option>
                  <option value="🍔" style={optionStyle}>🍔 Restaurants & Fast-food</option>
                  <option value="🏷️" style={optionStyle}>🏷️ Autre catégorie sur mesure</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Groupe de dépense</label>
                <select className="form-select" value={newCatGroup} onChange={e => setNewCatGroup(e.target.value as CategoryGroup)} style={{ background: '#0F172A', color: '#F8FAFC' }}>
                  <option value="daily" style={optionStyle}>🍞 Dépenses Quotidiennes</option>
                  <option value="household" style={optionStyle}>🏠 Charges du Foyer & Maison</option>
                  <option value="moroccan" style={optionStyle}>🇲🇦 Spécifique Maroc</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Limite Mensuelle Allouée (DH)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  style={{ fontWeight: 800, fontSize: '1.2rem' }}
                  value={newCatLimit}
                  onChange={e => setNewCatLimit(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddCatModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>
                  [ Ajouter la catégorie ]
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
