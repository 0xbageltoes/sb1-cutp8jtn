export const DEFAULT_TIMING_VECTORS = {
  IMMEDIATE: {
    periods: [0],
    values: [1]
  },
  END_OF_PERIOD: {
    periods: [0],
    values: [0]
  },
  MID_PERIOD: {
    periods: [0],
    values: [0.5]
  },
  GRADUAL: {
    periods: [0, 1, 2],
    values: [0.2, 0.5, 0.3]
  }
} as const;

export const DEFAULT_TIMING_CONFIG = {
  prepaymentTiming: DEFAULT_TIMING_VECTORS.END_OF_PERIOD,
  defaultTiming: DEFAULT_TIMING_VECTORS.MID_PERIOD,
  recoveryLag: 12, // 12 months
  recoveryTiming: DEFAULT_TIMING_VECTORS.GRADUAL,
  liquidationTiming: DEFAULT_TIMING_VECTORS.END_OF_PERIOD
} as const;