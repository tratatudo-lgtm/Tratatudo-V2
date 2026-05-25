/**
 * Controller for Tickets operations
 */

let allTickets = [];
let activeTicket = null;

// --- ELEMENT REFERENCES ---
const ticketsList = document.getElementById('tickets-list');
const ticketsLoading = document.getElementById('tickets-loading');
const ticketsEmpty = document.getElementById('tickets-empty');
const totalBadge = document.getElementById('ticket-total-badge');

const chatPlaceholder = document.getElementById('chat-placeholder');
const chatBox = document.getElementById('chat-box');
const chatClientName = document.getElementById('chat-client-name');
const chatTicketTitle = document.getElementById('chat-ticket-title');
const chatTicketStatus = document.getElementById('chat-ticket-status');
const chatMessages = document.getElementById('chat-messages');
const chatSendForm = document.getElementById('chat-send-form');
const chatInput = document.getElementById('chat-input');
const btnResolve = document.getElementById('btn-resolve-ticket');

// --- LOAD TICKETS FROM API ---
async function fetchTickets() {
  ticketsLoading.classList.remove('hidden');
  ticketsList.classList.add('hidden');
  ticketsEmpty.classList.add('hidden');

  try {
    const res = await window.apiGet('/api/admin/tickets');
    if (res && res.ok) {
      allTickets = res.data || [];
      renderTickets();
    } else {
      throw new Error(res.error || "Erro ao coletar tickets.");
    }
  } catch (err) {
    console.error(err);
    ticketsEmpty.classList.remove('hidden');
  } finally {
    ticketsLoading.classList.add('hidden');
  }
}

// --- RENDER TICKETS SIDEBAR ---
function renderTickets() {
  ticketsList.innerHTML = '';
  totalBadge.textContent = allTickets.length;

  if (allTickets.length === 0) {
    ticketsEmpty.classList.remove('hidden');
    ticketsList.classList.add('hidden');
    return;
  }

  ticketsEmpty.classList.add('hidden');
  ticketsList.classList.remove('hidden');

  allTickets.forEach(ticket => {
    const card = document.createElement('div');
    const isSelected = activeTicket && activeTicket.id === ticket.id;
    
    // Status visual parameters
    const statusLabel = ticket.status === 'resolved' ? 'Resolvido' : 'Pendente';
    const statusColorClass = ticket.status === 'resolved' 
      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' 
      : 'bg-amber-500/10 text-amber-500 border-amber-500/10';

    card.className = `p-4 border rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${
      isSelected 
        ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-600/5' 
        : 'bg-slate-900/50 border-white/5 hover:border-white/10'
    }`;

    // Read related client company name if exists
    const company = ticket.clients?.company_name || 'Empresa Tenant';

    card.innerHTML = `
      <div class="flex justify-between items-start gap-2 mb-2">
        <span class="text-xs font-black text-white truncate max-w-[120px]">${company}</span>
        <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-full ${statusColorClass}">
          ${statusLabel}
        </span>
      </div>
      <p class="text-[11px] font-semibold text-slate-400 line-clamp-1 mb-2">${ticket.title || 'Sem assunto'}</p>
      <div class="flex items-center justify-between text-[9px] font-bold text-slate-500">
        <span class="uppercase">Prioridade ${ticket.priority || 'baixa'}</span>
        <span>${new Date(ticket.created_at).toLocaleDateString('pt')}</span>
      </div>
    `;

    card.onclick = () => {
      selectTicket(ticket);
    };

    ticketsList.appendChild(card);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// --- SELECT TICKET & LOAD CHAT ---
async function selectTicket(ticket) {
  activeTicket = ticket;
  renderTickets(); // Refresh selected highlight state
  
  chatPlaceholder.classList.add('hidden');
  chatBox.classList.remove('hidden');

  // Fill Header
  chatClientName.textContent = ticket.clients?.company_name || 'Cliente';
  chatTicketTitle.textContent = ticket.title || 'Sem título';
  chatTicketStatus.textContent = ticket.status === 'resolved' ? 'Resolvido' : 'Pendente';
  
  if (ticket.status === 'resolved') {
    chatTicketStatus.className = "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/10";
    btnResolve.classList.add('hidden');
  } else {
    chatTicketStatus.className = "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/10";
    btnResolve.classList.remove('hidden');
  }

  loadTicketMessages(ticket.id);
}

// --- LOAD MESSAGES IN CHAT TIMELINE ---
async function loadTicketMessages(ticketId) {
  chatMessages.innerHTML = `
    <div class="flex items-center justify-center h-full py-20 text-slate-500">
      <i data-lucide="loader" class="w-6 h-6 animate-spin"></i>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const res = await window.apiGet(`/api/admin/tickets/${ticketId}`);
    if (res && res.ok && res.data) {
      const messages = res.data.ticket_messages || [];
      renderTimeline(messages);
    }
  } catch (err) {
    chatMessages.innerHTML = `
      <div class="text-center py-20 text-xs text-rose-400">Falha ao ler mensagens.</div>
    `;
  }
}

function renderTimeline(messages) {
  chatMessages.innerHTML = '';

  if (messages.length === 0) {
    chatMessages.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-slate-500 py-12">
        <i data-lucide="message-square-off" class="w-8 h-8 mb-2"></i>
        <p class="text-xs font-bold font-medium">Nenhuma mensagem neste ticket.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  messages.forEach(msg => {
    const div = document.createElement('div');
    const isAdmin = msg.role === 'admin';

    div.className = `flex ${isAdmin ? 'justify-end' : 'justify-start'} w-full animate-fade-in`;

    div.innerHTML = `
      <div class="max-w-[75%] rounded-2xl p-4 text-xs font-bold border ${
        isAdmin 
          ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none' 
          : 'bg-slate-900 border-white/5 text-slate-300 rounded-tl-none'
      }">
        <p class="font-bold leading-normal whitespace-pre-line">${msg.text || ''}</p>
        <span class="text-[8px] opacity-60 block mt-2 text-right">
          ${new Date(msg.created_at).toLocaleTimeString('pt', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    `;
    chatMessages.appendChild(div);
  });

  scrollChatBottom();
}

function scrollChatBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- SEND MESSAGE FORM SUBMIT ---
chatSendForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!activeTicket) return;

  const text = chatInput.value.trim();
  if (!text) return;

  // Append immediately in optimistic UI update
  const optMsg = {
    id: 'placeholder',
    role: 'admin',
    text: text,
    created_at: new Date().toISOString()
  };
  
  // Hide empty state if exists before appending
  const emptyPlaceholder = chatMessages.querySelector('[data-lucide="message-square-off"]')?.parentElement;
  if (emptyPlaceholder) chatMessages.innerHTML = '';
  
  appendMessageUI(optMsg);
  chatInput.value = '';

  try {
    const res = await window.apiPost(`/api/admin/tickets/${activeTicket.id}/messages`, { text });
    if (res && res.ok) {
      // Re-load to get actual DB timestamp and ID
      loadTicketMessages(activeTicket.id);
    } else {
      throw new Error();
    }
  } catch (err) {
    alert("Falha ao registar a mensagem no servidor de suporte.");
    loadTicketMessages(activeTicket.id); // Redraw
  }
});

function appendMessageUI(msg) {
  const div = document.createElement('div');
  div.className = 'flex justify-end w-full animate-fade-in';
  div.innerHTML = `
    <div class="max-w-[75%] bg-indigo-600 border border-indigo-500 rounded-2xl rounded-tr-none p-4 text-xs text-white">
      <p class="font-bold whitespace-pre-line">${msg.text}</p>
      <span class="text-[8px] opacity-60 block mt-2 text-right">Agora</span>
    </div>
  `;
  chatMessages.appendChild(div);
  scrollChatBottom();
}

// --- RESOLVE TICKET ACTION ---
btnResolve.addEventListener('click', async () => {
  if (!activeTicket) return;
  if (!confirm("Altear o estado deste ticket para RESOLVIDO? O cliente receberá um aviso.")) return;

  try {
    const res = await window.apiPut(`/api/admin/tickets/${activeTicket.id}/status`, { status: 'resolved' });
    if (res && res.ok) {
      alert("Ticket de suporte fechado com sucesso!");
      // Clean chat box or reload
      activeTicket = null;
      chatBox.classList.add('hidden');
      chatPlaceholder.classList.remove('hidden');
      fetchTickets();
    } else {
      throw new Error();
    }
  } catch (err) {
    alert("Erro ao salvar status de resolução.");
  }
});

// --- INITIALIZER ---
document.addEventListener('DOMContentLoaded', () => {
  fetchTickets();
});
