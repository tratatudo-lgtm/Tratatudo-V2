export type HubArea = 
  | 'dashboard' 
  | 'mensagens' 
  | 'pedidos' 
  | 'reclamacoes' 
  | 'vendas' 
  | 'instancia' 
  | 'subscricao' 
  | 'definicoes'
  | 'equipa';

export type HubAction = 
  | 'ver' 
  | 'ver_detalhe'
  | 'criar' 
  | 'editar' 
  | 'alterar_estado' 
  | 'responder' 
  | 'eliminar'
  | 'gerir';

export type UserPermissions = Partial<Record<HubArea, HubAction[]>>;

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  permissions: UserPermissions;
  status: 'active' | 'invited' | 'suspended';
  created_at: string;
  last_login?: string;
  avatar_url?: string;
}

export const TEAM_AREAS: { id: HubArea; label: string; description: string }[] = [
  { id: 'dashboard', label: 'Dashboard', description: 'Visão geral e métricas' },
  { id: 'mensagens', label: 'Mensagens', description: 'Chat e comunicações' },
  { id: 'pedidos', label: 'Pedidos', description: 'Gestão de solicitações' },
  { id: 'reclamacoes', label: 'Reclamações', description: 'Gestão de incidências' },
  { id: 'vendas', label: 'Vendas', description: 'Pipeline e leads' },
  { id: 'instancia', label: 'Instância', description: 'Configuração do WhatsApp' },
  { id: 'equipa', label: 'Equipa', description: 'Gestão de utilizadores' },
  { id: 'subscricao', label: 'Subscrição', description: 'Planos e faturação' },
  { id: 'definicoes', label: 'Definições', description: 'Configurações da conta' },
];

export const TEAM_ACTIONS: { id: HubAction; label: string }[] = [
  { id: 'ver', label: 'Ver' },
  { id: 'ver_detalhe', label: 'Ver Detalhe' },
  { id: 'criar', label: 'Criar' },
  { id: 'editar', label: 'Editar' },
  { id: 'alterar_estado', label: 'Estado' },
  { id: 'responder', label: 'Responder' },
  { id: 'eliminar', label: 'Eliminar' },
  { id: 'gerir', label: 'Gerir' },
];
