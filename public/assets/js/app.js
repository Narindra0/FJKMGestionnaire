/*
 * app.js — Point d'entrée principal FJKM Gestionnaire
 * Charge les modules: sidebar.js, dark-mode.js, forms.js, modals.js
 * Contient: init, event listeners globaux, logique métier, AJAX, impression
 */
(function(){
  var communionHistoryCache = [];

  /* ============================
     UTILITIES (restent ici car utilisées partout)
     ============================ */
  window.FJKM_escapeHtml = function(s){return String(s ?? '').replace(/[&<>"']/g, function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]);});};

  function notifyError(title, text){
    if(window.Swal) Swal.fire({icon:'error', title:title, text:text});
    else alert(title + '\n' + text);
  }

  function debounce(fn, delay){
    var timer;
    return function(){ clearTimeout(timer); timer = setTimeout(fn, delay); };
  }

  function baseUrl(path){
    var base = (window.FJKM_BASE_URL || '/').replace(/\/$/, '');
    return base + '/' + String(path).replace(/^\//, '');
  }

  /* ============================
     TABLE FILTERS (utilisé par forms.js et app.js)
     ============================ */
  function applyTableFilters(selector){
    if(!selector) return;
    var table = document.querySelector(selector);
    if(!table) return;
    var dateFilters = Array.from(document.querySelectorAll('.date-range-filter[data-table="' + selector + '"]'));
    var textFilters = Array.from(document.querySelectorAll('.table-filter[data-table="' + selector + '"]'));
    var from = '', to = '';
    dateFilters.forEach(function(input, index){
      var id = (input.id || '').toLowerCase();
      var value = window.FJKM_parseDateToIso(input.value || '');
      if(id.includes('from') || id.includes('debut') || (!from && index === 0)) from = value;
      if(id.includes('to') || id.includes('fin') || id.includes('au') || index === 1) to = value;
    });
    var search = textFilters.map(function(i){ return String(i.value || '').trim().toLowerCase(); }).filter(Boolean).join(' ');
    var periodFilter = document.querySelector('.month-period-filter[data-table="' + selector + '"]');
    var selectedMonths = new Set(Array.from(document.querySelectorAll('.month-filter-checkbox[data-table="' + selector + '"]:checked')).map(function(box){ return String(box.value); }));
    var monthSource = periodFilter ? (periodFilter.dataset.monthSource || '') : '';

    table.querySelectorAll('tbody tr').forEach(function(row){
      if(row.classList.contains('collapse')) return;
      var date = row.dataset.date || row.dataset.created || row.dataset.payment || row.querySelector('td')?.textContent.split('/').reverse().join('-') || '';
      var okFrom = !from || !date || date >= from;
      var okTo = !to || !date || date <= to;
      var text = row.textContent.toLowerCase();
      var okText = !search || search.split(/\s+/).every(function(word){ return text.includes(word); });
      var fidelFilter = table.dataset.fidelFilter || '';
      var okFidel = !fidelFilter || row.dataset.fidelId === fidelFilter;
      var rowMonth = '';
      if(monthSource) rowMonth = String(row.dataset[monthSource] || '');
      if(!rowMonth && date && /^\d{4}-\d{2}-\d{2}$/.test(date)) rowMonth = String(Number(date.slice(5,7)));
      var okMonth = selectedMonths.size === 0 || selectedMonths.has(rowMonth);
      row.style.display = (okFrom && okTo && okText && okFidel && okMonth) ? '' : 'none';
    });
    updateTableTotal(table);
  }

  window.FJKM_applyTableFilters = applyTableFilters;

  function updateTableTotal(table){
    if(!table) return;
    var rows = Array.from(table.querySelectorAll('tbody tr')).filter(function(row){ return row.style.display !== 'none' && !row.classList.contains('collapse'); });
    var countCell = table.querySelector('.table-total-count');
    if(countCell) countCell.textContent = String(rows.length);

    var budgetCell = table.querySelector('.table-total-budget');
    var paidCell = table.querySelector('.table-total-paid');
    var restCell = table.querySelector('.table-total-rest');
    if(budgetCell || paidCell || restCell){
      var budget = 0, paid = 0, rest = 0;
      rows.forEach(function(row){
        budget += Number(String(row.dataset.budget || '0').replace(',', '.')) || 0;
        paid += Number(String(row.dataset.paid || '0').replace(',', '.')) || 0;
        rest += Number(String(row.dataset.rest || '0').replace(',', '.')) || 0;
      });
      if(budgetCell) budgetCell.textContent = window.formatMoney(budget);
      if(paidCell) paidCell.textContent = window.formatMoney(paid);
      if(restCell) restCell.textContent = window.formatMoney(rest);
    }

    var totalCell = table.querySelector('.table-total-amount');
    if(!totalCell) return;
    var total = 0;
    rows.forEach(function(row){
      if(row.dataset.amount !== undefined){ total += Number(String(row.dataset.amount).replace(',', '.')) || 0; return; }
      var amountCell = row.querySelector('[data-amount-cell]') || row.children[row.children.length - 1];
      if(!amountCell) return;
      var match = amountCell.textContent.replace(/\s/g, ' ').match(/[0-9][0-9 .]*/);
      if(match) total += Number(match[0].replace(/[ .]/g, '')) || 0;
    });
    totalCell.textContent = window.formatMoney(total);
  }

  function resetTableFiltersFor(selector){
    if(!selector) return;
    document.querySelectorAll('.table-filter[data-table="' + selector + '"]').forEach(function(input){ input.value = ''; });
    document.querySelectorAll('.date-range-filter[data-table="' + selector + '"]').forEach(function(input){
      input.value = '';
      var hidden = input.dataset.dateValueSelector ? document.querySelector(input.dataset.dateValueSelector) : null;
      if(hidden) hidden.value = '';
      var wrapper = input.closest('.manual-date-field');
      var picker = wrapper ? wrapper.querySelector('.manual-date-native') : null;
      if(picker) picker.value = '';
      input.classList.remove('is-invalid');
    });
    document.querySelectorAll('.month-filter-checkbox[data-table="' + selector + '"]').forEach(function(box){ box.checked = false; });
    var period = document.querySelector('.month-period-filter[data-table="' + selector + '"]');
    if(period) period.open = false;
    refreshMonthPeriodLabel(selector);
    applyTableFilters(selector);
  }

  function refreshMonthPeriodLabel(selector){
    var filter = document.querySelector('.month-period-filter[data-table="' + selector + '"]');
    if(!filter) return;
    var summary = filter.querySelector('summary');
    var checked = Array.from(document.querySelectorAll('.month-filter-checkbox[data-table="' + selector + '"]:checked'));
    if(!summary) return;
    if(!checked.length || checked.length === 12) summary.textContent = 'Période : tous les mois';
    else if(checked.length === 1) summary.textContent = 'Période : ' + (checked[0].closest('label')?.textContent.trim() || '1 mois');
    else summary.textContent = 'Période : ' + checked.length + ' mois';
  }

  /* ============================
     RESPONSIVE
     ============================ */
  function prepareResponsiveInterface(scope){
    var root = scope || document;
    var forms = [];
    var tables = [];
    if(root.matches && root.matches('form.row')) forms.push(root);
    if(root.querySelectorAll) forms.push.apply(forms, Array.from(root.querySelectorAll('form.row')));
    forms.forEach(function(form){ form.classList.add('responsive-form'); });
    if(root.matches && root.matches('table.table')) tables.push(root);
    if(root.querySelectorAll) tables.push.apply(tables, Array.from(root.querySelectorAll('table.table')));
    Array.from(new Set(tables)).forEach(function(table){
      var headers = Array.from(table.querySelectorAll('thead th')).map(function(th){ return th.textContent.replace(/\s+/g, ' ').trim(); });
      if(!headers.length) return;
      table.classList.add('responsive-card-table');
      table.querySelectorAll('tbody tr, tfoot tr').forEach(function(row){
        Array.from(row.children).forEach(function(cell, index){
          if(cell.getAttribute('colspan')) return;
          if(!cell.getAttribute('data-label')) cell.setAttribute('data-label', headers[index] || 'Information');
        });
      });
    });
  }

  function observeResponsiveContent(){
    if(!window.MutationObserver) return;
    var target = document.querySelector('.page-content') || document.body;
    var refresh = debounce(function(){ prepareResponsiveInterface(target); }, 120);
    new MutationObserver(function(mutations){
      var hasUsefulChange = mutations.some(function(mutation){
        return Array.from(mutation.addedNodes || []).some(function(node){
          if(node.nodeType !== 1) return false;
          return (typeof node.matches === 'function' && node.matches('table, tbody, tr, td, form')) || (typeof node.querySelector === 'function' && node.querySelector('table, tbody, tr, td, form'));
        });
      });
      if(hasUsefulChange) refresh();
    }).observe(target, {childList:true, subtree:true});
  }

  /* ============================
     OBLIGATION / COMMUNION BUSINESS LOGIC
     ============================ */
  function loadObligationRest(){
    var lookup = document.getElementById('obligationFidelLookup');
    var hidden = document.getElementById('obligationFidelId');
    var month = document.getElementById('obligationMonth');
    var year = document.getElementById('obligationYear');
    var help = document.getElementById('obligationStatusHelp');
    if(!lookup || !help) return;
    var q = lookup.value.trim();
    if(!q){
      if(hidden) hidden.value = '';
      help.className = 'alert alert-info py-2 mb-3 d-none'; help.textContent = '';
      renderObligationHistory([]);
      filterObligationTableByFidel('');
      return;
    }
    $.get(baseUrl('api/obligations/rest'), {q:q, fidel_id:hidden ? hidden.value : '', period_month:month ? month.value : '', period_year:year ? year.value : ''}, function(res){
      if(!res.success){ help.className = 'alert alert-warning py-2 mb-3'; help.textContent = res.message || 'Chrétien introuvable.'; renderObligationHistory([]); filterObligationTableByFidel(''); return; }
      if(hidden && res.fidel && res.fidel.id) hidden.value = res.fidel.id;
      filterObligationTableByFidel(res.fidel && res.fidel.id ? String(res.fidel.id) : '');
      renderObligationHistory(res.history || []);
      if(res.has_open){
        $('#existingObligationId').val(res.obligation.id);
        $('#obligationDue').val(window.FJKM_formatMoneyInputValue(res.obligation.amount_due));
        $('#obligationLabel').val(res.obligation.label || 'Obligation mensuelle');
        $('#obligationRest').val(window.formatMoney(res.rest));
        $('#obligationPayment').val(window.FJKM_formatMoneyInputValue(res.rest > 0 ? res.rest : 0)).attr('max', res.rest > 0 ? res.rest : 0);
        help.className = 'alert alert-success py-2 mb-3'; help.textContent = res.message + ' — saisissez le montant payé maintenant pour continuer.';
      } else {
        $('#existingObligationId').val(''); $('#obligationRest').val('0 Ar');
        var defaultDue = window.FJKM_moneyValue($('#obligationDue').val() || 0);
        $('#obligationPayment').attr('max', defaultDue > 0 ? defaultDue : '').val(window.FJKM_formatMoneyInputValue(0));
        help.className = 'alert alert-info py-2 mb-3'; help.textContent = res.message;
      }
    });
  }

  var communionHistoryCache = [];

  function loadCommunionHistory(){
    var lookup = document.getElementById('communionFidelLookup');
    var hidden = document.getElementById('communionFidelId');
    var box = document.getElementById('communionHistory');
    if(!lookup || !box) return;
    var q = lookup.value.trim();
    if(!q){ communionHistoryCache = []; resetCommunionMonthsVisibility(); box.className='alert alert-info py-2 mb-3 d-none'; box.textContent=''; return; }
    $.get(baseUrl('api/communion/history'), {q:q, fidel_id:hidden ? hidden.value : ''}, function(res){
      if(!res.success){ communionHistoryCache = []; resetCommunionMonthsVisibility(); box.className='alert alert-warning py-2 mb-3'; box.textContent=res.message || 'Chrétien introuvable.'; return; }
      if(hidden && res.fidel && res.fidel.id) hidden.value = res.fidel.id;
      communionHistoryCache = res.history || [];
      applyCommunionPaidMonths(communionHistoryCache);
      if(!communionHistoryCache.length){ box.className='alert alert-info py-2 mb-3'; box.textContent='Aucun paiement communion trouvé pour ce chrétien.'; return; }
      box.className='alert alert-success py-2 mb-3';
      box.innerHTML = '<strong>Derniers paiements :</strong> ' + communionHistoryCache.slice(0,6).map(function(h){ return window.FJKM_escapeHtml(monthName(Number(h.paid_month))) + ' ' + window.FJKM_escapeHtml(h.paid_year) + ' — payé le ' + window.FJKM_escapeHtml(h.payment_date) + ' : ' + window.formatMoney(h.amount); }).join(' | ');
    });
  }

  function applyCommunionPaidMonths(history){
    var yearInput = document.getElementById('communionYear');
    var selectedYear = Number(yearInput ? yearInput.value : new Date().getFullYear());
    resetCommunionMonthsVisibility();
    var paidMonths = new Set((history || []).filter(function(h){ return Number(h.paid_year) === selectedYear; }).map(function(h){ return Number(h.paid_month); }));
    document.querySelectorAll('.month-box').forEach(function(box){
      var month = Number(box.dataset.monthBox || '0');
      var checkbox = box.querySelector('.communion-month');
      if(paidMonths.has(month)){ if(checkbox){ checkbox.checked = false; checkbox.disabled = true; } box.classList.add('d-none'); }
    });
  }

  function resetCommunionMonthsVisibility(){
    document.querySelectorAll('.month-box').forEach(function(box){ box.classList.remove('d-none'); });
    document.querySelectorAll('.communion-month').forEach(function(cb){ cb.disabled = false; });
  }

  function monthName(month){
    var months = {1:'Janvier',2:'Février',3:'Mars',4:'Avril',5:'Mai',6:'Juin',7:'Juillet',8:'Août',9:'Septembre',10:'Octobre',11:'Novembre',12:'Décembre'};
    return months[month] || ('Mois '+month);
  }

  function renderObligationHistory(history){
    var box = document.getElementById('obligationHistoryBox');
    if(!box) return;
    if(!history || !history.length){ box.classList.add('d-none'); box.innerHTML = ''; return; }
    box.classList.remove('d-none');
    var rows = history.slice(0, 8).map(function(h){
      var rest = Math.max(0, Number(h.amount_due || 0) - Number(h.amount_paid || 0));
      return '<tr><td>'+window.FJKM_escapeHtml(h.period_name || '')+'</td><td>'+window.formatMoney(h.amount_paid)+'</td><td>'+window.formatMoney(h.amount_due)+'</td><td>'+window.formatMoney(rest)+'</td><td>'+window.FJKM_escapeHtml(h.status || '')+'</td></tr>';
    }).join('');
    box.innerHTML = '<div class="table-responsive"><table class="table table-sm table-bordered mb-0"><thead><tr><th>Adidy farany</th><th>Vola naloha</th><th>Total adidy</th><th>Reste</th><th>Statut</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  }

  function filterObligationTableByFidel(fidelId){
    var table = document.getElementById('obligationsTable');
    if(!table) return;
    table.dataset.fidelFilter = fidelId || '';
    applyTableFilters('#obligationsTable');
  }

  /* ============================
     PROJECT PAYMENT SELECT
     ============================ */
  function initProjectPaymentSelect(){
    var select = document.getElementById('projectSelect');
    if(!select) return;
    var rest = document.getElementById('projectRest');
    var referenceInput = document.getElementById('projectReference');
    var nameInput = document.getElementById('projectName');
    var budget = document.getElementById('projectBudget');
    var status = document.getElementById('projectStatus');
    var start = document.getElementById('projectStart');
    var end = document.getElementById('projectEnd');
    var description = document.getElementById('projectDescription');
    var amount = document.getElementById('projectPaymentAmount');
    var budgetRawInput = document.getElementById('projectBudgetRaw');
    var restRawInput = document.getElementById('projectRestRaw');

    var numeric = function(value){ return window.FJKM_moneyValue(value); };
    var money = function(value){ return window.FJKM_formatMoneyInputValue(value) + ' Ar'; };
    var statusLabel = function(value){ var map = {planned:'Prévu', ongoing:'En cours', almost_completed:'Presque terminé', completed:'Terminé', cancelled:'Annulé'}; return map[value] || value || 'Prévu'; };
    var selectedProject = function(){
      var opt = select.selectedOptions && select.selectedOptions[0] ? select.selectedOptions[0] : null;
      if(!opt || !opt.value) return null;
      var totalToPay = numeric(opt.dataset.budgetRaw || opt.dataset.budget || 0);
      var alreadyPaid = numeric(opt.dataset.collected || 0);
      var currentRest = numeric(opt.dataset.rest || Math.max(0, totalToPay - alreadyPaid));
      if(currentRest <= 0 && totalToPay > 0) currentRest = Math.max(0, totalToPay - alreadyPaid);
      return { option:opt, reference:opt.dataset.reference||'', name:opt.dataset.name||'', totalToPay:totalToPay, alreadyPaid:alreadyPaid, currentRest:currentRest, status:opt.dataset.status||'planned', start:opt.dataset.start||'', end:opt.dataset.end||'', description:opt.dataset.description||'' };
    };
    var refreshProjectFields = function(clearAmount){
      var project = selectedProject();
      if(clearAmount && amount) amount.value = '';
      if(!project){
        if(referenceInput) referenceInput.value = '-'; if(nameInput) nameInput.value = '-'; if(budget) budget.value = '0 Ar'; if(rest) rest.value = '0 Ar';
        if(budgetRawInput) budgetRawInput.value = '0'; if(restRawInput) restRawInput.value = '0'; if(status) status.value = 'Prévu';
        if(start) start.value = ''; if(end) end.value = '';
        if(amount){ amount.removeAttribute('max'); amount.placeholder = 'Sélectionnez d\'abord un projet'; }
        return;
      }
      var typedAmount = Math.max(0, numeric(amount ? amount.value : 0));
      var restAfterTyping = Math.max(0, project.currentRest - typedAmount);
      if(referenceInput) referenceInput.value = project.reference || '-'; if(nameInput) nameInput.value = project.name || '-';
      if(budget) budget.value = money(project.totalToPay); if(rest) rest.value = money(restAfterTyping);
      if(budgetRawInput) budgetRawInput.value = String(project.totalToPay); if(restRawInput) restRawInput.value = String(restAfterTyping);
      if(status) status.value = statusLabel(project.status);
      if(start) start.value = window.FJKM_formatDateDisplay(project.start || ''); if(end) end.value = window.FJKM_formatDateDisplay(project.end || '');
      if(description && document.activeElement !== description) description.value = project.description || '';
      if(amount){ amount.setAttribute('max', String(project.currentRest)); amount.placeholder = project.currentRest > 0 ? 'Maximum : ' + money(project.currentRest) : 'Projet terminé ou non sélectionné'; }
    };
    select.addEventListener('change', function(){ refreshProjectFields(true); });
    select.addEventListener('input', function(){ refreshProjectFields(true); });
    select.addEventListener('blur', function(){ refreshProjectFields(false); });
    if(amount){ ['input','change','keyup'].forEach(function(evt){ amount.addEventListener(evt, function(){ refreshProjectFields(false); }); }); }
    refreshProjectFields(false);
  }

  /* ============================
     VALIDATION
     ============================ */
  function validateObligationPaymentBeforeSubmit(form, event){
    var payment = form.querySelector('#obligationPayment');
    if(!payment) return true;
    var max = window.FJKM_moneyValue(payment.getAttribute('max') || form.querySelector('#obligationDue')?.value || 0);
    var value = window.FJKM_moneyValue(payment.value || 0);
    if(max >= 0 && value > max){ event.preventDefault(); event.stopPropagation(); payment.value = window.FJKM_formatMoneyInputValue(max); notifyError('Montant dépassé', 'Le montant payé ne doit pas dépasser le reste à payer.'); payment.focus(); return false; }
    return true;
  }

  function validateProjectPaymentBeforeSubmit(form, event){
    var select = form.querySelector('#projectSelect');
    var amount = form.querySelector('#projectPaymentAmount');
    if(!select || !amount) return true;
    var opt = select.selectedOptions && select.selectedOptions[0] ? select.selectedOptions[0] : null;
    var rest = opt ? window.FJKM_moneyValue(opt.dataset.rest || 0) : 0;
    var value = window.FJKM_moneyValue(amount.value || 0);
    if(rest > 0 && value > rest){ event.preventDefault(); event.stopPropagation(); amount.value = window.FJKM_formatMoneyInputValue(rest); notifyError('Montant dépassé', 'Le montant versé ne doit pas dépasser le reste du projet.'); amount.focus(); return false; }
    return true;
  }

  /* ============================
     FILL / RESET FORM (edit-to-form)
     ============================ */
  function fillTopForm(button){
    var form = document.querySelector(button.dataset.form || '');
    if(!form) return;
    var values = JSON.parse(button.dataset.values || '{}');
    var action = button.dataset.action;
    if(action) form.setAttribute('action', action);
    Object.keys(values).forEach(function(name){
      var fields = form.querySelectorAll('[name="' + window.FJKM_cssEscape(name) + '"]');
      if(!fields.length){
        if(name === 'fidel_id') fields = form.querySelectorAll('#obligationFidelId,#communionFidelId');
        if(name === 'existing_obligation_id') fields = form.querySelectorAll('#existingObligationId');
        if(name === 'amount_paid') fields = form.querySelectorAll('#obligationPaidHidden');
      }
      fields.forEach(function(field){
        var value = values[name] ?? '';
        if(field.type === 'checkbox') field.checked = Array.isArray(value) ? value.includes(field.value) : String(field.value) === String(value);
        else field.value = value;
      });
    });
    if(values.paid_year && form.querySelector('[name="year"]')){ var yearInput = form.querySelector('[name="year"]'); if(yearInput) yearInput.value = values.paid_year; }
    if(values.paid_month){ form.querySelectorAll('.month-box').forEach(function(box){ box.classList.remove('d-none'); }); form.querySelectorAll('.communion-month').forEach(function(cb){ cb.disabled = false; cb.checked = cb.value === String(values.paid_month); }); }
    if(values.amount_paid !== undefined){ var payment = form.querySelector('[name="payment_amount"]'); if(payment) payment.value = values.amount_paid; }
    if(values.amount_due !== undefined && values.amount_paid !== undefined){
      var restValue = Math.max(0, Number(values.amount_due || 0) - Number(values.amount_paid || 0));
      var restEl = form.querySelector('#obligationRest'); if(restEl) restEl.value = window.formatMoney(restValue);
      var pay = form.querySelector('#obligationPayment'); if(pay) pay.setAttribute('max', restValue);
    }
    var submit = document.querySelector(button.dataset.submit || '');
    if(submit && button.dataset.submitText) submit.textContent = button.dataset.submitText;
    var title = document.querySelector(button.dataset.title || '');
    if(title && button.dataset.titleText) title.childNodes[0].nodeValue = button.dataset.titleText + ' ';
    window.FJKM_syncManualDateInputs(form, true);
    window.FJKM_formatMoneyInputs(form);
    form.querySelectorAll('[data-reset-form]').forEach(function(btn){ btn.classList.remove('d-none'); });
    form.classList.remove('was-validated');
    var scrollTarget = document.querySelector(button.dataset.scroll || button.dataset.form || '');
    if(scrollTarget) scrollTarget.scrollIntoView({behavior:'smooth', block:'start'});
  }

  function resetTopForm(button){
    var form = document.querySelector(button.dataset.resetForm || '');
    if(!form) return;
    form.setAttribute('action', form.dataset.createAction || form.getAttribute('action'));
    form.reset(); form.classList.remove('was-validated');
    form.querySelectorAll('[data-default-value]').forEach(function(input){ input.value = input.dataset.defaultValue || ''; });
    form.querySelectorAll('[data-required-hidden="true"], #existingObligationId, #obligationPaidHidden').forEach(function(input){ input.value = ''; });
    form.querySelectorAll('.month-box').forEach(function(box){ box.classList.remove('d-none'); });
    form.querySelectorAll('.communion-month').forEach(function(cb){ cb.disabled = false; cb.checked = false; });
    communionHistoryCache = [];
    var title = document.querySelector(button.dataset.title || '');
    if(title && button.dataset.titleText) title.childNodes[0].nodeValue = button.dataset.titleText + ' ';
    var submit = form.querySelector('button[type="submit"], button:not([type])');
    if(submit) submit.textContent = submit.dataset.defaultText || 'Enregistrer';
    button.classList.add('d-none');
    var restEl = form.querySelector('#obligationRest'); if(restEl) restEl.value = '0 Ar';
    window.FJKM_syncManualDateInputs(form, true);
    window.FJKM_formatMoneyInputs(form);
    var history = document.getElementById('communionHistory');
    if(history){ history.className='alert alert-info py-2 mb-3 d-none'; history.textContent=''; }
  }

  /* ============================
     PRINT FUNCTIONS
     ============================ */
  function printSingleRow(button){
    var table = button.closest('table');
    var sourceRow = button.closest('tr');
    if(!table || !sourceRow){ notifyError('Impression impossible', 'Ligne introuvable.'); return; }
    var head = table.querySelector('thead') ? table.querySelector('thead').cloneNode(true) : null;
    var row = sourceRow.cloneNode(true);
    [head, row].forEach(function(node){ if(node) node.querySelectorAll('.no-print, .action-buttons, button, form').forEach(function(el){ el.remove(); }); });
    var title = table.closest('.premium-card')?.querySelector('h3')?.textContent.trim() || 'Impression';
    var printedAt = new Date().toLocaleDateString('fr-FR');
    var html = '<html><head><title>'+window.FJKM_escapeHtml(title)+'</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}.church-head{text-align:center;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px}.meta{text-align:right;font-size:12px;margin-bottom:10px}table{width:100%;border-collapse:collapse;margin-top:10px}thead{display:table-header-group}td,th{border:1px solid #777;padding:7px;text-align:left;font-size:12px}th{background:#f1f1f1}</style></head><body><div class="church-head"><h1>FJKM MALAZA GILEADA</h1><h2>GESTION D\'OBLIGATION AU SEIN D\'EGLISE FJKM MALAZA GILEADA</h2><h3>'+window.FJKM_escapeHtml(title)+'</h3></div><div class="meta">Date d\'impression : '+printedAt+'</div><table>'+(head ? head.outerHTML : '')+'<tbody>'+row.outerHTML+'</tbody></table></body></html>';
    openPrintWindow(html, title);
  }

  function printFilteredTable(button){
    var table = document.querySelector(button.dataset.table || '');
    if(!table) return;
    var title = button.dataset.title || 'Impression';
    var subtitle = button.dataset.subtitle || 'FJKM MALAZA GILEADA';
    var memberSelector = button.dataset.member || '';
    var memberNode = memberSelector ? document.querySelector(memberSelector) : null;
    var memberClone = memberNode ? memberNode.cloneNode(true) : null;
    if(memberClone) memberClone.querySelectorAll('.no-print, .member-print-actions, button, a, form').forEach(function(el){ el.remove(); });
    var memberHtml = memberClone ? '<div class="member-print-block">' + memberClone.innerHTML + '</div>' : '';
    var clone = table.cloneNode(true);
    if(button.dataset.noTotals === '1'){ clone.querySelectorAll('tfoot').forEach(function(el){ el.remove(); }); }
    clone.querySelectorAll('.no-print, .action-buttons, button, form').forEach(function(el){ el.remove(); });
    var originalRows = Array.from(table.querySelectorAll('tbody tr'));
    var clonedRows = Array.from(clone.querySelectorAll('tbody tr'));
    clonedRows.forEach(function(row, index){ var original = originalRows[index]; if(!original || original.style.display === 'none') row.remove(); });
    clone.querySelectorAll('tr').forEach(function(row){ Array.from(row.children).forEach(function(cell){ if(cell.classList.contains('no-print')) cell.remove(); }); });
    var visibleOriginalRows = originalRows.filter(function(row){ return row.style.display !== 'none' && !row.classList.contains('collapse'); });
    var countCell = clone.querySelector('.table-total-count');
    if(countCell) countCell.textContent = String(visibleOriginalRows.length);
    var totalCell = clone.querySelector('.table-total-amount');
    if(totalCell){ var total = 0; visibleOriginalRows.forEach(function(row){ if(row.dataset.amount !== undefined) total += Number(String(row.dataset.amount).replace(',','.')) || 0; }); totalCell.textContent = window.formatMoney(total); }
    var printedAt = new Date().toLocaleDateString('fr-FR');
    var html = '<html><head><title>'+window.FJKM_escapeHtml(title)+'</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1,h2,h3,p{text-align:center;margin:4px 0}.church-head{border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px}.church-head h1{font-size:20px;text-transform:uppercase}.church-head h2{font-size:18px}.meta{text-align:right;font-size:12px;margin-bottom:10px}.member-print-block{border:1px solid #777;padding:12px;margin:10px 0 16px}.member-print-photo{width:90px;height:90px;object-fit:cover;border:1px solid #777;border-radius:8px}table{width:100%;border-collapse:collapse;margin-top:10px}thead{display:table-header-group}tfoot{display:table-footer-group}td,th{border:1px solid #777;padding:7px;text-align:left;font-size:12px}th{background:#f1f1f1}</style></head><body><div class="church-head"><h1>'+window.FJKM_escapeHtml(subtitle)+'</h1><h2>GESTION D\'OBLIGATION AU SEIN D\'EGLISE FJKM MALAZA GILEADA</h2><h3>'+window.FJKM_escapeHtml(title)+'</h3></div><div class="meta">Date d\'impression : '+printedAt+'</div>'+memberHtml+clone.outerHTML+'</body></html>';
    openPrintWindow(html, title);
  }

  function printMemberProfile(selector){
    var member = document.querySelector(selector || '#memberPrintInfo');
    if(!member){ notifyError('Impression impossible', 'La fiche chrétien est introuvable.'); return; }
    var clone = member.cloneNode(true);
    clone.querySelectorAll('.no-print, .member-print-actions, button, a').forEach(function(el){ el.remove(); });
    var printedAt = new Date().toLocaleDateString('fr-FR');
    var html = '<html><head><title>Fiche Chrétien</title><style>body{font-family:Arial,sans-serif;padding:26px;color:#111}.church-head{text-align:center;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px}.church-head h1{font-size:20px;margin:4px 0}.church-head h2{font-size:16px;margin:4px 0}.meta{text-align:right;font-size:12px;margin-bottom:12px}.member-print-photo{width:92px;height:92px;object-fit:cover;border:1px solid #777;border-radius:8px}.d-flex{display:flex}.gap-3{gap:18px}.align-items-start{align-items:flex-start}.flex-wrap{flex-wrap:wrap}.flex-grow-1{flex-grow:1}table{width:100%;border-collapse:collapse;margin-top:8px}td,th{border:1px solid #777;padding:7px;text-align:left;font-size:12px}th{background:#f1f1f1;width:145px}h2,h3{margin:4px 0}</style></head><body><div class="church-head"><h1>FJKM MALAZA GILEADA</h1><h2>GESTION D\'OBLIGATION AU SEIN D\'EGLISE FJKM MALAZA GILEADA</h2><h3>Fiche Chrétien</h3></div><div class="meta">Date d\'impression : '+printedAt+'</div>'+clone.outerHTML+'</body></html>';
    openPrintWindow(html, 'Fiche Chrétien');
  }

  function visibleTableClone(selector, title){
    var table = document.querySelector(selector);
    if(!table) return '';
    var clone = table.cloneNode(true);
    clone.querySelectorAll('.no-print, .action-buttons, button, form, tfoot').forEach(function(el){ el.remove(); });
    var originalRows = Array.from(table.querySelectorAll('tbody tr'));
    var clonedRows = Array.from(clone.querySelectorAll('tbody tr'));
    clonedRows.forEach(function(row, index){ var original = originalRows[index]; if(!original || original.style.display === 'none') row.remove(); });
    return '<h3 style="text-align:left;margin-top:18px">'+window.FJKM_escapeHtml(title)+'</h3>'+clone.outerHTML;
  }

  function openPrintWindow(html, title){
    var w = window.open('', '_blank', 'width=960,height=700');
    if(!w){ notifyError('Impression bloquée', 'Autorisez les pop-ups du navigateur.'); return null; }
    w.document.open(); w.document.write(html); w.document.close(); w.document.title = title || 'Impression';
    window.setTimeout(function(){ try { w.focus(); w.print(); } catch(err){} }, 250);
    return w;
  }

  function printMemberHistories(){
    var memberNode = document.getElementById('memberPrintInfo');
    if(!memberNode){ notifyError('Impression impossible', 'Mombamomba Chrétien introuvable.'); return; }
    var memberClone = memberNode.cloneNode(true);
    memberClone.querySelectorAll('.no-print, button, a').forEach(function(el){ el.remove(); });
    var obligationHtml = visibleTableClone('#memberObligationTable', 'Historique obligation');
    var communionHtml = visibleTableClone('#memberCommunionTable', 'Historique communion');
    var printedAt = new Date().toLocaleDateString('fr-FR');
    var html = '<html><head><title>Historiques Chrétien</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}.church-head{border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px;text-align:center}.church-head h1{font-size:20px;text-transform:uppercase;margin:4px 0}.church-head h2{font-size:18px;margin:4px 0}.meta{text-align:right;font-size:12px;margin-bottom:10px}.member-print-block{border:1px solid #777;padding:12px;margin:10px 0 16px}.member-print-photo{width:90px;height:90px;object-fit:cover;border:1px solid #777;border-radius:8px}table{width:100%;border-collapse:collapse;margin-top:10px}thead{display:table-header-group}td,th{border:1px solid #777;padding:7px;text-align:left;font-size:12px}th{background:#f1f1f1}</style></head><body><div class="church-head"><h1>FJKM MALAZA GILEADA</h1><h2>GESTION D\'OBLIGATION AU SEIN D\'EGLISE FJKM MALAZA GILEADA</h2><h3>Historiques Chrétien</h3></div><div class="meta">Date d\'impression : '+printedAt+'</div><div class="member-print-block">'+memberClone.innerHTML+'</div>'+obligationHtml+communionHtml+'</body></html>';
    openPrintWindow(html, 'Historiques Chrétien');
  }

  window.printMemberProfile = printMemberProfile;
  window.printMemberHistories = printMemberHistories;
  window.printFilteredTable = printFilteredTable;

  /* ============================
     GLOBAL EVENT LISTENERS
     ============================ */
  document.addEventListener('click', function(e){
    var selectAllMonths = e.target.closest('.month-filter-select-all');
    if(selectAllMonths){ e.preventDefault(); document.querySelectorAll('.month-filter-checkbox[data-table="' + selectAllMonths.dataset.table + '"]').forEach(function(box){ box.checked = true; }); refreshMonthPeriodLabel(selectAllMonths.dataset.table); applyTableFilters(selectAllMonths.dataset.table); return; }
    var clearMonths = e.target.closest('.month-filter-clear');
    if(clearMonths){ e.preventDefault(); document.querySelectorAll('.month-filter-checkbox[data-table="' + clearMonths.dataset.table + '"]').forEach(function(box){ box.checked = false; }); refreshMonthPeriodLabel(clearMonths.dataset.table); applyTableFilters(clearMonths.dataset.table); return; }
    var resetFilters = e.target.closest('.reset-table-filters');
    if(resetFilters){ e.preventDefault(); resetTableFiltersFor(resetFilters.dataset.table || ''); return; }
    var toggle = e.target.closest('.password-toggle');
    if(toggle){ var input = document.querySelector(toggle.dataset.target); if(input){ input.type = input.type === 'password' ? 'text' : 'password'; toggle.classList.toggle('is-visible', input.type === 'text'); toggle.setAttribute('aria-label', input.type === 'password' ? 'Afficher le mot de passe' : 'Masquer le mot de passe'); } }
    var edit = e.target.closest('.edit-to-form');
    if(edit){ e.preventDefault(); fillTopForm(edit); }
    var reset = e.target.closest('[data-reset-form]');
    if(reset){ e.preventDefault(); resetTopForm(reset); }
    var printFiltered = e.target.closest('.print-filtered-table');
    if(printFiltered){ e.preventDefault(); printFilteredTable(printFiltered); }
    var rowPrint = e.target.closest('.print-row');
    if(rowPrint){ e.preventDefault(); e.stopImmediatePropagation(); printSingleRow(rowPrint); return; }
    var profilePrint = e.target.closest('[data-print-member-profile]');
    if(profilePrint){ e.preventDefault(); printMemberProfile(profilePrint.dataset.printMemberProfile || '#memberPrintInfo'); return; }
    var historiesPrint = e.target.closest('[data-print-member-histories]');
    if(historiesPrint){ e.preventDefault(); printMemberHistories(); }
  });

  document.addEventListener('input', function(e){
    var target = e.target;
    if(target && (target.classList.contains('table-filter') || target.classList.contains('date-range-filter') || target.classList.contains('month-filter-checkbox'))){
      if(target.classList.contains('month-filter-checkbox')) refreshMonthPeriodLabel(target.dataset.table);
      applyTableFilters(target.dataset.table);
    }
  });

  document.addEventListener('change', function(e){
    var target = e.target;
    if(target && (target.classList.contains('table-filter') || target.classList.contains('date-range-filter') || target.classList.contains('month-filter-checkbox'))){
      if(target.classList.contains('month-filter-checkbox')) refreshMonthPeriodLabel(target.dataset.table);
      applyTableFilters(target.dataset.table);
    }
  });

  document.addEventListener('submit', function(e){
    if(e.target && e.target.tagName === 'FORM'){
      window.FJKM_syncManualDateInputs(e.target);
      window.FJKM_formatMoneyInputs(e.target);
    }
  }, true);

  /* ============================
     INIT
     ============================ */
  window.FJKM_initDarkMode();
  window.FJKM_setupDarkModeToggle();
  window.FJKM_initSidebar();
  window.FJKM_initActiveSidebar();
  prepareResponsiveInterface();
  observeResponsiveContent();
  window.FJKM_initManualDateInputs();
  window.FJKM_initMoneyInputs();
  document.querySelectorAll('.fidel-lookup').forEach(window.FJKM_initFidelLookup);
  document.querySelectorAll('.phone-input').forEach(window.FJKM_initPhoneInput);
  initProjectPaymentSelect();
  document.querySelectorAll('.print-clean-table').forEach(updateTableTotal);
  window.FJKM_initModalReset();
  window.FJKM_initViewMemberModal();
  window.FJKM_initPremiumAnimations();
  window.FJKM_initFlashDismiss();
  window.FJKM_initFormLoading();
  window.FJKM_initButtonFeedback();

  document.querySelectorAll('form.needs-validation').forEach(function(form){
    form.addEventListener('submit', function(event){
      window.FJKM_syncManualDateInputs(form);
      window.FJKM_formatMoneyInputs(form);
      if(form.id === 'obligationForm' && !validateObligationPaymentBeforeSubmit(form, event)){ form.classList.add('was-validated'); return; }
      if(form.id === 'projectPaymentForm' && !validateProjectPaymentBeforeSubmit(form, event)){ form.classList.add('was-validated'); return; }
      var hiddenOk = true;
      form.querySelectorAll('[data-required-hidden="true"]').forEach(function(hidden){ if(!hidden.value) hiddenOk = false; });
      if(!form.checkValidity() || !hiddenOk){ event.preventDefault(); event.stopPropagation(); notifyError('Champ obligatoire', 'Veuillez remplir ce champ avant de continuer.'); }
      form.classList.add('was-validated');
    });
  });

  /* ============================
     JQUERY / DATATABLES / AJAX
     ============================ */
  if(!window.jQuery) return;

  $(function(){
    $('.data-table:not(.no-datatables)').DataTable({pageLength:10, searching:false, lengthChange:false, language:{url:'https://cdn.datatables.net/plug-ins/2.0.8/i18n/fr-FR.json'}});
    var csrf = $('meta[name="csrf-token"]').attr('content');
    if(csrf) $.ajaxSetup({headers:{'X-CSRF-TOKEN':csrf}});

    $('#fidelSearch').on('keyup', function(){
      var q = this.value;
      $.get(baseUrl('api/fideles/search'), {q:q}, function(res){
        if(!res.success) return;
        $('#fidelesBody').html(res.data.map(function(f){ return '<tr data-created="'+window.FJKM_escapeHtml((f.created_at||'').slice(0,10))+'"><td>'+window.FJKM_escapeHtml((f.created_at||'').slice(0,10))+'</td><td>'+window.FJKM_escapeHtml(f.matricule)+'</td><td>'+window.FJKM_escapeHtml(f.full_name)+'</td><td>'+window.FJKM_escapeHtml(f.group_name||'')+'</td><td>'+window.FJKM_escapeHtml(f.phone||'')+'</td><td>'+(f.baptized_at||'-')+'</td><td>'+(f.communion_at||'-')+'</td><td><span class="badge text-bg-'+(f.status === 'active' ? 'success' : 'secondary')+'">'+window.FJKM_escapeHtml(f.status === 'active' ? 'Actif' : 'Inactif')+'</span></td><td><button type="button" class="btn btn-sm btn-outline-primary view-member" title="Voir" data-bs-toggle="modal" data-bs-target="#christianeViewModal" data-values=\''+window.FJKM_escapeHtml(JSON.stringify({matricule:f.matricule,full_name:f.full_name,gender:f.gender,group_name:f.group_name,phone:f.phone,birth_date:f.birth_date,baptized_at:f.baptized_at,communion_at:f.communion_at,status:f.status,address:f.address,created_date:(f.created_at||'').slice(0,10)}))+'\' data-photo="'+(f.photo ? baseUrl('public/'+f.photo) : '')+'"><i class="bi bi-eye"></i></button></td></tr>'; }).join(''));
        prepareResponsiveInterface(document.getElementById('fidelesBody')?.closest('table') || document);
      });
    });

    $('#financeSearch').on('keyup', function(){
      var q = this.value;
      $.get(baseUrl('api/finance/search'), {q:q}, function(res){
        if(!res.success) return;
        $('#entriesBody').html(res.entries.map(function(r){ return '<tr><td>'+r.operation_date+'</td><td>'+window.FJKM_escapeHtml(r.reference||'')+'</td><td>'+window.FJKM_escapeHtml(r.label)+'</td><td>'+window.FJKM_escapeHtml(r.category||'')+'</td><td>'+window.FJKM_escapeHtml(r.payment_method||'')+'</td><td>'+window.formatMoney(r.amount)+'</td></tr>'; }).join(''));
        $('#exitsBody').html(res.exits.map(function(r){ return '<tr><td>'+r.operation_date+'</td><td>'+window.FJKM_escapeHtml(r.reference||'')+'</td><td>'+window.FJKM_escapeHtml(r.label)+'</td><td>'+window.FJKM_escapeHtml(r.category||'')+'</td><td>'+window.FJKM_escapeHtml(r.beneficiary||'')+'</td><td>'+window.formatMoney(r.amount)+'</td></tr>'; }).join(''));
        prepareResponsiveInterface(document.getElementById('entriesBody')?.closest('table') || document);
        prepareResponsiveInterface(document.getElementById('exitsBody')?.closest('table') || document);
      });
    });

    $('#obligationFidelLookup, #obligationMonth, #obligationYear').on('change keyup input', debounce(loadObligationRest, 300));
    $('#selectAllMonths').on('click', function(){ var boxes = $('.communion-month').filter(function(){ return !this.disabled && $(this).closest('.month-box').is(':visible'); }); var shouldCheck = boxes.filter(':checked').length !== boxes.length; boxes.prop('checked', shouldCheck); });
    $('#communionFidelLookup').on('change keyup', debounce(loadCommunionHistory, 300));
    $('#communionYear').on('change input', function(){ applyCommunionPaidMonths(communionHistoryCache); });
    $('.table-filter, .date-range-filter').on('input change', function(){ applyTableFilters($(this).data('table')); });
    document.querySelectorAll('table').forEach(updateTableTotal);
  });

})();
