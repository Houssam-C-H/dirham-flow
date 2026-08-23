import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Calendar, Plus, CheckCircle2, X } from 'lucide-react';
import type { Bill } from '../../types/budget';

export const BillsManager: React.FC = () => {
  const { state, currencyDisplay, markBillPaid, saveAndSetState } = useFinance();

  // Simplified Add Bill Modal State
  const [isAddBillOpen, setIsAddBillOpen] = useState<boolean>(false);
  const [billName, setBillName] = useState<string>('');
  const [billAmount, setBillAmount] = useState<string>('');
  const [billDay, setBillDay] = useState<number>(1);

  const totalUpcomingBills = state.bills.filter(b => !b.isPaidThisMonth).reduce((sum, b) => sum + b.amount, 0);

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(billAmount);
    if (billName.trim() && !isNaN(amtNum) && amtNum > 0) {
      const newBill: Bill = {
        id: `bill_${Date.now()}`,
        name: billName.trim(),
        provider: 'Fournisseur',
        amount: amtNum,
        dueDate: billDay,
        categoryId: 'cat_rent',
        accountId: state.accounts[0]?.id || 'acc_bank',
        isPaidThisMonth: false,
        icon: '🏠'
      };

      saveAndSetState({
        ...state,
        bills: [...state.bills, newBill]
      });

      setIsAddBillOpen(false);
      setBillName('');
      setBillAmount('');
    }
  };

  const getDueStatusBadge = (dueDay: number, isPaid: boolean) => {
    if (isPaid) {
      return <span className="badge badge-success">✓ Payé</span>;
    }
    const today = new Date().getDate();
    const diff = dueDay - today;

    if (diff <= 0) {
      return <span className="badge badge-danger">🔴 Aujourd'hui</span>;
    } else if (diff <= 3) {
      return <span className="badge badge-warning">🟠 Dans {diff} jours</span>;
    } else {
      return <span className="badge badge-info">🟢 Dans {diff} jours</span>;
    }
  };

  const optionStyle = { background: '#0F172A', color: '#F8FAFC' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Total Card */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.95))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase' }}>
              Factures & Calendrier — Qu'est-ce que je dois payer et quand ?
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>
              Factures à venir: {formatCurrency(totalUpcomingBills, currencyDisplay)}
            </h2>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setIsAddBillOpen(true)} style={{ fontWeight: 700 }}>
            <Plus size={16} /> Ajouter une facture
          </button>
        </div>
      </div>

      {/* Bill List Timeline */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} color="#F59E0B" /> Planning des Échéances
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {state.bills.map(bill => (
            <div
              key={bill.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.1rem',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                {getDueStatusBadge(bill.dueDate, bill.isPaidThisMonth)}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{bill.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Échéance: {bill.dueDate} du mois</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: bill.isPaidThisMonth ? 'var(--text-muted)' : '#EF4444' }}>
                  {formatCurrency(bill.amount, currencyDisplay)}
                </span>

                {!bill.isPaidThisMonth ? (
                  <button className="btn btn-secondary btn-sm" onClick={() => markBillPaid(bill.id)}>
                    <CheckCircle2 size={14} color="#10B981" /> Marquer payé
                  </button>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600 }}>
                    ✓ Payé
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simplified Add Bill Modal - Rendered via React Portal directly on document.body */}
      {isAddBillOpen && ReactDOM.createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setIsAddBillOpen(false)}
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Ajouter une facture</h3>
              <button onClick={() => setIsAddBillOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBill}>
              <div className="form-group">
                <label className="form-label">Nom de la facture</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Loyer, Internet, Électricité..."
                  className="form-input"
                  value={billName}
                  onChange={e => setBillName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Montant (DH)</label>
                <input
                  type="number"
                  required
                  placeholder="2 500 DH"
                  className="form-input"
                  style={{ fontWeight: 800, fontSize: '1.2rem' }}
                  value={billAmount}
                  onChange={e => setBillAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date du paiement</label>
                <select
                  className="form-select"
                  style={{ background: '#0F172A', color: '#F8FAFC' }}
                  value={billDay}
                  onChange={e => setBillDay(parseInt(e.target.value))}
                >
                  {[1, 5, 10, 15, 20, 25, 28, 30].map(day => (
                    <option key={day} value={day} style={optionStyle}>Le {day} de chaque mois</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddBillOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>
                  [ Ajouter la facture ]
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
