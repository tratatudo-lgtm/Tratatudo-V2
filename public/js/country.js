/**
 * TrataTudo Country Selector for OTP Login Page
 */

(function() {
  const COUNTRIES = [
    { code: 'PT', dial: '351', flag: '🇵🇹', name: 'Portugal' },
    { code: 'BR', dial: '55', flag: '🇧🇷', name: 'Brasil' },
    { code: 'ES', dial: '34', flag: '🇪🇸', name: 'España' },
    { code: 'FR', dial: '33', flag: '🇫🇷', name: 'France' },
    { code: 'GB', dial: '44', flag: '🇬🇧', name: 'United Kingdom' },
    { code: 'US', dial: '1', flag: '🇺🇸', name: 'United States' },
    { code: 'DE', dial: '49', flag: '🇩🇪', name: 'Deutschland' },
    { code: 'AO', dial: '244', flag: '🇦🇴', name: 'Angola' },
    { code: 'MZ', dial: '258', flag: '🇲🇿', name: 'Moçambique' },
    { code: 'CV', dial: '238', flag: '🇨🇻', name: 'Cabo Verde' },
    { code: 'CH', dial: '41', flag: '🇨🇭', name: 'Suisse' },
    { code: 'LU', dial: '352', flag: '🇱🇺', name: 'Luxembourg' }
  ];

  let selectedCountry = COUNTRIES[0]; // Portugal default

  // Automatically detect IP on load
  async function detectCountryByIP() {
    try {
      const resp = await fetch('https://ipapi.co/json/');
      if (resp.ok) {
        const info = await resp.json();
        const found = COUNTRIES.find(c => c.code.toUpperCase() === info.country_code?.toUpperCase());
        if (found) {
          selectCountry(found);
        }
      }
    } catch (err) {
      console.log("Country IP detection failed, defaulting to PT (+351)");
    }
  }

  function selectCountry(country) {
    selectedCountry = country;
    const flagEl = document.getElementById('active-country-flag');
    const dialEl = document.getElementById('active-country-dial');
    if (flagEl) flagEl.textContent = country.flag;
    if (dialEl) dialEl.textContent = '+' + country.dial;
    
    // Dispatch countryChanged event
    window.dispatchEvent(new CustomEvent('countryChanged', { detail: country }));
  }

  function filterCountries(query) {
    const listContainer = document.getElementById('countries-list-container');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const filtered = COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) || 
      c.dial.includes(query) ||
      c.code.toLowerCase().includes(query.toLowerCase())
    );

    filtered.forEach(c => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'w-full flex items-center justify-between px-3.5 py-2.5 text-slate-300 hover:bg-white/5 hover:text-white text-left transition-colors font-semibold text-xs';
      btn.innerHTML = `
        <span class="flex items-center gap-2">
          <span>${c.flag}</span>
          <span>${c.name}</span>
        </span>
        <span class="text-slate-500 font-extrabold">+${c.dial}</span>
      `;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectCountry(c);
        toggleDropdown(false);
      });
      listContainer.appendChild(btn);
    });
  }

  function toggleDropdown(show) {
    const list = document.getElementById('country-dropdown-list');
    const btn = document.getElementById('selected-country-btn');
    if (!list) return;

    if (show) {
      list.classList.remove('hidden');
      if (btn) btn.querySelector('svg').classList.add('rotate-180');
      const search = document.getElementById('country-search');
      if (search) {
        search.value = '';
        search.focus();
        filterCountries('');
      }
    } else {
      list.classList.add('hidden');
      if (btn) btn.querySelector('svg').classList.remove('rotate-180');
    }
  }

  window.getSelectedCountryPhone = function() {
    const phoneInput = document.getElementById('phone');
    if (!phoneInput) return '';
    let val = phoneInput.value.trim();
    if (!val) return '';

    // If phone number already has a +, return as is
    if (val.startsWith('+')) return val;

    // Normalize phone (strip spaces/dashes)
    let cleanVal = val.replace(/[\s\(\)\-\.]/g, '');
    
    // If it starts with 00, replace with +
    if (cleanVal.startsWith('00')) return '+' + cleanVal.slice(2);

    // If it starts with the selected country dial prefix, prepend +
    if (cleanVal.startsWith(selectedCountry.dial)) return '+' + cleanVal;

    // Otherwise, prependselected country dial prefix
    return `+${selectedCountry.dial}${cleanVal}`;
  };

  function initCountrySelector() {
    const btn = document.getElementById('selected-country-btn');
    const dropdownList = document.getElementById('country-dropdown-list');
    const search = document.getElementById('country-search');

    if (!btn || !dropdownList) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = dropdownList.classList.contains('hidden');
      toggleDropdown(isHidden);
    });

    document.addEventListener('click', () => {
      toggleDropdown(false);
    });

    if (search) {
      search.addEventListener('input', (e) => {
        filterCountries(e.target.value);
      });
      search.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Load initial list
    filterCountries('');
    // Detect location automatically
    detectCountryByIP();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCountrySelector);
  } else {
    initCountrySelector();
  }
})();
