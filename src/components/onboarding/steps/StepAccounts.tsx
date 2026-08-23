import React, { useState } from 'react';
import { MOROCCAN_INSTITUTIONS } from '../../../types/onboarding';
import type { Account, AccountType } from '../../../types/finance';
import { Plus, Trash2 } from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { TRANSLATIONS } from '../../../utils/i18n';

interface StepAccountsProps {
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepAccounts: React.FC<StepAccountsProps> = ({ accounts, setAccounts, onNext, onBack }) => {
  const { language } = useFinance();
  const t = TRANSLATIONS[language] || TRANSLATIONS.fr;

  const [instId, setInstId] = useState<string>('inst_cih');
  const [customBankName, setCustomBankName] = useState<string>('');
  const [accName, setAccName] = useState<string>('Compte Chèque Principal');
  const [accType, setAccType] = useState<AccountType>('bank');
  const [initialBal, setInitialBal] = useState<string>('12500');

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const balNum = parseFloat(initialBal);
    if (isNaN(balNum)) return;

    const selectedInst = MOROCCAN_INSTITUTIONS.find(i => i.id === instId);
    const bankName = instId === 'custom' ? customBankName || 'Banque Personnalisée' : selectedInst?.name || 'Banque';

    const newAcc: Account = {
      id: `acc_onb_${Date.now()}`,
      name: accName || bankName,
      type: accType,
      balance: balNum,
      openingBalance: balNum,
      openingBalanceDate: new Date().toISOString().split('T')[0],
      institutionId: instId,
      bankName: bankName,
      color: accType === 'cash' ? '#10B981' : accType === 'credit' ? '#EF4444' : '#F59E0B',
      icon: accType === 'cash' ? 'Banknote' : 'Building2'
    };

    setAccounts([...accounts, newAcc]);
    setAccName('Nouveau Compte');
    setInitialBal('0');
  };

  const handleRemove = (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id));
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.2rem' }}>
        {t.step1Title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        {t.step1Subtitle}
      </p>

      {/* Form */}
      <form onSubmit={handleAddAccount} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t.instLabel}</label>
            <select className="form-select" value={instId} onChange={e => setInstId(e.target.value)}>
              {MOROCCAN_INSTITUTIONS.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.icon} {inst.name}
                </option>
              ))}
              <option value="custom">➕ Autre établissement...</option>
            </select>
          </div>

          {instId === 'custom' && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{t.instLabel}</label>
              <input
                type="text"
                required
                placeholder="ex: CFG Bank"
                className="form-input"
                value={customBankName}
                onChange={e => setCustomBankName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t.accTypeLabel}</label>
            <select className="form-select" value={accType} onChange={e => setAccType(e.target.value as AccountType)}>
              <option value="bank">🏦 Compte Bancaire Chèque</option>
              <option value="cash">💵 Espèces / Cash physique</option>
              <option value="savings">💰 Compte Épargne / Sur carnet</option>
              <option value="credit">💳 Carte de Crédit / Différé</option>
              <option value="ewallet">📱 E-Wallet (Maroc Pay)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t.accNameLabel}</label>
            <input
              type="text"
              required
              className="form-input"
              value={accName}
              onChange={e => setAccName(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t.initialBalLabel}</label>
            <input
              type="number"
              required
              className="form-input"
              style={{ fontWeight: 700 }}
              value={initialBal}
              onChange={e => setInitialBal(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
          <Plus size={16} /> {t.btnAddAccount}
        </button>
      </form>

      {/* Account List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {t.stepLabelAccounts} ({accounts.length})
        </h4>

        {accounts.map(acc => (
          <div
            key={acc.id}
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
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{acc.name}</div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{acc.bankName}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10B981' }}>{acc.balance} DH</span>
              <button
                type="button"
                onClick={() => handleRemove(acc.id)}
                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onBack} disabled>
          {t.btnBack}
        </button>
        <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={onNext} disabled={accounts.length === 0}>
          {t.btnContinue}
        </button>
      </div>
    </div>
  );
};
