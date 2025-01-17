import { RateCurveFunction } from './pricing/types';

/**
 * Creates a step function from an array of rates
 * @param rates Array of rates
 * @returns A function that returns the rate for any given time
 */
export function createStepRateCurve(rates: number[]): RateCurveFunction {
  return (timeToMaturity: number) => {
    const index = Math.min(Math.floor(timeToMaturity), rates.length - 1);
    return rates[Math.max(0, index)];
  };
}

/**
 * Creates a linearly interpolated rate curve from an array of rates
 * @param rates Array of rates
 * @returns A function that returns the interpolated rate for any given time
 */
export function createLinearRateCurve(rates: number[]): RateCurveFunction {
  return (timeToMaturity: number) => {
    const index = Math.floor(timeToMaturity);
    
    // Handle boundary cases
    if (index >= rates.length - 1) return rates[rates.length - 1];
    if (index < 0) return rates[0];
    
    // Linear interpolation
    const fraction = timeToMaturity - index;
    return rates[index] * (1 - fraction) + rates[index + 1] * fraction;
  };
}

/**
 * Creates a flat rate curve at a specified rate
 * @param rate Constant rate to return
 * @returns A function that always returns the specified rate
 */
export function createFlatRateCurve(rate: number): RateCurveFunction {
  return () => rate;
}

/**
 * Converts discrete rate points to a rate curve function
 * @param points Array of time/rate pairs
 * @returns A function that returns the interpolated rate for any given time
 */
export function createRateCurveFromPoints(
  points: Array<{ time: number; rate: number }>
): RateCurveFunction {
  const sortedPoints = [...points].sort((a, b) => a.time - b.time);
  
  return (timeToMaturity: number) => {
    // Before first point
    if (timeToMaturity <= sortedPoints[0].time) {
      return sortedPoints[0].rate;
    }
    
    // After last point
    if (timeToMaturity >= sortedPoints[sortedPoints.length - 1].time) {
      return sortedPoints[sortedPoints.length - 1].rate;
    }
    
    // Find surrounding points
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      if (
        timeToMaturity >= sortedPoints[i].time && 
        timeToMaturity <= sortedPoints[i + 1].time
      ) {
        const x1 = sortedPoints[i].time;
        const x2 = sortedPoints[i + 1].time;
        const y1 = sortedPoints[i].rate;
        const y2 = sortedPoints[i + 1].rate;
        
        // Linear interpolation
        return y1 + (y2 - y1) * (timeToMaturity - x1) / (x2 - x1);
      }
    }
    
    // Fallback (should never reach here)
    return sortedPoints[0].rate;
  };
}