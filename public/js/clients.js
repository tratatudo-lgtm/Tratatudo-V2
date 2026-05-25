/**
 * Controller for Clients Operations
 */

let allClients = [];
let filteredClients = [];
let activeFilter = 'all';
let searchQuery = '';
let selectedClient = null;
let selectedTrialPlan = 'starter';

// --- ELEMENT REFERENCES ---
const clientsGrid = document.getElementById('clients-grid');
const clientsLoading = document.getElementById('clients-loading');
const clientsEmpty = document.getElementById('clients-empty');
const searchInput = document.getElementById('clients-search-input');
const filterButtons = document.querySelectorAll('[data-filter]');

// Drawer
const drawer = document.getElementById('client-drawer');
const drawerPanel = document.getElementById('drawer-panel');
const drawerCloseBtn = document.getElementById('drawer-close-btn');
const drawerTitle = document.getElementById('drawer-title');
const drawerSubtitle = document.getElementById('drawer-subtitle');
const drawerPlan = document.getElementById('drawer-plan');
const drawerInstance = document.getElementById('drawer-instance');
const drawerExpiry = document.getElementById('drawer-expiry');
const drawerPhone = document.getElementById('drawer-phone');
const drawerEmail = document.getElementById('drawer-email');
const btnActivatePro = document.getElementById('btn-activate-production');
const btnToggleStatus = document.getElementById('btn-toggle-status');
const btnDeleteTenant = document.getElementById('btn-delete-tenant');
const btnOpenBotConfig = document.getElementById('btn-open-bot-config');
const btnEditClient = document.getElementById('btn-edit-client');

// Modals
const createTrialModal = document.getElementById('create-trial-modal');
const openCreateTrialBtn = document.getElementById('btn-open-create-trial');
const closeCreateTrialBtn = document.getElementById('create-trial-close');
const createTrialForm = document.getElementById('create-trial-form');
const createTrialBackdrop = document.getElementById('create-trial-backdrop');

const botConfigModal = document.getElementById('bot-config-modal');
const closeBotConfigBtn = document.getElementById('bot-config-close');
const botConfigForm = document.getElementById('bot-config-form');
const botConfigBackdrop = document.getElementById('bot-config-backdrop');

const editClientModal = document.getElementById('edit-client-modal');
const closeEditClientBtn = document.getElementById('edit-client-close');
const editClientForm = document.getElementById('edit-client-form');
const editClientBackdrop = document.getElementById('edit-client-backdrop');

// Select plan button handlers in the creation form
const planSelectorBtns = document.querySelectorAll('[data-plan]');

// --- LOAD CLIENTS ---
async function fetchClients() {
  showLoading(true);
  try {
    const res = await window.apiGet('/api/admin/clients');
    if (res && res.ok) {
      allClients = res.data || [];
      applyFilters();
    } else {
      throw new Error(res.error || "Erro ao listar");
    }
  } catch (err) {
    alert(err.message || "Erro de rede ao ligar ao servidor.");
  } finally {
    showLoading(false);
  }
}

function showLoading(loading) {
  if (loading) {
    clientsLoading.classList.remove('hidden');
    clientsGrid.classList.add('hidden');
    clientsEmpty.classList.add('hidden');
  } else {
    clientsLoading.classList.add('hidden');
  }
}

// --- FILTER & SEARCH ---
function applyFilters() {
  filteredClients = allClients.filter(client => {
    // Search
    const query = searchQuery.toLowerCase();
    const matchesSearch = client.company_name?.toLowerCase().includes(query) ||
                          client.phone_e164?.includes(query);

    // Status Filter
    let matchesStatus = true;
    if (activeFilter === 'active') {
      matchesStatus = client.status === 'active';
    } else if (activeFilter === 'trial') {
      matchesStatus = client.status === 'trial' || client.status === 'pending';
    } else if (activeFilter === 'suspended') {
      matchesStatus = client.status === 'suspended';
    }

    return matchesSearch && matchesStatus;
  });

  renderClients();
}

// --- RENDER CLIENT CARDS ---
function renderClients() {
  clientsGrid.innerHTML = '';

  if (filteredClients.length === 0) {
    clientsGrid.classList.add('hidden');
    clientsEmpty.classList.remove('hidden');
    return;
  }

  clientsEmpty.classList.add('hidden');
  clientsGrid.classList.remove('hidden');

  filteredClients.forEach(client => {
    const card = document.createElement('div');
    card.setAttribute('class', 'group bg-slate-900 border border-white/5 hover:border-indigo-500/30 rounded-3xl p-5 relative overflow-hidden transition-all duration-300 cursor-pointer active:scale-[0.98]');
    
    // Icon configuration
    const isTrial = client.status === 'trial' || client.status === 'pending';
    const statusLabel = client.status === 'active' ? 'Ativo' : 
                        client.status === 'suspended' ? 'Suspenso' : 
                        client.status === 'trial' ? 'Trial' : 'Pendente';
                        
    const statusColorClass = client.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                             client.status === 'suspended' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                             client.status === 'trial' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                             'bg-slate-500/10 text-slate-400 border-slate-500/20';

    card.innerHTML = `
      <div class="absolute -right-10 -top-10 w-32 h-32 bg-indigo-600/5 blur-3xl rounded-full group-hover:bg-indigo-600/10 transition-colors"></div>
      
      <div class="flex items-start justify-between mb-4 relative z-10">
        <div class="w-11 h-11 rounded-2xl flex items-center justify-center p-2.5 ${isTrial ? 'bg-indigo-500/15 text-indigo-400' : 'bg-emerald-500/15 text-emerald-400'}">
          <i data-lucide="${isTrial ? 'clock' : 'shield-check'}" class="w-full h-full"></i>
        </div>
        <div class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusColorClass}">
          ${statusLabel}
        </div>
      </div>

      <div class="relative z-10">
        <h3 class="text-md font-black text-white leading-tight mb-1 group-hover:text-indigo-400 transition-colors">
          ${client.company_name || 'Sem nome'}
        </h3>
        <div class="flex items-center gap-2 text-slate-400 text-xs font-semibold">
          <i data-lucide="phone" class="w-3.5 h-3.5 text-slate-500"></i>
          <span>${client.phone_e164 || '--'}</span>
        </div>
      </div>

      <div class="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-black">
        <div class="flex items-center gap-2 text-slate-500 uppercase">
          <i data-lucide="zap" class="w-3.5 h-3.5 text-indigo-400"></i>
          <span>${client.plan || 'starter'}</span>
        </div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform"></i>
      </div>
    `;

    card.addEventListener('click', () => {
      openDrawer(client);
    });

    clientsGrid.appendChild(card);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// --- DRAWER ACTIONS & VISIBILITY ---
function openDrawer(client) {
  selectedClient = client;

  // Set Fields
  drawerTitle.textContent = client.company_name || 'Sem nome';
  drawerSubtitle.textContent = `ID: ${client.id}`;
  drawerPlan.textContent = client.plan || 'Starter';
  drawerInstance.textContent = client.instance_name || 'N/A (Multi-Hub)';
  
  if (client.subscription_expires_at) {
    drawerExpiry.textContent = new Date(client.subscription_expires_at).toLocaleDateString('pt');
  } else {
    drawerExpiry.textContent = 'Trial Indeterminado';
  }

  drawerPhone.textContent = client.phone_e164 || '--';
  // Check if profile exists and read email
  const profile = client.client_profiles && client.client_profiles[0];
  drawerEmail.textContent = profile ? profile.email : (client.email || 'Não configurado');

  // Activate Pro button visibility
  const isTrial = client.status === 'trial' || client.status === 'pending';
  if (isTrial) {
    btnActivatePro.classList.remove('hidden');
  } else {
    btnActivatePro.classList.add('hidden');
  }

  // Update Toggle button UI
  if (client.status === 'active') {
    btnToggleStatus.className = "flex items-center justify-center gap-2 p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 rounded-xl font-bold text-xs transition-colors w-full";
    btnToggleStatus.querySelector('span').textContent = 'Suspender';
  } else {
    btnToggleStatus.className = "flex items-center justify-center gap-2 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 rounded-xl font-bold text-xs transition-colors w-full";
    btnToggleStatus.querySelector('span').textContent = 'Reativar';
  }

  // Show Drawer and slide panel
  drawer.classList.remove('hidden');
  setTimeout(() => {
    drawerPanel.classList.remove('translate-x-full');
  }, 10);
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeDrawer() {
  drawerPanel.classList.add('translate-x-full');
  setTimeout(() => {
    drawer.classList.add('hidden');
    selectedClient = null;
  }, 300);
}

// --- MODALS TOGGLE ---
function toggleModal(modal, open) {
  if (open) {
    modal.classList.remove('hidden');
    modal.querySelector('.animate-fade-in')?.classList.add('scale-100');
  } else {
    modal.classList.add('hidden');
  }
}

// --- BUTTON TRIGGERS & FORMS ---

// 1. Plan Selections in formulation
planSelectorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    planSelectorBtns.forEach(b => b.className = "py-2 rounded-lg text-[9px] font-black uppercase border border-white/10 text-slate-400 hover:border-white/20");
    btn.className = "py-2 rounded-lg text-[9px] font-black uppercase border border-indigo-500 bg-indigo-500/10 text-indigo-400";
    selectedTrialPlan = btn.getAttribute('data-plan');
  });
});

// 2. Submit Create Trial Form
createTrialForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const company = document.getElementById('trial-company').value;
  const phone = document.getElementById('trial-phone').value;
  const contact = document.getElementById('trial-contact').value;
  const email = document.getElementById('trial-email').value;
  const instructions = document.getElementById('trial-instructions').value;

  const submitBtn = document.getElementById('submit-trial-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Provisionando Hub Trial...';

  try {
    const payload = {
      client: {
        company_name: company,
        phone_e164: phone,
        status: 'trial',
        plan: selectedTrialPlan,
        bot_instructions: instructions,
        master_prompt: 'Tu és o inteligente assistente de IA da empresa TrataTudo.'
      },
      profile: {
        company_name: company,
        email: email,
        phone_e164: phone
      }
    };

    const res = await window.apiPost('/api/admin/clients', payload);
    if (res && res.ok) {
      alert("Trial provisionado com sucesso na base de dados!");
      toggleModal(createTrialModal, false);
      createTrialForm.reset();
      fetchClients();
    } else {
      throw new Error(res.error || "Erro ao salvar");
    }
  } catch (err) {
    alert(err.message || 'Erro de rede');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Ativar Provisioner do Trial';
  }
});

// 3. Activate dedicated Production Click
btnActivatePro.addEventListener('click', async () => {
  if (!selectedClient) return;
  if (!confirm('Tem a certeza que deseja ativar o Modo Produção Dedicado para este cliente?')) return;

  btnActivatePro.disabled = true;
  btnActivatePro.textContent = 'Sincronizando infraestrutura especializada...';

  try {
    // Patch status of the tenant first
    const res = await window.apiPut(`/api/admin/clients/${selectedClient.id}`, {
      status: 'active',
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    });
    
    if (res && res.ok) {
      alert('Modo Produção Dedicado ativado com sucesso!');
      closeDrawer();
      fetchClients();
    } else {
      throw new Error(res.error || 'Erro ao redefinir status');
    }
  } catch (err) {
    alert(err.message || 'Falha ao sincronizar produções.');
  } finally {
    btnActivatePro.disabled = false;
    btnActivatePro.innerHTML = `
      <i data-lucide="zap" class="w-6 h-6 text-white mb-0.5 animate-bounce"></i>
      <span>ATIVAR MODO PRODUÇÃO</span>
      <span class="text-[9px] font-black opacity-80 uppercase tracking-widest">Alocar Instância Dedicada do Whatsapp</span>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
});

// 4. Edit details & Client profile modal
btnEditClient.addEventListener('click', () => {
  if (!selectedClient) return;
  document.getElementById('edit-company-name').value = selectedClient.company_name || '';
  document.getElementById('edit-phone').value = selectedClient.phone_e164 || '';
  const profile = selectedClient.client_profiles && selectedClient.client_profiles[0];
  document.getElementById('edit-email').value = profile ? profile.email : (selectedClient.email || '');
  toggleModal(editClientModal, true);
});

editClientForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('edit-company-name').value;
  const phone = document.getElementById('edit-phone').value;
  const email = document.getElementById('edit-email').value;

  const saveBtn = document.getElementById('submit-edit-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Salvando...';

  try {
    const res = await window.apiPut(`/api/admin/clients/${selectedClient.id}`, {
      company_name: name,
      phone_e164: phone,
      email: email
    });

    if (res && res.ok) {
      alert('Cadastro geral atualizado com sucesso!');
      toggleModal(editClientModal, false);
      closeDrawer();
      fetchClients();
    } else {
      throw new Error(res.error || 'Erro ao editar');
    }
  } catch (err) {
    alert(err.message || 'Falha na requisição.');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Salvar Dados Cadastro';
  }
});

// 5. Bot Config prompts synchronized modal
btnOpenBotConfig.addEventListener('click', () => {
  if (!selectedClient) return;
  document.getElementById('ia-master-prompt').value = selectedClient.master_prompt || 'Tu és um consultor de vendas...';
  document.getElementById('ia-bot-instructions').value = selectedClient.bot_instructions || 'Manual de operações...';
  document.getElementById('ia-compact').value = selectedClient.bot_instructions_compact || 'Resumo do comportamento...';
  toggleModal(botConfigModal, true);
});

botConfigForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const master = document.getElementById('ia-master-prompt').value;
  const bot = document.getElementById('ia-bot-instructions').value;
  const compact = document.getElementById('ia-compact').value;

  const submitBtn = document.getElementById('submit-bot-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sincronizando prompts na Evolution API...';

  try {
    const res = await window.apiPut(`/api/admin/clients/${selectedClient.id}/bot-config`, {
      master_prompt: master,
      bot_instructions: bot,
      bot_instructions_compact: compact
    });

    if (res && res.ok) {
      alert('Sincronização de IA efetuada e prompts enviados!');
      toggleModal(botConfigModal, false);
      closeDrawer();
      fetchClients();
    } else {
      throw new Error(res.error || 'Erro de sincronia');
    }
  } catch (err) {
    alert(err.message || 'Falha ao injetar instruções no bot.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Atualizar & Sincronizar Engine IA';
  }
});

// 6. Suspender or Reativar Click
btnToggleStatus.addEventListener('click', async () => {
  if (!selectedClient) return;
  const nextStatus = selectedClient.status === 'active' ? 'suspended' : 'active';
  
  if (!confirm(`Deseja mesmo alterar o estado deste cliente para [${nextStatus.toUpperCase()}]?`)) return;

  try {
    const res = await window.apiPut(`/api/admin/clients/${selectedClient.id}`, { status: nextStatus });
    if (res && res.ok) {
      alert(`O tenant foi redefinido para status [${nextStatus.toUpperCase()}].`);
      closeDrawer();
      fetchClients();
    } else {
      throw new Error(res.error || 'Falha');
    }
  } catch (err) {
    alert(err.message || 'Falha na requisição');
  }
});

// 7. Delete tenant Click
btnDeleteTenant.addEventListener('click', async () => {
  if (!selectedClient) return;
  if (!confirm('ATENÇÃO: Esta ação é irreparável! Deseja mesmo eliminar permanentemente este cliente e os seus logs?')) return;

  try {
    const res = await window.apiDelete(`/api/admin/clients/${selectedClient.id}`);
    if (res && res.ok) {
      alert('O cliente foi permanentemente removido da plataforma!');
      closeDrawer();
      fetchClients();
    } else {
      throw new Error(res.error || 'Erro ao apagar');
    }
  } catch (err) {
    alert(err.message || 'Erro de ligação.');
  }
});

// --- SEARCH EVENT ---
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  applyFilters();
});

// --- FILTER BUTTON EVENTS ---
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.className = "px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap text-slate-400 hover:text-slate-200");
    btn.className = "px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap bg-indigo-600 text-white shadow shadow-indigo-600/10";
    activeFilter = btn.getAttribute('data-filter');
    applyFilters();
  });
});

// --- MODAL CLICK HANDLERS ---
openCreateTrialBtn.addEventListener('click', () => toggleModal(createTrialModal, true));
closeCreateTrialBtn.addEventListener('click', () => toggleModal(createTrialModal, false));
createTrialBackdrop.addEventListener('click', () => toggleModal(createTrialModal, false));

closeBotConfigBtn.addEventListener('click', () => toggleModal(botConfigModal, false));
botConfigBackdrop.addEventListener('click', () => toggleModal(botConfigModal, false));

closeEditClientBtn.addEventListener('click', () => toggleModal(editClientModal, false));
editClientBackdrop.addEventListener('click', () => toggleModal(editClientModal, false));

drawerCloseBtn.addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);

// --- INITIALIZER ON LOAD ---
document.addEventListener('DOMContentLoaded', () => {
  fetchClients();
});
