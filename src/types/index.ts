export interface Transaction {
  id?: string;
  TransactionDT: number;
  TransactionAmt: number;
  ProductCD: string;
  card1: number;
  card2: number;
  card3: number;
  card4: string;
  card5: number;
  card6: string;
  addr1: number;
  addr2: number;
  dist1: number;
  dist2: number;
  P_emaildomain: string;
  R_emaildomain: string;
  C1: number;
  C2: number;
  C3: number;
  C4: number;
  C5: number;
  C6: number;
  C7: number;
  C8: number;
  C9: number;
  C10: number;
  C11: number;
  C12: number;
  C13: number;
  C14: number;
  D1: number;
  D2: number;
  D3: number;
  D4: number;
  D5: number;
  D10: number;
  D15: number;
  M1: string;
  M2: string;
  M3: string;
  M4: string;
  M5: string;
  M6: string;
  M7: string;
  M8: string;
  M9: string;
  V1: number;
  V2: number;
  V3: number;
  V4: number;
  V5: number;
  V6: number;
  V7: number;
  V8: number;
  V9: number;
  V10: number;
  V11: number;
  V12: number;
  V13: number;
  V14: number;
  V15: number;
  V16: number;
  V17: number;
  V18: number;
  V19: number;
  V20: number;
}

export interface PredictionResult {
  id?: string;
  transaction: Transaction;
  prediction: {
    label: 'fraud' | 'legitimate';
    probability: number;
    fraud_score: number;
  };
  timestamp: string;
  status: 'success' | 'error';
}

export interface RecentTransactionBackend {
  label: 'fraud' | 'legitimate';
  fraud_score: number;
  probability: number;
  timestamp: string;
  input: Partial<Transaction>;
}

export interface DashboardStats {
  totalTransactions: number;
  fraudCount: number;
  legitimateCount: number;
  fraudRate: number;
  avgFraudScore?: number;
  recentTransactions: RecentTransactionBackend[];
  monthlyTrends?: { month: string; fraud: number; legitimate: number }[];
  dayTrends?: { day: string; fraud: number; legitimate: number }[];
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: 'success' | 'error';
}