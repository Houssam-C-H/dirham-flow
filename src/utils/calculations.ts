import type { AffordabilityAssessment, Account } from '../types/finance';
import type { Bill } from '../types/budget';
import { getDaysUntilPayday } from './dates';

/**
 * Calculates total liquid money across Cash and Bank liquid accounts
 */
export function calculateLiquidBalance(accounts: Account[]): number {
  return accounts
    .filter(acc => acc.type === 'cash' || acc.type === 'bank')
    .reduce((sum, acc) => sum + acc.balance, 0);
}

/**
 * Calculates net worth across all accounts (Cash, Bank, Savings, minus Credit card liabilities)
 */
export function calculateNetWorth(accounts: Account[]): number {
  return accounts.reduce((sum, acc) => {
    if (acc.type === 'credit') {
      return sum - acc.balance; // credit card balance is debt
    }
    return sum + acc.balance;
  }, 0);
}

/**
 * Calculates daily available budget based on remaining salary and days until payday.
 */
export function calculateDailyBudget(
  remainingSalary: number,
  payDay: number = 25
): { dailyBudget: number; daysLeft: number } {
  const daysLeft = getDaysUntilPayday(payDay);
  const dailyBudget = Math.max(0, Math.round(remainingSalary / daysLeft));
  return { dailyBudget, daysLeft };
}

/**
 * Advanced 4-Tier Affordability Decision Engine
 */
export function evaluateAffordability(
  itemName: string,
  itemPrice: number,
  accounts: Account[],
  unpaidBills: Bill[],
  reservedBudgetTotal: number,
  savingsTargetCommitments: number,
  cashSafetyBuffer: number = 2000
): AffordabilityAssessment {
  const liquidBalance = calculateLiquidBalance(accounts);
  const upcomingBillsTotal = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

  // Discretionary calculation
  // Discretionary Money = Liquid Money - Mandatory Bills - Reserved Budget - Safety Cushion - Savings Commitments
  const discretionaryMoney = liquidBalance - upcomingBillsTotal - reservedBudgetTotal - cashSafetyBuffer - savingsTargetCommitments;
  const remainingDiscretionaryAfter = discretionaryMoney - itemPrice;

  let tier: AffordabilityAssessment['tier'] = 'affordable';
  let messageFr = '';
  let messageDarija = '';
  const recommendationDetails: string[] = [];

  if (itemPrice <= discretionaryMoney) {
    tier = 'affordable';
    messageFr = `✓ Accessible sans risque! Vous conserverez ${Math.round(remainingDiscretionaryAfter)} DH de marge libre.`;
    messageDarija = `مزيان! تقدر تشريه و غتبقى عندك ${Math.round(remainingDiscretionaryAfter)} DH د الفلوس السايبة.`;
    recommendationDetails.push(`Vos factures à venir (${upcomingBillsTotal} DH) sont sécurisées.`);
    recommendationDetails.push(`Votre coussin de sécurité de ${cashSafetyBuffer} DH reste intact.`);
    recommendationDetails.push(`Vos objectifs d'épargne (${savingsTargetCommitments} DH) sont préservés.`);
  } else if (itemPrice <= discretionaryMoney + savingsTargetCommitments) {
    tier = 'affordable_impacts_goal';
    messageFr = `⚠️ Accessible, mais cela réduira votre apport d'épargne ce mois-ci.`;
    messageDarija = `ممكن تشريه، ولكن غتنقص من التوفير د هاد الشهر.`;
    recommendationDetails.push(`L'achat dépasse votre marge discrétionnaire de ${Math.round(itemPrice - discretionaryMoney)} DH.`);
    recommendationDetails.push(`Vos factures (${upcomingBillsTotal} DH) et votre sécurité (${cashSafetyBuffer} DH) restent protégées.`);
    recommendationDetails.push(`Conseil: Envisagez de reporter de 1 mois pour ne pas freiner vos objectifs.`);
  } else if (itemPrice <= discretionaryMoney + savingsTargetCommitments + cashSafetyBuffer) {
    tier = 'not_recommended';
    messageFr = `🔴 DÉCONSEILLÉ: Cet achat entamera votre coussin de sécurité de ${cashSafetyBuffer} DH.`;
    messageDarija = `ما كننصحوكش: غتقيس الفلوس د الأمان لي مخبي (${cashSafetyBuffer} DH).`;
    recommendationDetails.push(`Vous devrez puiser dans votre réserve minimale d'urgence.`);
    recommendationDetails.push(`Reste en sécurité après achat: ${Math.round(liquidBalance - upcomingBillsTotal - itemPrice)} DH.`);
    recommendationDetails.push(`Risque en cas d'imprévu médical ou véhicule.`);
  } else {
    tier = 'not_affordable';
    messageFr = `⛔ IMPOSSIBLE ACTUELLEMENT: Risque élevé de dépasser vos capacités financières.`;
    messageDarija = `بلاش هاد الشهر! غتزير راسك ف المصاريف و الكريات لي جايين.`;
    recommendationDetails.push(`Vos liquidités actuelles (${liquidBalance} DH) ne couvrent pas vos factures (${upcomingBillsTotal} DH) + cet achat (${itemPrice} DH).`);
    recommendationDetails.push(`Il manque au moins ${Math.round(itemPrice - (liquidBalance - upcomingBillsTotal))} DH.`);
    recommendationDetails.push(`Recommandation: Ajoutez cet achat à vos Objectifs d'Épargne 🎯!`);
  }

  return {
    itemName,
    itemPrice,
    liquidBalance,
    upcomingBillsTotal,
    reservedBudgetTotal,
    cashSafetyBuffer,
    savingsCommitments: savingsTargetCommitments,
    discretionaryMoney: Math.round(discretionaryMoney),
    remainingDiscretionaryAfter: Math.round(remainingDiscretionaryAfter),
    tier,
    messageFr,
    messageDarija,
    recommendationDetails
  };
}
