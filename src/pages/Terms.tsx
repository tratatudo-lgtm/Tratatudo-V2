import React from 'react';
import { motion } from 'motion/react';

export function Terms() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto prose prose-slate lg:prose-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <h1 className="text-4xl lg:text-6xl font-display font-bold text-slate-900">Termos de Serviço</h1>
            <p className="text-slate-600">Última atualização: 13 de Março de 2026</p>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">1. Aceitação dos Termos</h2>
              <p>
                Ao aceder e utilizar a plataforma TrataTudo, concorda em cumprir e estar vinculado aos seguintes Termos de Serviço. Se não concordar com qualquer parte destes termos, não deverá utilizar os nossos serviços.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">2. Descrição do Serviço</h2>
              <p>
                O TrataTudo fornece uma plataforma de automação de atendimento via WhatsApp, permitindo a gestão de mensagens, tickets e interações automatizadas para organizações públicas e privadas.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">3. Responsabilidades do Utilizador</h2>
              <p>
                O utilizador é responsável por manter a confidencialidade da sua conta e senha, bem como por todas as atividades que ocorram sob a sua conta. Compromete-se a utilizar a plataforma em conformidade com todas as leis e regulamentos aplicáveis.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">4. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo, funcionalidades e tecnologia da plataforma TrataTudo são propriedade exclusiva da nossa empresa e estão protegidos por leis de direitos de autor e propriedade intelectual.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">5. Limitação de Responsabilidade</h2>
              <p>
                O TrataTudo não será responsável por quaisquer danos indiretos, incidentais, especiais ou consequentes resultantes do uso ou da incapacidade de usar os nossos serviços.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">6. Alterações aos Termos</h2>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a sua publicação na plataforma.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">7. Contacto</h2>
              <p>
                Para qualquer dúvida sobre estes Termos de Serviço, entre em contacto connosco através do email geral@tratatudo.pt.
              </p>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
