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

// Onboarding & Auth
import { AuthModal } from '../components/onboarding/AuthModal';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
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
  const [showWizard, setShowWizard] = useState<boolean>(!state.onboardingCompleted);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal States
  const [isAddTxOpen, setIsAddTxOpen] = useState<boolean>(false);
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);
  const [isAffordabilityOpen, setIsAffordabilityOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);

  const isRtl = language === 'ar_darija';

  // Keep authenticatedUser synced with state.user changes
  useEffect(() => {
    if (state.user && state.user.email) {
      setAuthenticatedUser(state.user);
      setShowWizard(!state.onboardingCompleted);
    } else {
      setAuthenticatedUser(null);
    }
  }, [state.user, state.onboardingCompleted]);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout error:', e);
      }
    }
    setAuthenticatedUser(null);
    setShowWizard(false);
    saveAndSetState({
      ...state,
      user: null,
      onboardingCompleted: false
    });
  };

  const handleAuthenticated = async (user: OnboardingUserData, isNewUser: boolean) => {
    setAuthenticatedUser(user);

    if (isNewUser) {
      setShowWizard(true);
    } else {
      // Reload actual user profile & database state from Supabase
      const freshData = await reloadInitialData();
      const isCompleted = Boolean(freshData?.onboardingCompleted || (freshData?.accounts && freshData.accounts.length > 0));
      setShowWizard(!isCompleted);
    }
  };

  // 1. Not Authenticated -> Show Auth Modal (Registration & Login)
  if (!authenticatedUser) {
    return (
      <AuthModal onAuthenticated={handleAuthenticated} />
    );
  }

  // 2. Authenticated but Onboarding Pending -> Show Onboarding Setup Wizard
  if (showWizard) {
    return (
      <OnboardingWizard
        userData={authenticatedUser}
        onCompleted={() => {
          setShowWizard(false);
        }}
      />
    );
  }

  // 3. Authenticated & Onboarding Complete -> Render Main Dashboard Layout
  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
        background: 'var(--bg-main)'
      }}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAffordability={() => setIsAffordabilityOpen(true)}
        onOpenAddTransaction={() => setIsAddTxOpen(true)}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <main style={{
          flex: 1,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem'
        }}>
          {activeTab === 'dashboard' && (
            <DashboardPage onOpenAddTransaction={() => setIsAddTxOpen(true)} />
          )}

          {activeTab === 'salary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
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
              onReRunWizard={() => setShowWizard(true)}
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
      <AddTransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} />
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
