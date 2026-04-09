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
import { apiFetch, apiPost } from '../../lib/api';
import { StatCard } from '../../components/app/StatCard';
import { SearchInput } from '../../components/app/SearchInput';
import { FilterDropdown } from '../../components/app/FilterDropdown';
import { ActionButton } from '../../components/app/ActionButton';
import { DataTable } from '../../components/app/DataTable';
import { EmptyState } from '../../components/app/EmptyState';
import { StatusBadge } from '../../components/app/StatusBadge';

const Emails: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [testingAccount, setTestingAccount] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [emailAccounts, setEmailAccounts] = useState<any[]>([]);
  const [emailAccountForm, setEmailAccountForm] = useState({
    provider_name: 'custom',
    from_name: '',
    email_address: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_secure: false,
    smtp_username: '',
    smtp_password: '',
    imap_host: '',
    imap_port: 993,
    imap_secure: true,
    imap_username: '',
    imap_password: '',
    is_active: true,
    is_default: true
  });

  const [newEmail, setNewEmail] = useState({
    subject: '',
    to_email: '',
    from_email: '',
    body: '',
    body_preview: '',
    direction: 'saída',
    status: 'pendente'
  });

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const [emailsRes, accountsRes] = await Promise.all([
        apiFetch('/api/client/emails'),
        apiFetch('/api/client/email-accounts')
      ]);

      const emailsData = await emailsRes.json();
      const accountsData = await accountsRes.json();

      if (emailsData.ok) {
        setEmails(emailsData.emails);
      } else {
        toast.error('Erro ao carregar emails');
      }

      if (accountsData.ok) {
        setEmailAccounts(accountsData.accounts || []);
      }
    } catch (error) {
      toast.error('Erro de ligação ao servidor');
    } finally {
      setLoading(false);
    }
  };

  const resetEmailAccountForm = () => {
    setEmailAccountForm({
      provider_name: 'custom',
      from_name: '',
      email_address: '',
      smtp_host: '',
      smtp_port: 587,
      smtp_secure: false,
      smtp_username: '',
      smtp_password: '',
      imap_host: '',
      imap_port: 993,
      imap_secure: true,
      imap_username: '',
      imap_password: '',
      is_active: true,
      is_default: true
    });
  };

  const handleTestEmailAccount = async () => {
    if (!emailAccountForm.smtp_host || !emailAccountForm.smtp_username || !emailAccountForm.smtp_password) {
      toast.error('Preencha os dados SMTP para testar');
      return;
    }

    try {
      setTestingAccount(true);
      const res = await apiPost('/api/client/email-accounts/test', emailAccountForm);
      if ((res as any)?.ok) {
        toast.success('Ligação SMTP validada com sucesso');
      } else {
        toast.error((res as any)?.error || 'Falha ao testar ligação');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao testar ligação');
    } finally {
      setTestingAccount(false);
    }
  };

  const handleSaveEmailAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailAccountForm.email_address || !emailAccountForm.smtp_host || !emailAccountForm.smtp_username || !emailAccountForm.smtp_password) {
      toast.error('Preencha email, SMTP host, utilizador e password');
      return;
    }

    try {
      setSavingAccount(true);
      const res = await apiPost('/api/client/email-accounts', emailAccountForm);
      if ((res as any)?.ok) {
        toast.success('Conta de email guardada com sucesso');
        setIsAccountModalOpen(false);
        resetEmailAccountForm();
        fetchEmails();
      } else {
        toast.error((res as any)?.error || 'Erro ao guardar conta');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao guardar conta');
    } finally {
      setSavingAccount(false);
    }
  };

  const resetNewEmail = () => {
    setNewEmail({
      subject: '',
      to_email: '',
      from_email: '',
      body: '',
      body_preview: '',
      direction: 'saída',
      status: 'pendente'
    });
  };

  const handleCreateEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail.subject.trim() || !newEmail.to_email.trim()) {
      toast.error('Assunto e destinatário são obrigatórios');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...newEmail,
        body_preview: newEmail.body.slice(0, 250)
      };

      const res = await apiPost('/api/client/emails', payload);

      if ((res as any)?.ok) {
        toast.success('Email registado com sucesso');
        setIsCreating(false);
        resetNewEmail();
        fetchEmails();
      } else {
        toast.error((res as any)?.error || 'Erro ao criar email');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao criar email');
    } finally {
      setSaving(false);
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50"
          >
            Ligar Conta de Email
          </button>
          <ActionButton 
            label="Novo Email" 
            icon={Plus} 
            onClick={() => setIsCreating(true)} 
          />
        </div>
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
            onClick: () => setIsCreating(true)
          } : undefined}
        />
      )}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Novo Email</h3>
                <p className="text-sm text-slate-500">Registar ou preparar envio de email.</p>
              </div>
              <button
                onClick={() => {
                  setIsCreating(false);
                  resetNewEmail();
                }}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleCreateEmail} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Assunto"
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none md:col-span-2"
                />
                <input
                  type="email"
                  placeholder="Para"
                  value={newEmail.to_email}
                  onChange={(e) => setNewEmail({ ...newEmail, to_email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                />
                <input
                  type="email"
                  placeholder="De"
                  value={newEmail.from_email}
                  onChange={(e) => setNewEmail({ ...newEmail, from_email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                />
              </div>

              <textarea
                placeholder="Mensagem"
                value={newEmail.body}
                onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none resize-none"
              />

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
                Esta etapa regista o email no sistema. A ligação SMTP/IMAP do cliente será a camada seguinte para envio e sincronização reais.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    resetNewEmail();
                  }}
                  className="px-5 py-3 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-70"
                >
                  {saving ? 'A guardar...' : 'Criar Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Ligar Conta de Email</h3>
                <p className="text-sm text-slate-500">Configure SMTP e IMAP para qualquer conta profissional.</p>
              </div>
              <button
                onClick={() => {
                  setIsAccountModalOpen(false);
                  resetEmailAccountForm();
                }}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSaveEmailAccount} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome do remetente"
                  value={emailAccountForm.from_name}
                  onChange={(e) => setEmailAccountForm({ ...emailAccountForm, from_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={emailAccountForm.email_address}
                  onChange={(e) => setEmailAccountForm({ ...emailAccountForm, email_address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
                <div className="font-semibold text-slate-900">SMTP (envio)</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="SMTP host"
                    value={emailAccountForm.smtp_host}
                    onChange={(e) => setEmailAccountForm({ ...emailAccountForm, smtp_host: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="SMTP porta"
                    value={emailAccountForm.smtp_port}
                    onChange={(e) => setEmailAccountForm({ ...emailAccountForm, smtp_port: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="SMTP utilizador"
                    value={emailAccountForm.smtp_username}
                    onChange={(e) => setEmailAccountForm({ ...emailAccountForm, smtp_username: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                  />
                  <input
                    type="password"
                    placeholder="SMTP password"
                    value={emailAccountForm.smtp_password}
                    onChange={(e) => setEmailAccountForm({ ...emailAccountForm, smtp_password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={emailAccountForm.smtp_secure}
                    onChange={(e) => setEmailAccountForm({ ...emailAccountForm, smtp_secure: e.target.checked })}
                  />
                  Usar ligação segura SMTP (SSL/TLS)
                </label>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
                <div className="font-semibold text-slate-900">IMAP (receção)</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="IMAP host"
                    value={emailAccountForm.imap_host}
                    onChange={(e) => setEmailAccountForm({ ...emailAccountForm, imap_host: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="IMAP porta"
                    value={emailAccountForm.imap_port}
                    onChange={(e) => setEmailAccountForm({ ...emailAccountForm, imap_port: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="IMAP utilizador"
                    value={emailAccountForm.imap_username}
                    onChange={(e) => setEmailAccountForm({ ...emailAccountForm, imap_username: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                  />
                  <input
                    type="password"
                    placeholder="IMAP password"
                    value={emailAccountForm.imap_password}
                    onChange={(e) => setEmailAccountForm({ ...emailAccountForm, imap_password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={emailAccountForm.imap_secure}
                    onChange={(e) => setEmailAccountForm({ ...emailAccountForm, imap_secure: e.target.checked })}
                  />
                  Usar ligação segura IMAP (SSL/TLS)
                </label>
              </div>

              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                Nesta fase, os dados ficam guardados no sistema para testes e integração. A camada seguinte será envio e sincronização reais.
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestEmailAccount}
                  disabled={testingAccount}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-70"
                >
                  {testingAccount ? 'A testar...' : 'Testar Ligação'}
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountModalOpen(false);
                      resetEmailAccountForm();
                    }}
                    className="px-5 py-3 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingAccount}
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-70"
                  >
                    {savingAccount ? 'A guardar...' : 'Guardar Conta'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emails;
