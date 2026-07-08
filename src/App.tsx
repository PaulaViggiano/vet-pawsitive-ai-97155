import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Pacientes from './pages/Pacientes';
import Duenos from './pages/Duenos';
import HistoriaMedica from './pages/HistoriaMedica';
import Conocimiento from './pages/Conocimiento';
import ContactosBot from './pages/ContactosBot';
import Calendario from './pages/Calendario';
import Configuracion from './pages/Configuracion';
import Login from './pages/auth/Login';
import GoogleCallback from './pages/auth/GoogleCallback';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return !user ? <>{children}</> : <Navigate to="/" replace />;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/auth/callback" element={<GoogleCallback />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/reports" element={<Reports />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/duenos" element={<Duenos />} />
            <Route path="/historia-medica" element={<HistoriaMedica />} />
                <Route path="/conocimiento" element={<Conocimiento />} />
                <Route path="/contactos-bot" element={<ContactosBot />} />
                <Route path="/calendario" element={<Calendario />} />
                <Route path="/configuracion" element={<Configuracion />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
