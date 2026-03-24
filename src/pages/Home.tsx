import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  MessageCircle, 
  Zap, 
  BarChart3, 
  Users, 
  Building2, 
  Clock,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  CreditCard,
  Brain,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Search,
  Settings,
  Layers,
  Bot
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1
    }
  },
  viewport: { once: true }
};

export function Home() {
  return (
    <div className="overflow-hidden bg-white">
      <Header />
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_50%,rgba(37,99,235,0.08)_0%,transparent_100%)]" />
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20"
            >
              <Brain className="w-4 h-4" />
              <span>Plataforma de Gestão Inteligente com IA</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-5xl lg:text-7xl font-display font-extrabold text-slate-900 leading-[1.1] tracking-tight"
            >
              O sistema que organiza a sua empresa e <span className="text-primary">automatiza clientes com IA</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
            >
              CRM, WhatsApp, tarefas, documentos, financeiro e inteligência artificial — tudo numa única plataforma para escalar a sua operação sem aumentar a equipa.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link
                to="/experimentar"
                className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
              >
                Testar grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contacto"
                className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-10 py-5 rounded-full text-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                Ver demonstração
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="pt-16 relative"
            >
              <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full -z-10" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white p-2">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200&h=800" 
                  alt="Dashboard TrataTudo AI" 
                  className="rounded-2xl w-full"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating elements to show integration */}
                <div className="absolute top-10 left-10 hidden lg:flex flex-col gap-3">
                  <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Nova Mensagem</p>
                      <p className="text-[10px] text-slate-500">IA a responder...</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-10 right-10 hidden lg:flex flex-col gap-3">
                  <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                      <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">CRM Atualizado</p>
                      <p className="text-[10px] text-slate-500">Lead qualificada</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. SECÇÃO PROBLEMA */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 leading-tight">
              A maioria das empresas perde clientes todos os dias
            </h2>
            <p className="text-xl text-slate-600">
              O caos operacional é o maior inimigo do crescimento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Mensagens sem resposta", desc: "Clientes que esperam horas ou dias acabam por comprar à concorrência." },
              { title: "Clientes esquecidos", desc: "Sem um CRM ativo, as oportunidades de negócio perdem-se no histórico do WhatsApp." },
              { title: "Pedidos perdidos", desc: "Informação espalhada por cadernos, emails e conversas que ninguém encontra." },
              { title: "Falta de organização", desc: "Equipas que não sabem quem está a tratar de quê, gerando confusão e erros." },
              { title: "Follow-up inexistente", desc: "A falta de acompanhamento sistemático faz com que 80% das vendas não se concretizem." },
              { title: "Processos espalhados", desc: "Várias ferramentas que não comunicam entre si, duplicando o trabalho manual." }
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <X className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-3xl font-display font-bold text-slate-900 italic">
              “Não é falta de clientes. <span className="text-primary">É falta de sistema.</span>”
            </p>
          </div>
        </div>
      </section>

      {/* 3. SECÇÃO SOLUÇÃO */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-primary font-bold uppercase tracking-widest text-sm">A Solução</h2>
            <h3 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">O TrataTudo AI resolve tudo num único sistema</h3>
            <p className="text-slate-600 text-lg">Uma plataforma completa que centraliza a sua operação e automatiza o crescimento.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageCircle className="w-8 h-8" />,
                title: "WhatsApp Inteligente",
                desc: "Atendimento automático 24/7 com IA que entende o contexto e qualifica leads em tempo real."
              },
              {
                icon: <LayoutDashboard className="w-8 h-8" />,
                title: "CRM e Gestão de Clientes",
                desc: "Ficha completa de cada cliente com histórico, scoring de risco e ações recomendadas automaticamente."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Tarefas e Equipa",
                desc: "Gestão de equipa multi-agente com atribuição de tarefas, prazos e acompanhamento de produtividade."
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: "Documentos e Organização",
                desc: "Arquivo digital centralizado e organizado por cliente, acessível de qualquer lugar com segurança."
              },
              {
                icon: <CreditCard className="w-8 h-8" />,
                title: "Financeiro e Controlo",
                desc: "Gestão de faturas, pagamentos e cobranças integrada no fluxo de trabalho diário."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "IA Operacional e Automação",
                desc: "Automações que disparam ações baseadas no comportamento do cliente, recuperando vendas perdidas."
              }
            ].map((feat, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all group"
              >
                <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  {feat.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-4">{feat.title}</h4>
                <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECÇÃO COMO FUNCIONA */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-primary font-bold uppercase tracking-widest text-sm">Fluxo Inteligente</h2>
            <h3 className="text-4xl lg:text-5xl font-display font-bold">Como a magia acontece</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { step: "01", title: "O cliente envia uma mensagem", desc: "Seja por WhatsApp ou formulário, o TrataTudo capta o contacto instantaneamente." },
              { step: "02", title: "O sistema responde ou regista", desc: "A IA analisa a intenção e responde ou cria um ticket de atendimento automático." },
              { step: "03", title: "O pedido entra no dashboard", desc: "Toda a informação é organizada e atribuída ao departamento ou agente correto." },
              { step: "04", title: "A IA analisa o contexto", desc: "O sistema identifica se é uma venda, uma reclamação ou um cliente em risco." },
              { step: "05", title: "O sistema sugere ação", desc: "Recebe notificações inteligentes com o que deve fazer para fechar o negócio." },
              { step: "06", title: "Resolva em 1 clique", desc: "A empresa resolve o pedido ou contacta o cliente diretamente pela plataforma." }
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="relative p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="text-5xl font-display font-black text-primary/20 mb-4">{item.step}</div>
                <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SECÇÃO FUNCIONALIDADES PREMIUM */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-primary font-bold uppercase tracking-widest text-sm">Funcionalidades</h2>
            <h3 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">Tudo o que a sua empresa precisa</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <LayoutDashboard />, title: "CRM Completo", desc: "Gestão total de leads e clientes." },
              { icon: <MessageCircle />, title: "WhatsApp Integrado", desc: "Central de mensagens multi-agente." },
              { icon: <CheckCircle2 />, title: "Gestão de Tickets", desc: "Pedidos, reclamações e vendas." },
              { icon: <CheckSquare />, title: "Tarefas e Calendário", desc: "Organização de equipa e prazos." },
              { icon: <FileText />, title: "Documentos e Arquivos", desc: "Gestão documental inteligente." },
              { icon: <CreditCard />, title: "Financeiro", desc: "Controlo de faturas e pagamentos." },
              { icon: <Zap />, title: "Automações", desc: "Fluxos de trabalho automáticos." },
              { icon: <Brain />, title: "IA por Cliente", desc: "Análise individual de comportamento." },
              { icon: <AlertTriangle />, title: "Clientes em Risco", desc: "Alertas de churn e inatividade." },
              { icon: <TrendingUp />, title: "Scoring e Ação", desc: "Priorização inteligente de contactos." },
              { icon: <RefreshCw />, title: "Recuperação Automática", desc: "Follow-up inteligente sem esforço." },
              { icon: <ShieldCheck />, title: "Segurança Enterprise", desc: "Dados protegidos e RGPD." }
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all"
              >
                <div className="text-primary mb-4">{item.icon}</div>
                <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-xs text-slate-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SECÇÃO RESULTADOS */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-6xl font-display font-bold leading-tight">Resultados reais para a sua operação</h2>
              <p className="text-xl text-white/80 leading-relaxed">
                O TrataTudo não é apenas software. É uma vantagem competitiva que transforma a forma como a sua empresa trabalha.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { label: "Trabalho Manual", value: "-70%", desc: "Redução em tarefas repetitivas." },
                  { label: "Velocidade", value: "Instantânea", desc: "Respostas imediatas com IA." },
                  { label: "Receita Protegida", value: "+40%", desc: "Recuperação de clientes inativos." },
                  { label: "Controlo Total", value: "100%", desc: "Visibilidade sobre toda a equipa." }
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-4xl font-display font-black">{stat.value}</p>
                    <p className="font-bold">{stat.label}</p>
                    <p className="text-sm text-white/60">{stat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-white/10 blur-3xl rounded-full" />
              <div className="relative bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-bold">TT</div>
                  <div>
                    <p className="font-bold">IA TrataTudo</p>
                    <p className="text-xs text-white/60">Ação recomendada agora</p>
                  </div>
                </div>
                <p className="text-lg italic">
                  “Detetei 3 clientes que não compram há 30 dias. Sugiro enviar campanha de recuperação automática.”
                </p>
                <button className="w-full py-4 bg-white text-primary rounded-xl font-bold hover:bg-slate-50 transition-all">
                  Executar Automação
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECÇÃO PARA QUEM É */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-primary font-bold uppercase tracking-widest text-sm">Segmentos</h2>
            <h3 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">Soluções para quem quer crescer</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Building2 />, name: "Empresas Locais" },
              { icon: <Users />, name: "Restaurantes" },
              { icon: <Zap />, name: "Postos de Combustível" },
              { icon: <ShieldCheck />, name: "Clínicas" },
              { icon: <Smartphone />, name: "Serviços" },
              { icon: <Building2 />, name: "Juntas de Freguesia" },
              { icon: <LayoutDashboard />, name: "PME" },
              { icon: <Globe />, name: "E-commerce" }
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center text-center gap-4 p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all"
              >
                <div className="text-primary">{item.icon}</div>
                <p className="font-bold text-slate-900">{item.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. SECÇÃO PLANOS / PREÇOS */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-primary font-bold uppercase tracking-widest text-sm">Preços</h2>
            <h3 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">O investimento que se paga sozinho</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <motion.div {...fadeIn} className="bg-white p-10 rounded-[2rem] border border-slate-200 flex flex-col">
              <div className="mb-8">
                <h4 className="text-xl font-bold text-slate-900 mb-2">Starter</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-black text-slate-900">149€</span>
                  <span className="text-slate-500 text-sm">/mês</span>
                </div>
                <p className="text-slate-500 text-sm mt-4 italic">Para começar a organizar.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {["WhatsApp Integrado", "CRM Base", "Gestão de Clientes", "1 Operador", "Suporte Email"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/experimentar" className="w-full py-4 border border-slate-200 rounded-xl font-bold text-slate-900 hover:bg-slate-50 transition-all text-center">
                Começar Agora
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="bg-slate-900 p-10 rounded-[2rem] border-4 border-primary flex flex-col relative scale-105 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Recomendado
              </div>
              <div className="mb-8">
                <h4 className="text-xl font-bold text-white mb-2">Pro</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-black text-white">249€</span>
                  <span className="text-slate-400 text-sm">/mês</span>
                </div>
                <p className="text-slate-400 text-sm mt-4 italic">Poder total com IA.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {["Tudo do Starter", "IA Operacional", "Automações Avançadas", "Dashboard Completo", "Clientes em Risco", "Até 5 Operadores", "Suporte Prioritário"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/experimentar" className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all text-center shadow-lg shadow-primary/20">
                Escolher Plano Pro
              </Link>
            </motion.div>

            {/* Enterprise */}
            <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="bg-white p-10 rounded-[2rem] border border-slate-200 flex flex-col">
              <div className="mb-8">
                <h4 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-black text-slate-900">Sob consulta</span>
                </div>
                <p className="text-slate-500 text-sm mt-4 italic">Soluções à medida.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {["Tudo do Pro", "Solução Personalizada", "Integrações via API", "Suporte Dedicado 24/7", "Operadores Ilimitados", "Formação de Equipa"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/contacto" className="w-full py-4 border border-slate-200 rounded-xl font-bold text-slate-900 hover:bg-slate-50 transition-all text-center">
                Contactar Vendas
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION FINAL */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-[3rem] p-12 lg:p-24 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-4xl mx-auto space-y-8">
              <h2 className="text-4xl lg:text-6xl font-display font-extrabold">
                Comece hoje a organizar a sua empresa e recuperar clientes automaticamente
              </h2>
              <p className="text-xl text-white/80">
                Junte-se a centenas de empresas que já escalaram a sua operação com o TrataTudo AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/experimentar"
                  className="w-full sm:w-auto bg-white text-primary px-10 py-5 rounded-full text-xl font-bold hover:bg-slate-50 transition-all shadow-2xl"
                >
                  Testar grátis
                </Link>
                <Link
                  to="/contacto"
                  className="w-full sm:w-auto bg-primary-dark text-white border border-white/20 px-10 py-5 rounded-full text-xl font-bold hover:bg-primary/80 transition-all"
                >
                  Pedir demonstração
                </Link>
              </div>
              <p className="text-sm text-white/60 italic">“É como ter um sistema que nunca para.”</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Globe = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);
