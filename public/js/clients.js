/**
 * Controller for Clients Operations (Dual HUD Edition: Super Admin & Multitenant CRM)
 */

const isAdmin = window.location.pathname.startsWith('/admin');

// Global arrays
let allClients = [];
let filteredClients = [];
let activeFilter = 'all';
let searchQuery = '';

// Date selectors for CRM
let filterDateStart = null;
let filterDateEnd = null;

// --- ELEMENT REFERENCES ---
document.addEventListener('DOMContentLoaded', () => {
  // Toggle view grids
  const adminView = document.getElementById('admin-view');
  const clientCrmView = document.getElementById('client-crm-view');

  if (isAdmin) {
    if (adminView) adminView.classList.remove('hidden');
    if (clientCrmView) clientCrmView.classList.add('hidden');
    initAdminController();
  } else {
    if (adminView) adminView.classList.add('hidden');
    if (clientCrmView) clientCrmView.classList.remove('hidden');
    initCrmController();
  }
});

// ============================================================================
// PART 1: CLIENT HUB / CRM CUSTOMER MANAGEMENT (MÓDULO 3)
// ============================================================================
function initCrmController() {
  const crmTbody = document.getElementById('crm-clients-tbody');
  const crmLoading = document.getElementById('crm-loading');
  const crmTableContainer = document.getElementById('crm-table-container');
  const crmEmpty = document.getElementById('crm-clients-empty');

  const btnOpenCreate = document.getElementById('btn-open-create-client');
  const modalCrm = document.getElementById('crm-client-modal');
  const crmBackdrop = document.getElementById('crm-client-backdrop');
  const crmCloseBtn = document.getElementById('crm-client-close');
  const crmForm = document.getElementById('crm-client-form');
  const submitBtn = document.getElementById('crm-submit-btn');

  const searchInput = document.getElementById('crm-search-input');
  const dateStartInput = document.getElementById('crm-date-start');
  const dateEndInput = document.getElementById('crm-date-end');

  async function fetchCrmClients() {
    if (crmLoading) crmLoading.classList.remove('hidden');
    if (crmTableContainer) crmTableContainer.classList.add('hidden');
    if (crmEmpty) crmEmpty.classList.add('hidden');

    try {
      const res = await window.apiGet('/api/client/clients');
      if (res && res.ok) {
        allClients = res.data || [];
        applyCrmFiltersAndRender();
      } else {
        throw new Error(res.error || "Erro ao obter clientes.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (crmLoading) crmLoading.classList.add('hidden');
    }
  }

  function applyCrmFiltersAndRender() {
    const query = searchQuery.toLowerCase();
    const startVal = dateStartInput ? dateStartInput.value : '';
    const endVal = dateEndInput ? dateEndInput.value : '';

    filteredClients = allClients.filter(c => {
      // 1. Search Query (Name or Phone)
      const matchesSearch = 
        (c.company_name && c.company_name.toLowerCase().includes(query)) ||
        (c.phone_e164 && c.phone_e164.includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query));

      // 2. Date Filter
      let matchesDate = true;
      if (c.created_at) {
        const clientDate = new Date(c.created_at).getTime();
        if (startVal) {
          const startTime = new Date(startVal + 'T00:00:00').getTime();
          if (clientDate < startTime) matchesDate = false;
        }
        if (endVal) {
          const endTime = new Date(endVal + 'T23:59:59').getTime();
          if (clientDate > endTime) matchesDate = false;
        }
      }

      return matchesSearch && matchesDate;
    });

    renderCrmClients();
  }

  function renderCrmClients() {
    crmTbody.innerHTML = '';

    if (filteredClients.length === 0) {
      crmTableContainer.classList.add('hidden');
      crmEmpty.classList.remove('hidden');
      return;
    }

    crmEmpty.classList.add('hidden');
    crmTableContainer.classList.remove('hidden');

    filteredClients.forEach(c => {
      const row = document.createElement('tr');
      row.className = 'border-b border-white/5 hover:bg-white/5 transition-all';
      
      const localeDate = c.created_at ? new Date(c.created_at).toLocaleDateString('pt') : '--';

      row.innerHTML = `
        <td class="p-4 font-bold text-white flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black uppercase text-[10px]">
             ${(c.company_name || 'C').charAt(0)}
          </div>
          <span>${c.company_name || 'Sem Nome'}</span>
        </td>
        <td class="p-4 text-slate-300 font-mono">${c.phone_e164 || '--'}</td>
        <td class="p-4 text-slate-400 font-semibold max-w-[150px] truncate">${c.email || '--'}</td>
        <td class="p-4 text-slate-450 truncate max-w-[150px]">${c.address || '--'}</td>
        <td class="p-4 text-slate-400 font-mono">${c.nif || '--'}</td>
        <td class="p-4 text-slate-500 font-medium">${localeDate}</td>
        <td class="p-4 text-center">
          <div class="flex items-center justify-center gap-2">
            <button class="btn-edit p-1.5 hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 rounded-lg transition-all" title="Editar">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button class="btn-delete p-1.5 hover:bg-rose-500/10 text-rose-500 hover:text-rose-400 rounded-lg transition-all" title="Remover">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      `;

      // Bind edit action
      row.querySelector('.btn-edit').onclick = () => {
        openCrmModal(c);
      };

      // Bind delete action
      row.querySelector('.btn-delete').onclick = async () => {
        if (!confirm(`Excluir permanentemente o contacto comercial [${c.company_name}]?`)) return;
        try {
          const res = await window.apiDelete(`/api/client/clients/${c.id}`);
          if (res && res.ok) {
            allClients = allClients.filter(item => item.id !== c.id);
            applyCrmFiltersAndRender();
          } else {
            throw new Error(res.error || "Operação falhou.");
          }
        } catch (err) {
          alert(err.message);
        }
      };

      crmTbody.appendChild(row);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function openCrmModal(clientObj = null) {
    if (clientObj) {
      document.getElementById('crm-modal-title').textContent = "Editar Cliente CRM";
      document.getElementById('crm-client-id').value = clientObj.id;
      document.getElementById('crm-company-name').value = clientObj.company_name || '';
      document.getElementById('crm-phone').value = clientObj.phone_e164 || '';
      document.getElementById('crm-email').value = clientObj.email || '';
      document.getElementById('crm-address').value = clientObj.address || '';
      document.getElementById('crm-city').value = clientObj.city || '';
      document.getElementById('crm-zip').value = clientObj.zip_code || '';
      document.getElementById('crm-nif').value = clientObj.nif || '';
      document.getElementById('crm-notes').value = clientObj.notes || '';
    } else {
      document.getElementById('crm-modal-title').textContent = "Adicionar Novo Cliente";
      crmForm.reset();
      document.getElementById('crm-client-id').value = '';
    }
    modalCrm.classList.remove('hidden');
  }

  function closeCrmModal() {
    modalCrm.classList.add('hidden');
  }

  // Form submit handles both add and edit
  crmForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('crm-client-id').value;
    const name = document.getElementById('crm-company-name').value;
    const phone = document.getElementById('crm-phone').value;
    const email = document.getElementById('crm-email').value;
    const address = document.getElementById('crm-address').value;
    const city = document.getElementById('crm-city').value;
    const zip = document.getElementById('crm-zip').value;
    const nif = document.getElementById('crm-nif').value;
    const notes = document.getElementById('crm-notes').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando registo...';

    const payload = {
      company_name: name,
      phone_e164: phone,
      email,
      address,
      city,
      zip_code: zip,
      nif,
      notes
    };

    try {
      if (id) {
        // Edit mode
        const res = await window.apiPatch(`/api/client/clients/${id}`, payload);
        if (res && res.ok) {
          closeCrmModal();
          fetchCrmClients();
        } else {
          throw new Error(res.error || "Falha ao actualizar.");
        }
      } else {
        // Create mode
        const res = await window.apiPost(`/api/client/clients`, payload);
        if (res && res.ok) {
          closeCrmModal();
          fetchCrmClients();
        } else {
          throw new Error(res.error || "Falha ao criar.");
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar Dados do Contacto';
    }
  };

  // Bind actions
  if (btnOpenCreate) btnOpenCreate.onclick = () => openCrmModal();
  if (crmCloseBtn) crmCloseBtn.onclick = closeCrmModal;
  if (crmBackdrop) crmBackdrop.onclick = closeCrmModal;

  // Bind filters
  if (searchInput) {
    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      applyCrmFiltersAndRender();
    };
  }
  if (dateStartInput) dateStartInput.onchange = () => applyCrmFiltersAndRender();
  if (dateEndInput) dateEndInput.onchange = () => applyCrmFiltersAndRender();

  // Load initially
  fetchCrmClients();
}

// ============================================================================
// PART 2: SUPER ADMIN TENANT REGISTRATION (ORIGINAL BACKWARD COMPATIBLE FLOW)
// ============================================================================
function initAdminController() {
  const clientsGrid = document.getElementById('admin-clients-grid');
  const clientsLoading = document.getElementById('admin-loading');
  const clientsEmpty = document.getElementById('admin-clients-empty');
  const searchInput = document.getElementById('admin-search-input');
  const filterButtons = document.querySelectorAll('[data-filter]');

  const drawer = document.getElementById('client-drawer');
  const drawerPanel = document.getElementById('drawer-panel');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const drawerBackdrop = document.getElementById('drawer-backdrop');

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

  const planSelectorBtns = document.querySelectorAll('[data-plan]');

  let selectedClient = null;
  let selectedTrialPlan = 'starter';

  async function fetchClients() {
    if (clientsLoading) clientsLoading.classList.remove('hidden');
    if (clientsGrid) clientsGrid.classList.add('hidden');
    if (clientsEmpty) clientsEmpty.classList.add('hidden');

    try {
      const res = await window.apiGet('/api/admin/clients');
      if (res && res.ok) {
        allClients = res.data || [];
        applyFilters();
      } else {
        throw new Error(res.error || "Erro ao listar");
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (clientsLoading) clientsLoading.classList.add('hidden');
    }
  }

  function applyFilters() {
    filteredClients = allClients.filter(client => {
      // Since they are tenants, client_id is NULL or not referencing another parent
      if (client.client_id !== null && client.client_id !== undefined) return false;

      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        (client.company_name?.toLowerCase().includes(query)) ||
        (client.phone_e164?.includes(query));

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
      card.setAttribute('class', 'group bg-slate-905 bg-slate-900 border border-white/5 hover:border-indigo-500/30 rounded-3xl p-5 relative overflow-hidden transition-all duration-300 cursor-pointer active:scale-[0.98]');
      
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

      card.onclick = () => openDrawer(client);
      clientsGrid.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function openDrawer(client) {
    selectedClient = client;

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
    const emailStr = client.email || '--';
    drawerEmail.textContent = emailStr;

    const isTrial = client.status === 'trial' || client.status === 'pending';
    if (isTrial && btnActivatePro) {
      btnActivatePro.classList.remove('hidden');
    } else {
      btnActivatePro?.classList.add('hidden');
    }

    if (btnToggleStatus) {
      if (client.status === 'active') {
        btnToggleStatus.className = "flex items-center justify-center gap-2 p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 rounded-xl font-bold text-xs transition-colors w-full";
        btnToggleStatus.querySelector('span').textContent = 'Suspender';
      } else {
        btnToggleStatus.className = "flex items-center justify-center gap-2 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 rounded-xl font-bold text-xs transition-colors w-full";
        btnToggleStatus.querySelector('span').textContent = 'Reativar';
      }
    }

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

  function toggleModal(modal, open) {
    if (open) {
      modal.classList.remove('hidden');
      modal.querySelector('.animate-fade-in')?.classList.add('scale-100');
    } else {
      modal.classList.add('hidden');
    }
  }

  planSelectorBtns.forEach(btn => {
    btn.onclick = () => {
      planSelectorBtns.forEach(b => b.className = "py-2 rounded-lg text-[9px] font-black uppercase border border-white/10 text-slate-400 hover:border-white/20");
      btn.className = "py-2 rounded-lg text-[9px] font-black uppercase border border-indigo-500 bg-indigo-500/10 text-indigo-400";
      selectedTrialPlan = btn.getAttribute('data-plan');
    };
  });

  if (createTrialForm) {
    createTrialForm.onsubmit = async (e) => {
      e.preventDefault();
      const company = document.getElementById('trial-company').value;
      const phone = document.getElementById('trial-phone').value;
      const contact = document.getElementById('trial-contact').value;
      const email = document.getElementById('trial-email').value;
      const instructions = document.getElementById('trial-instructions').value;

      const submitBtn = document.getElementById('submit-trial-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Provisionando...';

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
          alert("Trial provisionado com sucesso!");
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
    };
  }

  if (btnActivatePro) {
    btnActivatePro.onclick = async () => {
      if (!selectedClient) return;
      if (!confirm('Ativar o Modo Produção Dedicado para este cliente?')) return;

      btnActivatePro.disabled = true;
      btnActivatePro.textContent = 'Sincronizando infraestrutura...';

      try {
        const res = await window.apiPut(`/api/admin/clients/${selectedClient.id}`, {
          status: 'active',
          subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
        
        if (res && res.ok) {
          alert('Modo Produção Dedicado ativado!');
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
    };
  }

  if (btnEditClient) {
    btnEditClient.onclick = () => {
      if (!selectedClient) return;
      document.getElementById('edit-company-name').value = selectedClient.company_name || '';
      document.getElementById('edit-phone').value = selectedClient.phone_e164 || '';
      document.getElementById('edit-email').value = selectedClient.email || '';
      toggleModal(editClientModal, true);
    };
  }

  if (editClientForm) {
    editClientForm.onsubmit = async (e) => {
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
          alert('Tenant geral actualizado.');
          toggleModal(editClientModal, false);
          closeDrawer();
          fetchClients();
        } else {
          throw new Error(res.error || 'Erro ao editar');
        }
      } catch (err) {
        alert(err.message);
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Salvar Dados Cadastro';
      }
    };
  }

  if (btnOpenBotConfig) {
    btnOpenBotConfig.onclick = () => {
      if (!selectedClient) return;
      document.getElementById('ia-master-prompt').value = selectedClient.master_prompt || 'Tu és um consultor de vendas...';
      document.getElementById('ia-bot-instructions').value = selectedClient.bot_instructions || 'Manual de operações...';
      document.getElementById('ia-compact').value = selectedClient.bot_instructions_compact || 'Resumo de comportamento...';
      toggleModal(botConfigModal, true);
    };
  }

  if (botConfigForm) {
    botConfigForm.onsubmit = async (e) => {
      e.preventDefault();
      const master = document.getElementById('ia-master-prompt').value;
      const bot = document.getElementById('ia-bot-instructions').value;
      const compact = document.getElementById('ia-compact').value;

      const submitBtn = document.getElementById('submit-bot-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sincronizando...';

      try {
        const res = await window.apiPut(`/api/admin/clients/${selectedClient.id}/bot-config`, {
          master_prompt: master,
          bot_instructions: bot,
          bot_instructions_compact: compact
        });

        if (res && res.ok) {
          alert('Prompts sincronizados com sucesso.');
          toggleModal(botConfigModal, false);
          closeDrawer();
          fetchClients();
        } else {
          throw new Error(res.error || 'Erro de sincronia');
        }
      } catch (err) {
        alert(err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Atualizar & Sincronizar Engine IA';
      }
    };
  }

  if (btnToggleStatus) {
    btnToggleStatus.onclick = async () => {
      if (!selectedClient) return;
      const next = selectedClient.status === 'active' ? 'suspended' : 'active';
      if (!confirm(`Redefinir Tenant para [${next.toUpperCase()}]?`)) return;

      try {
        const res = await window.apiPut(`/api/admin/clients/${selectedClient.id}`, { status: next });
        if (res && res.ok) {
          alert(`Redefinido.`);
          closeDrawer();
          fetchClients();
        } else {
          throw new Error(res.error || 'Erro.');
        }
      } catch (err) {
        alert(err.message);
      }
    };
  }

  if (btnDeleteTenant) {
    btnDeleteTenant.onclick = async () => {
      if (!selectedClient) return;
      if (!confirm('Eliminar permanentemente este tenant e logs?')) return;

      try {
        const res = await window.apiDelete(`/api/admin/clients/${selectedClient.id}`);
        if (res && res.ok) {
          alert('Removido da plataforma.');
          closeDrawer();
          fetchClients();
        } else {
          throw new Error(res.error || 'Erro.');
        }
      } catch (err) {
        alert(err.message);
      }
    };
  }

  if (searchInput) {
    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      applyFilters();
    };
  }

  filterButtons.forEach(btn => {
    btn.onclick = () => {
      filterButtons.forEach(b => b.className = "px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap text-slate-400 hover:text-slate-200");
      btn.className = "px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap bg-indigo-600 text-white shadow shadow-indigo-600/10";
      activeFilter = btn.getAttribute('data-filter');
      applyFilters();
    };
  });

  if (openCreateTrialBtn) openCreateTrialBtn.onclick = () => toggleModal(createTrialModal, true);
  if (closeCreateTrialBtn) closeCreateTrialBtn.onclick = () => toggleModal(createTrialModal, false);
  if (createTrialBackdrop) createTrialBackdrop.onclick = () => toggleModal(createTrialModal, false);

  if (closeBotConfigBtn) closeBotConfigBtn.onclick = () => toggleModal(botConfigModal, false);
  if (botConfigBackdrop) botConfigBackdrop.onclick = () => toggleModal(botConfigModal, false);

  if (closeEditClientBtn) closeEditClientBtn.onclick = () => toggleModal(editClientModal, false);
  if (editClientBackdrop) editClientBackdrop.onclick = () => toggleModal(editClientModal, false);

  if (drawerCloseBtn) drawerCloseBtn.onclick = closeDrawer;
  if (drawerBackdrop) drawerBackdrop.onclick = closeDrawer;

  fetchClients();
}
