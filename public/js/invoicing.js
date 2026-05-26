/**
 * Controller for Bookkeeping & Invoice Emission (Módulo 10)
 */

let allInvoices = [];
let allClientsList = [];

document.addEventListener('DOMContentLoaded', () => {
  initInvoicingController();
});

function initInvoicingController() {
  const loadingEl = document.getElementById('invoices-loading');
  const tableContainer = document.getElementById('invoices-table-container');
  const emptyEl = document.getElementById('invoices-empty');
  const tbody = document.getElementById('invoices-tbody');

  const btnOpenModal = document.getElementById('btn-open-invoice-modal');
  const modal = document.getElementById('invoice-modal');
  const modalClose = document.getElementById('invoice-modal-close');
  const modalBackdrop = document.getElementById('invoice-modal-backdrop');
  const form = document.getElementById('invoice-form');
  const submitBtn = document.getElementById('invoice-submit-btn');

  const clientDropdown = document.getElementById('inv-client-id');
  const itemsListContainer = document.getElementById('invoice-items-list');
  const btnAddItemRow = document.getElementById('btn-add-item-row');

  // Value containers
  const subtotalEl = document.getElementById('inv-subtotal');
  const taxEl = document.getElementById('inv-tax');
  const totalEl = document.getElementById('inv-total');

  // Client inputs
  const invCodeInput = document.getElementById('inv-code');
  const invDateInput = document.getElementById('inv-date');
  const invNotesInput = document.getElementById('inv-notes');

  async function loadInitialDataset() {
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (tableContainer) tableContainer.classList.add('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');

    try {
      // 1. Fetch CRM Clients to populate dropdown
      const clientsRes = await window.apiGet('/api/client/clients');
      if (clientsRes && clientsRes.ok) {
        allClientsList = clientsRes.data || [];
        populateClientsDropdown();
      }

      // 2. Fetch Invoices records
      const invoicesRes = await window.apiGet('/api/client/invoices');
      if (invoicesRes && invoicesRes.ok) {
        allInvoices = invoicesRes.data || [];
        renderInvoices();
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  }

  function populateClientsDropdown() {
    if (!clientDropdown) return;
    clientDropdown.innerHTML = '';
    
    if (allClientsList.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = "Sem clientes no CRM. Registre um cliente primeiro.";
      clientDropdown.appendChild(opt);
      return;
    }

    allClientsList.forEach(cl => {
      const opt = document.createElement('option');
      opt.value = cl.id;
      opt.textContent = `${cl.company_name || 'Sem nome'} (NIF: ${cl.nif || '--'})`;
      clientDropdown.appendChild(opt);
    });
  }

  function renderInvoices() {
    if (tbody) tbody.innerHTML = '';

    if (allInvoices.length === 0) {
      if (tableContainer) tableContainer.classList.add('hidden');
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');
    if (tableContainer) tableContainer.classList.remove('hidden');

    allInvoices.forEach(inv => {
      const row = document.createElement('tr');
      row.className = "border-b border-white/5 hover:bg-white/5 transition-colors";

      const valTotal = inv.total_amount || 0;
      const formattedTotal = formatEuro(valTotal);
      
      const fileDate = inv.issue_date ? new Date(inv.issue_date).toLocaleDateString('pt') : '--';

      // Status configs
      let statusClass = "bg-amber-500/10 text-amber-550 text-amber-500 border-amber-500/15";
      let statusLabel = "Pendente";
      if (inv.status === 'paid') {
        statusClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/15";
        statusLabel = "Paga";
      } else if (inv.status === 'cancelled') {
        statusClass = "bg-rose-500/10 text-rose-500 border-rose-500/15";
        statusLabel = "Cancelada";
      }

      // Action toggles
      let statusButtonStr = '';
      if (inv.status === 'unpaid') {
        statusButtonStr = `
          <button class="btn-pay-inv p-1.5 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors" title="Marcar como Paga">
            <i data-lucide="check" class="w-4 h-4"></i>
          </button>
          <button class="btn-cancel-inv p-1.5 hover:bg-rose-500/10 text-rose-500 hover:text-rose-400 rounded-lg transition-colors" title="Cancelar Fatura">
            <i data-lucide="slash" class="w-4 h-4"></i>
          </button>
        `;
      }

      row.innerHTML = `
        <td class="p-4 font-mono font-bold text-white text-xs">${inv.invoice_code || '--'}</td>
        <td class="p-4 font-extrabold text-slate-300 hover:text-white transition-colors">${inv.client_name || 'Serviço Direto'}</td>
        <td class="p-4 font-black text-indigo-400">${formattedTotal}</td>
        <td class="p-4 text-slate-500 font-bold">${fileDate}</td>
        <td class="p-4 text-center">
          <div class="flex justify-center">
            <span class="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusClass}">${statusLabel}</span>
          </div>
        </td>
        <td class="p-4 text-center">
          <div class="flex items-center justify-center gap-2">
            ${statusButtonStr}
            <span class="text-slate-700 text-[10px]">|</span>
            <span class="text-[10px] text-slate-500 font-bold uppercase select-none">FT</span>
          </div>
        </td>
      `;

      // Assign action triggers
      const payBtn = row.querySelector('.btn-pay-inv');
      if (payBtn) {
        payBtn.onclick = async () => {
          if (!confirm(`Liquidar fatura [${inv.invoice_code}]?`)) return;
          try {
            const res = await window.apiPatch(`/api/client/invoices/${inv.id}`, { status: 'paid' });
            if (res && res.ok) {
              loadInitialDataset();
            }
          } catch (err) {
            console.error(err);
          }
        };
      }

      const cancelBtn = row.querySelector('.btn-cancel-inv');
      if (cancelBtn) {
        cancelBtn.onclick = async () => {
          if (!confirm(`Cancelar fatura [${inv.invoice_code}]?`)) return;
          try {
            const res = await window.apiPatch(`/api/client/invoices/${inv.id}`, { status: 'cancelled' });
            if (res && res.ok) {
              loadInitialDataset();
            }
          } catch (err) {
            console.error(err);
          }
        };
      }

      tbody.appendChild(row);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- ITEM ROW BUILDER AND CALCULATOR ---
  function createItemRow(itemName = '', itemPrice = 0, itemQty = 1) {
    const rowId = 'row-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const div = document.createElement('div');
    div.id = rowId;
    div.className = "grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center bg-slate-950/30 p-3 rounded-xl border border-white/5 relative group animate-fade-in";

    div.innerHTML = `
      <div class="sm:col-span-6 space-y-1">
        <input type="text" placeholder="Nome do Item / Serviço" required value="${itemName}" class="item-desc w-full bg-slate-950 border border-white/5 rounded-lg p-2 text-xs font-bold text-white placeholder:text-slate-750">
      </div>
      <div class="sm:col-span-3 space-y-1">
        <input type="number" step="0.01" min="0" placeholder="Preço (€)" required value="${itemPrice || ''}" class="item-price w-full bg-slate-950 border border-white/5 rounded-lg p-2 text-xs font-mono font-bold text-white">
      </div>
      <div class="sm:col-span-2 space-y-1">
        <input type="number" step="1" min="1" placeholder="Qtd" required value="${itemQty || 1}" class="item-qty w-full bg-slate-950 border border-white/5 rounded-lg p-2 text-xs font-mono font-bold text-white">
      </div>
      <div class="sm:col-span-1 flex justify-center">
        <button type="button" class="btn-remove-row p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors" title="Excluir item">
          <i data-lucide="trash" class="w-4 h-4"></i>
        </button>
      </div>
    `;

    // Listeners for live price/qty recalculation
    const descInput = div.querySelector('.item-desc');
    const priceInput = div.querySelector('.item-price');
    const qtyInput = div.querySelector('.item-qty');
    const removeBtn = div.querySelector('.btn-remove-row');

    priceInput.oninput = recalculateInvoiceTotals;
    qtyInput.oninput = recalculateInvoiceTotals;

    removeBtn.onclick = () => {
      div.remove();
      recalculateInvoiceTotals();
    };

    itemsListContainer.appendChild(div);
    if (window.lucide) window.lucide.createIcons();

    recalculateInvoiceTotals();
  }

  function recalculateInvoiceTotals() {
    let subtotal = 0;

    const rows = itemsListContainer.querySelectorAll('[id^="row-"]');
    rows.forEach(r => {
      const priceVal = parseFloat(r.querySelector('.item-price').value) || 0;
      const qtyVal = parseInt(r.querySelector('.item-qty').value) || 0;
      subtotal += (priceVal * qtyVal);
    });

    const taxVal = subtotal * 0.23;
    const grandTotal = subtotal + taxVal;

    if (subtotalEl) subtotalEl.textContent = formatEuro(subtotal);
    if (taxEl) taxEl.textContent = formatEuro(taxVal);
    if (totalEl) totalEl.textContent = formatEuro(grandTotal);
  }

  function formatEuro(v) {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(v);
  }

  function openInvoiceModal() {
    form.reset();
    itemsListContainer.innerHTML = '';
    
    // Auto populate date field with today
    if (invDateInput) invDateInput.value = new Date().toISOString().split('T')[0];
    
    // Create first empty line row automatically to prompt user
    createItemRow('', 0, 1);

    modal.classList.remove('hidden');
  }

  function closeInvoiceModal() {
    modal.classList.add('hidden');
  }

  // Handle Save (Add Invoice)
  form.onsubmit = async (e) => {
    e.preventDefault();

    const invoice_code = invCodeInput.value;
    const issue_date = invDateInput.value;
    const client_id = clientDropdown.value;
    const notes = invNotesInput.value;

    if (!client_id) {
      alert("Por favor seleccione um Cliente do CRM.");
      return;
    }

    // Build items structured list
    const items = [];
    const rows = itemsListContainer.querySelectorAll('[id^="row-"]');
    
    rows.forEach(r => {
      const name = r.querySelector('.item-desc').value;
      const price = parseFloat(r.querySelector('.item-price').value) || 0;
      const q = parseInt(r.querySelector('.item-qty').value) || 1;
      
      if (name) {
        items.push({
          description: name,
          unit_price: price,
          quantity: q
        });
      }
    });

    if (items.length === 0) {
      alert("Por favor, adicione pelo menos um item à fatura.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'A emitir fatura...';

    // Calculate Grand Total inside payload
    let sub = 0;
    items.forEach(it => { sub += (it.unit_price * it.quantity); });
    const tot = sub * 1.23; // 23% IVA

    const payload = {
      invoice_code,
      issue_date,
      client_id,
      notes,
      total_amount: tot,
      items
    };

    try {
      const res = await window.apiPost('/api/client/invoices', payload);
      if (res && res.ok) {
        closeInvoiceModal();
        loadInitialDataset();
      } else {
        throw new Error(res.error || "Erro de validação fiscal.");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Emitir e Lançar Fatura';
    }
  };

  // Wire actions
  if (btnAddItemRow) btnAddItemRow.onclick = () => createItemRow('', 0, 1);
  if (btnOpenModal) btnOpenModal.onclick = openInvoiceModal;
  if (modalClose) modalClose.onclick = closeInvoiceModal;
  if (modalBackdrop) modalBackdrop.onclick = closeInvoiceModal;

  // Run initial trigger
  loadInitialDataset();
}
