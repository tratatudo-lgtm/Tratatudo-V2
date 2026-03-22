import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter,
  FileText,
  Download,
  MoreVertical,
  Calendar,
  Building2,
  Euro,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { FinancialDocument } from '../../types/hub';
import { StatCard } from '../../components/app/StatCard';
import { StatusBadge } from '../../components/app/StatusBadge';
import { SearchInput } from '../../components/app/SearchInput';
import { FilterDropdown } from '../../components/app/FilterDropdown';
import { ActionButton } from '../../components/app/ActionButton';
import { DataTable } from '../../components/app/DataTable';
import { EmptyState } from '../../components/app/EmptyState';

const FinancialDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<FinancialDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/client/financial-documents');
      const data = await res.json();
      if (data.ok) {
        setDocuments(data.documents);
      } else {
        toast.error('Erro ao carregar documentos financeiros');
      }
    } catch (error) {
      toast.error('Erro de ligação ao servidor');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.document_number.toLowerCase().includes(search.toLowerCase()) ||
                         doc.entity_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || doc.status === statusFilter;
    const matchesType = typeFilter === 'todos' || doc.document_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pendente').length,
    paid: documents.filter(d => d.status === 'pago').length,
    totalAmount: documents.reduce((acc, d) => acc + d.amount, 0),
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'pendente': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'atrasado': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'cancelado': return <XCircle className="w-4 h-4 text-slate-400" />;
      default: return null;
    }
  };

  const columns = [
    {
      header: 'Documento',
      accessor: (doc: FinancialDocument) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <Receipt className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{doc.document_number}</span>
            <span className="text-xs text-slate-500 capitalize">{doc.document_type.replace('_', ' ')}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Entidade',
      accessor: (doc: FinancialDocument) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <Building2 className="w-3.5 h-3.5" />
          <span className="text-sm">{doc.entity_name}</span>
        </div>
      ),
    },
    {
      header: 'Valor',
      accessor: (doc: FinancialDocument) => (
        <div className="flex items-center gap-1.5 font-bold text-slate-900">
          <Euro className="w-3.5 h-3.5" />
          <span>{doc.amount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</span>
        </div>
      ),
    },
    {
      header: 'Datas',
      accessor: (doc: FinancialDocument) => (
        <div className="flex flex-col">
          <span className="text-sm text-slate-700">Emitido: {new Date(doc.issue_date).toLocaleDateString('pt-PT')}</span>
          {doc.due_date && (
            <span className={cn(
              "text-xs",
              new Date(doc.due_date) < new Date() && doc.status === 'pendente' ? "text-red-500 font-medium" : "text-slate-500"
            )}>
              Vencimento: {new Date(doc.due_date).toLocaleDateString('pt-PT')}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Estado',
      accessor: (doc: FinancialDocument) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(doc.status)}
          <StatusBadge status={doc.status} />
        </div>
      ),
    },
    {
      header: '',
      accessor: (doc: FinancialDocument) => (
        <div className="flex items-center justify-end gap-2">
          {doc.file_url && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toast.info('A abrir documento...');
              }}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-blue-600"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'text-right w-20',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-slate-500">Gere as tuas faturas, orçamentos e recibos.</p>
        </div>
        <ActionButton 
          label="Novo Documento" 
          icon={Plus} 
          onClick={() => toast.info('Funcionalidade de registo em desenvolvimento')} 
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total de Documentos" 
          value={stats.total} 
          icon={Receipt} 
          color="bg-slate-600" 
        />
        <StatCard 
          label="Por Pagar" 
          value={stats.pending} 
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          label="Pagos" 
          value={stats.paid} 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
        />
        <StatCard 
          label="Valor Total" 
          value={`${stats.totalAmount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €`} 
          icon={Euro} 
          color="bg-indigo-500" 
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <SearchInput 
          value={search} 
          onChange={setSearch} 
          placeholder="Pesquisar por número ou entidade..." 
        />
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <FilterDropdown
            label="Estado"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'Todos', value: 'todos' },
              { label: 'Pago', value: 'pago' },
              { label: 'Pendente', value: 'pendente' },
              { label: 'Atrasado', value: 'atrasado' },
              { label: 'Cancelado', value: 'cancelado' },
            ]}
          />
          <FilterDropdown
            label="Tipo"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: 'Todos', value: 'todos' },
              { label: 'Fatura', value: 'fatura' },
              { label: 'Orçamento', value: 'orçamento' },
              { label: 'Recibo', value: 'recibo' },
              { label: 'Nota de Crédito', value: 'nota_credito' },
            ]}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500">A carregar documentos financeiros...</p>
        </div>
      ) : filteredDocuments.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <DataTable 
            columns={columns} 
            data={filteredDocuments} 
            onRowClick={(doc) => toast.info(`A abrir documento: ${doc.document_number}`)}
          />
        </motion.div>
      ) : (
        <EmptyState
          icon={Receipt}
          title="Nenhum documento financeiro encontrado"
          description={search || statusFilter !== 'todos' || typeFilter !== 'todos' 
            ? "Tenta ajustar os teus filtros de pesquisa." 
            : "Ainda não tens documentos financeiros registados."}
          action={!(search || statusFilter !== 'todos' || typeFilter !== 'todos') ? {
            label: "Registar Documento",
            onClick: () => toast.info('Funcionalidade em desenvolvimento')
          } : undefined}
        />
      )}
    </div>
  );
};

export default FinancialDocuments;
