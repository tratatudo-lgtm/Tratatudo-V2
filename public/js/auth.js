/**
 * Autenticação e Gestão de Sessão do Super Admin (Vanilla Edition)
 */

async function checkAuthSession() {
  const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.pathname === '/login';
  
  try {
    const res = await window.apiGet('/api/admin/me');
    if (res && res.ok) {
      // Save super admin details in localStorage
      localStorage.setItem('tratatudo_admin', JSON.stringify(res.data));
      
      // Update UI elements for username, profile etc.
      updateHeaderProfileUI(res.data);

      if (isLoginPage) {
        window.location.href = '/app/dashboard';
      }
    } else {
      throw new Error("No session");
    }
  } catch (err) {
    localStorage.removeItem('tratatudo_admin');
    if (!isLoginPage) {
      window.location.href = '/login';
    }
  }
}

function updateHeaderProfileUI(adminData) {
  const nameEl = document.getElementById('header-admin-name');
  const initialEl = document.getElementById('header-admin-initial');
  if (nameEl) {
    nameEl.textContent = adminData.email || 'Super Admin';
  }
  if (initialEl) {
    const initial = (adminData.email || 'S').charAt(0).toUpperCase();
    initialEl.textContent = initial;
  }
}

async function handleAdminLogout() {
  try {
    await window.apiPost('/api/admin/auth/logout');
  } catch (err) {
    console.error('Logout error', err);
  } finally {
    localStorage.removeItem('tratatudo_admin');
    window.location.href = '/login';
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
