export type OperationalArea = 'requests' | 'complaints' | 'sales' | 'tickets' | 'clientes' | 'equipa' | 'agenda' | 'tarefas' | 'documentos' | 'email' | 'faturas';

export interface HubTicket {
  id: string;
  client_id: string;
  client_profile_id?: number;
  assigned_user_id?: string;
  tracking_code: string;
  kind: 'pedido' | 'reclamação' | 'venda' | 'suporte';
  type: OperationalArea;
  title: string;
  description: string;
  status: string;
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  category: string;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  // AI and metadata
  source?: string;
  sla_status?: string;
  due_at?: string;
  ai_priority?: string;
  ai_summary?: string;
  ai_suggested_reply?: string;
  ai_analysis?: string;
  // Joined fields
  client_name?: string;
  client_phone?: string;
  assigned_user_name?: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'client' | 'system' | 'ai';
  sender_name: string;
  message: string;
  created_at: string;
}

export interface TicketActivity {
  id: string;
  ticket_id: string;
  event_type: string;
  event_label: string;
  created_by: string;
  created_at: string;
  // Joined fields
  user_name?: string;
}

export interface ClientProfile {
  id: number;
  client_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone_e164: string;
  nif?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  notes?: string;
  customer_score?: number;
  customer_type?: string;
  last_interaction_at?: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'gestor' | 'operador' | 'comercial' | 'técnico' | 'financeiro' | 'visualizador';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'assign' | 'export' | 'manage';

export type PermissionModule = 
  | 'dashboard' 
  | 'clients' 
  | 'team' 
  | 'tasks' 
  | 'calendar' 
  | 'documents' 
  | 'financial' 
  | 'emails' 
  | 'automations' 
  | 'tickets' 
  | 'whatsapp' 
  | 'billing' 
  | 'settings';

export type PermissionMap = Partial<Record<PermissionModule, PermissionAction[]>>;

export interface ClientUser {
  id: string;
  client_id: string;
  owner_id?: string;
  name: string;
  email: string;
  phone_e164?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'invited';
  invited_by?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, PermissionMap> = {
  admin: {
    dashboard: ['view', 'manage'],
    clients: ['view', 'create', 'edit', 'delete', 'export', 'manage'],
    team: ['view', 'create', 'edit', 'delete', 'manage'],
    tasks: ['view', 'create', 'edit', 'delete', 'assign', 'manage'],
    calendar: ['view', 'create', 'edit', 'delete', 'manage'],
    documents: ['view', 'create', 'edit', 'delete', 'manage'],
    financial: ['view', 'create', 'edit', 'delete', 'export', 'manage'],
    emails: ['view', 'create', 'manage'],
    automations: ['view', 'create', 'edit', 'delete', 'manage'],
    tickets: ['view', 'create', 'edit', 'delete', 'assign', 'manage'],
    whatsapp: ['view', 'create', 'manage'],
    billing: ['view', 'manage'],
    settings: ['view', 'manage']
  },
  gestor: {
    dashboard: ['view'],
    clients: ['view', 'create', 'edit', 'export'],
    team: ['view'],
    tasks: ['view', 'create', 'edit', 'assign'],
    calendar: ['view', 'create', 'edit'],
    documents: ['view', 'create', 'edit'],
    financial: ['view', 'create', 'edit'],
    emails: ['view', 'create'],
    automations: ['view'],
    tickets: ['view', 'create', 'edit', 'assign'],
    whatsapp: ['view', 'create'],
    billing: ['view'],
    settings: ['view']
  },
  operador: {
    dashboard: ['view'],
    clients: ['view', 'create', 'edit'],
    tasks: ['view', 'create', 'edit'],
    calendar: ['view', 'create', 'edit'],
    documents: ['view', 'create'],
    tickets: ['view', 'create', 'edit'],
    whatsapp: ['view', 'create']
  },
  comercial: {
    dashboard: ['view'],
    clients: ['view', 'create', 'edit'],
    tasks: ['view', 'create', 'edit'],
    calendar: ['view', 'create', 'edit'],
    tickets: ['view', 'create', 'edit'],
    whatsapp: ['view', 'create']
  },
  técnico: {
    dashboard: ['view'],
    tasks: ['view', 'edit'],
    calendar: ['view'],
    documents: ['view', 'create'],
    tickets: ['view', 'edit']
  },
  financeiro: {
    dashboard: ['view'],
    clients: ['view'],
    financial: ['view', 'create', 'edit', 'export'],
    billing: ['view']
  },
  visualizador: {
    dashboard: ['view'],
    clients: ['view'],
    tasks: ['view'],
    calendar: ['view'],
    documents: ['view'],
    tickets: ['view']
  }
};

export interface CalendarEvent {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  event_type: string;
  status: string;
  start_at: string;
  end_at: string;
  location?: string;
  notes?: string;
  client_profile_id?: number;
  ticket_id?: string;
  assigned_user_id?: string;
  created_at: string;
  updated_at?: string;
  // Joined fields
  client_profiles?: { company_name: string };
  client_users?: { name: string };
}

export interface Task {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  status: 'pendente' | 'em_progresso' | 'concluída' | 'cancelada';
  due_at?: string;
  assigned_user_id?: string;
  client_profile_id?: number;
  ticket_id?: string;
  created_at: string;
  updated_at?: string;
  // Joined fields
  client_profiles?: { company_name: string };
  client_users?: { name: string };
}

export interface Document {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  category: string;
  file_url: string;
  file_name: string;
  file_type: string;
  uploaded_by?: string;
  status: string;
  client_profile_id?: number;
  ticket_id?: string;
  created_at: string;
  updated_at?: string;
  // Joined fields
  client_users?: { name: string };
}

export interface Email {
  id: string;
  client_id: string;
  subject: string;
  from_email: string;
  to_email: string;
  cc?: string;
  bcc?: string;
  body_preview?: string;
  direction: 'entrada' | 'saída';
  status: 'enviado' | 'recebido' | 'pendente' | 'falhado';
  related_entity_type?: string;
  related_entity_id?: string;
  sent_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface Automation {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  trigger_type: string;
  action_type: string;
  status: 'ativa' | 'pausada' | 'falha';
  last_run_at?: string;
  next_run_at?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface RecentActivity {
  id: string;
  type: 'cliente' | 'tarefa' | 'evento' | 'documento' | 'email' | 'financeiro' | 'automacao';
  title: string;
  description: string;
  created_at: string;
  status?: string;
}

export interface DashboardMetrics {
  total_clients: number;
  active_clients: number;
  new_clients_this_week?: number;
  total_tasks: number;
  pending_tasks: number;
  completed_tasks_today?: number;
  total_events: number;
  upcoming_events: number;
  events_today?: number;
  total_documents: number;
  recent_documents?: number;
  total_financial_documents: number;
  overdue_financial_documents: number;
  total_emails: number;
  failed_emails?: number;
  total_automations?: number;
  active_automations?: number;
  failed_automations: number;
  recent_activity: RecentActivity[];
}

export interface FinancialDocument {
  id: string;
  client_id: string;
  document_number: string;
  entity_name: string;
  document_type: 'fatura' | 'orçamento' | 'recibo' | 'nota_credito' | 'outro';
  issue_date: string;
  due_date?: string;
  amount: number;
  status: 'pago' | 'pendente' | 'atrasado' | 'cancelado';
  file_url?: string;
  client_profile_id?: number;
  ticket_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface WAMessage {
  id: string;
  client_id: string;
  instance: string;
  phone_e164: string;
  direction: 'inbound' | 'outbound';
  text: string;
  raw?: any;
  created_at: string;
}

export interface ClientInstance {
  id: string;
  client_id: string;
  instance_name: string;
  status: 'open' | 'connecting' | 'disconnected' | 'error';
  phone_number?: string;
  last_activity?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  phone_e164: string;
  display_name?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  instance: string;
  direction: 'inbound' | 'outbound';
  linked_client_id?: string;
  linked_ticket_id?: string;
  ticket_status?: string;
  ticket_tracking_code?: string;
}

export interface WhatsAppStats {
  totalConversations: number;
  messagesToday: number;
  activeInstances: number;
  conversationsWithTickets: number;
}

export interface Subscription {
  id: string;
  client_id: string;
  plan_name: string;
  status: 'active' | 'trial' | 'past_due' | 'canceled' | 'suspended';
  price_monthly: number;
  billing_cycle: 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  renewal_date?: string;
  created_at: string;
  updated_at: string;
}

export interface UsageMetrics {
  client_id: string;
  total_users: number;
  total_instances: number;
  total_messages: number;
  total_tickets: number;
  total_documents: number;
  last_updated: string;
}

export interface ClientBillingSummary {
  client_id: string;
  company_name: string;
  subscription_status: Subscription['status'];
  current_plan: string;
  monthly_value: number;
  renewal_date?: string;
  usage: UsageMetrics;
}

export interface BillingStats {
  totalClients: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  suspendedSubscriptions: number;
  estimatedMonthlyRevenue: number;
}

export interface AuditLog {
  id: string;
  client_id: string;
  actor_user_id: string;
  actor_name: string;
  action_type: string;
  module: PermissionModule;
  entity_type: string;
  entity_id?: string;
  summary: string;
  metadata?: any;
  created_at: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: {
    backend: { status: 'online' | 'offline'; latency?: number };
    database: { status: 'online' | 'offline'; latency?: number };
    whatsapp: { status: 'online' | 'offline' | 'warning'; details?: string };
    storage: { status: 'online' | 'offline' };
  };
  last_check: string;
}

export interface SystemInfo {
  version: string;
  environment: string;
  deploy_timestamp: string;
  uptime: number;
}

export const AREA_CONFIG: Record<string, {
  label: string;
  bgLight: string;
  bgMain: string;
  bgHover: string;
  borderLight: string;
  textMain: string;
  shadowMain: string;
  statuses: string[];
}> = {
  requests: {
    label: 'Pedidos',
    bgLight: 'bg-blue-50',
    bgMain: 'bg-blue-600',
    bgHover: 'hover:bg-blue-700',
    borderLight: 'border-blue-100',
    textMain: 'text-blue-600',
    shadowMain: 'shadow-blue-200',
    statuses: ['novo', 'em análise', 'a aguardar cliente', 'em execução', 'concluído', 'cancelado']
  },
  complaints: {
    label: 'Reclamações',
    bgLight: 'bg-red-50',
    bgMain: 'bg-red-600',
    bgHover: 'hover:bg-red-700',
    borderLight: 'border-red-100',
    textMain: 'text-red-600',
    shadowMain: 'shadow-red-200',
    statuses: ['nova', 'em investigação', 'a aguardar resposta', 'resolvida', 'encerrada']
  },
  sales: {
    label: 'Vendas',
    bgLight: 'bg-emerald-50',
    bgMain: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    borderLight: 'border-emerald-100',
    textMain: 'text-emerald-600',
    shadowMain: 'shadow-emerald-200',
    statuses: ['novo lead', 'contactado', 'proposta enviada', 'negociação', 'fechado ganho', 'fechado perdido']
  },
  tickets: {
    label: 'Suporte',
    bgLight: 'bg-slate-50',
    bgMain: 'bg-slate-600',
    bgHover: 'hover:bg-slate-700',
    borderLight: 'border-slate-100',
    textMain: 'text-slate-600',
    shadowMain: 'shadow-slate-200',
    statuses: ['aberto', 'em análise', 'a aguardar cliente', 'concluído', 'cancelado']
  },
  clientes: {
    label: 'Clientes',
    bgLight: 'bg-indigo-50',
    bgMain: 'bg-indigo-600',
    bgHover: 'hover:bg-indigo-700',
    borderLight: 'border-indigo-100',
    textMain: 'text-indigo-600',
    shadowMain: 'shadow-indigo-200',
    statuses: ['Ativo', 'Inativo', 'Lead', 'VIP']
  },
  equipa: {
    label: 'Equipa',
    bgLight: 'bg-slate-50',
    bgMain: 'bg-slate-600',
    bgHover: 'hover:bg-slate-700',
    borderLight: 'border-slate-100',
    textMain: 'text-slate-600',
    shadowMain: 'shadow-slate-200',
    statuses: ['active', 'inactive', 'invited']
  },
  agenda: {
    label: 'Agenda',
    bgLight: 'bg-amber-50',
    bgMain: 'bg-amber-600',
    bgHover: 'hover:bg-amber-700',
    borderLight: 'border-amber-100',
    textMain: 'text-amber-600',
    shadowMain: 'shadow-amber-200',
    statuses: ['confirmado', 'pendente', 'cancelado']
  },
  tarefas: {
    label: 'Tarefas',
    bgLight: 'bg-purple-50',
    bgMain: 'bg-purple-600',
    bgHover: 'hover:bg-purple-700',
    borderLight: 'border-purple-100',
    textMain: 'text-purple-600',
    shadowMain: 'shadow-purple-200',
    statuses: ['pendente', 'em_progresso', 'concluída', 'cancelada']
  },
  documentos: {
    label: 'Documentos',
    bgLight: 'bg-cyan-50',
    bgMain: 'bg-cyan-600',
    bgHover: 'hover:bg-cyan-700',
    borderLight: 'border-cyan-100',
    textMain: 'text-cyan-600',
    shadowMain: 'shadow-cyan-200',
    statuses: ['válido', 'expirado', 'pendente']
  },
  email: {
    label: 'Email',
    bgLight: 'bg-sky-50',
    bgMain: 'bg-sky-600',
    bgHover: 'hover:bg-sky-700',
    borderLight: 'border-sky-100',
    textMain: 'text-sky-600',
    shadowMain: 'shadow-sky-200',
    statuses: ['inbox', 'sent', 'draft', 'archived']
  },
  faturas: {
    label: 'Faturas',
    bgLight: 'bg-rose-50',
    bgMain: 'bg-rose-600',
    bgHover: 'hover:bg-rose-700',
    borderLight: 'border-rose-100',
    textMain: 'text-rose-600',
    shadowMain: 'shadow-rose-200',
    statuses: ['pago', 'pendente', 'atrasado', 'cancelado']
  }
};
