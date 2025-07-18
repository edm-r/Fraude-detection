import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import FraudBadge from '../components/UI/FraudBadge';
import { fraudApi } from '../services/api';
import { PredictionResult } from '../types';
import { parseCSV, exportToCSV } from '../utils/csvParser';
import { formatCurrency, formatDateTime } from '../utils/validation';

const PredictCSVPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [allRows, setAllRows] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setResults([]);

    try {
      const transactions = await parseCSV(selectedFile);
      setAllRows(transactions); // Stocke toutes les lignes
      setPreview(transactions.slice(0, 5)); // Pour l'aperçu
      toast.success(`CSV loaded successfully. ${transactions.length} transactions found.`);
    } catch (error) {
      toast.error('Failed to parse CSV file');
      console.error('CSV parsing error:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please select a CSV file first');
      return;
    }

    setLoading(true);

    try {
      const predictions = await fraudApi.predictCSV(file);
      setResults(predictions);
      toast.success(`Analysis complete! ${predictions.length} transactions processed.`);
    } catch (error) {
      toast.error('Failed to analyze transactions');
      console.error('CSV prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }

    const exportData = results.map(result => ({
      transaction_id: result.id,
      amount: result.transaction.TransactionAmt,
      product_code: result.transaction.ProductCD,
      card_type: result.transaction.card4,
      fraud_label: result.prediction.label,
      fraud_probability: result.prediction.probability,
      fraud_score: result.prediction.fraud_score,
      timestamp: result.timestamp,
    }));

    exportToCSV(exportData, `fraud_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Results exported successfully');
  };

  const fraudCount = results.filter(r => r.prediction.label === 'fraud').length;
  const legitimateCount = results.length - fraudCount;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-3">
          <Upload className="h-8 w-8 text-red-600" />
          <span>Batch Transaction Analysis</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Upload a CSV file to analyze multiple transactions for fraud detection
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upload CSV File</h2>
          {results.length > 0 && (
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Results</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload */}
          <div>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {file ? file.name : 'Choose CSV file'}
              </p>
              <p className="text-sm text-gray-500">
                Click to browse or drag and drop your CSV file here
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {file && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-sm text-gray-500">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Analyze</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* CSV Format Guide */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Format requis du CSV</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>Votre fichier CSV doit inclure les colonnes suivantes :</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>TransactionDT</strong> : Horodatage de la transaction</li>
                <li><strong>TransactionAmt</strong> : Montant de la transaction (€)</li>
                <li><strong>ProductCD</strong> : Code produit</li>
                <li><strong>P_emaildomain</strong> : Email du payeur</li>
                <li><strong>R_emaildomain</strong> : Email du destinataire</li>
                <li><strong>card4</strong> : Type de carte bancaire</li>
                <li><strong>DeviceType</strong> : Type d'appareil utilisé</li>
                <li><strong>DeviceInfo</strong> : Informations sur l'appareil</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                Les autres colonnes du dataset original sont optionnelles. Plus vous fournissez de colonnes, plus la prédiction sera précise.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {preview.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu des données (5 premières lignes)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Horodatage (TransactionDT)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Montant (€)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produit (ProductCD)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email Payeur (P_emaildomain)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email Destinataire (R_emaildomain)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type Carte (card4)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type d'appareil (DeviceType)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Appareil (DeviceInfo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.map((row, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.TransactionDT || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(row.TransactionAmt || 0)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.ProductCD || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.P_emaildomain || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.R_emaildomain || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.card4 || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.DeviceType || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.DeviceInfo || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-gray-900">{results.length}</div>
            <div className="text-sm text-gray-600">Total Analyzed</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{fraudCount}</div>
            <div className="text-sm text-gray-600">Fraud Detected</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{legitimateCount}</div>
            <div className="text-sm text-gray-600">Legitimate</div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Résultats de l'analyse</h3>
          </div>
          <div className="overflow-x-auto" style={{ maxHeight: 400, overflowY: 'auto' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horodatage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant (€)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => {
                  const original = allRows[index] || {};
                  // Montant
                  const amtRaw = original.TransactionAmt;
                  const amount = amtRaw !== undefined && amtRaw !== null && !isNaN(Number(amtRaw))
                    ? formatCurrency(Number(amtRaw))
                    : '-';
                  // Horodatage
                  const dtRaw = original.TransactionDT;
                  let horodatage = '-';
                  if (dtRaw !== undefined && dtRaw !== null && !isNaN(Number(dtRaw))) {
                    const date = new Date(Number(dtRaw) * 1000);
                    horodatage = isNaN(date.getTime()) ? dtRaw.toString() : date.toLocaleString();
                  }
                  return (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{horodatage}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <FraudBadge
                          label={result.prediction.label}
                          probability={result.prediction.probability}
                          size="sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(result.prediction.fraud_score * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(result.timestamp)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictCSVPage;