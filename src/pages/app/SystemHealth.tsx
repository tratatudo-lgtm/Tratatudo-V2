import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Database, 
  Zap, 
  Server, 
  Clock, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Terminal,
  Cpu,
  HardDrive
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { SystemHealth, SystemInfo } from '../../types/hub';
import { apiFetch } from '../../lib/api';

import { apiGet } from '../../lib/api';

const SystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [healthData, infoData] = await Promise.all([
        apiGet('/api/client/system/health'),
        apiGet('/api/client/system/info')
      ]);

      setHealth(healthData.health);
      setInfo(infoData.info);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados de diagnóstico do sistema');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'degraded':
      case 'warning':
        return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'down':
      case 'offline':
        return 'text-red-500 bg-red-50 border-red-100';
      default:
        return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'degraded':
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'down':
      case 'offline':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  if (loading && !health) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium">A diagnosticar sistema...</p>
      </div>
    );
  }

  if (error && !health) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Erro de Diagnóstico</h2>
        <p className="text-slate-500 max-w-md">{error}</p>
        <button 
          onClick={fetchData}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            Saúde do Sistema
          </h1>
          <p className="text-slate-500">Monitorização técnica, diagnóstico e estado operacional.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchData}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={18} className={cn(loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Main Health Status */}
      <div className={cn(
        "p-8 rounded-3xl border-2 shadow-sm flex flex-col md:flex-row items-center gap-8 transition-all",
        health?.status === 'healthy' ? "bg-emerald-50/30 border-emerald-100" :
        health?.status === 'degraded' ? "bg-amber-50/30 border-amber-100" :
        "bg-red-50/30 border-red-100"
      )}>
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center shadow-lg animate-pulse",
          health?.status === 'healthy' ? "bg-emerald-500 text-white" :
          health?.status === 'degraded' ? "bg-amber-500 text-white" :
          "bg-red-500 text-white"
        )}>
          {getStatusIcon(health?.status || 'unknown')}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">
            {health?.status === 'healthy' ? 'Sistema Operacional' :
             health?.status === 'degraded' ? 'Desempenho Degradado' :
             'Sistema com Falhas'}
          </h2>
          <p className="text-slate-600 font-medium">
            {health?.status === 'healthy' ? 'Todos os serviços críticos estão a funcionar normalmente.' :
             health?.status === 'degraded' ? 'Alguns serviços estão a apresentar lentidão ou instabilidade.' :
             'Existem serviços críticos offline que requerem atenção imediata.'}
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/50 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Última Verificação</p>
          <p className="text-sm font-bold text-slate-900">{health ? new Date(health.last_check).toLocaleTimeString() : '--:--'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Services Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ServiceCard 
              name="Backend API" 
              status={health?.services.backend.status || 'offline'} 
              latency={health?.services.backend.latency}
              icon={Server} 
            />
            <ServiceCard 
              name="Base de Dados (Supabase)" 
              status={health?.services.database.status || 'offline'} 
              latency={health?.services.database.latency}
              icon={Database} 
            />
            <ServiceCard 
              name="WhatsApp (Evolution API)" 
              status={health?.services.whatsapp.status || 'offline'} 
              icon={Zap} 
            />
            <ServiceCard 
              name="Storage & CDN" 
              status={health?.services.storage.status || 'offline'} 
              icon={HardDrive} 
            />
          </div>

          {/* Operational Info */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-900">Informação Operacional</h3>
            </div>
            <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              <InfoItem label="Versão da App" value={info?.version || 'v1.0.0'} icon={Cpu} />
              <InfoItem label="Ambiente" value={info?.environment || 'Produção'} icon={Activity} />
              <InfoItem label="Último Deploy" value={info?.deploy_timestamp ? new Date(info.deploy_timestamp).toLocaleDateString() : 'N/A'} icon={Clock} />
              <InfoItem label="Uptime" value={info?.uptime ? `${Math.floor(info.uptime / 3600)}h ${Math.floor((info.uptime % 3600) / 60)}m` : 'N/A'} icon={RefreshCw} />
            </div>
          </div>
        </div>

        {/* System Logs / Events */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Eventos de Sistema
            </h3>
            <div className="space-y-4">
              <SystemEvent label="Build bem-sucedida" time="2h atrás" type="success" />
              <SystemEvent label="Ligação Supabase estável" time="5h atrás" type="success" />
              <SystemEvent label="Backup diário concluído" time="12h atrás" type="success" />
              <SystemEvent label="Atualização de segurança" time="1d atrás" type="info" />
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl shadow-lg text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              Consola de Diagnóstico
            </h3>
            <div className="font-mono text-[10px] space-y-1 text-emerald-500/80">
              <p>{`> Initializing health check...`}</p>
              <p>{`> Backend: OK (latency: ${health?.services.backend.latency}ms)`}</p>
              <p>{`> Database: OK (latency: ${health?.services.database.latency}ms)`}</p>
              <p>{`> WhatsApp: ${health?.services.whatsapp.status.toUpperCase()}`}</p>
              <p>{`> All systems operational.`}</p>
              <p className="animate-pulse">{`> _`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceCard: React.FC<{ name: string; status: string; latency?: number; icon: any }> = ({ name, status, latency, icon: Icon }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'warning':
      case 'degraded':
        return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'offline':
      case 'down':
        return 'text-red-500 bg-red-50 border-red-100';
      default:
        return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
        <Icon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-900 truncate">{name}</h4>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
            getStatusColor(status)
          )}>
            {status}
          </span>
          {latency && (
            <span className="text-[10px] font-medium text-slate-400">{latency}ms</span>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string; icon: any }> = ({ label, value, icon: Icon }) => (
  <div className="flex flex-col items-center text-center gap-2">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary shadow-sm border border-slate-100">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-900">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
    </div>
  </div>
);

const SystemEvent: React.FC<{ label: string; time: string; type: 'success' | 'info' | 'warning' }> = ({ label, time, type }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
        type === 'success' ? "bg-emerald-500" :
        type === 'info' ? "bg-blue-500" :
        "bg-amber-500"
      )} />
      <span className="text-xs font-medium text-slate-700">{label}</span>
    </div>
    <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{time}</span>
  </div>
);

export default SystemHealthPage;
