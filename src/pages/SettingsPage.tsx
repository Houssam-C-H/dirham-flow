import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { User, Mail, Lock, Globe, Key, RefreshCw, LogOut } from 'lucide-react';
import { TRANSLATIONS } from '../utils/i18n';
import type { AppLanguage, CurrencyDisplay } from '../types/user';

interface SettingsPageProps {
  onReRunWizard: () => void;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onReRunWizard, onLogout }) => {
  const { state, saveAndSetState, language, setLanguage, currencyDisplay, setCurrencyDisplay, resetDemoData } = useFinance();

  const t = TRANSLATIONS[language] || TRANSLATIONS.fr;

  const [fullName, setFullName] = useState<string>(state.user?.fullName || 'Mehdi Benali');
  const [email, setEmail] = useState<string>(state.user?.email || 'mehdi@dirhamflow.ma');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>('');

  // Password reset fields
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string>('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string>('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveAndSetState({
      ...state,
      user: {
        fullName,
        email,
        language
      }
    });
    setProfileSuccessMsg('✓ Profil mis à jour avec succès!');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (newPassword.length < 6) {
      setPasswordErrorMsg('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordErrorMsg('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    // Success notification
    setPasswordSuccessMsg('✓ Mot de passe modifié avec succès!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setTimeout(() => setPasswordSuccessMsg(''), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* User Info Header Card */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.95))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            color: '#FFF',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
          }}>
            👤
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{fullName}</h2>
              <span className="badge badge-success">Compte Vérifié 🇲🇦</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{email}</p>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onLogout} style={{ color: '#EF4444' }}>
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Profile & Name Settings */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} color="var(--color-primary)" /> Informations Personnelles & Profil
        </h3>

        {profileSuccessMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            {profileSuccessMsg}
          </div>
        )}

        <form onSubmit={handleUpdateProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{t.fullNameLabel}</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{t.emailLabel}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            Enregistrer les modifications
          </button>
        </form>
      </div>

      {/* Language & Currency Preferences */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={18} color="#3B82F6" /> Langue & Préférences d'Affichage
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {/* Language Selection */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t.languageLabel}</label>
            <select
              className="form-select"
              value={language}
              onChange={e => setLanguage(e.target.value as AppLanguage)}
            >
              <option value="fr">🇫🇷 Français</option>
              <option value="ar_darija">🇲🇦 العربية (دارجة)</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>

          {/* Currency Display Mode */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Format de la monnaie</label>
            <select
              className="form-select"
              value={currencyDisplay}
              onChange={e => setCurrencyDisplay(e.target.value as CurrencyDisplay)}
            >
              <option value="DH">12 500 DH (Standard Marocain)</option>
              <option value="MAD">12,500 MAD (Format International)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Password Reset Section */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Key size={18} color="#F59E0B" /> Modification du Mot de Passe
        </h3>

        {passwordSuccessMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            {passwordSuccessMsg}
          </div>
        )}

        {passwordErrorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            {passwordErrorMsg}
          </div>
        )}

        <form onSubmit={handleResetPassword}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Mot de passe actuel</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Nouveau mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    placeholder="Au moins 6 caractères"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Confirmer le nouveau mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-accent btn-sm">
            Changer le Mot de Passe
          </button>
        </form>
      </div>

      {/* Reset & Setup Wizard Options */}
      <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#EF4444' }}>
          Réinitialisation & Assistant
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Redémarrez l'assistant d'installation financière pour recalibrer vos soldes de départ.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={onReRunWizard}>
            <RefreshCw size={15} /> Refaire l'Assistant d'Installation
          </button>
          <button className="btn btn-secondary btn-sm" onClick={resetDemoData} style={{ opacity: 0.6 }}>
            Réinitialiser les Données Démo
          </button>
        </div>
      </div>
    </div>
  );
};
