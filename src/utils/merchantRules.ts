export interface MerchantRule {
  keywords: string[];
  categoryId: string;
  categoryName: string;
  confidence: 'high' | 'medium';
}

export const MOROCCAN_MERCHANT_RULES: MerchantRule[] = [
  {
    keywords: ['CARREFOUR', 'MARJANE', 'BIM', 'ASWAK ASSALAM', 'ACIMA', 'SUPREM', 'LABEL VIE'],
    categoryId: 'groceries',
    categoryName: '🛒 Groceries',
    confidence: 'high'
  },
  {
    keywords: ['TOTAL', 'AFRIQUIA', 'SHELL', 'WINXO', 'PETROM', 'STATION FUEL', 'AUTOROUTE'],
    categoryId: 'fuel',
    categoryName: '⛽ Fuel',
    confidence: 'high'
  },
  {
    keywords: ['ORANGE', 'INWI', 'MAROC TELECOM', 'IAM', 'TELECOM'],
    categoryId: 'phone_internet',
    categoryName: '📱 Téléphone & Internet',
    confidence: 'high'
  },
  {
    keywords: ['REDAL', 'LYDEC', 'RADEEEMA', 'ONEE', 'RADEEJ', 'RAMSA', 'RADEEL'],
    categoryId: 'electricity_water',
    categoryName: '💡 Electricity & Water',
    confidence: 'high'
  },
  {
    keywords: ['CAREEM', 'UBER', 'ONCF', 'CTM', 'TAXI', 'GARA', 'TRAMWAY', 'AL BORAQ'],
    categoryId: 'transport',
    categoryName: '🚕 Transport',
    confidence: 'high'
  },
  {
    keywords: ['MCDONALDS', 'KFC', 'PIZZA HUT', 'CAFE', 'STARBUCKS', 'PAUL', 'PATISSERIE', 'VENEZIA ICE'],
    categoryId: 'cafes_restaurants',
    categoryName: '☕ Cafés & Restaurants',
    confidence: 'high'
  },
  {
    keywords: ['DECATHLON', 'ZARA', 'LC WAIKIKI', 'MARWA', 'MANGO', 'ADIDAS', 'NIKE'],
    categoryId: 'clothing',
    categoryName: '👕 Clothing',
    confidence: 'high'
  },
  {
    keywords: ['PHARMACIE', 'CLINIQUE', 'LABORATOIRE', 'PARAPHARMACIE', 'CHUM'],
    categoryId: 'health',
    categoryName: '💊 Health',
    confidence: 'high'
  }
];

export function detectCategoryFromMerchant(description: string): { categoryId: string; categoryName: string; confidence: 'high' | 'medium' | 'low' } {
  const upper = description.toUpperCase();
  for (const rule of MOROCCAN_MERCHANT_RULES) {
    if (rule.keywords.some(kw => upper.includes(kw))) {
      return { categoryId: rule.categoryId, categoryName: rule.categoryName, confidence: rule.confidence };
    }
  }
  return { categoryId: 'other', categoryName: '📦 Other', confidence: 'low' };
}
