export const DAYS_IN_MONTH = 30;
export const DAYS_IN_YEAR = 360;
export const MONTHS_IN_YEAR = 12;

export const PAYMENT_FREQUENCY = {
  Monthly: 1,
  Quarterly: 3,
  SemiAnnual: 6,
  Annual: 12,
} as const;

export const DEFAULT_SEVERITY = 35; // 35% severity
export const DEFAULT_RECOVERY_LAG = 12; // 12 months
export const DEFAULT_PREPAY_RATE = 0; // 0% CPR
export const DEFAULT_DEFAULT_RATE = 0; // 0% CDR

export const PSA_RAMP_MONTHS = 30; // Standard PSA ramps over 30 months
export const PSA_RAMP_RATE = 0.2; // PSA increases by 0.2% per month during ramp