/**
 * Controller for Dashboard operations
 */

async function loadDashboardStats() {
  try {
    const res = await window.apiGet('/api/admin/dashboard');
    if (res && res.ok) {
      document.getElementById('stat-active-clients').textContent = res.data.activeClients || '0';
      document.getElementById('stat-pending-tickets').textContent = res.data.pendingTickets || '0';
      document.getElementById('stat-expired-subs').textContent = res.data.expiredSubscriptions || '0';
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
