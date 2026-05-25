/**
 * Dynamic Sidebar & Shared Header Renderer (DRY Architecture)
 */

const MENU_CATEGORIES = [
  {
    title: "Atendimento & Relacionamento",
    icon: "users",
    items: [
      { name: "Conversas", url: "/app/messages", rawUrl: "messages.html", icon: "message-square" },
      { name: "Tickets", url: "/app/tickets", rawUrl: "tickets.html", icon: "ticket" },
      { name: "Pedidos", url: "/app/orders", rawUrl: "orders.html", icon: "shopping-bag" },
      { name: "Reclamações", url: "/app/complaints", rawUrl: "complaints.html", icon: "alert-octagon" },
      { name: "Clientes", url: "/app/clients", rawUrl: "clients.html", icon: "user-check" }
    ]
  },
  {
    title: "Vendas & Financeiro",
    icon: "dollar-sign",
    items: [
      { name: "Vendas", url: "/app/sales", rawUrl: "sales.html", icon: "trending-up" },
      { name: "Financeiro", url: "/app/finance", rawUrl: "finance.html", icon: "wallet" },
      { name: "Faturação", url: "/app/invoicing", rawUrl: "invoicing.html", icon: "receipt" }
    ]
  },
  {
    title: "Operações & Gestão Interna",
    icon: "briefcase",
    items: [
      { name: "Agenda", url: "/app/calendar", rawUrl: "calendar.html", icon: "calendar" },
      { name: "Tarefas", url: "/app/tasks", rawUrl: "tasks.html", icon: "check-square" },
      { name: "Documentos", url: "/app/documents", rawUrl: "documents.html", icon: "file-text" },
      { name: "Equipa", url: "/app/team", rawUrl: "team.html", icon: "users-round" }
    ]
  },
  {
    title: "Comunicação & Automação",
    icon: "cpu",
    items: [
      { name: "Email", url: "/app/email", rawUrl: "email.html", icon: "mail" },
      { name: "Automações", url: "/app/automations", rawUrl: "automations.html", icon: "git-branch" }
    ]
  },
  {
    title: "Análise & Performance",
    icon: "bar-chart-2",
    items: [
      { name: "Relatórios", url: "/app/reports", rawUrl: "reports.html", icon: "pie-chart" },
      { name: "Atividade", url: "/app/activity", rawUrl: "activity.html", icon: "activity" },
      { name: "Saúde", url: "/app/health", rawUrl: "health.html", icon: "heart-pulse" }
    ]
  },
  {
    title: "Tecnologia & Configurações",
    icon: "settings",
    items: [
      { name: "IA", url: "/app/ai", rawUrl: "ai.html", icon: "bot" },
      { name: "Instância", url: "/app/instance", rawUrl: "instance.html", icon: "server" },
      { name: "Definições", url: "/app/settings", rawUrl: "settings.html", icon: "sliders" }
    ]
  }
];

function renderSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  const currentPath = window.location.pathname;

  let html = `
    <!-- Desktop Sidebar Wrapper -->
    <div class="hidden lg:flex flex-col w-64 h-screen bg-slate-900 border-r border-white/5 text-slate-300 select-none overflow-y-auto no-scrollbar py-6">
      
      <!-- Logo Section -->
      <a href="/app/dashboard" class="flex items-center gap-3 px-6 mb-8 group shrink-0">
        <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white scale-100 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
          <i data-lucide="shield-check" class="w-6 h-6"></i>
        </div>
        <div>
          <h2 class="text-lg font-black text-white px-0.5 tracking-tight group-hover:text-indigo-400 transition-colors">TrataTudo</h2>
          <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest block -mt-1">Super Admin Panel</span>
        </div>
      </a>

      <!-- Home dashboard button -->
      <div class="px-3 mb-6 shrink-0">
        <a href="/app/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
          currentPath.endsWith('dashboard') || currentPath.endsWith('dashboard.html')
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        }">
          <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
          <span>Dashboard Principal</span>
        </a>
      </div>

      <!-- Navigation Menus -->
      <nav class="flex-1 px-3 space-y-6">
  `;

  MENU_CATEGORIES.forEach(cat => {
    html += `
      <div class="space-y-1">
        <span class="px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest select-none">${cat.title}</span>
        <div class="space-y-0.5 mt-2">
    `;

    cat.items.forEach(item => {
      const isActive = currentPath.endsWith(item.url) || currentPath.endsWith(item.rawUrl);
      html += `
        <a href="${item.url}" class="flex items-center gap-3 px-4 py-2 rounded-xl transition-all font-bold text-xs ${
          isActive 
            ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/10' 
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
        }">
          <i data-lucide="${item.icon}" class="w-4 h-4"></i>
          <span>${item.name}</span>
        </a>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  html += `
      </nav>

      <!-- User footer inside sidebar -->
      <div class="mt-8 px-4 pt-4 border-t border-white/5 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div id="header-admin-initial" class="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-400">
            A
          </div>
          <div class="truncate max-w-[120px]">
            <p id="header-admin-name" class="text-xs font-bold text-white truncate">Admin</p>
            <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Estabilidade</span>
          </div>
        </div>
        <button id="logout-btn" class="p-2 hover:bg-white/5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors" title="Sair do painel">
          <i data-lucide="log-out" class="w-4 h-4"></i>
        </button>
      </div>

    </div>

    <!-- Mobile Drawer Sidebar (Sliding Menu) -->
    <div id="mobile-sidebar-drawer" class="fixed inset-0 z-50 pointer-events-none lg:hidden">
      <!-- Backdrop -->
      <div id="mobile-sidebar-backdrop" class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm opacity-0 transition-opacity duration-300 ease-in-out pointer-events-none"></div>
      
      <!-- Side Menu Drawer -->
      <div id="mobile-sidebar-panel" class="absolute left-0 top-0 bottom-0 w-72 bg-slate-950 border-r border-white/10 p-6 flex flex-col transform -translate-x-full transition-transform duration-300 ease-in-out">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i data-lucide="shield-check" class="w-4 h-4"></i>
            </div>
            <h2 class="text-md font-black text-white">TrataTudo Menu</h2>
          </div>
          <button id="mobile-sidebar-close" class="p-2 bg-white/5 rounded-full text-slate-400">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar space-y-6">
          <a href="/app/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
            currentPath.endsWith('dashboard') || currentPath.endsWith('dashboard.html')
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:bg-white/5'
          }">
            <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
            <span>Dashboard Principal</span>
          </a>

          ${MENU_CATEGORIES.map(cat => `
            <div class="space-y-1">
              <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest px-4">${cat.title}</span>
              <div class="space-y-0.5 mt-2">
                ${cat.items.map(item => {
                  const isActive = currentPath.endsWith(item.url) || currentPath.endsWith(item.rawUrl);
                  return `
                    <a href="${item.url}" class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-bold text-xs ${
                      isActive 
                        ? 'bg-indigo-500/10 text-indigo-400' 
                        : 'text-slate-400 hover:bg-white/5'
                    }">
                      <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                      <span>${item.name}</span>
                    </a>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="pt-4 border-t border-white/5 mt-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center font-bold text-xs text-indigo-400">SA</div>
            <span class="text-xs font-bold text-white text-slate-300">Super Admin</span>
          </div>
          <button onclick="handleAdminLogout()" class="p-2 text-rose-500 hover:bg-white/5 rounded-lg">
            <i data-lucide="log-out" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  setupMobileSidebarHandlers();
}

function renderHeader() {
  const container = document.getElementById('header-container');
  if (!container) return;

  container.setAttribute('class', 'sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 lg:px-8 py-4 shrink-0');
  
  container.innerHTML = `
    <div class="flex items-center justify-between w-full max-w-7xl mx-auto">
      <div class="flex items-center gap-3">
        <!-- Sidebar Hamburger button on mobile -->
        <button id="mobile-hamburger-btn" class="lg:hidden p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white">
          <i data-lucide="menu" class="w-5 h-5"></i>
        </button>
        
        <!-- Welcome status -->
        <div class="hidden sm:block">
          <div class="flex items-center gap-2 mb-0.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">TrataTudo Core Engine</span>
          </div>
        </div>
      </div>

      <!-- Quick stats in header / dynamic user display -->
      <div class="flex items-center gap-4">
        <!-- Floating active status indicator -->
        <div class="flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-4 py-1.5 text-xs text-slate-400 font-bold max-sm:hidden">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          <span>Super Admin Mode</span>
        </div>

        <button onclick="handleAdminLogout()" class="lg:hidden p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-rose-400 transition-colors" title="Sair">
          <i data-lucide="log-out" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `;

  setupMobileSidebarHandlers();
}

function setupMobileSidebarHandlers() {
  const hamburger = document.getElementById('mobile-hamburger-btn');
  const drawer = document.getElementById('mobile-sidebar-drawer');
  const backdrop = document.getElementById('mobile-sidebar-backdrop');
  const panel = document.getElementById('mobile-sidebar-panel');
  const closeBtn = document.getElementById('mobile-sidebar-close');

  if (!hamburger || !drawer) return;

  function openDrawer() {
    drawer.classList.remove('pointer-events-none');
    backdrop.classList.add('opacity-100', 'pointer-events-auto');
    panel.classList.remove('-translate-x-full');
  }

  function closeDrawer() {
    drawer.classList.add('pointer-events-none');
    backdrop.classList.remove('opacity-100', 'pointer-events-auto');
    panel.classList.add('-translate-x-full');
  }

  // Bind clicks once
  hamburger.onclick = (e) => { e.stopPropagation(); openDrawer(); };
  if (closeBtn) closeBtn.onclick = closeDrawer;
  if (backdrop) backdrop.onclick = closeDrawer;
}

// Initial rendering on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  renderHeader();
  
  // Re-run lucide icons detection, as sidebar icons are dynamic
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
