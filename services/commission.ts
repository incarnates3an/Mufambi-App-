/**
 * Commission & Tax Calculation Service
 * Handles all financial calculations for ride commissions and company revenue
 */

import { DriverRank, PaymentMethod, RideTransaction, CommissionConfig, CommissionRate, CompanyWallet } from '../types';

/**
 * MARKET-COMPETITIVE COMMISSION STRUCTURE
 *
 * Competitor Analysis:
 * - Uber/Lyft: 25-30% commission
 * - InDriver: 5-10% commission (very competitive)
 * - Bolt: 15-20% commission
 * - Grab: 20-25% commission
 *
 * Mufambi Strategy: Beat the market while remaining profitable
 * Base rates: 8-15% (lower than major competitors)
 * Tiered by driver rank (reward top performers)
 */

export const DEFAULT_COMMISSION_CONFIG: CommissionConfig = {
  commissionRates: [
    {
      driverRank: DriverRank.ELITE,
      percentage: 8, // Lowest rate for Elite drivers (beats InDriver!)
      description: 'Elite drivers get premium rates - only 8% commission'
    },
    {
      driverRank: DriverRank.GOLD,
      percentage: 10, // Competitive rate for Gold drivers
      description: 'Gold drivers enjoy 10% commission rate'
    },
    {
      driverRank: DriverRank.SILVER,
      percentage: 12, // Standard rate for Silver drivers
      description: 'Silver drivers have 12% commission rate'
    },
    {
      driverRank: DriverRank.BRONZE,
      percentage: 15, // Entry-level rate, still better than Uber/Lyft
      description: 'Bronze drivers start at 15% - still beats major competitors!'
    }
  ],
  processingFees: {
    CASH: 0, // No processing fee for cash
    CARD: 2.9, // Standard card processing fee
    PAYPAL: 3.5, // PayPal processing fee
    ECOCASH: 1.5 // EcoCash mobile money fee
  },
  minimumCommission: 0.50 // Minimum $0.50 commission per ride
};

/**
 * Calculate commission for a ride based on driver rank and fare amount
 */
export const calculateCommission = (
  fareAmount: number,
  driverRank: DriverRank,
  config: CommissionConfig = DEFAULT_COMMISSION_CONFIG
): {
  commissionRate: number;
  commissionAmount: number;
  driverEarnings: number;
} => {
  // Find commission rate for driver's rank
  const rateConfig = config.commissionRates.find(r => r.driverRank === driverRank);
  const commissionRate = rateConfig?.percentage || 12; // Default to 12% if not found

  // Calculate raw commission
  let commissionAmount = (fareAmount * commissionRate) / 100;

  // Apply minimum commission
  if (commissionAmount < config.minimumCommission) {
    commissionAmount = config.minimumCommission;
  }

  // Calculate driver earnings
  const driverEarnings = fareAmount - commissionAmount;

  return {
    commissionRate,
    commissionAmount: Number(commissionAmount.toFixed(2)),
    driverEarnings: Number(driverEarnings.toFixed(2))
  };
};

/**
 * Calculate payment processing fee based on payment method
 */
export const calculateProcessingFee = (
  amount: number,
  paymentMethod: PaymentMethod,
  config: CommissionConfig = DEFAULT_COMMISSION_CONFIG
): number => {
  const feePercentage = config.processingFees[paymentMethod] || 0;
  const processingFee = (amount * feePercentage) / 100;
  return Number(processingFee.toFixed(2));
};

/**
 * Create a complete ride transaction with all financial details
 */
export const createRideTransaction = (
  rideId: string,
  driverId: string,
  driverName: string,
  passengerId: string,
  passengerName: string,
  fareAmount: number,
  driverRank: DriverRank,
  paymentMethod: PaymentMethod,
  config: CommissionConfig = DEFAULT_COMMISSION_CONFIG
): RideTransaction => {
  // Calculate commission
  const { commissionRate, commissionAmount, driverEarnings } = calculateCommission(
    fareAmount,
    driverRank,
    config
  );

  // Calculate processing fee
  const processingFee = calculateProcessingFee(fareAmount, paymentMethod, config);

  // Create transaction
  const transaction: RideTransaction = {
    id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    rideId,
    driverId,
    driverName,
    passengerId,
    passengerName,
    fareAmount,
    commissionRate,
    commissionAmount,
    driverEarnings,
    paymentMethod,
    timestamp: Date.now(),
    status: 'pending',
    processingFee
  };

  return transaction;
};

/**
 * Update company wallet with a new transaction
 */
export const updateCompanyWallet = (
  wallet: CompanyWallet,
  transaction: RideTransaction
): CompanyWallet => {
  const updatedWallet = { ...wallet };

  // Update transaction counts
  updatedWallet.totalTransactions += 1;

  // Update revenue based on transaction status
  if (transaction.status === 'completed') {
    updatedWallet.totalRevenue += transaction.commissionAmount;
    updatedWallet.completedCommission += transaction.commissionAmount;
  } else if (transaction.status === 'pending') {
    updatedWallet.pendingCommission += transaction.commissionAmount;
  } else if (transaction.status === 'refunded') {
    // Deduct from revenue if previously completed
    updatedWallet.totalRevenue = Math.max(0, updatedWallet.totalRevenue - transaction.commissionAmount);
    updatedWallet.completedCommission = Math.max(0, updatedWallet.completedCommission - transaction.commissionAmount);
  }

  // Update timestamp
  updatedWallet.lastUpdated = Date.now();

  return updatedWallet;
};

/**
 * Complete a pending transaction and move commission to completed
 */
export const completeTransaction = (
  wallet: CompanyWallet,
  transaction: RideTransaction
): { wallet: CompanyWallet; transaction: RideTransaction } => {
  const updatedTransaction = {
    ...transaction,
    status: 'completed' as const
  };

  const updatedWallet = {
    ...wallet,
    pendingCommission: Math.max(0, wallet.pendingCommission - transaction.commissionAmount),
    completedCommission: wallet.completedCommission + transaction.commissionAmount,
    totalRevenue: wallet.totalRevenue + transaction.commissionAmount,
    lastUpdated: Date.now()
  };

  return { wallet: updatedWallet, transaction: updatedTransaction };
};

/**
 * Get commission statistics and analytics
 */
export const getCommissionStats = (
  transactions: RideTransaction[],
  wallet: CompanyWallet
): {
  totalRides: number;
  totalRevenue: number;
  averageCommission: number;
  commissionByRank: Record<DriverRank, { count: number; total: number }>;
  commissionByPaymentMethod: Record<PaymentMethod, { count: number; total: number }>;
  recentTransactions: RideTransaction[];
} => {
  const completedTransactions = transactions.filter(t => t.status === 'completed');

  const commissionByRank: Record<DriverRank, { count: number; total: number }> = {
    [DriverRank.ELITE]: { count: 0, total: 0 },
    [DriverRank.GOLD]: { count: 0, total: 0 },
    [DriverRank.SILVER]: { count: 0, total: 0 },
    [DriverRank.BRONZE]: { count: 0, total: 0 }
  };

  const commissionByPaymentMethod: Record<PaymentMethod, { count: number; total: number }> = {
    [PaymentMethod.CASH]: { count: 0, total: 0 },
    [PaymentMethod.CARD]: { count: 0, total: 0 },
    [PaymentMethod.PAYPAL]: { count: 0, total: 0 },
    [PaymentMethod.ECOCASH]: { count: 0, total: 0 }
  };

  // We need to track driver ranks somehow - for now we'll infer from commission rate
  completedTransactions.forEach(txn => {
    // Update payment method stats
    if (!commissionByPaymentMethod[txn.paymentMethod]) {
      commissionByPaymentMethod[txn.paymentMethod] = { count: 0, total: 0 };
    }
    commissionByPaymentMethod[txn.paymentMethod].count += 1;
    commissionByPaymentMethod[txn.paymentMethod].total += txn.commissionAmount;
  });

  const totalRevenue = completedTransactions.reduce((sum, txn) => sum + txn.commissionAmount, 0);
  const averageCommission = completedTransactions.length > 0
    ? totalRevenue / completedTransactions.length
    : 0;

  // Get 10 most recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  return {
    totalRides: completedTransactions.length,
    totalRevenue,
    averageCommission: Number(averageCommission.toFixed(2)),
    commissionByRank,
    commissionByPaymentMethod,
    recentTransactions
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Get commission rate description for a driver rank
 */
export const getCommissionDescription = (
  driverRank: DriverRank,
  config: CommissionConfig = DEFAULT_COMMISSION_CONFIG
): string => {
  const rateConfig = config.commissionRates.find(r => r.driverRank === driverRank);
  return rateConfig?.description || 'Standard commission rate';
};

/**
 * Save company wallet and transactions to localStorage for persistence
 */
export const saveFinancialData = (
  wallet: CompanyWallet,
  transactions: RideTransaction[]
): void => {
  try {
    localStorage.setItem('mufambi_company_wallet', JSON.stringify(wallet));
    localStorage.setItem('mufambi_transactions', JSON.stringify(transactions));
  } catch (error) {
    console.error('Failed to save financial data:', error);
  }
};

/**
 * Load company wallet and transactions from localStorage
 */
export const loadFinancialData = (): {
  wallet: CompanyWallet | null;
  transactions: RideTransaction[];
} => {
  try {
    const walletData = localStorage.getItem('mufambi_company_wallet');
    const transactionsData = localStorage.getItem('mufambi_transactions');

    return {
      wallet: walletData ? JSON.parse(walletData) : null,
      transactions: transactionsData ? JSON.parse(transactionsData) : []
    };
  } catch (error) {
    console.error('Failed to load financial data:', error);
    return { wallet: null, transactions: [] };
  }
};
