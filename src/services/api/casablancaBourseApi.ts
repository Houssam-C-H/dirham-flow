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
  totalStocks?: number;
  stocks: Record<string, CasablancaStockQuote>;
}

// Full client market fallback dictionary for all BVC listed shares
const FALLBACK_BVC_FEED: Record<string, CasablancaStockQuote> = {
  // Télécommunications & Technologie
  IAM: { symbol: 'IAM', companyName: 'Maroc Telecom', price: 93.50, changePercent: +1.25, sector: 'Télécommunications' },
  HPS: { symbol: 'HPS', companyName: 'HPS (Hightech Payment Systems)', price: 590.00, changePercent: +0.86, sector: 'Technologie & Logiciels' },
  DIS: { symbol: 'DIS', companyName: 'Disway S.A.', price: 685.00, changePercent: +0.44, sector: 'Technologie' },
  S2M: { symbol: 'S2M', companyName: 'Société Maghrébine de Monétique', price: 195.00, changePercent: 0.00, sector: 'Technologie' },
  M2M: { symbol: 'M2M', companyName: 'M2M Group', price: 210.00, changePercent: -0.50, sector: 'Technologie' },

  // Banques & Services Financiers
  ATW: { symbol: 'ATW', companyName: 'Attijariwafa Bank', price: 520.00, changePercent: +0.78, sector: 'Banques' },
  BCP: { symbol: 'BCP', companyName: 'Banque Centrale Populaire', price: 298.00, changePercent: -0.45, sector: 'Banques' },
  BOA: { symbol: 'BOA', companyName: 'Bank of Africa (BMCE Group)', price: 195.00, changePercent: +1.40, sector: 'Banques' },
  CIH: { symbol: 'CIH', companyName: 'CIH Bank', price: 340.00, changePercent: +0.52, sector: 'Banques' },
  CDM: { symbol: 'CDM', companyName: 'Crédit du Maroc', price: 890.00, changePercent: +1.10, sector: 'Banques' },
  BMCI: { symbol: 'BMCI', companyName: 'BMCI (BNP Paribas Group)', price: 545.00, changePercent: -0.18, sector: 'Banques' },
  EQD: { symbol: 'EQD', companyName: 'Equdom', price: 980.00, changePercent: 0.00, sector: 'Services Financiers' },
  SLF: { symbol: 'SLF', companyName: 'Salafin', price: 540.00, changePercent: +0.15, sector: 'Services Financiers' },

  // Assurances
  ATL: { symbol: 'ATL', companyName: 'AtlantaSanad Assurance', price: 135.00, changePercent: +0.20, sector: 'Assurances' },
  WAA: { symbol: 'WAA', companyName: 'Wafa Assurance', price: 4300.00, changePercent: +0.95, sector: 'Assurances' },
  AGMA: { symbol: 'AGMA', companyName: 'AGMA Courtage', price: 6800.00, changePercent: 0.00, sector: 'Assurances' },

  // Immobilier & Construction
  ADH: { symbol: 'ADH', companyName: 'Douja Promotion Addoha', price: 36.20, changePercent: +3.60, sector: 'Immobilier' },
  RDS: { symbol: 'RDS', companyName: 'Résidences Dar Saada', price: 41.50, changePercent: -1.10, sector: 'Immobilier' },
  ALL: { symbol: 'ALL', companyName: 'Alliances Développement Immobilier', price: 248.00, changePercent: +2.30, sector: 'Immobilier' },
  TGCC: { symbol: 'TGCC', companyName: 'TGCC S.A.', price: 345.00, changePercent: +2.10, sector: 'BTP & Construction' },
  LHM: { symbol: 'LHM', companyName: 'LafargeHolcim Maroc', price: 1890.00, changePercent: +0.50, sector: 'Matériaux de Construction' },
  CMA: { symbol: 'CMA', companyName: 'Ciments du Maroc', price: 1750.00, changePercent: -0.80, sector: 'Matériaux de Construction' },
  JET: { symbol: 'JET', companyName: 'Jet Contractors', price: 320.00, changePercent: +1.80, sector: 'BTP & Construction' },
  SNE: { symbol: 'SNE', companyName: 'SNEP (Société Nationale d\'Électrolyse)', price: 520.00, changePercent: -0.38, sector: 'Matériaux & Chimie' },

  // Énergie, Mines & Chimie
  TQA: { symbol: 'TQA', companyName: 'Taqa Morocco', price: 1340.00, changePercent: +0.76, sector: 'Énergie & Électricité' },
  AFG: { symbol: 'AFG', companyName: 'Afriquia Gaz', price: 4050.00, changePercent: 0.00, sector: 'Énergie & Gaz' },
  MNG: { symbol: 'MNG', companyName: 'Managem S.A.', price: 2720.00, changePercent: +3.10, sector: 'Mines & Métaux' },
  SMI: { symbol: 'SMI', companyName: 'Société Métallurgique d\'Imiter', price: 1450.00, changePercent: +1.15, sector: 'Mines' },
  CMT: { symbol: 'CMT', companyName: 'Compagnie Minière de Touissit', price: 1520.00, changePercent: -0.64, sector: 'Mines' },

  // Distribution, Grande Consommation & Agroalimentaire
  LBV: { symbol: 'LBV', companyName: 'Label\'Vie S.A.', price: 4350.00, changePercent: +0.68, sector: 'Distribution & Supermarchés' },
  AUTO: { symbol: 'AUTO', companyName: 'Auto Hall', price: 75.00, changePercent: +0.25, sector: 'Distribution Automobile' },
  LES: { symbol: 'LES', companyName: 'Lesieur Cristal', price: 268.00, changePercent: -0.36, sector: 'Agroalimentaire' },
  COS: { symbol: 'COS', companyName: 'Cosumar S.A.', price: 192.00, changePercent: +0.41, sector: 'Agroalimentaire' },
  OUL: { symbol: 'OUL', companyName: 'Les Eaux Minérales d\'Oulmès', price: 1420.00, changePercent: 0.00, sector: 'Boissons & Agroalimentaire' },
  MUT: { symbol: 'MUT', companyName: 'Mutandis SCA', price: 255.00, changePercent: +1.17, sector: 'Produits de Grande Consommation' },

  // Santé & Pharmaceutique
  AKD: { symbol: 'AKD', companyName: 'Akdital (Groupement de Santé)', price: 995.00, changePercent: +2.45, sector: 'Santé & Cliniques' },
  SOT: { symbol: 'SOT', companyName: 'Sothema (Société Thérapeutique Marocaine)', price: 1020.00, changePercent: +0.19, sector: 'Pharmaceutique' },

  // Transport & Logistique
  MAR: { symbol: 'MAR', companyName: 'Marsa Maroc (SODEP)', price: 410.00, changePercent: +1.39, sector: 'Ports & Logistique' },
  CTM: { symbol: 'CTM', companyName: 'Compagnie de Transports au Maroc', price: 640.00, changePercent: 0.00, sector: 'Transport' }
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
