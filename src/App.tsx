import.meta.env.VITE_API_URL import React from 'react';
import.meta.env.VITE_API_URL import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import.meta.env.VITE_API_URL import { Toaster } from 'sonner';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL // Layouts
import.meta.env.VITE_API_URL import { AppLayout } from './components/app/AppLayout';
import.meta.env.VITE_API_URL import { AdminLayout } from './components/admin/AdminLayout';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL // Auth & Protection
import.meta.env.VITE_API_URL import { ProtectedRoute } from './components/ProtectedRoute';
import.meta.env.VITE_API_URL import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import.meta.env.VITE_API_URL import { AuthProvider } from './lib/auth/AuthContext';
import.meta.env.VITE_API_URL import { AdminAuthProvider } from './lib/auth/AdminAuthContext';
import.meta.env.VITE_API_URL import { NotificationProvider } from './components/NotificationProvider';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL // Public Pages
import.meta.env.VITE_API_URL import { Home } from './pages/Home';
import.meta.env.VITE_API_URL import { Login } from './pages/Login';
import.meta.env.VITE_API_URL import { AdminLogin } from './pages/admin/Login';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL // App Pages
import.meta.env.VITE_API_URL import { Dashboard } from './pages/app/Dashboard';
import.meta.env.VITE_API_URL import { Messages } from './pages/app/Messages';
import.meta.env.VITE_API_URL import { Requests } from './pages/app/Requests';
import.meta.env.VITE_API_URL import { Instance } from './pages/app/Instance';
import.meta.env.VITE_API_URL import Subscription from './pages/app/Subscription';
import.meta.env.VITE_API_URL import { Settings } from './pages/app/Settings';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL // Admin Pages
import.meta.env.VITE_API_URL import { AdminDashboard } from './pages/admin/Dashboard';
import.meta.env.VITE_API_URL import { AdminClients } from './pages/admin/Clients';
import.meta.env.VITE_API_URL import { AdminInstances } from './pages/admin/Instances';
import.meta.env.VITE_API_URL import AdminTickets from './pages/admin/Tickets';
import.meta.env.VITE_API_URL import { AdminSubscriptions } from './pages/admin/Subscriptions';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL // Error Boundary
import.meta.env.VITE_API_URL class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
import.meta.env.VITE_API_URL   constructor(props: any) {
import.meta.env.VITE_API_URL     super(props);
import.meta.env.VITE_API_URL     this.state = { hasError: false };
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   static getDerivedStateFromError() {
import.meta.env.VITE_API_URL     return { hasError: true };
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   componentDidCatch(error: any, errorInfo: any) {
import.meta.env.VITE_API_URL     console.error('App Error:', error, errorInfo);
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   render() {
import.meta.env.VITE_API_URL     if (this.state.hasError) {
import.meta.env.VITE_API_URL       return (
import.meta.env.VITE_API_URL         <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
import.meta.env.VITE_API_URL           <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-200">
import.meta.env.VITE_API_URL             <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
import.meta.env.VITE_API_URL               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
import.meta.env.VITE_API_URL                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
import.meta.env.VITE_API_URL               </svg>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <h1 className="text-2xl font-black text-slate-900 mb-2">Algo correu mal</h1>
import.meta.env.VITE_API_URL             <p className="text-slate-600 mb-8">Ocorreu um erro inesperado na aplicação. Por favor, recarregue a página.</p>
import.meta.env.VITE_API_URL             <button 
import.meta.env.VITE_API_URL               onClick={() => window.location.reload()}
import.meta.env.VITE_API_URL               className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               Recarregar Aplicação
import.meta.env.VITE_API_URL             </button>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       );
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <>
import.meta.env.VITE_API_URL         <Toaster position="top-right" richColors closeButton />
import.meta.env.VITE_API_URL         {this.props.children}
import.meta.env.VITE_API_URL       </>
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL function App() {
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <ErrorBoundary>
import.meta.env.VITE_API_URL       <AuthProvider>
import.meta.env.VITE_API_URL         <AdminAuthProvider>
import.meta.env.VITE_API_URL           <NotificationProvider>
import.meta.env.VITE_API_URL             <BrowserRouter>
import.meta.env.VITE_API_URL               <Routes>
import.meta.env.VITE_API_URL                 {/* Public Routes */}
import.meta.env.VITE_API_URL                 <Route path="/" element={<Home />} />
import.meta.env.VITE_API_URL                 <Route path="/login" element={<Login />} />
import.meta.env.VITE_API_URL                 <Route path="/admin/login" element={<AdminLogin />} />
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {/* App Routes (Client Hub) */}
import.meta.env.VITE_API_URL                 <Route 
import.meta.env.VITE_API_URL                   path="/app" 
import.meta.env.VITE_API_URL                   element={
import.meta.env.VITE_API_URL                     <ProtectedRoute>
import.meta.env.VITE_API_URL                       <AppLayout>
import.meta.env.VITE_API_URL                         <Outlet />
import.meta.env.VITE_API_URL                       </AppLayout>
import.meta.env.VITE_API_URL                     </ProtectedRoute>
import.meta.env.VITE_API_URL                   }
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <Route index element={<Navigate to="dashboard" replace />} />
import.meta.env.VITE_API_URL                   <Route path="dashboard" element={<Dashboard />} />
import.meta.env.VITE_API_URL                   <Route path="messages" element={<Messages />} />
import.meta.env.VITE_API_URL                   <Route path="tickets" element={<Requests />} />
import.meta.env.VITE_API_URL                   <Route path="instancia" element={<Instance />} />
import.meta.env.VITE_API_URL                   <Route path="subscription" element={<Subscription />} />
import.meta.env.VITE_API_URL                   <Route path="settings" element={<Settings />} />
import.meta.env.VITE_API_URL                 </Route>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {/* Admin Routes */}
import.meta.env.VITE_API_URL                 <Route 
import.meta.env.VITE_API_URL                   path="/admin" 
import.meta.env.VITE_API_URL                   element={
import.meta.env.VITE_API_URL                     <AdminProtectedRoute>
import.meta.env.VITE_API_URL                       <AdminLayout>
import.meta.env.VITE_API_URL                         <Outlet />
import.meta.env.VITE_API_URL                       </AdminLayout>
import.meta.env.VITE_API_URL                     </AdminProtectedRoute>
import.meta.env.VITE_API_URL                   }
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <Route index element={<Navigate to="dashboard" replace />} />
import.meta.env.VITE_API_URL                   <Route path="dashboard" element={<AdminDashboard />} />
import.meta.env.VITE_API_URL                   <Route path="clients" element={<AdminClients />} />
import.meta.env.VITE_API_URL                   <Route path="instances" element={<AdminInstances />} />
import.meta.env.VITE_API_URL                   <Route path="tickets" element={<AdminTickets />} />
import.meta.env.VITE_API_URL                   <Route path="subscriptions" element={<AdminSubscriptions />} />
import.meta.env.VITE_API_URL                 </Route>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {/* Fallback */}
import.meta.env.VITE_API_URL                 <Route path="*" element={<Navigate to="/" replace />} />
import.meta.env.VITE_API_URL               </Routes>
import.meta.env.VITE_API_URL             </BrowserRouter>
import.meta.env.VITE_API_URL           </NotificationProvider>
import.meta.env.VITE_API_URL         </AdminAuthProvider>
import.meta.env.VITE_API_URL       </AuthProvider>
import.meta.env.VITE_API_URL     </ErrorBoundary>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export default App;
