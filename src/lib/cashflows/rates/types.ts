import { DayCountMethod } from '../types';

export interface RateCurve {
  name: string;
  dates: Date[];
  rates: number[];
  dayCount: DayCountMethod;
}

export interface ForwardRates {
  index: string;
  tenor: string;
  dates: Date[];
  rates: number[];
}

export interface RateIndex {
  name: string;
  fixingDays: number;
  tenor: string;
  dayCount: DayCountMethod;
}