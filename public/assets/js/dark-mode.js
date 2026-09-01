/*
 * dark-mode.js — Dark mode initialization, toggle, localStorage
 * FJKM Malaza Gileada
 */
(function(){
  // Initialize dark mode from localStorage
  function initDarkMode(){
    if(localStorage.getItem('fjkm-dark') === '1'){
      document.body.classList.add('dark-mode');
      var icon = document.querySelector('#darkModeToggle i');
      if(icon) icon.className = 'bi bi-sun';
    }
  }

  // Toggle dark mode on button click
  function setupDarkModeToggle(){
    document.addEventListener('click', function(e){
      if(e.target.id === 'darkModeToggle' || e.target.closest('#darkModeToggle')){
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('fjkm-dark', document.body.classList.contains('dark-mode') ? '1' : '0');
        var icon = document.querySelector('#darkModeToggle i');
        if(icon) icon.className = document.body.classList.contains('dark-mode') ? 'bi bi-sun' : 'bi bi-moon-stars';
      }
    });
  }

  // Export
  window.FJKM_initDarkMode = initDarkMode;
  window.FJKM_setupDarkModeToggle = setupDarkModeToggle;
})();
