import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Globe, ArrowRight, ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';
import type { AppLanguage } from '../../types/user';
import type { OnboardingUserData } from '../../types/onboarding';
import type { Bill } from '../../types/budget';

interface OnboardingWizardProps {
  userData: OnboardingUserData;
  onCompleted: () => void;
}

interface WizardAccount {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'savings' | 'credit';
  balance: string;
  icon: string;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ userData, onCompleted }) => {
  const { state, saveAndSetState, setLanguage } = useFinance();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [lang, setLang] = useState<AppLanguage>(userData.language || 'fr');

  const isRtl = lang === 'ar_darija';

  // --- STEP 1: COMPTES (Où est votre argent ?) ---
  const [accounts, setAccounts] = useState<WizardAccount[]>([
    { id: 'acc_bank_1', name: 'CIH Bank (Compte principal)', type: 'bank', balance: '12500', icon: '🏦' },
    { id: 'acc_cash_1', name: 'Espèces (Cash)', type: 'cash', balance: '750', icon: '💵' },
    { id: 'acc_savings_1', name: 'Épargne (Livret)', type: 'savings', balance: '2000', icon: '💰' }
  ]);

  const [newAccName, setNewAccName] = useState<string>('');
  const [newAccBalance, setNewAccBalance] = useState<string>('1000');
  const [newAccType, setNewAccType] = useState<'bank' | 'cash' | 'savings' | 'credit'>('bank');

  // --- STEP 2: SALAIRE (Votre revenu) ---
  const [monthlySalary, setMonthlySalary] = useState<string>('8000');
  const [payDay, setPayDay] = useState<number>(25);
  const [hasNoFixedIncome, setHasNoFixedIncome] = useState<boolean>(false);

  // --- STEP 3: FACTURES (Vos paiements fixes) ---
  const [bills, setBills] = useState<Array<{ id: string; name: string; amount: number; selected: boolean }>>([
    { id: 'b_rent', name: 'Loyer (الكرا)', amount: 2500, selected: true },
    { id: 'b_internet', name: 'Internet (الأنترنيت)', amount: 250, selected: true },
    { id: 'b_phone', name: 'Téléphone (الريشارژ)', amount: 100, selected: true }
  ]);
  const [newBillName, setNewBillName] = useState<string>('');
  const [newBillAmount, setNewBillAmount] = useState<string>('200');

  // --- STEP 4: OBJECTIF (Votre priorité) ---
  const [selectedGoal, setSelectedGoal] = useState<string>('manage_better');

  // Account Helpers
  const addAccount = () => {
    if (newAccName.trim()) {
      const iconMap = { bank: '🏦', cash: '💵', savings: '💰', credit: '💳' };
      setAccounts(prev => [
        ...prev,
        {
          id: `acc_custom_${Date.now()}`,
          name: newAccName.trim(),
          type: newAccType,
          balance: newAccBalance || '0',
          icon: iconMap[newAccType]
        }
      ]);
      setNewAccName('');
      setNewAccBalance('1000');
    }
  };

  const removeAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const updateAccountName = (id: string, name: string) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, name } : a));
  };

  const updateAccountBalance = (id: string, balance: string) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, balance } : a));
  };

  // Bill Helpers
  const toggleBill = (id: string) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, selected: !b.selected } : b));
  };

  const removeBill = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const addCustomBill = () => {
    if (newBillName.trim() && parseFloat(newBillAmount) > 0) {
      setBills(prev => [...prev, {
        id: `b_custom_${Date.now()}`,
        name: newBillName.trim(),
        amount: parseFloat(newBillAmount),
        selected: true
      }]);
      setNewBillName('');
      setNewBillAmount('200');
    }
  };

  const handleFinishWizard = () => {
    const salAmt = hasNoFixedIncome ? 0 : (parseFloat(monthlySalary) || 0);

    const updatedAccounts = accounts.map((acc, index) => {
      const bAmt = parseFloat(acc.balance) || 0;
      return {
        id: acc.id,
        name: acc.name,
        type: acc.type,
        balance: bAmt,
        openingBalance: bAmt,
        openingBalanceDate: new Date().toISOString().split('T')[0],
        institutionId: `inst_${acc.type}`,
        bankName: acc.name,
        color: acc.type === 'bank' ? '#10B981' : acc.type === 'cash' ? '#F59E0B' : acc.type === 'savings' ? '#3B82F6' : '#EF4444',
        icon: acc.type === 'bank' ? 'Building2' : acc.type === 'cash' ? 'Banknote' : acc.type === 'savings' ? 'PiggyBank' : 'CreditCard',
        isDefault: index === 0
      };
    });

    const selectedBillsList: Bill[] = bills.filter(b => b.selected).map(b => ({
      id: `bill_${b.id}`,
      name: b.name,
      provider: 'Prestation',
      amount: b.amount,
      dueDate: 1,
      categoryId: 'cat_rent',
      accountId: accounts[0]?.id || 'acc_bank_1',
      isPaidThisMonth: false,
      icon: '🏠'
    }));

    saveAndSetState({
      ...state,
      onboardingCompleted: true,
      user: {
        fullName: userData.fullName || 'Houssam',
        email: userData.email,
        language: lang
      },
      accounts: updatedAccounts,
      salaryConfig: {
        ...state.salaryConfig,
        monthlySalary: salAmt,
        payDay: payDay,
        employmentType: hasNoFixedIncome ? 'irregular' : 'monthly_salary'
      },
      bills: selectedBillsList,
      budgets: [],
      goals: [],
      transactions: [],
      linkedTransfers: [],
      preferences: {
        ...state.preferences,
        language: lang,
        currencyDisplay: 'DH'
      }
    });

    onCompleted();
  };

  const totalCurrentMoney = accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);
  const totalBillsAmount = bills.filter(b => b.selected).reduce((sum, b) => sum + b.amount, 0);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.15), rgba(11, 15, 25, 0.98))',
        padding: '1.5rem'
      }}
    >
      {/* Top Header Bar */}
      <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
            🇲🇦
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>DirhamFlow فلوسي</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <Globe size={14} color="var(--color-primary)" />
          <select
            value={lang}
            onChange={e => {
              const newLang = e.target.value as AppLanguage;
              setLang(newLang);
              setLanguage(newLang);
            }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
          >
            <option value="fr" style={{ background: '#0F172A', color: '#F8FAFC' }}>🇫🇷 Français</option>
            <option value="ar_darija" style={{ background: '#0F172A', color: '#F8FAFC' }}>🇲🇦 العربية (دارجة)</option>
            <option value="en" style={{ background: '#0F172A', color: '#F8FAFC' }}>🇬🇧 English</option>
          </select>
        </div>
      </div>

      {/* Welcome Banner */}
      <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto', textAlign: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Bienvenue 👋 {userData.fullName || 'Houssam'}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Configurons votre situation financière en quelques étapes.
        </p>
      </div>

      {/* Progress Steps Indicator */}
      <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          <span>Étape {currentStep} sur 4</span>
          <span>{currentStep === 1 ? '1. Comptes' : currentStep === 2 ? '2. Salaire' : currentStep === 3 ? '3. Factures' : '4. Objectif'}</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ width: `${(currentStep / 4) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #059669)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Main Wizard Content Card */}
      <div className="glass-card" style={{ maxWidth: '640px', width: '100%', margin: '0 auto', padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {/* SCREEN 1: COMPTES (Où est votre argent ?) */}
        {currentStep === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>1. Comptes</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem' }}>
                Où est votre argent ?
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Indiquez vos comptes et solde actuel pour démarrer votre suivi.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{acc.icon}</span>

                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 2, fontWeight: 700, fontSize: '0.95rem', minWidth: '160px' }}
                    value={acc.name}
                    onChange={e => updateAccountName(acc.id, e.target.value)}
                    placeholder="Nom du compte..."
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1, justifyContent: 'flex-end', minWidth: '130px' }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '110px', textAlign: isRtl ? 'left' : 'right', fontWeight: 800, fontSize: '1.1rem' }}
                      value={acc.balance}
                      onChange={e => updateAccountBalance(acc.id, e.target.value)}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>DH</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAccount(acc.id)}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Custom Account */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="+ Ajouter un compte (ex: BMCE, Attijari Pro)"
                className="form-input"
                style={{ flex: 2, fontSize: '0.85rem', minWidth: '180px' }}
                value={newAccName}
                onChange={e => setNewAccName(e.target.value)}
              />

              <select
                className="form-select"
                style={{ flex: 1, fontSize: '0.85rem', background: '#0F172A', color: '#F8FAFC', minWidth: '110px' }}
                value={newAccType}
                onChange={e => setNewAccType(e.target.value as any)}
              >
                <option value="bank" style={{ background: '#0F172A', color: '#F8FAFC' }}>🏦 Banque</option>
                <option value="cash" style={{ background: '#0F172A', color: '#F8FAFC' }}>💵 Espèces</option>
                <option value="savings" style={{ background: '#0F172A', color: '#F8FAFC' }}>💰 Épargne</option>
                <option value="credit" style={{ background: '#0F172A', color: '#F8FAFC' }}>💳 Crédit</option>
              </select>

              <input
                type="number"
                placeholder="Solde DH"
                className="form-input"
                style={{ width: '90px', fontSize: '0.85rem' }}
                value={newAccBalance}
                onChange={e => setNewAccBalance(e.target.value)}
              />

              <button type="button" className="btn btn-secondary btn-sm" onClick={addAccount}>
                <Plus size={14} /> Ajouter
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: SALAIRE (Votre revenu) */}
        {currentStep === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>2. Salaire</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
                Votre revenu
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Indiquez votre salaire mensuel moyen ou vos revenus.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <button
                type="button"
                style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: hasNoFixedIncome ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                  background: hasNoFixedIncome ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.03)',
                  color: hasNoFixedIncome ? 'var(--color-primary)' : 'var(--text-muted)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
                onClick={() => setHasNoFixedIncome(!hasNoFixedIncome)}
              >
                {hasNoFixedIncome ? '✓ Je n\'ai pas de revenu fixe (Revenu variable)' : 'Je n\'ai pas de revenu fixe'}
              </button>

              {!hasNoFixedIncome && (
                <>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Salaire Mensuel (DH / mois)</label>
                    <input
                      type="number"
                      className="form-input"
                      style={{ fontSize: '1.3rem', fontWeight: 800, padding: '0.85rem' }}
                      value={monthlySalary}
                      onChange={e => setMonthlySalary(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Jour de paiement</label>
                    <select
                      className="form-select"
                      style={{ fontSize: '1rem', padding: '0.75rem', background: '#0F172A', color: '#F8FAFC' }}
                      value={payDay}
                      onChange={e => setPayDay(parseInt(e.target.value))}
                    >
                      {[1, 5, 10, 15, 20, 25, 28, 30].map(day => (
                        <option key={day} value={day} style={{ background: '#0F172A', color: '#F8FAFC' }}>
                          Le {day} de chaque mois
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* SCREEN 3: FACTURES (Vos paiements fixes) */}
        {currentStep === 3 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>3. Factures</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
                Vos paiements fixes
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Sélectionnez vos factures mensuelles récurrentes.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {bills.map(b => (
                <div
                  key={b.id}
                  onClick={() => toggleBill(b.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: b.selected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                    background: b.selected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: b.selected ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF'
                    }}>
                      {b.selected && <Check size={14} />}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{b.name}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: b.selected ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                      <bdi>{b.amount} DH</bdi>
                    </span>

                    <button
                      type="button"
                      onClick={e => removeBill(b.id, e)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Custom Bill */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="+ Facture (ex: Électricité, Salle de sport)"
                className="form-input"
                style={{ flex: 2, fontSize: '0.85rem' }}
                value={newBillName}
                onChange={e => setNewBillName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Montant DH"
                className="form-input"
                style={{ flex: 1, fontSize: '0.85rem' }}
                value={newBillAmount}
                onChange={e => setNewBillAmount(e.target.value)}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={addCustomBill}>
                <Plus size={14} /> Ajouter
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4: OBJECTIF (Votre priorité) */}
        {currentStep === 4 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>4. Objectif</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
                Votre priorité
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Quel est votre objectif principal avec DirhamFlow ?
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { id: 'manage_better', label: 'Mieux gérer mon argent', icon: '📊' },
                { id: 'save_money', label: 'Épargner', icon: '💰' },
                { id: 'reduce_spend', label: 'Réduire mes dépenses', icon: '✂️' },
                { id: 'prepare_project', label: 'Préparer un projet', icon: '💍' }
              ].map(g => (
                <div
                  key={g.id}
                  onClick={() => setSelectedGoal(g.id)}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: selectedGoal === g.id ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                    background: selectedGoal === g.id ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.03)',
                    fontWeight: selectedGoal === g.id ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: selectedGoal === g.id ? '6px solid var(--color-primary)' : '2px solid var(--text-muted)',
                    boxSizing: 'border-box'
                  }} />
                  <span style={{ fontSize: '1.2rem' }}>{g.icon}</span>
                  <span>{g.label}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#10B981', marginBottom: '0.5rem' }}>Prêt à démarrer !</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div>• Solde total : <strong><bdi>{totalCurrentMoney} DH</bdi></strong></div>
                <div>• Revenu : <strong>{hasNoFixedIncome ? 'Variable' : `${monthlySalary} DH`}</strong></div>
                <div>• Factures : <strong><bdi>{totalBillsAmount} DH</bdi></strong></div>
                <div>• Objectif : <strong>{selectedGoal === 'save_money' ? 'Épargne' : 'Gestion'}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {currentStep > 1 ? (
            <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(prev => prev - 1)}>
              <ArrowLeft size={16} /> Retour
            </button>
          ) : <div />}

          {currentStep < 4 ? (
            <button type="button" className="btn btn-primary" onClick={() => setCurrentStep(prev => prev + 1)}>
              Continuer <ArrowRight size={16} />
            </button>
          ) : (
            <button type="button" className="btn btn-accent" onClick={handleFinishWizard} style={{ fontWeight: 800, padding: '0.85rem 1.5rem' }}>
              [ Terminer ]
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
