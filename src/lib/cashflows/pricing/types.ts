export type PricingMethod = 'Price' | 'Yield' | 'Spread' | 'DiscountMargin';
export type YieldBasis = 'BondEquivalent' | 'Annual' | 'SemiAnnual' | 'Monthly';

// Define a type for rate curve functions
export type RateCurveFunction = (timeToMaturity: number) => number;

export interface PricingConfig {
  method: PricingMethod;
  value: number;
  yieldBasis: YieldBasis;
  accrued: number;
  settleDate: Date;
  baseRateCurve?: RateCurveFunction;
  discountCurve?: RateCurveFunction;
}

export interface PricingResult {
  price: number;  // per 100
  yield: number;  // %
  spread: number; // bps
  discountMargin: number; // bps
  accrued: number;
  modifiedDuration: number;
  modifiedConvexity: number;
  effectiveDuration: number;
  effectiveConvexity: number;
  spreadDuration: number;
  dv01: number;  // Price change for 1bp yield change
  convexity01: number;  // Second-order price change
  oasDuration: number;  // OAS-based duration
  oasConvexity: number; // OAS-based convexity
}