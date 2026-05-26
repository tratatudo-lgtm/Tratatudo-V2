/**
 * Controller for Compliance and Audit Activity Logger (Módulo 12)
 */

let currentPage = 1;
let totalPages = 1;

let selectedUser = 'all';
let selectedModule = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initActivityLogController();
});

function initActivityLogController() {
  const loadingEl = document.getElementById('activity-loading');
  const tableContainer = document.getElementById('activity-table-container');
  const emptyEl = document.getElementById('activity-empty');
  const tbody = document.getElementById('activity-tbody');

  const userFilter = document.getElementById('filter-user');
  const moduleFilter = document.getElementById('filter-module');

  const pageLabel = document.getElementById('page-label');
  const btnPrev = document.getElementById('btn-page-prev');
  const btnNext = document.getElementById('btn-page-next');

  async function loadTeamMembersFilter() {
    try {
      const res = await window.apiGet('/api/client/team');
      if (res && res.ok && res.data && userFilter) {
        // Clear all except the first option ("all")
        userFilter.innerHTML = `<option value="all">Qualquer Utilizador / Canal</option>`;
        
        const members = res.data;
        members.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m.name || m.email;
          opt.textContent = m.name || m.email;
          userFilter.appendChild(opt);
        });
      }
    } catch (e) {
      console.error("Não foi possível carregar os colaboradores para o filtro.", e);
    }
  }

  async function loadActivityLogs() {
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (tableContainer) tableContainer.classList.add('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');

    try {
      const res = await window.apiGet(`/api/client/activity?page=${currentPage}&user=${selectedUser}&module=${selectedModule}`);
      if (res && res.ok) {
        totalPages = res.totalPages || 1;
        currentPage = res.currentPage || 1;
        renderLogs(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  }

  function renderLogs(logsList) {
    if (tbody) tbody.innerHTML = '';

    if (logsList.length === 0) {
      if (tableContainer) tableContainer.classList.add('hidden');
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');
    if (tableContainer) tableContainer.classList.remove('hidden');

    logsList.forEach(log => {
      const row = document.createElement('tr');
      row.className = "border-b border-white/5 hover:bg-white/5 transition-colors";

      const formattedTime = log.created_at 
        ? new Date(log.created_at).toLocaleString('pt', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
        : '--';

      // Design nice module tags inside table rows
      let moduleBadgeColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/15";
      if (log.module === 'Clientes') moduleBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/15";
      if (log.module === 'Financeiro') moduleBadgeColor = "bg-amber-500/10 text-amber-500 border-amber-500/15";
      if (log.module === 'Agenda') moduleBadgeColor = "bg-sky-500/10 text-sky-400 border-sky-500/15";
      if (log.module === 'Tarefas') moduleBadgeColor = "bg-teal-500/10 text-teal-400 border-teal-500/15";
      if (log.module === 'Servidor SMTP') moduleBadgeColor = "bg-pink-500/10 text-pink-400 border-pink-500/15";
      if (log.module === 'Faturação') moduleBadgeColor = "bg-purple-500/10 text-purple-400 border-purple-500/15";

      row.innerHTML = `
        <td class="p-4">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[8px] uppercase text-slate-300">
              ${log.user_name ? log.user_name.charAt(0) : 'S'}
            </div>
            <span class="font-extrabold text-white text-[11px]">${log.user_name || 'Sistema'}</span>
          </div>
        </td>
        <td class="p-4">
          <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${moduleBadgeColor}">${log.module || 'Sistema'}</span>
        </td>
        <td class="p-4 text-xs font-black text-indigo-400">${log.action || '--'}</td>
        <td class="p-4 text-xs text-slate-400 font-medium max-w-[280px] truncate" title="${log.details || ''}">${log.details || '--'}</td>
        <td class="p-4 text-[10px] text-slate-500 font-mono font-black">${formattedTime}</td>
      `;
      tbody.appendChild(row);
    });

    // Update pagination labels
    if (pageLabel) pageLabel.textContent = `Página ${currentPage} de ${totalPages}`;
    
    // Toggle active paging indicators
    if (btnPrev) btnPrev.disabled = (currentPage <= 1);
    if (btnNext) btnNext.disabled = (currentPage >= totalPages);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Event handlers for option selections
  if (userFilter) {
    userFilter.onchange = () => {
      selectedUser = userFilter.value;
      currentPage = 1;
      loadActivityLogs();
    };
  }

  if (moduleFilter) {
    moduleFilter.onchange = () => {
      selectedModule = moduleFilter.value;
      currentPage = 1;
      loadActivityLogs();
    };
  }

  // Paging actions
  if (btnPrev) {
    btnPrev.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        loadActivityLogs();
      }
    };
  }

  if (btnNext) {
    btnNext.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        loadActivityLogs();
      }
    };
  }

  // Load initial targets
  loadTeamMembersFilter();
  loadActivityLogs();
}
