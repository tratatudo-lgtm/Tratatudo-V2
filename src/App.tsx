import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

// Layouts
import { AppLayout } from './components/app/AppLayout';
import { AdminLayout } from './components/admin/AdminLayout';

// Auth & Protection
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { AuthProvider } from './lib/auth/AuthContext';
import { AdminAuthProvider } from './lib/auth/AdminAuthContext';
import { NotificationProvider } from './components/NotificationProvider';

// Public Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { AdminLogin } from './pages/admin/Login';

// App Pages
import { Dashboard } from './pages/app/Dashboard';
import OperationalDashboard from './pages/app/OperationalDashboard';
import WhatsApp from './pages/app/WhatsApp';
import Billing from './pages/app/Billing';
import Activity from './pages/app/Activity';
import SystemHealth from './pages/app/SystemHealth';
import Tickets from './pages/app/Tickets';
import TicketDetail from './pages/app/TicketDetail';
import Requests from './pages/app/Requests';
import Complaints from './pages/app/Complaints';
import Sales from './pages/app/Sales';
import { Instance } from './pages/app/Instance';
import { Settings } from './pages/app/Settings';
import Clients from './pages/app/Clients';
import ClientDetail from './pages/app/ClientDetail';
import Team from './pages/app/Team';
import Tasks from './pages/app/Tasks';
import Calendar from './pages/app/Calendar';
import Documents from './pages/app/Documents';
import FinancialDocuments from './pages/app/FinancialDocuments';
import Emails from './pages/app/Emails';
import Automations from './pages/app/Automations';

// Placeholder components for new routes
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
    <h1 className="text-2xl font-bold text-slate-900 mb-4">{title}</h1>
    <p className="text-slate-500 italic">Esta funcionalidade está em desenvolvimento.</p>
  </div>
);

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminClients } from './pages/admin/Clients';
import { AdminInstances } from './pages/admin/Instances';
import { AdminTickets } from './pages/admin/Tickets';
import { AdminMessages } from './pages/admin/Messages';
import { AdminSubscriptions } from './pages/admin/Subscriptions';
import { AdminLogs } from './pages/admin/Logs';

// Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Algo correu mal</h1>
            <p className="text-slate-600 mb-8">Ocorreu um erro inesperado na aplicação. Por favor, recarregue a página.</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
            >
              Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <Toaster position="top-right" richColors closeButton />
        {this.props.children}
      </>
    );
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminAuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* App Routes (Client Hub) */}
                <Route 
                  path="/app" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Outlet />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<ProtectedRoute module="dashboard"><OperationalDashboard /></ProtectedRoute>} />
                  <Route path="whatsapp" element={<ProtectedRoute module="whatsapp"><WhatsApp /></ProtectedRoute>} />
                  <Route path="messages" element={<Navigate to="/app/whatsapp" replace />} />
                  <Route path="tickets" element={<ProtectedRoute module="tickets"><Tickets /></ProtectedRoute>} />
                  <Route path="tickets/:id" element={<ProtectedRoute module="tickets"><TicketDetail /></ProtectedRoute>} />
                  <Route path="requests" element={<ProtectedRoute module="tickets"><Requests /></ProtectedRoute>} />
                  <Route path="complaints" element={<ProtectedRoute module="tickets"><Complaints /></ProtectedRoute>} />
                  <Route path="sales" element={<ProtectedRoute module="tickets"><Sales /></ProtectedRoute>} />
                  <Route path="clients" element={<ProtectedRoute module="clients"><Clients /></ProtectedRoute>} />
                  <Route path="clients/:id" element={<ProtectedRoute module="clients"><ClientDetail /></ProtectedRoute>} />
                  <Route path="team" element={<ProtectedRoute module="team"><Team /></ProtectedRoute>} />
                  <Route path="calendar" element={<ProtectedRoute module="calendar"><Calendar /></ProtectedRoute>} />
                  <Route path="agenda" element={<Navigate to="/app/calendar" replace />} />
                  <Route path="tasks" element={<ProtectedRoute module="tasks"><Tasks /></ProtectedRoute>} />
                  <Route path="documents" element={<ProtectedRoute module="documents"><Documents /></ProtectedRoute>} />
                  <Route path="financial" element={<ProtectedRoute module="financial"><FinancialDocuments /></ProtectedRoute>} />
                  <Route path="emails" element={<ProtectedRoute module="emails"><Emails /></ProtectedRoute>} />
                  <Route path="email" element={<Navigate to="/app/emails" replace />} />
                  <Route path="automations" element={<ProtectedRoute module="automations"><Automations /></ProtectedRoute>} />
                  <Route path="billing" element={<ProtectedRoute module="billing"><Billing /></ProtectedRoute>} />
                  <Route path="activity" element={<ProtectedRoute module="dashboard"><Activity /></ProtectedRoute>} />
                  <Route path="system-health" element={<ProtectedRoute module="dashboard"><SystemHealth /></ProtectedRoute>} />
                  <Route path="health" element={<Navigate to="/app/system-health" replace />} />
                  <Route path="reports" element={<ProtectedRoute module="dashboard"><Placeholder title="Relatórios" /></ProtectedRoute>} />
                  <Route path="ai" element={<ProtectedRoute module="dashboard"><Placeholder title="IA Hub" /></ProtectedRoute>} />
                  <Route path="instancia" element={<ProtectedRoute module="whatsapp"><Instance /></ProtectedRoute>} />
                  <Route path="subscription" element={<Navigate to="/app/billing" replace />} />
                  <Route path="settings" element={<ProtectedRoute module="settings"><Settings /></ProtectedRoute>} />
                </Route>

                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <AdminProtectedRoute>
                      <AdminLayout>
                        <Outlet />
                      </AdminLayout>
                    </AdminProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="clients" element={<AdminClients />} />
                  <Route path="instances" element={<AdminInstances />} />
                  <Route path="tickets" element={<AdminTickets />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="subscriptions" element={<AdminSubscriptions />} />
                  <Route path="logs" element={<AdminLogs />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
