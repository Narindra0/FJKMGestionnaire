/*
 | Commentaire technique
 | Ce fichier contient les scripts JavaScript de l'interface : il améliore l'interactivité côté navigateur.
 */
/* Graphiques Chart.js du dashboard : filtre général/entrée/sortie/obligation/communion/projet/christiane. */
(function(){
  if(!window.FJKM_SERIES || !window.Chart) return;
  const s = window.FJKM_SERIES;
  const type = window.FJKM_DASHBOARD_TYPE || 'general';

  /* Palette premium */
  const colors = {
    blue: '#0d47a1',
    blue2: '#1565c0',
    gold: '#c8a45c',
    goldLight: '#f5e9c4',
    teal: '#0f766e',
    danger: '#d32f2f',
    success: '#087f5b',
    muted: 'rgba(13,71,161,0.25)',
    grid: 'rgba(13,71,161,0.06)',
  };

  const gradientBlue = function(ctx, alpha){
    if(!ctx || !ctx.chart || !ctx.chart.ctx) return colors.blue;
    const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
    g.addColorStop(0, 'rgba(13,71,161,' + (alpha || '0.4') + ')');
    g.addColorStop(1, 'rgba(13,71,161,0.01)');
    return g;
  };

  const common = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 1200,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 18,
          font: { weight: '600', size: 12, family: 'Inter' },
          color: '#708099',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(13,71,161,0.95)',
        titleFont: { weight: '700', size: 13, family: 'Inter' },
        bodyFont: { weight: '600', size: 12, family: 'Inter' },
        padding: 12,
        cornerRadius: 10,
        displayColors: true,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: function(ctx){
            let label = ctx.dataset.label || '';
            if(label) label += ': ';
            if(ctx.parsed.y !== undefined) label += window.formatMoney ? window.formatMoney(ctx.parsed.y) : ctx.parsed.y;
            else if(ctx.parsed.r !== undefined) label += window.formatMoney ? window.formatMoney(ctx.parsed.r) : ctx.parsed.r;
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: colors.grid, drawBorder: false },
        ticks: { font: { size: 11, weight: '600', family: 'Inter' }, color: '#708099' }
      },
      y: {
        grid: { color: colors.grid, drawBorder: false },
        ticks: {
          font: { size: 11, weight: '600', family: 'Inter' },
          color: '#708099',
          callback: function(value){ return window.formatMoney ? window.formatMoney(value) : value; }
        }
      }
    }
  };

  const configByType = {
    entree: [{label:'Entrées simples', data:s.finance_entries || [], borderColor:colors.blue, backgroundColor:gradientBlue, fill:true, tension:.4, pointRadius:4, pointHoverRadius:7}],
    sortie: [{label:'Sorties', data:s.exits || [], borderColor:colors.danger, backgroundColor:'rgba(211,47,47,0.1)', fill:true, tension:.4, pointRadius:4, pointHoverRadius:7}],
    obligation: [{label:'Obligations payées', data:s.obligation_entries || [], borderColor:colors.gold, backgroundColor:'rgba(200,164,92,0.15)', fill:true, tension:.4, pointRadius:4, pointHoverRadius:7}],
    communion: [{label:'Communion', data:s.communion_entries || [], borderColor:colors.teal, backgroundColor:'rgba(15,118,110,0.1)', fill:true, tension:.4, pointRadius:4, pointHoverRadius:7}],
    projet: [{label:'Projets', data:s.project_entries || [], borderColor:colors.blue2, backgroundColor:'rgba(21,101,192,0.1)', fill:true, tension:.4, pointRadius:4, pointHoverRadius:7}],
    christiane: [{label:'Chrétien enregistrés', data:s.christiane_count || [], borderColor:colors.gold, backgroundColor:'rgba(200,164,92,0.12)', fill:true, tension:.4, pointRadius:4, pointHoverRadius:7}],
    general: [
      {label:'Entrées générales',data:s.entries || [], tension:.4, borderColor:colors.blue, backgroundColor:gradientBlue, fill:true, pointRadius:4, pointHoverRadius:7},
      {label:'Sorties générales',data:s.exits || [], tension:.4, borderColor:colors.danger, backgroundColor:'rgba(211,47,47,0.06)', fill:true, pointRadius:4, pointHoverRadius:7},
      {label:'Reste général',data:s.balance || [], tension:.4, borderColor:colors.success, backgroundColor:'rgba(8,127,91,0.06)', fill:true, pointRadius:4, pointHoverRadius:7, borderDash:[5,3]}
    ]
  };
  const activeDatasets = configByType[type] || configByType.general;

  /* LINE CHART */
  const line = document.getElementById('lineChart');
  if(line) new Chart(line, {
    type:'line',
    data:{labels:s.labels, datasets:activeDatasets},
    options: {
      ...common,
      animation: { duration: 1400, easing: 'easeOutQuart' },
      elements: { point: { backgroundColor: '#fff', borderWidth: 2 } },
      scales: { ...common.scales, y: { ...common.scales.y, beginAtZero: true } }
    }
  });

  /* BAR CHART */
  const bar = document.getElementById('barChart');
  if(bar) new Chart(bar, {
    type:'bar',
    data:{
      labels:s.labels,
      datasets: type==='general'
        ? [
            {label:'Entrées',data:s.entries || [], backgroundColor:'rgba(13,71,161,0.7)', borderRadius:6, borderSkipped:false},
            {label:'Sorties',data:s.exits || [], backgroundColor:'rgba(211,47,47,0.7)', borderRadius:6, borderSkipped:false}
          ]
        : activeDatasets.map(function(d, i){
            const barColors = [colors.blue, colors.gold, colors.teal, colors.danger, colors.success];
            return {...d, backgroundColor:d.backgroundColor || barColors[i % barColors.length] + '99', borderRadius:6, borderSkipped:false};
          })
    },
    options: {
      ...common,
      animation: { duration: 1000, easing: 'easeOutBounce' },
      scales: { ...common.scales, y: { ...common.scales.y, beginAtZero: true } }
    }
  });

  /* PIE CHART */
  const pie = document.getElementById('pieChart');
  if(pie){
    const pieColors = [colors.blue, colors.danger, colors.gold, colors.teal, colors.success, colors.blue2];
    let pieData, pieLabels;
    if(type === 'general'){
      const entriesTotal = (s.entries||[]).reduce((a,b)=>a+b,0);
      const exitsTotal = (s.exits||[]).reduce((a,b)=>a+b,0);
      const balanceTotal = Math.abs((s.balance||[]).reduce((a,b)=>a+b,0));
      const allValues = [entriesTotal, exitsTotal, balanceTotal];
      const significantValues = allValues.filter(v => v > 0);
      pieLabels = ['Entrées générales', 'Sorties générales', 'Reste'];
      pieLabels = pieLabels.filter((_, i) => allValues[i] > 0);
      pieData = significantValues;
    } else {
      pieLabels = activeDatasets.map(d=>d.label);
      pieData = activeDatasets.map(d=>(d.data||[]).reduce((a,b)=>a+b,0));
    }
    if(pieData.length > 0){
      new Chart(pie, {
        type:'doughnut',
        data:{
          labels: pieLabels,
          datasets: [{
            data: pieData,
            backgroundColor: pieColors.slice(0, pieData.length),
            borderColor: '#fff',
            borderWidth: 3,
            hoverOffset: 12
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '55%',
          animation: { duration: 1200, easing: 'easeOutQuart', animateRotate: true },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 16,
                font: { weight: '600', size: 12, family: 'Inter' },
                color: '#708099'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(13,71,161,0.95)',
              titleFont: { weight: '700', size: 13, family: 'Inter' },
              bodyFont: { weight: '600', size: 12, family: 'Inter' },
              padding: 12,
              cornerRadius: 10,
              callbacks: {
                label: function(ctx){
                  const total = ctx.dataset.data.reduce((a,b)=>a+b,0);
                  const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                  return ctx.label + ': ' + (window.formatMoney ? window.formatMoney(ctx.parsed) : ctx.parsed) + ' (' + pct + '%)';
                }
              }
            }
          }
        }
      });
    }
  }
})();
