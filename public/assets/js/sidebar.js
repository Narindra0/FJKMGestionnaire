/*
 * sidebar.js — Toggle sidebar, active link, mobile overlay
 * FJKM Malaza Gileada
 */
(function(){
  function initSidebarToggle(){
    var toggle = document.getElementById('sidebarToggle');
    var mobileToggle = document.getElementById('mobileMenuToggle');
    var sidebar = document.getElementById('mainSidebar');
    if(!sidebar) return;

    // Restore desktop state from localStorage
    if(localStorage.getItem('fjkm-sidebar') === 'collapsed'){
      sidebar.classList.add('collapsed');
    }

    // Desktop toggle (collapse/expand)
    if(toggle){
      toggle.addEventListener('click', function(){
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('fjkm-sidebar', sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded');
        window.dispatchEvent(new Event('resize'));
      });
    }

    // Mobile toggle (open/close menu)
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
      // Close mobile menu after clicking a link
      sidebar.querySelectorAll('.nav-link').forEach(function(link){
        link.addEventListener('click', function(){
          sidebar.classList.remove('mobile-open');
          if(overlay) overlay.classList.remove('active');
        });
      });
    }
  }

  function initActiveSidebar(){
    var links = document.querySelectorAll('.sidebar nav a');
    var current = window.location.pathname.replace(/\/public\/?$/, '').replace(/\/$/, '');
    links.forEach(function(a){
      var target = new URL(a.getAttribute('href'), window.location.origin).pathname.replace(/\/public\/?$/, '').replace(/\/$/, '');
      if(current === target || (target && target !== '/' && current.startsWith(target + '/'))){
        a.classList.add('active');
      }
    });

    // Restore sidebar scroll position
    var nav = document.querySelector('.sidebar-nav');
    if(nav){
      var savedScroll = sessionStorage.getItem('fjkm-sidebar-scroll');
      if(savedScroll) nav.scrollTop = parseInt(savedScroll, 10);
    }

    // Save scroll position before clicking a link
    links.forEach(function(a){
      a.addEventListener('click', function(){
        var n = document.querySelector('.sidebar-nav');
        if(n) sessionStorage.setItem('fjkm-sidebar-scroll', String(n.scrollTop));
      });
    });
  }

  // Export to global scope for app.js
  window.FJKM_initSidebar = initSidebarToggle;
  window.FJKM_initActiveSidebar = initActiveSidebar;
})();
