<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<?php use App\Core\Auth; ?>

<!-- Modal Ajout/Modification Sortie -->
<div class="modal fade" id="exitModal" tabindex="-1" aria-labelledby="exitModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
      <div class="modal-header border-0 pb-0" style="padding:24px 28px 0;">
        <h5 class="modal-title fw-bold fs-5" id="exitModalTitle">
          <i class="bi bi-arrow-up-circle text-danger"></i>
          <span id="exitModalTitleText">Nouvelle sortie</span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <form id="exitForm" method="post" action="<?= url('sorties') ?>" data-create-action="<?= url('sorties') ?>" class="needs-validation" novalidate>
        <div class="modal-body" style="padding:20px 28px 16px;">
          <?= csrf_field() ?>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="exit-label">Libellé</label>
              <div class="exit-input-group"><i class="bi bi-tag"></i><input name="label" class="form-control" required><div class="invalid-feedback">Obligatoire.</div></div>
            </div>
            <div class="col-md-3">
              <label class="exit-label">Date</label>
              <div class="exit-input-group"><i class="bi bi-calendar"></i><input type="date" name="operation_date" value="<?= date('Y-m-d') ?>" class="form-control" required><div class="invalid-feedback">Obligatoire.</div></div>
            </div>
            <div class="col-md-3">
              <label class="exit-label">Catégorie</label>
              <div class="exit-input-group"><i class="bi bi-folder"></i><input name="category" class="form-control" value="Dépense"></div>
            </div>
            <div class="col-md-3">
              <label class="exit-label">Montant</label>
              <div class="exit-input-group"><i class="bi bi-coin"></i><input name="amount" type="number" step="0.01" class="form-control" required><div class="invalid-feedback">Obligatoire.</div></div>
            </div>
            <div class="col-md-3">
              <label class="exit-label">Bénéficiaire</label>
              <div class="exit-input-group"><i class="bi bi-person"></i><select name="beneficiary" class="form-select"><option>Espèces</option><option>Mobile Money</option><option>Chèque</option><option>Virement</option><option>Autre</option></select></div>
            </div>
            <div class="col-md-6">
              <label class="exit-label">Référence</label>
              <div class="exit-input-group"><i class="bi bi-upc-scan"></i><input name="reference" class="form-control readonly-ref" value="<?= e($nextExitRef) ?>" data-default-value="<?= e($nextExitRef) ?>" readonly required></div>
            </div>
            <div class="col-12">
              <label class="exit-label">Description</label>
              <div class="exit-input-group"><i class="bi bi-card-text"></i><input name="description" class="form-control" placeholder="Optionnel"></div>
            </div>
            <input type="hidden" id="existingExitId" name="exit_id" value="">
          </div>
        </div>
        <div class="modal-footer border-0 pt-0" style="padding:0 28px 24px;">
          <button type="button" class="btn btn-light" data-bs-dismiss="modal"><i class="bi bi-x-circle"></i> Annuler</button>
          <button id="exitSubmit" type="submit" class="btn btn-danger"><i class="bi bi-check-circle"></i> Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Mini carte filtres améliorée -->
<div class="filter-card mb-3">
    <div class="compact-filter-form">
        <div class="filter-fields-row">
            <!-- Intervalle de dates (Du — Au) groupé -->
            <div class="filter-field">
                <label class="filter-label"><i class="bi bi-calendar-event"></i> Date</label>
                <div class="filter-date-range">
                    <div class="filter-date-item">
                        <span class="filter-date-sep">Du</span>
                        <input type="date" id="exitDateFrom" class="form-control date-range-filter" data-table="#exitsTable">
                    </div>
                    <div class="filter-date-item">
                        <span class="filter-date-sep">Au</span>
                        <input type="date" id="exitDateTo" class="form-control date-range-filter" data-table="#exitsTable">
                    </div>
                </div>
            </div>

            <!-- Recherche -->
            <div class="filter-field filter-field-search">
                <label class="filter-label"><i class="bi bi-search"></i> Recherche</label>
                <div class="filter-input-group"><i class="bi bi-search"></i><input class="form-control search-input table-filter" data-table="#exitsTable" placeholder="Nom / libellé"></div>
            </div>
        </div>
        <div class="filter-actions-row">
            <div class="filter-actions-left">
                <button type="button" class="btn btn-outline-secondary reset-table-filters" data-table="#exitsTable" title="Réinitialiser les filtres"><i class="bi bi-arrow-counterclockwise"></i> Ré-afficher</button>
                <button type="button" class="btn btn-outline-secondary print-filtered-table" data-table="#exitsTable" data-title="Liste des sorties" data-subtitle="FJKM MALAZA GILEADA"><i class="bi bi-printer"></i> Imprimer</button>
                <button type="button" class="btn btn-outline-secondary print-filtered-table" data-table="#exitsTable" data-title="Liste des sorties" data-subtitle="FJKM MALAZA GILEADA"><i class="bi bi-file-pdf"></i> PDF</button>
            </div>
            <div class="filter-actions-right">
                <button type="button" class="btn btn-filter-action btn-filter-danger" data-bs-toggle="modal" data-bs-target="#exitModal"><i class="bi bi-plus-lg"></i> Ajouter</button>
            </div>
        </div>
    </div>
</div>

<div class="premium-card">
    <h3 class="mb-3"><i class="bi bi-list-ul"></i> Liste des sorties</h3>
    <div class="premium-table-wrap">
    <table class="table data-table align-middle" id="exitsTable"><thead><tr><th>Date</th><th>Référence</th><th>Libellé</th><th>Catégorie</th><th>Bénéficiaire</th><th>Montant</th><th class="no-print">Actions</th></tr></thead><tbody>
    <?php foreach($exits as $r): $canEdit = Auth::can('ADMIN') || (($r['operation_date'] ?? '') === date('Y-m-d')); ?>
        <?php $values = ['label'=>$r['label'],'operation_date'=>$r['operation_date'],'category'=>$r['category'],'amount'=>$r['amount'],'beneficiary'=>$r['beneficiary'],'reference'=>$r['reference'],'description'=>$r['description']]; ?>
        <tr data-created="<?= e($r['operation_date']) ?>" data-amount="<?= e($r['amount']) ?>">
            <td><?= date_mg($r['operation_date']) ?></td><td><span class="badge badge-ref"><?= e($r['reference']) ?></span></td><td><?= e($r['label']) ?></td><td><?= e($r['category']) ?></td><td><?= e($r['beneficiary']) ?></td><td><strong class="text-amount"><?= money_mga($r['amount']) ?></strong></td>
            <td class="no-print"><div class="action-buttons">
                <?php if ($canEdit): ?><button type="button" class="btn btn-sm btn-outline-primary edit-to-form" data-form="#exitForm" data-title="#exitModalTitleText" data-title-text="Modification sortie" data-submit="#exitSubmit" data-submit-text="Modifier" data-action="<?= url('sorties/'.$r['id'].'/update') ?>" data-values='<?= e(json_encode($values, JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_UNICODE)) ?>' data-bs-toggle="modal" data-bs-target="#exitModal" title="Modifier"><i class="bi bi-pencil"></i></button><?php endif; ?>
                <?php if (Auth::can('ADMIN')): ?><form method="post" action="<?= url('sorties/'.$r['id'].'/delete') ?>" class="d-inline" onsubmit="return confirm('Supprimer cette sortie ?')"><?= csrf_field() ?><button class="btn btn-sm btn-outline-danger" title="Supprimer"><i class="bi bi-trash"></i></button></form><?php endif; ?>
            </div></td>
        </tr>
    <?php endforeach; ?>
    </tbody>
    <tfoot><tr><th colspan="5" class="text-end">Montant total</th><th class="table-total-amount">0 Ar</th><th class="no-print"></th></tr></tfoot></table>
    </div>
</div>
