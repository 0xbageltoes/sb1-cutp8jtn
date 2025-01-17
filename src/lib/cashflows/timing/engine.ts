import { TimingConfig, TimingVector, TimingResult } from './types';

export class TimingEngine {
  private config: TimingConfig;

  constructor(config: TimingConfig) {
    this.validateConfig(config);
    this.config = config;
  }

  public calculateTimingFactors(period: number): TimingResult {
    return {
      prepaymentFactor: this.calculatePrepaymentFactor(period),
      defaultFactor: this.calculateDefaultFactor(period),
      recoveryFactor: this.calculateRecoveryFactor(period),
      liquidationFactor: this.calculateLiquidationFactor(period)
    };
  }

  private calculatePrepaymentFactor(period: number): number {
    return this.interpolateTiming(period, this.config.prepaymentTiming);
  }

  private calculateDefaultFactor(period: number): number {
    return this.interpolateTiming(period, this.config.defaultTiming);
  }

  private calculateRecoveryFactor(period: number): number {
    if (period < this.config.recoveryLag) {
      return 0;
    }
    return this.interpolateTiming(
      period - this.config.recoveryLag,
      this.config.recoveryTiming
    );
  }

  private calculateLiquidationFactor(period: number): number {
    return this.interpolateTiming(period, this.config.liquidationTiming);
  }

  private interpolateTiming(
    period: number,
    vector: TimingVector
  ): number {
    const { periods, values } = vector;
    
    // Handle edge cases
    if (period <= periods[0]) return values[0];
    if (period >= periods[periods.length - 1]) {
      return values[values.length - 1];
    }

    // Find bracketing periods
    const i = periods.findIndex(p => p > period);
    if (i === -1) return values[values.length - 1];
    if (i === 0) return values[0];

    // Linear interpolation
    const p1 = periods[i - 1];
    const p2 = periods[i];
    const v1 = values[i - 1];
    const v2 = values[i];

    return v1 + (v2 - v1) * (period - p1) / (p2 - p1);
  }

  private validateConfig(config: TimingConfig): void {
    this.validateVector(config.prepaymentTiming, 'prepaymentTiming');
    this.validateVector(config.defaultTiming, 'defaultTiming');
    this.validateVector(config.recoveryTiming, 'recoveryTiming');
    this.validateVector(config.liquidationTiming, 'liquidationTiming');

    if (config.recoveryLag < 0) {
      throw new Error('Recovery lag must be non-negative');
    }
  }

  private validateVector(vector: TimingVector, name: string): void {
    if (vector.periods.length !== vector.values.length) {
      throw new Error(
        `${name}: periods and values arrays must have same length`
      );
    }

    if (vector.periods.length < 1) {
      throw new Error(`${name}: vector must have at least one point`);
    }

    // Check monotonicity
    for (let i = 1; i < vector.periods.length; i++) {
      if (vector.periods[i] <= vector.periods[i - 1]) {
        throw new Error(
          `${name}: periods must be strictly increasing`
        );
      }
    }

    // Check value bounds
    for (const value of vector.values) {
      if (value < 0 || value > 1) {
        throw new Error(
          `${name}: values must be between 0 and 1`
        );
      }
    }
  }
}