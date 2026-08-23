import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Moon, Calendar, Target, Wallet, BarChart2, Landmark, Globe, Settings, Sparkles, ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import { TRANSLATIONS } from '../../utils/i18n';
import type { AppLanguage } from '../../types/user';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAffordability: () => void;
  onOpenAddTransaction?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAffordability,
  onOpenAddTransaction
}) => {
  const { currencyDisplay, setCurrencyDisplay, activeMode, language, setLanguage } = useFinance();
  const t = TRANSLATIONS[language] || TRANSLATIONS.fr;

  const isRtl = language === 'ar_darija';

  const navItems = [
    { id: 'dashboard', label: t.dashboardTab, icon: BarChart2 },
    { id: 'salary', label: t.salaryTab, icon: Wallet },
    { id: 'accounts', label: t.accountsTab, icon: Landmark },
    { id: 'portfolio', label: isRtl ? 'بورصة المغرب (BVC)' : 'Bourse Maroc (BVC)', icon: TrendingUp },
    { id: 'bills_calendar', label: t.billsTab, icon: Calendar },
    { id: 'goals', label: t.goalsTab, icon: Target },
    { id: 'seasonal', label: activeMode === 'ramadan' ? 'Mode Ramadan 🌙' : activeMode === 'eid' ? 'Mode Eid 🐏' : t.seasonalTab, icon: activeMode === 'eid' ? Sparkles : Moon }
  ];

  return (
    <aside style={{
      width: '270px',
      minWidth: '270px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: 'rgba(11, 15, 25, 0.96)',
      backdropFilter: 'blur(20px)',
      borderRight: !isRtl ? '1px solid var(--border-color)' : 'none',
      borderLeft: isRtl ? '1px solid var(--border-color)' : 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '1.25rem 1rem',
      zIndex: 100
    }}>
      {/* Top Header & Simple Clean Brand */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingBottom: '1rem',
          marginBottom: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '11px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
            flexShrink: 0
          }}>
            🇲🇦
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', margin: 0 }}>
            DirhamFlow <span style={{ color: 'var(--color-primary)', fontFamily: 'Tajawal' }}>فلوسي</span>
          </h1>
        </div>

        {/* Global Action Buttons: + Dépense / + Revenu */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={onOpenAddTransaction}
            style={{ flex: 1, fontWeight: 700, padding: '0.6rem 0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}
          >
            <ArrowDownRight size={14} /> + Dépense
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenAddTransaction}
            style={{ flex: 1, fontWeight: 700, padding: '0.6rem 0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}
          >
            <ArrowUpRight size={14} color="#10B981" /> + Revenu
          </button>
        </div>

        {/* Primary Feature Action Button: Can I Afford This? */}
        <button
          className="btn btn-accent"
          onClick={onOpenAffordability}
          style={{
            width: '100%',
            fontWeight: 700,
            justifyContent: 'center',
            padding: '0.65rem',
            marginBottom: '1.25rem',
            fontSize: '0.88rem',
            borderRadius: '12px'
          }}
        >
          🧠 {t.affordabilityBtn}
        </button>

        {/* Main Vertical Menu Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', padding: '0 0.5rem 0.4rem 0.5rem', letterSpacing: '0.05em' }}>
            Menu Principal
          </div>

          {navItems.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.9rem',
                  borderRadius: '11px',
                  border: 'none',
                  background: isActive ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: isRtl ? 'right' : 'left',
                  transition: 'all 0.15s ease',
                  borderLeft: isActive && !isRtl ? '3px solid var(--color-primary)' : '3px solid transparent',
                  borderRight: isActive && isRtl ? '3px solid var(--color-primary)' : '3px solid transparent'
                }}
              >
                <Icon size={18} color={isActive ? 'var(--color-primary)' : 'var(--text-muted)'} />
                <span style={{ flex: 1 }}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Profile Settings & Controls */}
      <div>
        {/* Settings Tab pinned at bottom of menu */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 0.9rem',
              borderRadius: '11px',
              border: 'none',
              background: activeTab === 'settings' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255, 255, 255, 0.03)',
              color: activeTab === 'settings' ? 'var(--color-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'settings' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: isRtl ? 'right' : 'left',
              transition: 'all 0.15s ease',
              borderLeft: activeTab === 'settings' && !isRtl ? '3px solid var(--color-primary)' : '3px solid transparent',
              borderRight: activeTab === 'settings' && isRtl ? '3px solid var(--color-primary)' : '3px solid transparent'
            }}
          >
            <Settings size={18} color="var(--color-primary)" />
            <span style={{ flex: 1 }}>{t.settingsTab}</span>
          </button>
        </div>

        {/* Global Controls: Language, Currency */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '0.65rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            {/* Language Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.05)', padding: '3px 6px', borderRadius: '8px', flex: 1 }}>
              <Globe size={13} color="var(--color-primary)" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as AppLanguage)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.78rem', outline: 'none', cursor: 'pointer', width: '100%', fontFamily: 'system-ui, Tajawal' }}
              >
                <option value="fr" style={{ background: '#0F172A' }}>Français</option>
                <option value="ar_darija" style={{ background: '#0F172A' }}>العربية (دارجة)</option>
                <option value="en" style={{ background: '#0F172A' }}>English</option>
              </select>
            </div>

            {/* Currency Format Switcher */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrencyDisplay(currencyDisplay === 'DH' ? 'MAD' : 'DH')}
              title="Basculer monnaie"
              style={{ padding: '3px 8px', fontSize: '0.78rem' }}
            >
              <strong>{currencyDisplay}</strong>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
