import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Landmark, Banknote, PiggyBank, CreditCard, Plus, ArrowRightLeft, Upload, X, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import type { Account, AccountType } from '../../types/finance';

interface AccountsGridProps {
  onOpenTransferModal: () => void;
  onOpenImportModal: () => void;
}

export const AccountsGrid: React.FC<AccountsGridProps> = ({
  onOpenTransferModal,
  onOpenImportModal
}) => {
  const { state, currencyDisplay, saveAndSetState, updateAccount, deleteAccount, language } = useFinance();
  const [selectedAcc, setSelectedAcc] = useState<Account | null>(null);

  // Add Account Modal State
  const [isAddAccOpen, setIsAddAccOpen] = useState<boolean>(false);
  const [accType, setAccType] = useState<AccountType>('bank');
  const [accName, setAccName] = useState<string>('');
  const [accBalance, setAccBalance] = useState<string>('');
  const [accBankName, setAccBankName] = useState<string>('');

  // Edit Account Modal State
  const [editingAcc, setEditingAcc] = useState<Account | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editType, setEditType] = useState<AccountType>('bank');
  const [editBalance, setEditBalance] = useState<string>('');
  const [editBankName, setEditBankName] = useState<string>('');

  // Delete Confirmation State
  const [deletingAccId, setDeletingAccId] = useState<string | null>(null);

  const totalAssets = state.accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const balNum = parseFloat(accBalance) || 0;
    if (accName.trim()) {
      const newAcc: Account = {
        id: `acc_${Date.now()}`,
        name: accName.trim(),
        type: accType,
        balance: balNum,
        openingBalance: balNum,
        openingBalanceDate: new Date().toISOString().split('T')[0],
        bankName: accBankName.trim() || (accType === 'bank' ? 'CIH Bank' : undefined),
        color: accType === 'bank' ? '#10B981' : accType === 'cash' ? '#F59E0B' : accType === 'savings' ? '#3B82F6' : '#EF4444',
        icon: accType === 'bank' ? 'Landmark' : accType === 'cash' ? 'Banknote' : accType === 'savings' ? 'PiggyBank' : 'CreditCard'
      };

      saveAndSetState({
        ...state,
        accounts: [...state.accounts, newAcc]
      });

      setIsAddAccOpen(false);
      setAccName('');
      setAccBalance('');
      setAccBankName('');
    }
  };

  const handleOpenEdit = (acc: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAcc(acc);
    setEditName(acc.name);
    setEditType(acc.type);
    setEditBalance(String(acc.balance));
    setEditBankName(acc.bankName || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAcc || !editName.trim()) return;

    const balNum = parseFloat(editBalance) || 0;
    updateAccount(editingAcc.id, {
      name: editName.trim(),
      type: editType,
      balance: balNum,
      bankName: editBankName.trim() || undefined,
      color: editType === 'bank' ? '#10B981' : editType === 'cash' ? '#F59E0B' : editType === 'savings' ? '#3B82F6' : '#EF4444',
      icon: editType === 'bank' ? 'Landmark' : editType === 'cash' ? 'Banknote' : editType === 'savings' ? 'PiggyBank' : 'CreditCard'
    });

    setEditingAcc(null);
  };

  const handleDeleteConfirm = (accId: string) => {
    deleteAccount(accId);
    if (selectedAcc?.id === accId) {
      setSelectedAcc(null);
    }
    setDeletingAccId(null);
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'bank': return <Landmark size={24} color="#10B981" />;
      case 'cash': return <Banknote size={24} color="#F59E0B" />;
      case 'savings': return <PiggyBank size={24} color="#3B82F6" />;
      case 'credit': return <CreditCard size={24} color="#EF4444" />;
      default: return <Landmark size={24} color="#10B981" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Total Card */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.95))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 700, textTransform: 'uppercase' }}>
              {language === 'ar_darija' ? 'الحسابات والنقدية — أين أموالي؟' : 'Comptes & Espèces — Où est mon argent ?'}
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
              Total: {formatCurrency(totalAssets, currencyDisplay)}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setIsAddAccOpen(true)} style={{ fontWeight: 700 }}>
              <Plus size={16} /> {language === 'ar_darija' ? 'إضافة حساب' : 'Ajouter un compte'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onOpenTransferModal}>
              <ArrowRightLeft size={16} /> Transfert Banque ➔ Cash
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onOpenImportModal}>
              <Upload size={16} /> Relevé CSV
            </button>
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {state.accounts.map(acc => {
          const isSelected = selectedAcc?.id === acc.id;
          const accTxs = state.transactions.filter(t => t.accountId === acc.id);

          return (
            <div
              key={acc.id}
              className="glass-card"
              onClick={() => setSelectedAcc(isSelected ? null : acc)}
              style={{
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ padding: '0.65rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}>
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {acc.bankName || (acc.type === 'bank' ? 'Compte Bancaire' : acc.type === 'cash' ? 'Flesse ف الجيب (Cash)' : acc.type === 'savings' ? 'Épargne' : 'Crédit')}
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    type="button"
                    title="Modifier le compte"
                    onClick={(e) => handleOpenEdit(acc, e)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      padding: '6px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    title="Supprimer le compte"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingAccId(acc.id);
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#EF4444',
                      padding: '6px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', textAlign: 'right', marginTop: '0.5rem' }}>
                {formatCurrency(acc.balance, currencyDisplay)}
              </div>

              {isSelected && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                    Dernières opérations ({accTxs.length})
                  </div>
                  {accTxs.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aucune transaction enregistrée</div>
                  ) : (
                    accTxs.slice(0, 3).map(tx => (
                      <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.25rem 0' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{tx.description}</span>
                        <span style={{ fontWeight: 600, color: tx.type === 'income' ? '#10B981' : '#EF4444' }}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currencyDisplay)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Account Modal */}
      {isAddAccOpen && ReactDOM.createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setIsAddAccOpen(false)}
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Ajouter un compte</h3>
              <button onClick={() => setIsAddAccOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAccount}>
              <div className="form-group">
                <label className="form-label">Quel type ?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { type: 'bank' as const, label: '🏦 Banque' },
                    { type: 'cash' as const, label: '💵 Espèces' },
                    { type: 'credit' as const, label: '💳 Crédit' },
                    { type: 'savings' as const, label: '💰 Épargne' }
                  ].map(item => (
                    <button
                      key={item.type}
                      type="button"
                      style={{
                        padding: '0.65rem',
                        borderRadius: '10px',
                        border: accType === item.type ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                        background: accType === item.type ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.03)',
                        color: accType === item.type ? 'var(--color-primary)' : 'var(--text-muted)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                      onClick={() => setAccType(item.type)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nom du compte</label>
                <input
                  type="text"
                  required
                  placeholder="ex: CIH Principal, Cash Wallet..."
                  className="form-input"
                  value={accName}
                  onChange={e => setAccName(e.target.value)}
                />
              </div>

              {accType === 'bank' && (
                <div className="form-group">
                  <label className="form-label">Nom de la Banque (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="ex: CIH, Attijariwafa, Bank of Africa..."
                    className="form-input"
                    value={accBankName}
                    onChange={e => setAccBankName(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Combien avez-vous actuellement sur ce compte ?</label>
                <input
                  type="number"
                  required
                  placeholder="12 000 DH"
                  className="form-input"
                  style={{ fontWeight: 800, fontSize: '1.2rem' }}
                  value={accBalance}
                  onChange={e => setAccBalance(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddAccOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Account Modal */}
      {editingAcc && ReactDOM.createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setEditingAcc(null)}
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Modifier le compte</h3>
              <button onClick={() => setEditingAcc(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label">Type de compte</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { type: 'bank' as const, label: '🏦 Banque' },
                    { type: 'cash' as const, label: '💵 Espèces' },
                    { type: 'credit' as const, label: '💳 Crédit' },
                    { type: 'savings' as const, label: '💰 Épargne' }
                  ].map(item => (
                    <button
                      key={item.type}
                      type="button"
                      style={{
                        padding: '0.65rem',
                        borderRadius: '10px',
                        border: editType === item.type ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                        background: editType === item.type ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.03)',
                        color: editType === item.type ? 'var(--color-primary)' : 'var(--text-muted)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                      onClick={() => setEditType(item.type)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nom du compte</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </div>

              {editType === 'bank' && (
                <div className="form-group">
                  <label className="form-label">Nom de la Banque</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editBankName}
                    onChange={e => setEditBankName(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Solde Actuel (DH)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  style={{ fontWeight: 800, fontSize: '1.2rem' }}
                  value={editBalance}
                  onChange={e => setEditBalance(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingAcc(null)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>
                  <CheckCircle2 size={16} /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deletingAccId && ReactDOM.createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setDeletingAccId(null)}
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
              maxWidth: '380px',
              width: '100%',
              background: '#0F172A',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '20px',
              padding: '1.75rem',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: '#EF4444'
            }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Supprimer ce compte ?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Cette action est irréversible. Voulez-vous vraiment supprimer ce compte de votre portefeuille ?
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeletingAccId(null)}>
                Annuler
              </button>
              <button
                type="button"
                className="btn"
                style={{ flex: 1, background: '#EF4444', color: '#FFF', fontWeight: 700 }}
                onClick={() => handleDeleteConfirm(deletingAccId)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
