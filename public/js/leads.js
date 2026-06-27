/**
 * Controller for CRM Sales Leads Management (Módulo 8)
 */

let allLeads = [];
let filteredLeads = [];
let activeFilter = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  initLeadsController();
});

function initLeadsController() {
  const tableContainer = document.getElementById('leads-table-container');
  const tbody = document.getElementById('leads-tbody');
  const loadingEl = document.getElementById('leads-loading');
  const emptyEl = document.getElementById('leads-empty');

  const searchInput = document.getElementById('leads-search-input');
  const filterStatus = document.getElementById('leads-filter-status');

  const btnOpenCreate = document.getElementById('btn-open-create-lead');
  const modal = document.getElementById('lead-modal');
  const modalClose = document.getElementById('lead-modal-close');
  const modalCancel = document.getElementById('lead-modal-cancel');
  const modalBackdrop = document.getElementById('lead-modal-backdrop');
  const form = document.getElementById('lead-form');
  const submitBtn = document.getElementById('lead-submit-btn');
  const deleteBtn = document.getElementById('btn-delete-lead');

  // Fields
  const leadId = document.getElementById('lead-id');
  const leadName = document.getElementById('lead-name');
  const leadCompany = document.getElementById('lead-company');
  const leadPhone = document.getElementById('lead-phone');
  const leadEmail = document.getElementById('lead-email');
  const leadStatus = document.getElementById('lead-status');
  const leadSource = document.getElementById('lead-source');

  async function fetchLeads() {
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (tableContainer) tableContainer.classList.add('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');

    try {
      const res = await window.apiGet('/api/client/leads');
      if (res && res.ok) {
        allLeads = res.data || [];
        applyFiltersAndRender();
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  }

  function applyFiltersAndRender() {
    const query = searchQuery.toLowerCase();
    const selectedStatus = activeFilter;

    filteredLeads = allLeads.filter(l => {
      // 1. Search filter
      const matchesSearch = 
        (l.name && l.name.toLowerCase().includes(query)) ||
        (l.company && l.company.toLowerCase().includes(query)) ||
        (l.phone && l.phone.includes(query)) ||
        (l.email && l.email.toLowerCase().includes(query));

      // 2. Status filter
      const matchesStatus = (selectedStatus === 'all' || l.status === selectedStatus);

      return matchesSearch && matchesStatus;
    });

    renderLeadsTable();
  }

  function renderLeadsTable() {
    tbody.innerHTML = '';

    if (filteredLeads.length === 0) {
      if (tableContainer) tableContainer.classList.add('hidden');
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');
    if (tableContainer) tableContainer.classList.remove('hidden');

    filteredLeads.forEach(l => {
      const row = document.createElement('tr');
      row.className = 'border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer';

      let statusBadge = '';
      if (l.status === 'frio') {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-[9px] font-black bg-slate-500/10 text-slate-400 border border-slate-500/15 uppercase tracking-wider">❄️ Frio</span>`;
      } else if (l.status === 'morno') {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/15 uppercase tracking-wider">🔥 Morno</span>`;
      } else if (l.status === 'quente') {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-[9px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/15 uppercase tracking-wider">💥 Quente</span>`;
      } else {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-[9px] font-black bg-slate-500/10 text-slate-400 border border-slate-500/15 uppercase tracking-wider">${l.status || 'N/A'}</span>`;
      }

      row.innerHTML = `
        <td class="p-4 font-bold text-white flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black uppercase text-[10px]">
             ${(l.name || 'L').charAt(0)}
          </div>
          <span>${l.name || 'Sem Nome'}</span>
        </td>
        <td class="p-4 text-slate-300 font-bold">${l.company || 'N/A'}</td>
        <td class="p-4 text-slate-400 font-mono">${l.phone || '--'}</td>
        <td class="p-4 text-slate-400 truncate max-w-[150px]">${l.email || '--'}</td>
        <td class="p-4">${statusBadge}</td>
        <td class="p-4 text-slate-500 font-medium uppercase text-[10px] tracking-wider">${l.source || 'CRM'}</td>
        <td class="p-4 text-center" onclick="event.stopPropagation()">
          <div class="flex items-center justify-center gap-2">
            <button class="btn-edit p-1.5 hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 rounded-lg transition-all" title="Editar">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button class="btn-delete p-1.5 hover:bg-rose-500/10 text-rose-500 hover:text-rose-400 rounded-lg transition-all" title="Eliminar">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      `;

      // Row click or Edit button opens editor
      const openEditor = () => openLeadModal(l);
      row.onclick = openEditor;
      row.querySelector('.btn-edit').onclick = (e) => {
        e.stopPropagation();
        openEditor();
      };

      // Inline delete action
      row.querySelector('.btn-delete').onclick = async (e) => {
        e.stopPropagation();
        if (!confirm(`Tem a certeza que deseja eliminar a lead "${l.name}"?`)) return;
        try {
          const res = await window.apiDelete(`/api/client/leads/${l.id}`);
          if (res && res.ok) {
            allLeads = allLeads.filter(item => item.id !== l.id);
            applyFiltersAndRender();
          }
        } catch (err) {
          alert('Erro ao eliminar lead: ' + err.message);
        }
      };

      tbody.appendChild(row);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function openLeadModal(lead = null) {
    if (lead) {
      document.getElementById('lead-modal-title').textContent = 'Editar Lead';
      leadId.value = lead.id;
      leadName.value = lead.name || '';
      leadCompany.value = lead.company || '';
      leadPhone.value = lead.phone || '';
      leadEmail.value = lead.email || '';
      leadStatus.value = lead.status || 'frio';
      leadSource.value = lead.source || '';
      if (deleteBtn) deleteBtn.classList.remove('hidden');
    } else {
      document.getElementById('lead-modal-title').textContent = 'Criar Nova Lead';
      form.reset();
      leadId.value = '';
      if (deleteBtn) deleteBtn.classList.add('hidden');
    }
    if (modal) modal.classList.remove('hidden');
  }

  function closeLeadModal() {
    if (modal) modal.classList.add('hidden');
  }

  // Event handlers
  if (btnOpenCreate) btnOpenCreate.addEventListener('click', () => openLeadModal());
  if (modalClose) modalClose.addEventListener('click', closeLeadModal);
  if (modalCancel) modalCancel.addEventListener('click', closeLeadModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeLeadModal);

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      applyFiltersAndRender();
    });
  }

  if (filterStatus) {
    filterStatus.addEventListener('change', (e) => {
      activeFilter = e.target.value;
      applyFiltersAndRender();
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        name: leadName.value.trim(),
        company: leadCompany.value.trim(),
        phone: leadPhone.value.trim(),
        email: leadEmail.value.trim(),
        status: leadStatus.value,
        source: leadSource.value.trim() || 'CRM'
      };

      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = 'A guardar...';

      try {
        let res;
        if (leadId.value) {
          res = await window.apiPatch(`/api/client/leads/${leadId.value}`, payload);
        } else {
          res = await window.apiPost('/api/client/leads', payload);
        }

        if (res && res.ok) {
          closeLeadModal();
          fetchLeads();
        } else {
          alert('Erro ao guardar: ' + (res.error || 'Tente novamente.'));
        }
      } catch (err) {
        alert('Erro ao guardar lead: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const id = leadId.value;
      if (!id) return;
      if (!confirm('Deseja mesmo excluir permanentemente esta lead comercial?')) return;

      try {
        const res = await window.apiDelete(`/api/client/leads/${id}`);
        if (res && res.ok) {
          closeLeadModal();
          fetchLeads();
        }
      } catch (err) {
        alert('Erro ao excluir lead: ' + err.message);
      }
    });
  }

  // Initial load
  fetchLeads();
}
