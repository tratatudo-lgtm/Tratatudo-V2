/**
 * Controller for Dashboard operations
 */

async function loadDashboardStats() {
  const isAdmin = window.location.pathname.startsWith('/admin');
  const endpoint = isAdmin ? '/api/admin/dashboard' : '/api/client/dashboard';

  try {
    const res = await window.apiGet(endpoint);
    if (res && res.ok) {
      document.getElementById('stat-active-clients').textContent = res.data.activeClients || '0';
      document.getElementById('stat-pending-tickets').textContent = res.data.pendingTickets || '0';
      document.getElementById('stat-expired-subs').textContent = res.data.expiredSubscriptions || '0';

      if (!isAdmin) {
        // Change dashboard titles & descriptions dynamically to adapt 100% of HTML for the client perspective
        const label1 = document.querySelector('#stat-active-clients')?.parentElement?.parentElement?.querySelector('span');
        if (label1) label1.textContent = "Nome do Plano";
        const sub1 = document.querySelector('#stat-active-clients')?.parentElement?.querySelector('p');
        if (sub1) sub1.textContent = "Plano Ativo TrataTudo";

        const label2 = document.querySelector('#stat-pending-tickets')?.parentElement?.parentElement?.querySelector('span');
        if (label2) label2.textContent = "Os Meus Tickets";
        const sub2 = document.querySelector('#stat-pending-tickets')?.parentElement?.querySelector('p');
        if (sub2) sub2.textContent = "Suporte operacional ativo";

        const label3 = document.querySelector('#stat-expired-subs')?.parentElement?.parentElement?.querySelector('span');
        if (label3) label3.textContent = "Vencimento de Licença";
        const sub3 = document.querySelector('#stat-expired-subs')?.parentElement?.querySelector('p');
        if (sub3) {
          sub3.textContent = "Data limite de uso";
          sub3.className = "text-[10px] text-indigo-400 font-bold mt-1";
        }

        // Also update the description paragraph under "Dashboard Principal"
        const desc = document.querySelector('main > div > p');
        if (desc) desc.textContent = "Área de Trabalho exclusiva e centralizada para o seu Hub de Software Multitenant.";
      }
    }
  } catch (err) {
    console.error('Error loading dashboard stats', err);
  }
}

function initDashboardChart() {
  const ctx = document.getElementById('messagesTrafficChart');
  if (!ctx) return;

  const data = {
    labels: ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'],
    datasets: [{
      label: 'Mensagens / Hora',
      data: [65, 120, 185, 140, 290, 410, 312],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.05)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#6366f1',
      pointHoverRadius: 6
    }]
  };

  new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.03)' },
          ticks: { color: '#64748b', font: { size: 10, weight: 'black' } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 10, weight: 'black' } }
        }
      }
    }
  });
}

// Load on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardStats();
  initDashboardChart();
});
