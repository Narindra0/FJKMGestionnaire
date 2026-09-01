/*
 | Commentaire technique
 | Ce fichier contient les scripts JavaScript de l'interface : il améliore l'interactivité côté navigateur.
 */
/*
 * JavaScript principal FJKM
 * - Mode sombre
 * - Affichage/masquage du mot de passe avec petit œil
 * - Validation des champs obligatoires avec notification
 * - Recherches instantanées via jQuery/AJAX
 * - Sélection tapable des Christiane par matricule/nom
 * - Filtres entre deux dates et impression des lignes filtrées
 */
(function(){
  let communionHistoryCache = [];
  // Disponible dès l'initialisation pour les totaux affichés au chargement.
  window.formatMoney = function(n){ return formatMoneyInputValue(n) + ' Ar'; };

  if(localStorage.getItem('fjkm-dark') === '1'){
    document.body.classList.add('dark-mode');
    const icon = document.querySelector('#darkModeToggle i');
    if(icon) icon.className = 'bi bi-sun';
  }
  initSidebarToggle();
  initActiveSidebar();
  prepareResponsiveInterface();
  observeResponsiveContent();

  document.addEventListener('click', function(e){
    const selectAllMonths = e.target.closest('.month-filter-select-all');
    if(selectAllMonths){
      e.preventDefault();
      document.querySelectorAll('.month-filter-checkbox[data-table="' + selectAllMonths.dataset.table + '"]').forEach(function(box){ box.checked = true; });
      refreshMonthPeriodLabel(selectAllMonths.dataset.table);
      applyTableFilters(selectAllMonths.dataset.table);
      return;
    }
    const clearMonths = e.target.closest('.month-filter-clear');
    if(clearMonths){
      e.preventDefault();
      document.querySelectorAll('.month-filter-checkbox[data-table="' + clearMonths.dataset.table + '"]').forEach(function(box){ box.checked = false; });
      refreshMonthPeriodLabel(clearMonths.dataset.table);
      applyTableFilters(clearMonths.dataset.table);
      return;
    }
    const resetTableFilters = e.target.closest('.reset-table-filters');
    if(resetTableFilters){
      e.preventDefault();
      resetTableFiltersFor(resetTableFilters.dataset.table || '');
      return;
    }
    const toggle = e.target.closest('.password-toggle');
    if(toggle){
      const input = document.querySelector(toggle.dataset.target);
      if(input){
        input.type = input.type === 'password' ? 'text' : 'password';
        toggle.classList.toggle('is-visible', input.type === 'text');
        toggle.setAttribute('aria-label', input.type === 'password' ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
      }
    }
    if(e.target.id === 'darkModeToggle'){
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('fjkm-dark', document.body.classList.contains('dark-mode') ? '1' : '0');
      // Update icon
      const icon = document.querySelector('#darkModeToggle i');
      if(icon) icon.className = document.body.classList.contains('dark-mode') ? 'bi bi-sun' : 'bi bi-moon-stars';
    }
    const edit = e.target.closest('.edit-to-form');
    if(edit){
      e.preventDefault();
      fillTopForm(edit);
    }
    const reset = e.target.closest('[data-reset-form]');
    if(reset){
      e.preventDefault();
      resetTopForm(reset);
    }
    const printFiltered = e.target.closest('.print-filtered-table');
    if(printFiltered){
      e.preventDefault();
      printFilteredTable(printFiltered);
    }
    const rowPrint = e.target.closest('.print-row');
    if(rowPrint){
      e.preventDefault();
      e.stopImmediatePropagation();
      printSingleRow(rowPrint);
      return;
    }
    const profilePrint = e.target.closest('[data-print-member-profile]');
    if(profilePrint){
      e.preventDefault();
      printMemberProfile(profilePrint.dataset.printMemberProfile || '#memberPrintInfo');
      return;
    }
    const historiesPrint = e.target.closest('[data-print-member-histories]');
    if(historiesPrint){
      e.preventDefault();
      printMemberHistories();
    }
  });

  document.addEventListener('input', function(e){
    const target = e.target;
    if(target && (target.classList.contains('table-filter') || target.classList.contains('date-range-filter') || target.classList.contains('month-filter-checkbox'))){
      if(target.classList.contains('month-filter-checkbox')) refreshMonthPeriodLabel(target.dataset.table);
      applyTableFilters(target.dataset.table);
    }
  });
  document.addEventListener('change', function(e){
    const target = e.target;
    if(target && (target.classList.contains('table-filter') || target.classList.contains('date-range-filter') || target.classList.contains('month-filter-checkbox'))){
      if(target.classList.contains('month-filter-checkbox')) refreshMonthPeriodLabel(target.dataset.table);
      applyTableFilters(target.dataset.table);
    }
  });

  document.addEventListener('submit', function(e){
    if(e.target && e.target.tagName === 'FORM'){
      syncManualDateInputs(e.target);
      formatMoneyInputs(e.target);
    }
  }, true);

  document.querySelectorAll('form.needs-validation').forEach(function(form){
    form.addEventListener('submit', function(event){
      syncManualDateInputs(form);
      formatMoneyInputs(form);
      if(form.id === 'obligationForm' && !validateObligationPaymentBeforeSubmit(form, event)){
        form.classList.add('was-validated');
        return;
      }
      if(form.id === 'projectPaymentForm' && !validateProjectPaymentBeforeSubmit(form, event)){
        form.classList.add('was-validated');
        return;
      }
      let hiddenOk = true;
      form.querySelectorAll('[data-required-hidden="true"]').forEach(function(hidden){
        if(!hidden.value){ hiddenOk = false; }
      });
      if(!form.checkValidity() || !hiddenOk){
        event.preventDefault();
        event.stopPropagation();
        notifyError('Champ obligatoire', 'Veuillez remplir ce champ avant de continuer.');
      }
      form.classList.add('was-validated');
    });
  });

  initManualDateInputs();
  initMoneyInputs();
  document.querySelectorAll('.fidel-lookup').forEach(initFidelLookup);
  document.querySelectorAll('.phone-input').forEach(initPhoneInput);
  initProjectPaymentSelect();
  document.querySelectorAll('.print-clean-table').forEach(updateTableTotal);

  window.printMemberProfile = printMemberProfile;
  window.printMemberHistories = printMemberHistories;
  window.printFilteredTable = printFilteredTable;

  if(!window.jQuery) return;

  $(function(){
    $('.data-table:not(.no-datatables)').DataTable({pageLength:10, searching:false, lengthChange:false, language:{url:'https://cdn.datatables.net/plug-ins/2.0.8/i18n/fr-FR.json'}});

    const csrf = $('meta[name="csrf-token"]').attr('content');
    if(csrf) $.ajaxSetup({headers:{'X-CSRF-TOKEN':csrf}});

    $('#fidelSearch').on('keyup', function(){
      const q = this.value;
      $.get(baseUrl('api/fideles/search'), {q}, function(res){
        if(!res.success) return;
        $('#fidelesBody').html(res.data.map(f => `<tr data-created="${escapeHtml((f.created_at||'').slice(0,10))}"><td>${escapeHtml((f.created_at||'').slice(0,10))}</td><td>${escapeHtml(f.matricule)}</td><td>${escapeHtml(f.full_name)}</td><td>${escapeHtml(f.group_name||'')}</td><td>${escapeHtml(f.phone||'')}</td><td>${f.baptized_at||'-'}</td><td>${f.communion_at||'-'}</td><td><span class="badge text-bg-${f.status === 'active' ? 'success' : 'secondary'}">${escapeHtml(f.status === 'active' ? 'Actif' : 'Inactif')}</span></td><td><button type="button" class="btn btn-sm btn-outline-primary view-member" title="Voir" data-bs-toggle="modal" data-bs-target="#christianeViewModal" data-values='${escapeHtml(JSON.stringify({matricule:f.matricule,full_name:f.full_name,gender:f.gender,group_name:f.group_name,phone:f.phone,birth_date:f.birth_date,baptized_at:f.baptized_at,communion_at:f.communion_at,status:f.status,address:f.address,created_date:(f.created_at||'').slice(0,10)}))}' data-photo="${f.photo ? baseUrl('public/'+f.photo) : ''}"><i class="bi bi-eye"></i></button></td></tr>`).join(''));
        prepareResponsiveInterface(document.getElementById('fidelesBody')?.closest('table') || document);
      });
    });

    $('#financeSearch').on('keyup', function(){
      const q = this.value;
      $.get(baseUrl('api/finance/search'), {q}, function(res){
        if(!res.success) return;
        $('#entriesBody').html(res.entries.map(r => `<tr><td>${r.operation_date}</td><td>${escapeHtml(r.reference||'')}</td><td>${escapeHtml(r.label)}</td><td>${escapeHtml(r.category||'')}</td><td>${escapeHtml(r.payment_method||'')}</td><td>${formatMoney(r.amount)}</td></tr>`).join(''));
        $('#exitsBody').html(res.exits.map(r => `<tr><td>${r.operation_date}</td><td>${escapeHtml(r.reference||'')}</td><td>${escapeHtml(r.label)}</td><td>${escapeHtml(r.category||'')}</td><td>${escapeHtml(r.beneficiary||'')}</td><td>${formatMoney(r.amount)}</td></tr>`).join(''));
        prepareResponsiveInterface(document.getElementById('entriesBody')?.closest('table') || document);
        prepareResponsiveInterface(document.getElementById('exitsBody')?.closest('table') || document);
      });
    });

    $('#obligationFidelLookup, #obligationMonth, #obligationYear').on('change keyup input', debounce(loadObligationRest, 300));

    $('#selectAllMonths').on('click', function(){
      const boxes = $('.communion-month').filter(function(){ return !this.disabled && $(this).closest('.month-box').is(':visible'); });
      const shouldCheck = boxes.filter(':checked').length !== boxes.length;
      boxes.prop('checked', shouldCheck);
    });

    $('#communionFidelLookup').on('change keyup', debounce(loadCommunionHistory, 300));
    $('#communionYear').on('change input', function(){ applyCommunionPaidMonths(communionHistoryCache); });

    $('.table-filter, .date-range-filter').on('input change', function(){
      applyTableFilters($(this).data('table'));
    });
    document.querySelectorAll('table').forEach(updateTableTotal);

  });

  function fillTopForm(button){
    const form = document.querySelector(button.dataset.form || '');
    if(!form) return;
    const values = JSON.parse(button.dataset.values || '{}');
    const action = button.dataset.action;
    if(action) form.setAttribute('action', action);

    Object.keys(values).forEach(function(name){
      let fields = form.querySelectorAll('[name="' + cssEscape(name) + '"]');
      if(!fields.length){
        if(name === 'fidel_id') fields = form.querySelectorAll('#obligationFidelId,#communionFidelId');
        if(name === 'existing_obligation_id') fields = form.querySelectorAll('#existingObligationId');
        if(name === 'amount_paid') fields = form.querySelectorAll('#obligationPaidHidden');
      }
      fields.forEach(function(field){
        const value = values[name] ?? '';
        if(field.type === 'checkbox') field.checked = Array.isArray(value) ? value.includes(field.value) : String(field.value) === String(value);
        else field.value = value;
      });
    });

    if(values.paid_year && form.querySelector('[name="year"]')){
      const yearInput = form.querySelector('[name="year"]');
      if(yearInput) yearInput.value = values.paid_year;
    }
    if(values.paid_month){
      form.querySelectorAll('.month-box').forEach(function(box){ box.classList.remove('d-none'); });
      form.querySelectorAll('.communion-month').forEach(function(cb){ cb.disabled = false; cb.checked = cb.value === String(values.paid_month); });
    }
    if(values.amount_paid !== undefined){
      const payment = form.querySelector('[name="payment_amount"]');
      if(payment) payment.value = values.amount_paid;
    }
    if(values.amount_due !== undefined && values.amount_paid !== undefined){
      const restValue = Math.max(0, Number(values.amount_due || 0) - Number(values.amount_paid || 0));
      const rest = form.querySelector('#obligationRest');
      if(rest) rest.value = window.formatMoney(restValue);
      const pay = form.querySelector('#obligationPayment');
      if(pay) pay.setAttribute('max', restValue);
    }

    const submit = document.querySelector(button.dataset.submit || '');
    if(submit && button.dataset.submitText) submit.textContent = button.dataset.submitText;
    const title = document.querySelector(button.dataset.title || '');
    if(title && button.dataset.titleText) title.childNodes[0].nodeValue = button.dataset.titleText + ' ';
    syncManualDateInputs(form, true);
    formatMoneyInputs(form);
    form.querySelectorAll('[data-reset-form]').forEach(function(btn){ btn.classList.remove('d-none'); });
    form.classList.remove('was-validated');
    const scrollTarget = document.querySelector(button.dataset.scroll || button.dataset.form || '');
    if(scrollTarget) scrollTarget.scrollIntoView({behavior:'smooth', block:'start'});
  }

  function resetTopForm(button){
    const form = document.querySelector(button.dataset.resetForm || '');
    if(!form) return;
    form.setAttribute('action', form.dataset.createAction || form.getAttribute('action'));
    form.reset();
    form.classList.remove('was-validated');
    form.querySelectorAll('[data-default-value]').forEach(function(input){ input.value = input.dataset.defaultValue || ''; });
    form.querySelectorAll('[data-required-hidden="true"], #existingObligationId, #obligationPaidHidden').forEach(function(input){ input.value = ''; });
    form.querySelectorAll('.month-box').forEach(function(box){ box.classList.remove('d-none'); });
    form.querySelectorAll('.communion-month').forEach(function(cb){ cb.disabled = false; cb.checked = false; });
    communionHistoryCache = [];
    const title = document.querySelector(button.dataset.title || '');
    if(title && button.dataset.titleText) title.childNodes[0].nodeValue = button.dataset.titleText + ' ';
    const submit = form.querySelector('button[type="submit"], button:not([type])');
    if(submit) submit.textContent = submit.dataset.defaultText || 'Enregistrer';
    button.classList.add('d-none');
    const rest = form.querySelector('#obligationRest');
    if(rest) rest.value = '0 Ar';
    syncManualDateInputs(form, true);
    formatMoneyInputs(form);
    const history = document.getElementById('communionHistory');
    if(history){ history.className='alert alert-info py-2 mb-3 d-none'; history.textContent=''; }
  }


  function initSidebarToggle(){
    const toggle = document.getElementById('sidebarToggle');
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('mainSidebar');
    const nav = sidebar ? sidebar.querySelector('.sidebar-nav') : null;
    if(!sidebar) return;

    // Restaurer l'état desktop depuis localStorage
    if(localStorage.getItem('fjkm-sidebar') === 'collapsed'){
      sidebar.classList.add('collapsed');
    }

    // Toggle desktop (réduire/étendre)
    if(toggle){
      toggle.addEventListener('click', function(){
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('fjkm-sidebar', sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded');
        window.dispatchEvent(new Event('resize'));
      });
    }

    // Toggle mobile (ouvrir/fermer le menu)
    var overlay = document.getElementById('sidebarOverlay');
    if(mobileToggle){
      mobileToggle.addEventListener('click', function(){
        sidebar.classList.toggle('mobile-open');
        if(overlay) overlay.classList.toggle('active', sidebar.classList.contains('mobile-open'));
      });
      if(overlay){
        overlay.addEventListener('click', function(){
          sidebar.classList.remove('mobile-open');
          overlay.classList.remove('active');
        });
      }
      // Fermer le menu mobile après avoir cliqué sur un lien
      sidebar.querySelectorAll('.nav-link').forEach(function(link){
        link.addEventListener('click', function(){
          sidebar.classList.remove('mobile-open');
          if(overlay) overlay.classList.remove('active');
        });
      });
    }
  }

  function initActiveSidebar(){
    const links = document.querySelectorAll('.sidebar nav a');
    const current = window.location.pathname.replace(/\/public\/?$/, '').replace(/\/$/, '');
    links.forEach(function(a){
      var target = new URL(a.getAttribute('href'), window.location.origin).pathname.replace(/\/public\/?$/, '').replace(/\/$/, '');
      if(current === target || (target && target !== '/' && current.startsWith(target + '/'))){
        a.classList.add('active');
      }
    });

    // Restaurer la position de scroll du sidebar
    var nav = document.querySelector('.sidebar-nav');
    if(nav){
      var savedScroll = sessionStorage.getItem('fjkm-sidebar-scroll');
      if(savedScroll) nav.scrollTop = parseInt(savedScroll, 10);
    }

    // Sauvegarder la position de scroll avant chaque clic sur un lien du sidebar
    links.forEach(function(a){
      a.addEventListener('click', function(){
        var n = document.querySelector('.sidebar-nav');
        if(n) sessionStorage.setItem('fjkm-sidebar-scroll', String(n.scrollTop));
      });
    });
  }


  // Responsive global : ajoute les classes utiles sans modifier les vues PHP.
  // Les tableaux reçoivent automatiquement des libellés afin de devenir des cartes sur téléphone.
  function prepareResponsiveInterface(scope){
    const root = scope || document;
    const forms = [];
    const tables = [];

    if(root.matches && root.matches('form.row')) forms.push(root);
    if(root.querySelectorAll) forms.push.apply(forms, Array.from(root.querySelectorAll('form.row')));
    forms.forEach(function(form){
      form.classList.add('responsive-form');
    });

    if(root.matches && root.matches('table.table')) tables.push(root);
    if(root.querySelectorAll) tables.push.apply(tables, Array.from(root.querySelectorAll('table.table')));
    Array.from(new Set(tables)).forEach(function(table){
      const headers = Array.from(table.querySelectorAll('thead th')).map(function(th){
        return th.textContent.replace(/\s+/g, ' ').trim();
      });
      if(!headers.length) return;

      table.classList.add('responsive-card-table');
      table.querySelectorAll('tbody tr, tfoot tr').forEach(function(row){
        Array.from(row.children).forEach(function(cell, index){
          if(cell.getAttribute('colspan')) return;
          if(!cell.getAttribute('data-label')){
            cell.setAttribute('data-label', headers[index] || 'Information');
          }
        });
      });
    });
  }

  // Les recherches AJAX remplacent parfois le contenu des tableaux.
  // L'observateur remet automatiquement les libellés responsive sur les nouvelles lignes.
  function observeResponsiveContent(){
    if(!window.MutationObserver) return;
    const target = document.querySelector('.page-content') || document.body;
    const refresh = debounce(function(){ prepareResponsiveInterface(target); }, 120);
    new MutationObserver(function(mutations){
      const hasUsefulChange = mutations.some(function(mutation){
        return Array.from(mutation.addedNodes || []).some(function(node){
          if(node.nodeType !== 1) return false;
          const isTarget = typeof node.matches === 'function' && node.matches('table, tbody, tr, td, form');
          const containsTarget = typeof node.querySelector === 'function' && node.querySelector('table, tbody, tr, td, form');
          return isTarget || containsTarget;
        });
      });
      if(hasUsefulChange) refresh();
    }).observe(target, {childList:true, subtree:true});
  }

  function cssEscape(value){
    if(window.CSS && CSS.escape) return CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function formatMoneyInputValue(value){
    const amount = moneyValue(value);
    const integer = Math.round(Math.abs(amount));
    const grouped = String(integer).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (amount < 0 ? '-' : '') + grouped;
  }

  function moneyValue(value){
    if(value === null || value === undefined || value === '') return 0;
    if(typeof value === 'number') return Number.isFinite(value) ? value : 0;
    let raw = String(value).replace(/\s|Ar|MGA/gi, '').trim();
    if(!raw) return 0;
    const sign = raw.startsWith('-') ? -1 : 1;
    raw = raw.replace(/-/g, '');
    const dots = (raw.match(/\./g) || []).length;
    const commas = (raw.match(/,/g) || []).length;
    if(dots && commas){
      if(raw.lastIndexOf(',') > raw.lastIndexOf('.')) raw = raw.replace(/\./g, '').replace(',', '.');
      else raw = raw.replace(/,/g, '');
    } else if(dots){
      const after = raw.length - raw.lastIndexOf('.') - 1;
      if(dots > 1 || (after === 3 && raw.length > 4)) raw = raw.replace(/\./g, '');
    } else if(commas){
      const after = raw.length - raw.lastIndexOf(',') - 1;
      if(commas > 1 || (after === 3 && raw.length > 4)) raw = raw.replace(/,/g, '');
      else raw = raw.replace(',', '.');
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? sign * parsed : 0;
  }

  function initMoneyInputs(scope){
    const root = scope || document;
    const allowedNames = new Set(['amount','budget','payment_amount','amount_due','amount_paid','obligation_default_amount']);
    root.querySelectorAll('input[name]').forEach(function(input){
      if(input.type === 'hidden' || input.dataset.moneyReady === '1' || !allowedNames.has(input.name)) return;
      input.dataset.moneyReady = '1';
      input.classList.add('money-input');
      input.type = 'text';
      input.inputMode = 'numeric';
      input.autocomplete = 'off';
      input.value = input.value === '' ? '' : formatMoneyInputValue(input.value);
      input.addEventListener('input', function(){
        const caretAtEnd = input.selectionStart === input.value.length;
        const digits = input.value.replace(/\D/g, '');
        input.value = digits ? formatMoneyInputValue(digits) : '';
        if(caretAtEnd) input.setSelectionRange(input.value.length, input.value.length);
      });
      input.addEventListener('blur', function(){ if(input.value !== '') input.value = formatMoneyInputValue(input.value); });
    });
  }

  function formatMoneyInputs(scope){
    const root = scope || document;
    initMoneyInputs(root);
    root.querySelectorAll('input.money-input').forEach(function(input){
      if(input.value !== '') input.value = formatMoneyInputValue(input.value);
    });
  }

  function parseDateToIso(value){
    const raw = String(value || '').trim();
    if(!raw) return '';
    let match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(match){
      const iso = raw;
      const date = new Date(iso + 'T00:00:00');
      return !Number.isNaN(date.getTime()) && date.getFullYear() === Number(match[1]) && date.getMonth()+1 === Number(match[2]) && date.getDate() === Number(match[3]) ? iso : '';
    }
    match = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if(match){
      const day = Number(match[1]), month = Number(match[2]), year = Number(match[3]);
      const date = new Date(year, month-1, day);
      if(date.getFullYear() !== year || date.getMonth() !== month-1 || date.getDate() !== day) return '';
      return year + '-' + String(month).padStart(2,'0') + '-' + String(day).padStart(2,'0');
    }
    match = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})$/);
    if(!match) return '';
    var day = Number(match[1]), month = Number(match[2]), shortYear = Number(match[3]);
    var year = shortYear < 50 ? 2000 + shortYear : 1900 + shortYear;
    var date = new Date(year, month-1, day);
    if(date.getFullYear() !== year || date.getMonth() !== month-1 || date.getDate() !== day) return '';
    return year + '-' + String(month).padStart(2,'0') + '-' + String(day).padStart(2,'0');
  }

  function formatDateDisplay(iso){
    const parsed = parseDateToIso(iso);
    return parsed ? parsed.slice(8,10) + '/' + parsed.slice(5,7) + '/' + parsed.slice(0,4) : '';
  }

  function initManualDateInputs(){
    let index = 0;
    document.querySelectorAll('input[type="date"]:not([readonly]):not([data-manual-date-ready])').forEach(function(hidden){
      hidden.dataset.manualDateReady = '1';
      const originalId = hidden.id || ('manualDateValue' + (++index));
      const sourceId = originalId + 'Value';
      hidden.id = sourceId;
      const wasRequired = hidden.required;
      const originalClasses = Array.from(hidden.classList).filter(function(cls){ return cls !== 'date-range-filter'; }).join(' ');
      const isRangeFilter = hidden.classList.contains('date-range-filter');
      const table = hidden.dataset.table || '';
      const dateColumn = hidden.dataset.dateColumn || '';
      hidden.type = 'hidden';
      hidden.required = false;
      if(wasRequired) hidden.dataset.requiredHidden = 'true';
      hidden.classList.remove('date-range-filter');
      hidden.removeAttribute('data-table');
      hidden.removeAttribute('data-date-column');

      const wrapper = document.createElement('div');
      wrapper.className = 'manual-date-field';
      const text = document.createElement('input');
      text.type = 'text'; text.id = originalId; text.className = originalClasses + ' manual-date-text' + (isRangeFilter ? ' date-range-filter' : '');
      text.placeholder = 'jj/mm/aaaa'; text.inputMode = 'numeric'; text.autocomplete = 'off'; text.maxLength = 10;
      if(table) text.dataset.table = table;
      if(dateColumn) text.dataset.dateColumn = dateColumn;
      text.dataset.dateValueSelector = '#' + sourceId;
      text.value = formatDateDisplay(hidden.value);
      const icon = document.createElement('i'); icon.className = 'bi bi-calendar3 manual-date-icon'; icon.setAttribute('aria-hidden','true');
      const picker = document.createElement('input');
      picker.type = 'date'; picker.className = 'manual-date-native'; picker.value = hidden.value || '';
      picker.setAttribute('aria-label', 'Choisir une date');
      hidden.parentNode.insertBefore(wrapper, hidden);
      wrapper.appendChild(text); wrapper.appendChild(icon); wrapper.appendChild(picker); wrapper.appendChild(hidden);
      const sync = function(fromPicker){
        const candidate = fromPicker ? picker.value : text.value;
        const iso = parseDateToIso(candidate);
        hidden.value = iso;
        if(iso){ text.value = formatDateDisplay(iso); picker.value = iso; text.classList.remove('is-invalid'); }
        else if(String(candidate || '').trim() !== '') text.classList.add('is-invalid');
        else text.classList.remove('is-invalid');
      };
      text.addEventListener('input', function(){
        // Auto-format date saisie : 171221 → 17/12/21
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
        // Au blur, étendre l'année sur 4 chiffres si besoin (21 → 2021)
        var parts = text.value.split('/');
        if(parts.length === 3 && parts[2].length === 2){
          var yy = parseInt(parts[2], 10);
          var yyyy = yy < 50 ? 2000 + yy : 1900 + yy;
          text.value = parts[0] + '/' + parts[1] + '/' + yyyy;
        }
        sync(false);
      });
      picker.addEventListener('change', function(){ sync(true); text.dispatchEvent(new Event('change', {bubbles:true})); });
      text.addEventListener('change', function(){ if(isRangeFilter) applyTableFilters(table); });
    });
  }

  function syncManualDateInputs(scope, refreshOnly){
    const root = scope || document;
    root.querySelectorAll('.manual-date-text[data-date-value-selector]').forEach(function(text){
      const hidden = document.querySelector(text.dataset.dateValueSelector);
      if(!hidden) return;
      if(refreshOnly && hidden.value){ text.value = formatDateDisplay(hidden.value); return; }
      const typedIso = parseDateToIso(text.value);
      if(typedIso){ hidden.value = typedIso; text.value = formatDateDisplay(typedIso); text.classList.remove('is-invalid'); }
      else if(String(text.value || '').trim() === '') { hidden.value = ''; text.classList.remove('is-invalid'); }
      else { hidden.value = ''; text.classList.add('is-invalid'); }
    });
  }

  function resetTableFiltersFor(selector){
    if(!selector) return;

    document.querySelectorAll('.table-filter[data-table="' + selector + '"]').forEach(function(input){
      input.value = '';
    });

    document.querySelectorAll('.date-range-filter[data-table="' + selector + '"]').forEach(function(input){
      input.value = '';
      const hidden = input.dataset.dateValueSelector ? document.querySelector(input.dataset.dateValueSelector) : null;
      if(hidden) hidden.value = '';
      const wrapper = input.closest('.manual-date-field');
      const picker = wrapper ? wrapper.querySelector('.manual-date-native') : null;
      if(picker) picker.value = '';
      input.classList.remove('is-invalid');
    });

    document.querySelectorAll('.month-filter-checkbox[data-table="' + selector + '"]').forEach(function(box){
      box.checked = false;
    });
    const period = document.querySelector('.month-period-filter[data-table="' + selector + '"]');
    if(period) period.open = false;

    refreshMonthPeriodLabel(selector);
    applyTableFilters(selector);
  }

  function refreshMonthPeriodLabel(selector){
    const filter = document.querySelector('.month-period-filter[data-table="' + selector + '"]');
    if(!filter) return;
    const summary = filter.querySelector('summary');
    const checked = Array.from(document.querySelectorAll('.month-filter-checkbox[data-table="' + selector + '"]:checked'));
    if(!summary) return;
    if(!checked.length || checked.length === 12) summary.textContent = 'Période : tous les mois';
    else if(checked.length === 1) summary.textContent = 'Période : ' + (checked[0].closest('label')?.textContent.trim() || '1 mois');
    else summary.textContent = 'Période : ' + checked.length + ' mois';
  }

  function initPhoneInput(input){
    input.addEventListener('input', function(){
      let digits = input.value.replace(/\D/g, '').slice(0, 10);
      let parts = [];
      if(digits.length) parts.push(digits.slice(0,3));
      if(digits.length > 3) parts.push(digits.slice(3,5));
      if(digits.length > 5) parts.push(digits.slice(5,8));
      if(digits.length > 8) parts.push(digits.slice(8,10));
      input.value = parts.filter(Boolean).join('.');
    });
  }

  function initFidelLookup(input){
    const hiddenSelector = input.getAttribute('data-hidden');
    const hidden = hiddenSelector ? document.querySelector(hiddenSelector) : null;
    const listId = input.getAttribute('list');
    const dataList = listId ? document.getElementById(listId) : null;
    if(!hidden || !dataList) return;

    const sync = function(){
      const value = input.value.trim().toLowerCase();
      hidden.value = '';
      Array.from(dataList.options).some(function(opt){
        const optValue = (opt.value || '').trim().toLowerCase();
        const matricule = (opt.dataset.matricule || '').trim().toLowerCase();
        const name = (opt.dataset.name || '').trim().toLowerCase();
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

  function loadObligationRest(){
    const lookup = document.getElementById('obligationFidelLookup');
    const hidden = document.getElementById('obligationFidelId');
    const month = document.getElementById('obligationMonth');
    const year = document.getElementById('obligationYear');
    const help = document.getElementById('obligationStatusHelp');
    if(!lookup || !help) return;
    const q = lookup.value.trim();
    if(!q){
      if(hidden) hidden.value = '';
      help.className = 'alert alert-info py-2 mb-3 d-none';
      help.textContent = '';
      renderObligationHistory([]);
      filterObligationTableByFidel('');
      return;
    }
    $.get(baseUrl('api/obligations/rest'), {q, fidel_id:hidden ? hidden.value : '', period_month:month ? month.value : '', period_year:year ? year.value : ''}, function(res){
      if(!res.success){
        help.className = 'alert alert-warning py-2 mb-3';
        help.textContent = res.message || 'Chrétien introuvable.';
        renderObligationHistory([]);
        filterObligationTableByFidel('');
        return;
      }
      if(hidden && res.fidel && res.fidel.id) hidden.value = res.fidel.id;
      filterObligationTableByFidel(res.fidel && res.fidel.id ? String(res.fidel.id) : '');
      renderObligationHistory(res.history || []);
      if(res.has_open){
        $('#existingObligationId').val(res.obligation.id);
        $('#obligationDue').val(formatMoneyInputValue(res.obligation.amount_due));
        $('#obligationLabel').val(res.obligation.label || 'Obligation mensuelle');
        $('#obligationRest').val(formatMoney(res.rest));
        $('#obligationPayment').val(formatMoneyInputValue(res.rest > 0 ? res.rest : 0)).attr('max', res.rest > 0 ? res.rest : 0);
        help.className = 'alert alert-success py-2 mb-3';
        help.textContent = res.message + ' — saisissez le montant payé maintenant pour continuer.';
      }else{
        $('#existingObligationId').val('');
        $('#obligationRest').val('0 Ar');
        const defaultDue = moneyValue($('#obligationDue').val() || 0);
        $('#obligationPayment').attr('max', defaultDue > 0 ? defaultDue : '').val(formatMoneyInputValue(0));
        help.className = 'alert alert-info py-2 mb-3';
        help.textContent = res.message;
      }
    });
  }

  function loadCommunionHistory(){
    const lookup = document.getElementById('communionFidelLookup');
    const hidden = document.getElementById('communionFidelId');
    const box = document.getElementById('communionHistory');
    if(!lookup || !box) return;
    const q = lookup.value.trim();
    if(!q){
      communionHistoryCache = [];
      resetCommunionMonthsVisibility();
      box.className='alert alert-info py-2 mb-3 d-none';
      box.textContent='';
      return;
    }
    $.get(baseUrl('api/communion/history'), {q, fidel_id:hidden ? hidden.value : ''}, function(res){
      if(!res.success){
        communionHistoryCache = [];
        resetCommunionMonthsVisibility();
        box.className='alert alert-warning py-2 mb-3';
        box.textContent=res.message || 'Chrétien introuvable.';
        return;
      }
      if(hidden && res.fidel && res.fidel.id) hidden.value = res.fidel.id;
      communionHistoryCache = res.history || [];
      applyCommunionPaidMonths(communionHistoryCache);
      if(!communionHistoryCache.length){ box.className='alert alert-info py-2 mb-3'; box.textContent='Aucun paiement communion trouvé pour ce chrétien.'; return; }
      box.className='alert alert-success py-2 mb-3';
      box.innerHTML = '<strong>Derniers paiements :</strong> ' + communionHistoryCache.slice(0,6).map(h => `${escapeHtml(monthName(Number(h.paid_month)))} ${escapeHtml(h.paid_year)} — payé le ${escapeHtml(h.payment_date)} : ${formatMoney(h.amount)}`).join(' | ');
    });
  }

  function applyCommunionPaidMonths(history){
    const yearInput = document.getElementById('communionYear');
    const selectedYear = Number(yearInput ? yearInput.value : new Date().getFullYear());
    resetCommunionMonthsVisibility();
    const paidMonths = new Set((history || []).filter(h => Number(h.paid_year) === selectedYear).map(h => Number(h.paid_month)));
    document.querySelectorAll('.month-box').forEach(function(box){
      const month = Number(box.dataset.monthBox || '0');
      const checkbox = box.querySelector('.communion-month');
      if(paidMonths.has(month)){
        if(checkbox){ checkbox.checked = false; checkbox.disabled = true; }
        box.classList.add('d-none');
      }
    });
  }

  function resetCommunionMonthsVisibility(){
    document.querySelectorAll('.month-box').forEach(function(box){ box.classList.remove('d-none'); });
    document.querySelectorAll('.communion-month').forEach(function(cb){ cb.disabled = false; });
  }

  function monthName(month){
    const months = {1:'Janvier',2:'Février',3:'Mars',4:'Avril',5:'Mai',6:'Juin',7:'Juillet',8:'Août',9:'Septembre',10:'Octobre',11:'Novembre',12:'Décembre'};
    return months[month] || ('Mois '+month);
  }

  function applyDateRangeFilter(selector){
    applyTableFilters(selector);
  }

  function applyTableFilters(selector){
    if(!selector) return;
    const table = document.querySelector(selector);
    if(!table) return;
    const dateFilters = Array.from(document.querySelectorAll('.date-range-filter[data-table="' + selector + '"]'));
    const textFilters = Array.from(document.querySelectorAll('.table-filter[data-table="' + selector + '"]'));
    let from = '', to = '';
    dateFilters.forEach(function(input, index){
      const id = (input.id || '').toLowerCase();
      const value = parseDateToIso(input.value || '');
      if(id.includes('from') || id.includes('debut') || (!from && index === 0)) from = value;
      if(id.includes('to') || id.includes('fin') || id.includes('au') || index === 1) to = value;
    });
    const search = textFilters.map(i => String(i.value || '').trim().toLowerCase()).filter(Boolean).join(' ');
    const periodFilter = document.querySelector('.month-period-filter[data-table="' + selector + '"]');
    const selectedMonths = new Set(Array.from(document.querySelectorAll('.month-filter-checkbox[data-table="' + selector + '"]:checked')).map(function(box){ return String(box.value); }));
    const monthSource = periodFilter ? (periodFilter.dataset.monthSource || '') : '';

    table.querySelectorAll('tbody tr').forEach(function(row){
      if(row.classList.contains('collapse')) return;
      const date = row.dataset.date || row.dataset.created || row.dataset.payment || row.querySelector('td')?.textContent.split('/').reverse().join('-') || '';
      const okFrom = !from || !date || date >= from;
      const okTo = !to || !date || date <= to;
      const text = row.textContent.toLowerCase();
      const okText = !search || search.split(/\s+/).every(word => text.includes(word));
      const fidelFilter = table.dataset.fidelFilter || '';
      const okFidel = !fidelFilter || row.dataset.fidelId === fidelFilter;
      let rowMonth = '';
      if(monthSource) rowMonth = String(row.dataset[monthSource] || '');
      if(!rowMonth && date && /^\d{4}-\d{2}-\d{2}$/.test(date)) rowMonth = String(Number(date.slice(5,7)));
      const okMonth = selectedMonths.size === 0 || selectedMonths.has(rowMonth);
      row.style.display = (okFrom && okTo && okText && okFidel && okMonth) ? '' : 'none';
    });
    updateTableTotal(table);
  }

  function updateTableTotal(table){
    if(!table) return;
    const rows = Array.from(table.querySelectorAll('tbody tr')).filter(function(row){
      return row.style.display !== 'none' && !row.classList.contains('collapse');
    });

    const countCell = table.querySelector('.table-total-count');
    if(countCell) countCell.textContent = String(rows.length);

    const budgetCell = table.querySelector('.table-total-budget');
    const paidCell = table.querySelector('.table-total-paid');
    const restCell = table.querySelector('.table-total-rest');
    if(budgetCell || paidCell || restCell){
      let budget = 0, paid = 0, rest = 0;
      rows.forEach(function(row){
        budget += Number(String(row.dataset.budget || '0').replace(',', '.')) || 0;
        paid += Number(String(row.dataset.paid || '0').replace(',', '.')) || 0;
        rest += Number(String(row.dataset.rest || '0').replace(',', '.')) || 0;
      });
      if(budgetCell) budgetCell.textContent = formatMoney(budget);
      if(paidCell) paidCell.textContent = formatMoney(paid);
      if(restCell) restCell.textContent = formatMoney(rest);
    }

    const totalCell = table.querySelector('.table-total-amount');
    if(!totalCell) return;
    let total = 0;
    rows.forEach(function(row){
      if(row.dataset.amount !== undefined){
        total += Number(String(row.dataset.amount).replace(',', '.')) || 0;
        return;
      }
      const amountCell = row.querySelector('[data-amount-cell]') || row.children[row.children.length - 1];
      if(!amountCell) return;
      const match = amountCell.textContent.replace(/ /g, ' ').match(/[0-9][0-9 .]*/);
      if(match) total += Number(match[0].replace(/[ .]/g, '')) || 0;
    });
    totalCell.textContent = formatMoney(total);
  }


  function printSingleRow(button){
    const table = button.closest('table');
    const sourceRow = button.closest('tr');
    if(!table || !sourceRow){ notifyError('Impression impossible', 'Ligne introuvable.'); return; }
    const head = table.querySelector('thead') ? table.querySelector('thead').cloneNode(true) : null;
    const row = sourceRow.cloneNode(true);
    [head, row].forEach(function(node){ if(node) node.querySelectorAll('.no-print, .action-buttons, button, form').forEach(el => el.remove()); });
    const title = table.closest('.premium-card')?.querySelector('h3')?.textContent.trim() || 'Impression';
    const printedAt = new Date().toLocaleDateString('fr-FR');
    const html = `<html><head><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}.church-head{text-align:center;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px}.meta{text-align:right;font-size:12px;margin-bottom:10px}table{width:100%;border-collapse:collapse;margin-top:10px}thead{display:table-header-group}td,th{border:1px solid #777;padding:7px;text-align:left;font-size:12px}th{background:#f1f1f1}</style></head><body><div class="church-head"><h1>FJKM MALAZA GILEADA</h1><h2>GESTION D'OBLIGATION AU SEIN D'EGLISE FJKM MALAZA GILEADA</h2><h3>${escapeHtml(title)}</h3></div><div class="meta">Date d'impression : ${printedAt}</div><table>${head ? head.outerHTML : ''}<tbody>${row.outerHTML}</tbody></table></body></html>`;
    openPrintWindow(html, title);
  }

  function printFilteredTable(button){
    const table = document.querySelector(button.dataset.table || '');
    if(!table) return;
    const title = button.dataset.title || 'Impression';
    const subtitle = button.dataset.subtitle || 'FJKM MALAZA GILEADA';
    const memberSelector = button.dataset.member || '';
    const memberNode = memberSelector ? document.querySelector(memberSelector) : null;
    const memberClone = memberNode ? memberNode.cloneNode(true) : null;
    if(memberClone) memberClone.querySelectorAll('.no-print, .member-print-actions, button, a, form').forEach(function(el){ el.remove(); });
    const memberHtml = memberClone ? '<div class="member-print-block">' + memberClone.innerHTML + '</div>' : '';
    const clone = table.cloneNode(true);
    if(button.dataset.noTotals === '1'){ clone.querySelectorAll('tfoot').forEach(el => el.remove()); }
    clone.querySelectorAll('.no-print, .action-buttons, button, form').forEach(el => el.remove());
    const originalRows = Array.from(table.querySelectorAll('tbody tr'));
    const clonedRows = Array.from(clone.querySelectorAll('tbody tr'));
    clonedRows.forEach(function(row, index){
      const original = originalRows[index];
      if(!original || original.style.display === 'none') row.remove();
    });
    clone.querySelectorAll('tr').forEach(function(row){
      Array.from(row.children).forEach(function(cell){
        if(cell.classList.contains('no-print')) cell.remove();
      });
    });
    // Recalcule les totaux imprimés sur les lignes réellement visibles quand un tfoot existe.
    const visibleOriginalRows = originalRows.filter(row => row.style.display !== 'none' && !row.classList.contains('collapse'));
    const countCell = clone.querySelector('.table-total-count');
    if(countCell) countCell.textContent = String(visibleOriginalRows.length);
    const totalCell = clone.querySelector('.table-total-amount');
    if(totalCell){
      let total = 0;
      visibleOriginalRows.forEach(function(row){
        if(row.dataset.amount !== undefined){
          total += Number(String(row.dataset.amount).replace(',', '.')) || 0;
        }
      });
      totalCell.textContent = formatMoney(total);
    }
    const budgetCell = clone.querySelector('.table-total-budget');
    const paidCell = clone.querySelector('.table-total-paid');
    const restCell = clone.querySelector('.table-total-rest');
    if(budgetCell || paidCell || restCell){
      let budget = 0, paid = 0, rest = 0;
      visibleOriginalRows.forEach(function(row){
        budget += Number(String(row.dataset.budget || '0').replace(',', '.')) || 0;
        paid += Number(String(row.dataset.paid || '0').replace(',', '.')) || 0;
        rest += Number(String(row.dataset.rest || '0').replace(',', '.')) || 0;
      });
      if(budgetCell) budgetCell.textContent = formatMoney(budget);
      if(paidCell) paidCell.textContent = formatMoney(paid);
      if(restCell) restCell.textContent = formatMoney(rest);
    }
    const printedAt = new Date().toLocaleDateString('fr-FR');
    const html = `<html><head><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1,h2,h3,p{text-align:center;margin:4px 0}.church-head{border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px}.church-head h1{font-size:20px;text-transform:uppercase}.church-head h2{font-size:18px}.meta{text-align:right;font-size:12px;margin-bottom:10px}.member-print-block{border:1px solid #777;padding:12px;margin:10px 0 16px}.member-print-block table{margin-top:0}.member-print-photo{width:90px;height:90px;object-fit:cover;border:1px solid #777;border-radius:8px}table{width:100%;border-collapse:collapse;margin-top:10px}thead{display:table-header-group}tfoot{display:table-footer-group}td,th{border:1px solid #777;padding:7px;text-align:left;font-size:12px}th{background:#f1f1f1}</style></head><body><div class="church-head"><h1>${escapeHtml(subtitle)}</h1><h2>GESTION D'OBLIGATION AU SEIN D'EGLISE FJKM MALAZA GILEADA</h2><h3>${escapeHtml(title)}</h3></div><div class="meta">Date d'impression : ${printedAt}</div>${memberHtml}${clone.outerHTML}</body></html>`;
    openPrintWindow(html, title);
  }


  function visibleTableClone(selector, title){
    const table = document.querySelector(selector);
    if(!table) return '';
    const clone = table.cloneNode(true);
    clone.querySelectorAll('.no-print, .action-buttons, button, form, tfoot').forEach(el => el.remove());
    const originalRows = Array.from(table.querySelectorAll('tbody tr'));
    const clonedRows = Array.from(clone.querySelectorAll('tbody tr'));
    clonedRows.forEach(function(row, index){
      const original = originalRows[index];
      if(!original || original.style.display === 'none') row.remove();
    });
    return '<h3 style="text-align:left;margin-top:18px">' + escapeHtml(title) + '</h3>' + clone.outerHTML;
  }

  function printMemberProfile(selector){
    const member = document.querySelector(selector || '#memberPrintInfo');
    if(!member){
      notifyError('Impression impossible', 'La fiche chrétien est introuvable.');
      return;
    }
    const clone = member.cloneNode(true);
    clone.querySelectorAll('.no-print, .member-print-actions, button, a').forEach(function(el){ el.remove(); });
    const printedAt = new Date().toLocaleDateString('fr-FR');
    const html = `<html><head><title>Fiche Chrétien</title><style>
      body{font-family:Arial,sans-serif;padding:26px;color:#111}.church-head{text-align:center;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px}.church-head h1{font-size:20px;margin:4px 0}.church-head h2{font-size:16px;margin:4px 0}.meta{text-align:right;font-size:12px;margin-bottom:12px}.member-print-photo{width:92px;height:92px;object-fit:cover;border:1px solid #777;border-radius:8px}.d-flex{display:flex}.gap-3{gap:18px}.align-items-start{align-items:flex-start}.flex-wrap{flex-wrap:wrap}.flex-grow-1{flex-grow:1}table{width:100%;border-collapse:collapse;margin-top:8px}td,th{border:1px solid #777;padding:7px;text-align:left;font-size:12px}th{background:#f1f1f1;width:145px}h2,h3{margin:4px 0}
    </style></head><body><div class="church-head"><h1>FJKM MALAZA GILEADA</h1><h2>GESTION D'OBLIGATION AU SEIN D'EGLISE FJKM MALAZA GILEADA</h2><h3>Fiche Chrétien</h3></div><div class="meta">Date d'impression : ${printedAt}</div>${clone.outerHTML}</body></html>`;
    openPrintWindow(html, 'Fiche Chrétien');
  }

  function openPrintWindow(html, title){
    const w = window.open('', '_blank', 'width=960,height=700');
    if(!w){
      notifyError('Impression bloquée', 'Autorisez les pop-ups du navigateur, puis réessayez.');
      return null;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.document.title = title || 'Impression';
    window.setTimeout(function(){
      try { w.focus(); w.print(); } catch(err) { /* la fenêtre reste disponible pour impression manuelle */ }
    }, 250);
    return w;
  }

  function printMemberHistories(){
    const memberNode = document.getElementById('memberPrintInfo');
    if(!memberNode){ notifyError('Impression impossible', 'Mombamomba Chrétien introuvable.'); return; }
    const memberClone = memberNode.cloneNode(true);
    memberClone.querySelectorAll('.no-print, button, a').forEach(el => el.remove());
    const obligationHtml = visibleTableClone('#memberObligationTable', 'Historique obligation');
    const communionHtml = visibleTableClone('#memberCommunionTable', 'Historique communion');
    const printedAt = new Date().toLocaleDateString('fr-FR');
    const html = `<html><head><title>Historiques Chrétien</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}.church-head{border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px;text-align:center}.church-head h1{font-size:20px;text-transform:uppercase;margin:4px 0}.church-head h2{font-size:18px;margin:4px 0}.meta{text-align:right;font-size:12px;margin-bottom:10px}.member-print-block{border:1px solid #777;padding:12px;margin:10px 0 16px}.member-print-photo{width:90px;height:90px;object-fit:cover;border:1px solid #777;border-radius:8px}table{width:100%;border-collapse:collapse;margin-top:10px}thead{display:table-header-group}td,th{border:1px solid #777;padding:7px;text-align:left;font-size:12px}th{background:#f1f1f1}</style></head><body><div class="church-head"><h1>FJKM MALAZA GILEADA</h1><h2>GESTION D'OBLIGATION AU SEIN D'EGLISE FJKM MALAZA GILEADA</h2><h3>Historiques Chrétien</h3></div><div class="meta">Date d'impression : ${printedAt}</div><div class="member-print-block">${memberClone.innerHTML}</div>${obligationHtml}${communionHtml}</body></html>`;
    openPrintWindow(html, 'Historiques Chrétien');
  }

  window.printMemberHistories = printMemberHistories;

  window.printFilteredTable = printFilteredTable;

  function renderObligationHistory(history){
    const box = document.getElementById('obligationHistoryBox');
    if(!box) return;
    if(!history || !history.length){
      box.classList.add('d-none');
      box.innerHTML = '';
      return;
    }
    box.classList.remove('d-none');
    const rows = history.slice(0, 8).map(function(h){
      const rest = Math.max(0, Number(h.amount_due || 0) - Number(h.amount_paid || 0));
      return `<tr><td>${escapeHtml(h.period_name || '')}</td><td>${formatMoney(h.amount_paid)}</td><td>${formatMoney(h.amount_due)}</td><td>${formatMoney(rest)}</td><td>${escapeHtml(h.status || '')}</td></tr>`;
    }).join('');
    box.innerHTML = `<div class="table-responsive"><table class="table table-sm table-bordered mb-0"><thead><tr><th>Adidy farany</th><th>Vola naloha</th><th>Total adidy</th><th>Reste</th><th>Statut</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function filterObligationTableByFidel(fidelId){
    const table = document.getElementById('obligationsTable');
    if(!table) return;
    table.dataset.fidelFilter = fidelId || '';
    applyTableFilters('#obligationsTable');
  }

  // Module Projet : synchronise la sélection du projet avec les champs readonly
  // et recalcule le reste affiché à chaque changement de montant.
  function initProjectPaymentSelect(){
    const select = document.getElementById('projectSelect');
    const rest = document.getElementById('projectRest');
    const referenceInput = document.getElementById('projectReference');
    const nameInput = document.getElementById('projectName');
    const budget = document.getElementById('projectBudget');
    const status = document.getElementById('projectStatus');
    const start = document.getElementById('projectStart');
    const end = document.getElementById('projectEnd');
    const description = document.getElementById('projectDescription');
    const amount = document.getElementById('projectPaymentAmount');
    const budgetRawInput = document.getElementById('projectBudgetRaw');
    const restRawInput = document.getElementById('projectRestRaw');
    if(!select) return;

    const numeric = function(value){ return moneyValue(value); };
    const money = function(value){ return formatMoneyInputValue(value) + ' Ar'; };
    const statusLabel = function(value){
      const map = {planned:'Prévu', ongoing:'En cours', almost_completed:'Presque terminé', completed:'Terminé', cancelled:'Annulé'};
      return map[value] || value || 'Prévu';
    };

    const selectedProject = function(){
      const opt = select.selectedOptions && select.selectedOptions[0] ? select.selectedOptions[0] : null;
      if(!opt || !opt.value) return null;
      const totalToPay = numeric(opt.dataset.budgetRaw || opt.dataset.budget || 0);
      const alreadyPaid = numeric(opt.dataset.collected || 0);
      let currentRest = numeric(opt.dataset.rest || Math.max(0, totalToPay - alreadyPaid));
      if(currentRest <= 0 && totalToPay > 0) currentRest = Math.max(0, totalToPay - alreadyPaid);
      return {
        option: opt,
        reference: opt.dataset.reference || '',
        name: opt.dataset.name || '',
        totalToPay: totalToPay,
        alreadyPaid: alreadyPaid,
        currentRest: currentRest,
        status: opt.dataset.status || 'planned',
        start: opt.dataset.start || '',
        end: opt.dataset.end || '',
        description: opt.dataset.description || ''
      };
    };

    const refreshProjectFields = function(clearAmount){
      const project = selectedProject();
      if(clearAmount && amount) amount.value = '';

      if(!project){
        if(referenceInput) referenceInput.value = '-';
        if(nameInput) nameInput.value = '-';
        if(budget) budget.value = '0 Ar';
        if(rest) rest.value = '0 Ar';
        if(budgetRawInput) budgetRawInput.value = '0';
        if(restRawInput) restRawInput.value = '0';
        if(status) status.value = 'Prévu';
        if(start) start.value = '';
        if(end) end.value = '';
        if(amount){ amount.removeAttribute('max'); amount.placeholder = 'Sélectionnez d’abord un projet'; }
        return;
      }

      const typedAmount = Math.max(0, numeric(amount ? amount.value : 0));
      const restAfterTyping = Math.max(0, project.currentRest - typedAmount);

      if(referenceInput) referenceInput.value = project.reference || '-';
      if(nameInput) nameInput.value = project.name || '-';
      if(budget) budget.value = money(project.totalToPay);
      if(rest) rest.value = money(restAfterTyping);
      if(budgetRawInput) budgetRawInput.value = String(project.totalToPay);
      if(restRawInput) restRawInput.value = String(restAfterTyping);
      if(status) status.value = statusLabel(project.status);

      // Date début/fin paramétrées par l'ADMIN : affichage uniquement dans l'enregistrement.
      if(start) start.value = formatDateDisplay(project.start || '');

      if(end) end.value = formatDateDisplay(project.end || '');
      if(description && document.activeElement !== description) description.value = project.description || '';

      if(amount){
        amount.setAttribute('max', String(project.currentRest));
        amount.placeholder = project.currentRest > 0 ? 'Maximum : ' + money(project.currentRest) : 'Projet terminé ou non sélectionné';
      }
    };

    select.addEventListener('change', function(){ refreshProjectFields(true); });
    select.addEventListener('input', function(){ refreshProjectFields(true); });
    select.addEventListener('blur', function(){ refreshProjectFields(false); });
    if(amount){
      ['input','change','keyup'].forEach(function(evt){
        amount.addEventListener(evt, function(){ refreshProjectFields(false); });
      });
    }
    refreshProjectFields(false);
  }

  function validateObligationPaymentBeforeSubmit(form, event){
    const payment = form.querySelector('#obligationPayment');
    if(!payment) return true;
    const max = moneyValue(payment.getAttribute('max') || form.querySelector('#obligationDue')?.value || 0);
    const value = moneyValue(payment.value || 0);
    if(max >= 0 && value > max){
      event.preventDefault();
      event.stopPropagation();
      payment.value = formatMoneyInputValue(max);
      notifyError('Montant dépassé', 'Le montant payé ne doit pas dépasser le reste à payer. Le champ a été corrigé : vérifiez puis validez à nouveau.');
      payment.focus();
      return false;
    }
    return true;
  }

  // Validation finale côté navigateur : évite de soumettre un montant supérieur au reste du projet.
  function validateProjectPaymentBeforeSubmit(form, event){
    const select = form.querySelector('#projectSelect');
    const amount = form.querySelector('#projectPaymentAmount');
    if(!select || !amount) return true;
    const opt = select.selectedOptions && select.selectedOptions[0] ? select.selectedOptions[0] : null;
    const rest = opt ? moneyValue(opt.dataset.rest || 0) : 0;
    const value = moneyValue(amount.value || 0);
    if(rest > 0 && value > rest){
      event.preventDefault();
      event.stopPropagation();
      amount.value = formatMoneyInputValue(rest);
      notifyError('Montant dépassé', 'Le montant versé ne doit pas dépasser le reste du projet. Le champ a été corrigé : vérifiez puis validez à nouveau.');
      amount.focus();
      return false;
    }
    return true;
  }

  function notifyError(title, text){
    if(window.Swal) Swal.fire({icon:'error', title:title, text:text});
    else alert(title + '\n' + text);
  }

  function debounce(fn, delay){
    let timer;
    return function(){ clearTimeout(timer); timer = setTimeout(fn, delay); };
  }

  function baseUrl(path){
    const base = (window.FJKM_BASE_URL || '/').replace(/\/$/, '');
    return base + '/' + String(path).replace(/^\//, '');
  }

  window.escapeHtml = function(s){return String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));}

  /* ============================
     MODAL RESET ON CLOSE
     ============================ */
  initModalReset();

  function initModalReset(){
    ['entryModal','exitModal','obligationModal','communionModal','christianeModal','projectModal','projectPaymentModal'].forEach(function(modalId){
      var modal = document.getElementById(modalId);
      if(!modal) return;
      modal.addEventListener('hidden.bs.modal', function(){
        var form = modal.querySelector('form[id$="Form"]');
        if(!form) return;
        form.reset();
        form.classList.remove('was-validated');
        var createAction = form.getAttribute('data-create-action');
        if(createAction) form.setAttribute('action', createAction);
        form.querySelectorAll('[data-default-value]').forEach(function(input){
          input.value = input.getAttribute('data-default-value') || '';
        });
        // Réinitialiser les champs spécifiques à l'obligation
        var fidelId = form.querySelector('#obligationFidelId');
        if(fidelId) fidelId.value = '';
        var existingId = form.querySelector('#existingObligationId');
        if(existingId) existingId.value = '';
        var paidHidden = form.querySelector('#obligationPaidHidden');
        if(paidHidden) paidHidden.value = '';
        var restField = form.querySelector('#obligationRest');
        if(restField) restField.value = '0 Ar';
        var helpBox = form.querySelector('#obligationStatusHelp');
        if(helpBox){ helpBox.className = 'alert alert-info py-2 mb-0 d-none'; helpBox.textContent = ''; }
        var historyBox = form.querySelector('#obligationHistoryBox');
        if(historyBox){ historyBox.className = 'small-history d-none mb-0'; historyBox.innerHTML = ''; }
        // Réinitialiser les champs spécifiques à la communion
        var communionFidelId = form.querySelector('#communionFidelId');
        if(communionFidelId) communionFidelId.value = '';
        var communionHistory = form.querySelector('#communionHistory');
        if(communionHistory){ communionHistory.className = 'alert alert-info py-2 mb-0 d-none'; communionHistory.textContent = ''; }
        // Réinitialiser la grille des mois communion
        form.querySelectorAll('.month-box').forEach(function(box){ box.classList.remove('d-none'); });
        form.querySelectorAll('.communion-month').forEach(function(cb){ cb.disabled = false; cb.checked = false; });

        var titleSpan = modal.querySelector('[id$="TitleText"]');
        if(titleSpan){
          var prefix = modalId === 'entryModal' ? 'Nouvelle entrée' : (modalId === 'exitModal' ? 'Nouvelle sortie' : (modalId === 'obligationModal' ? 'Nouvelle obligation' : (modalId === 'communionModal' ? 'Nouvelle entrée communion' : (modalId === 'christianeModal' ? 'Nouveau Chrétien' : (modalId === 'projectModal' ? 'Paramètre projet' : 'Enregistrement paiement projet')))));
          titleSpan.textContent = prefix;
        }
        var submit = modal.querySelector('[id$="Submit"]');
        if(submit){
          submit.innerHTML = '<i class="bi bi-check-circle"></i> Enregistrer';
        }
      });
    });
  }

  /* ============================
     VIEW MEMBER MODAL — Populate with data on show
     ============================ */
  initViewMemberModal();

  function initViewMemberModal(){
    const viewModal = document.getElementById('christianeViewModal');
    if(!viewModal) return;
    viewModal.addEventListener('show.bs.modal', function(event){
      const button = event.relatedTarget;
      if(!button) return;
      const values = JSON.parse(button.dataset.values || '{}');
      const photoUrl = button.dataset.photo || '';
      const content = document.getElementById('christianeViewContent');
      if(!content) return;

      const genderLabel = values.gender === 'M' ? 'Masculin' : (values.gender === 'F' ? 'Féminin' : '-');
      const isActive = values.status === 'active';
      const statusClass = isActive ? 'success' : 'secondary';
      const statusLabel = isActive ? 'Actif' : 'Inactif';
      const defaultAvatar = window.FJKM_BASE_URL ? (window.FJKM_BASE_URL + '/assets/img/avatar.svg') : '/assets/img/avatar.svg';
      const photoTag = photoUrl ? `<img class="view-member-photo" src="${escapeHtml(photoUrl)}" alt="Photo" onerror="this.src='${defaultAvatar}'">` : `<div class="view-member-photo" style="display:flex;align-items:center;justify-content:center;font-size:3rem;color:var(--fjkm-blue);background:#eef5ff"><i class="bi bi-person-fill"></i></div>`;

      content.innerHTML = `
        <div class="view-member-card">
          ${photoTag}
          <div class="view-member-header">
            <h2>${escapeHtml(values.full_name || '')}</h2>
            <span class="matricule-badge">${escapeHtml(values.matricule || '')}</span>
            <span class="status-badge-inline badge text-bg-${statusClass}">${statusLabel}</span>
            <div class="view-member-stats">
              <div class="view-member-stat">
                <i class="bi bi-people"></i>
                <span>Groupe</span>
                <strong>${escapeHtml(values.group_name || '-')}</strong>
              </div>
              <div class="view-member-stat">
                <i class="bi bi-telephone"></i>
                <span>Téléphone</span>
                <strong>${escapeHtml(values.phone || '-')}</strong>
              </div>
              <div class="view-member-stat">
                <i class="bi bi-gender-ambiguous"></i>
                <span>Genre</span>
                <strong>${escapeHtml(genderLabel)}</strong>
              </div>
              <div class="view-member-stat">
                <i class="bi bi-geo-alt"></i>
                <span>Adresse</span>
                <strong>${escapeHtml(values.address || '-')}</strong>
              </div>
            </div>
          </div>
        </div>
        <div class="view-member-info-grid mt-3">
          <div class="view-member-info-item">
            <i class="bi bi-calendar-plus"></i>
            <div class="info-content">
              <small>Enregistrement</small>
              <strong>${formatDateDisplay(values.created_date) || '-'}</strong>
            </div>
          </div>
          <div class="view-member-info-item">
            <i class="bi bi-cake2"></i>
            <div class="info-content">
              <small>Naissance</small>
              <strong>${formatDateDisplay(values.birth_date) || '-'}</strong>
            </div>
          </div>
          <div class="view-member-info-item">
            <i class="bi bi-droplet"></i>
            <div class="info-content">
              <small>Baptême</small>
              <strong>${formatDateDisplay(values.baptized_at) || '-'}</strong>
            </div>
          </div>
          <div class="view-member-info-item">
            <i class="bi bi-cup-straw"></i>
            <div class="info-content">
              <small>Communion</small>
              <strong>${formatDateDisplay(values.communion_at) || '-'}</strong>
            </div>
          </div>
        </div>
      `;
    });
  }

  /* ============================
     ANIMATIONS PREMIUM DU DASHBOARD
     ============================ */
  initPremiumAnimations();

  function initPremiumAnimations(){
    /* Counter animation for stat cards */
    animateCounters();
    /* Fade-in elements on scroll */
    observeAnimatedElements();
    /* Parallax shine effect on premium cards */
    initCardShineEffect();
  }

  /* Compteurs animés : les nombres dans les .counter-value défilent */
  function animateCounters(){
    const counters = document.querySelectorAll('.counter-value');
    if(!counters.length) return;

    const animateCounter = function(el) {
      const raw = el.getAttribute('data-target') || el.textContent;
      const target = moneyValue(raw);
      if(target <= 0) return;
      const duration = 1200;
      const startTime = performance.now();
      const startValue = 0;

      const update = function(currentTime){
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        /* easeOutExpo */
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.round(startValue + (target - startValue) * eased);
        el.textContent = formatMoneyInputValue(current) + (el.dataset.noCurrency ? '' : ' Ar');
        if(progress < 1) requestAnimationFrame(update);
        else {
          el.textContent = formatMoneyInputValue(target) + (el.dataset.noCurrency ? '' : ' Ar');
          el.style.animation = 'countPulse 0.4s ease-out';
          setTimeout(function(){ el.style.animation = ''; }, 500);
        }
      };
      requestAnimationFrame(update);
    };

    /* Use IntersectionObserver to trigger when visible */
    if('IntersectionObserver' in window){
      const observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            const counter = entry.target;
            animateCounter(counter);
            observer.unobserve(counter);
          }
        });
      }, { threshold: 0.3 });

      counters.forEach(function(counter){ observer.observe(counter); });
    } else {
      /* Fallback: animate immediately */
      counters.forEach(animateCounter);
    }
  }

  /* Fade-in animation on scroll using IntersectionObserver */
  function observeAnimatedElements(){
    const elements = document.querySelectorAll('.animate-fade-up');
    if(!elements.length || !('IntersectionObserver' in window)){
      /* Si pas d'IntersectionObserver, on les rend visibles immédiatement */
      elements.forEach(function(el){ el.style.opacity = '1'; });
      return;
    }

    const observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          const el = entry.target;
          /* Remove the animation class after triggering, and make visible */
          el.style.animationPlayState = 'running';
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

    elements.forEach(function(el){
      /* Pause animation until visible */
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
  }

  /* Subtle shine effect on premium cards on mousemove */
  function initCardShineEffect(){
    const cards = document.querySelectorAll('.premium-card');
    if(!cards.length || !window.matchMedia('(hover: hover)').matches) return;

    cards.forEach(function(card){
      card.addEventListener('mousemove', function(e){
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--shine-x', x + '%');
        card.style.setProperty('--shine-y', y + '%');
      });
    });
  }

  /* ============================
     FLUIDITY: Auto-dismiss flash messages
     ============================ */
  initFlashDismiss();
  function initFlashDismiss(){
    document.querySelectorAll('.flash-message').forEach(function(msg){
      setTimeout(function(){
        msg.classList.add('flash-dismiss');
        setTimeout(function(){ msg.remove(); }, 400);
      }, 5000);
    });
  }

  /* ============================
     FLUIDITY: Loading state on form submit
     ============================ */
  initFormLoading();
  function initFormLoading(){
    document.querySelectorAll('form.needs-validation').forEach(function(form){
      form.addEventListener('submit', function(e){
        if(!form.checkValidity()) return;
        var submitBtn = form.querySelector('button[type="submit"]');
        if(submitBtn && !submitBtn.classList.contains('btn-loading')){
          submitBtn.classList.add('btn-loading');
          submitBtn.setAttribute('data-original-html', submitBtn.innerHTML);
          submitBtn.innerHTML = '<span class="visually-hidden">Chargement...</span>';
        }
      });
    });
    /* Also handle non-validated forms (modal forms) */
    document.querySelectorAll('form:not(.needs-validation)').forEach(function(form){
      form.addEventListener('submit', function(e){
        var submitBtn = form.querySelector('button[type="submit"]');
        if(submitBtn && !submitBtn.classList.contains('btn-loading')){
          submitBtn.classList.add('btn-loading');
          submitBtn.setAttribute('data-original-html', submitBtn.innerHTML);
          submitBtn.innerHTML = '<span class="visually-hidden">Chargement...</span>';
        }
      });
    });
  }

  /* ============================
     FLUIDITY: Smooth scroll to anchor on page load
     ============================ */
  if(window.location.hash){
    setTimeout(function(){
      var target = document.querySelector(window.location.hash);
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
    }, 300);
  }

  /* ============================
     FLUIDITY: Button press feedback
     ============================ */
  document.addEventListener('mousedown', function(e){
    var btn = e.target.closest('.btn');
    if(btn) btn.style.transform = 'scale(0.97)';
  });
  document.addEventListener('mouseup', function(e){
    var btn = e.target.closest('.btn');
    if(btn) setTimeout(function(){ btn.style.transform = ''; }, 100);
  });

})();
