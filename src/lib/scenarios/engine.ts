import { 
  ScenarioConfig, 
  ScenarioType,
  ScenarioValidationResult,
  ScenarioValidationError
} from './types';

export class ScenarioEngine {
  private config: ScenarioConfig;
  private vector: number[] = [];
  private maxPeriods: number;
  private readonly MIN_VALUES: { [K in ScenarioType]: number } = {
    'CPR': 0,
    'CDR': 0,
    'Loss Severity': 0,
    'Delinquency': 0,
    'Interest Rate': -10,
    'Draw Rate': 0
  };
  
  private readonly MAX_VALUES: { [K in ScenarioType]: number } = {
    'CPR': 100,
    'CDR': 100,
    'Loss Severity': 100,
    'Delinquency': 100,
    'Interest Rate': 50,
    'Draw Rate': 100
  };

  constructor(config: ScenarioConfig, maxPeriods: number) {
    const validation = this.validateConfig(config);
    if (!validation.isValid) {
      throw new Error(
        `Invalid scenario configuration: ${validation.errors.map(e => e.message).join(', ')}`
      );
    }
    
    this.config = config;
    this.maxPeriods = maxPeriods;
  }

  public generateVector(): number[] {
    // Start with base vector
    this.initializeBaseVector();

    // Apply ramps
    if (this.config.ramps?.length) {
      this.applyRamps();
    }

    // Apply specific vector points
    if (this.config.vectors?.length) {
      this.applyVectorPoints();
    }

    // Apply seasonal adjustments
    if (this.config.seasonalAdjustments) {
      this.applySeasonalAdjustments();
    }

    // Apply shocks
    if (this.config.shock) {
      this.applyShock();
    }

    // Apply conditional logic
    if (this.config.conditionalLogic) {
      this.applyConditionalLogic();
    }

    // Apply scenario type specific adjustments
    this.vector = this.vector.map(v => this.adjustForScenarioType(v));

    return this.vector;
  }

  private initializeBaseVector(): void {
    const initialValue = this.config.initialValue ?? 0;
    this.vector = Array(this.maxPeriods).fill(initialValue);
  }

  private applyRamps(): void {
    let currentPeriod = 0;

    for (const ramp of this.config.ramps!) {
      // Calculate ramp increment
      const increment = (ramp.endValue - ramp.startValue) / ramp.rampPeriods;
      
      // Apply ramp
      for (let i = 0; i < ramp.rampPeriods && currentPeriod < this.maxPeriods; i++) {
        this.vector[currentPeriod] = ramp.startValue + (increment * i);
        currentPeriod++;
      }

      // Hold value if specified
      if (ramp.holdPeriods) {
        const holdValue = ramp.endValue;
        for (let i = 0; i < ramp.holdPeriods && currentPeriod < this.maxPeriods; i++) {
          this.vector[currentPeriod] = holdValue;
          currentPeriod++;
        }
      }
    }
  }

  private applyVectorPoints(): void {
    for (const point of this.config.vectors!) {
      if (point.period < this.maxPeriods) {
        this.vector[point.period] = point.value;
      }
    }
  }

  private applySeasonalAdjustments(): void {
    for (let i = 0; i < this.maxPeriods; i++) {
      const month = (i % 12) + 1;
      const adjustment = this.config.seasonalAdjustments![month] ?? 1;
      this.vector[i] *= adjustment;
    }
  }

  private applyShock(): void {
    const shock = this.config.shock!;
    const startPeriod = shock.timing;
    const endPeriod = shock.duration ? 
      startPeriod + shock.duration : 
      this.maxPeriods;

    for (let i = startPeriod; i < Math.min(endPeriod, this.maxPeriods); i++) {
      this.vector[i] += shock.magnitude;
    }
  }

  private applyConditionalLogic(): void {
    const logic = this.parseConditionalLogic(this.config.conditionalLogic!);
    
    for (let i = 0; i < this.maxPeriods; i++) {
      this.vector[i] = logic(i, this.vector[i]);
    }
  }

  private parseConditionalLogic(logic: string): (period: number, value: number) => number {
    try {
      // Convert logic string to function
      const fnBody = logic
        .replace(/period/g, 'p')
        .replace(/value/g, 'v')
        .replace(/if/g, 'if(')
        .replace(/then/g, '){')
        .replace(/and/g, '&&')
        .replace(/or/g, '||')
        + '}return v;';

      return new Function('p', 'v', fnBody) as (p: number, v: number) => number;
    } catch (error) {
      console.error('Failed to parse conditional logic:', error);
      return (_, v) => v;
    }
  }

  private adjustForScenarioType(value: number): number {
    const min = this.MIN_VALUES[this.config.type];
    const max = this.MAX_VALUES[this.config.type];
    return Math.max(min, Math.min(max, value));
  }

  private validateConfig(config: ScenarioConfig): ScenarioValidationResult {
    const errors: ScenarioValidationError[] = [];

    // Validate scenario type
    if (!Object.keys(this.MIN_VALUES).includes(config.type)) {
      errors.push({
        field: 'type',
        message: `Invalid scenario type: ${config.type}`
      });
    }

    // Validate initial value
    if (config.initialValue !== undefined) {
      if (config.initialValue < this.MIN_VALUES[config.type] || 
          config.initialValue > this.MAX_VALUES[config.type]) {
        errors.push({
          field: 'initialValue',
          message: `Initial value must be between ${this.MIN_VALUES[config.type]} and ${this.MAX_VALUES[config.type]}`
        });
      }
    }

    // Validate ramps
    if (config.ramps?.length) {
      config.ramps.forEach((ramp, index) => {
        if (ramp.startValue < this.MIN_VALUES[config.type] || 
            ramp.startValue > this.MAX_VALUES[config.type]) {
          errors.push({
            field: `ramps[${index}].startValue`,
            message: `Ramp start value must be between ${this.MIN_VALUES[config.type]} and ${this.MAX_VALUES[config.type]}`
          });
        }
        if (ramp.endValue < this.MIN_VALUES[config.type] || 
            ramp.endValue > this.MAX_VALUES[config.type]) {
          errors.push({
            field: `ramps[${index}].endValue`,
            message: `Ramp end value must be between ${this.MIN_VALUES[config.type]} and ${this.MAX_VALUES[config.type]}`
          });
        }
        if (ramp.rampPeriods <= 0) {
          errors.push({
            field: `ramps[${index}].rampPeriods`,
            message: 'Ramp periods must be positive'
          });
        }
        if (ramp.holdPeriods !== undefined && ramp.holdPeriods < 0) {
          errors.push({
            field: `ramps[${index}].holdPeriods`,
            message: 'Hold periods must be non-negative'
          });
        }
      });
    }

    // Validate vectors
    if (config.vectors?.length) {
      config.vectors.forEach((point, index) => {
        if (point.period < 0) {
          errors.push({
            field: `vectors[${index}].period`,
            message: 'Vector period must be non-negative'
          });
        }
        if (point.value < this.MIN_VALUES[config.type] || 
            point.value > this.MAX_VALUES[config.type]) {
          errors.push({
            field: `vectors[${index}].value`,
            message: `Vector value must be between ${this.MIN_VALUES[config.type]} and ${this.MAX_VALUES[config.type]}`
          });
        }
      });
    }

    // Validate seasonal adjustments
    if (config.seasonalAdjustments) {
      Object.entries(config.seasonalAdjustments).forEach(([month, adjustment]) => {
        const monthNum = parseInt(month);
        if (monthNum < 1 || monthNum > 12) {
          errors.push({
            field: `seasonalAdjustments[${month}]`,
            message: 'Month must be between 1 and 12'
          });
        }
        if (adjustment <= 0) {
          errors.push({
            field: `seasonalAdjustments[${month}]`,
            message: 'Seasonal adjustment must be positive'
          });
        }
      });
    }

    // Validate shock
    if (config.shock) {
      if (config.shock.timing < 0) {
        errors.push({
          field: 'shock.timing',
          message: 'Shock timing must be non-negative'
        });
      }
      if (config.shock.duration !== undefined && config.shock.duration <= 0) {
        errors.push({
          field: 'shock.duration',
          message: 'Shock duration must be positive'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}