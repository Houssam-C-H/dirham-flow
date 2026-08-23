import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useFinance } from '../../context/FinanceContext';
import { X, ArrowRightLeft } from 'lucide-react';

interface AccountTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountTransferModal: React.FC<AccountTransferModalProps> = ({ isOpen, onClose }) => {
  const { state, executeLinkedTransfer } = useFinance();

  const [fromAccountId, setFromAccountId] = useState<string>(
    state.accounts.find(a => a.type === 'bank')?.id || state.accounts[0]?.id || ''
  );
  const [toAccountId, setToAccountId] = useState<string>(
    state.accounts.find(a => a.type === 'cash')?.id || state.accounts[1]?.id || ''
  );
  const [amount, setAmount] = useState<string>('500');
  const [description, setDescription] = useState<string>('Retrait GAB Espèces');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || fromAccountId === toAccountId) return;

    executeLinkedTransfer(fromAccountId, toAccountId, numAmount, description);
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
            <ArrowRightLeft size={20} color="var(--color-primary)" /> Transfert Inter-Comptes (ex: Banque → Espèces)
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '12px',
          padding: '0.85rem',
          fontSize: '0.85rem',
          color: '#10B981',
          marginBottom: '1.25rem'
        }}>
          💡 <strong>Transfert lié:</strong> Retirer de l'argent de votre banque vers votre portefeuille cash (ex: 500 DH) met à jour vos soldes sans créer de fausse dépense!
        </div>

        <form onSubmit={handleSubmit}>
          {/* From Account */}
          <div className="form-group">
            <label className="form-label">Compte Source (Source)</label>
            <select className="form-select" style={{ background: '#0F172A', color: '#F8FAFC' }} value={fromAccountId} onChange={e => setFromAccountId(e.target.value)}>
              {state.accounts.map(acc => (
                <option key={acc.id} value={acc.id} style={optionStyle}>
                  {acc.name} (Solde: {acc.balance} DH)
                </option>
              ))}
            </select>
          </div>

          {/* To Account */}
          <div className="form-group">
            <label className="form-label">Compte Destination (Cible)</label>
            <select className="form-select" style={{ background: '#0F172A', color: '#F8FAFC' }} value={toAccountId} onChange={e => setToAccountId(e.target.value)}>
              {state.accounts.map(acc => (
                <option key={acc.id} value={acc.id} style={optionStyle}>
                  {acc.name} (Solde: {acc.balance} DH)
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">Montant à transférer (DH)</label>
            <input
              type="number"
              placeholder="ex: 500"
              required
              className="form-input"
              style={{ fontSize: '1.2rem', fontWeight: 700 }}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Note / Motif</label>
            <input
              type="text"
              placeholder="ex: Retrait GAB Attijari, Alimentation Compte Épargne"
              className="form-input"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Effectuer le Transfert (DH)
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
