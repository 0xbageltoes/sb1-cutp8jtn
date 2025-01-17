import { ScenarioConfig, ScenarioType } from './types';

export const SCENARIO_LIMITS: Readonly<Record<ScenarioType, { readonly min: number; readonly max: number }>> = {
  'CPR': { min: 0, max: 100 },
  'CDR': { min: 0, max: 100 },
  'Loss Severity': { min: 0, max: 100 },
  'Delinquency': { min: 0, max: 100 },
  'Interest Rate': { min: -10, max: 50 },
  'Draw Rate': { min: 0, max: 100 }
} as const;

export const DEFAULT_SEASONAL_ADJUSTMENTS: Readonly<{[key: number]: number}> = {
  3: 1.2,  // March
  4: 1.3,  // April
  5: 1.3,  // May
  6: 1.4,  // June
  7: 1.3,  // July
  8: 1.2,  // August
  9: 1.1   // September
} as const;

export const STANDARD_SCENARIOS: Readonly<Record<string, ScenarioConfig>> = {
  BASE: {
    type: 'CPR',
    initialValue: 8,
    seasonalAdjustments: DEFAULT_SEASONAL_ADJUSTMENTS
  },
  HIGH_PREPAY: {
    type: 'CPR',
    ramps: [{
      startValue: 10,
      endValue: 25,
      rampPeriods: 12,
      holdPeriods: 24
    }],
    seasonalAdjustments: DEFAULT_SEASONAL_ADJUSTMENTS
  },
  HIGH_DEFAULT: {
    type: 'CDR',
    ramps: [{
      startValue: 1,
      endValue: 5,
      rampPeriods: 12,
      holdPeriods: 24
    }],
    shock: {
      timing: 36,
      magnitude: 2,
      duration: 6
    }
  }
} as const;