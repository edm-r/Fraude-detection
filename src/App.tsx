import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import PredictSinglePage from './pages/PredictSinglePage';
import PredictCSVPage from './pages/PredictCSVPage';
import TransactionDetailsPage from './pages/TransactionDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="predict" element={<PredictSinglePage />} />
          <Route path="predict-csv" element={<PredictCSVPage />} />
          <Route path="transaction/:id" element={<TransactionDetailsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;