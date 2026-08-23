import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { X, AlertTriangle, CheckCircle2, ShieldAlert, XCircle, Settings } from 'lucide-react';
import type { AffordabilityAssessment } from '../../types/finance';

interface AffordabilityAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AffordabilityAdvisorModal: React.FC<AffordabilityAdvisorModalProps> = ({ isOpen, onClose }) => {
  const { state, currencyDisplay, evaluateAffordability, updateSafetyBuffer } = useFinance();

  const [itemName, setItemName] = useState<string>('Casque Audio Wireless');
  const [itemPrice, setItemPrice] = useState<string>('1500');
  const [safetyBufferInput, setSafetyBufferInput] = useState<string>(
    (state.preferences.cashSafetyBuffer || 2000).toString()
  );
  const [assessment, setAssessment] = useState<AffordabilityAssessment | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(itemPrice);
    if (isNaN(price) || price <= 0) return;

    const result = evaluateAffordability(itemName || 'Achat envisagé', price);
    setAssessment(result);
  };

  const handleSaveBuffer = () => {
    const num = parseFloat(safetyBufferInput);
    if (!isNaN(num) && num >= 0) {
      updateSafetyBuffer(num);
      setShowSettings(false);
    }
  };

  const getTierHeader = (tier: AffordabilityAssessment['tier']) => {
    switch (tier) {
      case 'affordable':
        return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', icon: CheckCircle2, title: '🟢 ACHAT CONSEILLÉ' };
      case 'affordable_impacts_goal':
        return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', icon: AlertTriangle, title: '⚠️ ACCESSIBLE (AVEC IMPACT ÉPARGNE)' };
      case 'not_recommended':
        return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', icon: ShieldAlert, title: '🔴 ACHAT DÉCONSEILLÉ' };
      case 'not_affordable':
        return { color: '#DC2626', bg: 'rgba(220, 38, 38, 0.2)', icon: XCircle, title: '⛔ IMPOSSIBLE CE MOIS-CI' };
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              🧠
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Puis-je me le permettre ? (Affordability Advisor)</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Moteur d'aide à la décision financière en dirhams</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              title="Configurer le coussin de sécurité"
            >
              <Settings size={18} />
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Safety Buffer Setting Sub-panel */}
        {showSettings && (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              🛡️ Coussin de Sécurité Financière (Cash Buffer)
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Montant minimum que vous refusez de dépenser (réserve d'urgence minimale).
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                className="form-input"
                style={{ width: '160px' }}
                value={safetyBufferInput}
                onChange={e => setSafetyBufferInput(e.target.value)}
              />
              <button className="btn btn-primary btn-sm" onClick={handleSaveBuffer}>Enregistrer (DH)</button>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleEvaluate}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Objet / Projet d'achat</label>
              <input
                type="text"
                placeholder="ex: Casque audio, Nouveau Téléphone, Voyage..."
                required
                className="form-input"
                value={itemName}
                onChange={e => setItemName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Prix (DH)</label>
              <input
                type="number"
                placeholder="1500"
                required
                className="form-input"
                style={{ fontSize: '1.1rem', fontWeight: 700 }}
                value={itemPrice}
                onChange={e => setItemPrice(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '0.75rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            ⚡ Évaluer l'Achat Maintenant
          </button>
        </form>

        {/* Assessment Output Display */}
        {assessment && (() => {
          const tierInfo = getTierHeader(assessment.tier);
          const IconComponent = tierInfo.icon;

          return (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${tierInfo.color}`,
              borderRadius: '16px',
              padding: '1.25rem',
              animation: 'fadeIn 0.25s ease'
            }}>
              {/* Status Header */}
              <div style={{
                background: tierInfo.bg,
                color: tierInfo.color,
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontWeight: 800,
                fontSize: '1rem',
                marginBottom: '1rem'
              }}>
                <IconComponent size={20} />
                {tierInfo.title}
              </div>

              {/* Messages */}
              <p style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                {assessment.messageFr}
              </p>
              <p style={{ fontSize: '1.05rem', fontWeight: 700, color: tierInfo.color, fontFamily: 'Tajawal', marginBottom: '1rem' }}>
                {assessment.messageDarija}
              </p>

              {/* Financial Calculation Breakdown Table */}
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Liquidités totales (Banque + Cash):</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(assessment.liquidBalance, currencyDisplay)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>- Factures à venir:</span>
                  <span style={{ color: '#EF4444' }}>-{formatCurrency(assessment.upcomingBillsTotal, currencyDisplay)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>- Reste du budget réservé:</span>
                  <span style={{ color: '#EF4444' }}>-{formatCurrency(assessment.reservedBudgetTotal, currencyDisplay)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>- Coussin de sécurité (Buffer):</span>
                  <span style={{ color: '#F59E0B' }}>-{formatCurrency(assessment.cashSafetyBuffer, currencyDisplay)}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem' }}>
                  <span>= Solde Discrétionnaire Libre Sûr:</span>
                  <span style={{ color: assessment.discretionaryMoney >= 0 ? '#10B981' : '#EF4444' }}>
                    {formatCurrency(assessment.discretionaryMoney, currencyDisplay)}
                  </span>
                </div>
              </div>

              {/* Bullet Details */}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-main)' }}>Détails de la recommandation:</strong>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {assessment.recommendationDetails.map((det, i) => (
                    <li key={i}>{det}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
