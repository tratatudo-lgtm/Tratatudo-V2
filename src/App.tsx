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
  return (
    <AuthProvider>
      <AdminAuthProvider>
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
                <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                <Route path="/admin/clients" element={<AdminProtectedRoute><AdminClients /></AdminProtectedRoute>} />
                <Route path="/admin/instances" element={<AdminProtectedRoute><AdminInstances /></AdminProtectedRoute>} />
                <Route path="/admin/messages" element={<AdminProtectedRoute><AdminMessages /></AdminProtectedRoute>} />
                <Route path="/admin/tickets" element={<AdminProtectedRoute><AdminTickets /></AdminProtectedRoute>} />
                <Route path="/admin/subscriptions" element={<AdminProtectedRoute><AdminSubscriptions /></AdminProtectedRoute>} />
                <Route path="/admin/logs" element={<AdminProtectedRoute><AdminLogs /></AdminProtectedRoute>} />
              </Routes>
            </MainLayout>
          </Router>
        </NotificationProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}
