import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useFinance } from '../context/FinanceContext';
import { User, Mail, Lock, Globe, Key, RefreshCw, LogOut, CheckCircle2, AlertCircle, Download, Trash2, ShieldAlert } from 'lucide-react';
import { TRANSLATIONS } from '../utils/i18n';
import type { AppLanguage, CurrencyDisplay } from '../types/user';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface SettingsPageProps {
  onReRunWizard: () => void;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onReRunWizard, onLogout }) => {
  const { state, saveAndSetState, language, setLanguage, currencyDisplay, setCurrencyDisplay } = useFinance();

  const t = TRANSLATIONS[language] || TRANSLATIONS.fr;

  const email = state.user?.email || '';
  const initialFullName = state.user?.fullName && state.user.fullName !== email
    ? state.user.fullName
    : email.split('@')[0] || 'Utilisateur';

  const [fullName, setFullName] = useState<string>(initialFullName);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);

  // Password reset fields
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string>('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string>('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  // Delete Account Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState<string>('');
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccessMsg('');

    try {
      saveAndSetState({
        ...state,
        user: {
          fullName: fullName.trim(),
          email: email.trim(),
          language
        }
      });

      if (isSupabaseConfigured) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').upsert({
            id: user.id,
            full_name: fullName.trim(),
            updated_at: new Date().toISOString()
          });

          await supabase.auth.updateUser({
            data: { full_name: fullName.trim() }
          });
        }
      }

      setProfileSuccessMsg('✓ Profil mis à jour avec succès!');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error('Update profile error:', err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
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

    setIsUpdatingPassword(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) {
          setPasswordErrorMsg(error.message);
          setIsUpdatingPassword(false);
          return;
        }
      }

      setPasswordSuccessMsg('✓ Mot de passe modifié avec succès!');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordSuccessMsg(''), 4000);
    } catch (err: any) {
      setPasswordErrorMsg(err?.message || 'Erreur lors du changement de mot de passe.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleExportDataJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dirhamflow_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeleteUserAccount = async () => {
    if (deleteConfirmInput.trim().toUpperCase() !== 'SUPPRIMER') return;

    setIsDeletingAccount(true);

    try {
      if (isSupabaseConfigured) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Delete database records
          await supabase.from('profiles').delete().eq('id', user.id);
          await supabase.from('accounts').delete().eq('user_id', user.id);
          await supabase.from('transactions').delete().eq('user_id', user.id);
          await supabase.from('budgets').delete().eq('user_id', user.id);
          await supabase.from('bills').delete().eq('user_id', user.id);
          await supabase.from('savings_goals').delete().eq('user_id', user.id);
          await supabase.from('portfolio_positions').delete().eq('user_id', user.id);
          await supabase.auth.signOut();
        }
      }

      setIsDeleteModalOpen(false);
      onLogout();
    } catch (err) {
      console.error('Delete account error:', err);
    } finally {
      setIsDeletingAccount(false);
    }
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
              <span className="badge badge-success">Compte Sécurisé 🇲🇦</span>
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
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} />
            <span>{profileSuccessMsg}</span>
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
                  placeholder="Houssam"
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
                  readOnly
                  className="form-input"
                  style={{ paddingLeft: '2.4rem', opacity: 0.8 }}
                  value={email}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" disabled={isUpdatingProfile} style={{ fontWeight: 700 }}>
            {isUpdatingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}
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
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} />
            <span>{passwordSuccessMsg}</span>
          </div>
        )}

        {passwordErrorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{passwordErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleResetPassword}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
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
                  placeholder="Au moins 6 caractères"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-accent btn-sm" disabled={isUpdatingPassword} style={{ fontWeight: 700 }}>
            {isUpdatingPassword ? 'Changement en cours...' : 'Changer le Mot de Passe'}
          </button>
        </form>
      </div>

      {/* Backup Export & Setup Wizard */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          💾 Sauvegarde & Exportation des Données
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Téléchargez une copie complète et structurée de vos comptes, budgets et transactions au format JSON.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={handleExportDataJSON} style={{ fontWeight: 700 }}>
            <Download size={16} /> Exporter mes données (JSON)
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onReRunWizard}>
            <RefreshCw size={15} /> Refaire l'Assistant d'Installation
          </button>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.03)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} /> Zone Danger — Suppression du Compte
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Supprimez définitivement votre compte et l'ensemble de vos données financières stockées.
        </p>

        <button className="btn btn-sm" onClick={() => setIsDeleteModalOpen(true)} style={{ background: '#EF4444', color: '#FFF', fontWeight: 700 }}>
          <Trash2 size={15} /> Supprimer Mon Compte
        </button>
      </div>

      {/* Account Deletion Confirmation Portal Modal */}
      {isDeleteModalOpen && ReactDOM.createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setIsDeleteModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
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
              maxWidth: '420px',
              width: '100%',
              background: '#0F172A',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: '#EF4444'
            }}>
              <Trash2 size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EF4444', marginBottom: '0.5rem' }}>
              Suppression Définitive du Compte
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Cette action est **irréversible**. Tous vos comptes, transactions, budgets, factures et positions boursières seront définitivement effacés.
            </p>

            <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label className="form-label">Tapez <b>SUPPRIMER</b> pour confirmer</label>
              <input
                type="text"
                placeholder="SUPPRIMER"
                className="form-input"
                style={{ fontWeight: 800, letterSpacing: '1px' }}
                value={deleteConfirmInput}
                onChange={e => setDeleteConfirmInput(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsDeleteModalOpen(false)}>
                Annuler
              </button>
              <button
                type="button"
                className="btn"
                disabled={deleteConfirmInput.trim().toUpperCase() !== 'SUPPRIMER' || isDeletingAccount}
                style={{
                  flex: 1,
                  background: deleteConfirmInput.trim().toUpperCase() === 'SUPPRIMER' ? '#EF4444' : 'rgba(239, 68, 68, 0.4)',
                  color: '#FFF',
                  fontWeight: 700
                }}
                onClick={handleDeleteUserAccount}
              >
                {isDeletingAccount ? 'Suppression...' : 'Supprimer Définitivement'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
