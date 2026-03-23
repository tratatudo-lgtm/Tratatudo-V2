import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  File,
  FileImage,
  FileCode,
  Download,
  MoreVertical,
  Calendar,
  User,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Document } from '../../types/hub';
import { apiFetch } from '../../lib/api';
import { StatCard } from '../../components/app/StatCard';
import { SearchInput } from '../../components/app/SearchInput';
import { FilterDropdown } from '../../components/app/FilterDropdown';
import { ActionButton } from '../../components/app/ActionButton';
import { DataTable } from '../../components/app/DataTable';
import { EmptyState } from '../../components/app/EmptyState';

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/client/documents');
      const data = await res.json();
      if (data.ok) {
        setDocuments(data.documents);
      } else {
        toast.error('Erro ao carregar documentos');
      }
    } catch (error) {
      toast.error('Erro de ligação ao servidor');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
                         doc.file_name.toLowerCase().includes(search.toLowerCase()) ||
                         doc.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'todos' || doc.category === categoryFilter;
    const matchesType = typeFilter === 'todos' || doc.file_type.includes(typeFilter);
    return matchesSearch && matchesCategory && matchesType;
  });

  const stats = {
    total: documents.length,
    recent: documents.filter(d => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(d.created_at) > weekAgo;
    }).length,
    categories: new Set(documents.map(d => d.category)).size,
    pdfs: documents.filter(d => d.file_type.includes('pdf')).length,
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    if (type.includes('image')) return <FileImage className="w-4 h-4 text-blue-500" />;
    if (type.includes('csv') || type.includes('excel') || type.includes('sheet')) return <FileCode className="w-4 h-4 text-emerald-500" />;
    return <File className="w-4 h-4 text-slate-500" />;
  };

  const columns = [
    {
      header: 'Documento',
      accessor: (doc: Document) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            {getFileIcon(doc.file_type)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{doc.title}</span>
            <span className="text-xs text-slate-500">{doc.file_name}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Categoria',
      accessor: (doc: Document) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 capitalize">
          {doc.category}
        </span>
      ),
    },
    {
      header: 'Data',
      accessor: (doc: Document) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-sm">{new Date(doc.created_at).toLocaleDateString('pt-PT')}</span>
        </div>
      ),
    },
    {
      header: 'Carregado por',
      accessor: (doc: Document) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <User className="w-3.5 h-3.5" />
          <span className="text-sm">{doc.client_users?.name || 'Sistema'}</span>
        </div>
      ),
    },
    {
      header: '',
      accessor: (doc: Document) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toast.info('A iniciar download...');
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-blue-600"
          >
            <Download className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'text-right w-20',
    },
  ];

  const categories = Array.from(new Set(documents.map(d => d.category)));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documentos</h1>
          <p className="text-slate-500">Gere os teus ficheiros e documentos partilhados.</p>
        </div>
        <ActionButton 
          label="Novo Documento" 
          icon={Plus} 
          onClick={() => toast.info('Funcionalidade de upload em desenvolvimento')} 
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total de Documentos" 
          value={stats.total} 
          icon={FileText} 
          color="bg-slate-600" 
        />
        <StatCard 
          label="Recentes (7 dias)" 
          value={stats.recent} 
          icon={Calendar} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Categorias" 
          value={stats.categories} 
          icon={FolderOpen} 
          color="bg-indigo-500" 
        />
        <StatCard 
          label="PDFs" 
          value={stats.pdfs} 
          icon={File} 
          color="bg-emerald-500" 
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <SearchInput 
          value={search} 
          onChange={setSearch} 
          placeholder="Pesquisar por título, nome ou categoria..." 
        />
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <FilterDropdown
            label="Categoria"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { label: 'Todas', value: 'todos' },
              ...categories.map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }))
            ]}
          />
          <FilterDropdown
            label="Tipo"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: 'Todos', value: 'todos' },
              { label: 'PDF', value: 'pdf' },
              { label: 'Imagem', value: 'image' },
              { label: 'Excel/CSV', value: 'sheet' },
            ]}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500">A carregar documentos...</p>
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
            onRowClick={(doc) => toast.info(`A abrir documento: ${doc.title}`)}
          />
        </motion.div>
      ) : (
        <EmptyState
          icon={FileText}
          title="Nenhum documento encontrado"
          description={search || categoryFilter !== 'todos' || typeFilter !== 'todos' 
            ? "Tenta ajustar os teus filtros de pesquisa." 
            : "Ainda não tens documentos carregados. Começa por adicionar o primeiro!"}
          action={!(search || categoryFilter !== 'todos' || typeFilter !== 'todos') ? {
            label: "Carregar Documento",
            onClick: () => toast.info('Funcionalidade em desenvolvimento')
          } : undefined}
        />
      )}
    </div>
  );
};

export default Documents;
