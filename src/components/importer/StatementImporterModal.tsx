import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { detectCategoryFromMerchant } from '../../utils/merchantRules';
import { X, FileText } from 'lucide-react';
import type { StatementImportRow } from '../../types/finance';

interface StatementImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_CSV = `2026-08-18;CARREFOUR MAROC CASABLANCA;-420.00
2026-08-19;STATION TOTAL ENERGIES ESSENCE;-250.00
2026-08-20;RECHARGE ORANGE TELECOM;-100.00
2026-08-21;VIREMENT SALAIRE EMPLOYEUR;8000.00
2026-08-22;COMMANDE CAREEM TAXI;-45.00`;

export const StatementImporterModal: React.FC<StatementImporterModalProps> = ({ isOpen, onClose }) => {
  const { state, importTransactions } = useFinance();

  const [rawText, setRawText] = useState<string>(SAMPLE_CSV);
  const [parsedRows, setParsedRows] = useState<StatementImportRow[]>([]);
  const [targetAccountId, setTargetAccountId] = useState<string>(
    state.accounts.find(a => a.type === 'bank')?.id || state.accounts[0]?.id || ''
  );
  const [isParsed, setIsParsed] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleParse = () => {
    const lines = rawText.split('\n').filter(l => l.trim().length > 0);
    const rows: StatementImportRow[] = [];

    for (const line of lines) {
      const parts = line.split(/[;,]/);
      if (parts.length >= 3) {
        const date = parts[0].trim();
        const description = parts[1].trim();
        const amountNum = parseFloat(parts[2].trim().replace(/\s/g, ''));

        if (!isNaN(amountNum)) {
          const type = amountNum < 0 ? 'expense' : 'income';
          const absAmount = Math.abs(amountNum);
          const detected = detectCategoryFromMerchant(description);

          rows.push({
            date: date || new Date().toISOString().split('T')[0],
            description,
            amount: absAmount,
            type,
            suggestedCategoryId: detected.categoryId,
            merchantName: description,
            confidence: detected.confidence,
            selected: true
          });
        }
      }
    }

    setParsedRows(rows);
    setIsParsed(true);
  };

  const handleImportSubmit = () => {
    importTransactions(parsedRows, targetAccountId);
    onClose();
  };

  const toggleRowSelection = (idx: number) => {
    setParsedRows(prev => prev.map((r, i) => i === idx ? { ...r, selected: !r.selected } : r));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--color-primary)" /> Import de Relevé Bancaire (CSV / Excel)
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {!isParsed ? (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Collez ci-dessous votre extrait de relevé bancaire (Attijariwafa, CIH, BMCE, Banque Populaire) au format CSV:
            </p>

            <textarea
              className="form-input"
              rows={6}
              style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '1rem' }}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
            />

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleParse}>
              🔍 Analyser et Détecter les Catégories Marocaines
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {parsedRows.filter(r => r.selected).length} sur {parsedRows.length} opération(s) sélectionnée(s)
              </span>

              <button className="btn btn-secondary btn-sm" onClick={() => setIsParsed(false)}>
                Modifier le texte
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Compte bancaire cible</label>
              <select className="form-select" value={targetAccountId} onChange={e => setTargetAccountId(e.target.value)}>
                {state.accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({acc.balance} DH)</option>
                ))}
              </select>
            </div>

            {/* Rows Table */}
            <div style={{
              maxHeight: '280px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              {parsedRows.map((row, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={() => toggleRowSelection(idx)}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{row.description}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {row.date} • <span style={{ color: '#10B981' }}>{row.suggestedCategoryId}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: row.type === 'expense' ? '#EF4444' : '#10B981' }}>
                    {row.type === 'expense' ? '-' : '+'}{row.amount} DH
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                Annuler
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleImportSubmit}>
                Importer {parsedRows.filter(r => r.selected).length} Transaction(s)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
