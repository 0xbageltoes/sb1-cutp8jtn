import { ScenarioConfig, ScenarioType } from './types';
import { ScenarioEngine } from './engine';

export class ScenarioGenerator {
  private maxPeriods: number;

  constructor(maxPeriods: number) {
    this.maxPeriods = maxPeriods;
  }

  public generateStandardScenarios(): Map<string, number[]> {
    const scenarios = new Map<string, number[]>();

    // Base Case
    scenarios.set('Base', this.generateBaseCase());

    // Stress Scenarios
    scenarios.set('High Prepay', this.generateHighPrepayment());
    scenarios.set('High Default', this.generateHighDefault());
    scenarios.set('High Severity', this.generateHighSeverity());
    scenarios.set('Combined Stress', this.generateCombinedStress());

    // Recovery Scenarios
    scenarios.set('Fast Recovery', this.generateFastRecovery());
    scenarios.set('Slow Recovery', this.generateSlowRecovery());

    // Interest Rate Scenarios
    scenarios.set('Rising Rates', this.generateRisingRates());
    scenarios.set('Falling Rates', this.generateFallingRates());

    return scenarios;
  }

  private generateBaseCase(): number[] {
    const config: ScenarioConfig = {
      type: 'CPR',
      initialValue: 8,
      seasonalAdjustments: {
        3: 1.2, // March
        4: 1.3, // April
        5: 1.3, // May
        6: 1.4, // June
        7: 1.3, // July
        8: 1.2, // August
        9: 1.1  // September
      }
    };

    return new ScenarioEngine(config, this.maxPeriods).generateVector();
  }

  private generateHighPrepayment(): number[] {
    const config: ScenarioConfig = {
      type: 'CPR',
      ramps: [{
        startValue: 10,
        endValue: 25,
        rampPeriods: 12,
        holdPeriods: 24
      }],
      seasonalAdjustments: {
        3: 1.3,
        4: 1.4,
        5: 1.4,
        6: 1.5,
        7: 1.4,
        8: 1.3,
        9: 1.2
      }
    };

    return new ScenarioEngine(config, this.maxPeriods).generateVector();
  }

  private generateHighDefault(): number[] {
    const config: ScenarioConfig = {
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
    };

    return new ScenarioEngine(config, this.maxPeriods).generateVector();
  }

  private generateHighSeverity(): number[] {
    const config: ScenarioConfig = {
      type: 'Loss Severity',
      initialValue: 35,
      ramps: [{
        startValue: 35,
        endValue: 60,
        rampPeriods: 18
      }]
    };

    return new ScenarioEngine(config, this.maxPeriods).generateVector();
  }

  private generateCombinedStress(): number[] {
    const config: ScenarioConfig = {
      type: 'CDR',
      ramps: [{
        startValue: 2,
        endValue: 8,
        rampPeriods: 12,
        holdPeriods: 18
      }],
      shock: {
        timing: 24,
        magnitude: 3,
        duration: 6
      },
      conditionalLogic: "if period > 36 and value > 5 then value = value * 0.9"
    };

    return new ScenarioEngine(config, this.maxPeriods).generateVector();
  }

  private generateFastRecovery(): number[] {
    const config: ScenarioConfig = {
      type: 'CDR',
      ramps: [
        {
          startValue: 5,
          endValue: 8,
          rampPeriods: 6,
          holdPeriods: 6
        },
        {
          startValue: 8,
          endValue: 1,
          rampPeriods: 12,
          holdPeriods: 24
        }
      ]
    };

    return new ScenarioEngine(config, this.maxPeriods).generateVector();
  }

  private generateSlowRecovery(): number[] {
    const config: ScenarioConfig = {
      type: 'CDR',
      ramps: [
        {
          startValue: 5,
          endValue: 8,
          rampPeriods: 6,
          holdPeriods: 12
        },
        {
          startValue: 8,
          endValue: 2,
          rampPeriods: 24,
          holdPeriods: 12
        }
      ],
      conditionalLogic: "if period > 48 then value = Math.max(1, value)"
    };

    return new ScenarioEngine(config, this.maxPeriods).generateVector();
  }

  private generateRisingRates(): number[] {
    const config: ScenarioConfig = {
      type: 'Interest Rate',
      initialValue: 3,
      ramps: [
        {
          startValue: 3,
          endValue: 6,
          rampPeriods: 24,
          holdPeriods: 12
        }
      ],
      shock: {
        timing: 30,
        magnitude: 1,
        duration: 3
      }
    };

    return new ScenarioEngine(config, this.maxPeriods).generateVector();
  }

  private generateFallingRates(): number[] {
    const config: ScenarioConfig = {
      type: 'Interest Rate',
      initialValue: 5,
      ramps: [
        {
          startValue: 5,
          endValue: 2,
          rampPeriods: 18,
          holdPeriods: 12
        }
      ],
      shock: {
        timing: 24,
        magnitude: -0.5,
        duration: 3
      }
    };

    return new ScenarioEngine(config, this.maxPeriods).generateVector();
  }
}