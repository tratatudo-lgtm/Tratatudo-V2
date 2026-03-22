import.meta.env.VITE_API_URL import React, { useState, useEffect } from 'react';
import.meta.env.VITE_API_URL import { motion, AnimatePresence } from 'motion/react';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   Smartphone, 
import.meta.env.VITE_API_URL   Search, 
import.meta.env.VITE_API_URL   Filter, 
import.meta.env.VITE_API_URL   CheckCircle2, 
import.meta.env.VITE_API_URL   XCircle, 
import.meta.env.VITE_API_URL   AlertCircle, 
import.meta.env.VITE_API_URL   Loader2, 
import.meta.env.VITE_API_URL   RefreshCw,
import.meta.env.VITE_API_URL   Zap,
import.meta.env.VITE_API_URL   MessageSquare,
import.meta.env.VITE_API_URL   ShieldCheck,
import.meta.env.VITE_API_URL   Activity,
import.meta.env.VITE_API_URL   ArrowRight,
import.meta.env.VITE_API_URL   ExternalLink,
import.meta.env.VITE_API_URL   Plus,
import.meta.env.VITE_API_URL   X,
import.meta.env.VITE_API_URL   Users,
import.meta.env.VITE_API_URL   QrCode
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { useLocation, useNavigate } from 'react-router-dom';
import.meta.env.VITE_API_URL import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import.meta.env.VITE_API_URL import { cn, extractArrayResponse } from '../../lib/utils';
import.meta.env.VITE_API_URL import { toast } from 'sonner';
import.meta.env.VITE_API_URL import { LoadingState, ErrorState } from '../../components/States';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface Instance {
import.meta.env.VITE_API_URL   id: string;
import.meta.env.VITE_API_URL   client_id: string;
import.meta.env.VITE_API_URL   company_name: string;
import.meta.env.VITE_API_URL   instance_name: string;
import.meta.env.VITE_API_URL   status: 'online' | 'offline' | 'connecting';
import.meta.env.VITE_API_URL   whatsapp_number: string;
import.meta.env.VITE_API_URL   last_connected: string;
import.meta.env.VITE_API_URL   is_hub: boolean;
import.meta.env.VITE_API_URL   updated_at: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function AdminInstances() {
import.meta.env.VITE_API_URL   const [instances, setInstances] = useState<Instance[]>([]);
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(true);
import.meta.env.VITE_API_URL   const [error, setError] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [searchTerm, setSearchTerm] = useState('');
import.meta.env.VITE_API_URL   
import.meta.env.VITE_API_URL   // New state for creation
import.meta.env.VITE_API_URL   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
import.meta.env.VITE_API_URL   const [clients, setClients] = useState<any[]>([]);
import.meta.env.VITE_API_URL   const [selectedClientId, setSelectedClientId] = useState('');
import.meta.env.VITE_API_URL   const [qrCode, setQrCode] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [isCreating, setIsCreating] = useState(false);
import.meta.env.VITE_API_URL   const [isFetchingQr, setIsFetchingQr] = useState(false);
import.meta.env.VITE_API_URL   
import.meta.env.VITE_API_URL   const location = useLocation();
import.meta.env.VITE_API_URL   const navigate = useNavigate();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const { logout } = useAdminAuth();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchInstances = async () => {
import.meta.env.VITE_API_URL     const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL     const endpoints = [
import.meta.env.VITE_API_URL       `${baseUrl}/api/admin/instances`,
import.meta.env.VITE_API_URL       `${baseUrl}/api/instances`
import.meta.env.VITE_API_URL     ];
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     let lastError = null;
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setLoading(true);
import.meta.env.VITE_API_URL       setError(null);
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       for (const url of endpoints) {
import.meta.env.VITE_API_URL         console.log(`[ADMIN] Fetching instances: ${url}`);
import.meta.env.VITE_API_URL         try {
import.meta.env.VITE_API_URL           const res = await fetch(url, {
import.meta.env.VITE_API_URL             credentials: 'include'
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL           
import.meta.env.VITE_API_URL           if (res.ok) {
import.meta.env.VITE_API_URL             const data = await res.json();
import.meta.env.VITE_API_URL             const instancesData = extractArrayResponse<Instance>(data, 'instances');
import.meta.env.VITE_API_URL             setInstances(instancesData);
import.meta.env.VITE_API_URL             setLoading(false);
import.meta.env.VITE_API_URL             return;
import.meta.env.VITE_API_URL           } else if (res.status === 401) {
import.meta.env.VITE_API_URL             console.warn('[ADMIN] Session expired, logging out...');
import.meta.env.VITE_API_URL             await logout();
import.meta.env.VITE_API_URL             return;
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         } catch (e) {
import.meta.env.VITE_API_URL           lastError = e;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       throw lastError || new Error('Falha ao carregar instâncias WhatsApp');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error('[ADMIN] Fetch instances failed:', err);
import.meta.env.VITE_API_URL       setError(err.message || 'Não foi possível carregar as instâncias.');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       // Professional fallback for demo/development
import.meta.env.VITE_API_URL       if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
import.meta.env.VITE_API_URL         console.log('[ADMIN] Using fallback instances data');
import.meta.env.VITE_API_URL         setInstances([
import.meta.env.VITE_API_URL           {
import.meta.env.VITE_API_URL             id: '1',
import.meta.env.VITE_API_URL             client_id: '1',
import.meta.env.VITE_API_URL             company_name: 'João Silva Lda',
import.meta.env.VITE_API_URL             instance_name: 'TT-JOAO',
import.meta.env.VITE_API_URL             status: 'online',
import.meta.env.VITE_API_URL             whatsapp_number: '+351912345678',
import.meta.env.VITE_API_URL             last_connected: new Date().toISOString(),
import.meta.env.VITE_API_URL             is_hub: true,
import.meta.env.VITE_API_URL             updated_at: new Date().toISOString()
import.meta.env.VITE_API_URL           },
import.meta.env.VITE_API_URL           {
import.meta.env.VITE_API_URL             id: '2',
import.meta.env.VITE_API_URL             client_id: '2',
import.meta.env.VITE_API_URL             company_name: 'Maria Santos Unipessoal',
import.meta.env.VITE_API_URL             instance_name: 'TT-MARIA',
import.meta.env.VITE_API_URL             status: 'offline',
import.meta.env.VITE_API_URL             whatsapp_number: '+351919876543',
import.meta.env.VITE_API_URL             last_connected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
import.meta.env.VITE_API_URL             is_hub: false,
import.meta.env.VITE_API_URL             updated_at: new Date().toISOString()
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         ]);
import.meta.env.VITE_API_URL         setError(null);
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     fetchInstances();
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     // Check for create query param
import.meta.env.VITE_API_URL     const params = new URLSearchParams(location.search);
import.meta.env.VITE_API_URL     const createClientId = params.get('create');
import.meta.env.VITE_API_URL     if (createClientId) {
import.meta.env.VITE_API_URL       handleOpenCreateModal(createClientId);
import.meta.env.VITE_API_URL       // Clean up URL
import.meta.env.VITE_API_URL       navigate('/admin/instances', { replace: true });
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   }, [location.search]);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchClients = async () => {
import.meta.env.VITE_API_URL     const url = `${import.meta.env.VITE_API_URL}/api/admin/clients`;
import.meta.env.VITE_API_URL     console.log(`[ADMIN] Fetching clients for modal: ${url}`);
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const response = await fetch(url, {
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       console.log(`[ADMIN] Fetch clients status: ${response.status}`);
import.meta.env.VITE_API_URL       if (!response.ok) {
import.meta.env.VITE_API_URL         if (response.status === 401) {
import.meta.env.VITE_API_URL           await logout();
import.meta.env.VITE_API_URL           return;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL         const errorData = await response.json().catch(() => ({}));
import.meta.env.VITE_API_URL         throw new Error(errorData.message || errorData.error || 'Falha ao carregar clientes');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL       const result = await response.json();
import.meta.env.VITE_API_URL       setClients(extractArrayResponse<any>(result, 'clients'));
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error('[ADMIN] Fetch clients failed:', err);
import.meta.env.VITE_API_URL       toast.error(err.message || 'Erro ao carregar lista de clientes');
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleOpenCreateModal = (clientId?: string) => {
import.meta.env.VITE_API_URL     setIsCreateModalOpen(true);
import.meta.env.VITE_API_URL     fetchClients();
import.meta.env.VITE_API_URL     setQrCode(null);
import.meta.env.VITE_API_URL     setSelectedClientId(clientId || '');
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleCreateInstance = async () => {
import.meta.env.VITE_API_URL     if (!selectedClientId) {
import.meta.env.VITE_API_URL       toast.error('Por favor, selecione um cliente');
import.meta.env.VITE_API_URL       return;
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     setIsCreating(true);
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/instances/create`, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         body: JSON.stringify({ client_id: selectedClientId }),
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       const result = await response.json();
import.meta.env.VITE_API_URL       if (!response.ok) throw new Error(result.error || 'Erro ao criar instância');
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       toast.success('Instância criada com sucesso!');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       // Now fetch QR Code
import.meta.env.VITE_API_URL       handleFetchQrCode(result.instance.instance_name);
import.meta.env.VITE_API_URL       fetchInstances();
import.meta.env.VITE_API_URL     } catch (err) {
import.meta.env.VITE_API_URL       toast.error(err instanceof Error ? err.message : 'Erro ao criar instância');
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setIsCreating(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleFetchQrCode = async (instanceName: string) => {
import.meta.env.VITE_API_URL     setIsFetchingQr(true);
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/instances/qrcode/${instanceName}`, {
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       const result = await response.json();
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       if (!response.ok) throw new Error(result.error || 'Erro ao obter QR Code');
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       // Evolution API usually returns base64 in result.base64 or similar
import.meta.env.VITE_API_URL       if (result.base64) {
import.meta.env.VITE_API_URL         setQrCode(result.base64);
import.meta.env.VITE_API_URL       } else if (result.code) {
import.meta.env.VITE_API_URL         // If it returns a code, we might need to generate QR on frontend or it's already a base64
import.meta.env.VITE_API_URL         setQrCode(result.code);
import.meta.env.VITE_API_URL       } else {
import.meta.env.VITE_API_URL         toast.error('QR Code não disponível de momento. Tente novamente em instantes.');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } catch (err) {
import.meta.env.VITE_API_URL       toast.error(err instanceof Error ? err.message : 'Erro ao obter QR Code');
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setIsFetchingQr(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const filteredInstances = instances.filter(inst => 
import.meta.env.VITE_API_URL     inst.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
import.meta.env.VITE_API_URL     inst.instance_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
import.meta.env.VITE_API_URL     inst.whatsapp_number.toLowerCase().includes(searchTerm.toLowerCase())
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (loading) {
import.meta.env.VITE_API_URL     return <LoadingState message="A carregar estado das instâncias..." className="h-[60vh]" />;
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (error) {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
import.meta.env.VITE_API_URL         <ErrorState message={error} />
import.meta.env.VITE_API_URL         <button 
import.meta.env.VITE_API_URL           onClick={fetchInstances}
import.meta.env.VITE_API_URL           className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
import.meta.env.VITE_API_URL         >
import.meta.env.VITE_API_URL           Tentar novamente
import.meta.env.VITE_API_URL         </button>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="space-y-8 max-w-7xl mx-auto">
import.meta.env.VITE_API_URL       {/* Header */}
import.meta.env.VITE_API_URL       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
import.meta.env.VITE_API_URL         <div>
import.meta.env.VITE_API_URL           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Instâncias WhatsApp</h1>
import.meta.env.VITE_API_URL           <p className="text-slate-500 font-medium">Monitorização em tempo real das ligações</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL           <button 
import.meta.env.VITE_API_URL             onClick={() => handleOpenCreateModal()}
import.meta.env.VITE_API_URL             className="px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <Plus className="w-4 h-4" />
import.meta.env.VITE_API_URL             Criar Instância
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL           <div className="relative">
import.meta.env.VITE_API_URL             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL             <input 
import.meta.env.VITE_API_URL               type="text" 
import.meta.env.VITE_API_URL               placeholder="Pesquisar instância..." 
import.meta.env.VITE_API_URL               value={searchTerm}
import.meta.env.VITE_API_URL               onChange={(e) => setSearchTerm(e.target.value)}
import.meta.env.VITE_API_URL               className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 shadow-sm"
import.meta.env.VITE_API_URL             />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
import.meta.env.VITE_API_URL             <RefreshCw className="w-5 h-5" />
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Instances Grid */}
import.meta.env.VITE_API_URL       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
import.meta.env.VITE_API_URL         {filteredInstances.map((inst, index) => (
import.meta.env.VITE_API_URL           <motion.div
import.meta.env.VITE_API_URL             key={inst.id}
import.meta.env.VITE_API_URL             initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL             transition={{ delay: index * 0.05 }}
import.meta.env.VITE_API_URL             className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all p-8 group"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <div className="flex items-center justify-between mb-6">
import.meta.env.VITE_API_URL               <div className={cn(
import.meta.env.VITE_API_URL                 "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
import.meta.env.VITE_API_URL                 inst.status === 'online' ? "bg-emerald-500 shadow-emerald-500/20" : 
import.meta.env.VITE_API_URL                 inst.status === 'offline' ? "bg-red-500 shadow-red-500/20" : "bg-orange-500 shadow-orange-500/20"
import.meta.env.VITE_API_URL               )}>
import.meta.env.VITE_API_URL                 <Smartphone className="w-7 h-7 text-white" />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className="flex flex-col items-end gap-2">
import.meta.env.VITE_API_URL                 <div className={cn(
import.meta.env.VITE_API_URL                   "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
import.meta.env.VITE_API_URL                   inst.status === 'online' ? "bg-emerald-50 text-emerald-600" : 
import.meta.env.VITE_API_URL                   inst.status === 'offline' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
import.meta.env.VITE_API_URL                 )}>
import.meta.env.VITE_API_URL                   {inst.status === 'online' ? <CheckCircle2 className="w-3 h-3" /> : 
import.meta.env.VITE_API_URL                    inst.status === 'offline' ? <XCircle className="w-3 h-3" /> : <Activity className="w-3 h-3 animate-pulse" />}
import.meta.env.VITE_API_URL                   {inst.status}
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <span className={cn(
import.meta.env.VITE_API_URL                   "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
import.meta.env.VITE_API_URL                   inst.is_hub ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
import.meta.env.VITE_API_URL                 )}>
import.meta.env.VITE_API_URL                   {inst.is_hub ? 'HUB PARTILHADA' : 'INSTÂNCIA PRIVADA'}
import.meta.env.VITE_API_URL                 </span>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             <div className="space-y-4">
import.meta.env.VITE_API_URL               <div>
import.meta.env.VITE_API_URL                 <h3 className="text-lg font-black text-slate-900 tracking-tight">{inst.instance_name}</h3>
import.meta.env.VITE_API_URL                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{inst.company_name}</p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
import.meta.env.VITE_API_URL                 <div className="flex items-center justify-between">
import.meta.env.VITE_API_URL                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">WhatsApp</span>
import.meta.env.VITE_API_URL                   <span className="text-xs font-black text-slate-900 tracking-tight">{inst.whatsapp_number}</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="flex items-center justify-between">
import.meta.env.VITE_API_URL                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Última Atividade</span>
import.meta.env.VITE_API_URL                   <span className="text-xs font-black text-slate-900 tracking-tight">
import.meta.env.VITE_API_URL                     {new Date(inst.updated_at || inst.last_connected).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
import.meta.env.VITE_API_URL                   </span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="flex items-center gap-2 pt-2">
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   onClick={() => handleFetchQrCode(inst.instance_name)}
import.meta.env.VITE_API_URL                   className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <QrCode className="w-4 h-4" />
import.meta.env.VITE_API_URL                   Sincronizar
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL                 <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
import.meta.env.VITE_API_URL                   <RefreshCw className="w-4 h-4" />
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </motion.div>
import.meta.env.VITE_API_URL         ))}
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {filteredInstances.length === 0 && (
import.meta.env.VITE_API_URL         <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-20 text-center">
import.meta.env.VITE_API_URL           <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
import.meta.env.VITE_API_URL             <Smartphone className="w-8 h-8" />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <p className="text-slate-500 font-medium tracking-tight">Nenhuma instância encontrada.</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       )}
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Create Instance Modal */}
import.meta.env.VITE_API_URL       <AnimatePresence>
import.meta.env.VITE_API_URL         {isCreateModalOpen && (
import.meta.env.VITE_API_URL           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
import.meta.env.VITE_API_URL             <motion.div
import.meta.env.VITE_API_URL               initial={{ opacity: 0, scale: 0.95, y: 20 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1, scale: 1, y: 0 }}
import.meta.env.VITE_API_URL               exit={{ opacity: 0, scale: 0.95, y: 20 }}
import.meta.env.VITE_API_URL               className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL                   <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
import.meta.env.VITE_API_URL                     <Smartphone className="w-6 h-6 text-white" />
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div>
import.meta.env.VITE_API_URL                     <h2 className="text-xl font-black text-slate-900 tracking-tight">Nova Instância</h2>
import.meta.env.VITE_API_URL                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Evolution API Integration</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   onClick={() => setIsCreateModalOpen(false)}
import.meta.env.VITE_API_URL                   className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-900"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <X className="w-6 h-6" />
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="p-8 space-y-6">
import.meta.env.VITE_API_URL                 {!qrCode ? (
import.meta.env.VITE_API_URL                   <>
import.meta.env.VITE_API_URL                     <div className="space-y-2">
import.meta.env.VITE_API_URL                       <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Selecionar Cliente</label>
import.meta.env.VITE_API_URL                       <div className="relative">
import.meta.env.VITE_API_URL                         <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
import.meta.env.VITE_API_URL                         <select
import.meta.env.VITE_API_URL                           value={selectedClientId}
import.meta.env.VITE_API_URL                           onChange={(e) => setSelectedClientId(e.target.value)}
import.meta.env.VITE_API_URL                           className="w-full bg-slate-50 border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold appearance-none"
import.meta.env.VITE_API_URL                         >
import.meta.env.VITE_API_URL                           <option value="">Selecione um cliente...</option>
import.meta.env.VITE_API_URL                           {clients.map(client => (
import.meta.env.VITE_API_URL                             <option key={client.id} value={client.client_id}>
import.meta.env.VITE_API_URL                               {client.company_name} ({client.client_id})
import.meta.env.VITE_API_URL                             </option>
import.meta.env.VITE_API_URL                           ))}
import.meta.env.VITE_API_URL                         </select>
import.meta.env.VITE_API_URL                       </div>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                     <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3">
import.meta.env.VITE_API_URL                       <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
import.meta.env.VITE_API_URL                       <p className="text-xs text-blue-700 font-medium leading-relaxed">
import.meta.env.VITE_API_URL                         Ao criar a instância, o sistema irá gerar automaticamente um identificador único na Evolution API e preparar o QR Code para ligação.
import.meta.env.VITE_API_URL                       </p>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                     <button
import.meta.env.VITE_API_URL                       onClick={handleCreateInstance}
import.meta.env.VITE_API_URL                       disabled={isCreating || !selectedClientId}
import.meta.env.VITE_API_URL                       className="w-full bg-primary text-white rounded-2xl py-4 font-black shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
import.meta.env.VITE_API_URL                     >
import.meta.env.VITE_API_URL                       {isCreating ? (
import.meta.env.VITE_API_URL                         <>
import.meta.env.VITE_API_URL                           <Loader2 className="w-5 h-5 animate-spin" />
import.meta.env.VITE_API_URL                           A CRIAR INSTÂNCIA...
import.meta.env.VITE_API_URL                         </>
import.meta.env.VITE_API_URL                       ) : (
import.meta.env.VITE_API_URL                         <>
import.meta.env.VITE_API_URL                           <Zap className="w-5 h-5" />
import.meta.env.VITE_API_URL                           CRIAR E GERAR QR CODE
import.meta.env.VITE_API_URL                         </>
import.meta.env.VITE_API_URL                       )}
import.meta.env.VITE_API_URL                     </button>
import.meta.env.VITE_API_URL                   </>
import.meta.env.VITE_API_URL                 ) : (
import.meta.env.VITE_API_URL                   <div className="flex flex-col items-center text-center space-y-6 py-4">
import.meta.env.VITE_API_URL                     <div className="relative group">
import.meta.env.VITE_API_URL                       <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-xl group-hover:bg-primary/10 transition-all" />
import.meta.env.VITE_API_URL                       <div className="relative bg-white p-6 rounded-[2.5rem] border-2 border-primary/20 shadow-xl">
import.meta.env.VITE_API_URL                         {isFetchingQr ? (
import.meta.env.VITE_API_URL                           <div className="w-64 h-64 flex items-center justify-center">
import.meta.env.VITE_API_URL                             <Loader2 className="w-12 h-12 text-primary animate-spin" />
import.meta.env.VITE_API_URL                           </div>
import.meta.env.VITE_API_URL                         ) : (
import.meta.env.VITE_API_URL                           <img 
import.meta.env.VITE_API_URL                             src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`} 
import.meta.env.VITE_API_URL                             alt="WhatsApp QR Code" 
import.meta.env.VITE_API_URL                             className="w-64 h-64 rounded-xl"
import.meta.env.VITE_API_URL                           />
import.meta.env.VITE_API_URL                         )}
import.meta.env.VITE_API_URL                       </div>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                     <div className="space-y-2">
import.meta.env.VITE_API_URL                       <h3 className="text-lg font-black text-slate-900 tracking-tight">Digitalize o QR Code</h3>
import.meta.env.VITE_API_URL                       <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
import.meta.env.VITE_API_URL                         Abra o WhatsApp no seu telemóvel, vá a Dispositivos Ligados e aponte a câmara para este ecrã.
import.meta.env.VITE_API_URL                       </p>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                     <div className="flex items-center gap-3 w-full pt-4">
import.meta.env.VITE_API_URL                       <button
import.meta.env.VITE_API_URL                         onClick={() => handleFetchQrCode(`client-${selectedClientId}`)}
import.meta.env.VITE_API_URL                         disabled={isFetchingQr}
import.meta.env.VITE_API_URL                         className="flex-1 bg-slate-100 text-slate-600 rounded-2xl py-4 font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
import.meta.env.VITE_API_URL                       >
import.meta.env.VITE_API_URL                         <RefreshCw className={cn("w-5 h-5", isFetchingQr && "animate-spin")} />
import.meta.env.VITE_API_URL                         ATUALIZAR
import.meta.env.VITE_API_URL                       </button>
import.meta.env.VITE_API_URL                       <button
import.meta.env.VITE_API_URL                         onClick={() => setIsCreateModalOpen(false)}
import.meta.env.VITE_API_URL                         className="flex-1 bg-primary text-white rounded-2xl py-4 font-black shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
import.meta.env.VITE_API_URL                       >
import.meta.env.VITE_API_URL                         CONCLUÍDO
import.meta.env.VITE_API_URL                       </button>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 )}
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL       </AnimatePresence>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
