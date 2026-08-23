import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Moon, Sun, Calendar, Target, Wallet, BarChart2, Landmark, Globe, Settings } from 'lucide-react';
import { TRANSLATIONS } from '../../utils/i18n';
import type { AppLanguage, AppTheme } from '../../types/user';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAffordability: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAffordability
}) => {
  const { currencyDisplay, setCurrencyDisplay, activeMode, language, setLanguage, theme, setTheme } = useFinance();
  const t = TRANSLATIONS[language] || TRANSLATIONS.fr;

  const toggleTheme = () => {
    const nextTheme: AppTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const isRtl = language === 'ar_darija';

  return (
    <header style={{
      background: 'rgba(11, 15, 25, 0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Top Banner Bar */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
          }}>
            🇲🇦
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                DirhamFlow <span style={{ color: 'var(--color-primary)', fontFamily: 'Tajawal' }}>فلوسي</span>
              </h1>
              <span className="badge badge-success">v1.0</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gérez vos dirhams en toute sécurité</p>
          </div>
        </div>

        {/* Controls: Language, Theme, Currency, Affordability */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Language Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Globe size={14} color="var(--color-primary)" />
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as AppLanguage)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer', fontFamily: 'system-ui, Tajawal' }}
            >
              <option value="fr" style={{ background: '#0F172A' }}>Français</option>
              <option value="ar_darija" style={{ background: '#0F172A' }}>العربية (دارجة)</option>
              <option value="en" style={{ background: '#0F172A' }}>English</option>
            </select>
          </div>

          {/* Theme Switcher Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={toggleTheme}
            title="Basculer Mode Sombre / Mode Clair"
            style={{ padding: '0.4rem 0.65rem' }}
          >
            {theme === 'dark' ? <Sun size={15} color="#F59E0B" /> : <Moon size={15} color="#6366F1" />}
          </button>

          {/* Currency Format Switcher */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrencyDisplay(currencyDisplay === 'DH' ? 'MAD' : 'DH')}
            title="Basculer l'affichage (DH / MAD)"
          >
            💱 <strong>{currencyDisplay}</strong>
          </button>

          {/* Primary Feature Button: Can I Afford This? */}
          <button
            className="btn btn-accent btn-sm"
            onClick={onOpenAffordability}
            style={{ fontWeight: 700 }}
          >
            {t.affordabilityBtn}
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        {[
          { id: 'dashboard', label: t.dashboardTab, icon: BarChart2 },
          { id: 'salary', label: t.salaryTab, icon: Wallet },
          { id: 'accounts', label: t.accountsTab, icon: Landmark },
          { id: 'bills_calendar', label: t.billsTab, icon: Calendar },
          { id: 'goals', label: t.goalsTab, icon: Target },
          { id: 'seasonal', label: activeMode === 'ramadan' ? 'Mode Ramadan 🌙' : activeMode === 'eid' ? 'Mode Eid 🐏' : t.seasonalTab, icon: Moon },
          { id: 'settings', label: t.settingsTab, icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isSettings = tab.id === 'settings';

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                border: 'none',
                background: isSettings ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                borderRadius: isSettings ? '8px' : '0',
                color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.9rem',
                cursor: 'pointer',
                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                marginLeft: isSettings && !isRtl ? 'auto' : undefined,
                marginRight: isSettings && isRtl ? 'auto' : undefined
              }}
            >
              <Icon size={16} color={isSettings ? 'var(--color-primary)' : undefined} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
