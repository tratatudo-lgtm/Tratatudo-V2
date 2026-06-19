import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  MessageCircle, 
  Zap, 
  BarChart3, 
  Users, 
  Building2, 
  Bot, 
  ChevronDown, 
  Star, 
  Quote, 
  Send, 
  Rocket, 
  Shield, 
  Coins, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Smartphone, 
  Settings, 
  Globe
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const GlowEffect = ({ color = "indigo" }: { color?: string }) => (
  <div className={`absolute -z-10 w-[500px] h-[500px] bg-${color}-500/20 blur-[120px] rounded-full pointer-events-none`} />
);

export function Home() {
  const [isWhiteLabelMode, setIsWhiteLabelMode] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('modo') === 'wl') {
      setIsWhiteLabelMode(true);
    }
  }, []);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white overflow-hidden">

      {/* --- HERO SECTION --- */}
      <section id="hero" className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <GlowEffect color="indigo" />
        </div>
        <div className="absolute top-1/4 -right-1/4">
          <GlowEffect color="purple" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-4 py-1.5 rounded-full text-xs text-indigo-400 mb-8 backdrop-blur-md"
          >
            <div className="flex gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
            </div>
            <span className="font-medium">+500 Empresas Otimizadas em Portugal</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] mb-8"
          >
            <span className="bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">
              {isWhiteLabelMode ? (
                "Tenha o Seu Próprio Software SaaS em 24h"
              ) : (
                "Não Perca Mais Nenhuma Venda no WhatsApp"
              )}
            </span>
            <br />
            <span className="text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              {isWhiteLabelMode ? (
                "Lucre com a Sua Própria Marca"
              ) : (
                "Centralize e Automatize com IA"
              )}
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-slate-400 max-w-3xl leading-relaxed mb-12"
          >
            {isWhiteLabelMode ? (
              "Esqueça os custos com equipas de programação. Receba uma plataforma de CRM e Automação de WhatsApp robusta, pronta a revender com o seu logótipo, marca e domínio."
            ) : (
              "Organize os seus clientes, coloque a nossa Inteligência Artificial a atender e qualificar contactos 24/7 e recupere o controlo da sua operação comercial."
            )}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md sm:max-w-none justify-center px-4 mb-20"
          >
            <a
              href={isWhiteLabelMode 
                ? "https://wa.me/351923364360?text=Quero%20saber%20mais%20sobre%20o%20modelo%20White%20Label"
                : "https://wa.me/351923364360?text=Quero%20fazer%20o%20teste%20gratis%20da%20IA"
              }
              target="_blank"
              rel="noreferrer"
              className="group relative inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-10 py-5 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)] overflow-hidden"
            >
              <span className="relative z-10 flex flex-col items-center">
                <span>{isWhiteLabelMode ? "Falar com Consultor de Revenda" : "Testar Assistente IA no WhatsApp"}</span>
                <span className="text-[10px] opacity-70 font-normal uppercase tracking-wider">Demonstração Instantânea</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </a>
            <button
              onClick={() => {
                setIsWhiteLabelMode(!isWhiteLabelMode);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold px-10 py-5 rounded-2xl border border-slate-700 transition-all duration-300"
            >
              {isWhiteLabelMode ? "Ver Recursos para Empresas (PMEs)" : "Quero Criar a Minha Marca SaaS"}
            </button>
          </motion.div>

          {/* DASHBOARD SIMULATION */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="relative w-full max-w-5xl mx-auto mt-10 md:mt-20"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-20" />
            <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-2xl p-4 md:p-8 shadow-2xl overflow-hidden aspect-[16/9] md:aspect-auto text-left">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="hidden md:flex items-center gap-6 text-xs text-slate-500 font-medium">
                  <span>Dashboard Central</span>
                  <span>Funil CRM</span>
                  <span>Instâncias WhatsApp</span>
                  <span>Agente IA</span>
                </div>
                <div className="w-20 h-2 bg-slate-800 rounded-full" />
              </div>

              <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 md:col-span-4 space-y-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 h-32 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 tracking-tight">+24%</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">1,280€</div>
                      <div className="text-[10px] text-slate-500">Faturação Comercial Hoje</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 h-32 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <Bot className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 tracking-tight">Ativo</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">98</div>
                      <div className="text-[10px] text-slate-500">Leads Qualificadas pela IA</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-8">
                  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 h-full">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-xs font-bold text-slate-300">Fluxo Operacional de Mensagens</h4>
                      <div className="flex gap-2">
                        <div className="w-8 h-4 bg-indigo-500/20 rounded border border-indigo-500/50" />
                        <div className="w-8 h-4 bg-slate-700 rounded" />
                      </div>
                    </div>
                    <div className="flex items-end justify-between h-40 gap-1 md:gap-3">
                      {[40, 70, 45, 90, 65, 80, 50, 75, 100, 60, 85, 45].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.5 + (i * 0.05), duration: 1 }}
                          className={`flex-1 rounded-t-sm ${i === 8 ? 'bg-indigo-500' : 'bg-slate-700 opacity-50'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Chat Bubble */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute right-10 top-20 hidden lg:flex bg-white text-slate-900 border border-slate-200 p-3 rounded-2xl shadow-2xl items-start gap-3 w-64"
              >
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold">Cliente: "Tem vaga para hoje?"</p>
                  <p className="text-[10px] text-slate-500 font-medium">IA TrataTudo: "Com certeza! Consegui bloquear as 15:30h ou 17:00h. Qual prefere agendar?"</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- PROBLEM SECTION --- */}
      <section id="problema" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2">
           <GlowEffect color="red" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              {...fadeIn}
              className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
            >
              {isWhiteLabelMode 
                ? "Porquê continuar a vender serviços de margem baixa se pode ser dono do produto?"
                : "A sua equipa passa mais tempo a organizar conversas do que a fechar contratos?"}
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: isWhiteLabelMode ? "Dependência de Terceiros" : "Caos no WhatsApp Comercial",
                desc: isWhiteLabelMode 
                  ? "Fica refém de plataformas caras que aumentam as mensalidades sem aviso prévio, esmagando a sua margem de lucro."
                  : "Leads quentes perdidas em conversas infinitas, falta de histórico centralizado e comerciais sem saber quem priorizar.",
                tag: isWhiteLabelMode ? "fim das taxas" : "leads perdidas"
              },
              {
                title: isWhiteLabelMode ? "Esforço Tecnológico Gigante" : "Gestão Fragmentada",
                desc: isWhiteLabelMode 
                  ? "Criar uma plataforma do zero custaria meses de trabalho e milhares de euros desperdiçados com equipas de código."
                  : "Usa uma app para tarefas, folhas de Excel soltas e notas em papel. As ferramentas não comunicam e a informação perde-se.",
                tag: isWhiteLabelMode ? "zero código" : "erro operacional"
              },
              {
                title: isWhiteLabelMode ? "Falta de Recorrência Previsível" : "Fadiga e Lentidão no Fecho",
                desc: isWhiteLabelMode 
                  ? "Vender consultoria ou projetos pontuais obriga-o a caçar novos clientes todos os meses para manter a faturação estável."
                  : "Perdem-se horas preciosas todos os dias em tarefas manuais e repetitivas que a Inteligência Artificial executa em milissegundos.",
                tag: isWhiteLabelMode ? "receita previsível" : "tempo perdido"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                {...fadeIn}
                transition={{ delay: idx * 0.1 }}
                className="group p-8 rounded-3xl bg-slate-900/50 backdrop-blur-md border border-slate-800/80 hover:border-slate-700 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {item.desc}
                </p>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400 opacity-60">#{item.tag}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BENEFITS SECTION --- */}
      <section id="beneficios" className="py-24 px-4 bg-slate-950 relative border-y border-slate-900">
        <div className="absolute bottom-0 right-0">
          <GlowEffect color="indigo" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Centralize tudo o que o seu negócio precisa para escalar</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Send className="w-6 h-6 text-indigo-400" />,
                title: "Fluxos de Venda Autónomos",
                desc: "Conecte o seu número e desenhe árvores de conversão automatizadas que encaminham, qualificam e filtram leads na hora."
              },
              {
                icon: <Users className="w-6 h-6 text-purple-400" />,
                title: "CRM Nativo Unificado",
                desc: "Acompanhe todo o ciclo de vida do contacto. Notas de atendimento, pipelines visuais e tarefas na mesma janela."
              },
              {
                icon: <Bot className="w-6 h-6 text-cyan-400" />,
                title: "Agentes de IA Treinados",
                desc: "Os robôs inteligentes absorvem o conhecimento da sua empresa (ficheiros, links ou PDFs) para responder de forma humanizada."
              },
              {
                icon: <Settings className="w-6 h-6 text-emerald-400" />,
                title: "Faturação e Webhooks",
                desc: "Sincronize eventos de pagamento instantaneamente e automatize a libertação de serviços sem intervenção manual."
              }
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 hover:bg-slate-900/50 transition-all duration-300"
              >
                <div className="mb-6">{benefit.icon}</div>
                <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{benefit.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="como-funciona" className="py-24 px-4 overflow-hidden text-center">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Configuração Rápida em 3 Passos</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

            {[
              {
                step: "01",
                title: "Efetue o Scan do QR Code",
                desc: "Ligue as suas instâncias de WhatsApp comercial de forma segura e imediata.",
                icon: <Smartphone className="w-6 h-6" />
              },
              {
                step: "02",
                title: "Defina Regras e Contexto",
                desc: "Escreva as diretrizes da sua empresa ou forneça os dados para treinar o cérebro da IA.",
                icon: <Settings className="w-6 h-6" />
              },
              {
                step: "03",
                title: "Acompanhe no Dashboard",
                desc: "Deixe a automação correr em background e assuma o controlo apenas nos fechos estratégicos.",
                icon: <BarChart3 className="w-6 h-6" />
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                {...fadeIn}
                transition={{ delay: idx * 0.2 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xl mb-6 relative z-10">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{step.desc}</p>
                <div className="mt-4 text-[40px] font-black text-slate-800/30 select-none">{step.step}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- WHITE LABEL SECTION --- */}
      <section id="white-label" className="relative py-24 px-4 overflow-hidden bg-indigo-950/20 border-y border-indigo-500/10">
        <div className="absolute inset-0 z-0">
          <GlowEffect color="indigo" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div {...fadeIn}>
            <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.2em] mb-6">
              Oportunidade Exclusiva para Agências e Consultores
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
              Transforme a nossa Tecnologia no <br /><span className="text-indigo-400">Seu Próprio Império SaaS.</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Pague um custo fixo previsível por licença e revenda a plataforma de automação e CRM aos seus clientes corporativos pelo preço que decidir. A margem comercial é 100% sua.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 text-left max-w-3xl mx-auto mb-16">
            {[
              { title: "Solução 'Chave na Mão'", desc: "Entregamos a infraestrutura espelhada sob o seu próprio subdomínio em poucas horas.", icon: <Rocket className="w-5 h-5 text-indigo-400" /> },
              { title: "Precificação Livre", desc: "Crie os seus pacotes, defina os valores de subscrição e retenha o lucro recorrente.", icon: <Coins className="w-5 h-5 text-indigo-400" /> },
              { title: "Manutenção Isolada", desc: "A nossa equipa garante a estabilidade dos servidores, segurança de dados e updates.", icon: <Shield className="w-5 h-5 text-indigo-400" /> },
              { title: "Painel de Controlo White-Label", desc: "Crie, suspenda ou edite contas de clientes através de um painel admin administrativo super limpo.", icon: <Globe className="w-5 h-5 text-indigo-400" /> }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-950/60 backdrop-blur-xl p-6 rounded-2xl border border-white/5 flex gap-4 items-start hover:border-indigo-500/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <strong className="text-white block mb-1 font-bold">{item.title}</strong>
                  <span className="text-xs text-slate-400 leading-relaxed italic">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <a
            href="https://wa.me/351923364360?text=Quero%20saber%20mais%20sobre%20o%20modelo%20White%20Label"
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-10 py-5 rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
          >
            <span className="flex items-center gap-2">
              Validar Vagas de Revenda
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
        </div>
      </section>

      {/* --- SOCIAL PROOF --- */}
      <section id="autoridade" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid gap-12 md:grid-cols-3 text-center mb-24">
          {[
            { label: "Empresas Ativas", value: "+500", icon: <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-4" /> },
            { label: "Mensagens Processadas", value: "+3 Milhões", icon: <Send className="w-8 h-8 text-slate-600 mx-auto mb-4" /> },
            { label: "Disponibilidade de Servidor", value: "99.8%", icon: <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-4" /> }
          ].map((stat, idx) => (
            <div key={idx} className="relative">
              <span className="block text-5xl md:text-7xl font-black text-white/10 absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none select-none">{stat.value}</span>
              <div className="relative pt-4">
                <span className="block text-4xl font-black text-white mb-2">{stat.value}</span>
                <span className="text-sm text-indigo-400 font-bold uppercase tracking-widest">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 flex flex-col justify-between items-start gap-8 text-left">
            <Quote className="w-10 h-10 text-indigo-500/20" />
            <p className="text-lg text-slate-300 leading-relaxed font-medium">
              "Antes do TrataTudo, gerir as mensagens dos nossos imóveis era um inferno tático. Perdíamos cerca de um terço dos contactos por atraso na resposta. Hoje, a IA responde na hora e qualifica o cliente. O retorno foi absurdo."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white">RS</div>
              <div>
                <strong className="text-white block font-bold text-base">Ricardo S.</strong>
                <span className="text-xs text-indigo-400 font-bold uppercase">Diretor de Vendas</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 flex flex-col justify-between items-start gap-8 text-left">
            <Quote className="w-10 h-10 text-emerald-500/20" />
            <p className="text-lg text-slate-300 leading-relaxed font-medium">
              "Estruturar e codificar um SaaS próprio de automação estava completamente fora do meu orçamento. Com o ecossistema White Label deles, montei a minha agência de sistemas em 48 horas. Já conto com faturamento recorrente sólido."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-emerald-400">SM</div>
              <div>
                <strong className="text-white block font-bold text-base">Sofia M.</strong>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wide">Estrategista Digital</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-24 px-4 bg-slate-950/50 backdrop-blur-sm border-t border-slate-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-bold text-white">Perguntas Frequentes</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "A quem se destina o TrataTudo?",
                a: "A nossa ferramenta foi arquitetada especificamente para prestadores de serviços, imobiliárias, agências, clínicas e qualquer negócio que processe o WhatsApp como o seu ecossistema primário de aquisição de clientes."
              },
              {
                q: "Necessito de conhecimentos de programação para operar o White Label?",
                a: "Não, rigorosamente nenhuns. A gestão de clientes e instâncias é realizada de forma visual e intuitiva através de um painel administrativo centralizado. Nós suportamos toda a infraestrutura e atualizações de código."
              },
              {
                q: "Como funciona a margem de lucro na revenda?",
                a: "A sua agência liquida um valor de custo fixo extremamente reduzido por instância ativa instalada na nossa VPS e comercializa aos seus clientes finais de acordo com a tabela de preços que estruturar. A margem média situa-se nos 300%."
              },
              {
                q: "Qual o tempo estimado de entrega da minha marca própria?",
                a: "Assim que vincularmos as credenciais básicas de branding (o seu logótipo e o mapeamento das zonas DNS do seu domínio personalizado), a infraestrutura isolada fica operacional em poucas horas."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-6 font-bold text-white flex justify-between items-center hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-base md:text-lg">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: faqOpen === idx ? 180 : 0 }}
                    className="text-indigo-400"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {faqOpen === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-6 pt-0 text-slate-400 text-sm md:text-base leading-relaxed border-t border-slate-800/40">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section id="cta-final" className="py-32 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <GlowEffect color="indigo" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h2 
            {...fadeIn}
            className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight"
          >
            Chegou a hora de tratar de <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 underline decoration-indigo-500/30">tudo o que importa.</span>
          </motion.h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Seja para automatizar o atendimento do seu negócio ou para construir uma faturação recorrente altamente escalável com o seu próprio SaaS.
          </p>

          <div className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-bold text-xs md:text-sm px-6 py-3 rounded-full inline-flex items-center gap-2 mb-10">
            <Rocket className="w-4 h-4" />
            Garante condições exclusivas de ativação entrando em contacto hoje.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/351923364360?text=Quero%20iniciar%20a%20demonstracao%20do%20TrataTudo"
              target="_blank"
              rel="noreferrer"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-12 py-6 rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all duration-300 text-lg flex items-center gap-3 active:scale-95"
            >
              Iniciar Teste Interativo
              <ArrowRight className="w-6 h-6" />
            </a>
          </div>
        </div>
      </section>

      {/* --- MOBILE STICKY CTA --- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:hidden z-50">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4"
        >
          <div className="text-left shrink-0">
            <span className="block text-[10px] text-indigo-400 font-black uppercase tracking-widest">Teste Grátis</span>
            <span className="text-sm text-white font-black">TrataTudo IA</span>
          </div>
          <a
            href="https://wa.me/351923364360?text=Quero%20testar%20a%20plataforma%20pelo%20telemovel"
            target="_blank"
            rel="noreferrer"
            className="bg-indigo-600 text-white font-black text-xs px-6 py-3 rounded-xl active:scale-95 transition-transform shrink-0"
          >
            Iniciar Demo
          </a>
        </motion.div>
      </div>

    </div>
  );
}
