import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, CreditCard, Mail, MapPin, Calendar } from 'lucide-react';
import FraudBadge from '../components/UI/FraudBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { PredictionResult } from '../types';
import { formatCurrency, formatDateTime } from '../utils/validation';

const TransactionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For demo purposes, we'll create a mock transaction
    const mockTransaction: PredictionResult = {
      id: id,
      transaction: {
        TransactionDT: 86400,
        TransactionAmt: 1250.75,
        ProductCD: 'W',
        card1: 13553,
        card2: 404.0,
        card3: 150.0,
        card4: 'discover',
        card5: 142.0,
        card6: 'credit',
        addr1: 315.0,
        addr2: 87.0,
        dist1: 19.0,
        dist2: 287.0,
        P_emaildomain: 'gmail.com',
        R_emaildomain: 'yahoo.com',
        C1: 1.0, C2: 1.0, C3: 0.0, C4: 0.0, C5: 0.0, C6: 1.0, C7: 0.0, C8: 0.0, C9: 1.0, C10: 0.0, C11: 1.0, C12: 0.0, C13: 1.0, C14: 1.0,
        D1: 14.0, D2: 14.0, D3: 14.0, D4: 14.0, D5: 14.0, D10: 14.0, D15: 14.0,
        M1: 'T', M2: 'T', M3: 'T', M4: 'M0', M5: 'F', M6: 'F', M7: 'F', M8: 'F', M9: 'F',
        V1: 1.0, V2: 1.0, V3: 1.0, V4: 1.0, V5: 1.0, V6: 1.0, V7: 1.0, V8: 1.0, V9: 1.0, V10: 1.0,
        V11: 1.0, V12: 1.0, V13: 1.0, V14: 1.0, V15: 1.0, V16: 1.0, V17: 1.0, V18: 1.0, V19: 1.0, V20: 1.0
      },
      prediction: {
        label: Math.random() > 0.5 ? 'fraud' : 'legitimate',
        probability: 0.78,
        fraud_score: 0.78
      },
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    setTimeout(() => {
      setTransaction(mockTransaction);
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction Not Found</h2>
        <p className="text-gray-600 mb-6">The requested transaction could not be found.</p>
        <Link
          to="/"
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const riskFactors = [
    {
      name: 'Transaction Amount',
      value: formatCurrency(transaction.transaction.TransactionAmt),
      risk: transaction.transaction.TransactionAmt > 1000 ? 'high' : 'low',
      description: transaction.transaction.TransactionAmt > 1000 ? 'Large transaction amount' : 'Normal transaction amount'
    },
    {
      name: 'Email Domain Match',
      value: transaction.transaction.P_emaildomain === transaction.transaction.R_emaildomain ? 'Same' : 'Different',
      risk: transaction.transaction.P_emaildomain !== transaction.transaction.R_emaildomain ? 'medium' : 'low',
      description: transaction.transaction.P_emaildomain !== transaction.transaction.R_emaildomain ? 'Different email domains may indicate risk' : 'Same email domains reduce risk'
    },
    {
      name: 'Card Type',
      value: transaction.transaction.card4,
      risk: 'low',
      description: 'Standard card type'
    },
    {
      name: 'Product Category',
      value: transaction.transaction.ProductCD,
      risk: transaction.transaction.ProductCD === 'C' ? 'medium' : 'low',
      description: transaction.transaction.ProductCD === 'C' ? 'Cash-out transactions have higher risk' : 'Standard product category'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/"
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
          <p className="text-gray-600">Transaction ID: #{transaction.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fraud Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Fraud Analysis</h2>
            <div className="flex items-center justify-between mb-6">
              <FraudBadge
                label={transaction.prediction.label}
                probability={transaction.prediction.probability}
                size="lg"
              />
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {(transaction.prediction.fraud_score * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Fraud Score</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                {transaction.prediction.label === 'fraud'
                  ? 'This transaction has been flagged as potentially fraudulent based on our machine learning model analysis.'
                  : 'This transaction appears to be legitimate based on our fraud detection analysis.'}
              </p>
            </div>
          </div>

          {/* Transaction Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Amount</div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(transaction.transaction.TransactionAmt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Product Code</div>
                    <div className="font-semibold text-gray-900">{transaction.transaction.ProductCD}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Timestamp</div>
                    <div className="font-semibold text-gray-900">
                      {formatDateTime(transaction.timestamp)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Card Type</div>
                    <div className="font-semibold text-gray-900 capitalize">
                      {transaction.transaction.card4} {transaction.transaction.card6}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Mail className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Email Domains</div>
                    <div className="font-semibold text-gray-900">
                      {transaction.transaction.P_emaildomain} → {transaction.transaction.R_emaildomain}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Address Info</div>
                    <div className="font-semibold text-gray-900">
                      Addr1: {transaction.transaction.addr1}, Addr2: {transaction.transaction.addr2}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Data */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Raw Transaction Data</h2>
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-700">
                {JSON.stringify(transaction.transaction, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Risk Factors */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors</h3>
            <div className="space-y-4">
              {riskFactors.map((factor, index) => (
                <div key={index} className="border-l-4 border-gray-200 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{factor.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      factor.risk === 'high' ? 'bg-red-100 text-red-800' :
                      factor.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {factor.risk.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{factor.value}</div>
                  <div className="text-xs text-gray-500">{factor.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Model Version:</span>
                <span className="font-medium">v2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Training Data:</span>
                <span className="font-medium">IEEE-CIS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy:</span>
                <span className="font-medium">94.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">2024-01-15</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                Flag as Fraud
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Mark as Safe
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                Request Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsPage;