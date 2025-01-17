import { WaterfallConfig } from './types';

export const DEFAULT_WATERFALL_CONFIG: WaterfallConfig = {
  accounts: [
    {
      name: 'Principal Collection Account',
      type: 'Principal',
      balance: 0
    },
    {
      name: 'Interest Collection Account',
      type: 'Interest',
      balance: 0
    },
    {
      name: 'Reserve Account',
      type: 'Reserve',
      balance: 0,
      minimumBalance: 1000000,
      targetBalance: 2000000
    }
  ],
  triggers: [
    {
      name: 'OC Test',
      type: 'OC',
      threshold: 1.25,
      operator: '<',
      value: 0,
      isActive: false
    },
    {
      name: 'IC Test',
      type: 'IC',
      threshold: 1.1,
      operator: '<',
      value: 0,
      isActive: false
    }
  ],
  payments: [
    {
      priority: 1,
      type: 'Sequential',
      recipients: [
        {
          name: 'Senior Fees',
          cap: 100000
        }
      ],
      description: 'Senior Fees Payment'
    },
    {
      priority: 2,
      type: 'Sequential',
      recipients: [
        {
          name: 'Class A Interest'
        }
      ],
      description: 'Class A Interest Payment'
    },
    {
      priority: 3,
      type: 'Sequential',
      recipients: [
        {
          name: 'Class A Principal'
        }
      ],
      description: 'Class A Principal Payment'
    }
  ],
  reserveAccountRules: [
    {
      accountName: 'Reserve Account',
      replenishmentPriority: 1,
      targetBalance: 2000000,
      releaseExcess: true,
      minimumBalance: 1000000
    }
  ]
};