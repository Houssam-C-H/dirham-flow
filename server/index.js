/**
 * 🇲🇦 DirhamFlow Backend Action API Server (Express.js Example)
 * Run with: node server/index.js
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// In-memory user state database baseline
let mockUserState = {
  onboardingCompleted: true,
  user: {
    fullName: "Mehdi Benali",
    email: "mehdi@dirhamflow.ma",
    language: "fr"
  },
  accounts: [
    {
      id: "acc_cash",
      name: "💵 Espèces (Cash Wallet)",
      type: "cash",
      balance: 850,
      openingBalance: 850,
      openingBalanceDate: "2026-08-23",
      institutionId: "inst_cash",
      color: "#10B981",
      icon: "Banknote",
      isDefault: true
    },
    {
      id: "acc_attijari",
      name: "🏦 Attijariwafa Bank",
      type: "bank",
      balance: 6240,
      openingBalance: 6240,
      openingBalanceDate: "2026-08-23",
      institutionId: "inst_attijari",
      bankName: "Attijariwafa Bank",
      accountNumber: "•••• 4829",
      color: "#F59E0B",
      icon: "Building2"
    }
  ],
  transactions: [],
  linkedTransfers: [],
  categories: [],
  budgets: [],
  bills: [],
  recurring: [],
  debts: [],
  salaryConfig: {
    monthlySalary: 8000,
    payDay: 25,
    employmentType: "monthly_salary",
    cashSafetyBuffer: 2000,
    nextPayDate: "2026-08-25",
    allocations: {}
  },
  goals: [],
  preferences: {
    currencyDisplay: "DH",
    language: "fr",
    theme: "dark",
    cashSafetyBuffer: 2000
  },
  seasonalConfig: {
    activeMode: "standard",
    ramadanBudget: 3500,
    eidBudget: 3000
  }
};

// 1. Sync / Hydrate State Action Endpoint
app.post('/api/v1/state/sync', (req, res) => {
  console.log('📡 Action POST /api/v1/state/sync requested at', req.body.timestamp);
  res.json({
    success: true,
    data: mockUserState,
    message: "State hydrated successfully from API"
  });
});

// 2. Save / Persist State Action Endpoint
app.post('/api/v1/state/save', (req, res) => {
  console.log('💾 Action POST /api/v1/state/save received');
  mockUserState = { ...mockUserState, ...req.body };
  res.json({
    success: true,
    data: mockUserState,
    message: "State persisted successfully"
  });
});

// 3. Reset State Action Endpoint
app.post('/api/v1/state/reset', (req, res) => {
  console.log('🔄 Action POST /api/v1/state/reset requested');
  res.json({
    success: true,
    data: mockUserState,
    message: "State reset successfully"
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 DirhamFlow Action API Server running on http://localhost:${PORT}/api/v1`);
});
