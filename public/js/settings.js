/**
 * Controller for Settings Operations (Company profile & SMTP Setup - Módulo 10)
 */

document.addEventListener('DOMContentLoaded', () => {
  initSettingsController();
});

function initSettingsController() {
  const profileForm = document.getElementById('profile-form');
  const smtpForm = document.getElementById('smtp-form');

  const companyNameInput = document.getElementById('company-name');
  const companyPhoneInput = document.getElementById('company-phone');
  const companyNifInput = document.getElementById('company-nif');
  const companyEmailInput = document.getElementById('company-email');
  const companyAddressInput = document.getElementById('company-address');

  const smtpHostInput = document.getElementById('smtp-host');
  const smtpPortInput = document.getElementById('smtp-port');
  const smtpEmailInput = document.getElementById('smtp-email');
  const smtpPasswordInput = document.getElementById('smtp-password');
  const smtpSecurityInput = document.getElementById('smtp-security');

  const btnTestSmtp = document.getElementById('btn-test-smtp');
  const btnSaveProfile = document.getElementById('btn-save-profile');
  const btnSaveSmtp = document.getElementById('btn-save-smtp');

  const alertBox = document.getElementById('settings-alert');
  const alertIcon = document.getElementById('alert-icon');
  const alertText = document.getElementById('alert-text');

  function showAlert(text, type = 'error') {
    if (!alertBox) return;
    alertBox.classList.remove('hidden', 'bg-rose-500/10', 'border-rose-500/20', 'text-rose-400', 'bg-emerald-500/10', 'border-emerald-500/20', 'text-emerald-400');
    
    if (type === 'success') {
      alertBox.classList.add('bg-emerald-500/10', 'border-emerald-500/20', 'text-emerald-400');
      alertIcon.setAttribute('data-lucide', 'check-circle');
    } else {
      alertBox.classList.add('bg-rose-500/10', 'border-rose-500/20', 'text-rose-400');
      alertIcon.setAttribute('data-lucide', 'alert-triangle');
    }
    
    alertText.textContent = text;
    alertBox.classList.remove('hidden');
    if (window.lucide) {
      window.lucide.createIcons();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function hideAlert() {
    if (alertBox) alertBox.classList.add('hidden');
  }

  async function loadSettings() {
    // 1. Load Profile
    try {
      const clientStr = localStorage.getItem('tratatudo_client');
      if (clientStr) {
        const client = JSON.parse(clientStr);
        companyNameInput.value = client.company_name || '';
        companyPhoneInput.value = client.phone_e164 || '';
        companyNifInput.value = client.nif || '';
        companyEmailInput.value = client.email || '';
        companyAddressInput.value = client.address || '';
      }
    } catch (err) {
      console.error('Error parsing client profile from localStorage', err);
    }

    // 2. Load SMTP config
    try {
      const res = await window.apiGet('/api/client/email/config');
      if (res && res.ok && res.data) {
        const smtp = res.data;
        smtpHostInput.value = smtp.host || '';
        smtpPortInput.value = smtp.port || '';
        smtpEmailInput.value = smtp.email || '';
        smtpPasswordInput.value = smtp.password || '';
        smtpSecurityInput.value = smtp.security || 'tls';
      }
    } catch (err) {
      console.error('Error retrieving SMTP configurations:', err);
    }
  }

  // Handle Profile Save
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const payload = {
        company_name: companyNameInput.value.trim(),
        phone_e164: companyPhoneInput.value.trim(),
        nif: companyNifInput.value.trim(),
        email: companyEmailInput.value.trim(),
        address: companyAddressInput.value.trim()
      };

      const originalBtnHTML = btnSaveProfile.innerHTML;
      btnSaveProfile.disabled = true;
      btnSaveProfile.textContent = 'A guardar perfil...';

      try {
        const res = await window.apiPut('/api/client/profile', payload);
        if (res && res.ok) {
          showAlert('Perfil da empresa atualizado com sucesso!', 'success');
          // Update client data in local session as well
          const currentClient = JSON.parse(localStorage.getItem('tratatudo_client') || '{}');
          const updatedClient = { ...currentClient, ...res.data };
          localStorage.setItem('tratatudo_client', JSON.stringify(updatedClient));
          
          // Re-update sidebar / header profile name if it relies on it
          if (window.checkAuthSession) {
            window.checkAuthSession();
          }
        } else {
          throw new Error(res.error || 'Falha ao processar atualização');
        }
      } catch (err) {
        showAlert('Erro ao atualizar perfil comercial: ' + err.message);
      } finally {
        btnSaveProfile.disabled = false;
        btnSaveProfile.innerHTML = originalBtnHTML;
      }
    });
  }

  // Handle SMTP Save
  if (smtpForm) {
    smtpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const payload = {
        host: smtpHostInput.value.trim(),
        port: Number(smtpPortInput.value),
        email: smtpEmailInput.value.trim(),
        password: smtpPasswordInput.value,
        security: smtpSecurityInput.value
      };

      const originalBtnHTML = btnSaveSmtp.innerHTML;
      btnSaveSmtp.disabled = true;
      btnSaveSmtp.textContent = 'A salvar SMTP...';

      try {
        const res = await window.apiPost('/api/client/email/config', payload);
        if (res && res.ok) {
          showAlert('Credenciais SMTP guardadas e integradas com sucesso!', 'success');
        } else {
          throw new Error(res.error || 'Falha ao processar configuração');
        }
      } catch (err) {
        showAlert('Erro ao configurar SMTP de envio: ' + err.message);
      } finally {
        btnSaveSmtp.disabled = false;
        btnSaveSmtp.innerHTML = originalBtnHTML;
      }
    });
  }

  // Handle SMTP connection test
  if (btnTestSmtp) {
    btnTestSmtp.addEventListener('click', async () => {
      hideAlert();

      const payload = {
        host: smtpHostInput.value.trim(),
        port: Number(smtpPortInput.value),
        email: smtpEmailInput.value.trim(),
        password: smtpPasswordInput.value,
        security: smtpSecurityInput.value
      };

      if (!payload.host || !payload.port || !payload.email || !payload.password) {
        showAlert('Por favor, preencha todos os campos do SMTP antes de testar a ligação.');
        return;
      }

      const originalBtnHTML = btnTestSmtp.innerHTML;
      btnTestSmtp.disabled = true;
      btnTestSmtp.textContent = 'A testar ligação...';

      try {
        const res = await window.apiPost('/api/client/email/test', payload);
        if (res && res.ok) {
          showAlert(res.message || 'Ligação estabelecida e validada com sucesso!', 'success');
        } else {
          throw new Error(res.error || 'Não foi possível autenticar com o servidor SMTP');
        }
      } catch (err) {
        showAlert('Falha na autenticação SMTP: ' + err.message);
      } finally {
        btnTestSmtp.disabled = false;
        btnTestSmtp.innerHTML = originalBtnHTML;
      }
    });
  }

  // Load initial settings parameters
  loadSettings();
}
