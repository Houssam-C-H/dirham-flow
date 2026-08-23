import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Plus, Trash2, X, RefreshCw, Landmark, Edit2, Check, Search, CheckCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { fetchLiveCasablancaQuotes, type CasablancaStockQuote } from '../../services/api/casablancaBourseApi';

export interface PortfolioPosition {
  id: string;
  symbol: string;
  companyName: string;
  quantity: number;
  averageBuyPrice: number;
  sector?: string;
  customMarketPrice?: number;
}

const LOCAL_PORTFOLIO_KEY = 'dirhamflow_portfolio_positions_v1';
const LOCAL_CUSTOM_PRICES_KEY = 'dirhamflow_custom_stock_prices_v1';

export const CasablancaPortfolioView: React.FC = () => {
  const { currencyDisplay, state } = useFinance();
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [marketFeed, setMarketFeed] = useState<Record<string, CasablancaStockQuote>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('');

  // Inline Price Editing State
  const [editingPriceSymbol, setEditingPriceSymbol] = useState<string | null>(null);
  const [tempPriceValue, setTempPriceValue] = useState<string>('');

  // Modal & Search State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [stockSearchQuery, setStockSearchQuery] = useState<string>('');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('CIH');
  const [quantityInput, setQuantityInput] = useState<string>('50');
  const [buyPriceInput, setBuyPriceInput] = useState<string>('340.00');

  const isRtl = state.preferences.language === 'ar_darija';

  // Load custom stored market price overrides
  const getCustomPriceOverrides = (): Record<string, number> => {
    try {
      const raw = localStorage.getItem(LOCAL_CUSTOM_PRICES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  };

  const saveCustomPriceOverride = (symbol: string, price: number) => {
    const existing = getCustomPriceOverrides();
    const updated = { ...existing, [symbol]: price };
    localStorage.setItem(LOCAL_CUSTOM_PRICES_KEY, JSON.stringify(updated));
  };

  // Fetch Live Quotes & Portfolio Positions
  const refreshMarketFeedAndPositions = async () => {
    setIsLoading(true);

    // 1. Fetch live stock quotes from API endpoint
    const liveQuotes = await fetchLiveCasablancaQuotes();
    const customOverrides = getCustomPriceOverrides();

    // Apply any user custom price overrides on top of the live feed
    const mergedFeed = { ...liveQuotes };
    Object.keys(customOverrides).forEach(sym => {
      if (mergedFeed[sym]) {
        mergedFeed[sym] = { ...mergedFeed[sym], price: customOverrides[sym] };
      }
    });

    setMarketFeed(mergedFeed);
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

  const handleSaveInlinePrice = (symbol: string) => {
    const num = parseFloat(tempPriceValue);
    if (!isNaN(num) && num > 0) {
      saveCustomPriceOverride(symbol, num);
      setMarketFeed(prev => ({
        ...prev,
        [symbol]: {
          ...prev[symbol],
          price: num
        }
      }));
    }
    setEditingPriceSymbol(null);
  };

  const handleSelectStock = (stock: CasablancaStockQuote) => {
    setSelectedSymbol(stock.symbol);
    setBuyPriceInput(stock.price.toString());
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

  // Filter stocks by search query
  const allStocksList = Object.values(marketFeed);
  const filteredStocks = allStocksList.filter(stock => {
    const q = stockSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      stock.symbol.toLowerCase().includes(q) ||
      stock.companyName.toLowerCase().includes(q) ||
      stock.sector.toLowerCase().includes(q)
    );
  });

  // Calculations using live/custom marketFeed
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

  const selectedStockObj = marketFeed[selectedSymbol];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.95))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-success">🇲🇦 Casablanca Bourse Feed (BVC)</span>
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
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setIsAddModalOpen(true);
                setStockSearchQuery('');
              }}
              style={{ fontWeight: 700, padding: '0.65rem 1.1rem' }}
            >
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
            <p style={{ fontSize: '0.85rem' }}>Cliquez sur "+ Nouvelle Position" pour rechercher vos actions CIH, Maroc Telecom, Attijariwafa, BCP, Addoha...</p>
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

                    {/* Editable Market Price Cell */}
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#10B981' }}>
                      {editingPriceSymbol === pos.symbol ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            step="0.1"
                            className="form-input"
                            style={{ width: '90px', padding: '2px 6px', fontSize: '0.85rem', fontWeight: 700 }}
                            value={tempPriceValue}
                            onChange={e => setTempPriceValue(e.target.value)}
                          />
                          <button className="btn btn-primary btn-sm" style={{ padding: '2px 6px' }} onClick={() => handleSaveInlinePrice(pos.symbol)}>
                            <Check size={12} />
                          </button>
                        </span>
                      ) : (
                        <span
                          style={{ cursor: 'pointer', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                          onClick={() => {
                            setEditingPriceSymbol(pos.symbol);
                            setTempPriceValue(pos.currentPrice.toString());
                          }}
                          title="Cliquer pour ajuster le cours en direct"
                        >
                          <bdi>{formatCurrency(pos.currentPrice, currencyDisplay)}</bdi> <Edit2 size={11} style={{ opacity: 0.8, marginLeft: '4px' }} />
                        </span>
                      )}
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

      {/* Expanded Searchable Add Position Modal Popup */}
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
            background: 'rgba(0, 0, 0, 0.82)',
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
              maxWidth: '680px',
              width: '100%',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#0F172A',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>➕ Ajouter des Actions à votre Portefeuille</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Recherchez parmi les 40+ sociétés cotées à la Bourse de Casablanca (BVC)
                </p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPosition} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflow: 'hidden' }}>
              {/* Search Bar Input */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>🔍 Rechercher une Action / Entreprise</label>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)' }} />
                  <input
                    type="text"
                    placeholder="Tapez CIH, Attijariwafa, Maroc Telecom, Addoha, TGCC, BCP..."
                    className="form-input"
                    style={{ paddingLeft: '2.8rem', fontSize: '0.95rem', fontWeight: 600, background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}
                    value={stockSearchQuery}
                    onChange={e => setStockSearchQuery(e.target.value)}
                  />
                  {stockSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setStockSearchQuery('')}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Stocks Grid */}
              <div style={{
                maxHeight: '230px',
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '0.75rem',
                paddingRight: '4px'
              }}>
                {filteredStocks.map(stock => {
                  const isSelected = selectedSymbol === stock.symbol;
                  return (
                    <div
                      key={stock.symbol}
                      onClick={() => handleSelectStock(stock)}
                      style={{
                        padding: '0.75rem 0.9rem',
                        borderRadius: '14px',
                        border: isSelected ? '2px solid #10B981' : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.35rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isSelected ? '#10B981' : 'var(--text-main)' }}>
                            {stock.symbol}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                            {stock.companyName}
                          </div>
                        </div>
                        {isSelected && <CheckCircle size={16} color="#10B981" />}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                          {stock.sector}
                        </span>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#10B981' }}>
                          {stock.price} DH
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredStocks.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Aucune action trouvée pour "{stockSearchQuery}"
                  </div>
                )}
              </div>

              {/* Selected Stock Info Banner */}
              {selectedStockObj && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '14px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action Sélectionnée</span>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                      {selectedStockObj.symbol} — {selectedStockObj.companyName}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cours du marché</span>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10B981' }}>
                      {selectedStockObj.price} DH
                    </div>
                  </div>
                </div>
              )}

              {/* Form Inputs (Quantity & Average Buy Price) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Nombre d'actions détenues</label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    className="form-input"
                    style={{ fontWeight: 800, fontSize: '1.15rem' }}
                    value={quantityInput}
                    onChange={e => setQuantityInput(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Prix d'Achat Moyen (DH / action)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="340.00 DH"
                    className="form-input"
                    style={{ fontWeight: 800, fontSize: '1.15rem' }}
                    value={buyPriceInput}
                    onChange={e => setBuyPriceInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1.5, fontWeight: 800, padding: '0.8rem' }}>
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
