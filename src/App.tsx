import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { HowItWorks } from './pages/HowItWorks';
import { Features } from './pages/Features';
import { ForWho } from './pages/ForWho';
import { Pricing } from './pages/Pricing';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './lib/auth/AuthContext';
import { NotificationProvider } from './components/NotificationProvider';

import { AdminAuthProvider } from './lib/auth/AdminAuthContext';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

// App Portal Components
import { AppLayout } from './components/app/AppLayout';
import { Dashboard } from './pages/app/Dashboard';
import { Messages } from './pages/app/Messages';
import { Requests } from './pages/app/Requests';
import { Instance } from './pages/app/Instance';
import { Subscription } from './pages/app/Subscription';
import { Settings } from './pages/app/Settings';

// Admin Portal Components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './pages/admin/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminClients } from './pages/admin/Clients';
import { AdminInstances } from './pages/admin/Instances';
import { AdminMessages } from './pages/admin/Messages';
import { AdminTickets } from './pages/admin/Tickets';
import { AdminSubscriptions } from './pages/admin/Subscriptions';
import { AdminLogs } from './pages/admin/Logs';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login' || location.pathname === '/admin/login';

  if (isAppRoute) {
    return <AppLayout>{children}</AppLayout>;
  }

  if (isAdminRoute && location.pathname !== '/admin/login') {
    return <AdminLayout>{children}</AdminLayout>;
  }

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [booted, setBooted] = React.useState(false);

  useEffect(() => {
    console.log("App component mounted, setting booted=true in 500ms");
    const timer = setTimeout(() => setBooted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!booted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-black text-slate-900">App boot OK</h1>
          <p className="text-slate-500">Initializing providers...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminAuthProvider>
          {/* Temporarily disabled NotificationProvider if needed, but let's keep it for now and see if it boots */}
          <NotificationProvider>
            <Router>
              <ScrollToTop />
              <MainLayout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/como-funciona" element={<HowItWorks />} />
                  <Route path="/funcionalidades" element={<Features />} />
                  <Route path="/para-quem" element={<ForWho />} />
                  <Route path="/precos" element={<Pricing />} />
                  <Route path="/contacto" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/experimentar" element={<Pricing />} />

                  {/* App Portal Routes */}
                  <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/app/mensagens" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route path="/app/pedidos" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
                  <Route path="/app/instancia" element={<ProtectedRoute><Instance /></ProtectedRoute>} />
                  <Route path="/app/subscricao" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
                  <Route path="/app/definicoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                  {/* Admin Portal Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={
                    <AdminProtectedRoute>
                      <AdminLayout><AdminDashboard /></AdminLayout>
                    </AdminProtectedRoute>
                  } />
                  <Route path="/admin/clients" element={
                    <AdminProtectedRoute>
                      <AdminLayout><AdminClients /></AdminLayout>
                    </AdminProtectedRoute>
                  } />
                  <Route path="/admin/instances" element={
                    <AdminProtectedRoute>
                      <AdminLayout><AdminInstances /></AdminLayout>
                    </AdminProtectedRoute>
                  } />
                  <Route path="/admin/messages" element={
                    <AdminProtectedRoute>
                      <AdminLayout><AdminMessages /></AdminLayout>
                    </AdminProtectedRoute>
                  } />
                  <Route path="/admin/tickets" element={
                    <AdminProtectedRoute>
                      <AdminLayout><AdminTickets /></AdminLayout>
                    </AdminProtectedRoute>
                  } />
                  <Route path="/admin/subscriptions" element={
                    <AdminProtectedRoute>
                      <AdminLayout><AdminSubscriptions /></AdminLayout>
                    </AdminProtectedRoute>
                  } />
                  <Route path="/admin/logs" element={
                    <AdminProtectedRoute>
                      <AdminLayout><AdminLogs /></AdminLayout>
                    </AdminProtectedRoute>
                  } />
                </Routes>
              </MainLayout>
            </Router>
          </NotificationProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
