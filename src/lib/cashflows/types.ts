export type DayCountMethod = '30/360' | 'ACT/360' | 'ACT/365' | 'ACT/ACT';

export interface DateConfig {
  startDate: Date;
  paymentDay?: number;
  dayCount: DayCountMethod;
  businessDayConvention: 'Following' | 'ModifiedFollowing' | 'Previous' | 'None';
}

export interface LoanCharacteristics {
  currentBalance: number;
  originalBalance: number;
  grossCoupon: number;
  remainingTerm: number;
  originalTerm: number;
  paymentFrequency: 'Monthly' | 'Quarterly' | 'SemiAnnual' | 'Annual';
  nextPaymentDate: Date;
  maturityDate: Date;
  dateConfig: DateConfig;
  isFixedRate: boolean;
  index?: string;
  margin?: number;
}

export interface ScenarioAssumptions {
  prepayUnits: 'CPR' | 'SMM' | 'PSA';
  prepayRate: number;
  defaultUnits: 'CDR' | 'MDR';
  defaultRate: number;
  severity: number;
  recoveryLag: number;
  interestShortfall: boolean;
}

export interface InterestConfig {
  accrualStartDate: Date;
  capitalizeInterest: boolean;
  accruedInterest: number;
  shortfallRecoveryPriority: 'CurrentInterest' | 'ShortfallFirst';
}

export interface CashflowPeriod {
  period: number;
  startDate: Date;
  endDate: Date;
  paymentDate: Date;
  daysInPeriod: number;
  yearFraction: number;
  beginningBalance: number;
  scheduledPrincipal: number; 
  prepayments: number;
  losses: number;
  grossInterest: number;
  netInterest: number;
  interestShortfall: number;
  accumulatedShortfall: number;
  shortfallRecovered: number;
  defaultedInterest: number;
  endingBalance: number;
}

export interface CashflowResult {
  periods: CashflowPeriod[];
  metrics: {
    wal: number;
    duration: number;
    modifiedDuration: number;
  };
}