#!/usr/bin/env node
/**
 * Contrôle statique de l'interface (aucune dépendance externe).
 *
 * Usage :
 *   node scripts/check-ui.js           # vérifications, code retour 1 si anomalie
 *   node scripts/check-ui.js --report  # + inventaire des classes utilisées
 *
 * Contrôles :
 *   1. Validité structurelle des CSS (accolades, chaînes, commentaires)
 *   2. Couleurs : aucun hexadécimal hors des tokens (:root)
 *   3. Un seul système de dark mode (pas de sélecteur legacy `.dark `)
 *   4. Classes utilisées en PHP/JS mais absentes du CSS (styles manquants)
 *   5. Classes définies dans le CSS mais jamais utilisées (code mort)
 *   6. `style=""` inline dans les vues
 *   7. Id HTML en double
 *   8. Contrat JS : les classes pilotées par le JS existent bien
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CSS_DIR = path.join(ROOT, 'public/assets/css');
const VIEW_DIR = path.join(ROOT, 'app/views');
const JS_DIR = path.join(ROOT, 'public/assets/js');

// Classes générées par les bibliothèques tierces (Bootstrap, DataTables) :
// présentes dans le DOM mais écrites dans leurs propres CSS.
const LIB_CLASSES = new Set([
  'show', 'hide', 'hidden', 'collapse', 'collapsing', 'fade', 'active', 'current',
  'open', 'showing', 'hiding', 'modal-open', 'offcanvas-backdrop', 'focus',
  'was-validated', 'valid', 'invalid', 'd-block', 'd-none', 'd-inline',
  'btn-close', 'navbar-toggler-icon', 'dropdown-toggle', 'dropup', 'dropright',
  'table-striped', 'table-bordered', 'table-hover', 'table-sm', 'table-light',
  'dataTables_wrapper', 'dataTables_info', 'dataTables_filter', 'dataTables_length',
  'dataTables_paginate', 'dataTables_processing', 'dataTables_empty',
  'paginate_button', 'previous', 'next', 'ellipsis', 'dt-paging', 'dt-search',
  'dt-length', 'dt-info', 'dataTables_scrollBody', 'dataTables_scrollHead',
  'sorting', 'sorting_asc', 'sorting_desc', 'form-check-input', 'form-check-label',
  'disabled', 'dt-layout', 'dt-layout-row', 'dt-layout-end', 'dt-processing',
  'input-group-text', 'form-select', 'form-control', 'form-label', 'form-text',
  'invalid-feedback', 'valid-feedback', 'is-invalid', 'is-valid', 'needs-validation',
  'alert-danger', 'alert-success', 'alert-warning', 'alert-info',
  'text-bg-primary', 'text-bg-success', 'text-bg-danger', 'text-bg-warning',
  'text-bg-info', 'text-bg-secondary', 'text-bg-light', 'text-bg-dark',
  'shadow-lg', 'shadow-sm', 'border-0', 'btn', 'btn-primary', 'btn-secondary',
  'btn-outline-secondary', 'btn-outline-primary', 'btn-danger', 'btn-success',
  'btn-warning', 'btn-info', 'btn-light', 'btn-dark', 'btn-sm', 'btn-lg',
  'btn-close-white', 'btn-group', 'btn-block', 'dropdown-menu', 'dropdown-item',
  'dropdown-divider', 'nav-link', 'nav-pills', 'nav-tabs', 'nav-item',
  'btn-outline-danger', 'btn-outline-dark', 'btn-link', 'btn-check', 'col-auto',
  'row', 'col', 'g-0', 'g-2', 'g-3', 'g-4', 'm-0', 'mt-0', 'mt-1', 'mt-2', 'mt-3',
  'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'me-1', 'me-2', 'ms-auto', 'ms-2',
  'p-0', 'p-2', 'p-3', 'p-4', 'py-0', 'py-2', 'py-3', 'py-4', 'px-0', 'px-2', 'px-3',
  'px-4', 'gap-1', 'gap-2', 'w-100', 'h-100', 'text-center', 'text-end', 'text-start',
  'text-muted', 'text-danger', 'text-success', 'text-warning', 'text-primary',
  'text-white', 'text-reset', 'fw-bold', 'fw-semibold', 'fw-normal', 'fs-4', 'fs-5',
  'fs-6', 'fs-7', 'fst-italic', 'lh-1', 'lh-sm', 'align-middle', 'align-items-center',
  'align-items-end', 'align-items-start', 'justify-content-center',
  'justify-content-between', 'justify-content-end', 'justify-content-start',
  'flex-column', 'flex-wrap', 'flex-grow-1', 'flex-shrink-0', 'd-flex', 'd-grid',
  'd-inline-flex', 'd-inline-block', 'd-block', 'position-relative', 'position-absolute',
  'position-sticky', 'fixed-top', 'float-end', 'overflow-hidden', 'overflow-auto',
  'rounded', 'rounded-circle', 'rounded-pill', 'rounded-top', 'border', 'border-top',
  'border-bottom', 'border-start', 'modal', 'modal-dialog', 'modal-content',
  'modal-header', 'modal-body', 'modal-footer', 'modal-title', 'modal-dialog-centered',
  'modal-sm', 'modal-lg', 'modal-xl', 'modal-backdrop', 'fade', 'toast', 'spinner-border',
  'visually-hidden', 'vh-100', 'min-vh-100', 'img-fluid', 'list-unstyled', 'mb-auto',
  'mt-auto', 'mx-auto', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption',
  'container', 'container-fluid', 'row-cols-1', 'col-md-4', 'col-md-6', 'col-lg-4',
  'col-lg-6', 'col-lg-8', 'col-xl-3', 'col-12', 'col-sm-6', 'col-xxl-2', 'placeholder',
  'clearfix', 'user-select-all', 'pe-none', 'vr', 'badge', 'progress', 'list-group',
  'card', 'card-body', 'card-header', 'card-footer', 'accordion', 'accordion-item',
  'accordion-button', 'accordion-collapse', 'accordion-body', 'carousel',
  'tab-content', 'tooltip', 'popover', 'offcanvas',
  'toast-container', 'input-group', 'form-floating', 'form-switch',
  'form-range', 'form-select-lg', 'form-control-lg', 'form-control-sm',
  'shadow-none', 'border-end', 'border-start-0', 'bg-white', 'bg-transparent',
  'bg-light', 'bg-dark', 'bg-primary', 'bg-success', 'bg-danger', 'bg-body',
  'bg-secondary', 'link-primary', 'link-body-emphasis',
  'bg-info', 'bg-warning', 'bg-body-tertiary', 'bg-black',
  'align-items-md-center', 'btn-outline-info', 'btn-outline-success',
  'btn-outline-warning', 'col-lg-12', 'col-lg-2', 'col-lg-3', 'col-lg-5', 'col-lg-7',
  'col-lg-9', 'col-lg-10', 'col-lg-11', 'col-md-5', 'col-md-7', 'col-md-9', 'col-md-10',
  'col-md-11', 'col-xl-4', 'col-xl-5', 'col-xl-6', 'col-xl-8', 'col-sm-5', 'col-sm-7',
  'col-sm-8', 'col-sm-9', 'col-sm-10', 'col-sm-11', 'col-sm-12',
  'col-md-2', 'col-md-3', 'col-md-8', 'd-md-block', 'flex-fill', 'flex-md-row',
  'flex-sm-row', 'font-monospace', 'form-select-sm', 'fs-1', 'fw-medium', 'gap-3',
  'modal-dialog-scrollable', 'ms-1', 'p-5', 'pagination-sm', 'pb-0', 'pe-5',
  'pt-0', 'py-5', 'shadow', 'text-dark', 'text-light', 'text-nowrap',
  'text-secondary', 'small', 'text-bg-fstatus', 'text-bg-statusClass',
]);

// Classes de la bibliothèque d'icônes (prefixe).
const LIB_PREFIXES = ['bi', 'bi-'];

// Classes stylées dans les fenêtres d'impression générées par app.js
// (leur CSS vit dans le gabarit HTML/JS, pas dans public/assets/css).
const SELF_STYLED = new Set(['church-head', 'meta', 'member-print-block', 'h3', 'h5']);

// Classes pilotées par notre JS : leur style doit exister dans notre CSS.
const JS_CONTRACT = [
  'sidebar', 'sidebar-overlay', 'mobile-open', 'collapsed',
  'topbar', 'nav-link', 'nav-section', 'flash-message', 'flash-dismiss',
  'date-range-filter', 'table-filter', 'month-period-filter', 'month-filter-checkbox',
  'table-total-count', 'table-total-budget', 'table-total-paid', 'table-total-rest',
  'table-total-amount', 'manual-date-native', 'manual-date-field', 'password-toggle',
  'password-wrap', 'is-visible', 'is-invalid', 'responsive-form', 'responsive-card-table',
  'month-box', 'communion-month', 'btn-loading', 'dark-mode', 'animate-fade-up',
];

function walk(dir, ext, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, ext, out);
    else if (ext.includes(path.extname(e.name))) out.push(p);
  }
  return out;
}

function readCss() {
  const files = fs.readdirSync(CSS_DIR).filter((f) => f.endsWith('.css')).sort();
  return files.map((f) => ({ file: f, src: fs.readFileSync(path.join(CSS_DIR, f), 'utf8') }));
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

// 1. Validité structurelle -------------------------------------------------
function checkStructure(files) {
  const errors = [];
  for (const { file, src } of files) {
    let depth = 0, line = 1, inStr = null, inComment = false;
    for (let i = 0; i < src.length; i++) {
      const c = src[i], n = src[i + 1];
      if (c === '\n') line++;
      if (inComment) { if (c === '*' && n === '/') { inComment = false; i++; } continue; }
      if (inStr) {
        if (c === '\\') { i++; continue; }
        if (c === inStr) inStr = null;
        continue;
      }
      if (c === '/' && n === '*') { inComment = true; i++; continue; }
      if (c === '"' || c === "'") { inStr = c; continue; }
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth < 0) { errors.push(`${file}:${line}: '}' en excès`); depth = 0; }
      }
    }
    if (inComment) errors.push(`${file}: commentaire non fermé`);
    if (inStr) errors.push(`${file}: chaîne non fermée`);
    if (depth !== 0) errors.push(`${file}: accolades non équilibrées (écart ${depth})`);
  }
  return errors;
}

// 2. Couleurs hors tokens --------------------------------------------------
function checkTokens(files) {
  const errors = [];
  for (const { file, src } of files) {
    // On masque les commentaires en conservant les retours à la ligne (numéros exacts).
    const clean = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
    // Les couleurs en dur ne sont autorisées que dans les blocs de tokens.
    const allowed = [];
    const tokRe = /(?:^|[,{}\s])(:root|body\.dark-mode)\s*\{/g;
    let t;
    while ((t = tokRe.exec(clean))) {
      let depth = 0, i = t.index + t[0].length - 1;
      for (; i < clean.length; i++) {
        if (clean[i] === '{') depth++;
        else if (clean[i] === '}') { depth--; if (depth === 0) break; }
      }
      allowed.push([t.index, i]);
    }
    const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
    let m;
    while ((m = hexRe.exec(clean))) {
      if (/url\(/.test(clean.slice(Math.max(0, m.index - 20), m.index))) continue;
      if (allowed.some(([a, b]) => m.index > a && m.index < b)) continue;
      const line = clean.slice(0, m.index).split('\n').length;
      const txt = clean.slice(m.index, m.index + 60).split('\n')[0].trim();
      errors.push(`${file}:${line}: couleur en dur -> token (${txt})`);
    }
  }
  return errors;
}

// 3. Dark mode unique ------------------------------------------------------
function checkDarkMode(files) {
  const errors = [];
  for (const { file, src } of files) {
    if (file === 'dark.css') continue;
    const re = /(^|[,{}\s])\.dark(\s|[,.{:)]|$)/g;
    let m;
    while ((m = re.exec(src))) {
      const line = src.slice(0, m.index).split('\n').length;
      errors.push(`${file}:${line}: sélecteur legacy '.dark' (système non unifié)`);
    }
  }
  return errors;
}

// 4/5. Couverture des classes ---------------------------------------------
function collectCssClasses(files) {
  const defined = new Set();
  for (const { src } of files) {
    const clean = stripComments(src).replace(/^@import.*$/gm, '');
    const re = /([^{}]+)\{/g;
    let m;
    while ((m = re.exec(clean))) {
      const sel = m[1].trim();
      if (!sel || sel.startsWith('@') && !sel.startsWith('@keyframes')) continue;
      if (sel.startsWith('@keyframes')) continue;
      for (const part of sel.split(',')) {
        const cre = /\.([A-Za-z0-9_-]+)/g;
        let c;
        while ((c = cre.exec(part))) defined.add(c[1]);
      }
    }
  }
  return defined;
}

function collectUsedClasses() {
  const files = [...walk(VIEW_DIR, ['.php']), ...walk(JS_DIR, ['.js'])];
  const used = new Map();
  const inline = [];

  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');

    if (f.endsWith('.php')) {
      src.split('\n').forEach((l, i) => {
        if (/style\s*=\s*"/.test(l)) inline.push(`${rel}:${i + 1}`);
      });
    }

    const patterns = [
      /class\s*=\s*"([^"]+)"/g,
      /class\s*=\s*'([^']+)'/g,
      /classList\.(?:add|remove|toggle|contains)\(\s*['"]([\w-]+)['"]/g,
      /\$\(\s*['"]\.([\w-]+)['"]/g,
      /querySelector(?:All)?\(\s*['"]\.([\w-]+)['"]/g,
      /(?:add|remove|toggle)Class\(\s*['"]([\w-]+)['"]/g,
      /matches\(\s*['"]\.([\w-]+)['"]/g,
      /className\s*=\s*[^\n]*?['"]([\w -]+)['"]/g,
    ];
    for (const re of patterns) {
      let m;
      while ((m = re.exec(src))) {
        // On ignore le code PHP injecté dans les attributs class="... <?= ... ?>"
        const raw = m[1].replace(/<\?[\s\S]*?\?>/g, ' ');
        for (const cls of raw.split(/\s+/)) {
          // Fragment issu d'une concaténation JS ('...' + x + '...') :
          // on ne peut pas en déduire une classe réelle.
          if (cls.includes('+')) continue;
          const name = cls.replace(/[^A-Za-z0-9_-]/g, '');
          if (!name || /[A-Z]/.test(name[0])) continue;
          used.set(name, (used.get(name) || 0) + 1);
        }
      }
    }
  }
  return { used, inline };
}

// 7. Ids en double ---------------------------------------------------------
// Les partials sont rendus ensemble, chaque vue est rendue séparément :
// on ne compare donc qu'à l'intérieur de chaque contexte de rendu.
// DUP_OK : id répété dans un même fichier mais réparti sur des branches PHP
// mutuellement exclusives (if / elseif) — un seul existe à l'exécution.
const DUP_OK = new Set(['reportTable']);
function checkIds() {
  const partials = walk(path.join(VIEW_DIR, 'partials'), ['.php']);
  const layouts = walk(path.join(VIEW_DIR, 'layouts'), ['.php']);
  const views = walk(VIEW_DIR, ['.php']).filter((f) => !f.includes(`${path.sep}partials${path.sep}`) && !f.includes(`${path.sep}layouts${path.sep}`));
  const groups = [
    { name: 'partials', files: partials },
    { name: 'layouts', files: layouts },
    ...views.map((f) => ({ name: path.relative(ROOT, f).replace(/\\/g, '/'), files: [f] })),
  ];
  const errors = [];
  for (const g of groups) {
    const seen = new Map();
    for (const f of g.files) {
      const src = fs.readFileSync(f, 'utf8');
      const rel = path.relative(ROOT, f).replace(/\\/g, '/');
      const idRe = /\bid\s*=\s*"([^"]+)"/g;
      let im;
      while ((im = idRe.exec(src))) {
        const id = im[1].replace(/<\?[\s\S]*?\?>/g, '').trim();
        if (!id || DUP_OK.has(id)) continue;
        if (seen.has(id)) errors.push(`${id}: défini 2 fois (${seen.get(id)} et ${rel})`);
        else seen.set(id, rel);
      }
    }
  }
  return errors;
}

function isLibClass(c) {
  if (LIB_CLASSES.has(c)) return true;
  return LIB_PREFIXES.some((p) => c === p || c.startsWith(p));
}

// 8. Contrat JS ------------------------------------------------------------
function checkJsContract(defined) {
  return JS_CONTRACT.filter((c) => !defined.has(c)).map((c) => `classe JS '${c}' sans style CSS`);
}

function main() {
  const report = process.argv.includes('--report');
  const files = readCss();
  const defined = collectCssClasses(files);
  const { used, inline } = collectUsedClasses();
  const idErrors = checkIds();

  const errors = [
    ...checkStructure(files),
    ...checkTokens(files),
    ...checkDarkMode(files),
    ...checkJsContract(defined),
    ...idErrors,
  ];

  const missing = [...used.keys()].filter((c) => !defined.has(c) && !isLibClass(c) && !SELF_STYLED.has(c)).sort();
  const dead = [...defined].filter((c) => !used.has(c) && !isLibClass(c) && !SELF_STYLED.has(c)).sort();

  for (const c of missing) errors.push(`classe utilisée sans style : .${c}`);
  for (const c of dead) errors.push(`classe morte dans le CSS : .${c}`);
  for (const p of inline) errors.push(`style inline dans la vue : ${p}`);

  const totalLines = files.reduce((n, f) => n + f.src.split('\n').length, 0);
  console.log(`CSS: ${files.map((f) => `${f.file}=${f.src.split('\n').length}`).join(', ')} | total ${totalLines} lignes`);
  console.log(`classes définies: ${defined.size} | utilisées: ${used.size} | manquantes: ${missing.length} | mortes: ${dead.length}`);
  console.log(`styles inline: ${inline.length} | ids en double: ${idErrors.length}`);

  if (report) {
    const custom = [...used.keys()].filter((c) => !isLibClass(c) && !SELF_STYLED.has(c)).sort();
    console.log('\n-- classes custom a styler (' + custom.length + ') --');
    console.log(custom.join(' '));
    console.log('\n-- classes manquantes --');
    console.log(missing.join(' '));
    console.log('\n-- classes mortes --');
    console.log(dead.join(' '));
  }

  if (errors.length) {
    console.log(`\n${errors.length} anomalie(s) :`);
    errors.forEach((e) => console.log('  - ' + e));
    process.exit(1);
  }
  console.log('\nOK : aucune anomalie.');
}

main();
