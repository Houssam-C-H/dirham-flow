import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { formatDateFrench } from '../../utils/dates';
import { Repeat, Plus, Search } from 'lucide-react';

interface TransactionListProps {
  onOpenAddModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ onOpenAddModal }) => {
  const { state, currencyDisplay } = useFinance();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getAccountName = (accId: string) => {
    const acc = state.accounts.find(a => a.id === accId);
    return acc ? acc.name : accId;
  };

  const getCategory = (catId?: string) => {
    if (!catId) return { name: 'Général', icon: '📦' };
    const cat = state.categories.find(c => c.id === catId);
    return cat ? { name: cat.name, icon: cat.icon } : { name: 'Autre', icon: '📦' };
  };

  const filtered = state.transactions.filter(tx => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(term);
      const matchMerchant = tx.merchant?.toLowerCase().includes(term);
      if (!matchDesc && !matchMerchant) return false;
    }
    return true;
  });

  return (
    <div className="glass-card">
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Historique des Transactions</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {filtered.length} opération(s) enregistrée(s)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher Carrefour, Total..."
              className="form-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.2rem', fontSize: '0.85rem', width: '210px' }}
            />
          </div>

          {/* Filter Tabs */}
          <select
            className="form-select"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{ width: '130px', fontSize: '0.85rem' }}
          >
            <option value="all">Tous</option>
            <option value="expense">Dépenses</option>
            <option value="income">Revenus</option>
            <option value="transfer">Transferts</option>
          </select>

          {/* Add Tx Button */}
          <button className="btn btn-primary btn-sm" onClick={onOpenAddModal}>
            <Plus size={16} /> Nouvelle Opération
          </button>
        </div>
      </div>

      {/* Transaction Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Aucune transaction trouvée pour ces critères.
          </div>
        ) : (
          filtered.map(tx => {
            const cat = getCategory(tx.categoryId);
            const accountName = getAccountName(tx.accountId);
            const isExpense = tx.type === 'expense';
            const isTransfer = tx.type === 'transfer';

            return (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  transition: 'background 0.15s ease'
                }}
              >
                {/* Left Icon & Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: isTransfer ? 'rgba(59, 130, 246, 0.15)' : isExpense ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    {isTransfer ? <Repeat size={20} color="#3B82F6" /> : cat.icon}
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {tx.description}
                      {tx.transferId && (
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Linked Transfer</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span>{formatDateFrench(tx.transactionDate)}</span>
                      <span>•</span>
                      <span>{accountName}</span>
                      {tx.merchant && (
                        <>
                          <span>•</span>
                          <span style={{ color: 'var(--color-primary)' }}>{tx.merchant}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Amount */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    color: isTransfer ? '#3B82F6' : isExpense ? '#EF4444' : '#10B981'
                  }}>
                    {isExpense ? '-' : isTransfer ? '⇄ ' : '+'}{formatCurrency(tx.amount, currencyDisplay)}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                    {tx.source}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
