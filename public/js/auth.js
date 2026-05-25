/**
 * Autenticação e Gestão de Sessão do Super Admin (Vanilla Edition)
 */

async function checkAuthSession() {
  const currentPath = window.location.pathname;
  const isAdminPath = currentPath.startsWith('/admin');
  const isLoginPage = currentPath.endsWith('login.html') || currentPath === '/login' || currentPath === '/admin/login';
  
  if (isAdminPath) {
    try {
      const res = await window.apiGet('/api/admin/me');
      if (res && res.ok) {
        // Save super admin details in localStorage
        localStorage.setItem('tratatudo_admin', JSON.stringify(res.data));
        
        // Update UI elements for username, profile etc.
        updateHeaderProfileUI(res.data, true);

        if (isLoginPage) {
          window.location.href = '/admin/dashboard';
        }
      } else {
        throw new Error("Sessão não encontrada");
      }
    } catch (err) {
      localStorage.removeItem('tratatudo_admin');
      if (!isLoginPage) {
        window.location.href = '/admin/login.html';
      }
    }
  } else {
    // Client section on /app/* or client login on /login
    try {
      const res = await window.apiGet('/api/auth/session');
      if (res && res.ok && res.authenticated) {
        // Save client details in localStorage
        localStorage.setItem('tratatudo_client', JSON.stringify(res.client));
        
        // Update UI elements for username, profile etc.
        updateHeaderProfileUI(res.client, false);

        if (isLoginPage) {
          window.location.href = '/app/dashboard';
        }
      } else {
        throw new Error("Sessão de cliente não encontrada");
      }
    } catch (err) {
      localStorage.removeItem('tratatudo_client');
      // If the client is visiting any active app page but isn't authenticated
      if (!isLoginPage && currentPath.includes('/app/')) {
        window.location.href = '/login.html';
      }
    }
  }
}

function updateHeaderProfileUI(data, isAdmin = true) {
  const nameEl = document.getElementById('header-admin-name');
  const initialEl = document.getElementById('header-admin-initial');
  if (nameEl) {
    if (isAdmin) {
      nameEl.textContent = data.email || 'Super Admin';
    } else {
      nameEl.textContent = data.company_name || data.phone_e164 || 'Cliente';
    }
  }
  if (initialEl) {
    const nameStr = isAdmin ? (data.email || 'S') : (data.company_name || data.phone_e164 || 'C');
    initialEl.textContent = nameStr.charAt(0).toUpperCase();
  }
}

async function handleAdminLogout() {
  const isAdminPath = window.location.pathname.startsWith('/admin');
  try {
    if (isAdminPath) {
      await window.apiPost('/api/admin/auth/logout');
    } else {
      await window.apiPost('/api/auth/logout');
    }
  } catch (err) {
    console.error('Logout error', err);
  } finally {
    if (isAdminPath) {
      localStorage.removeItem('tratatudo_admin');
      window.location.href = '/admin/login.html';
    } else {
      localStorage.removeItem('tratatudo_client');
      window.location.href = '/login.html';
    }
  }
}

// Check session on load
document.addEventListener('DOMContentLoaded', () => {
  checkAuthSession();
  
  // Attach logout handler if button exists
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleAdminLogout();
    });
  }
});

window.handleAdminLogout = handleAdminLogout;
window.checkAuthSession = checkAuthSession;
