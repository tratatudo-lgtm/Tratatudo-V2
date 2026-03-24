import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Search, 
  Filter, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  Terminal,
  ShieldAlert,
  Database,
  Server,
  Smartphone,
  MessageSquare,
  ArrowRight,
  Download
} from 'lucide-react';
import { cn, extractArrayResponse } from '../../lib/utils';
import { useAdminAuth } from '../../lib/auth/AdminAuthContext';

interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  source: 'api' | 'whatsapp' | 'database' | 'auth' | 'system';
  message: string;
  details?: string;
  created_at: string;
}

export function AdminLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const { logout } = useAdminAuth();

  useEffect(() => {
    const fetchLogs = async () => {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';
      const url = `${baseUrl}/api/admin/logs`;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const logsData = extractArrayResponse<SystemLog>(data, 'logs');
          setLogs(logsData);
        } else if (response.status === 401) {
          await logout();
        } else {
          throw new Error('Falha ao carregar logs do sistema');
        }
      } catch (err: any) {
        console.error('[ADMIN] Fetch logs failed:', err);
        setError(err.message || 'Não foi possível carregar os logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-slate-500 font-medium tracking-tight">A carregar logs do sistema...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Logs do Sistema</h1>
          <p className="text-slate-500 font-medium tracking-tight">Monitorização de erros e eventos da plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar nos logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 shadow-sm"
            />
          </div>
          <select 
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm font-bold text-slate-600"
          >
            <option value="all">Todos os Níveis</option>
            <option value="info">Informação</option>
            <option value="warning">Aviso</option>
            <option value="error">Erro</option>
            <option value="critical">Crítico</option>
          </select>
          <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-black text-slate-300 uppercase tracking-widest">System Console</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Monitoring</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/30 border-b border-slate-800">
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Level</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Source</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Message</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {filteredLogs.map((log, index) => (
                <motion.tr 
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className="group hover:bg-slate-800/50 transition-colors border-b border-slate-800/50"
                >
                  <td className="px-8 py-4 text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString([], { hour12: false })}
                  </td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                      log.level === 'critical' ? "bg-red-500/10 text-red-500" : 
                      log.level === 'error' ? "bg-orange-500/10 text-orange-500" : 
                      log.level === 'warning' ? "bg-yellow-500/10 text-yellow-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                      {log.level}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      {log.source === 'api' ? <Server className="w-3 h-3" /> : 
                       log.source === 'whatsapp' ? <Smartphone className="w-3 h-3" /> : 
                       log.source === 'database' ? <Database className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      <span className="uppercase tracking-widest text-[10px] font-bold">{log.source}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-slate-300 max-w-md truncate">
                    {log.message}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="p-1.5 text-slate-500 hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-slate-500 font-medium tracking-tight">Nenhum log encontrado com estes filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
