import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

export const FinancialCalendarTimeline: React.FC = () => {
  const { state, currencyDisplay, language } = useFinance();
  const { monthlySalary, payDay } = state.salaryConfig;

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth(); // 0-indexed

  const monthNamesFr = ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
  const monthName = monthNamesFr[currentMonth];

  const formatEventDate = (day: number, monthOffset: number = 0) => {
    const targetMonthIdx = (currentMonth + monthOffset) % 12;
    return `${day} ${monthNamesFr[targetMonthIdx]}`;
  };

  interface TimelineEvent {
    date: string;
    dayNumber: number;
    title: string;
    type: 'current' | 'income' | 'bill';
    amount: number;
    icon: string;
    isPaid?: boolean;
  }

  const events: TimelineEvent[] = [];

  // 1. Today Event
  events.push({
    date: `${currentDay} ${monthName}`,
    dayNumber: currentDay,
    title: language === 'ar_darija' ? 'اليوم' : "Aujourd'hui",
    type: 'current',
    amount: 0,
    icon: '📌'
  });

  // 2. Dynamic Salary Payday Event
  if (monthlySalary > 0) {
    const isPaydayPassedThisMonth = currentDay > payDay;
    const salaryMonthOffset = isPaydayPassedThisMonth ? 1 : 0;
    events.push({
      date: formatEventDate(payDay, salaryMonthOffset),
      dayNumber: payDay + (salaryMonthOffset * 31),
      title: language === 'ar_darija' ? `أجر الشهر (${formatCurrency(monthlySalary, currencyDisplay)})` : `Versement Salaire (${formatCurrency(monthlySalary, currencyDisplay)})`,
      type: 'income',
      amount: monthlySalary,
      icon: '💰'
    });
  }

  // 3. Dynamic User Bills from state.bills
  state.bills.forEach(bill => {
    const dueDay = typeof bill.dueDate === 'number' ? bill.dueDate : parseInt(bill.dueDate || '1', 10);
    const isDuePassedThisMonth = currentDay > dueDay;
    const monthOffset = isDuePassedThisMonth ? 1 : 0;

    events.push({
      date: formatEventDate(dueDay, monthOffset),
      dayNumber: dueDay + (monthOffset * 31),
      title: `${bill.name} (${bill.provider || bill.name})`,
      type: 'bill',
      amount: -bill.amount,
      icon: bill.icon || '🏠',
      isPaid: bill.isPaidThisMonth
    });
  });

  // Sort events chronologically by dayNumber
  events.sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <div className="glass-card">
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarIcon size={18} color="var(--color-primary)" /> {language === 'ar_darija' ? 'التقويم المالي وتوقعات الأجر' : 'Calendrier Financier & Anticipation Payday'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {language === 'ar_darija' ? 'ما الذي سيحدث قبل راتبي القادم؟' : '"Que va-t-il se passer avant mon prochain salaire ?"'}
        </p>
      </div>

      {events.length === 1 && (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          {language === 'ar_darija' ? 'لا توجد فواتير أو رواتب مسجلة في التقويم.' : 'Aucune facture ni salaire configuré dans le calendrier.'}
        </div>
      )}

      {/* Timeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {events.map((evt, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.1rem',
              background: evt.type === 'current'
                ? 'rgba(16, 185, 129, 0.12)'
                : evt.type === 'income'
                ? 'rgba(59, 130, 246, 0.1)'
                : evt.isPaid
                ? 'rgba(16, 185, 129, 0.05)'
                : 'rgba(255,255,255,0.02)',
              border: evt.type === 'current'
                ? '1px solid #10B981'
                : evt.isPaid
                ? '1px dashed rgba(16, 185, 129, 0.4)'
                : '1px solid var(--border-color)',
              borderRadius: '12px',
              opacity: evt.isPaid ? 0.75 : 1
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span style={{ fontSize: '1.3rem' }}>{evt.icon}</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{evt.date}</span>
                  {evt.isPaid && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>
                      <CheckCircle2 size={12} /> Payé
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{evt.title}</div>
              </div>
            </div>

            {evt.amount !== 0 && (
              <div style={{
                fontWeight: 700,
                fontSize: '1rem',
                color: evt.amount > 0 ? '#10B981' : evt.isPaid ? 'var(--text-muted)' : '#EF4444'
              }}>
                {evt.amount > 0 ? '+' : ''}{formatCurrency(evt.amount, currencyDisplay)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
