import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  Loader2, 
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Email } from '../../types/hub';
import { apiFetch } from '../../lib/api';
import { StatCard } from '../../components/app/StatCard';
import { SearchInput } from '../../components/app/SearchInput';
import { FilterDropdown } from '../../components/app/FilterDropdown';
import { ActionButton } from '../../components/app/ActionButton';
import { DataTable } from '../../components/app/DataTable';
import { EmptyState } from '../../components/app/EmptyState';
import { StatusBadge } from '../../components/app/StatusBadge';

import { apiGet } from '../../lib/api';

const Emails: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/api/client/emails');
      setEmails(data.emails);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar emails');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(search.toLowerCase()) ||
                         email.from_email.toLowerCase().includes(search.toLowerCase()) ||
                         email.to_email.toLowerCase().includes(search.toLowerCase());
    const matchesDirection = directionFilter === 'todos' || email.direction === directionFilter;
    const matchesStatus = statusFilter === 'todos' || email.status === statusFilter;
    return matchesSearch && matchesDirection && matchesStatus;
  });

  const stats = {
    total: emails.length,
    sent: emails.filter(e => e.direction === 'saída').length,
    received: emails.filter(e => e.direction === 'entrada').length,
    failed: emails.filter(e => e.status === 'falhado').length,
  };

  const columns = [
    {
      header: 'Assunto',
      accessor: (email: Email) => (
        <div className="flex flex-col max-w-md">
          <span className="font-semibold text-slate-900 truncate">{email.subject}</span>
          <span className="text-xs text-slate-500 truncate">{email.body_preview || 'Sem pré-visualização'}</span>
        </div>
      ),
    },
    {
      header: 'Direção',
      accessor: (email: Email) => (
        <div className="flex items-center gap-2">
          {email.direction === 'entrada' ? (
            <ArrowDownLeft className="w-4 h-4 text-blue-500" />
          ) : (
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          )}
          <span className="text-sm capitalize">{email.direction}</span>
        </div>
      ),
    },
    {
      header: 'De / Para',
      accessor: (email: Email) => (
        <div className="flex flex-col">
          <span className="text-sm text-slate-700 truncate">De: {email.from_email}</span>
          <span className="text-xs text-slate-500 truncate">Para: {email.to_email}</span>
        </div>
      ),
    },
    {
      header: 'Data',
      accessor: (email: Email) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-sm">{new Date(email.created_at).toLocaleString('pt-PT')}</span>
        </div>
      ),
    },
    {
      header: 'Estado',
      accessor: (email: Email) => (
        <div className="flex items-center gap-2">
          {email.status === 'enviado' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {email.status === 'recebido' && <Inbox className="w-4 h-4 text-blue-500" />}
          {email.status === 'pendente' && <Clock className="w-4 h-4 text-amber-500" />}
          {email.status === 'falhado' && <XCircle className="w-4 h-4 text-red-500" />}
          <StatusBadge status={email.status} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Emails</h1>
          <p className="text-slate-500">Gere as tuas comunicações por email.</p>
        </div>
        <ActionButton 
          label="Novo Email" 
          icon={Plus} 
          onClick={() => toast.info('Funcionalidade de envio em desenvolvimento')} 
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total de Emails" 
          value={stats.total} 
          icon={Mail} 
          color="bg-slate-600" 
        />
        <StatCard 
          label="Enviados" 
          value={stats.sent} 
          icon={Send} 
          color="bg-emerald-500" 
        />
        <StatCard 
          label="Recebidos" 
          value={stats.received} 
          icon={Inbox} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Falhados" 
          value={stats.failed} 
          icon={AlertCircle} 
          color="bg-red-500" 
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <SearchInput 
          value={search} 
          onChange={setSearch} 
          placeholder="Pesquisar por assunto ou email..." 
        />
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <FilterDropdown
            label="Direção"
            value={directionFilter}
            onChange={setDirectionFilter}
            options={[
              { label: 'Todas', value: 'todos' },
              { label: 'Entrada', value: 'entrada' },
              { label: 'Saída', value: 'saída' },
            ]}
          />
          <FilterDropdown
            label="Estado"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'Todos', value: 'todos' },
              { label: 'Enviado', value: 'enviado' },
              { label: 'Recebido', value: 'recebido' },
              { label: 'Pendente', value: 'pendente' },
              { label: 'Falhado', value: 'falhado' },
            ]}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500">A carregar emails...</p>
        </div>
      ) : filteredEmails.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <DataTable 
            columns={columns} 
            data={filteredEmails} 
            onRowClick={(email) => toast.info(`A abrir email: ${email.subject}`)}
          />
        </motion.div>
      ) : (
        <EmptyState
          icon={Mail}
          title="Nenhum email encontrado"
          description={search || directionFilter !== 'todos' || statusFilter !== 'todos' 
            ? "Tenta ajustar os teus filtros de pesquisa." 
            : "Ainda não tens emails registados."}
          action={!(search || directionFilter !== 'todos' || statusFilter !== 'todos') ? {
            label: "Enviar Primeiro Email",
            onClick: () => toast.info('Funcionalidade em desenvolvimento')
          } : undefined}
        />
      )}
    </div>
  );
};

export default Emails;
