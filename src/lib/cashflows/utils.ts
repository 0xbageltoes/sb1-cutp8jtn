import { addMonths, addDays, isWeekend } from 'date-fns';
import { DateConfig, DayCountMethod } from './types';

export function calculateAmortization(
  balance: number, 
  rate: number,
  remainingTerm: number
): { principal: number; interest: number } {
  const monthlyRate = rate / 12;
  const payment = (balance * monthlyRate * Math.pow(1 + monthlyRate, remainingTerm)) / 
                 (Math.pow(1 + monthlyRate, remainingTerm) - 1);
  
  const interest = balance * monthlyRate;
  const principal = payment - interest;

  return { principal, interest };
}

export function calculatePrepayment(
  balance: number,
  rate: number,
  units: 'CPR' | 'SMM' | 'PSA'
): number {
  switch (units) {
    case 'CPR':
      const smm = 1 - Math.pow(1 - rate/100, 1/12);
      return balance * smm;
    case 'SMM':
      return balance * (rate/100);
    case 'PSA':
      // TODO: Implement PSA calculation
      return 0;
    default:
      return 0;
  }
}

export function calculateDefault(
  balance: number,
  rate: number,
  units: 'CDR' | 'MDR'
): number {
  switch (units) {
    case 'CDR':
      const mdr = 1 - Math.pow(1 - rate/100, 1/12);
      return balance * mdr;
    case 'MDR':
      return balance * (rate/100);
    default:
      return 0;
  }
}

export function calculateDateAdjustments(
  date: Date,
  convention: DateConfig['businessDayConvention']
): Date {
  if (convention === 'None' || !isWeekend(date)) return date;

  switch (convention) {
    case 'Following':
      while (isWeekend(date)) {
        date = addDays(date, 1);
      }
      return date;

    case 'ModifiedFollowing': {
      let adjusted = date;
      while (isWeekend(adjusted)) {
        adjusted = addDays(adjusted, 1);
      }
      if (adjusted.getMonth() !== date.getMonth()) {
        adjusted = date;
        while (isWeekend(adjusted)) {
          adjusted = addDays(adjusted, -1);
        }
      }
      return adjusted;
    }

    case 'Previous':
      while (isWeekend(date)) {
        date = addDays(date, -1);
      }
      return date;

    default:
      return date;
  }
}

export function calculateYearFraction(
  startDate: Date,
  endDate: Date,
  dayCount: DayCountMethod
): number {
  switch (dayCount) {
    case '30/360': {
      const d1 = Math.min(30, startDate.getDate());
      const d2 = Math.min(30, endDate.getDate());
      const days = 360 * (endDate.getFullYear() - startDate.getFullYear()) +
                  30 * (endDate.getMonth() - startDate.getMonth()) +
                  (d2 - d1);
      return days / 360;
    }

    case 'ACT/360': {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays / 360;
    }

    case 'ACT/365': {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays / 365;
    }

    case 'ACT/ACT': {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const year = startDate.getFullYear();
      const daysInYear = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
      return diffDays / daysInYear;
    }

    default:
      return 0;
  }
}