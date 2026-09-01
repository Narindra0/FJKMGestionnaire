/*
 * forms.js — Money, dates, phone, fidel lookup, form validation
 * FJKM Malaza Gileada
 */
(function(){

  /* ============================
     MONEY UTILITIES
     ============================ */
  window.formatMoney = function(n){ return formatMoneyInputValue(n) + ' Ar'; };

  function formatMoneyInputValue(value){
    var amount = moneyValue(value);
    var integer = Math.round(Math.abs(amount));
    var grouped = String(integer).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (amount < 0 ? '-' : '') + grouped;
  }

  function moneyValue(value){
    if(value === null || value === undefined || value === '') return 0;
    if(typeof value === 'number') return Number.isFinite(value) ? value : 0;
    var raw = String(value).replace(/\s|Ar|MGA/gi, '').trim();
    if(!raw) return 0;
    var sign = raw.startsWith('-') ? -1 : 1;
    raw = raw.replace(/-/g, '');
    var dots = (raw.match(/\./g) || []).length;
    var commas = (raw.match(/,/g) || []).length;
    if(dots && commas){
      if(raw.lastIndexOf(',') > raw.lastIndexOf('.')) raw = raw.replace(/\./g, '').replace(',', '.');
      else raw = raw.replace(/,/g, '');
    } else if(dots){
      var after = raw.length - raw.lastIndexOf('.') - 1;
      if(dots > 1 || (after === 3 && raw.length > 4)) raw = raw.replace(/\./g, '');
    } else if(commas){
      var afterC = raw.length - raw.lastIndexOf(',') - 1;
      if(commas > 1 || (afterC === 3 && raw.length > 4)) raw = raw.replace(/,/g, '');
      else raw = raw.replace(',', '.');
    }
    var parsed = Number(raw);
    return Number.isFinite(parsed) ? sign * parsed : 0;
  }

  function cssEscape(value){
    if(window.CSS && CSS.escape) return CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function initMoneyInputs(scope){
    var root = scope || document;
    var allowedNames = new Set(['amount','budget','payment_amount','amount_due','amount_paid','obligation_default_amount']);
    root.querySelectorAll('input[name]').forEach(function(input){
      if(input.type === 'hidden' || input.dataset.moneyReady === '1' || !allowedNames.has(input.name)) return;
      input.dataset.moneyReady = '1';
      input.classList.add('money-input');
      input.type = 'text';
      input.inputMode = 'numeric';
      input.autocomplete = 'off';
      input.value = input.value === '' ? '' : formatMoneyInputValue(input.value);
      input.addEventListener('input', function(){
        var caretAtEnd = input.selectionStart === input.value.length;
        var digits = input.value.replace(/\D/g, '');
        input.value = digits ? formatMoneyInputValue(digits) : '';
        if(caretAtEnd) input.setSelectionRange(input.value.length, input.value.length);
      });
      input.addEventListener('blur', function(){ if(input.value !== '') input.value = formatMoneyInputValue(input.value); });
    });
  }

  function formatMoneyInputs(scope){
    var root = scope || document;
    initMoneyInputs(root);
    root.querySelectorAll('input.money-input').forEach(function(input){
      if(input.value !== '') input.value = formatMoneyInputValue(input.value);
    });
  }

  /* ============================
     DATE UTILITIES
     ============================ */
  function parseDateToIso(value){
    var raw = String(value || '').trim();
    if(!raw) return '';
    var match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(match){
      var date = new Date(raw + 'T00:00:00');
      return !Number.isNaN(date.getTime()) && date.getFullYear() === Number(match[1]) && date.getMonth()+1 === Number(match[2]) && date.getDate() === Number(match[3]) ? raw : '';
    }
    match = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if(match){
      var day = Number(match[1]), month = Number(match[2]), year = Number(match[3]);
      var d = new Date(year, month-1, day);
      if(d.getFullYear() !== year || d.getMonth() !== month-1 || d.getDate() !== day) return '';
      return year + '-' + String(month).padStart(2,'0') + '-' + String(day).padStart(2,'0');
    }
    match = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})$/);
    if(!match) return '';
    var day2 = Number(match[1]), month2 = Number(match[2]), shortYear = Number(match[3]);
    var year2 = shortYear < 50 ? 2000 + shortYear : 1900 + shortYear;
    var d2 = new Date(year2, month2-1, day2);
    if(d2.getFullYear() !== year2 || d2.getMonth() !== month2-1 || d2.getDate() !== day2) return '';
    return year2 + '-' + String(month2).padStart(2,'0') + '-' + String(day2).padStart(2,'0');
  }

  function formatDateDisplay(iso){
    var parsed = parseDateToIso(iso);
    return parsed ? parsed.slice(8,10) + '/' + parsed.slice(5,7) + '/' + parsed.slice(0,4) : '';
  }

  function initManualDateInputs(){
    var index = 0;
    document.querySelectorAll('input[type="date"]:not([readonly]):not([data-manual-date-ready])').forEach(function(hidden){
      hidden.dataset.manualDateReady = '1';
      var originalId = hidden.id || ('manualDateValue' + (++index));
      var sourceId = originalId + 'Value';
      hidden.id = sourceId;
      var wasRequired = hidden.required;
      var originalClasses = Array.from(hidden.classList).filter(function(cls){ return cls !== 'date-range-filter'; }).join(' ');
      var isRangeFilter = hidden.classList.contains('date-range-filter');
      var table = hidden.dataset.table || '';
      var dateColumn = hidden.dataset.dateColumn || '';
      hidden.type = 'hidden';
      hidden.required = false;
      if(wasRequired) hidden.dataset.requiredHidden = 'true';
      hidden.classList.remove('date-range-filter');
      hidden.removeAttribute('data-table');
      hidden.removeAttribute('data-date-column');

      var wrapper = document.createElement('div');
      wrapper.className = 'manual-date-field';
      var text = document.createElement('input');
      text.type = 'text'; text.id = originalId; text.className = originalClasses + ' manual-date-text' + (isRangeFilter ? ' date-range-filter' : '');
      text.placeholder = 'jj/mm/aaaa'; text.inputMode = 'numeric'; text.autocomplete = 'off'; text.maxLength = 10;
      if(table) text.dataset.table = table;
      if(dateColumn) text.dataset.dateColumn = dateColumn;
      text.dataset.dateValueSelector = '#' + sourceId;
      text.value = formatDateDisplay(hidden.value);
      var icon = document.createElement('i'); icon.className = 'bi bi-calendar3 manual-date-icon'; icon.setAttribute('aria-hidden','true');
      var picker = document.createElement('input'); picker.type = 'date'; picker.className = 'manual-date-native'; picker.value = hidden.value || '';
      picker.setAttribute('aria-label', 'Choisir une date');
      hidden.parentNode.insertBefore(wrapper, hidden);
      wrapper.appendChild(text); wrapper.appendChild(icon); wrapper.appendChild(picker); wrapper.appendChild(hidden);
      var sync = function(fromPicker){
        var candidate = fromPicker ? picker.value : text.value;
        var iso = parseDateToIso(candidate);
        hidden.value = iso;
        if(iso){ text.value = formatDateDisplay(iso); picker.value = iso; text.classList.remove('is-invalid'); }
        else if(String(candidate || '').trim() !== '') text.classList.add('is-invalid');
        else text.classList.remove('is-invalid');
      };
      text.addEventListener('input', function(){
        var digits = text.value.replace(/\D/g, '').slice(0, 8);
        var formatted = '';
        for(var i = 0; i < digits.length; i++){
          if(i === 2 || i === 4) formatted += '/';
          formatted += digits[i];
        }
        text.value = formatted;
        sync(false);
      });
      text.addEventListener('blur', function(){
        var parts = text.value.split('/');
        if(parts.length === 3 && parts[2].length === 2){
          var yy = parseInt(parts[2], 10);
          var yyyy = yy < 50 ? 2000 + yy : 1900 + yy;
          text.value = parts[0] + '/' + parts[1] + '/' + yyyy;
        }
        sync(false);
      });
      picker.addEventListener('change', function(){ sync(true); text.dispatchEvent(new Event('change', {bubbles:true})); });
      text.addEventListener('change', function(){ if(isRangeFilter) window.FJKM_applyTableFilters(table); });
    });
  }

  function syncManualDateInputs(scope, refreshOnly){
    var root = scope || document;
    root.querySelectorAll('.manual-date-text[data-date-value-selector]').forEach(function(text){
      var hidden = document.querySelector(text.dataset.dateValueSelector);
      if(!hidden) return;
      if(refreshOnly && hidden.value){ text.value = formatDateDisplay(hidden.value); return; }
      var typedIso = parseDateToIso(text.value);
      if(typedIso){ hidden.value = typedIso; text.value = formatDateDisplay(typedIso); text.classList.remove('is-invalid'); }
      else if(String(text.value || '').trim() === '') { hidden.value = ''; text.classList.remove('is-invalid'); }
      else { hidden.value = ''; text.classList.add('is-invalid'); }
    });
  }

  /* ============================
     PHONE INPUT
     ============================ */
  function initPhoneInput(input){
    input.addEventListener('input', function(){
      var digits = input.value.replace(/\D/g, '').slice(0, 10);
      var parts = [];
      if(digits.length) parts.push(digits.slice(0,3));
      if(digits.length > 3) parts.push(digits.slice(3,5));
      if(digits.length > 5) parts.push(digits.slice(5,8));
      if(digits.length > 8) parts.push(digits.slice(8,10));
      input.value = parts.filter(Boolean).join('.');
    });
  }

  /* ============================
     FIDEL LOOKUP
     ============================ */
  function initFidelLookup(input){
    var hiddenSelector = input.getAttribute('data-hidden');
    var hidden = hiddenSelector ? document.querySelector(hiddenSelector) : null;
    var listId = input.getAttribute('list');
    var dataList = listId ? document.getElementById(listId) : null;
    if(!hidden || !dataList) return;
    var sync = function(){
      var value = input.value.trim().toLowerCase();
      hidden.value = '';
      Array.from(dataList.options).some(function(opt){
        var optValue = (opt.value || '').trim().toLowerCase();
        var matricule = (opt.dataset.matricule || '').trim().toLowerCase();
        var name = (opt.dataset.name || '').trim().toLowerCase();
        if(value === optValue || value === matricule || value === name || optValue.startsWith(value) || matricule.startsWith(value) || name.startsWith(value)){
          hidden.value = opt.dataset.id || '';
          return true;
        }
        return false;
      });
    };
    input.addEventListener('input', sync);
    input.addEventListener('change', sync);
    input.addEventListener('blur', sync);
  }

  /* ============================
     EXPORTS
     ============================ */
  window.FJKM_formatMoneyInputValue = formatMoneyInputValue;
  window.FJKM_moneyValue = moneyValue;
  window.FJKM_cssEscape = cssEscape;
  window.FJKM_initMoneyInputs = initMoneyInputs;
  window.FJKM_formatMoneyInputs = formatMoneyInputs;
  window.FJKM_parseDateToIso = parseDateToIso;
  window.FJKM_formatDateDisplay = formatDateDisplay;
  window.FJKM_initManualDateInputs = initManualDateInputs;
  window.FJKM_syncManualDateInputs = syncManualDateInputs;
  window.FJKM_initPhoneInput = initPhoneInput;
  window.FJKM_initFidelLookup = initFidelLookup;
})();
