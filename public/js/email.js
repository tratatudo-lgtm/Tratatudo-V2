/**
 * Controller for Email SMTP Configuration and Verification (Módulo 8)
 */

document.addEventListener('DOMContentLoaded', () => {
  initEmailController();
});

function initEmailController() {
  const smtpForm = document.getElementById('smtp-form');
  const testForm = document.getElementById('test-form');

  const btnSave = document.getElementById('btn-save-smtp');
  const btnTest = document.getElementById('btn-test-smtp');

  const responseBox = document.getElementById('test-response-box');
  const responseText = document.getElementById('test-response-text');
  const responseIcon = document.getElementById('test-response-icon');

  // Input Fields
  const hostInput = document.getElementById('smtp-host');
  const portInput = document.getElementById('smtp-port');
  const secureInput = document.getElementById('smtp-secure');
  const userInput = document.getElementById('smtp-user');
  const passInput = document.getElementById('smtp-pass');
  const senderEmailInput = document.getElementById('smtp-sender-email');
  const senderNameInput = document.getElementById('smtp-sender-name');
  const testRecipientInput = document.getElementById('test-recipient-email');

  async function loadSmtpConfig() {
    try {
      const res = await window.apiGet('/api/client/email/config');
      if (res && res.ok && res.data) {
        const c = res.data;
        if (hostInput) hostInput.value = c.host || '';
        if (portInput) portInput.value = c.port || '';
        if (secureInput) secureInput.value = c.secure_type || 'tls';
        if (userInput) userInput.value = c.username || '';
        if (passInput) passInput.value = c.password || '';
        if (senderEmailInput) senderEmailInput.value = c.sender_email || '';
        if (senderNameInput) senderNameInput.value = c.sender_name || '';
      }
    } catch (err) {
      console.error("Erro ao ler credenciais do servidor.", err);
    }
  }

  // Handle Save Configuration
  if (smtpForm) {
    smtpForm.onsubmit = async (e) => {
      e.preventDefault();

      btnSave.disabled = true;
      btnSave.textContent = "A salvar Servidor...";

      const payload = {
        host: hostInput.value,
        port: parseInt(portInput.value),
        secure_type: secureInput.value,
        username: userInput.value,
        password: passInput.value,
        sender_email: senderEmailInput.value,
        sender_name: senderNameInput.value
      };

      try {
        const res = await window.apiPost('/api/client/email/config', payload);
        if (res && res.ok) {
          alert("Configurações do Servidor SMTP actualizadas e salvas com sucesso!");
        } else {
          throw new Error(res.error || "Operação impossível de completar.");
        }
      } catch (err) {
        alert(err.message);
      } finally {
        btnSave.disabled = false;
        btnSave.textContent = "Sincronizar Credenciais SMTP";
      }
    };
  }

  // Handle Test Mail Delivery
  if (testForm) {
    testForm.onsubmit = async (e) => {
      e.preventDefault();
      
      if (responseBox) responseBox.classList.add('hidden');

      btnTest.disabled = true;
      btnTest.innerHTML = `<i data-lucide="loader" class="w-4 h-4 text-white animate-spin"></i> <span>Enviando teste de entrega...</span>`;
      if (window.lucide) window.lucide.createIcons();

      const recipient = testRecipientInput.value;

      try {
        const res = await window.apiPost('/api/client/email/test', { test_email: recipient });
        
        if (responseBox) {
          responseBox.classList.remove('hidden');
          if (res && res.ok) {
            // Success
            responseBox.className = "rounded-xl p-3 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold flex items-start gap-2.5";
            responseIcon.setAttribute('data-lucide', 'check-circle-2');
            responseText.textContent = res.message || "Entrega executada com sucesso! Verifique o seu e-mail.";
          } else {
            // Error
            responseBox.className = "rounded-xl p-3 border border-rose-500/20 bg-rose-500/10 text-rose-500 text-[11px] font-semibold flex items-start gap-2.5";
            responseIcon.setAttribute('data-lucide', 'alert-triangle');
            responseText.textContent = res.error || "A verificação SMTP falhou. Conexão terminada pelo host remoto.";
          }
          if (window.lucide) window.lucide.createIcons();
        }
      } catch (err) {
        if (responseBox) {
          responseBox.classList.remove('hidden');
          responseBox.className = "rounded-xl p-3 border border-rose-500/20 bg-rose-500/10 text-rose-500 text-[11px] font-semibold flex items-start gap-2.5";
          responseIcon.setAttribute('data-lucide', 'alert-triangle');
          responseText.textContent = err.message || "Erro de rede no gateway de transporte.";
          if (window.lucide) window.lucide.createIcons();
        }
      } finally {
        btnTest.disabled = false;
        btnTest.innerHTML = `<i data-lucide="mail" class="w-4 h-4 text-indigo-400"></i> <span>Disparar E-mail Teste</span>`;
        if (window.lucide) window.lucide.createIcons();
      }
    };
  }

  // Run initial trigger
  loadSmtpConfig();
}
