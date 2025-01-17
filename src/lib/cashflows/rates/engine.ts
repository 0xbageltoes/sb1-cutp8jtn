import { DayCountMethod } from '../types';
import { RateCurve, ForwardRates, RateIndex } from './types';
import { calculateYearFraction } from '../utils';

export class RateEngine {
  private curves: Map<string, RateCurve> = new Map();
  private forwardRates: Map<string, ForwardRates> = new Map();
  private indices: Map<string, RateIndex> = new Map();

  public addCurve(curve: RateCurve): void {
    this.curves.set(curve.name, curve);
  }

  public addForwardRates(rates: ForwardRates): void {
    this.forwardRates.set(`${rates.index}_${rates.tenor}`, rates);
  }

  public addIndex(index: RateIndex): void {
    this.indices.set(index.name, index);
  }

  public getForwardRate(
    index: string,
    tenor: string,
    date: Date,
    fallbackRate?: number
  ): number {
    const key = `${index}_${tenor}`;
    const rates = this.forwardRates.get(key);
    
    if (!rates) {
      if (fallbackRate !== undefined) {
        return fallbackRate;
      }
      throw new Error(`No forward rates found for ${key}`);
    }

    return this.interpolateRate(date, rates.dates, rates.rates);
  }

  public getDiscountFactor(
    curveName: string,
    date: Date,
    referenceDate: Date = new Date()
  ): number {
    const curve = this.curves.get(curveName);
    if (!curve) {
      throw new Error(`Curve ${curveName} not found`);
    }

    const yearFraction = calculateYearFraction(
      referenceDate,
      date,
      curve.dayCount
    );

    const rate = this.interpolateRate(date, curve.dates, curve.rates);
    return Math.exp(-rate * yearFraction);
  }

  public getFixingDate(
    index: string,
    accrualStartDate: Date
  ): Date {
    const indexConfig = this.indices.get(index);
    if (!indexConfig) {
      throw new Error(`Index ${index} not found`);
    }

    // Adjust for fixing days
    const fixingDate = new Date(accrualStartDate);
    fixingDate.setDate(fixingDate.getDate() - indexConfig.fixingDays);
    return fixingDate;
  }

  private interpolateRate(
    date: Date,
    dates: Date[],
    rates: number[]
  ): number {
    const t = date.getTime();

    // Find bracketing dates
    const i = dates.findIndex(d => d.getTime() > t);
    
    if (i === -1) {
      return rates[rates.length - 1]; // Use last rate if beyond curve
    }
    if (i === 0) {
      return rates[0]; // Use first rate if before curve
    }

    // Linear interpolation
    const t1 = dates[i - 1].getTime();
    const t2 = dates[i].getTime();
    const r1 = rates[i - 1];
    const r2 = rates[i];
    
    return r1 + (r2 - r1) * (t - t1) / (t2 - t1);
  }
}