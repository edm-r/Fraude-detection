import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, MessageCircle } from 'lucide-react';
import StatCard from '../components/UI/StatCard';
import FraudBadge from '../components/UI/FraudBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { fraudApi } from '../services/api';
import { DashboardStats, RecentTransactionBackend } from '../types';
import { formatCurrency, formatDateTime } from '../utils/validation';
import toast from 'react-hot-toast';

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{from: string, text: string}[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const dashboardStats = await fraudApi.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Charger l'historique du chat quand on ouvre la fenêtre
  useEffect(() => {
    if (showChat && sessionId) {
      loadChatHistory();
    }
  }, [showChat, sessionId]);

  const loadChatHistory = async () => {
    if (!sessionId) return;
    
    try {
      const history = await fraudApi.getChatHistory(sessionId);
      const formattedHistory = history.map((msg: any) => ({
        from: msg.role === 'user' ? 'user' : 'bot',
        text: msg.content
      }));
      setChatMessages(formattedHistory);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  const handleSendChat = async () => {
    if (chatInput.trim() === '') return;
    
    setChatLoading(true);
    const currentQuestion = chatInput;
    setChatInput('');
    
    // Ajouter le message utilisateur immédiatement
    setChatMessages(prev => [...prev, { from: 'user', text: currentQuestion }]);
    
    try {
      const response = await fraudApi.chat(currentQuestion, sessionId || undefined);
      
      // Mettre à jour le sessionId si c'est une nouvelle session
      if (!sessionId) {
        setSessionId(response.sessionId);
      }
      
      // Ajouter la réponse du bot
      setChatMessages(prev => [...prev, { from: 'bot', text: response.answer }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { from: 'bot', text: "Erreur lors de la communication avec le chatbot." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = async () => {
    if (sessionId) {
      try {
        await fraudApi.clearChatHistory(sessionId);
        setChatMessages([]);
        setSessionId(null);
        toast.success('Conversation effacée');
      } catch (error) {
        toast.error('Erreur lors de l\'effacement de la conversation');
      }
    } else {
      setChatMessages([]);
      setSessionId(null);
    }
  };

  const openChat = () => {
    setShowChat(true);
  };

  const closeChat = () => {
    setShowChat(false);
  };

  const pieData = stats ? [
    { name: 'Legitimate', value: stats.legitimateCount, color: '#10b981' },
    { name: 'Fraud', value: stats.fraudCount, color: '#ef4444' },
  ] : [];

  // Monthly Trends dynamique
  const monthlyTrendsData: { name: string; fraud: number; legitimate: number }[] = stats?.monthlyTrends?.map((item) => ({
    name: item.month, // ex: '2024-07'
    fraud: item.fraud,
    legitimate: item.legitimate
  })) || [];

  // Day Trends dynamique
  const dayTrendsData: { name: string; fraud: number; legitimate: number }[] = stats?.dayTrends?.map((item) => ({
    name: item.day, // ex: '2024-07-18'
    fraud: item.fraud,
    legitimate: item.legitimate
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fraud Detection Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and analyze transaction fraud patterns in real-time</p>
        </div>
        <div className="flex space-x-4">
          <Link
            to="/predict"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Shield className="h-4 w-4" />
            <span>Analyze Transaction</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Transactions"
            value={typeof stats.totalTransactions === 'number' ? stats.totalTransactions.toLocaleString() : '-'}
            icon={TrendingUp}
            color="blue"
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Fraud Detected"
            value={typeof stats.fraudCount === 'number' ? stats.fraudCount.toLocaleString() : '-'}
            icon={AlertTriangle}
            color="red"
            trend={{ value: -2.3, isPositive: false }}
          />
          <StatCard
            title="Legitimate"
            value={typeof stats.legitimateCount === 'number' ? stats.legitimateCount.toLocaleString() : '-'}
            icon={CheckCircle}
            color="green"
            trend={{ value: 15.2, isPositive: true }}
          />
          <StatCard
            title="Fraud Rate"
            value={typeof stats.fraudRate === 'number' ? `${stats.fraudRate.toFixed(2)}%` : '-'}
            icon={Shield}
            color="yellow"
            trend={{ value: -0.8, isPositive: false }}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Transactions']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Legitimate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Fraud</span>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Day Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dayTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="legitimate" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <Link
            to="/predict-csv"
            className="text-red-600 hover:text-red-700 flex items-center space-x-1 text-sm font-medium"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Label
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((t: RecentTransactionBackend, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <FraudBadge label={t.label} probability={t.fraud_score} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.input && t.input.TransactionAmt ? formatCurrency(t.input.TransactionAmt) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.input && t.input.ProductCD ? t.input.ProductCD : '-'}
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(t.fraud_score * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(t.timestamp)}
                  </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">No recent transactions</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chatbot Floating Button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-400"
        onClick={openChat}
        aria-label="Open Chatbot"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chatbot Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end justify-end">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-sm m-8 flex flex-col" style={{height: 500}}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <span className="font-semibold text-gray-900">Assistant virtuel</span>
              <button onClick={closeChat} className="text-gray-400 hover:text-gray-700 text-xl font-bold">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {chatLoading && (
                <div className="text-center py-4 text-gray-400">
                  <LoadingSpinner size="sm" />
                </div>
              )}
              {chatMessages.length === 0 && (
                <div className="text-gray-400 text-sm text-center">Commencez la conversation…</div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={msg.from === 'user' ? 'text-right' : 'text-left'}>
                  <span className={msg.from === 'user' ? 'inline-block bg-red-100 text-red-800 rounded-lg px-3 py-1 my-1' : 'inline-block bg-gray-200 text-gray-800 rounded-lg px-3 py-1 my-1'}>
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-gray-200 bg-white flex items-center space-x-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Écrivez votre message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
              />
              <button
                onClick={handleSendChat}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                disabled={chatLoading}
              >
                {chatLoading ? <LoadingSpinner size="sm" /> : "Envoyer"}
              </button>
            </div>
            {sessionId && (
              <div className="p-2 border-t border-gray-200 bg-white text-center text-sm text-gray-600">
                Session ID: {sessionId}
                <button
                  onClick={clearChat}
                  className="ml-2 text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Effacer la conversation
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;