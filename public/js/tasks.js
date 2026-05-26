/**
 * Controller for Kanban Tasks Sprints (Módulo 7)
 */

let allTasks = [];

document.addEventListener('DOMContentLoaded', () => {
  initTasksController();
});

function initTasksController() {
  const boardEl = document.getElementById('tasks-kanban-board');
  const loadingEl = document.getElementById('tasks-loading');

  const colBacklog = document.getElementById('col-backlog');
  const colProgress = document.getElementById('col-inprogress');
  const colCompleted = document.getElementById('col-completed');

  const countBacklog = document.getElementById('count-backlog');
  const countProgress = document.getElementById('count-inprogress');
  const countCompleted = document.getElementById('count-completed');

  // Modal actions
  const btnOpenModal = document.getElementById('btn-open-task-modal');
  const modal = document.getElementById('task-modal');
  const modalClose = document.getElementById('task-modal-close');
  const modalBackdrop = document.getElementById('task-modal-backdrop');
  const form = document.getElementById('task-form');
  const submitBtn = document.getElementById('task-submit-btn');
  const deleteBtn = document.getElementById('btn-delete-task');

  // Inputs
  const taskIdInput = document.getElementById('task-id');
  const taskTitleInput = document.getElementById('task-title');
  const taskDueDateInput = document.getElementById('task-due-date');
  const taskPriorityInput = document.getElementById('task-priority');
  const taskColumnInput = document.getElementById('task-column');
  const taskDescInput = document.getElementById('task-description');

  async function fetchTasks() {
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (boardEl) boardEl.classList.add('hidden');

    try {
      const res = await window.apiGet('/api/client/tasks');
      if (res && res.ok) {
        allTasks = res.data || [];
        renderKanban();
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
      if (boardEl) boardEl.classList.remove('hidden');
    }
  }

  function renderKanban() {
    // Clear list boxes
    colBacklog.innerHTML = '';
    colProgress.innerHTML = '';
    colCompleted.innerHTML = '';

    // Filters per column
    const backlogItems = allTasks.filter(item => item.column_state === 'backlog' || !item.column_state);
    const progressItems = allTasks.filter(item => item.column_state === 'in_progress');
    const completedItems = allTasks.filter(item => item.column_state === 'completed');

    // Update markers
    if (countBacklog) countBacklog.textContent = backlogItems.length;
    if (countProgress) countProgress.textContent = progressItems.length;
    if (countCompleted) countCompleted.textContent = completedItems.length;

    // Render items
    renderColumnCards(backlogItems, colBacklog, 'backlog');
    renderColumnCards(progressItems, colProgress, 'in_progress');
    renderColumnCards(completedItems, colCompleted, 'completed');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function renderColumnCards(items, parentEl, colName) {
    if (items.length === 0) {
      parentEl.innerHTML = `
        <div class="border border-dashed border-white/5 bg-slate-950/20 py-8 text-center rounded-2xl select-none">
          <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Vazio</p>
        </div>
      `;
      return;
    }

    items.forEach(task => {
      const card = document.createElement('div');
      card.className = "p-4 bg-slate-950/45 hover:bg-slate-950 border border-white/5 hover:border-indigo-500/25 rounded-2xl cursor-pointer transition-all space-y-3 relative group";

      let priorityColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/15";
      if (task.priority === 'media') priorityColor = "bg-amber-500/10 text-amber-500 border-amber-500/15";
      if (task.priority === 'alta') priorityColor = "bg-rose-500/10 text-rose-500 border-rose-500/15";

      const formattedDate = task.due_date ? new Date(task.due_date).toLocaleDateString('pt') : 'Sem Limite';

      // Flow shifts
      let shiftButtons = '';
      if (colName === 'backlog') {
        shiftButtons = `<button class="btn-shift hover:bg-indigo-500/20 text-indigo-400 p-1.5 rounded-lg border border-white/5 transition-colors" data-shift="right" title="Mover para Em Curso"><i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></button>`;
      } else if (colName === 'in_progress') {
        shiftButtons = `
          <button class="btn-shift hover:bg-indigo-500/20 text-indigo-400 p-1.5 rounded-lg border border-white/5 transition-colors" data-shift="left" title="Voltar para Backlog"><i data-lucide="chevron-left" class="w-3.5 h-3.5"></i></button>
          <button class="btn-shift hover:bg-indigo-500/20 text-indigo-400 p-1.5 rounded-lg border border-white/5 transition-colors" data-shift="right" title="Mover para Concluído"><i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></button>
        `;
      } else if (colName === 'completed') {
        shiftButtons = `<button class="btn-shift hover:bg-indigo-500/20 text-indigo-400 p-1.5 rounded-lg border border-white/5 transition-colors" data-shift="left" title="Voltar para Em Curso"><i data-lucide="chevron-left" class="w-3.5 h-3.5"></i></button>`;
      }

      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${priorityColor}">${task.priority || 'baixa'}</span>
          <span class="text-[9px] font-semibold text-slate-500">${formattedDate}</span>
        </div>
        <div>
          <h4 class="text-xs font-black text-white leading-snug group-hover:text-indigo-400 transition-colors">${task.title || 'Sem título'}</h4>
          <p class="text-[10px] text-slate-400 font-semibold line-clamp-2 mt-1 leading-relaxed">${task.description || 'Nenhum detalhe adicional.'}</p>
        </div>
        <div class="flex items-center justify-between border-t border-white/5 pt-3">
          <div class="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase">
            <i data-lucide="clipboard" class="w-3.5 h-3.5 mt-[-1px]"></i>
            <span>Sprint</span>
          </div>
          <div class="flex items-center gap-1.5">
            ${shiftButtons}
          </div>
        </div>
      `;

      // Prevent click bubble to open edit modal when shifting columns
      card.querySelectorAll('.btn-shift').forEach(b => {
        b.onclick = async (e) => {
          e.stopPropagation();
          const direction = b.getAttribute('data-shift');
          let nextCol = 'backlog';
          
          if (colName === 'backlog' && direction === 'right') nextCol = 'in_progress';
          else if (colName === 'in_progress' && direction === 'left') nextCol = 'backlog';
          else if (colName === 'in_progress' && direction === 'right') nextCol = 'completed';
          else if (colName === 'completed' && direction === 'left') nextCol = 'in_progress';

          try {
            const res = await window.apiPatch(`/api/client/tasks/${task.id}`, { column_state: nextCol });
            if (res && res.ok) {
              fetchTasks();
            }
          } catch (err) {
            console.error(err);
          }
        };
      });

      // Click card opens editor
      card.onclick = () => openTaskModal(task);

      parentEl.appendChild(card);
    });
  }

  function openTaskModal(taskObj = null) {
    if (taskObj) {
      document.getElementById('task-modal-title').textContent = "Editar Atividade";
      taskIdInput.value = taskObj.id;
      taskTitleInput.value = taskObj.title || '';
      taskDueDateInput.value = taskObj.due_date ? taskObj.due_date.split('T')[0] : '';
      taskPriorityInput.value = taskObj.priority || 'baixa';
      taskColumnInput.value = taskObj.column_state || 'backlog';
      taskDescInput.value = taskObj.description || '';
      if (deleteBtn) deleteBtn.classList.remove('hidden');
    } else {
      document.getElementById('task-modal-title').textContent = "Nova Tarefa";
      form.reset();
      taskIdInput.value = '';
      taskColumnInput.value = 'backlog';
      if (deleteBtn) deleteBtn.classList.add('hidden');
    }
    modal.classList.remove('hidden');
  }

  function closeTaskModal() {
    modal.classList.add('hidden');
  }

  form.onsubmit = async (e) => {
    e.preventDefault();

    const id = taskIdInput.value;
    const title = taskTitleInput.value;
    const due_date = taskDueDateInput.value;
    const priority = taskPriorityInput.value;
    const column_state = taskColumnInput.value;
    const description = taskDescInput.value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando atividade...';

    const payload = {
      title,
      due_date: due_date || null,
      priority,
      column_state,
      description
    };

    try {
      if (id) {
        // Edit mode
        const res = await window.apiPatch(`/api/client/tasks/${id}`, payload);
        if (res && res.ok) {
          closeTaskModal();
          fetchTasks();
        } else {
          throw new Error(res.error || "Erro ao editar trabalho.");
        }
      } else {
        // Create mode
        const res = await window.apiPost('/api/client/tasks', payload);
        if (res && res.ok) {
          closeTaskModal();
          fetchTasks();
        } else {
          throw new Error(res.error || "Erro ao salvar trabalho.");
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Salvar Sprint de Trabalho';
    }
  };

  if (deleteBtn) {
    deleteBtn.onclick = async () => {
      const id = taskIdInput.value;
      if (!id) return;
      if (!confirm('Excluir permanentemente este sprint de trabalho?')) return;

      try {
        const res = await window.apiDelete(`/api/client/tasks/${id}`);
        if (res && res.ok) {
          closeTaskModal();
          fetchTasks();
        } else {
          throw new Error(res.error || "Não foi possível remover.");
        }
      } catch (err) {
        alert(err.message);
      }
    };
  }

  if (btnOpenModal) btnOpenModal.onclick = () => openTaskModal();
  if (modalClose) modalClose.onclick = closeTaskModal;
  if (modalBackdrop) modalBackdrop.onclick = closeTaskModal;

  fetchTasks();
}
