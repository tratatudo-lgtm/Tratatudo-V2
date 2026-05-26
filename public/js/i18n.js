/**
 * TrataTudo i18n - Internationalization Library
 */

(function() {
  const LANGS = {
    pt: { name: "Português", flag: "🇵🇹" },
    en: { name: "English", flag: "🇬🇧" },
    es: { name: "Español", flag: "🇪🇸" },
    fr: { name: "Français", flag: "🇫🇷" }
  };

  window.currentLang = localStorage.getItem('tratatudo_lang') || 'pt';
  window.translations = {};

  // Fetch translation file
  async function loadTranslations(lang) {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) throw new Error(`Could not load translations for ${lang}`);
      window.translations = await response.json();
      window.currentLang = lang;
      localStorage.setItem('tratatudo_lang', lang);
    } catch (err) {
      console.error("i18n Error loading translations:", err);
      // Fallback to empty translations to prevent crashes
      window.translations = window.translations || {};
    }
  }

  // Translate a single key
  window.t = function(key, defaultValue = '') {
    return window.translations[key] || defaultValue || key;
  };

  // Translate all elements with data-i18n attributes
  window.translatePage = function() {
    // Standard text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = window.t(key);
      if (translation && translation !== key) {
        // If element contains only text or children that are not tags, replace safely
        if (el.children.length === 0) {
          el.textContent = translation;
        } else {
          // Keep inner icons or elements if present, just replace text node child
          let textNode = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
          if (textNode) {
            textNode.textContent = translation;
          } else {
            // Safe fallback if text node isn't found
            const iconHTML = el.querySelector('i') ? el.querySelector('i').outerHTML : '';
            el.innerHTML = iconHTML + ' ' + translation;
          }
        }
      }
    });

    // Inputs placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = window.t(key);
      if (translation && translation !== key) {
        el.setAttribute('placeholder', translation);
      }
    });

    // Titles or tooltips
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const translation = window.t(key);
      if (translation && translation !== key) {
        el.setAttribute('title', translation);
      }
    });
  };

  // Change active language
  window.changeLanguage = async function(lang) {
    if (!LANGS[lang]) return;
    await loadTranslations(lang);
    window.translatePage();
    
    // Dispatch a custom event for local consumers
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    
    // Update active state in selector dropdown
    updateActiveLanguageUI();
  };

  // Inject a floating language selector into the body
  function injectLangSelector() {
    if (document.getElementById('tratatudo-lang-selector-root')) return;

    const root = document.createElement('div');
    root.id = 'tratatudo-lang-selector-root';
    root.className = 'fixed top-4 right-4 z-[9999]';

    const flagAndCode = LANGS[window.currentLang] ? `${LANGS[window.currentLang].flag} ${window.currentLang.toUpperCase()}` : '🌐';

    root.innerHTML = `
      <div class="relative inline-block text-left">
        <button id="tratatudo-lang-btn" type="button" class="flex items-center gap-2 px-3 py-2 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-white/10 rounded-2xl text-xs font-black text-slate-200 transition-all select-none shadow-lg">
          <span class="text-sm select-none">🌐</span>
          <span id="tratatudo-active-lang" class="font-extrabold tracking-wide uppercase">${flagAndCode}</span>
          <svg class="w-3 h-3 text-slate-400 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div id="tratatudo-lang-dropdown" class="hidden absolute right-0 mt-2 w-40 bg-slate-900/95 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl z-[99999] overflow-hidden transition-all duration-200 origin-top-right transform scale-95 opacity-0">
          <div class="py-1 divide-y divide-white/5">
            ${Object.entries(LANGS).map(([code, info]) => `
              <button onclick="window.changeLanguage('${code}')" class="w-full flex items-center justify-between px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left font-bold ${code === window.currentLang ? 'bg-white/5 text-emerald-400 font-black' : ''}" data-code="${code}">
                <span class="flex items-center gap-2">
                  <span class="text-sm">${info.flag}</span>
                  <span>${info.name}</span>
                </span>
                ${code === window.currentLang ? '<span class="text-emerald-400 font-extrabold">✓</span>' : ''}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    const btn = document.getElementById('tratatudo-lang-btn');
    const dropdown = document.getElementById('tratatudo-lang-dropdown');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = dropdown.classList.contains('hidden');
      if (isHidden) {
        // Open
        dropdown.classList.remove('hidden');
        setTimeout(() => {
          dropdown.classList.remove('scale-95', 'opacity-0');
          dropdown.classList.add('scale-100', 'opacity-100');
          btn.querySelector('svg').classList.add('rotate-180');
        }, 10);
      } else {
        // Close
        closeDropdown();
      }
    });

    document.addEventListener('click', () => {
      closeDropdown();
    });

    function closeDropdown() {
      if (!dropdown) return;
      dropdown.classList.add('scale-95', 'opacity-0');
      dropdown.classList.remove('scale-100', 'opacity-100');
      btn.querySelector('svg').classList.remove('rotate-185');
      btn.querySelector('svg').classList.remove('rotate-180');
      setTimeout(() => {
        dropdown.classList.add('hidden');
      }, 200);
    }
  }

  function updateActiveLanguageUI() {
    const display = document.getElementById('tratatudo-active-lang');
    if (display && LANGS[window.currentLang]) {
      display.textContent = `${LANGS[window.currentLang].flag} ${window.currentLang.toUpperCase()}`;
    }

    // Update checkmarks in dropdown buttons
    document.querySelectorAll('#tratatudo-lang-dropdown button').forEach(btn => {
      const code = btn.getAttribute('data-code');
      btn.classList.remove('bg-white/5', 'text-emerald-400', 'font-black');
      btn.classList.add('text-slate-300');
      
      // remove old checkmark if exists
      const check = btn.querySelector('span:last-child');
      if (check && check.textContent === '✓') {
        check.remove();
      }

      if (code === window.currentLang) {
        btn.classList.add('bg-white/5', 'text-emerald-400', 'font-black');
        btn.classList.remove('text-slate-300');
        const checkSpan = document.createElement('span');
        checkSpan.className = 'text-emerald-400 font-extrabold';
        checkSpan.textContent = '✓';
        btn.appendChild(checkSpan);
      }
    });
  }

  // Initialize function
  async function init() {
    await loadTranslations(window.currentLang);
    window.translatePage();
    injectLangSelector();
  }

  // Auto initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
