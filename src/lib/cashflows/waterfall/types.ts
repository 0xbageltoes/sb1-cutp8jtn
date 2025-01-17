export type AccountType = 'Principal' | 'Interest' | 'Reserve' | 'Fees';
export type TriggerType = 'OC' | 'IC' | 'Delinquency' | 'Cumulative Loss';
export type PaymentType = 'Sequential' | 'Pro Rata' | 'Modified Pro Rata';
export type TriggerOperator = '>' | '<' | '>=' | '<=';

export interface Account {
  readonly name: string;
  readonly type: AccountType;
  balance: number;
  readonly minimumBalance?: number;
  readonly maximumBalance?: number;
  readonly releaseExcess?: boolean;
  readonly targetBalance?: number;
}

export interface Trigger {
  readonly name: string;
  readonly type: TriggerType;
  readonly threshold: number;
  readonly operator: TriggerOperator;
  value: number;
  isActive: boolean;
  readonly description?: string;
}

export interface PaymentRecipient {
  readonly name: string;
  readonly share?: number; // For pro-rata distributions
  readonly cap?: number;
  readonly floor?: number;
  readonly targetBalance?: number;
}

export interface Payment {
  readonly priority: number;
  readonly type: PaymentType;
  readonly recipients: readonly PaymentRecipient[];
  readonly triggerConditions?: readonly string[];
  readonly seniorityOverride?: boolean;
  readonly description?: string;
}

export interface ReserveAccountRule {
  readonly accountName: string;
  readonly replenishmentPriority: number;
  readonly targetBalance: number;
  readonly releaseConditions?: readonly string[];
  readonly releaseExcess?: boolean;
  readonly minimumBalance?: number;
}

export interface WaterfallConfig {
  readonly accounts: readonly Account[];
  readonly triggers: readonly Trigger[];
  readonly payments: readonly Payment[];
  readonly reserveAccountRules?: readonly ReserveAccountRule[];
}

export interface PaymentResult {
  recipient: string;
  amount: number;
  source: AccountType;
  priority: number;
  type: PaymentType;
}

export interface WaterfallResult {
  payments: PaymentResult[];
  endingBalances: Map<string, number>;
  triggersState: Map<string, boolean>;
  unallocatedFunds: number;
}