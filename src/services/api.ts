import axios from 'axios';
import { Transaction, PredictionResult, DashboardStats, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL ;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for loading states
api.interceptors.request.use((config) => {
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export const fraudApi = {
  // Single transaction prediction
  predictTransaction: async (transaction: Transaction): Promise<PredictionResult> => {
    try {
      const response = await api.post('/predict_transaction', transaction);
      return {
        id: Date.now().toString(),
        transaction,
        prediction: {
          label: response.data.label,
          probability: response.data.probability,
          fraud_score: response.data.fraud_score || response.data.probability,
        },
        timestamp: new Date().toISOString(),
        status: 'success',
      };
    } catch (error) {
      throw new Error('Failed to predict transaction');
    }
  },

  // Batch prediction from CSV
  predictBatch: async (transactions: Transaction[]): Promise<PredictionResult[]> => {
    try {
      const response = await api.post('/predict_batch', { transactions });
      return response.data.predictions.map((pred: any, index: number) => ({
        id: `batch_${Date.now()}_${index}`,
        transaction: transactions[index],
        prediction: {
          label: pred.label,
          probability: pred.probability,
          fraud_score: pred.fraud_score || pred.probability,
        },
        timestamp: new Date().toISOString(),
        status: 'success',
      }));
    } catch (error) {
      throw new Error('Failed to process batch predictions');
    }
  },

  // CSV file prediction
  predictCSV: async (file: File): Promise<PredictionResult[]> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_BASE_URL}/predict_csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.predictions.map((pred: any, index: number) => ({
        id: `csv_${Date.now()}_${index}`,
        transaction: pred.input || {}, // ou {} si pas d'input dans la réponse
        prediction: {
          label: pred.label,
          probability: pred.probability,
          fraud_score: pred.fraud_score || pred.probability,
        },
        timestamp: new Date().toISOString(),
        status: 'success',
      }));
    } catch (error) {
      throw new Error('Failed to process CSV predictions');
    }
  },

  // Get dashboard statistics (mock implementation)
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard_stats');
    return response.data;
  },

  // Chatbot
  chat: async (question: string, sessionId?: string): Promise<{answer: string, sessionId: string}> => {
    try {
      const response = await api.post('/chat', { 
        question,
        session_id: sessionId 
      });
      return {
        answer: response.data.answer,
        sessionId: response.data.session_id
      };
    } catch (error) {
      throw new Error('Erreur lors de la communication avec le chatbot');
    }
  },

  // Récupérer l'historique d'une session
  getChatHistory: async (sessionId: string): Promise<any[]> => {
    try {
      const response = await api.get(`/chat/history/${sessionId}`);
      return response.data.history || [];
    } catch (error) {
      throw new Error('Erreur lors de la récupération de l\'historique');
    }
  },

  // Effacer l'historique d'une session
  clearChatHistory: async (sessionId: string): Promise<void> => {
    try {
      await api.delete(`/chat/clear/${sessionId}`);
    } catch (error) {
      throw new Error('Erreur lors de l\'effacement de l\'historique');
    }
  },
};

export default api;