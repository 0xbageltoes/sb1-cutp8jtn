export type ScenarioType = 'CPR' | 'CDR' | 'Loss Severity' | 'Delinquency' | 'Interest Rate' | 'Draw Rate';

export interface ScenarioPoint {
  readonly period: number;
  readonly value: number;
}

export interface ScenarioRamp {
  readonly startValue: number;
  readonly endValue: number;
  readonly rampPeriods: number;
  readonly holdPeriods?: number;
}

export interface ScenarioVector {
  readonly type: ScenarioType;
  readonly points: readonly ScenarioPoint[];
}

export interface ScenarioConfig {
  readonly type: ScenarioType;
  readonly initialValue?: number;
  readonly ramps?: readonly ScenarioRamp[];
  readonly vectors?: readonly ScenarioPoint[];
  readonly conditionalLogic?: string;
  readonly seasonalAdjustments?: {readonly [month: number]: number};
  readonly shock?: {
    readonly timing: number;
    readonly magnitude: number;
    readonly duration?: number;
  };
}

export interface ScenarioValidationError {
  readonly field: string;
  readonly message: string;
}

export interface ScenarioValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly ScenarioValidationError[];
}