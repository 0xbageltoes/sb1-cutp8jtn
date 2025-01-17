export const PRICING_CONSTANTS = {
  EPSILON: 0.0001,  // Used for numerical derivatives
  BASIS_POINT: 0.0001, // 1 bp = 0.01%
  DEFAULT_RECOVERY_LAG: 90, // Days
  MAX_ITERATIONS: 100, // For root-finding algorithms
  CONVERGENCE_THRESHOLD: 1e-10,
  PRICE_PRECISION: 8,
  RATE_PRECISION: 6
} as const;

export const MARKET_CONVENTIONS = {
  US_TREASURY: {
    yieldBasis: 'SemiAnnual' as const,
    dayCount: 'ACT/ACT' as const,
    settlementDays: 1
  },
  US_CORPORATE: {
    yieldBasis: 'SemiAnnual' as const,
    dayCount: '30/360' as const,
    settlementDays: 2
  },
  EURO_GOVERNMENT: {
    yieldBasis: 'Annual' as const,
    dayCount: 'ACT/ACT' as const,
    settlementDays: 2
  }
} as const;