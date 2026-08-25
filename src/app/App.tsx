import React, { useState, useEffect } from 'react';
import { FinanceProvider, useFinance } from '../context/FinanceContext';
import { Sidebar } from '../components/common/Sidebar';

// Pages
import { DashboardPage } from '../pages/DashboardPage';
import { SalaryPlannerView } from '../components/salary/SalaryPlannerView';
import { AccountsGrid } from '../components/accounts/AccountsGrid';
import { BudgetOverview } from '../components/budgets/BudgetOverview';
import { BillsManager } from '../components/bills/BillsManager';
import { FinancialCalendarTimeline } from '../components/calendar/FinancialCalendarTimeline';
import { SavingsGoalsView } from '../components/goals/SavingsGoalsView';
import { SeasonalModesView } from '../components/seasonal/SeasonalModesView';
import { CasablancaPortfolioView } from '../components/portfolio/CasablancaPortfolioView';
import { SettingsPage } from '../pages/SettingsPage';

// Auth
import { AuthModal } from '../components/onboarding/AuthModal';
import type { OnboardingUserData } from '../types/onboarding';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Modals
import { AddTransactionModal } from '../components/transactions/AddTransactionModal';
import { AccountTransferModal } from '../components/accounts/AccountTransferModal';
import { AffordabilityAdvisorModal } from '../components/affordability/AffordabilityAdvisorModal';
import { StatementImporterModal } from '../components/importer/StatementImporterModal';

const AppContent: React.FC = () => {
  const { state, language, saveAndSetState, reloadInitialData } = useFinance();

  const [authenticatedUser, setAuthenticatedUser] = useState<OnboardingUserData | null>(
    state.user && state.user.email ? state.user : null
  );
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal States
  const [isAddTxOpen, setIsAddTxOpen] = useState<boolean>(false);
  const [addTxDefaultType, setAddTxDefaultType] = useState<'expense' | 'income'>('expense');
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);
  const [isAffordabilityOpen, setIsAffordabilityOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);

  // Mobile sidebar drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const isRtl = language === 'ar_darija';

  // Keep authenticatedUser synced with state.user changes
  useEffect(() => {
    if (state.user && state.user.email) {
      setAuthenticatedUser(state.user);
    } else {
      setAuthenticatedUser(null);
    }
  }, [state.user]);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout error:', e);
      }
    }
    setAuthenticatedUser(null);
    saveAndSetState({
      ...state,
      user: null,
      onboardingCompleted: true
    });
  };

  const handleAuthenticated = async (user: OnboardingUserData) => {
    setAuthenticatedUser(user);
    await reloadInitialData();
  };

  // 1. Not Authenticated -> Show Auth Modal (Registration & Login)
  if (!authenticatedUser) {
    return (
      <AuthModal onAuthenticated={handleAuthenticated} />
    );
  }

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="app-shell"
      style={{ minHeight: '100vh', background: 'var(--bg-main)' }}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAffordability={() => setIsAffordabilityOpen(true)}
        onOpenAddTransaction={(type = 'expense') => {
          setAddTxDefaultType(type);
          setIsAddTxOpen(true);
        }}
        isMobileOpen={isSidebarOpen}
        onMobileOpen={() => setIsSidebarOpen(true)}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main-content">
        {/* Mobile sticky top header */}
        <header className="mobile-header">
          <div className="mobile-header-brand">
            <span style={{ fontSize: '1.4rem' }}>🇲🇦</span>
            DirhamFlow <span>فلوسي</span>
          </div>
          <button
            className="mobile-hamburger"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>
        <main style={{
          flex: 1,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem'
        }}>
          {activeTab === 'dashboard' && (
            <DashboardPage onOpenAddTransaction={(type = 'expense') => {
              setAddTxDefaultType(type);
              setIsAddTxOpen(true);
            }} />
          )}

          {activeTab === 'salary' && (
            <div className="salary-tab-layout" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SalaryPlannerView />
              <BudgetOverview />
            </div>
          )}

          {activeTab === 'accounts' && (
            <AccountsGrid
              onOpenTransferModal={() => setIsTransferOpen(true)}
              onOpenImportModal={() => setIsImportOpen(true)}
            />
          )}

          {activeTab === 'portfolio' && (
            <CasablancaPortfolioView />
          )}

          {activeTab === 'bills_calendar' && (
            <div className="bills-calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <BillsManager />
              <FinancialCalendarTimeline />
            </div>
          )}

          {activeTab === 'goals' && (
            <SavingsGoalsView />
          )}

          {activeTab === 'seasonal' && (
            <SeasonalModesView />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              onReRunWizard={() => {}}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          padding: '1.5rem',
          borderTop: '1px solid var(--border-color)',
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <span>DirhamFlow (فلوسي) 🇲🇦 — Suivi Financier Marocain en DH</span>
          <span>•</span>
          <button
            onClick={() => setActiveTab('settings')}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            ⚙️ Profil & Paramètres
          </button>
        </footer>
      </div>

      {/* Global Modals */}
      <AddTransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} defaultType={addTxDefaultType} />
      <AccountTransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />
      <AffordabilityAdvisorModal isOpen={isAffordabilityOpen} onClose={() => setIsAffordabilityOpen(false)} />
      <StatementImporterModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
};

export default App;
