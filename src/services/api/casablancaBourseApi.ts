export interface CasablancaStockQuote {
  symbol: string;
  companyName: string;
  price: number;
  changePercent: number;
  sector: string;
}

export interface LiveMarketFeedResponse {
  success: boolean;
  source: string;
  timestamp: string;
  stocks: Record<string, CasablancaStockQuote>;
}

// Default fallback prices if network request fails
const FALLBACK_BVC_FEED: Record<string, CasablancaStockQuote> = {
  IAM: { symbol: 'IAM', companyName: 'Maroc Telecom', price: 96.80, changePercent: +1.25, sector: 'Télécommunications' },
  ATW: { symbol: 'ATW', companyName: 'Attijariwafa Bank', price: 512.00, changePercent: +0.78, sector: 'Banques & Services Financiers' },
  BCP: { symbol: 'BCP', companyName: 'Banque Centrale Populaire', price: 305.50, changePercent: -0.45, sector: 'Banques' },
  BOA: { symbol: 'BOA', companyName: 'Bank of Africa (BMCE)', price: 215.00, changePercent: +1.40, sector: 'Banques' },
  ATL: { symbol: 'ATL', companyName: 'AtlantaSanad Assurance', price: 138.00, changePercent: +0.20, sector: 'Assurances' },
  ADH: { symbol: 'ADH', companyName: 'Douja Promotion Addoha', price: 34.50, changePercent: +3.60, sector: 'Immobilier' },
  RDS: { symbol: 'RDS', companyName: 'Résidences Dar Saada', price: 42.10, changePercent: -1.10, sector: 'Immobilier' },
  TGCC: { symbol: 'TGCC', companyName: 'TGCC S.A.', price: 340.00, changePercent: +2.10, sector: 'BTP & Construction' },
  LHM: { symbol: 'LHM', companyName: 'LafargeHolcim Maroc', price: 1950.00, changePercent: +0.50, sector: 'Matériaux de Construction' },
  CMA: { symbol: 'CMA', companyName: 'Ciments du Maroc', price: 1780.00, changePercent: -0.80, sector: 'Matériaux de Construction' }
};

export async function fetchLiveCasablancaQuotes(): Promise<Record<string, CasablancaStockQuote>> {
  try {
    const response = await fetch('/api/stocks', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: LiveMarketFeedResponse = await response.json();
    if (data && data.stocks) {
      return data.stocks;
    }

    return FALLBACK_BVC_FEED;
  } catch (error) {
    console.warn('Live API fetch error, using client market feed fallback:', error);
    return FALLBACK_BVC_FEED;
  }
}
