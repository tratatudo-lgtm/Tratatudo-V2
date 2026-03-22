import.meta.env.VITE_API_URL import React, { useState, useEffect } from 'react';
import.meta.env.VITE_API_URL import { motion } from 'motion/react';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   MessageSquare, 
import.meta.env.VITE_API_URL   ClipboardList, 
import.meta.env.VITE_API_URL   Smartphone, 
import.meta.env.VITE_API_URL   CreditCard, 
import.meta.env.VITE_API_URL   TrendingUp, 
import.meta.env.VITE_API_URL   TrendingDown,
import.meta.env.VITE_API_URL   Clock,
import.meta.env.VITE_API_URL   CheckCircle2,
import.meta.env.VITE_API_URL   AlertCircle,
import.meta.env.VITE_API_URL   ArrowRight,
import.meta.env.VITE_API_URL   Bot,
import.meta.env.VITE_API_URL   ShieldCheck,
import.meta.env.VITE_API_URL   Zap,
import.meta.env.VITE_API_URL   Activity,
import.meta.env.VITE_API_URL   Loader2,
import.meta.env.VITE_API_URL   PieChart as PieChartIcon,
import.meta.env.VITE_API_URL   BarChart3
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { Link } from 'react-router-dom';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   AreaChart, 
import.meta.env.VITE_API_URL   Area, 
import.meta.env.VITE_API_URL   XAxis, 
import.meta.env.VITE_API_URL   YAxis, 
import.meta.env.VITE_API_URL   CartesianGrid, 
import.meta.env.VITE_API_URL   Tooltip, 
import.meta.env.VITE_API_URL   ResponsiveContainer,
import.meta.env.VITE_API_URL   PieChart,
import.meta.env.VITE_API_URL   Pie,
import.meta.env.VITE_API_URL   Cell,
import.meta.env.VITE_API_URL   BarChart,
import.meta.env.VITE_API_URL   Bar,
import.meta.env.VITE_API_URL   Legend
import.meta.env.VITE_API_URL } from 'recharts';
import.meta.env.VITE_API_URL import { cn, extractArrayResponse, extractObjectResponse } from '../../lib/utils';
import.meta.env.VITE_API_URL import { useAuth } from '../../lib/auth/AuthContext';
import.meta.env.VITE_API_URL import { LoadingState, ErrorState } from '../../components/States';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface DashboardData {
import.meta.env.VITE_API_URL   stats: {
import.meta.env.VITE_API_URL     messages?: number;
import.meta.env.VITE_API_URL     totalMessages?: number;
import.meta.env.VITE_API_URL     totalTickets?: number;
import.meta.env.VITE_API_URL     openTickets?: number;
import.meta.env.VITE_API_URL     complaints?: number;
import.meta.env.VITE_API_URL     inProgressTickets?: number;
import.meta.env.VITE_API_URL     resolvedTickets?: number;
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL   instance: {
import.meta.env.VITE_API_URL     instance_name: string;
import.meta.env.VITE_API_URL     is_hub: boolean;
import.meta.env.VITE_API_URL     status: string;
import.meta.env.VITE_API_URL   } | null;
import.meta.env.VITE_API_URL   subscription: {
import.meta.env.VITE_API_URL     status: string;
import.meta.env.VITE_API_URL     plan: string;
import.meta.env.VITE_API_URL     ends_at: string;
import.meta.env.VITE_API_URL   } | null;
import.meta.env.VITE_API_URL   activity: Array<{
import.meta.env.VITE_API_URL     type: 'ticket' | 'message';
import.meta.env.VITE_API_URL     title: string;
import.meta.env.VITE_API_URL     status: string;
import.meta.env.VITE_API_URL     created_at: string;
import.meta.env.VITE_API_URL   }>;
import.meta.env.VITE_API_URL   charts?: {
import.meta.env.VITE_API_URL     daily: Array<{ date: string; tickets: number; complaints: number; resolved: number }>;
import.meta.env.VITE_API_URL     statusDistribution: { aberto: number; analise: number; resolvido: number };
import.meta.env.VITE_API_URL     typeDistribution: { pedido: number; reclamacao: number; outro: number };
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const shortcuts = [
import.meta.env.VITE_API_URL   { name: 'Ver Mensagens', href: '/app/messages', icon: MessageSquare, color: 'bg-blue-500' },
import.meta.env.VITE_API_URL   { name: 'Ver Pedidos', href: '/app/tickets', icon: ClipboardList, color: 'bg-orange-500' },
import.meta.env.VITE_API_URL   { name: 'Ver Definições', href: '/app/settings', icon: Smartphone, color: 'bg-green-500' },
import.meta.env.VITE_API_URL   { name: 'Ver Subscrição', href: '/app/subscription', icon: CreditCard, color: 'bg-purple-500' },
import.meta.env.VITE_API_URL ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function Dashboard() {
import.meta.env.VITE_API_URL   const { user } = useAuth();
import.meta.env.VITE_API_URL   const [data, setData] = useState<DashboardData | null>(null);
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(true);
import.meta.env.VITE_API_URL   const [error, setError] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [aiInsights, setAiInsights] = useState<{ insights: any[], summary: string } | null>(null);
import.meta.env.VITE_API_URL   const [loadingAI, setLoadingAI] = useState(false);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchAIInsights = async () => {
import.meta.env.VITE_API_URL     const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setLoadingAI(true);
import.meta.env.VITE_API_URL       const res = await fetch(`${baseUrl}/api/client/ai/insights`, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         body: JSON.stringify({ context: 'dashboard' }),
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       if (res.ok) {
import.meta.env.VITE_API_URL         const data = await res.json();
import.meta.env.VITE_API_URL         setAiInsights(data);
import.meta.env.VITE_API_URL       } else if (res.status === 401) {
import.meta.env.VITE_API_URL         console.warn('[APP] AI Insights failed: Unauthorized');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } catch (err) {
import.meta.env.VITE_API_URL       console.error("[APP] AI Insights failed:", err);
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       // Fallback for demo
import.meta.env.VITE_API_URL       if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
import.meta.env.VITE_API_URL         setAiInsights({
import.meta.env.VITE_API_URL           summary: "O seu assistente de IA está a analisar o desempenho da sua conta.",
import.meta.env.VITE_API_URL           insights: [
import.meta.env.VITE_API_URL             { id: '1', type: 'opportunity', title: 'Aumento de Conversão', description: 'O bot está a converter 15% mais leads do que na semana passada.' },
import.meta.env.VITE_API_URL             { id: '2', type: 'alert', title: 'Pico de Tráfego', description: 'Detetado um aumento de 30% nas mensagens entre as 18h e as 20h.' }
import.meta.env.VITE_API_URL           ]
import.meta.env.VITE_API_URL         });
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoadingAI(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     const fetchData = async () => {
import.meta.env.VITE_API_URL       const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL       const endpoints = [
import.meta.env.VITE_API_URL         `${baseUrl}/api/client/dashboard/stats`,
import.meta.env.VITE_API_URL         `${baseUrl}/api/dashboard/stats`
import.meta.env.VITE_API_URL       ];
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       let lastError = null;
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       try {
import.meta.env.VITE_API_URL         setLoading(true);
import.meta.env.VITE_API_URL         setError(null);
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL         for (const url of endpoints) {
import.meta.env.VITE_API_URL           try {
import.meta.env.VITE_API_URL             console.log(`[APP] Fetching dashboard stats: ${url}`);
import.meta.env.VITE_API_URL             const response = await fetch(url, {
import.meta.env.VITE_API_URL               credentials: 'include'
import.meta.env.VITE_API_URL             });
import.meta.env.VITE_API_URL             
import.meta.env.VITE_API_URL             if (response.ok) {
import.meta.env.VITE_API_URL               const result = await response.json();
import.meta.env.VITE_API_URL               console.log(`[APP] Dashboard data received from ${url}:`, result);
import.meta.env.VITE_API_URL               
import.meta.env.VITE_API_URL               // Map the response to our interface
import.meta.env.VITE_API_URL               const mappedData: DashboardData = {
import.meta.env.VITE_API_URL                 stats: result.stats || {},
import.meta.env.VITE_API_URL                 instance: extractObjectResponse(result, 'instance'),
import.meta.env.VITE_API_URL                 subscription: extractObjectResponse(result, 'subscription'),
import.meta.env.VITE_API_URL                 activity: extractArrayResponse(result, 'activity')
import.meta.env.VITE_API_URL               };
import.meta.env.VITE_API_URL               
import.meta.env.VITE_API_URL               // Fetch chart data
import.meta.env.VITE_API_URL               try {
import.meta.env.VITE_API_URL                 const chartRes = await fetch(`${baseUrl}/api/client/dashboard/charts`, {
import.meta.env.VITE_API_URL                   credentials: 'include'
import.meta.env.VITE_API_URL                 });
import.meta.env.VITE_API_URL                 if (chartRes.ok) {
import.meta.env.VITE_API_URL                   const chartData = await chartRes.json();
import.meta.env.VITE_API_URL                   mappedData.charts = chartData;
import.meta.env.VITE_API_URL                 }
import.meta.env.VITE_API_URL               } catch (e) {
import.meta.env.VITE_API_URL                 console.error("[APP] Failed to fetch chart data:", e);
import.meta.env.VITE_API_URL               }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               setData(mappedData);
import.meta.env.VITE_API_URL               setLoading(false);
import.meta.env.VITE_API_URL               fetchAIInsights();
import.meta.env.VITE_API_URL               return;
import.meta.env.VITE_API_URL             } else if (response.status === 401) {
import.meta.env.VITE_API_URL               throw new Error('Sessão expirada. Por favor, faça login novamente.');
import.meta.env.VITE_API_URL             }
import.meta.env.VITE_API_URL           } catch (err: any) {
import.meta.env.VITE_API_URL             console.error(`[APP] Fetch dashboard failed for ${url}:`, err);
import.meta.env.VITE_API_URL             lastError = err;
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL         throw lastError || new Error('Falha ao carregar dados do painel');
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL       } catch (err: any) {
import.meta.env.VITE_API_URL         console.error('[APP] Dashboard fetch failed:', err);
import.meta.env.VITE_API_URL         setError(err.message || 'Não foi possível carregar os dados do painel.');
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL         // Professional fallback for demo/development
import.meta.env.VITE_API_URL         if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
import.meta.env.VITE_API_URL           console.log('[APP] Using fallback dashboard data');
import.meta.env.VITE_API_URL           setData({
import.meta.env.VITE_API_URL             stats: {
import.meta.env.VITE_API_URL               totalMessages: 1250,
import.meta.env.VITE_API_URL               openTickets: 3,
import.meta.env.VITE_API_URL               resolvedTickets: 45
import.meta.env.VITE_API_URL             },
import.meta.env.VITE_API_URL             instance: {
import.meta.env.VITE_API_URL               instance_name: 'TrataTudo-WhatsApp-01',
import.meta.env.VITE_API_URL               is_hub: true,
import.meta.env.VITE_API_URL               status: 'connected'
import.meta.env.VITE_API_URL             },
import.meta.env.VITE_API_URL             subscription: {
import.meta.env.VITE_API_URL               status: 'active',
import.meta.env.VITE_API_URL               plan: 'Pro',
import.meta.env.VITE_API_URL               ends_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
import.meta.env.VITE_API_URL             },
import.meta.env.VITE_API_URL             activity: [
import.meta.env.VITE_API_URL               { type: 'ticket', title: 'Novo pedido de suporte', status: 'open', created_at: new Date().toISOString() },
import.meta.env.VITE_API_URL               { type: 'message', title: 'Mensagem recebida de cliente', status: 'delivered', created_at: new Date().toISOString() }
import.meta.env.VITE_API_URL             ],
import.meta.env.VITE_API_URL             charts: {
import.meta.env.VITE_API_URL               daily: [
import.meta.env.VITE_API_URL                 { date: '2024-03-15', tickets: 5, complaints: 2, resolved: 4 },
import.meta.env.VITE_API_URL                 { date: '2024-03-16', tickets: 8, complaints: 1, resolved: 6 },
import.meta.env.VITE_API_URL                 { date: '2024-03-17', tickets: 12, complaints: 3, resolved: 8 }
import.meta.env.VITE_API_URL               ],
import.meta.env.VITE_API_URL               statusDistribution: { aberto: 10, analise: 5, resolvido: 35 },
import.meta.env.VITE_API_URL               typeDistribution: { pedido: 25, reclamacao: 15, outro: 10 }
import.meta.env.VITE_API_URL             }
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL           setError(null);
import.meta.env.VITE_API_URL           fetchAIInsights();
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       } finally {
import.meta.env.VITE_API_URL         setLoading(false);
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     fetchData();
import.meta.env.VITE_API_URL   }, []);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (loading) {
import.meta.env.VITE_API_URL     return <LoadingState message="A carregar o seu painel..." className="h-[60vh]" />;
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (error) {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
import.meta.env.VITE_API_URL         <ErrorState message={error} />
import.meta.env.VITE_API_URL         <button 
import.meta.env.VITE_API_URL           onClick={() => window.location.reload()}
import.meta.env.VITE_API_URL           className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
import.meta.env.VITE_API_URL         >
import.meta.env.VITE_API_URL           Tentar novamente
import.meta.env.VITE_API_URL         </button>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const stats = [
import.meta.env.VITE_API_URL     { 
import.meta.env.VITE_API_URL       name: 'Total de Mensagens', 
import.meta.env.VITE_API_URL       value: (data?.stats?.totalMessages ?? data?.stats?.messages ?? 0).toLocaleString() || '0', 
import.meta.env.VITE_API_URL       change: '+0%', 
import.meta.env.VITE_API_URL       trend: 'neutral', 
import.meta.env.VITE_API_URL       icon: MessageSquare,
import.meta.env.VITE_API_URL       color: 'text-blue-600',
import.meta.env.VITE_API_URL       bg: 'bg-blue-50'
import.meta.env.VITE_API_URL     },
import.meta.env.VITE_API_URL     { 
import.meta.env.VITE_API_URL       name: 'Pedidos em Aberto', 
import.meta.env.VITE_API_URL       value: (data?.stats?.openTickets ?? 0).toString() || '0', 
import.meta.env.VITE_API_URL       change: '0%', 
import.meta.env.VITE_API_URL       trend: 'neutral', 
import.meta.env.VITE_API_URL       icon: ClipboardList,
import.meta.env.VITE_API_URL       color: 'text-orange-600',
import.meta.env.VITE_API_URL       bg: 'bg-orange-50'
import.meta.env.VITE_API_URL     },
import.meta.env.VITE_API_URL     { 
import.meta.env.VITE_API_URL       name: 'Reclamações', 
import.meta.env.VITE_API_URL       value: (data?.stats?.complaints ?? 0).toString() || '0', 
import.meta.env.VITE_API_URL       change: '0%', 
import.meta.env.VITE_API_URL       trend: 'neutral', 
import.meta.env.VITE_API_URL       icon: AlertCircle,
import.meta.env.VITE_API_URL       color: 'text-red-600',
import.meta.env.VITE_API_URL       bg: 'bg-red-50'
import.meta.env.VITE_API_URL     },
import.meta.env.VITE_API_URL     { 
import.meta.env.VITE_API_URL       name: 'Estado da Instância', 
import.meta.env.VITE_API_URL       value: data?.instance?.status === 'online' ? 'Online' : 'Offline', 
import.meta.env.VITE_API_URL       status: data?.instance?.status === 'online' ? 'success' : 'error',
import.meta.env.VITE_API_URL       icon: Smartphone,
import.meta.env.VITE_API_URL       color: data?.instance?.status === 'online' ? 'text-green-600' : 'text-slate-600',
import.meta.env.VITE_API_URL       bg: data?.instance?.status === 'online' ? 'bg-green-50' : 'bg-slate-50'
import.meta.env.VITE_API_URL     },
import.meta.env.VITE_API_URL     { 
import.meta.env.VITE_API_URL       name: 'Subscrição', 
import.meta.env.VITE_API_URL       value: data?.subscription?.status === 'active' ? 'Ativa' : 'Inativa', 
import.meta.env.VITE_API_URL       status: data?.subscription?.status === 'active' ? 'info' : 'warning',
import.meta.env.VITE_API_URL       icon: CreditCard,
import.meta.env.VITE_API_URL       color: 'text-purple-600',
import.meta.env.VITE_API_URL       bg: 'bg-purple-50'
import.meta.env.VITE_API_URL     },
import.meta.env.VITE_API_URL   ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const formatTime = (dateStr: string) => {
import.meta.env.VITE_API_URL     if (!dateStr) return 'N/A';
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const date = new Date(dateStr);
import.meta.env.VITE_API_URL       if (isNaN(date.getTime())) return 'N/A';
import.meta.env.VITE_API_URL       const now = new Date();
import.meta.env.VITE_API_URL       const diffMs = now.getTime() - date.getTime();
import.meta.env.VITE_API_URL       const diffMins = Math.floor(diffMs / (1000 * 60));
import.meta.env.VITE_API_URL       const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       if (diffMins < 1) return 'Agora mesmo';
import.meta.env.VITE_API_URL       if (diffMins < 60) return `Há ${diffMins} min`;
import.meta.env.VITE_API_URL       if (diffHours < 24) return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
import.meta.env.VITE_API_URL       return date.toLocaleDateString('pt-PT');
import.meta.env.VITE_API_URL     } catch (e) {
import.meta.env.VITE_API_URL       return 'N/A';
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="space-y-8">
import.meta.env.VITE_API_URL       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
import.meta.env.VITE_API_URL         <div>
import.meta.env.VITE_API_URL           <h1 className="text-2xl font-display font-bold text-slate-900">Painel de Controlo</h1>
import.meta.env.VITE_API_URL           <p className="text-slate-500">Bem-vindo de volta. Aqui está o resumo da sua operação.</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
import.meta.env.VITE_API_URL           <Clock className="w-4 h-4" />
import.meta.env.VITE_API_URL           Última atualização: {new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* AI Insights Section */}
import.meta.env.VITE_API_URL       <motion.div 
import.meta.env.VITE_API_URL         initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL         animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL         className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl"
import.meta.env.VITE_API_URL       >
import.meta.env.VITE_API_URL         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
import.meta.env.VITE_API_URL         <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL         <div className="relative z-10">
import.meta.env.VITE_API_URL           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
import.meta.env.VITE_API_URL             <div className="flex items-center gap-4">
import.meta.env.VITE_API_URL               <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30">
import.meta.env.VITE_API_URL                 <Bot className="w-8 h-8 text-primary" />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div>
import.meta.env.VITE_API_URL                 <h2 className="text-xl font-bold">Assistente de IA TrataTudo</h2>
import.meta.env.VITE_API_URL                 <p className="text-slate-400 text-sm">Insights inteligentes sobre a sua operação em tempo real.</p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <button 
import.meta.env.VITE_API_URL               onClick={fetchAIInsights}
import.meta.env.VITE_API_URL               disabled={loadingAI}
import.meta.env.VITE_API_URL               className={cn(
import.meta.env.VITE_API_URL                 "px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2",
import.meta.env.VITE_API_URL                 loadingAI && "opacity-50 cursor-not-allowed"
import.meta.env.VITE_API_URL               )}
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
import.meta.env.VITE_API_URL               {loadingAI ? 'A analisar...' : 'Atualizar Insights'}
import.meta.env.VITE_API_URL             </button>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           {aiInsights ? (
import.meta.env.VITE_API_URL             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
import.meta.env.VITE_API_URL               {aiInsights.insights?.map((insight: any, idx: number) => (
import.meta.env.VITE_API_URL                 <motion.div 
import.meta.env.VITE_API_URL                   key={idx}
import.meta.env.VITE_API_URL                   initial={{ opacity: 0, scale: 0.95 }}
import.meta.env.VITE_API_URL                   animate={{ opacity: 1, scale: 1 }}
import.meta.env.VITE_API_URL                   transition={{ delay: idx * 0.1 }}
import.meta.env.VITE_API_URL                   className={cn(
import.meta.env.VITE_API_URL                     "p-5 rounded-2xl border backdrop-blur-sm transition-all hover:scale-[1.02]",
import.meta.env.VITE_API_URL                     insight.type === 'warning' ? "bg-orange-500/10 border-orange-500/20" :
import.meta.env.VITE_API_URL                     insight.type === 'error' ? "bg-red-500/10 border-red-500/20" :
import.meta.env.VITE_API_URL                     insight.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20" :
import.meta.env.VITE_API_URL                     "bg-white/5 border-white/10"
import.meta.env.VITE_API_URL                   )}
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <div className="flex items-center gap-2 mb-3">
import.meta.env.VITE_API_URL                     <div className={cn(
import.meta.env.VITE_API_URL                       "w-2 h-2 rounded-full",
import.meta.env.VITE_API_URL                       insight.type === 'warning' ? "bg-orange-500" :
import.meta.env.VITE_API_URL                       insight.type === 'error' ? "bg-red-500" :
import.meta.env.VITE_API_URL                       insight.type === 'success' ? "bg-emerald-500" :
import.meta.env.VITE_API_URL                       "bg-primary"
import.meta.env.VITE_API_URL                     )}></div>
import.meta.env.VITE_API_URL                     <h4 className="font-bold text-sm">{insight.title}</h4>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <p className="text-xs text-slate-300 leading-relaxed">{insight.description}</p>
import.meta.env.VITE_API_URL                 </motion.div>
import.meta.env.VITE_API_URL               ))}
import.meta.env.VITE_API_URL               <div className="md:col-span-3 mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
import.meta.env.VITE_API_URL                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
import.meta.env.VITE_API_URL                 <p className="text-sm text-slate-300 italic">"{aiInsights.summary}"</p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           ) : (
import.meta.env.VITE_API_URL             <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/10 border-dashed">
import.meta.env.VITE_API_URL               <Bot className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-20" />
import.meta.env.VITE_API_URL               <p className="text-slate-400 text-sm">Clica em "Atualizar Insights" para gerar uma análise da tua operação.</p>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           )}
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </motion.div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Summary Cards */}
import.meta.env.VITE_API_URL       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
import.meta.env.VITE_API_URL         {stats.map((stat, i) => (
import.meta.env.VITE_API_URL           <motion.div
import.meta.env.VITE_API_URL             key={stat.name}
import.meta.env.VITE_API_URL             initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL             transition={{ delay: i * 0.1 }}
import.meta.env.VITE_API_URL             className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <div className="flex justify-between items-start mb-3">
import.meta.env.VITE_API_URL               <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
import.meta.env.VITE_API_URL                 <stat.icon className="w-5 h-5" />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <div>
import.meta.env.VITE_API_URL               <p className="text-xs font-medium text-slate-500 mb-1">{stat.name}</p>
import.meta.env.VITE_API_URL               <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </motion.div>
import.meta.env.VITE_API_URL         ))}
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Charts Section */}
import.meta.env.VITE_API_URL       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
import.meta.env.VITE_API_URL         {/* Main Evolution Chart */}
import.meta.env.VITE_API_URL         <motion.div 
import.meta.env.VITE_API_URL           initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL           animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL           className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
import.meta.env.VITE_API_URL         >
import.meta.env.VITE_API_URL           <div className="flex items-center justify-between mb-6">
import.meta.env.VITE_API_URL             <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL               <TrendingUp className="w-5 h-5 text-primary" />
import.meta.env.VITE_API_URL               <h3 className="font-bold text-slate-900">Evolução de Pedidos</h3>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <select className="text-xs bg-slate-50 border-none rounded-lg px-2 py-1 outline-none font-bold text-slate-500">
import.meta.env.VITE_API_URL               <option>Últimos 30 dias</option>
import.meta.env.VITE_API_URL             </select>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <div className="h-[300px] w-full">
import.meta.env.VITE_API_URL             <ResponsiveContainer width="100%" height="100%">
import.meta.env.VITE_API_URL               <AreaChart data={data?.charts?.daily || []}>
import.meta.env.VITE_API_URL                 <defs>
import.meta.env.VITE_API_URL                   <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
import.meta.env.VITE_API_URL                     <stop offset="5%" stopColor="#4285F4" stopOpacity={0.1}/>
import.meta.env.VITE_API_URL                     <stop offset="95%" stopColor="#4285F4" stopOpacity={0}/>
import.meta.env.VITE_API_URL                   </linearGradient>
import.meta.env.VITE_API_URL                 </defs>
import.meta.env.VITE_API_URL                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
import.meta.env.VITE_API_URL                 <XAxis 
import.meta.env.VITE_API_URL                   dataKey="date" 
import.meta.env.VITE_API_URL                   axisLine={false} 
import.meta.env.VITE_API_URL                   tickLine={false} 
import.meta.env.VITE_API_URL                   tick={{fontSize: 10, fill: '#94a3b8'}}
import.meta.env.VITE_API_URL                   tickFormatter={(str) => {
import.meta.env.VITE_API_URL                     const d = new Date(str);
import.meta.env.VITE_API_URL                     return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
import.meta.env.VITE_API_URL                   }}
import.meta.env.VITE_API_URL                 />
import.meta.env.VITE_API_URL                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
import.meta.env.VITE_API_URL                 <Tooltip 
import.meta.env.VITE_API_URL                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
import.meta.env.VITE_API_URL                   labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
import.meta.env.VITE_API_URL                 />
import.meta.env.VITE_API_URL                 <Area 
import.meta.env.VITE_API_URL                   type="monotone" 
import.meta.env.VITE_API_URL                   dataKey="tickets" 
import.meta.env.VITE_API_URL                   name="Pedidos"
import.meta.env.VITE_API_URL                   stroke="#4285F4" 
import.meta.env.VITE_API_URL                   strokeWidth={3}
import.meta.env.VITE_API_URL                   fillOpacity={1} 
import.meta.env.VITE_API_URL                   fill="url(#colorTickets)" 
import.meta.env.VITE_API_URL                 />
import.meta.env.VITE_API_URL                 <Area 
import.meta.env.VITE_API_URL                   type="monotone" 
import.meta.env.VITE_API_URL                   dataKey="complaints" 
import.meta.env.VITE_API_URL                   name="Reclamações"
import.meta.env.VITE_API_URL                   stroke="#ef4444" 
import.meta.env.VITE_API_URL                   strokeWidth={2}
import.meta.env.VITE_API_URL                   fill="transparent"
import.meta.env.VITE_API_URL                 />
import.meta.env.VITE_API_URL               </AreaChart>
import.meta.env.VITE_API_URL             </ResponsiveContainer>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </motion.div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         {/* Distribution Charts */}
import.meta.env.VITE_API_URL         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
import.meta.env.VITE_API_URL           <motion.div 
import.meta.env.VITE_API_URL             initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL             transition={{ delay: 0.1 }}
import.meta.env.VITE_API_URL             className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <div className="flex items-center gap-2 mb-6">
import.meta.env.VITE_API_URL               <PieChartIcon className="w-5 h-5 text-primary" />
import.meta.env.VITE_API_URL               <h3 className="font-bold text-slate-900 text-sm">Estado dos Tickets</h3>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <div className="h-[200px] w-full">
import.meta.env.VITE_API_URL               <ResponsiveContainer width="100%" height="100%">
import.meta.env.VITE_API_URL                 <PieChart>
import.meta.env.VITE_API_URL                   <Pie
import.meta.env.VITE_API_URL                     data={[
import.meta.env.VITE_API_URL                       { name: 'Aberto', value: data?.charts?.statusDistribution.aberto || 0 },
import.meta.env.VITE_API_URL                       { name: 'Análise', value: data?.charts?.statusDistribution.analise || 0 },
import.meta.env.VITE_API_URL                       { name: 'Resolvido', value: data?.charts?.statusDistribution.resolvido || 0 },
import.meta.env.VITE_API_URL                     ]}
import.meta.env.VITE_API_URL                     cx="50%"
import.meta.env.VITE_API_URL                     cy="50%"
import.meta.env.VITE_API_URL                     innerRadius={60}
import.meta.env.VITE_API_URL                     outerRadius={80}
import.meta.env.VITE_API_URL                     paddingAngle={5}
import.meta.env.VITE_API_URL                     dataKey="value"
import.meta.env.VITE_API_URL                   >
import.meta.env.VITE_API_URL                     <Cell fill="#f97316" />
import.meta.env.VITE_API_URL                     <Cell fill="#3b82f6" />
import.meta.env.VITE_API_URL                     <Cell fill="#22c55e" />
import.meta.env.VITE_API_URL                   </Pie>
import.meta.env.VITE_API_URL                   <Tooltip />
import.meta.env.VITE_API_URL                 </PieChart>
import.meta.env.VITE_API_URL               </ResponsiveContainer>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <div className="flex justify-center gap-4 mt-4">
import.meta.env.VITE_API_URL               <div className="flex items-center gap-1.5">
import.meta.env.VITE_API_URL                 <div className="w-2 h-2 rounded-full bg-orange-500"></div>
import.meta.env.VITE_API_URL                 <span className="text-[10px] font-bold text-slate-500">Aberto</span>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className="flex items-center gap-1.5">
import.meta.env.VITE_API_URL                 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
import.meta.env.VITE_API_URL                 <span className="text-[10px] font-bold text-slate-500">Análise</span>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className="flex items-center gap-1.5">
import.meta.env.VITE_API_URL                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
import.meta.env.VITE_API_URL                 <span className="text-[10px] font-bold text-slate-500">Resolvido</span>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </motion.div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           <motion.div 
import.meta.env.VITE_API_URL             initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL             transition={{ delay: 0.2 }}
import.meta.env.VITE_API_URL             className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <div className="flex items-center gap-2 mb-6">
import.meta.env.VITE_API_URL               <BarChart3 className="w-5 h-5 text-primary" />
import.meta.env.VITE_API_URL               <h3 className="font-bold text-slate-900 text-sm">Tipos de Pedido</h3>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <div className="h-[200px] w-full">
import.meta.env.VITE_API_URL               <ResponsiveContainer width="100%" height="100%">
import.meta.env.VITE_API_URL                 <BarChart data={[
import.meta.env.VITE_API_URL                   { name: 'Pedidos', value: data?.charts?.typeDistribution.pedido || 0 },
import.meta.env.VITE_API_URL                   { name: 'Reclamações', value: data?.charts?.typeDistribution.reclamacao || 0 },
import.meta.env.VITE_API_URL                   { name: 'Outros', value: data?.charts?.typeDistribution.outro || 0 },
import.meta.env.VITE_API_URL                 ]}>
import.meta.env.VITE_API_URL                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
import.meta.env.VITE_API_URL                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
import.meta.env.VITE_API_URL                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
import.meta.env.VITE_API_URL                   <Tooltip cursor={{fill: 'transparent'}} />
import.meta.env.VITE_API_URL                   <Bar dataKey="value" fill="#4285F4" radius={[4, 4, 0, 0]} />
import.meta.env.VITE_API_URL                 </BarChart>
import.meta.env.VITE_API_URL               </ResponsiveContainer>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </motion.div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
import.meta.env.VITE_API_URL         {/* Left Column: Activity & Shortcuts */}
import.meta.env.VITE_API_URL         <div className="lg:col-span-2 space-y-8">
import.meta.env.VITE_API_URL           {/* Recent Activity */}
import.meta.env.VITE_API_URL           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
import.meta.env.VITE_API_URL             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
import.meta.env.VITE_API_URL               <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL                 <Activity className="w-5 h-5 text-primary" />
import.meta.env.VITE_API_URL                 <h3 className="font-bold text-slate-900">Atividade Recente</h3>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <button className="text-xs text-primary font-bold hover:underline">Ver histórico completo</button>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <div className="divide-y divide-slate-50">
import.meta.env.VITE_API_URL               {data?.activity?.map((item, i) => (
import.meta.env.VITE_API_URL                 <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
import.meta.env.VITE_API_URL                   <div className={cn(
import.meta.env.VITE_API_URL                     "p-2 rounded-lg bg-slate-50",
import.meta.env.VITE_API_URL                     item.type === 'ticket' ? "text-orange-500" : "text-blue-500"
import.meta.env.VITE_API_URL                   )}>
import.meta.env.VITE_API_URL                     {item.type === 'ticket' ? <ClipboardList className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div className="flex-1 min-w-0">
import.meta.env.VITE_API_URL                     <p className="text-sm font-bold text-slate-900 truncate">
import.meta.env.VITE_API_URL                       {item.type === 'ticket' ? 'Pedido: ' : 'Mensagem: '}
import.meta.env.VITE_API_URL                       {item.title}
import.meta.env.VITE_API_URL                     </p>
import.meta.env.VITE_API_URL                     <p className="text-xs text-slate-500 truncate">Estado: {item.status}</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
import.meta.env.VITE_API_URL                     {formatTime(item.created_at)}
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               ))}
import.meta.env.VITE_API_URL               {data?.activity.length === 0 && (
import.meta.env.VITE_API_URL                 <div className="p-8 text-center text-slate-500 text-sm">
import.meta.env.VITE_API_URL                   Nenhuma atividade recente encontrada.
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               )}
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           {/* Quick Shortcuts */}
import.meta.env.VITE_API_URL           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
import.meta.env.VITE_API_URL             {shortcuts.map((shortcut, i) => (
import.meta.env.VITE_API_URL               <Link
import.meta.env.VITE_API_URL                 key={i}
import.meta.env.VITE_API_URL                 to={shortcut.href}
import.meta.env.VITE_API_URL                 className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group text-center"
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 <div className={cn(
import.meta.env.VITE_API_URL                   "w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-slate-200",
import.meta.env.VITE_API_URL                   shortcut.color
import.meta.env.VITE_API_URL                 )}>
import.meta.env.VITE_API_URL                   <shortcut.icon className="w-6 h-6" />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">
import.meta.env.VITE_API_URL                   {shortcut.name}
import.meta.env.VITE_API_URL                 </span>
import.meta.env.VITE_API_URL               </Link>
import.meta.env.VITE_API_URL             ))}
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         {/* Right Column: Summaries */}
import.meta.env.VITE_API_URL         <div className="space-y-6">
import.meta.env.VITE_API_URL           {/* Instance Summary */}
import.meta.env.VITE_API_URL           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
import.meta.env.VITE_API_URL             <div className="flex items-center justify-between mb-6">
import.meta.env.VITE_API_URL               <h3 className="font-bold text-slate-900">Resumo da Instância</h3>
import.meta.env.VITE_API_URL               <Link to="/app/instancia" className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
import.meta.env.VITE_API_URL                 <ArrowRight className="w-4 h-4" />
import.meta.env.VITE_API_URL               </Link>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             
import.meta.env.VITE_API_URL             <div className="space-y-5">
import.meta.env.VITE_API_URL               <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
import.meta.env.VITE_API_URL                 <div className={cn(
import.meta.env.VITE_API_URL                   "w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-md",
import.meta.env.VITE_API_URL                   data?.instance?.status === 'online' ? "bg-green-500" : "bg-slate-400"
import.meta.env.VITE_API_URL                 )}>
import.meta.env.VITE_API_URL                   <Smartphone className="w-6 h-6" />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <p className="text-sm font-bold text-slate-900">{data?.instance?.instance_name || 'Sem Instância'}</p>
import.meta.env.VITE_API_URL                   <p className="text-[10px] text-slate-500">{user?.phone_e164}</p>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="space-y-3 px-1">
import.meta.env.VITE_API_URL                 <div className="flex justify-between items-center text-xs">
import.meta.env.VITE_API_URL                   <span className="text-slate-500">Estado da Ligação</span>
import.meta.env.VITE_API_URL                   <span className={cn(
import.meta.env.VITE_API_URL                     "flex items-center gap-1.5 font-bold",
import.meta.env.VITE_API_URL                     data?.instance?.status === 'conectado' ? "text-green-600" : "text-red-600"
import.meta.env.VITE_API_URL                   )}>
import.meta.env.VITE_API_URL                     <div className={cn(
import.meta.env.VITE_API_URL                       "w-1.5 h-1.5 rounded-full",
import.meta.env.VITE_API_URL                       data?.instance?.status === 'conectado' ? "bg-green-500 animate-pulse" : "bg-red-500"
import.meta.env.VITE_API_URL                     )}></div>
import.meta.env.VITE_API_URL                     {data?.instance?.status === 'conectado' ? 'Conectado' : 'Desconectado'}
import.meta.env.VITE_API_URL                   </span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="flex justify-between items-center text-xs">
import.meta.env.VITE_API_URL                   <span className="text-slate-500">Tipo de Instância</span>
import.meta.env.VITE_API_URL                   <span className="font-bold text-slate-900 flex items-center gap-1 capitalize">
import.meta.env.VITE_API_URL                     <ShieldCheck className="w-3 h-3 text-primary" />
import.meta.env.VITE_API_URL                     {data?.instance?.is_hub ? 'Hub Trial' : 'Instância Privada'}
import.meta.env.VITE_API_URL                   </span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="flex justify-between items-center text-xs">
import.meta.env.VITE_API_URL                   <span className="text-slate-500">Uptime (30 dias)</span>
import.meta.env.VITE_API_URL                   <span className="font-bold text-slate-900">{data?.instance?.status === 'online' ? '100%' : 'N/A'}</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           {/* Subscription Summary */}
import.meta.env.VITE_API_URL           <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
import.meta.env.VITE_API_URL             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
import.meta.env.VITE_API_URL             
import.meta.env.VITE_API_URL             <div className="flex items-center justify-between mb-6 relative z-10">
import.meta.env.VITE_API_URL               <h3 className="font-bold">Subscrição</h3>
import.meta.env.VITE_API_URL               <Zap className="w-5 h-5 text-primary" />
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             <div className="space-y-4 relative z-10">
import.meta.env.VITE_API_URL               <div>
import.meta.env.VITE_API_URL                 <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Plano Atual</p>
import.meta.env.VITE_API_URL                 <p className="text-xl font-display font-bold">
import.meta.env.VITE_API_URL                   {data?.subscription?.plan || 'Nenhum'}
import.meta.env.VITE_API_URL                 </p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="grid grid-cols-2 gap-4">
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Estado</p>
import.meta.env.VITE_API_URL                   <span className={cn(
import.meta.env.VITE_API_URL                     "text-xs font-bold flex items-center gap-1",
import.meta.env.VITE_API_URL                     data?.subscription?.status === 'active' ? "text-green-400" : "text-red-400"
import.meta.env.VITE_API_URL                   )}>
import.meta.env.VITE_API_URL                     {data?.subscription?.status === 'active' ? (
import.meta.env.VITE_API_URL                       <><CheckCircle2 className="w-3 h-3" /> Ativa</>
import.meta.env.VITE_API_URL                     ) : (
import.meta.env.VITE_API_URL                       <><AlertCircle className="w-3 h-3" /> Inativa</>
import.meta.env.VITE_API_URL                     )}
import.meta.env.VITE_API_URL                   </span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Expira em</p>
import.meta.env.VITE_API_URL                   <p className="text-xs font-bold">
import.meta.env.VITE_API_URL                     {data?.subscription?.ends_at 
import.meta.env.VITE_API_URL                       ? new Date(data.subscription.ends_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
import.meta.env.VITE_API_URL                       : 'N/A'}
import.meta.env.VITE_API_URL                   </p>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <Link 
import.meta.env.VITE_API_URL                 to="/app/subscricao"
import.meta.env.VITE_API_URL                 className="block w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-center text-xs font-bold transition-all"
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 Gerir Faturação
import.meta.env.VITE_API_URL               </Link>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
