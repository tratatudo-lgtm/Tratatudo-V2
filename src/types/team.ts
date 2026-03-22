import.meta.env.VITE_API_URL export type HubArea = 
import.meta.env.VITE_API_URL   | 'dashboard' 
import.meta.env.VITE_API_URL   | 'mensagens' 
import.meta.env.VITE_API_URL   | 'pedidos' 
import.meta.env.VITE_API_URL   | 'reclamacoes' 
import.meta.env.VITE_API_URL   | 'vendas' 
import.meta.env.VITE_API_URL   | 'instancia' 
import.meta.env.VITE_API_URL   | 'subscricao' 
import.meta.env.VITE_API_URL   | 'definicoes'
import.meta.env.VITE_API_URL   | 'equipa';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export type HubAction = 
import.meta.env.VITE_API_URL   | 'ver' 
import.meta.env.VITE_API_URL   | 'ver_detalhe'
import.meta.env.VITE_API_URL   | 'criar' 
import.meta.env.VITE_API_URL   | 'editar' 
import.meta.env.VITE_API_URL   | 'alterar_estado' 
import.meta.env.VITE_API_URL   | 'responder' 
import.meta.env.VITE_API_URL   | 'eliminar'
import.meta.env.VITE_API_URL   | 'gerir';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export type UserPermissions = Partial<Record<HubArea, HubAction[]>>;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export interface TeamMember {
import.meta.env.VITE_API_URL   id: string;
import.meta.env.VITE_API_URL   email: string;
import.meta.env.VITE_API_URL   name: string;
import.meta.env.VITE_API_URL   role: 'admin' | 'member';
import.meta.env.VITE_API_URL   permissions: UserPermissions;
import.meta.env.VITE_API_URL   status: 'active' | 'invited' | 'suspended';
import.meta.env.VITE_API_URL   created_at: string;
import.meta.env.VITE_API_URL   last_login?: string;
import.meta.env.VITE_API_URL   avatar_url?: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export const TEAM_AREAS: { id: HubArea; label: string; description: string }[] = [
import.meta.env.VITE_API_URL   { id: 'dashboard', label: 'Dashboard', description: 'Visão geral e métricas' },
import.meta.env.VITE_API_URL   { id: 'mensagens', label: 'Mensagens', description: 'Chat e comunicações' },
import.meta.env.VITE_API_URL   { id: 'pedidos', label: 'Pedidos', description: 'Gestão de solicitações' },
import.meta.env.VITE_API_URL   { id: 'reclamacoes', label: 'Reclamações', description: 'Gestão de incidências' },
import.meta.env.VITE_API_URL   { id: 'vendas', label: 'Vendas', description: 'Pipeline e leads' },
import.meta.env.VITE_API_URL   { id: 'instancia', label: 'Instância', description: 'Configuração do WhatsApp' },
import.meta.env.VITE_API_URL   { id: 'equipa', label: 'Equipa', description: 'Gestão de utilizadores' },
import.meta.env.VITE_API_URL   { id: 'subscricao', label: 'Subscrição', description: 'Planos e faturação' },
import.meta.env.VITE_API_URL   { id: 'definicoes', label: 'Definições', description: 'Configurações da conta' },
import.meta.env.VITE_API_URL ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export const TEAM_ACTIONS: { id: HubAction; label: string }[] = [
import.meta.env.VITE_API_URL   { id: 'ver', label: 'Ver' },
import.meta.env.VITE_API_URL   { id: 'ver_detalhe', label: 'Ver Detalhe' },
import.meta.env.VITE_API_URL   { id: 'criar', label: 'Criar' },
import.meta.env.VITE_API_URL   { id: 'editar', label: 'Editar' },
import.meta.env.VITE_API_URL   { id: 'alterar_estado', label: 'Estado' },
import.meta.env.VITE_API_URL   { id: 'responder', label: 'Responder' },
import.meta.env.VITE_API_URL   { id: 'eliminar', label: 'Eliminar' },
import.meta.env.VITE_API_URL   { id: 'gerir', label: 'Gerir' },
import.meta.env.VITE_API_URL ];
