import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Plus, Trash2, X, RefreshCw, Landmark } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { fetchLiveCasablancaQuotes, type CasablancaStockQuote } from '../../services/api/casablancaBourseApi';

export interface PortfolioPosition {
  id: string;
  symbol: string;
  companyName: string;
  quantity: number;
  averageBuyPrice: number;
  sector?: string;
}

const LOCAL_PORTFOLIO_KEY = 'dirhamflow_portfolio_positions_v1';

export const CasablancaPortfolioView: React.FC = () => {
  const { currencyDisplay, state } = useFinance();
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [marketFeed, setMarketFeed] = useState<Record<string, CasablancaStockQuote>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('IAM');
  const [quantityInput, setQuantityInput] = useState<string>('50');
  const [buyPriceInput, setBuyPriceInput] = useState<string>('96.80');

  const isRtl = state.preferences.language === 'ar_darija';

  // Fetch Live Quotes & Portfolio Positions
  const refreshMarketFeedAndPositions = async () => {
    setIsLoading(true);

    // 1. Fetch live stock quotes from API endpoint
    const liveQuotes = await fetchLiveCasablancaQuotes();
    setMarketFeed(liveQuotes);
    setLastRefreshedAt(new Date().toLocaleTimeString());

    // 2. Load portfolio positions from Supabase or LocalStorage
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('portfolio_positions')
            .select('*')
            .eq('user_id', user.id);

          if (!error && data) {
            setPositions(data.map(p => ({
              id: p.id,
              symbol: p.symbol,
              companyName: p.company_name,
              quantity: parseFloat(p.quantity),
              averageBuyPrice: parseFloat(p.average_buy_price),
              sector: p.sector
            })));
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Supabase portfolio load error:', e);
      }
    }

    // Local Storage Fallback
    try {
      const raw = localStorage.getItem(LOCAL_PORTFOLIO_KEY);
      if (raw) {
        setPositions(JSON.parse(raw));
      } else {
        setPositions([]);
        localStorage.setItem(LOCAL_PORTFOLIO_KEY, JSON.stringify([]));
      }
    } catch (e) {
      setPositions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMarketFeedAndPositions();
  }, []);

  const savePositionsState = async (updated: PortfolioPosition[]) => {
    setPositions(updated);
    localStorage.setItem(LOCAL_PORTFOLIO_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          for (const pos of updated) {
            await supabase.from('portfolio_positions').upsert({
              id: pos.id.startsWith('pos_') ? undefined : pos.id,
              user_id: user.id,
              symbol: pos.symbol,
              company_name: pos.companyName,
              quantity: pos.quantity,
              average_buy_price: pos.averageBuyPrice,
              sector: pos.sector,
              updated_at: new Date().toISOString()
            });
          }
        }
      } catch (e) {
        console.error('Supabase portfolio save error:', e);
      }
    }
  };

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantityInput);
    const price = parseFloat(buyPriceInput);

    if (isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) return;

    const stockInfo = marketFeed[selectedSymbol] || {
      symbol: selectedSymbol,
      companyName: selectedSymbol,
      sector: 'Bourse'
    };

    const existingIndex = positions.findIndex(p => p.symbol === selectedSymbol);
    let updated: PortfolioPosition[];

    if (existingIndex >= 0) {
      const existing = positions[existingIndex];
      const newQty = existing.quantity + qty;
      const newAvgPrice = ((existing.quantity * existing.averageBuyPrice) + (qty * price)) / newQty;

      updated = [...positions];
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        averageBuyPrice: Math.round(newAvgPrice * 100) / 100
      };
    } else {
      const newPos: PortfolioPosition = {
        id: `pos_${Date.now()}`,
        symbol: selectedSymbol,
        companyName: stockInfo.companyName,
        quantity: qty,
        averageBuyPrice: price,
        sector: stockInfo.sector
      };
      updated = [...positions, newPos];
    }

    await savePositionsState(updated);
    setIsAddModalOpen(false);
    setQuantityInput('50');
  };

  const handleDeletePosition = async (id: string, symbol: string) => {
    if (window.confirm(`Supprimer la position ${symbol} de votre portefeuille ?`)) {
      const updated = positions.filter(p => p.id !== id);
      await savePositionsState(updated);

      if (isSupabaseConfigured && !id.startsWith('pos_')) {
        try {
          await supabase.from('portfolio_positions').delete().eq('id', id);
        } catch (e) {
          console.error('Delete position error:', e);
        }
      }
    }
  };

  // Calculations using live marketFeed
  const portfolioMetrics = positions.map(pos => {
    const currentPrice = marketFeed[pos.symbol]?.price || pos.averageBuyPrice;
    const currentMarketValue = pos.quantity * currentPrice;
    const investedAmount = pos.quantity * pos.averageBuyPrice;
    const gainLoss = currentMarketValue - investedAmount;
    const gainLossPercent = investedAmount > 0 ? (gainLoss / investedAmount) * 100 : 0;

    return {
      ...pos,
      currentPrice,
      currentMarketValue,
      investedAmount,
      gainLoss,
      gainLossPercent
    };
  });

  const totalPortfolioValue = portfolioMetrics.reduce((sum, p) => sum + p.currentMarketValue, 0);
  const totalInvestedAmount = portfolioMetrics.reduce((sum, p) => sum + p.investedAmount, 0);
  const totalUnrealizedGainLoss = totalPortfolioValue - totalInvestedAmount;
  const totalGainLossPercent = totalInvestedAmount > 0 ? (totalUnrealizedGainLoss / totalInvestedAmount) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.95))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-success">🇲🇦 Casablanca Bourse API (BVC)</span>
              {lastRefreshedAt && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>• Mis à jour: {lastRefreshedAt}</span>
              )}
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
              📈 Portefeuille d'Actions Maroc
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={refreshMarketFeedAndPositions} title="Actualiser le cours du marché">
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /> Actualiser
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)} style={{ fontWeight: 700 }}>
              <Plus size={16} /> + Nouvelle Position
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card">
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Valeur Totale du Portefeuille
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.3rem' }}>
            <bdi>{formatCurrency(totalPortfolioValue, currencyDisplay)}</bdi>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Investi: <bdi>{formatCurrency(totalInvestedAmount, currencyDisplay)}</bdi>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Plus / Moins-Value Latente
          </div>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: totalUnrealizedGainLoss >= 0 ? '#10B981' : '#EF4444',
            marginTop: '0.3rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            {totalUnrealizedGainLoss >= 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
            <span>{totalUnrealizedGainLoss >= 0 ? '+' : ''}<bdi>{formatCurrency(totalUnrealizedGainLoss, currencyDisplay)}</bdi></span>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: totalGainLossPercent >= 0 ? '#10B981' : '#EF4444', marginTop: '0.2rem' }}>
            ({totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Positions Table Card */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Landmark size={18} color="var(--color-primary)" /> Mes Positions en Bourse ({positions.length})
        </h3>

        {positions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>Aucune position d'action enregistrée.</p>
            <p style={{ fontSize: '0.85rem' }}>Cliquez sur "+ Nouvelle Position" pour ajouter vos actions IAM, Attijariwafa, BCP, Addoha...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: isRtl ? 'right' : 'left' }}>
                  <th style={{ padding: '0.75rem' }}>Action / Symbole</th>
                  <th style={{ padding: '0.75rem' }}>Quantité</th>
                  <th style={{ padding: '0.75rem' }}>Prix Achat Moyen</th>
                  <th style={{ padding: '0.75rem' }}>Cours Actuel (BVC)</th>
                  <th style={{ padding: '0.75rem' }}>Valeur Totale</th>
                  <th style={{ padding: '0.75rem' }}>Plus / Moins-Value</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolioMetrics.map(pos => (
                  <tr key={pos.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{pos.symbol}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pos.companyName}</div>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700 }}>
                      {pos.quantity} actions
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <bdi>{formatCurrency(pos.averageBuyPrice, currencyDisplay)}</bdi>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#10B981' }}>
                      <bdi>{formatCurrency(pos.currentPrice, currencyDisplay)}</bdi>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      <bdi>{formatCurrency(pos.currentMarketValue, currencyDisplay)}</bdi>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 800, color: pos.gainLoss >= 0 ? '#10B981' : '#EF4444' }}>
                      <div>{pos.gainLoss >= 0 ? '+' : ''}<bdi>{formatCurrency(pos.gainLoss, currencyDisplay)}</bdi></div>
                      <div style={{ fontSize: '0.78rem' }}>({pos.gainLossPercent >= 0 ? '+' : ''}{pos.gainLossPercent.toFixed(2)}%)</div>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeletePosition(pos.id, pos.symbol)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Supprimer la position"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Position Modal - Rendered via React Portal */}
      {isAddModalOpen && ReactDOM.createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setIsAddModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.75)',
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
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>+ Nouvelle Position Actions BVC</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPosition}>
              <div className="form-group">
                <label className="form-label">Sélectionner l'Action (Bourse de Casablanca)</label>
                <select
                  className="form-select"
                  style={{ background: '#0F172A', color: '#F8FAFC', fontWeight: 700 }}
                  value={selectedSymbol}
                  onChange={e => {
                    const sym = e.target.value;
                    setSelectedSymbol(sym);
                    if (marketFeed[sym]) {
                      setBuyPriceInput(marketFeed[sym].price.toString());
                    }
                  }}
                >
                  {Object.values(marketFeed).map(stock => (
                    <option key={stock.symbol} value={stock.symbol} style={{ background: '#0F172A', color: '#F8FAFC' }}>
                      {stock.symbol} — {stock.companyName} ({stock.price} DH)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nombre d'actions détenues</label>
                <input
                  type="number"
                  required
                  placeholder="50"
                  className="form-input"
                  style={{ fontWeight: 800, fontSize: '1.1rem' }}
                  value={quantityInput}
                  onChange={e => setQuantityInput(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prix d'Achat Moyen (DH / action)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="92.50 DH"
                  className="form-input"
                  style={{ fontWeight: 800, fontSize: '1.1rem' }}
                  value={buyPriceInput}
                  onChange={e => setBuyPriceInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>
                  [ Ajouter au Portefeuille ]
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
