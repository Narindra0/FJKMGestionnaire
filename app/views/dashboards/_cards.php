<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<?php $dashQuery = '&q=' . urlencode($dashboardQ ?? ''); ?>
<div class="premium-card mb-4 no-print filter-card">
    <form class="compact-filter-form" method="get" action="<?= url('dashboard') ?>">
        <div class="filter-fields-row">
            <div class="filter-field filter-field-reset">
                <a class="btn-reset" href="<?= url('dashboard') ?>" title="Effacer les critères et réafficher le tableau de bord">
                    <i class="bi bi-arrow-counterclockwise"></i>
                    <span>Ré-afficher</span>
                </a>
            </div>
            <div class="filter-field">
                <label class="filter-label">Rapport</label>
                <div class="filter-input-group">
                    <i class="bi bi-bar-chart-steps"></i>
                    <select name="type" class="form-select">
                        <option value="general" <?= ($dashboardType ?? 'general')==='general'?'selected':'' ?>>Général</option>
                        <option value="entree" <?= ($dashboardType ?? '')==='entree'?'selected':'' ?>>Entrée</option>
                        <option value="sortie" <?= ($dashboardType ?? '')==='sortie'?'selected':'' ?>>Sortie</option>
                        <option value="obligation" <?= ($dashboardType ?? '')==='obligation'?'selected':'' ?>>Obligation</option>
                        <option value="communion" <?= ($dashboardType ?? '')==='communion'?'selected':'' ?>>Communion</option>
                        <option value="projet" <?= ($dashboardType ?? '')==='projet'?'selected':'' ?>>Projet</option>
                        <option value="christiane" <?= ($dashboardType ?? '')==='christiane'?'selected':'' ?>>Chrétien</option>
                    </select>
                </div>
            </div>
            <div class="filter-field">
                <label class="filter-label">Du</label>
                <div class="filter-input-group">
                    <input type="date" name="from" value="<?= e($dashboardFrom ?? date('Y-m-01')) ?>" class="form-control">
                </div>
            </div>
            <div class="filter-field">
                <label class="filter-label">Au</label>
                <div class="filter-input-group">
                    <input type="date" name="to" value="<?= e($dashboardTo ?? date('Y-m-t')) ?>" class="form-control">
                </div>
            </div>
            <div class="filter-field filter-field-search">
                <label class="filter-label">Recherche</label>
                <div class="filter-input-group">
                    <i class="bi bi-search"></i>
                    <input type="text" name="q" value="<?= e($dashboardQ ?? '') ?>" class="form-control" placeholder="Réf, libellé…">
                </div>
            </div>
        </div>
        <div class="filter-actions-row">
            <button class="btn btn-primary btn-filter-action"><i class="bi bi-funnel"></i> Filtrer</button>
            <a class="btn btn-outline-secondary" href="<?= url('reports?type='.($dashboardType ?? 'general').'&from='.($dashboardFrom ?? date('Y-m-01')).'&to='.($dashboardTo ?? date('Y-m-t')).$dashQuery) ?>"><i class="bi bi-eye"></i> Rapport</a>
            <a class="btn btn-outline-danger" href="<?= url('reports/pdf?type='.($dashboardType ?? 'general').'&from='.($dashboardFrom ?? date('Y-m-01')).'&to='.($dashboardTo ?? date('Y-m-t')).$dashQuery) ?>"><i class="bi bi-file-pdf"></i> PDF</a>
        </div>
    </form>
</div>

<div class="section-title">Synthèse générale</div>
<div class="row g-4">
    <div class="col-md-3 animate-fade-up animate-fade-up-1">
        <div class="stat-card">
            <div class="stat-header">
                <div class="stat-icon"><i class="bi bi-graph-up-arrow"></i></div>
                <span>Entrée générale</span>
            </div>
            <strong class="counter-value" data-target="<?= e($totals['entries']) ?>"><?= money_mga($totals['entries']) ?></strong>

        </div>
    </div>
    <div class="col-md-3 animate-fade-up animate-fade-up-2">
        <div class="stat-card danger">
            <div class="stat-header">
                <div class="stat-icon"><i class="bi bi-graph-down-arrow"></i></div>
                <span>Sortie générale</span>
            </div>
            <strong class="counter-value" data-target="<?= e($totals['exits']) ?>"><?= money_mga($totals['exits']) ?></strong>

        </div>
    </div>
    <div class="col-md-3 animate-fade-up animate-fade-up-3">
        <div class="stat-card success">
            <div class="stat-header">
                <div class="stat-icon"><i class="bi bi-wallet2"></i></div>
                <span>Reste général</span>
            </div>
            <strong class="counter-value" data-target="<?= e($totals['balance']) ?>"><?= money_mga($totals['balance']) ?></strong>

        </div>
    </div>
    <div class="col-md-3 animate-fade-up animate-fade-up-4">
        <div class="stat-card">
            <div class="stat-header">
                <div class="stat-icon"><i class="bi bi-people"></i></div>
                <span>Chrétien</span>
            </div>
            <strong class="counter-value" data-target="<?= e($fidelesCount) ?>" data-no-currency="1"><?= e($fidelesCount) ?></strong>

        </div>
    </div>
</div>
