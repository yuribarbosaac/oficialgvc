import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';

// Layout
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Pages
import Dashboard from './components/pages/Dashboard';
import Visitors from './components/pages/Visitors';
import Lockers from './components/pages/Lockers';
import Telecentro from './components/pages/Telecentro';
import Agendamento from './components/pages/Agendamento';
import AgendamentoPublico from './components/pages/AgendamentoPublico';
import Reports from './components/pages/Reports';
import SettingsPage from './components/pages/Settings';
import Login from './components/pages/Login';

// Components
import CheckInModal from './components/modals/CheckInModal';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const { user, loading, userData, isSuperadmin } = useAuth();

  useEffect(() => {
    if (userData) {
      if (userData.espacoId === 'todos' || !userData.espacoId) {
        document.title = 'GVC - Gestão Cultural';
      } else if (userData.espacoNome) {
        document.title = `GVC - ${userData.espacoNome}`;
      } else {
        document.title = 'GVC';
      }
    } else {
      document.title = 'GVC';
    }
  }, [userData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Iniciando GVC...</p>
        </div>
      </div>
    );
  }

  // Show login if neither Firebase user nor superadmin session
  if (!user && !isSuperadmin) {
    return <Login />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-surface font-sans selection:bg-primary/10 selection:text-primary">
          <Sidebar onNewCheckIn={() => setIsCheckInOpen(true)} />
          <div className="pl-72">
            <Header />
            <main className="pt-16 min-h-[calc(100vh-64px)] relative">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/agendamento-publico" element={<AgendamentoPublico />} />
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/visitors" element={<ProtectedRoute><Visitors /></ProtectedRoute>} />
                  <Route path="/lockers" element={<ProtectedRoute><Lockers /></ProtectedRoute>} />
                  <Route path="/telecentro" element={<ProtectedRoute><Telecentro /></ProtectedRoute>} />
                  <Route path="/agendamento" element={<ProtectedRoute><Agendamento /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute requiredRole="coordenador"><Reports /></ProtectedRoute>} />
                  <Route path="/configuracoes" element={<ProtectedRoute requiredRole="administrador"><SettingsPage /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AnimatePresence>
            </main>
          </div>
          <CheckInModal isOpen={isCheckInOpen} onClose={() => setIsCheckInOpen(false)} />
        </div>
      </Router>
    </ErrorBoundary>
  );
}
