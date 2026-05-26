/**
 * Controller for Conditional Automation rules (Módulo 9)
 */

let allAutomations = [];

document.addEventListener('DOMContentLoaded', () => {
  initAutomationsController();
});

function initAutomationsController() {
  const loadingEl = document.getElementById('auto-loading');
  const gridEl = document.getElementById('auto-grid');
  const emptyEl = document.getElementById('auto-empty');

  // Modal actions
  const btnOpenModal = document.getElementById('btn-open-automation-modal');
  const modal = document.getElementById('auto-modal');
  const modalClose = document.getElementById('auto-modal-close');
  const modalBackdrop = document.getElementById('auto-modal-backdrop');
  const form = document.getElementById('auto-form');
  const submitBtn = document.getElementById('auto-submit-btn');

  // Inputs
  const autoIdInput = document.getElementById('auto-id');
  const autoNameInput = document.getElementById('auto-name');
  const autoTriggerInput = document.getElementById('auto-trigger');
  const autoDelayNumInput = document.getElementById('auto-delay-num');
  const autoDelayUnitInput = document.getElementById('auto-delay-unit');
  const autoActionInput = document.getElementById('auto-action');
  const autoStatusInput = document.getElementById('auto-status');

  async function fetchAutomations() {
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (gridEl) gridEl.classList.add('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');

    try {
      const res = await window.apiGet('/api/client/automations');
      if (res && res.ok) {
        allAutomations = res.data || [];
        renderAutomations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  }

  function renderAutomations() {
    if (gridEl) gridEl.innerHTML = '';

    if (allAutomations.length === 0) {
      if (gridEl) gridEl.classList.add('hidden');
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');
    if (gridEl) gridEl.classList.remove('hidden');

    allAutomations.forEach(rule => {
      const card = document.createElement('div');
      card.className = "bg-slate-900 border border-white/5 hover:border-indigo-500/25 rounded-3xl p-6 relative overflow-hidden transition-all group flex flex-col justify-between min-h-[220px]";

      const statusPill = rule.status === 'active'
        ? `<span class="px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Activa</span>`
        : `<span class="px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">Pausada</span>`;

      // Split Delay values
      let delayText = 'Execução Imediata';
      if (rule.delay_string && rule.delay_string !== '0' && rule.delay_string !== '0 minutos') {
        delayText = `Atraso de ${rule.delay_string}`;
      }

      card.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Regra Condicional</span>
            ${statusPill}
          </div>
          <div>
            <h3 class="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">${rule.name || 'Sem nome'}</h3>
            <div class="flex items-center gap-2 mt-2">
              <span class="text-[10px] bg-slate-950 px-2 py-1 rounded text-slate-400 font-bold border border-white/5">${rule.trigger_event}</span>
              <span class="text-indigo-400 font-bold text-xs">➔</span>
              <span class="text-[10px] bg-indigo-500/10 px-2 py-1 rounded text-indigo-300 font-bold border border-indigo-500/10">${rule.action_type}</span>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-slate-500 text-[9px] font-black uppercase">
            <i data-lucide="clock" class="w-3.5 h-3.5"></i>
            <span>${delayText}</span>
          </div>
          <div class="flex items-center gap-1.5z">
            <button class="btn-toggle-auto p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg bg-white/5 border border-white/5 transition-all mr-1.5" title="Mudar Estado">
              <i data-lucide="power" class="w-3.5 h-3.5"></i>
            </button>
            <button class="btn-edit-auto p-1.5 text-indigo-400 hover:text-indigo-350 rounded-lg hover:bg-white/5 transition-all mr-1.5" title="Editar">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>
            <button class="btn-delete-auto p-1.5 text-rose-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-all" title="Eliminar">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;

      // Trigger status switch toggling
      card.querySelector('.btn-toggle-auto').onclick = async (e) => {
        e.stopPropagation();
        const nextStatus = rule.status === 'active' ? 'inactive' : 'active';
        try {
          const res = await window.apiPatch(`/api/client/automations/${rule.id}`, { status: nextStatus });
          if (res && res.ok) {
            fetchAutomations();
          }
        } catch (err) {
          console.error(err);
        }
      };

      // Edit action
      card.querySelector('.btn-edit-auto').onclick = (e) => {
        e.stopPropagation();
        openAutoModal(rule);
      };

      // Delete action
      card.querySelector('.btn-delete-auto').onclick = async (e) => {
        e.stopPropagation();
        if (!confirm('Dar baixa definitiva nesta regra condicional?')) return;
        try {
          const res = await window.apiDelete(`/api/client/automations/${rule.id}`);
          if (res && res.ok) {
            fetchAutomations();
          }
        } catch (err) {
          alert('Erro de rede.');
        }
      };

      gridEl.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function openAutoModal(ruleObj = null) {
    if (ruleObj) {
      document.getElementById('auto-modal-title').textContent = "Editar Regra Condicional";
      autoIdInput.value = ruleObj.id;
      autoNameInput.value = ruleObj.name || '';
      autoTriggerInput.value = ruleObj.trigger_event || 'Cliente Criado';
      autoActionInput.value = ruleObj.action_type || 'Enviar Mensagem Whatsapp';
      autoStatusInput.value = ruleObj.status || 'active';

      // Parse Delay String (e.g., "10 minutos", "3 horas")
      const ds = ruleObj.delay_string || '0 minutos';
      const parts = ds.split(' ');
      autoDelayNumInput.value = parts[0] || 0;
      autoDelayUnitInput.value = parts[1] || 'minutos';
    } else {
      document.getElementById('auto-modal-title').textContent = "Criar Regra Condicional";
      form.reset();
      autoIdInput.value = '';
      autoDelayNumInput.value = 0;
      autoDelayUnitInput.value = 'minutos';
      autoStatusInput.value = 'active';
    }
    modal.classList.remove('hidden');
  }

  function closeAutoModal() {
    modal.classList.add('hidden');
  }

  form.onsubmit = async (e) => {
    e.preventDefault();

    const id = autoIdInput.value;
    const name = autoNameInput.value;
    const trigger_event = autoTriggerInput.value;
    const action_type = autoActionInput.value;
    const status = autoStatusInput.value;

    const delayNum = autoDelayNumInput.value;
    const delayUnit = autoDelayUnitInput.value;
    const delay_string = `${delayNum} ${delayUnit}`;

    submitBtn.disabled = true;
    submitBtn.textContent = 'A registar regra operacional...';

    const payload = {
      name,
      trigger_event,
      action_type,
      delay_string,
      status
    };

    try {
      if (id) {
        // Edit mode
        const res = await window.apiPatch(`/api/client/automations/${id}`, payload);
        if (res && res.ok) {
          closeAutoModal();
          fetchAutomations();
        } else {
          throw new Error(res.error || "Erro ao salvar alterações.");
        }
      } else {
        // Create mode
        const res = await window.apiPost('/api/client/automations', payload);
        if (res && res.ok) {
          closeAutoModal();
          fetchAutomations();
        } else {
          throw new Error(res.error || "Erro ao registar automação.");
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Compilar e Registar Automação';
    }
  };

  if (btnOpenModal) btnOpenModal.onclick = () => openAutoModal();
  if (modalClose) modalClose.onclick = closeAutoModal;
  if (modalBackdrop) modalBackdrop.onclick = closeAutoModal;

  fetchAutomations();
}
