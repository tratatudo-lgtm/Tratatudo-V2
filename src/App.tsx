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
import { Messages } from './pages/app/Messages';
import { Requests } from './pages/app/Requests';
import Subscription from './pages/app/Subscription';
import { Settings } from './pages/app/Settings';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminClients } from './pages/admin/Clients';
import { AdminInstances } from './pages/admin/Instances';
import AdminTickets from './pages/admin/Tickets';
import { AdminSubscriptions } from './pages/admin/Subscriptions';

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
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="tickets" element={<Requests />} />
                  <Route path="subscription" element={<Subscription />} />
                  <Route path="settings" element={<Settings />} />
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
                  <Route path="subscriptions" element={<AdminSubscriptions />} />
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
