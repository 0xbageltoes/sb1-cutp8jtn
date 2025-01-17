export interface TimingVector {
  periods: number[];
  values: number[];
}

export interface TimingConfig {
  prepaymentTiming: TimingVector;
  defaultTiming: TimingVector;
  recoveryLag: number;
  recoveryTiming: TimingVector;
  liquidationTiming: TimingVector;
}

export interface TimingResult {
  prepaymentFactor: number;
  defaultFactor: number;
  recoveryFactor: number;
  liquidationFactor: number;
}