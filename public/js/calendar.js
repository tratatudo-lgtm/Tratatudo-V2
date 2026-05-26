/**
 * Controller for Agenda & Horários Operacionais (Módulo 6)
 */

let allEvents = [];
let currentDate = new Date(); // Tracks selected calendar month/year
let selectedDayStr = ''; // 'YYYY-MM-DD' of selected cell

document.addEventListener('DOMContentLoaded', () => {
  initCalendarController();
});

function initCalendarController() {
  const daysGrid = document.getElementById('calendar-days-grid');
  const monthYearLabel = document.getElementById('calendar-month-year');
  const btnPrev = document.getElementById('btn-month-prev');
  const btnNext = document.getElementById('btn-month-next');
  const dayEventsList = document.getElementById('day-events-list');

  // Modal actions
  const btnOpenModal = document.getElementById('btn-open-calendar-modal');
  const modal = document.getElementById('calendar-modal');
  const modalClose = document.getElementById('calendar-modal-close');
  const modalBackdrop = document.getElementById('calendar-modal-backdrop');
  const form = document.getElementById('calendar-form');
  const submitBtn = document.getElementById('event-submit-btn');
  const deleteBtn = document.getElementById('btn-delete-event');

  // Inputs
  const eventIdInput = document.getElementById('event-id');
  const eventTitleInput = document.getElementById('event-title');
  const eventStartDateInput = document.getElementById('event-start-date');
  const eventStartTimeInput = document.getElementById('event-start-time');
  const eventTypeInput = document.getElementById('event-type');
  const eventPriorityInput = document.getElementById('event-priority');
  const eventDescInput = document.getElementById('event-description');

  async function fetchEvents() {
    try {
      const res = await window.apiGet('/api/client/calendar');
      if (res && res.ok) {
        allEvents = res.data || [];
        renderCalendar();
      }
    } catch (err) {
      console.error("Erro a carregar agenda.", err);
    }
  }

  function renderCalendar() {
    daysGrid.innerHTML = '';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Set month title
    const monthsPt = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    if (monthYearLabel) {
      monthYearLabel.textContent = `${monthsPt[month]} ${year}`;
    }

    // Days calculation
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const startDayIndex = firstDay.getDay(); // 0 = Sunday, 1 = Monday ...
    const totalDays = lastDay.getDate();

    // Create dual arrays for rendering
    let daysToRender = [];

    // 1. Preceding month blank fillers
    for (let i = startDayIndex - 1; i >= 0; i--) {
      daysToRender.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        dateStr: formatDateStr(new Date(year, month - 1, prevMonthLastDay - i))
      });
    }

    // 2. Current Month active cells
    for (let i = 1; i <= totalDays; i++) {
      daysToRender.push({
        day: i,
        isCurrentMonth: true,
        dateStr: formatDateStr(new Date(year, month, i))
      });
    }

    // 3. Proceeding month blank fillers to complete exact table grids (multiples of 7)
    const remainder = 42 - daysToRender.length;
    for (let i = 1; i <= remainder; i++) {
      daysToRender.push({
        day: i,
        isCurrentMonth: false,
        dateStr: formatDateStr(new Date(year, month + 1, i))
      });
    }

    // Default select today on initialization if in current view month
    const todayStr = formatDateStr(new Date());
    if (!selectedDayStr) {
      selectedDayStr = todayStr;
    }

    // Render cells in DOM
    daysToRender.forEach(cell => {
      const cellDiv = document.createElement('div');
      
      const isSelected = selectedDayStr === cell.dateStr;
      const isTodayCell = todayStr === cell.dateStr;

      let styleClasses = "min-h-[75px] rounded-2xl p-2 bg-slate-950/20 border transition-all cursor-pointer relative group flex flex-col justify-between ";
      
      if (cell.isCurrentMonth) {
        if (isSelected) {
          styleClasses += "border-indigo-500 shadow-lg shadow-indigo-600/10 text-white bg-indigo-600/5";
        } else if (isTodayCell) {
          styleClasses += "border-slate-800 text-indigo-400 bg-white/5 font-bold";
        } else {
          styleClasses += "border-white/5 text-slate-300 hover:border-white/10 hover:bg-white/5";
        }
      } else {
        styleClasses += "border-transparent text-slate-700 pointer-events-none opacity-40";
      }

      // Filter events matching this date
      const daysEvents = allEvents.filter(e => {
        if (!e.start_date) return false;
        // Parse date
        const eDateStr = e.start_date.split('T')[0];
        return eDateStr === cell.dateStr;
      });

      // Render dots indicator
      let dotsHtml = '';
      if (cell.isCurrentMonth && daysEvents.length > 0) {
        const dots = daysEvents.slice(0, 3).map(e => {
          let dotColor = 'bg-indigo-500';
          if (e.type === 'venda') dotColor = 'bg-emerald-500';
          if (e.type === 'instalacao') dotColor = 'bg-blue-500';
          if (e.type === 'suporte') dotColor = 'bg-rose-500';
          if (e.type === 'reuniao') dotColor = 'bg-amber-500';
          return `<span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>`;
        }).join('');
        
        const countIndicator = daysEvents.length > 3 
          ? `<span class="text-[8px] font-black text-indigo-400 mt-[-2px]">+${daysEvents.length - 3}</span>` 
          : '';

        dotsHtml = `
          <div class="flex items-center gap-1 mt-1 flex-wrap">
            ${dots}
            ${countIndicator}
          </div>
        `;
      }

      cellDiv.className = styleClasses;
      cellDiv.innerHTML = `
        <span class="text-[10px] font-black">${cell.day}</span>
        ${dotsHtml}
      `;

      if (cell.isCurrentMonth) {
        cellDiv.onclick = () => {
          selectedDayStr = cell.dateStr;
          renderCalendar();
          displayDayEvents();
        };
      }

      daysGrid.appendChild(cellDiv);
    });

    displayDayEvents();
  }

  function displayDayEvents() {
    if (!dayEventsList) return;
    dayEventsList.innerHTML = '';

    const daysEvents = allEvents.filter(e => {
      if (!e.start_date) return false;
      const eDateStr = e.start_date.split('T')[0];
      return eDateStr === selectedDayStr;
    });

    const parsedDate = new Date(selectedDayStr + 'T00:00:00');
    const displayHeader = document.createElement('div');
    displayHeader.className = "text-[10px] text-slate-400 font-bold tracking-wide border-b border-white/5 pb-2 uppercase text-center mb-1 bg-slate-950/20 py-1 rounded-md";
    displayHeader.textContent = parsedDate.toLocaleDateString('pt', { weekday: 'long', day: 'numeric', month: 'short' });
    dayEventsList.appendChild(displayHeader);

    if (daysEvents.length === 0) {
      const p = document.createElement('p');
      p.className = "text-[10px] text-slate-500 font-bold italic text-center py-6 block";
      p.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-slate-600 block mx-auto mb-1"></i> Livre de compromissos`;
      dayEventsList.appendChild(p);
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    daysEvents.forEach(e => {
      const card = document.createElement('div');
      card.className = "p-3 bg-slate-950/40 hover:bg-slate-950 border border-white/5 hover:border-indigo-500/30 rounded-2xl cursor-pointer transition-all space-y-1 relative group";
      
      let badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      if (e.type === 'venda') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      if (e.type === 'instalacao') badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      if (e.type === 'suporte') badgeColor = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      if (e.type === 'reuniao') badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';

      const timeLabel = e.start_time ? e.start_time.slice(0, 5) : 'Todo Dia';

      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}">${e.type || 'Compromisso'}</span>
          <span class="text-[9px] font-mono text-slate-500 font-black">${timeLabel}</span>
        </div>
        <h4 class="text-xs font-black text-white leading-tight mt-1 group-hover:text-indigo-400 transition-colors">${e.title}</h4>
        <p class="text-[10px] text-slate-450 line-clamp-2 leading-relaxed mt-0.5">${e.description || 'Sem notas de apoio.'}</p>
      `;

      card.onclick = (event) => {
        event.stopPropagation();
        openCalendarModal(e);
      };

      dayEventsList.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function formatDateStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const r = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${r}`;
  }

  function openCalendarModal(evtObj = null) {
    if (evtObj) {
      document.getElementById('calendar-modal-title').textContent = "Editar Compromisso";
      eventIdInput.value = evtObj.id;
      eventTitleInput.value = evtObj.title || '';
      eventStartDateInput.value = evtObj.start_date ? evtObj.start_date.split('T')[0] : '';
      eventStartTimeInput.value = evtObj.start_time || '';
      eventTypeInput.value = evtObj.type || 'venda';
      eventPriorityInput.value = evtObj.priority || 'media';
      eventDescInput.value = evtObj.description || '';
      if (deleteBtn) deleteBtn.classList.remove('hidden');
    } else {
      document.getElementById('calendar-modal-title').textContent = "Agendar Compromisso";
      form.reset();
      eventIdInput.value = '';
      // Default to selected calendar day
      eventStartDateInput.value = selectedDayStr;
      if (deleteBtn) deleteBtn.classList.add('hidden');
    }
    modal.classList.remove('hidden');
  }

  function closeCalendarModal() {
    modal.classList.add('hidden');
  }

  // Submit appointment (add/edit)
  form.onsubmit = async (e) => {
    e.preventDefault();

    const id = eventIdInput.value;
    const title = eventTitleInput.value;
    const start_date = eventStartDateInput.value;
    const start_time = eventStartTimeInput.value;
    const type = eventTypeInput.value;
    const priority = eventPriorityInput.value;
    const description = eventDescInput.value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'A agendar compromisso...';

    const payload = {
      title,
      start_date,
      start_time: start_time || null,
      type,
      priority,
      description
    };

    try {
      if (id) {
        // Edit mode
        const res = await window.apiPatch(`/api/client/calendar/${id}`, payload);
        if (res && res.ok) {
          closeCalendarModal();
          fetchEvents();
        } else {
          throw new Error(res.error || "Erro ao editar compromisso.");
        }
      } else {
        // Create mode
        const res = await window.apiPost('/api/client/calendar', payload);
        if (res && res.ok) {
          closeCalendarModal();
          fetchEvents();
        } else {
          throw new Error(res.error || "Erro ao salvar compromisso.");
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar Compromisso';
    }
  };

  // Delete event action
  if (deleteBtn) {
    deleteBtn.onclick = async () => {
      const id = eventIdInput.value;
      if (!id) return;
      if (!confirm('Desmarcar definitivamente este compromisso operacional?')) return;

      try {
        const res = await window.apiDelete(`/api/client/calendar/${id}`);
        if (res && res.ok) {
          closeCalendarModal();
          fetchEvents();
        } else {
          throw new Error(res.error || "Não foi possível desmarcar.");
        }
      } catch (err) {
        alert(err.message);
      }
    };
  }

  // Month switcher bindings
  if (btnPrev) {
    btnPrev.onclick = () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    };
  }
  if (btnNext) {
    btnNext.onclick = () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    };
  }

  if (btnOpenModal) btnOpenModal.onclick = () => openCalendarModal();
  if (modalClose) modalClose.onclick = closeCalendarModal;
  if (modalBackdrop) modalBackdrop.onclick = closeCalendarModal;

  // Run initial trigger
  fetchEvents();
}
