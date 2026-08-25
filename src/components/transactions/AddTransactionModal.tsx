import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useFinance } from '../../context/FinanceContext';
import { X, PlusCircle } from 'lucide-react';
import type { TransactionType } from '../../types/transaction';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-selects the transaction type tab when the modal opens. */
  defaultType?: 'expense' | 'income';
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, defaultType }) => {
  const { state, addTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>(defaultType ?? 'expense');

  // Sync the type whenever the modal opens with a different defaultType
  React.useEffect(() => {
    if (isOpen) setType(defaultType ?? 'expense');
  }, [isOpen, defaultType]);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [accountId, setAccountId] = useState<string>(state.accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState<string>(state.categories[0]?.id || '');
  const [merchant, setMerchant] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    addTransaction({
      accountId,
      categoryId: type === 'expense' ? categoryId : undefined,
      type,
      amount: numAmount,
      description: description || (type === 'income' ? 'Revenu' : 'Dépense'),
      transactionDate: date,
      merchant: merchant || undefined,
      source: 'manual'
    });

    // Reset & close
    setAmount('');
    setDescription('');
    setMerchant('');
    onClose();
  };

  const optionStyle = { background: '#0F172A', color: '#F8FAFC' };

  return ReactDOM.createPortal(
    <div
      className="modal-backdrop"
      onClick={onClose}
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
          maxWidth: '480px',
          width: '100%',
          background: '#0F172A',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={20} color="var(--color-primary)" /> Enregistrer une Transaction
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button
              type="button"
              className={`btn ${type === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, background: type === 'expense' ? '#EF4444' : undefined }}
              onClick={() => setType('expense')}
            >
              💸 Dépense
            </button>
            <button
              type="button"
              className={`btn ${type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, background: type === 'income' ? '#10B981' : undefined }}
              onClick={() => setType('income')}
            >
              💰 Revenu
            </button>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">Montant (en DH / MAD)</label>
            <input
              type="number"
              step="any"
              placeholder="ex: 250"
              required
              className="form-input"
              style={{ fontSize: '1.2rem', fontWeight: 700 }}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          {/* Account */}
          <div className="form-group">
            <label className="form-label">Compte impacté</label>
            <select className="form-select" style={{ background: '#0F172A', color: '#F8FAFC' }} value={accountId} onChange={e => setAccountId(e.target.value)}>
              {state.accounts.map(acc => (
                <option key={acc.id} value={acc.id} style={optionStyle}>
                  {acc.name} ({acc.balance} DH)
                </option>
              ))}
            </select>
          </div>

          {/* Category (if expense) */}
          {type === 'expense' && (
            <div className="form-group">
              <label className="form-label">Catégorie marocaine</label>
              <select className="form-select" style={{ background: '#0F172A', color: '#F8FAFC' }} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                {state.categories.map(cat => (
                  <option key={cat.id} value={cat.id} style={optionStyle}>
                    {cat.icon} {cat.name} ({cat.nameDarija || ''})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description / Libellé</label>
            <input
              type="text"
              placeholder="ex: Courses Marjane, Cafés entre amis..."
              required
              className="form-input"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Merchant */}
          <div className="form-group">
            <label className="form-label">Commerçant / Lieu (Optionnel)</label>
            <input
              type="text"
              placeholder="ex: Carrefour, Total, Orange..."
              className="form-input"
              value={merchant}
              onChange={e => setMerchant(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Enregistrer (DH)
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
