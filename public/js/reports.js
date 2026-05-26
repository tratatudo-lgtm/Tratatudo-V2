/**
 * Controller for Analytical Metrics & Reports (Módulo 11)
 */

let activePeriod = '30';
let currentChart = null; // Chart.js pointer for recycling canvases safely

document.addEventListener('DOMContentLoaded', () => {
  initReportsController();
});

function initReportsController() {
  const periodButtons = document.querySelectorAll('[data-period]');
  
  const metricSales = document.getElementById('metric-sales');
  const metricExpenses = document.getElementById('metric-expenses');
  const metricConversion = document.getElementById('metric-conversion');

  // Funnel elements
  const funnelTotal = document.getElementById('funnel-total');
  const funnelContacted = document.getElementById('funnel-contacted');
  const funnelNegotiating = document.getElementById('funnel-negotiating');
  const funnelConverted = document.getElementById('funnel-converted');

  const barTotal = document.getElementById('bar-total');
  const barContacted = document.getElementById('bar-contacted');
  const barNegotiating = document.getElementById('bar-negotiating');
  const barConverted = document.getElementById('bar-converted');

  const agentsTbody = document.getElementById('reports-agents-tbody');

  async function loadReports() {
    try {
      const res = await window.apiGet(`/api/client/reports?period=${activePeriod}&agent=all`);
      if (res && res.ok && res.data) {
        renderDashboard(res.data);
      }
    } catch (e) {
      console.error("Erro ao carregar relatórios.", e);
    }
  }

  function renderDashboard(data) {
    // 1. Populate standard numeric metrics
    if (metricSales) metricSales.textContent = formatEuro(data.totalSales || 0);
    if (metricExpenses) metricExpenses.textContent = formatEuro(data.totalExpenses || 0);

    const lf = data.funnel || {};
    const rate = lf.total_leads > 0 ? Math.round((lf.converted / lf.total_leads) * 100) : 0;
    if (metricConversion) metricConversion.textContent = `${rate}%`;

    // 2. Animate and update Funnel Cards
    if (funnelTotal) funnelTotal.textContent = lf.total_leads || 0;
    if (funnelContacted) funnelContacted.textContent = lf.contacted || 0;
    if (funnelNegotiating) funnelNegotiating.textContent = lf.negotiating || 0;
    if (funnelConverted) funnelConverted.textContent = lf.converted || 0;

    // Direct width updates for progress animations
    if (barTotal) barTotal.style.width = '100%';
    if (barContacted) {
      const pct = lf.total_leads > 0 ? (lf.contacted / lf.total_leads) * 100 : 0;
      barContacted.style.width = `${pct}%`;
    }
    if (barNegotiating) {
      const pct = lf.total_leads > 0 ? (lf.negotiating / lf.total_leads) * 100 : 0;
      barNegotiating.style.width = `${pct}%`;
    }
    if (barConverted) {
      const pct = lf.total_leads > 0 ? (lf.converted / lf.total_leads) * 100 : 0;
      barConverted.style.width = `${pct}%`;
    }

    // 3. Render Agent scoreboard
    if (agentsTbody) agentsTbody.innerHTML = '';
    const agentsList = data.agents || [];
    
    if (agentsList.length === 0) {
      agentsTbody.innerHTML = `
        <tr>
          <td colspan="4" class="p-4 text-center text-slate-500 italic">Nenhum agente com tarefas delegadas nesta sprint.</td>
        </tr>
      `;
    } else {
      // Sort in descending efficiency order
      agentsList.sort((a, b) => b.rate - a.rate);

      agentsList.forEach(ag => {
        const row = document.createElement('tr');
        row.className = "border-b border-white/5 hover:bg-white/5 transition-colors";

        row.innerHTML = `
          <td class="p-4 flex items-center gap-2.5">
            <div class="w-7 h-7 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/15 flex items-center justify-center font-bold text-[10px] uppercase">
              ${ag.name ? ag.name.charAt(0) : 'A'}
            </div>
            <span class="font-extrabold text-white text-xs">${ag.name || 'Sem nome'}</span>
          </td>
          <td class="p-4 text-center font-mono font-bold text-slate-400">${ag.total}</td>
          <td class="p-4 text-center font-mono font-bold text-emerald-400">${ag.completed}</td>
          <td class="p-4 text-center">
            <div class="flex items-center justify-center gap-2">
              <div class="w-16 bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5 shrink-0 hidden sm:block">
                <div class="h-full bg-emerald-500 rounded-full" style="width: ${ag.rate}%;"></div>
              </div>
              <span class="font-black text-emerald-400 font-mono">${ag.rate}%</span>
            </div>
          </td>
        `;
        agentsTbody.appendChild(row);
      });
    }

    // 4. Draw Line trends Chart.js
    drawChartTrend(data.salesOverTime || [], data.expenseOverTime || []);
  }

  function drawChartTrend(salesOverTime, expenseOverTime) {
    const canvas = document.getElementById('sales-expenses-chart');
    if (!canvas) return;

    // Destruct old instance to prevent overlays on reload
    if (currentChart) {
      currentChart.destroy();
    }

    const labels = salesOverTime.map(item => item.date);
    const salesData = salesOverTime.map(item => item.value);
    const expenseData = expenseOverTime.map(item => item.value);

    const ctx = canvas.getContext('2d');
    
    // Create Chart.js gradient colors
    const salesGrad = ctx.createLinearGradient(0, 0, 0, 200);
    salesGrad.addColorStop(0, 'rgba(16, 185, 129, 0.25)'); // Emerald transparent
    salesGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');

    const expGrad = ctx.createLinearGradient(0, 0, 0, 200);
    expGrad.addColorStop(0, 'rgba(239, 68, 68, 0.15)'); // Rose transparent
    expGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

    currentChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Vendas (€)',
            data: salesData,
            borderColor: '#10b981', // emerald-500
            backgroundColor: salesGrad,
            borderWidth: 3,
            tension: 0.35,
            fill: true,
            pointRadius: 1,
            pointHoverRadius: 4,
          },
          {
            label: 'Gastos (€)',
            data: expenseData,
            borderColor: '#ef4444', // rose-500
            backgroundColor: expGrad,
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointRadius: 1,
            pointHoverRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#94a3b8', // slate-400
              boxWidth: 12,
              font: {
                family: 'Inter',
                size: 10,
                weight: 'bold'
              }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#0f172a',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            titleColor: '#ffffff',
            bodyColor: '#94a3b8',
            titleFont: { size: 10, weight: 'extrabold' },
            bodyFont: { size: 10, weight: 'bold' },
            callbacks: {
              label: function(tooltipItem) {
                return ` ${tooltipItem.dataset.label}: ${formatEuro(tooltipItem.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#64748b', // slate-500
              font: { size: 9, weight: 'bold' }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.03)',
              drawBorder: false
            },
            ticks: {
              color: '#64748b',
              font: { size: 9, weight: 'semibold' },
              callback: function(value) {
                return value + ' €';
              }
            }
          }
        }
      }
    });
  }

  function formatEuro(v) {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(v);
  }

  // Bind period buttons click listener
  periodButtons.forEach(btn => {
    btn.onclick = () => {
      periodButtons.forEach(b => b.className = "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap text-slate-400 hover:text-slate-200");
      btn.className = "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap bg-indigo-600 text-white shadow shadow-indigo-600/10";
      activePeriod = btn.getAttribute('data-period');
      loadReports();
    };
  });

  // Run initial trigger
  loadReports();
}
