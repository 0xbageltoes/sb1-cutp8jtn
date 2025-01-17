import { CashflowPeriod, DayCountMethod } from '../types';
import { PricingConfig, PricingResult, PricingMethod, RateCurveFunction } from './types';
import { calculateYearFraction } from '../utils';
import { createFlatRateCurve } from '../curves';

export class PricingEngine {
  private cashflows: CashflowPeriod[];
  private config: PricingConfig;
  private dayCount: DayCountMethod;
  private readonly EPSILON = 0.0001; // 0.01 bp for numerical derivatives

  constructor(
    cashflows: CashflowPeriod[],
    config: PricingConfig,
    dayCount: DayCountMethod
  ) {
    this.cashflows = cashflows;
    this.config = config;
    this.dayCount = dayCount;
  }

  public calculate(): PricingResult {
    switch (this.config.method) {
      case 'Price':
        return this.calculateFromPrice();
      case 'Yield':
        return this.calculateFromYield();
      case 'Spread':
        return this.calculateFromSpread();
      case 'DiscountMargin':
        return this.calculateFromDiscountMargin();
      default:
        throw new Error(`Unsupported pricing method: ${this.config.method}`);
    }
  }

  private calculateFromYield(): PricingResult {
    const yield_ = this.config.value / 100; // Convert from percentage
    const price = this.calculatePriceFromYield(yield_);
    
    // Calculate risk metrics
    const modifiedDuration = this.calculateModifiedDuration(yield_);
    const modifiedConvexity = this.calculateModifiedConvexity(yield_);
    const effectiveDuration = this.calculateEffectiveDuration(yield_);
    const effectiveConvexity = this.calculateEffectiveConvexity(yield_);
    const spreadDuration = this.calculateSpreadDuration(yield_);
    
    // Calculate DV01 and convexity measures
    const dv01 = this.calculateDV01(yield_);
    const convexity01 = this.calculateConvexity01(yield_);
    
    // Calculate OAS metrics if discount curve is provided
    const { oasDuration, oasConvexity } = this.calculateOASMetrics(yield_);
    
    return {
      price: price * 100, // Convert to per 100 basis
      yield: this.config.value,
      spread: this.calculateSpread(price),
      discountMargin: this.calculateDiscountMargin(price),
      accrued: this.config.accrued,
      modifiedDuration,
      modifiedConvexity,
      effectiveDuration,
      effectiveConvexity,
      spreadDuration,
      dv01,
      convexity01,
      oasDuration,
      oasConvexity
    };
  }

  private calculatePriceFromYield(yield_: number): number {
    let price = 0;
    const periodsPerYear = this.getPeriodsPerYear();
    const periodicYield = yield_ / periodsPerYear;

    this.cashflows.forEach(cf => {
      const timeToPayment = calculateYearFraction(
        this.config.settleDate,
        cf.paymentDate,
        this.dayCount
      );

      const discountFactor = Math.pow(1 + periodicYield, -timeToPayment * periodsPerYear);
      const payment = cf.scheduledPrincipal + cf.netInterest;
      price += payment * discountFactor;
    });

    return price;
  }

  private calculateModifiedDuration(yield_: number): number {
    const h = this.EPSILON;
    const basePrice = this.calculatePriceFromYield(yield_);
    const priceUp = this.calculatePriceFromYield(yield_ + h);
    const priceDown = this.calculatePriceFromYield(yield_ - h);
    
    return -(priceUp - priceDown) / (2 * h * basePrice);
  }

  private calculateModifiedConvexity(yield_: number): number {
    const h = this.EPSILON;
    const basePrice = this.calculatePriceFromYield(yield_);
    const priceUp = this.calculatePriceFromYield(yield_ + h);
    const priceDown = this.calculatePriceFromYield(yield_ - h);
    
    return (priceUp + priceDown - 2 * basePrice) / (Math.pow(h, 2) * basePrice);
  }

  private calculateEffectiveDuration(yield_: number): number {
    const h = this.EPSILON;
    const basePrice = this.calculatePriceFromYield(yield_);
    const priceUp = this.calculatePriceWithRateShift(h);
    const priceDown = this.calculatePriceWithRateShift(-h);
    
    return -(priceUp - priceDown) / (2 * h * basePrice);
  }

  private calculateEffectiveConvexity(yield_: number): number {
    const h = this.EPSILON;
    const basePrice = this.calculatePriceFromYield(yield_);
    const priceUp = this.calculatePriceWithRateShift(h);
    const priceDown = this.calculatePriceWithRateShift(-h);
    
    return (priceUp + priceDown - 2 * basePrice) / (Math.pow(h, 2) * basePrice);
  }

  private calculateSpreadDuration(yield_: number): number {
    const h = this.EPSILON;
    const basePrice = this.calculatePriceFromYield(yield_);
    const baseSpread = this.calculateSpread(basePrice);
    
    // Calculate prices with spread shifts
    const priceUp = this.calculatePriceWithSpreadShift(baseSpread + h);
    const priceDown = this.calculatePriceWithSpreadShift(baseSpread - h);
    
    return -(priceUp - priceDown) / (2 * h * basePrice);
  }

  private calculateDV01(yield_: number): number {
    const h = 0.0001; // 1 basis point
    const priceUp = this.calculatePriceFromYield(yield_ + h);
    const priceDown = this.calculatePriceFromYield(yield_ - h);
    
    return (priceDown - priceUp) / 2;
  }

  private calculateConvexity01(yield_: number): number {
    const h = 0.0001; // 1 basis point
    const basePrice = this.calculatePriceFromYield(yield_);
    const priceUp = this.calculatePriceFromYield(yield_ + h);
    const priceDown = this.calculatePriceFromYield(yield_ - h);
    
    return (priceUp + priceDown - 2 * basePrice) / 2;
  }

  private calculateOASMetrics(yield_: number): { 
    oasDuration: number; 
    oasConvexity: number; 
  } {
    if (!this.config.discountCurve) {
      return { oasDuration: 0, oasConvexity: 0 };
    }

    // Store the curve function to ensure type safety
    const discountCurve = this.config.discountCurve;

    // Implement OAS calculations here
    return {
      oasDuration: 0,
      oasConvexity: 0
    };
  }

  private calculateSpread(price: number): number {
    if (!this.config.baseRateCurve) return 0;
    
    // Store the curve function to ensure type safety
    const baseRateCurve = this.config.baseRateCurve;
    
    // Implement spread calculation using root-finding algorithm
    return 0;
  }

  private calculateDiscountMargin(price: number): number {
    if (!this.config.discountCurve) return 0;
    
    // Store the curve function to ensure type safety
    const discountCurve = this.config.discountCurve;
    
    // Implement discount margin calculation
    return 0;
  }

  private calculatePriceWithRateShift(shift: number): number {
    if (!this.config.baseRateCurve) return this.calculatePriceFromYield(this.config.value / 100);
    
    // Store the curve function to ensure type safety
    const baseRateCurve = this.config.baseRateCurve;
    
    let price = 0;
    this.cashflows.forEach(cf => {
      const timeToPayment = calculateYearFraction(
        this.config.settleDate,
        cf.paymentDate,
        this.dayCount
      );
      
      const baseRate = baseRateCurve(timeToPayment);
      const shiftedRate = baseRate + shift;
      const discountFactor = Math.pow(1 + shiftedRate, -timeToPayment);
      
      const payment = cf.scheduledPrincipal + cf.netInterest;
      price += payment * discountFactor;
    });
    
    return price;
  }

  private calculatePriceWithSpreadShift(spread: number): number {
    if (!this.config.baseRateCurve) return 0;
    
    // Store the curve function to ensure type safety
    const baseRateCurve = this.config.baseRateCurve;
    
    let price = 0;
    this.cashflows.forEach(cf => {
      const timeToPayment = calculateYearFraction(
        this.config.settleDate,
        cf.paymentDate,
        this.dayCount
      );
      
      // Get base rate for the payment date using the local variable
      const baseRate = baseRateCurve(timeToPayment);
      const discountRate = baseRate + spread;
      const discountFactor = Math.pow(1 + discountRate, -timeToPayment);
      
      const payment = cf.scheduledPrincipal + cf.netInterest;
      price += payment * discountFactor;
    });
    
    return price;
  }

  private getPeriodsPerYear(): number {
    switch (this.config.yieldBasis) {
      case 'Annual':
        return 1;
      case 'SemiAnnual':
        return 2;
      case 'Monthly':
        return 12;
      case 'BondEquivalent':
        return 2;
      default:
        return 2;
    }
  }

  private calculateFromPrice(): PricingResult {
    // TODO: Implement price-based calculations
    return this.calculateFromYield();
  }

  private calculateFromSpread(): PricingResult {
    // TODO: Implement spread-based calculations
    return this.calculateFromYield();
  }

  private calculateFromDiscountMargin(): PricingResult {
    // TODO: Implement discount margin-based calculations
    return this.calculateFromYield();
  }
}