import React from 'react';
import { NetWorthCard } from '../components/dashboard/NetWorthCard';
import { SalaryBanner } from '../components/dashboard/SalaryBanner';
import { QuickDarijaBanner } from '../components/dashboard/QuickDarijaBanner';
import { TransactionList } from '../components/transactions/TransactionList';

interface DashboardPageProps {
  onOpenAddTransaction: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenAddTransaction }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <SalaryBanner />
      <NetWorthCard />
      <QuickDarijaBanner />
      <TransactionList onOpenAddModal={onOpenAddTransaction} />
    </div>
  );
};
