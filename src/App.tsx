import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import MainSection from './pages/MainSection';
import AdminSection from './pages/AdminSection';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/main" replace />} />
          <Route path="/main" element={<MainSection />} />
          <Route path="/admin" element={<AdminSection />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;