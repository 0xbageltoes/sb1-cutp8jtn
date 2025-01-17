import {
  WaterfallConfig,
  Account,
  Trigger,
  Payment,
  PaymentResult,
  WaterfallResult,
  PaymentRecipient,
  ReserveAccountRule
} from './types';

export class WaterfallEngine {
  private config: WaterfallConfig;
  private accounts: Map<string, Account>;
  private triggers: Map<string, Trigger>;
  private periodCashflows: Map<string, number>;
  private reserveRules: Map<string, ReserveAccountRule>;

  constructor(config: WaterfallConfig) {
    this.validateConfig(config);
    this.config = config;
    this.accounts = new Map(config.accounts.map(acc => [acc.name, { ...acc }]));
    this.triggers = new Map(config.triggers.map(trig => [trig.name, { ...trig }]));
    this.periodCashflows = new Map();
    this.reserveRules = new Map(
      config.reserveAccountRules?.map(rule => [rule.accountName, rule]) ?? []
    );
  }

  public processPeriod(
    principalCollections: number,
    interestCollections: number,
    prepaymentCollections: number,
    recoveryCollections: number
  ): WaterfallResult {
    // Reset period cashflows
    this.periodCashflows.clear();
    const payments: PaymentResult[] = [];
    
    // Distribute collections to accounts
    this.distributeCollections({
      principal: principalCollections,
      interest: interestCollections,
      prepayment: prepaymentCollections,
      recovery: recoveryCollections
    });

    // Update trigger states
    this.updateTriggers();

    // Process reserve account rules
    this.processReserveRules(payments);

    // Process payments in priority order
    const sortedPayments = [...this.config.payments].sort((a, b) => a.priority - b.priority);
    
    for (const payment of sortedPayments) {
      if (this.shouldProcessPayment(payment)) {
        const paymentResults = this.processPayment(payment);
        payments.push(...paymentResults);
      }
    }

    // Calculate unallocated funds
    const unallocatedFunds = Array.from(this.accounts.values())
      .reduce((sum, account) => sum + account.balance, 0);

    return {
      payments,
      endingBalances: new Map(
        Array.from(this.accounts.entries()).map(([name, acc]) => [name, acc.balance])
      ),
      triggersState: new Map(
        Array.from(this.triggers.entries()).map(([name, trig]) => [name, trig.isActive])
      ),
      unallocatedFunds
    };
  }

  private distributeCollections(collections: {[type: string]: number}): void {
    // Distribute principal collections
    const principalAccount = this.findAccountByType('Principal');
    if (principalAccount) {
      principalAccount.balance += collections.principal + 
                                collections.prepayment + 
                                collections.recovery;
    }

    // Distribute interest collections
    const interestAccount = this.findAccountByType('Interest');
    if (interestAccount) {
      interestAccount.balance += collections.interest;
    }
  }

  private findAccountByType(type: Account['type']): Account | undefined {
    return Array.from(this.accounts.values()).find(acc => acc.type === type);
  }

  private updateTriggers(): void {
    // Convert iterator to array for ES5 compatibility
    Array.from(this.triggers.values()).forEach(trigger => {
      trigger.isActive = this.evaluateTrigger(trigger);
    });
  }

  private evaluateTrigger(trigger: Trigger): boolean {
    const actualValue = this.calculateTriggerValue(trigger);
    
    switch (trigger.operator) {
      case '>':
        return actualValue > trigger.threshold;
      case '<':
        return actualValue < trigger.threshold;
      case '>=':
        return actualValue >= trigger.threshold;
      case '<=':
        return actualValue <= trigger.threshold;
    }
  }

  private calculateTriggerValue(trigger: Trigger): number {
    switch (trigger.type) {
      case 'OC':
        return this.calculateOCRatio();
      case 'IC':
        return this.calculateICRatio();
      case 'Delinquency':
        return this.calculateDelinquencyRatio();
      case 'Cumulative Loss':
        return this.calculateCumulativeLossRatio();
      default:
        return 0;
    }
  }

  private shouldProcessPayment(payment: Payment): boolean {
    if (!payment.triggerConditions?.length) {
      return true;
    }

    return payment.triggerConditions.every(triggerName => {
      const trigger = this.triggers.get(triggerName);
      return trigger?.isActive;
    });
  }

  private processPayment(payment: Payment): PaymentResult[] {
    switch (payment.type) {
      case 'Sequential':
        return this.processSequentialPayment(payment);
      case 'Pro Rata':
        return this.processProRataPayment(payment);
      case 'Modified Pro Rata':
        return this.processModifiedProRataPayment(payment);
      default:
        return [];
    }
  }

  private processSequentialPayment(payment: Payment): PaymentResult[] {
    const results: PaymentResult[] = [];
    let remainingFunds = this.getTotalAvailableFunds();

    payment.recipients.forEach(recipient => {
      if (remainingFunds <= 0) return;

      const maxAmount = recipient.cap ?? Infinity;
      const minAmount = recipient.floor ?? 0;
      
      let paymentAmount = Math.min(remainingFunds, maxAmount);
      paymentAmount = Math.max(paymentAmount, minAmount);

      if (paymentAmount > 0) {
        const result = this.makePayment(recipient, paymentAmount, payment);
        results.push(result);
        remainingFunds -= paymentAmount;
      }
    });

    return results;
  }

  private processProRataPayment(payment: Payment): PaymentResult[] {
    const results: PaymentResult[] = [];
    const totalFunds = this.getTotalAvailableFunds();
    
    // Calculate total shares
    const totalShares = payment.recipients.reduce(
      (sum, recipient) => sum + (recipient.share ?? 1),
      0
    );

    payment.recipients.forEach(recipient => {
      const share = recipient.share ?? 1;
      const baseAmount = (totalFunds * share) / totalShares;
      
      const maxAmount = recipient.cap ?? Infinity;
      const minAmount = recipient.floor ?? 0;
      
      let paymentAmount = Math.min(baseAmount, maxAmount);
      paymentAmount = Math.max(paymentAmount, minAmount);

      if (paymentAmount > 0) {
        const result = this.makePayment(recipient, paymentAmount, payment);
        results.push(result);
      }
    });

    return results;
  }

  private processModifiedProRataPayment(payment: Payment): PaymentResult[] {
    // Implement modified pro-rata logic with target ratios
    return [];
  }

  private processReserveRules(payments: PaymentResult[]): void {
    // Process reserve account rules in priority order
    const sortedRules = Array.from(this.reserveRules.values())
      .sort((a, b) => a.replenishmentPriority - b.replenishmentPriority);

    sortedRules.forEach(rule => {
      const account = this.accounts.get(rule.accountName);
      if (!account) return;

      // Check if replenishment is needed
      if (account.balance < rule.targetBalance) {
        const shortfall = rule.targetBalance - account.balance;
        const availableFunds = this.getTotalAvailableFunds();
        
        if (availableFunds > 0) {
          const replenishmentAmount = Math.min(shortfall, availableFunds);
          const result = this.makePayment(
            { name: rule.accountName },
            replenishmentAmount,
            { priority: rule.replenishmentPriority, type: 'Sequential', recipients: [] }
          );
          payments.push(result);
        }
      }

      // Check if excess should be released
      if (rule.releaseExcess && account.balance > rule.targetBalance) {
        const excessAmount = account.balance - rule.targetBalance;
        account.balance = rule.targetBalance;
        
        // Redistribute excess to principal/interest accounts
        const principalAccount = this.findAccountByType('Principal');
        if (principalAccount) {
          principalAccount.balance += excessAmount;
        }
      }
    });
  }

  private makePayment(
    recipient: PaymentRecipient,
    amount: number,
    payment: Payment
  ): PaymentResult {
    // Determine source account (Principal first, then Interest)
    let sourceType: Account['type'] = 'Principal';
    let remainingAmount = amount;

    const principalAccount = this.findAccountByType('Principal');
    if (principalAccount && principalAccount.balance > 0) {
      const principalPortion = Math.min(remainingAmount, principalAccount.balance);
      principalAccount.balance -= principalPortion;
      remainingAmount -= principalPortion;
    }

    if (remainingAmount > 0) {
      const interestAccount = this.findAccountByType('Interest');
      if (interestAccount && interestAccount.balance > 0) {
        const interestPortion = Math.min(remainingAmount, interestAccount.balance);
        interestAccount.balance -= interestPortion;
        sourceType = 'Interest';
      }
    }

    // Record payment
    const currentAmount = this.periodCashflows.get(recipient.name) ?? 0;
    this.periodCashflows.set(recipient.name, currentAmount + amount);

    return {
      recipient: recipient.name,
      amount,
      source: sourceType,
      priority: payment.priority,
      type: payment.type
    };
  }

  private getTotalAvailableFunds(): number {
    return Array.from(this.accounts.values())
      .reduce((sum, account) => sum + account.balance, 0);
  }

  private calculateOCRatio(): number {
    // Implement OC ratio calculation
    return 0;
  }

  private calculateICRatio(): number {
    // Implement IC ratio calculation
    return 0;
  }

  private calculateDelinquencyRatio(): number {
    // Implement delinquency ratio calculation
    return 0;
  }

  private calculateCumulativeLossRatio(): number {
    // Implement cumulative loss ratio calculation
    return 0;
  }

  private validateConfig(config: WaterfallConfig): void {
    // Validate accounts
    if (!config.accounts.length) {
      throw new Error('At least one account is required');
    }

    // Validate account names are unique
    const accountNames = new Set(config.accounts.map(a => a.name));
    if (accountNames.size !== config.accounts.length) {
      throw new Error('Account names must be unique');
    }

    // Validate trigger names are unique
    const triggerNames = new Set(config.triggers.map(t => t.name));
    if (triggerNames.size !== config.triggers.length) {
      throw new Error('Trigger names must be unique');
    }

    // Validate payment priorities are unique
    const priorities = new Set(config.payments.map(p => p.priority));
    if (priorities.size !== config.payments.length) {
      throw new Error('Payment priorities must be unique');
    }

    // Validate reserve account rules reference existing accounts
    config.reserveAccountRules?.forEach(rule => {
      if (!accountNames.has(rule.accountName)) {
        throw new Error(`Reserve rule references non-existent account: ${rule.accountName}`);
      }
    });

    // Validate payment recipients
    config.payments.forEach(payment => {
      payment.recipients.forEach(recipient => {
        if (recipient.share !== undefined && (recipient.share <= 0 || recipient.share > 1)) {
          throw new Error('Recipient shares must be between 0 and 1');
        }
        if (recipient.cap !== undefined && recipient.cap < 0) {
          throw new Error('Recipient caps must be non-negative');
        }
        if (recipient.floor !== undefined && recipient.floor < 0) {
          throw new Error('Recipient floors must be non-negative');
        }
         if (recipient.floor !== undefined && 
            recipient.cap !== undefined && 
            recipient.floor > recipient.cap) {
          throw new Error('Recipient floor cannot be greater than cap');
        }
      });
    });
  }
}