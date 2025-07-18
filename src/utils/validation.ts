import { Transaction } from '../types';

export const validateTransaction = (transaction: Partial<Transaction>): string[] => {
  const errors: string[] = [];

  // Required fields validation
  if (!transaction.TransactionDT || transaction.TransactionDT <= 0) {
    errors.push('Transaction DateTime is required and must be positive');
  }

  if (!transaction.TransactionAmt || transaction.TransactionAmt <= 0) {
    errors.push('Transaction Amount is required and must be positive');
  }

  if (!transaction.ProductCD || transaction.ProductCD.trim() === '') {
    errors.push('Product Code is required');
  }

  if (!transaction.card1 || transaction.card1 <= 0) {
    errors.push('Card1 is required and must be positive');
  }

  // Email domain validation
  if (transaction.P_emaildomain && !isValidEmailDomain(transaction.P_emaildomain)) {
    errors.push('Purchaser email domain format is invalid');
  }

  if (transaction.R_emaildomain && !isValidEmailDomain(transaction.R_emaildomain)) {
    errors.push('Recipient email domain format is invalid');
  }

  return errors;
};

const isValidEmailDomain = (domain: string): boolean => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
  return domainRegex.test(domain);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export const formatDateTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};