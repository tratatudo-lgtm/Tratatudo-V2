/**
 * Controller for Team & Granular Permissions Workspace (Módulo 4)
 */

let allCollaborators = [];
let currentStep = 1;

document.addEventListener('DOMContentLoaded', () => {
  initTeamController();
});

function initTeamController() {
  const teamLoading = document.getElementById('team-loading');
  const teamTableContainer = document.getElementById('team-table-container');
  const teamEmpty = document.getElementById('team-empty');
  const teamTbody = document.getElementById('team-tbody');

  // Stats Counters
  const statTotal = document.getElementById('stat-total-members');
  const statAdmins = document.getElementById('stat-admins');
  const statAgents = document.getElementById('stat-agents');

  // Modal controls
  const btnOpenModal = document.getElementById('btn-open-team-modal');
  const modal = document.getElementById('team-modal');
  const modalBackdrop = document.getElementById('team-modal-backdrop');
  const modalClose = document.getElementById('team-modal-close');
  const teamForm = document.getElementById('team-form');

  // Step controls
  const stepIndicator = document.getElementById('step-indicator');
  const step1Container = document.getElementById('step-1-container');
  const step2Container = document.getElementById('step-2-container');
  const btnVoltar = document.getElementById('btn-voltar');
  const btnSeguinte = document.getElementById('btn-seguinte');
  const btnGravar = document.getElementById('btn-gravar');

  const collabIdInput = document.getElementById('collab-id');
  const collabNameInput = document.getElementById('collab-name');
  const collabEmailInput = document.getElementById('collab-email');
  const collabPhoneInput = document.getElementById('collab-phone');
  const collabRoleInput = document.getElementById('collab-role');
  const collabStatusInput = document.getElementById('collab-status');

  async function fetchTeam() {
    if (teamLoading) teamLoading.classList.remove('hidden');
    if (teamTableContainer) teamTableContainer.classList.add('hidden');
    if (teamEmpty) teamEmpty.classList.add('hidden');

    try {
      const res = await window.apiGet('/api/client/team');
      if (res && res.ok) {
        allCollaborators = res.data || [];
        calculateStatsAndRender();
      } else {
        throw new Error(res.error || "Impossível recuperar equipa do Supabase.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (teamLoading) teamLoading.classList.add('hidden');
    }
  }

  function calculateStatsAndRender() {
    // 1. Calculate stats
    if (statTotal) statTotal.textContent = allCollaborators.length;
    
    const adminsCount = allCollaborators.filter(c => c.role === 'Admin').length;
    if (statAdmins) statAdmins.textContent = adminsCount;

    const agentsCount = allCollaborators.filter(c => c.role === 'Agente').length;
    if (statAgents) statAgents.textContent = agentsCount;

    // 2. Render rows
    teamTbody.innerHTML = '';
    if (allCollaborators.length === 0) {
      teamEmpty.classList.remove('hidden');
      teamTableContainer.classList.add('hidden');
      return;
    }

    teamEmpty.classList.add('hidden');
    teamTableContainer.classList.remove('hidden');

    allCollaborators.forEach(collab => {
      const row = document.createElement('tr');
      row.className = 'border-b border-white/5 hover:bg-white/5 transition-all';
      
      const statusPill = collab.status === 'active' 
        ? `<span class="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Ativo</span>`
        : `<span class="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">Bloqueado</span>`;

      row.innerHTML = `
        <td class="p-4 flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
            ${collab.name ? collab.name.charAt(0) : 'U'}
          </div>
          <div>
            <div class="font-bold text-white text-xs">${collab.name || 'Sem Nome'}</div>
            <div class="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">${collab.phone || '--'}</div>
          </div>
        </td>
        <td class="p-4 text-slate-350 font-semibold">${collab.email || '--'}</td>
        <td class="p-4 text-indigo-400 font-bold text-xs uppercase">${collab.role || 'Agente'}</td>
        <td class="p-4">${statusPill}</td>
        <td class="p-4 text-center">
          <div class="flex items-center justify-center gap-2">
            <button class="btn-edit p-1.5 hover:bg-white/5 text-slate-300 rounded-lg transition-colors">
              <i data-lucide="edit-3" class="w-4 h-4 text-indigo-400"></i>
            </button>
            <button class="btn-delete p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      `;

      // Bind actions
      row.querySelector('.btn-edit').onclick = () => openTeamModal(collab);
      row.querySelector('.btn-delete').onclick = async () => {
        if (!confirm(`Tem a certeza que deseja remover [${collab.name}] da equipa?`)) return;
        try {
          const res = await window.apiDelete(`/api/client/team/${collab.id}`);
          if (res && res.ok) {
            fetchTeam();
          } else {
            throw new Error(res.error || "Operação falhou.");
          }
        } catch (e) {
          alert(e.message);
        }
      };

      teamTbody.appendChild(row);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Dual-Step wizard navigation
  function setStep(step) {
    currentStep = step;
    if (step === 1) {
      stepIndicator.textContent = "Passo 1/2";
      step1Container.classList.remove('hidden');
      step2Container.classList.add('hidden');
      btnVoltar.classList.add('hidden');
      btnSeguinte.classList.remove('hidden');
      btnGravar.classList.add('hidden');
    } else {
      // Validate step 1 fields first
      if (!collabNameInput.value || !collabEmailInput.value) {
        alert("Por favor preencha os campos obrigatórios (Nome e E-mail) antes de prosseguir.");
        setStep(1);
        return;
      }
      stepIndicator.textContent = "Passo 2/2";
      step1Container.classList.add('hidden');
      step2Container.classList.remove('hidden');
      btnVoltar.classList.remove('hidden');
      btnSeguinte.classList.add('hidden');
      btnGravar.classList.remove('hidden');
    }
  }

  function openTeamModal(collab = null) {
    setStep(1);
    if (collab) {
      document.getElementById('team-modal-title').textContent = "Editar Membro da Equipa";
      collabIdInput.value = collab.id;
      collabNameInput.value = collab.name || '';
      collabEmailInput.value = collab.email || '';
      collabPhoneInput.value = collab.phone || '';
      collabRoleInput.value = collab.role || 'Agente';
      collabStatusInput.value = collab.status || 'active';

      // Load permissions
      const perms = collab.permissions || {};
      document.querySelectorAll('[data-permission]').forEach(cb => {
        const key = cb.getAttribute('data-permission');
        cb.checked = !!perms[key];
      });
    } else {
      document.getElementById('team-modal-title').textContent = "Novo Colaborador";
      teamForm.reset();
      collabIdInput.value = '';
      
      // Default basic selections
      document.querySelectorAll('[data-permission]').forEach(cb => {
        cb.checked = true; // Default all on
      });
    }
    modal.classList.remove('hidden');
  }

  function closeTeamModal() {
    modal.classList.add('hidden');
  }

  async function submitTeamForm() {
    const id = collabIdInput.value;
    const name = collabNameInput.value;
    const email = collabEmailInput.value;
    const phone = collabPhoneInput.value;
    const role = collabRoleInput.value;
    const status = collabStatusInput.value;

    // Build permissions object from checkboxes
    const permissions = {};
    document.querySelectorAll('[data-permission]').forEach(cb => {
      const key = cb.getAttribute('data-permission');
      permissions[key] = cb.checked;
    });

    const payload = {
      name,
      email,
      phone,
      role,
      status,
      permissions
    };

    btnGravar.disabled = true;
    btnGravar.textContent = "A gravar colaborador...";

    try {
      if (id) {
        // Edit mode
        const res = await window.apiPatch(`/api/client/team/${id}`, payload);
        if (res && res.ok) {
          closeTeamModal();
          fetchTeam();
        } else {
          throw new Error(res.error || "Não foi possível resguardar o registo.");
        }
      } else {
        // Create mode
        const res = await window.apiPost(`/api/client/team`, payload);
        if (res && res.ok) {
          closeTeamModal();
          fetchTeam();
        } else {
          throw new Error(res.error || "Não foi possível criar o colaborador.");
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      btnGravar.disabled = false;
      btnGravar.textContent = "Concluir e Guardar";
    }
  }

  // Wire steps
  btnSeguinte.onclick = () => setStep(2);
  btnVoltar.onclick = () => setStep(1);
  btnGravar.onclick = () => submitTeamForm();

  // Wire buttons inside visual permissions cards (Todos / Limpar)
  document.querySelectorAll('#permissions-grid > div').forEach(card => {
    const checkAllBtn = card.querySelector('.btn-check-all');
    const clearAllBtn = card.querySelector('.btn-clear-all');
    const checkboxes = card.querySelectorAll('input[type="checkbox"]');

    if (checkAllBtn && checkboxes.length > 0) {
      checkAllBtn.onclick = () => {
        checkboxes.forEach(cb => cb.checked = true);
      };
    }
    if (clearAllBtn && checkboxes.length > 0) {
      clearAllBtn.onclick = () => {
        checkboxes.forEach(cb => cb.checked = false);
      };
    }
  });

  // Wire modal basic actions
  if (btnOpenModal) btnOpenModal.onclick = () => openTeamModal();
  if (modalClose) modalClose.onclick = closeTeamModal;
  if (modalBackdrop) modalBackdrop.onclick = closeTeamModal;

  // Let form submission bypass defaults but use step-2 validation trigger
  teamForm.onsubmit = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      setStep(2);
    } else {
      submitTeamForm();
    }
  };

  // Run initial trigger
  fetchTeam();
}
