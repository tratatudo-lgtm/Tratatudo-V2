import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  MessageCircle, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Users, 
  Building2, 
  Clock,
  Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

export function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_50%,rgba(37,99,235,0.08)_0%,transparent_100%)]" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold"
            >
              <Zap className="w-4 h-4" />
              <span>Nova versão 2.0 disponível</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-5xl lg:text-7xl font-display font-extrabold text-slate-900 leading-[1.1]"
            >
              Automatize o atendimento da sua organização no <span className="text-primary">WhatsApp</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
            >
              A plataforma híbrida que permite responder automaticamente a cidadãos e clientes, gerir pedidos e acompanhar comunicações num único painel simples.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link
                to="/experimentar"
                className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
              >
                Experimentar Grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                Entrar no painel
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="pt-16 relative"
            >
              <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full -z-10" />
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200&h=800" 
                alt="Dashboard TrataTudo" 
                className="rounded-2xl shadow-2xl border border-slate-200 mx-auto"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-primary font-bold uppercase tracking-widest text-sm">Funcionalidades</h2>
            <h3 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">Tudo o que precisa para um atendimento de excelência</h3>
            <p className="text-slate-600 text-lg">Ferramentas poderosas desenhadas para simplificar a comunicação e aumentar a produtividade.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageCircle className="w-8 h-8" />,
                title: "Respostas Automáticas",
                desc: "Configure chatbots inteligentes que respondem instantaneamente às dúvidas mais comuns 24/7."
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Gestão de Pedidos",
                desc: "Transforme mensagens em tickets e acompanhe o estado de cada reclamação ou pedido."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Multi-agente",
                desc: "Vários operadores podem gerir a mesma conta de WhatsApp de forma organizada e transparente."
              },
              {
                icon: <ShieldCheck className="w-8 h-8" />,
                title: "Segurança de Dados",
                desc: "Conformidade total com o RGPD e encriptação de ponta a ponta em todas as comunicações."
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "Interface Mobile",
                desc: "Gira a sua organização a partir de qualquer lugar com a nossa interface totalmente responsiva."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Integrações",
                desc: "Ligue o TrataTudo ao seu CRM ou software de gestão atual através da nossa API robusta."
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

      {/* Como Funciona */}
      <section id="como-funciona" className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-primary font-bold uppercase tracking-widest text-sm">Como funciona</h2>
              <h3 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 leading-tight">Implementação rápida em 3 passos simples</h3>
              
              <div className="space-y-8">
                {[
                  { step: "01", title: "Conecte o seu número", desc: "Faça scan do QR Code e ligue o seu número oficial de WhatsApp à plataforma em segundos." },
                  { step: "02", title: "Configure a automação", desc: "Defina fluxos de resposta, horários de atendimento e atribua equipas aos departamentos." },
                  { step: "03", title: "Comece a atender", desc: "Acompanhe tudo em tempo real através do painel de controlo e melhore a satisfação dos cidadãos." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="text-4xl font-display font-black text-primary/20">{item.step}</div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full -z-10" />
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=800&h=1000" 
                alt="Processo TrataTudo" 
                className="rounded-3xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Para Quem É */}
      <section id="para-quem" className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-primary font-bold uppercase tracking-widest text-sm">Para quem é</h2>
            <h3 className="text-4xl lg:text-5xl font-display font-bold">Soluções adaptadas a cada necessidade</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              {...fadeIn}
              className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Building2 className="w-12 h-12 text-primary mb-6" />
              <h4 className="text-2xl font-bold mb-4">Setor Público</h4>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Câmaras Municipais, Juntas de Freguesia e Instituições Públicas que precisam de aproximar os serviços dos cidadãos e gerir ocorrências de forma eficiente.
              </p>
              <ul className="space-y-3">
                {["Reporte de avarias", "Agendamento de serviços", "Informações úteis", "Consultas de processos"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Zap className="w-12 h-12 text-primary mb-6" />
              <h4 className="text-2xl font-bold mb-4">Setor Privado</h4>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Empresas de serviços, retalho e suporte que pretendem automatizar vendas, gerir reclamações e oferecer um suporte premium via WhatsApp.
              </p>
              <ul className="space-y-3">
                {["Vendas automáticas", "Suporte ao cliente", "Gestão de encomendas", "Fidelização"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1 space-y-6">
              <h3 className="text-4xl font-display font-bold text-slate-900">Porquê escolher o TrataTudo?</h3>
              <p className="text-slate-600 text-lg">Não somos apenas mais um chatbot. Somos o parceiro estratégico da sua comunicação.</p>
              <Link to="/experimentar" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
                Ver todos os benefícios <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: <Clock />, title: "Redução de 70% no tempo de espera", desc: "Respostas imediatas que aumentam a satisfação." },
                { icon: <Users />, title: "Equipas mais produtivas", desc: "Foco no que realmente importa, automação no resto." },
                { icon: <BarChart3 />, title: "Métricas em tempo real", desc: "Saiba exatamente o que os seus clientes precisam." },
                { icon: <ShieldCheck />, title: "Conformidade Total", desc: "Segurança máxima para os seus dados e dos seus clientes." }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-primary mb-4">{item.icon}</div>
                  <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-[3rem] p-12 lg:p-24 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl lg:text-6xl font-display font-extrabold">Pronto para transformar o seu atendimento?</h2>
              <p className="text-xl text-white/80">Junte-se a centenas de organizações que já utilizam o TrataTudo para comunicar melhor.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/experimentar"
                  className="w-full sm:w-auto bg-white text-primary px-10 py-5 rounded-full text-xl font-bold hover:bg-slate-50 transition-all shadow-2xl"
                >
                  Começar Agora Grátis
                </Link>
                <Link
                  to="/contacto"
                  className="w-full sm:w-auto bg-primary-dark text-white border border-white/20 px-10 py-5 rounded-full text-xl font-bold hover:bg-primary/80 transition-all"
                >
                  Falar com um especialista
                </Link>
              </div>
              <p className="text-sm text-white/60">Sem cartão de crédito necessário. Teste grátis por 14 dias.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
