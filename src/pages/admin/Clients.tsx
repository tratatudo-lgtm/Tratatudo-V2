import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit2, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  Mail,
  Phone,
  Calendar,
  Loader2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { cn, extractArrayResponse } from '../../lib/utils';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';

interface Client {
  id: string;
  client_id: string;
  company_name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'pending';
  plan: string;
  created_at: string;
}

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = async () => {
    const url = `${import.meta.env.VITE_API_URL}/api/admin/clients`;
    console.log(`[ADMIN] Fetching clients: ${url}`);
    try {
      setLoading(true);
      const response = await fetch(url, {
        credentials: 'include',
        credentials: 'include'
      });
      console.log(`[ADMIN] Fetch clients status: ${response.status}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Falha ao carregar clientes');
      }
      const result = await response.json();
      setClients(extractArrayResponse<Client>(result, 'clients'));
    } catch (err: any) {
      console.error('[ADMIN] Fetch clients failed:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/clients/${id}/status`, {
        credentials: 'include',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Falha ao atualizar estado');
      
      setClients(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
    } catch (err) {
      alert('Erro ao atualizar estado do cliente');
    }
  };

  const filteredClients = clients.filter(client => 
    client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.client_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingState message="A carregar lista de clientes..." className="h-[60vh]" />;
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <ErrorState message={error} />
        <button 
          onClick={fetchClients}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Clientes</h1>
          <p className="text-slate-500 font-medium">Administre os utilizadores da plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 shadow-sm"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Plano</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.map((client) => (
                <motion.tr 
                  key={client.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{client.company_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          Desde {new Date(client.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-900 tracking-tight">{client.client_id}</span>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">{client.plan}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      client.status === 'active' ? "bg-emerald-50 text-emerald-600" : 
                      client.status === 'suspended' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                    )}>
                      {client.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : 
                       client.status === 'suspended' ? <XCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {client.status === 'active' ? 'Ativo' : client.status === 'suspended' ? 'Suspenso' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleToggleStatus(client.id, client.status)}
                        className={cn(
                          "p-2 rounded-xl border transition-all shadow-sm",
                          client.status === 'active' 
                            ? "bg-white border-red-100 text-red-500 hover:bg-red-50" 
                            : "bg-white border-emerald-100 text-emerald-500 hover:bg-emerald-50"
                        )}
                        title={client.status === 'active' ? 'Suspender' : 'Ativar'}
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => window.location.href = `/admin/instances?create=${client.client_id}`}
                        className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-emerald-500 transition-all shadow-sm"
                        title="Criar Instância WhatsApp"
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-primary transition-all shadow-sm">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredClients.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">Nenhum cliente encontrado com estes critérios.</p>
          </div>
        )}
      </div>
    </div>
  );
}
