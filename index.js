import dotenv from 'dotenv';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Rota do Webhook
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const { phone_e164, message_text, client_id } = req.body;

    if (!phone_e164 || !message_text || !client_id) {
      return res.status(400).json({ error: 'Faltam dados obrigatórios.' });
    }

    console.log(`\n📩 [Inbound] Mensagem de ${phone_e164} (Client ID: ${client_id})`);
    console.log(`💬 Texto: "${message_text}"`);

    // PASSO A: Verificar ou Criar Sessão em wa_chats
    let { data: chat, error: chatError } = await supabase
      .from('wa_chats')
      .select('*')
      .eq('client_id', client_id)
      .eq('phone_e164', phone_e164)
      .maybeSingle();

    if (chatError) throw chatError;

    if (!chat) {
      console.log(`✨ [Sessão] Criando novo chat em wa_chats...`);
      const { data: newChat, error: createError } = await supabase
        .from('wa_chats')
        .insert([{ client_id, phone_e164, current_intent: 'general', current_step: 'start', context_data: {} }])
        .select()
        .single();

      if (createError) throw createError;
      chat = newChat;
    }

    // PASSO B: Buscar Histórico Recente (wa_messages)
    const { data: history, error: historyError } = await supabase
      .from('wa_messages')
      .select('direction, message_text')
      .eq('client_id', client_id)
      .eq('phone_e164', phone_e164)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) throw historyError;
    const formattedHistory = history ? history.reverse() : [];

    // PASSO C: Registar a Mensagem Atual
    const { error: insertMsgError } = await supabase
      .from('wa_messages')
      .insert([{ client_id, phone_e164, direction: 'inbound', message_text }]);

    if (insertMsgError) throw insertMsgError;

    console.log(`🧠 [Contexto] Pronto. Histórico recuperado: ${formattedHistory.length} mensagens.`);

    return res.status(200).json({
      success: true,
      message: 'Contexto carregado.',
      session: { intent: chat.current_intent, step: chat.current_step }
    });

  } catch (error) {
    console.error('❌ [Erro]:', error.message || error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 TrataTudo V2 Backend ativo na porta ${PORT}`);
});
