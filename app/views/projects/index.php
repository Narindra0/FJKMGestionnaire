<?php
/* 
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
use App\Core\Auth;

$monthsFr = [
    1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril',
    5 => 'Mai', 6 => 'Juin', 7 => 'Juillet', 8 => 'Août',
    9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre'
];
?>

<?php if (Auth::can('ADMIN')): ?>
<!-- Modal Paramètre Projet (ADMIN) -->
<div class="modal fade" id="projectModal" tabindex="-1" aria-labelledby="projectModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
      <div class="modal-header border-0 pb-0" style="padding:24px 28px 0;">
        <h5 class="modal-title fw-bold fs-5" id="projectModalTitle">
          <i class="bi bi-building text-primary"></i>
          <span id="projectModalTitleText">Paramètre projet</span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <form id="projectForm" method="post" action="<?= url('projects') ?>" data-create-action="<?= url('projects') ?>" class="needs-validation" novalidate>
        <div class="modal-body" style="padding:20px 28px 16px;">
          <?= csrf_field() ?>
          <input type="hidden" name="action_type" value="project_parameter">
          <div class="row g-3">
            <div class="col-lg-4 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-tag"></i> Référence</label>
              <input name="reference" class="form-control readonly-ref" value="<?= e($nextRef) ?>" data-default-value="<?= e($nextRef) ?>" readonly required>
            </div>
            <div class="col-lg-8 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-diagram-2"></i> Nom du projet</label>
              <input name="name" class="form-control" required>
              <div class="invalid-feedback">Veuillez remplir ce champ.</div>
            </div>
            <div class="col-lg-4 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-cash-stack"></i> Montant total à payer</label>
              <input name="budget" type="number" step="0.01" min="0" class="form-control" required>
              <div class="invalid-feedback">Montant obligatoire.</div>
            </div>
            <div class="col-lg-4 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-calendar-event"></i> Date début</label>
              <input name="start_date" type="date" class="form-control" value="<?= date('Y-m-d') ?>" data-default-value="<?= date('Y-m-d') ?>" required>
              <div class="invalid-feedback">Date début obligatoire.</div>
            </div>
            <div class="col-lg-4 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-calendar-check"></i> Date fin</label>
              <input name="end_date" type="date" class="form-control">
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 pt-0" style="padding:0 28px 24px;">
          <button type="button" class="btn btn-light" data-bs-dismiss="modal"><i class="bi bi-x-circle"></i> Annuler</button>
          <button id="projectSubmit" type="submit" class="btn btn-primary"><i class="bi bi-check-circle"></i> Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</div>
<?php endif; ?>

<!-- Modal Paiement Projet -->
<div class="modal fade" id="projectPaymentModal" tabindex="-1" aria-labelledby="projectPaymentModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
      <div class="modal-header border-0 pb-0" style="padding:24px 28px 0;">
        <h5 class="modal-title fw-bold fs-5" id="projectPaymentModalTitle">
          <i class="bi bi-wallet2 text-primary"></i>
          <span id="projectPaymentModalTitleText">Enregistrement paiement projet</span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <form id="projectPaymentForm" method="post" action="<?= url('projects') ?>" class="needs-validation" novalidate>
        <div class="modal-body" style="padding:20px 28px 16px;">
          <?= csrf_field() ?>
          <input type="hidden" id="projectBudgetRaw" value="0">
          <input type="hidden" id="projectRestRaw" value="0">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label fw-semibold"><i class="bi bi-search"></i> Référence / Nom du projet</label>
              <select name="project_id" id="projectSelect" class="form-select" required>
                <option value="" data-reference="" data-name="" data-rest="0" data-budget="0" data-budget-raw="0" data-collected="0" data-status="planned" data-start="" data-end="" data-description="">Sélectionner un projet non terminé</option>
                <?php foreach(($availableProjects ?? []) as $p): ?>
                  <?php $budgetRaw = number_format((float)$p['budget'], 2, '.', ''); $restRaw = number_format((float)$p['rest_amount'], 2, '.', ''); $collectedRaw = number_format((float)($p['collected_amount'] ?? 0), 2, '.', ''); ?>
                  <option value="<?= (int)$p['id'] ?>" data-reference="<?= e($p['reference']) ?>" data-name="<?= e($p['name']) ?>" data-rest="<?= e($restRaw) ?>" data-budget="<?= e($budgetRaw) ?>" data-budget-raw="<?= e($budgetRaw) ?>" data-collected="<?= e($collectedRaw) ?>" data-status="<?= e($p['status']) ?>" data-start="<?= e($p['start_date']) ?>" data-end="<?= e($p['end_date']) ?>" data-description="<?= e($p['description']) ?>"><?= e($p['reference'].' — '.$p['name']) ?></option>
                <?php endforeach; ?>
              </select>
              <div class="invalid-feedback">Choisissez un projet.</div>
            </div>
            <div class="col-lg-4 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-tag"></i> Référence</label>
              <input id="projectReference" class="form-control readonly-ref" value="-" readonly>
            </div>
            <div class="col-lg-8 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-diagram-2"></i> Nom du projet</label>
              <input id="projectName" class="form-control readonly-ref" value="-" readonly>
            </div>
            <div class="col-lg-3 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-cash-stack"></i> Montant total</label>
              <input id="projectBudget" class="form-control readonly-ref" value="0 Ar" readonly>
            </div>
            <div class="col-lg-3 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-hourglass-split"></i> Reste actuel</label>
              <input id="projectRest" class="form-control readonly-ref" value="0 Ar" readonly>
            </div>
            <div class="col-lg-3 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-flag"></i> Statut</label>
              <input id="projectStatus" class="form-control readonly-ref" value="Prévu" readonly>
            </div>
            <div class="col-lg-3 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-wallet2"></i> Montant payé maintenant</label>
              <input name="payment_amount" id="projectPaymentAmount" type="number" step="0.01" min="0" class="form-control" required>
              <div class="invalid-feedback">Montant obligatoire.</div>
            </div>
            <div class="col-lg-4 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-calendar-event"></i> Date paiement</label>
              <input type="date" name="payment_date" class="form-control" value="<?= date('Y-m-d') ?>" required>
            </div>
            <div class="col-lg-4 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-calendar"></i> Date début</label>
              <input type="text" id="projectStart" class="form-control readonly-ref" readonly>
            </div>
            <div class="col-lg-4 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-calendar-check"></i> Date fin</label>
              <input type="text" id="projectEnd" class="form-control readonly-ref" readonly>
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold"><i class="bi bi-card-text"></i> Description / Libellé</label>
              <input name="description" id="projectDescription" class="form-control" placeholder="Compléter si nécessaire">
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 pt-0" style="padding:0 28px 24px;">
          <button type="button" class="btn btn-light" data-bs-dismiss="modal"><i class="bi bi-x-circle"></i> Annuler</button>
          <button type="submit" class="btn btn-primary"><i class="bi bi-check-circle"></i> Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</div>

<?php
$projectBudgetTotal = 0;
$projectPaidTotal = 0;
$projectRestTotal = 0;
foreach (($projects ?? []) as $projectTotalRow) {
    $projectBudgetTotal += (float)($projectTotalRow['budget'] ?? 0);
    $projectPaidTotal += (float)($projectTotalRow['collected_amount'] ?? 0);
    $projectRestTotal += max(0, (float)($projectTotalRow['budget'] ?? 0) - (float)($projectTotalRow['collected_amount'] ?? 0));
}
?>

<div class="premium-card">
    <div class="d-flex flex-wrap gap-2 justify-content-between align-items-end mb-3 module-list-header">
        <h3 class="mb-0"><i class="bi bi-building"></i> Projets enregistrés</h3>
    </div>

    <div class="filter-card mb-3">
        <div class="compact-filter-form">
            <div class="filter-fields-row">
                <div class="filter-field">
                    <label class="filter-label"><i class="bi bi-calendar-range"></i> Période</label>
                    <div class="filter-input-group">
                        <details class="month-period-filter w-100" data-table="#projectsTable" data-month-source="createdMonth">
                            <summary>Tous les mois</summary>
                            <div class="month-period-panel">
                                <button type="button" class="btn btn-sm btn-outline-primary month-filter-select-all" data-table="#projectsTable">Sélectionner tout</button>
                                <div class="month-filter-list">
                                    <?php foreach($monthsFr as $m => $monthName): ?>
                                        <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#projectsTable" value="<?= $m ?>"> <span><?= e($monthName) ?></span></label>
                                    <?php endforeach; ?>
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-secondary month-filter-clear" data-table="#projectsTable">Désélectionner tout</button>
                            </div>
                        </details>
                    </div>
                </div>
                <div class="filter-field">
                    <label class="filter-label"><i class="bi bi-calendar-event"></i> Date</label>
                    <div class="filter-date-range">
                        <div class="filter-date-item">
                            <span class="filter-date-sep">Du</span>
                            <input type="date" id="projectDateFrom" class="form-control date-range-filter" data-table="#projectsTable">
                        </div>
                        <div class="filter-date-item">
                            <span class="filter-date-sep">Au</span>
                            <input type="date" id="projectDateTo" class="form-control date-range-filter" data-table="#projectsTable">
                        </div>
                    </div>
                </div>
                <div class="filter-field filter-field-search">
                    <label class="filter-label"><i class="bi bi-search"></i> Recherche</label>
                    <div class="filter-input-group"><i class="bi bi-search"></i><input class="form-control search-input table-filter" data-table="#projectsTable" placeholder="Projet / référence"></div>
                </div>
            </div>
            <div class="filter-actions-row">
                <div class="filter-actions-left">
                    <button type="button" class="btn btn-outline-secondary reset-table-filters" data-table="#projectsTable" title="Effacer les critères et réafficher toutes les lignes"><i class="bi bi-arrow-counterclockwise"></i> Ré-afficher</button>
                    <button type="button" class="btn btn-outline-secondary print-filtered-table" data-table="#projectsTable" data-title="Projets enregistrés" data-subtitle="FJKM MALAZA GILEADA"><i class="bi bi-printer"></i> Imprimer</button>
                    <button type="button" class="btn btn-outline-secondary print-filtered-table" data-table="#projectsTable" data-title="Projets enregistrés" data-subtitle="FJKM MALAZA GILEADA"><i class="bi bi-file-pdf"></i> PDF</button>
                </div>
                <div class="filter-actions-right">
                    <button type="button" class="btn btn-filter-action" data-bs-toggle="modal" data-bs-target="#projectPaymentModal"><i class="bi bi-plus-lg"></i> Paiement</button>
                    <?php if (Auth::can('ADMIN')): ?>
                    <button type="button" class="btn btn-filter-action" data-bs-toggle="modal" data-bs-target="#projectModal"><i class="bi bi-gear"></i> Projet</button>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <div class="premium-table-wrap">
    <table class="table data-table no-datatables align-middle" id="projectsTable">
        <thead><tr><th>Référence</th><th>Projet</th><th>Montant total</th><th>Total payé</th><th>Reste</th><th>Début</th><th>Fin</th><th>Statut</th><th>Description</th><th class="no-print">Actions</th></tr></thead>
        <tbody>
        <?php foreach(($projects ?? []) as $p): ?>
            <?php $canEdit = Auth::can('ADMIN'); $rest = max(0, (float)$p['budget'] - (float)($p['collected_amount'] ?? 0)); $dateFilter = $p['start_date'] ?: substr((string)($p['created_at'] ?? ''), 0, 10); $timestamp = $dateFilter ? strtotime($dateFilter) : false; $createdMonth = $timestamp ? (int)date('n', $timestamp) : 0; $values = ['reference' => $p['reference'],'name' => $p['name'],'budget' => $p['budget'],'start_date' => $p['start_date'],'end_date' => $p['end_date']]; ?>
            <tr data-created="<?= e($dateFilter) ?>" data-date="<?= e($dateFilter) ?>" data-created-month="<?= $createdMonth ?>" data-amount="<?= e($p['budget']) ?>" data-budget="<?= e($p['budget']) ?>" data-paid="<?= e($p['collected_amount'] ?? 0) ?>" data-rest="<?= e($rest) ?>">
                <td><?= e($p['reference']) ?></td>
                <td><?= e($p['name']) ?></td>
                <td><?= money_mga($p['budget']) ?></td>
                <td><?= money_mga($p['collected_amount'] ?? 0) ?></td>
                <td><?= money_mga($rest) ?></td>
                <td><?= date_mg($p['start_date']) ?></td>
                <td><?= date_mg($p['end_date']) ?></td>
                <td><?= status_badge($p['status']) ?></td>
                <td><?= e($p['description']) ?></td>
                <td class="no-print">
                    <div class="action-buttons">
                        <?php if($canEdit): ?>
                            <button type="button" class="btn btn-sm btn-outline-primary edit-to-form" data-form="#projectForm" data-title="#projectModalTitleText" data-title-text="Modification projet" data-submit="#projectSubmit" data-submit-text="Modifier" data-action="<?= url('projects/'.$p['id'].'/update') ?>" data-values='<?= e(json_encode($values, JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_UNICODE)) ?>' data-bs-toggle="modal" data-bs-target="#projectModal" title="Modifier"><i class="bi bi-pencil"></i></button>
                            <button type="button" class="btn btn-sm btn-light print-row" title="Imprimer"><i class="bi bi-printer"></i></button>
                            <form method="post" action="<?= url('projects/'.$p['id'].'/delete') ?>" class="d-inline" onsubmit="return confirm('Supprimer ce projet ?')"><?= csrf_field() ?><button class="btn btn-sm btn-outline-danger" title="Supprimer"><i class="bi bi-trash"></i></button></form>
                        <?php else: ?>
                            <button type="button" class="btn btn-sm btn-light print-row" title="Imprimer"><i class="bi bi-printer"></i></button>
                        <?php endif; ?>
                    </div>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
        <tfoot><tr><th colspan="2" class="text-end">Totaux</th><th class="table-total-budget"><?= money_mga($projectBudgetTotal) ?></th><th class="table-total-paid"><?= money_mga($projectPaidTotal) ?></th><th class="table-total-rest"><?= money_mga($projectRestTotal) ?></th><th colspan="5" class="no-print"></th></tr></tfoot>
    </table>
    </div>
</div>
