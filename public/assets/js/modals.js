/*
 * modals.js — Modal reset, view member, premium animations, flash, form loading
 * FJKM Malaza Gileada
 */
(function(){

  /* ============================
     MODAL RESET ON CLOSE
     ============================ */
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
        // Reset obligation fields
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
        // Reset communion fields
        var communionFidelId = form.querySelector('#communionFidelId');
        if(communionFidelId) communionFidelId.value = '';
        var communionHistory = form.querySelector('#communionHistory');
        if(communionHistory){ communionHistory.className = 'alert alert-info py-2 mb-0 d-none'; communionHistory.textContent = ''; }
        form.querySelectorAll('.month-box').forEach(function(box){ box.classList.remove('d-none'); });
        form.querySelectorAll('.communion-month').forEach(function(cb){ cb.disabled = false; cb.checked = false; });

        var titleSpan = modal.querySelector('[id$="TitleText"]');
        if(titleSpan){
          var prefix = modalId === 'entryModal' ? 'Nouvelle entrée' : (modalId === 'exitModal' ? 'Nouvelle sortie' : (modalId === 'obligationModal' ? 'Nouvelle obligation' : (modalId === 'communionModal' ? 'Nouvelle entrée communion' : (modalId === 'christianeModal' ? 'Nouveau Chrétien' : (modalId === 'projectModal' ? 'Paramètre projet' : 'Enregistrement paiement projet')))));
          titleSpan.textContent = prefix;
        }
        var submit = modal.querySelector('[id$="Submit"]');
        if(submit){ submit.innerHTML = '<i class="bi bi-check-circle"></i> Enregistrer'; }
      });
    });
  }

  /* ============================
     VIEW MEMBER MODAL
     ============================ */
  function initViewMemberModal(){
    var viewModal = document.getElementById('christianeViewModal');
    if(!viewModal) return;
    viewModal.addEventListener('show.bs.modal', function(event){
      var button = event.relatedTarget;
      if(!button) return;
      var values = JSON.parse(button.dataset.values || '{}');
      var photoUrl = button.dataset.photo || '';
      var content = document.getElementById('christianeViewContent');
      if(!content) return;

      var genderLabel = values.gender === 'M' ? 'Masculin' : (values.gender === 'F' ? 'Féminin' : '-');
      var isActive = values.status === 'active';
      var statusClass = isActive ? 'success' : 'secondary';
      var statusLabel = isActive ? 'Actif' : 'Inactif';
      var defaultAvatar = window.FJKM_BASE_URL ? (window.FJKM_BASE_URL + '/assets/img/avatar.svg') : '/assets/img/avatar.svg';
      var photoTag = photoUrl ? '<img class="view-member-photo" src="'+window.FJKM_escapeHtml(photoUrl)+'" alt="Photo" onerror="this.src=\''+defaultAvatar+'\'">' : '<div class="view-member-photo" style="display:flex;align-items:center;justify-content:center;font-size:3rem;color:var(--fjkm-blue);background:#eef5ff"><i class="bi bi-person-fill"></i></div>';

      content.innerHTML = '<div class="view-member-card">'+photoTag+'<div class="view-member-header"><h2>'+window.FJKM_escapeHtml(values.full_name || '')+'</h2><span class="matricule-badge">'+window.FJKM_escapeHtml(values.matricule || '')+'</span><span class="status-badge-inline badge text-bg-'+statusClass+'">'+statusLabel+'</span><div class="view-member-stats"><div class="view-member-stat"><i class="bi bi-people"></i><span>Groupe</span><strong>'+window.FJKM_escapeHtml(values.group_name || '-')+'</strong></div><div class="view-member-stat"><i class="bi bi-telephone"></i><span>Téléphone</span><strong>'+window.FJKM_escapeHtml(values.phone || '-')+'</strong></div><div class="view-member-stat"><i class="bi bi-gender-ambiguous"></i><span>Genre</span><strong>'+window.FJKM_escapeHtml(genderLabel)+'</strong></div><div class="view-member-stat"><i class="bi bi-geo-alt"></i><span>Adresse</span><strong>'+window.FJKM_escapeHtml(values.address || '-')+'</strong></div></div></div></div><div class="view-member-info-grid mt-3"><div class="view-member-info-item"><i class="bi bi-calendar-plus"></i><div class="info-content"><small>Enregistrement</small><strong>'+window.FJKM_formatDateDisplay(values.created_date) || '-'+'</strong></div></div><div class="view-member-info-item"><i class="bi bi-cake2"></i><div class="info-content"><small>Naissance</small><strong>'+window.FJKM_formatDateDisplay(values.birth_date) || '-'+'</strong></div></div><div class="view-member-info-item"><i class="bi bi-droplet"></i><div class="info-content"><small>Baptême</small><strong>'+window.FJKM_formatDateDisplay(values.baptized_at) || '-'+'</strong></div></div><div class="view-member-info-item"><i class="bi bi-cup-straw"></i><div class="info-content"><small>Communion</small><strong>'+window.FJKM_formatDateDisplay(values.communion_at) || '-'+'</strong></div></div></div>';
    });
  }

  /* ============================
     PREMIUM ANIMATIONS
     ============================ */
  function initPremiumAnimations(){
    animateCounters();
    observeAnimatedElements();
    initCardShineEffect();
  }

  function animateCounters(){
    var counters = document.querySelectorAll('.counter-value');
    if(!counters.length) return;
    var animateCounter = function(el) {
      var raw = el.getAttribute('data-target') || el.textContent;
      var target = window.FJKM_moneyValue(raw);
      if(target <= 0) return;
      var duration = 1200, startTime = performance.now();
      var update = function(currentTime){
        var elapsed = currentTime - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        var current = Math.round(target * eased);
        el.textContent = window.FJKM_formatMoneyInputValue(current) + (el.dataset.noCurrency ? '' : ' Ar');
        if(progress < 1) requestAnimationFrame(update);
        else { el.textContent = window.FJKM_formatMoneyInputValue(target) + (el.dataset.noCurrency ? '' : ' Ar'); el.style.animation = 'countPulse 0.4s ease-out'; setTimeout(function(){ el.style.animation = ''; }, 500); }
      };
      requestAnimationFrame(update);
    };
    if('IntersectionObserver' in window){
      var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){ if(entry.isIntersecting){ animateCounter(entry.target); observer.unobserve(entry.target); } });
      }, { threshold: 0.3 });
      counters.forEach(function(counter){ observer.observe(counter); });
    } else { counters.forEach(animateCounter); }
  }

  function observeAnimatedElements(){
    var elements = document.querySelectorAll('.animate-fade-up');
    if(!elements.length || !('IntersectionObserver' in window)){ elements.forEach(function(el){ el.style.opacity = '1'; }); return; }
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){ if(entry.isIntersecting){ entry.target.style.animationPlayState = 'running'; observer.unobserve(entry.target); } });
    }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });
    elements.forEach(function(el){ el.style.animationPlayState = 'paused'; observer.observe(el); });
  }

  function initCardShineEffect(){
    var cards = document.querySelectorAll('.premium-card');
    if(!cards.length || !window.matchMedia('(hover: hover)').matches) return;
    cards.forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--shine-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        card.style.setProperty('--shine-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
    });
  }

  /* ============================
     FLASH DISMISS
     ============================ */
  function initFlashDismiss(){
    document.querySelectorAll('.flash-message').forEach(function(msg){
      setTimeout(function(){
        msg.classList.add('flash-dismiss');
        setTimeout(function(){ msg.remove(); }, 400);
      }, 5000);
    });
  }

  /* ============================
     FORM LOADING STATE
     ============================ */
  function initFormLoading(){
    document.querySelectorAll('form').forEach(function(form){
      form.addEventListener('submit', function(){
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
     BUTTON PRESS FEEDBACK
     ============================ */
  function initButtonFeedback(){
    document.addEventListener('mousedown', function(e){
      var btn = e.target.closest('.btn');
      if(btn) btn.style.transform = 'scale(0.97)';
    });
    document.addEventListener('mouseup', function(e){
      var btn = e.target.closest('.btn');
      if(btn) setTimeout(function(){ btn.style.transform = ''; }, 100);
    });
  }

  /* ============================
     EXPORTS
     ============================ */
  window.FJKM_initModalReset = initModalReset;
  window.FJKM_initViewMemberModal = initViewMemberModal;
  window.FJKM_initPremiumAnimations = initPremiumAnimations;
  window.FJKM_initFlashDismiss = initFlashDismiss;
  window.FJKM_initFormLoading = initFormLoading;
  window.FJKM_initButtonFeedback = initButtonFeedback;
})();
