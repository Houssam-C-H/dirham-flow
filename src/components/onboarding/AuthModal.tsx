import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Lock, Mail, User, Globe, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { AppLanguage } from '../../types/user';

interface RegisteredUser {
  fullName: string;
  email: string;
  password: string;
}

interface AuthModalProps {
  onAuthenticated: (userData: { fullName: string; email: string; language: AppLanguage }, isNewUser: boolean) => void;
}

const REGISTERED_USERS_KEY = 'dirhamflow_registered_users_v1';

export const AuthModal: React.FC<AuthModalProps> = ({ onAuthenticated }) => {
  const { setLanguage } = useFinance();
  const [isRegister, setIsRegister] = useState<boolean>(true);

  // Form Fields - Default Empty
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [lang, setLang] = useState<AppLanguage>('fr');

  // Error & Loading State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getRegisteredUsers = (): RegisteredUser[] => {
    try {
      const raw = localStorage.getItem(REGISTERED_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const saveRegisteredUser = (newUser: RegisteredUser) => {
    const existing = getRegisteredUsers();
    const updated = [...existing.filter(u => u.email.toLowerCase() !== newUser.email.toLowerCase()), newUser];
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMessage(lang === 'ar_darija' ? 'المرجو ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        // --- SUPABASE CLOUD AUTHENTICATION ---
        if (isRegister) {
          if (!fullName.trim()) {
            setErrorMessage(lang === 'ar_darija' ? 'المرجو إدخال الاسم الكامل' : 'Veuillez entrer votre nom.');
            setIsLoading(false);
            return;
          }

          const { error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
              data: { full_name: fullName.trim() }
            }
          });

          if (error) {
            setErrorMessage(error.message);
            setIsLoading(false);
            return;
          }

          setLanguage(lang);
          onAuthenticated(
            {
              fullName: fullName.trim(),
              email: cleanEmail,
              language: lang
            },
            true
          );
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password
          });

          if (error) {
            setErrorMessage('Email ou mot de passe incorrect.');
            setIsLoading(false);
            return;
          }

          setLanguage(lang);
          onAuthenticated(
            {
              fullName: data.user?.user_metadata?.full_name || 'Utilisateur',
              email: cleanEmail,
              language: lang
            },
            false
          );
        }
      } else {
        // --- LOCAL STORAGE AUTHENTICATION FALLBACK ---
        const registered = getRegisteredUsers();

        if (isRegister) {
          if (!fullName.trim()) {
            setErrorMessage(lang === 'ar_darija' ? 'المرجو إدخال الاسم الكامل' : 'Veuillez entrer votre nom.');
            setIsLoading(false);
            return;
          }

          const userExists = registered.some(u => u.email.toLowerCase() === cleanEmail);
          if (userExists) {
            setErrorMessage(lang === 'ar_darija' ? 'هذا البريد الإلكتروني مسجل بالفعل. المرجو تسجيل الدخول.' : 'Cet email est déjà enregistré. Veuillez vous connecter.');
            setIsLoading(false);
            return;
          }

          const newUser: RegisteredUser = {
            fullName: fullName.trim(),
            email: cleanEmail,
            password: password
          };

          saveRegisteredUser(newUser);
          setLanguage(lang);

          onAuthenticated(
            {
              fullName: newUser.fullName,
              email: newUser.email,
              language: lang
            },
            true
          );
        } else {
          const foundUser = registered.find(u => u.email.toLowerCase() === cleanEmail);

          if (!foundUser || foundUser.password !== password) {
            setErrorMessage('Email ou mot de passe incorrect.');
            setIsLoading(false);
            return;
          }

          setLanguage(lang);
          onAuthenticated(
            {
              fullName: foundUser.fullName,
              email: foundUser.email,
              language: lang
            },
            false
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Une erreur s\'est produite.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setLanguage(lang);
    onAuthenticated(
      {
        fullName: 'Houssam',
        email: 'houssam@dirhamflow.ma',
        language: lang
      },
      false
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.15), rgba(11, 15, 25, 0.98))',
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '2rem' }}>
        {/* Language Selector */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Globe size={14} color="var(--color-primary)" />
            <select
              value={lang}
              onChange={e => {
                const newLang = e.target.value as AppLanguage;
                setLang(newLang);
                setLanguage(newLang);
              }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="fr" style={{ background: '#0F172A', color: '#F8FAFC' }}>🇫🇷 Français</option>
              <option value="ar_darija" style={{ background: '#0F172A', color: '#F8FAFC' }}>🇲🇦 العربية (دارجة)</option>
              <option value="en" style={{ background: '#0F172A', color: '#F8FAFC' }}>🇬🇧 English</option>
            </select>
          </div>
        </div>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            marginBottom: '0.5rem',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
          }}>
            🇲🇦
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {isRegister ? (lang === 'ar_darija' ? 'إنشاء حسابك' : 'Créer votre compte') : (lang === 'ar_darija' ? 'تسجيل الدخول' : 'Connexion à DirhamFlow')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {isRegister ? 'Suivi financier simple et sécurisé en dirhams marocains (DH)' : 'Retrouvez votre tableau de bord financier'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.05)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '1.25rem',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: isRegister ? 'var(--color-primary)' : 'transparent',
              color: isRegister ? '#FFF' : 'var(--text-muted)'
            }}
            onClick={() => {
              setIsRegister(true);
              setErrorMessage(null);
            }}
          >
            {lang === 'ar_darija' ? 'حساب جديد' : 'Créer un compte'}
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: !isRegister ? 'var(--color-primary)' : 'transparent',
              color: !isRegister ? '#FFF' : 'var(--text-muted)'
            }}
            onClick={() => {
              setIsRegister(false);
              setErrorMessage(null);
            }}
          >
            {lang === 'ar_darija' ? 'تسجيل الدخول' : 'Connexion'}
          </button>
        </div>

        {/* Error Message Alert */}
        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            color: '#EF4444',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">{lang === 'ar_darija' ? 'الاسم' : 'Nom'}</label>
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
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="houssam@exemple.ma"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{lang === 'ar_darija' ? 'كلمة السر' : 'Mot de passe'}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '1rem', fontWeight: 800 }}
          >
            {isLoading ? '...' : isRegister ? (lang === 'ar_darija' ? 'إنشاء حسابي' : 'Créer mon compte') : (lang === 'ar_darija' ? 'الدخول' : 'Se Connecter')}
          </button>
        </form>

        <div style={{ margin: '1.25rem 0', textAlign: 'center', position: 'relative' }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />
          <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#0F172A', padding: '0 8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            OU
          </span>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
          onClick={handleQuickDemoLogin}
        >
          ⚡ Connexion Démo Rapide
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1.25rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          <ShieldCheck size={14} color="#10B981" /> {isSupabaseConfigured ? 'Secured by Supabase Cloud & PostgreSQL RLS' : 'Connexion sécurisée en dirhams marocains (DH)'}
        </div>
      </div>
    </div>
  );
};
