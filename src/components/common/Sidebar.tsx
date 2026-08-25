import React from 'react';
import ReactDOM from 'react-dom';
import { useFinance } from '../../context/FinanceContext';
import {
  Moon, Calendar, Target, Wallet, BarChart2, Landmark, Globe,
  Settings, Sparkles, ArrowDownRight, ArrowUpRight, TrendingUp,
  X, Menu
} from 'lucide-react';
import { TRANSLATIONS } from '../../utils/i18n';
import type { AppLanguage } from '../../types/user';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAffordability: () => void;
  /** Opens the Add Transaction modal pre-selected on the given type. */
  onOpenAddTransaction?: (type?: 'expense' | 'income') => void;
  /** Controlled mobile drawer state */
  isMobileOpen: boolean;
  onMobileOpen: () => void;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAffordability,
  onOpenAddTransaction,
  isMobileOpen,
  onMobileOpen,
  onMobileClose
}) => {
  const { currencyDisplay, setCurrencyDisplay, activeMode, language, setLanguage } = useFinance();
  const t = TRANSLATIONS[language] || TRANSLATIONS.fr;

  const isRtl = language === 'ar_darija';

  const navItems = [
    { id: 'dashboard',     label: t.dashboardTab,   icon: BarChart2 },
    { id: 'salary',        label: t.salaryTab,       icon: Wallet },
    { id: 'accounts',      label: t.accountsTab,     icon: Landmark },
    { id: 'portfolio',     label: isRtl ? 'بورصة المغرب (BVC)' : 'Bourse Maroc (BVC)', icon: TrendingUp },
    { id: 'bills_calendar',label: t.billsTab,        icon: Calendar },
    { id: 'goals',         label: t.goalsTab,        icon: Target },
    {
      id: 'seasonal',
      label: activeMode === 'ramadan' ? 'Mode Ramadan 🌙' : activeMode === 'eid' ? 'Mode Eid 🐏' : t.seasonalTab,
      icon: activeMode === 'eid' ? Sparkles : Moon
    }
  ];

  // Bottom nav: 5 most-used tabs + menu
  const bottomNavItems = [
    { id: 'dashboard',      label: 'Accueil',  icon: BarChart2 },
    { id: 'accounts',       label: 'Comptes',  icon: Landmark },
    { id: 'bills_calendar', label: 'Factures', icon: Calendar },
    { id: 'goals',          label: 'Objectifs',icon: Target },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    onMobileClose();
  };

  return (
    <>
      {/* ---- Backdrop overlay (mobile only) ---- */}
      {isMobileOpen && ReactDOM.createPortal(
        <div className="sidebar-backdrop" onClick={onMobileClose} />,
        document.body
      )}

      {/* ---- Main Sidebar ---- */}
      <aside
        className={`sidebar${isMobileOpen ? ' sidebar--open' : ''}`}
        style={{
          background: 'rgba(11, 15, 25, 0.96)',
          backdropFilter: 'blur(20px)',
          borderRight: !isRtl ? '1px solid var(--border-color)' : 'none',
          borderLeft: isRtl ? '1px solid var(--border-color)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.25rem 1rem',
        }}
      >
        {/* Top: Brand + Quick Actions + Nav */}
        <div>
          {/* Brand header */}
          <div
            className="sidebar-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              paddingBottom: '1rem',
              marginBottom: '1rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '11px', flexShrink: 0,
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
              }}>
                🇲🇦
              </div>
              <h1
                className="sidebar-brand-text"
                style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', margin: 0 }}
              >
                DirhamFlow <span style={{ color: 'var(--color-primary)', fontFamily: 'Tajawal' }}>فلوسي</span>
              </h1>
            </div>

            {/* Close button — visible only on mobile via CSS */}
            <button className="sidebar-close-btn" onClick={onMobileClose} aria-label="Fermer le menu">
              <X size={18} />
            </button>
          </div>

          {/* Quick action buttons: + Dépense / + Revenu */}
          <div className="sidebar-quick-actions" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { onOpenAddTransaction?.('expense'); onMobileClose(); }}
              style={{ flex: 1, fontWeight: 700, padding: '0.6rem 0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}
            >
              <ArrowDownRight size={14} /> + Dépense
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { onOpenAddTransaction?.('income'); onMobileClose(); }}
              style={{ flex: 1, fontWeight: 700, padding: '0.6rem 0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}
            >
              <ArrowUpRight size={14} color="#10B981" /> + Revenu
            </button>
          </div>

          {/* Affordability CTA */}
          <button
            className="btn btn-accent sidebar-affordability-btn"
            onClick={() => { onOpenAffordability(); onMobileClose(); }}
            style={{
              width: '100%', fontWeight: 700, justifyContent: 'center',
              padding: '0.65rem', marginBottom: '1.25rem',
              fontSize: '0.88rem', borderRadius: '12px'
            }}
          >
            🧠 {t.affordabilityBtn}
          </button>

          {/* Primary nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div
              className="sidebar-section-title"
              style={{
                fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                color: 'var(--text-dim)', padding: '0 0.5rem 0.4rem 0.5rem', letterSpacing: '0.05em',
                display: 'block'
              }}
            >
              Menu Principal
            </div>

            {navItems.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className="sidebar-nav-item"
                  onClick={() => handleNavClick(tab.id)}
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
                    width: '100%',
                    textAlign: isRtl ? 'right' : 'left',
                    transition: 'all 0.15s ease',
                    borderLeft: isActive && !isRtl ? '3px solid var(--color-primary)' : '3px solid transparent',
                    borderRight: isActive && isRtl ? '3px solid var(--color-primary)' : '3px solid transparent',
                  }}
                >
                  <Icon size={18} color={isActive ? 'var(--color-primary)' : 'var(--text-muted)'} />
                  <span className="sidebar-label" style={{ flex: 1 }}>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Settings + Language/Currency */}
        <div>
          {/* Settings button */}
          <div className="sidebar-settings-section" style={{ marginBottom: '1rem' }}>
            <button
              className="sidebar-settings-btn"
              onClick={() => handleNavClick('settings')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 0.9rem', borderRadius: '11px', border: 'none',
                background: activeTab === 'settings' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                color: activeTab === 'settings' ? 'var(--color-primary)' : 'var(--text-muted)',
                fontWeight: activeTab === 'settings' ? 700 : 500, fontSize: '0.9rem',
                cursor: 'pointer', textAlign: isRtl ? 'right' : 'left', transition: 'all 0.15s ease',
                borderLeft: activeTab === 'settings' && !isRtl ? '3px solid var(--color-primary)' : '3px solid transparent',
                borderRight: activeTab === 'settings' && isRtl ? '3px solid var(--color-primary)' : '3px solid transparent',
              }}
            >
              <Settings size={18} color="var(--color-primary)" />
              <span className="sidebar-label" style={{ flex: 1 }}>{t.settingsTab}</span>
            </button>
          </div>

          {/* Language + Currency controls */}
          <div
            className="sidebar-controls"
            style={{
              background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)',
              borderRadius: '12px', padding: '0.65rem', display: 'flex',
              flexDirection: 'column', gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              {/* Language selector */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                background: 'rgba(255,255,255,0.05)', padding: '3px 6px',
                borderRadius: '8px', flex: 1
              }}>
                <Globe size={13} color="var(--color-primary)" />
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value as AppLanguage)}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--text-main)',
                    fontSize: '0.78rem', outline: 'none', cursor: 'pointer',
                    width: '100%', fontFamily: 'system-ui, Tajawal'
                  }}
                >
                  <option value="fr"       style={{ background: '#0F172A' }}>Français</option>
                  <option value="ar_darija" style={{ background: '#0F172A' }}>العربية (دارجة)</option>
                  <option value="en"        style={{ background: '#0F172A' }}>English</option>
                </select>
              </div>

              {/* Currency toggle */}
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

      {/* ---- Bottom Navigation Bar (mobile only — rendered via CSS) ---- */}
      <nav className="bottom-nav" aria-label="Navigation principale">
        {bottomNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`bottom-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              aria-label={item.label}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
        {/* Menu button — opens the full sidebar drawer */}
        <button
          className={`bottom-nav-item${activeTab === 'salary' || activeTab === 'portfolio' || activeTab === 'seasonal' || activeTab === 'settings' ? ' active' : ''}`}
          onClick={onMobileOpen}
          aria-label="Plus"
        >
          <Menu size={22} strokeWidth={isMobileOpen ? 2.5 : 1.8} />
          <span>Plus</span>
        </button>
      </nav>
    </>
  );
};
