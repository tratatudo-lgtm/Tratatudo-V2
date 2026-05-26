/**
 * Controller for Finance Operations (Módulo 5)
 */

let allTransactions = [];
let filteredTransactions = [];
let isSettled = true; // Yes by default

document.addEventListener('DOMContentLoaded', () => {
  initFinanceController();
});

function initFinanceController() {
  const financeLoading = document.getElementById('finance-loading');
  const financeTableContainer = document.getElementById('finance-table-container');
  const financeEmpty = document.getElementById('finance-empty');
  const financeTbody = document.getElementById('finance-tbody');

  // Metric fields
  const metricIncome = document.getElementById('metric-income');
  const metricExpense = document.getElementById('metric-expense');
  const metricBalance = document.getElementById('metric-balance');

  // Input filters
  const filterSearch = document.getElementById('filter-search');
  const filterType = document.getElementById('filter-type');
  const filterCategory = document.getElementById('filter-category');
  const filterStatus = document.getElementById('filter-status');

  // Modal actions
  const btnOpenModal = document.getElementById('btn-open-finance-modal');
  const modal = document.getElementById('finance-modal');
  const modalClose = document.getElementById('finance-modal-close');
  const modalBackdrop = document.getElementById('finance-modal-backdrop');
  const form = document.getElementById('finance-form');
  const submitBtn = document.getElementById('finance-submit-btn');

  // Paid/Unpaid modal toggles
  const btnSettledYes = document.getElementById('btn-settled-yes');
  const btnSettledNo = document.getElementById('btn-settled-no');

  async function fetchFinanceData() {
    if (financeLoading) financeLoading.classList.remove('hidden');
    if (financeTableContainer) financeTableContainer.classList.add('hidden');
    if (financeEmpty) financeEmpty.classList.add('hidden');

    try {
      // 1. Fetch Summary Statistics
      const summRes = await window.apiGet('/api/client/finance/summary');
      if (summRes && summRes.ok) {
        formatSummaryMetrics(summRes.data);
      }

      // 2. Fetch Transactions List
      const listRes = await window.apiGet('/api/client/finance');
      if (listRes && listRes.ok) {
        allTransactions = listRes.data || [];
        applyFiltersAndRender();
      } else {
        throw new Error(listRes.error || "Erro ao obter registos de caixa.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (financeLoading) financeLoading.classList.add('hidden');
    }
  }

  function formatSummaryMetrics(metrics) {
    const inc = metrics.total_income || 0;
    const exp = metrics.total_expense || 0;
    const bal = inc - exp;

    if (metricIncome) metricIncome.textContent = formatEuro(inc);
    if (metricExpense) metricExpense.textContent = formatEuro(exp);
    
    if (metricBalance) {
      metricBalance.textContent = formatEuro(bal);
      if (bal >= 0) {
        metricBalance.className = "text-2xl font-black text-emerald-400";
      } else {
        metricBalance.className = "text-2xl font-black text-rose-500";
      }
    }
  }

  function applyFiltersAndRender() {
    const searchVal = filterSearch ? filterSearch.value.toLowerCase() : '';
    const typeVal = filterType ? filterType.value : 'all';
    const catVal = filterCategory ? filterCategory.value : 'all';
    const statusVal = filterStatus ? filterStatus.value : 'all';

    filteredTransactions = allTransactions.filter(t => {
      // Search
      const descriptionMatches = (t.description || '').toLowerCase().includes(searchVal);

      // Type
      const typeMatches = typeVal === 'all' || t.type === typeVal;

      // Category
      const categoryMatches = catVal === 'all' || t.category === catVal;

      // Status
      let statusMatches = true;
      if (statusVal === 'paid') {
        statusMatches = t.status === 'paid';
      } else if (statusVal === 'unpaid') {
        statusMatches = t.status === 'unpaid';
      }

      return descriptionMatches && typeMatches && categoryMatches && statusMatches;
    });

    renderTransactionsTable();
  }

  function renderTransactionsTable() {
    if (financeTbody) financeTbody.innerHTML = '';

    if (filteredTransactions.length === 0) {
      if (financeTableContainer) financeTableContainer.classList.add('hidden');
      if (financeEmpty) financeEmpty.classList.remove('hidden');
      return;
    }

    if (financeEmpty) financeEmpty.classList.add('hidden');
    if (financeTableContainer) financeTableContainer.classList.remove('hidden');

    filteredTransactions.forEach(t => {
      const row = document.createElement('tr');
      row.className = "border-b border-white/5 hover:bg-white/5 transition-colors";

      const typeBadge = t.type === 'income' 
        ? `<span class="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1 w-max">
             <i data-lucide="arrow-down-left" class="w-3.5 h-3.5"></i> Entrada
           </span>`
        : `<span class="text-xs text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1 w-max">
             <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i> Saída
           </span>`;

      const statusBadge = t.status === 'paid'
        ? `<div class="flex justify-center">
             <span class="text-[9px] text-emerald-500 font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-full">Liquidado</span>
           </div>`
        : `<div class="flex justify-center">
             <span class="text-[9px] text-amber-500 font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/15 px-2.5 py-1 rounded-full">Pendente</span>
           </div>`;

      const amountFormatted = t.type === 'income' ? `+${formatEuro(t.amount)}` : `-${formatEuro(t.amount)}`;
      const amountColor = t.type === 'income' ? 'text-emerald-400' : 'text-slate-300';
      const fileDate = t.due_date ? new Date(t.due_date).toLocaleDateString('pt') : '--';

      row.innerHTML = `
        <td class="p-4">
          <div class="font-bold text-white text-xs">${t.description || '--'}</div>
          <div class="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">${t.notes || ''}</div>
        </td>
        <td class="p-4 font-black ${amountColor}">${amountFormatted}</td>
        <td class="p-4">${typeBadge}</td>
        <td class="p-4 text-slate-400 font-bold text-xs uppercase">${t.category || 'Outros'}</td>
        <td class="p-4 text-slate-450 font-semibold font-mono">${fileDate}</td>
        <td class="p-4">${statusBadge}</td>
      `;

      financeTbody.appendChild(row);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function formatEuro(val) {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);
  }

  // Handle settled toggler inside modal
  function setSettledState(state) {
    isSettled = state;
    if (state) {
      btnSettledYes.className = "py-2 rounded-lg text-[9px] font-black uppercase border border-emerald-500 bg-emerald-500/10 text-emerald-400";
      btnSettledNo.className = "py-2 rounded-lg text-[9px] font-black uppercase border border-white/10 text-slate-500 hover:border-white/20";
    } else {
      btnSettledYes.className = "py-2 rounded-lg text-[9px] font-black uppercase border border-white/10 text-slate-500 hover:border-white/20";
      btnSettledNo.className = "py-2 rounded-lg text-[9px] font-black uppercase border border-rose-500 bg-rose-500/10 text-rose-500";
    }
  }

  function openFinanceModal() {
    form.reset();
    setSettledState(true);
    // Set standard due date to today
    document.getElementById('fin-due-date').value = new Date().toISOString().split('T')[0];
    modal.classList.remove('hidden');
  }

  function closeFinanceModal() {
    modal.classList.add('hidden');
  }

  // Handle new entry submit
  form.onsubmit = async (e) => {
    e.preventDefault();

    const desc = document.getElementById('fin-description').value;
    const amount = parseFloat(document.getElementById('fin-amount').value);
    const type = document.getElementById('fin-type').value;
    const cat = document.getElementById('fin-category').value;
    const duedate = document.getElementById('fin-due-date').value;
    const notes = document.getElementById('fin-notes').value;

    submitBtn.disabled = true;
    submitBtn.textContent = "A registar transação...";

    const payload = {
      description: desc,
      amount,
      type,
      category: cat,
      due_date: duedate,
      status: isSettled ? 'paid' : 'unpaid',
      notes
    };

    try {
      const res = await window.apiPost('/api/client/finance', payload);
      if (res && res.ok) {
        closeFinanceModal();
        fetchFinanceData();
      } else {
        throw new Error(res.error || "Impossível resguardar transação.");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Efectuar Lançamento Financeiro";
    }
  };

  // Wire actions
  if (btnOpenModal) btnOpenModal.onclick = openFinanceModal;
  if (modalClose) modalClose.onclick = closeFinanceModal;
  if (modalBackdrop) modalBackdrop.onclick = closeFinanceModal;

  if (btnSettledYes) btnSettledYes.onclick = () => setSettledState(true);
  if (btnSettledNo) btnSettledNo.onclick = () => setSettledState(false);

  // Wire filters
  if (filterSearch) filterSearch.oninput = applyFiltersAndRender;
  if (filterType) filterType.onchange = applyFiltersAndRender;
  if (filterCategory) filterCategory.onchange = applyFiltersAndRender;
  if (filterStatus) filterStatus.onchange = applyFiltersAndRender;

  // Run initial trigger
  fetchFinanceData();
}
