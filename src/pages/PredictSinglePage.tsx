import React, { useState } from 'react';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import FraudBadge from '../components/UI/FraudBadge';
import { fraudApi } from '../services/api';
import { Transaction, PredictionResult } from '../types';
import { validateTransaction, formatCurrency } from '../utils/validation';

const PredictSinglePage: React.FC = () => {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    TransactionDT: 86400,
    TransactionAmt: 100.0,
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
    R_emaildomain: 'gmail.com',
    C1: 1.0, C2: 1.0, C3: 0.0, C4: 0.0, C5: 0.0, C6: 1.0, C7: 0.0, C8: 0.0, C9: 1.0, C10: 0.0, C11: 1.0, C12: 0.0, C13: 1.0, C14: 1.0,
    D1: 14.0, D2: 14.0, D3: 14.0, D4: 14.0, D5: 14.0, D10: 14.0, D15: 14.0,
    M1: 'T', M2: 'T', M3: 'T', M4: 'M0', M5: 'F', M6: 'F', M7: 'F', M8: 'F', M9: 'F',
    V1: 1.0, V2: 1.0, V3: 1.0, V4: 1.0, V5: 1.0, V6: 1.0, V7: 1.0, V8: 1.0, V9: 1.0, V10: 1.0,
    V11: 1.0, V12: 1.0, V13: 1.0, V14: 1.0, V15: 1.0, V16: 1.0, V17: 1.0, V18: 1.0, V19: 1.0, V20: 1.0
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateTransaction(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors');
      return;
    }

    setErrors([]);
    setLoading(true);

    try {
      const prediction = await fraudApi.predictTransaction(formData as Transaction);
      setResult(prediction);
      
      if (prediction.prediction.label === 'fraud') {
        toast.error('Fraud detected!');
      } else {
        toast.success('Transaction appears legitimate');
      }
    } catch (error) {
      toast.error('Failed to analyze transaction');
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setErrors([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-3">
          <Shield className="h-8 w-8 text-red-600" />
          <span>Single Transaction Analysis</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Enter transaction details to get real-time fraud detection analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Transaction Details</h2>
          
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Validation Errors</span>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Transaction Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Amount *
                </label>
                <input
                  type="number"
                  name="TransactionAmt"
                  value={formData.TransactionAmt || ''}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="100.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Code *
                </label>
                <select
                  name="ProductCD"
                  value={formData.ProductCD || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="W">W - Withdrawal</option>
                  <option value="C">C - Cash-out</option>
                  <option value="R">R - Retail</option>
                  <option value="S">S - Service</option>
                  <option value="H">H - Home</option>
                </select>
              </div>
            </div>

            {/* Card Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Type
                </label>
                <select
                  name="card4"
                  value={formData.card4 || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="discover">Discover</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="visa">Visa</option>
                  <option value="american express">American Express</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Category
                </label>
                <select
                  name="card6"
                  value={formData.card6 || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="charge card">Charge Card</option>
                </select>
              </div>
            </div>

            {/* Email Domains */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchaser Email Domain
                </label>
                <input
                  type="text"
                  name="P_emaildomain"
                  value={formData.P_emaildomain || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="gmail.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email Domain
                </label>
                <input
                  type="text"
                  name="R_emaildomain"
                  value={formData.R_emaildomain || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="gmail.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Analyze Transaction</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Analysis Results</h2>
          
          {!result ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Submit a transaction to see fraud analysis results</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Fraud Status */}
              <div className="text-center p-6 rounded-lg border-2 border-dashed border-gray-200">
                <div className="mb-4">
                  {result.prediction.label === 'fraud' ? (
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                  ) : (
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  )}
                </div>
                <FraudBadge
                  label={result.prediction.label}
                  probability={result.prediction.probability}
                  size="lg"
                />
              </div>

              {/* Transaction Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Transaction Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <span className="ml-2 font-medium">{formatCurrency(result.transaction.TransactionAmt)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Product:</span>
                    <span className="ml-2 font-medium">{result.transaction.ProductCD}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Card Type:</span>
                    <span className="ml-2 font-medium capitalize">{result.transaction.card4}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fraud Score:</span>
                    <span className="ml-2 font-medium">{(result.prediction.fraud_score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Risk Assessment</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Transaction Amount</span>
                    <span className={`text-sm font-medium ${
                      result.transaction.TransactionAmt > 1000 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {result.transaction.TransactionAmt > 1000 ? 'High Risk' : 'Low Risk'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Email Domain Match</span>
                    <span className={`text-sm font-medium ${
                      result.transaction.P_emaildomain !== result.transaction.R_emaildomain ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {result.transaction.P_emaildomain !== result.transaction.R_emaildomain ? 'Different' : 'Same'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={resetForm}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                Analyze Another Transaction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictSinglePage;