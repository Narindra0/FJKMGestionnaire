<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<?php use App\Core\Auth; ?>
<?php $monthsFr = [1=>'Janvier',2=>'Février',3=>'Mars',4=>'Avril',5=>'Mai',6=>'Juin',7=>'Juillet',8=>'Août',9=>'Septembre',10=>'Octobre',11=>'Novembre',12=>'Décembre']; ?>

<!-- Modal Ajout/Modification Communion -->
<div class="modal fade" id="communionModal" tabindex="-1" aria-labelledby="communionModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
      <div class="modal-header border-0 pb-0" style="padding:24px 28px 0;">
        <h5 class="modal-title fw-bold fs-5" id="communionModalTitle">
          <i class="bi bi-people text-primary"></i>
          <span id="communionModalTitleText">Nouvelle entrée communion</span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <form id="communionForm" method="post" action="<?= url('communion/entries') ?>" data-create-action="<?= url('communion/entries') ?>" class="needs-validation" novalidate>
        <div class="modal-body" style="padding:20px 28px 16px;">
          <?= csrf_field() ?>
          <input type="hidden" name="fidel_id" id="communionFidelId">

          <div class="row g-3">
            <div class="col-lg-5 col-md-6">
              <label class="obligation-label"><i class="bi bi-person-badge"></i> Matricule / nom Chrétien</label>
              <div class="obligation-input-group"><i class="bi bi-search"></i><input name="fidel_lookup" id="communionFidelLookup" class="form-control fidel-lookup" list="fidelesList" data-hidden="#communionFidelId" autocomplete="off" placeholder="Tapez matricule ou nom" required></div>
              <div class="invalid-feedback">Choisissez un·e Chrétien·ne valide.</div>
            </div>

            <div class="col-lg-3 col-md-6">
              <label class="obligation-label"><i class="bi bi-calendar-event"></i> Date paiement</label>
              <div class="obligation-input-group"><i class="bi bi-calendar-check"></i><input type="date" name="payment_date" class="form-control" value="<?= date('Y-m-d') ?>" data-default-value="<?= date('Y-m-d') ?>" required></div>
            </div>

            <div class="col-lg-2 col-md-6">
              <label class="obligation-label"><i class="bi bi-calendar-year"></i> Année</label>
              <div class="obligation-input-group"><i class="bi bi-calendar2"></i><input type="number" name="year" id="communionYear" class="form-control" value="<?= date('Y') ?>" min="2000" max="2100" required></div>
            </div>

            <div class="col-lg-2 col-md-6">
              <label class="obligation-label"><i class="bi bi-coin"></i> Montant / mois</label>
              <div class="obligation-input-group"><i class="bi bi-cash"></i><input type="number" step="0.01" name="amount" class="form-control" placeholder="Montant" required></div>
            </div>

            <div class="col-lg-3 col-md-6">
              <label class="obligation-label"><i class="bi bi-credit-card"></i> Mode</label>
              <div class="obligation-input-group"><i class="bi bi-wallet"></i><select name="payment_method" class="form-select"><option>Espèces</option><option>Mobile Money</option><option>Virement</option></select></div>
            </div>

            <div class="col-lg-3 col-md-6">
              <label class="obligation-label"><i class="bi bi-upc-scan"></i> Référence</label>
              <div class="obligation-input-group"><i class="bi bi-qr-code"></i><input name="reference" class="form-control readonly-ref" value="<?= e($nextEntryRef) ?>" data-default-value="<?= e($nextEntryRef) ?>" readonly required></div>
            </div>

            <div class="col-12">
              <label class="obligation-label"><i class="bi bi-calendar-month"></i> Mois concernés</label>
              <button type="button" class="btn btn-sm btn-outline-secondary mb-2" id="selectAllMonths">Tout sélectionner / désélectionner</button>
              <div class="month-grid communion-month-grid" id="communionMonthGrid">
                <?php foreach($monthsFr as $m=>$monthName): ?>
                <div class="month-box" data-month-box="<?= $m ?>">
                  <label class="form-check"><input class="form-check-input communion-month" type="checkbox" name="months[]" value="<?= $m ?>"> <span><?= e($monthName) ?></span></label>
                </div>
                <?php endforeach; ?>
              </div>
            </div>

            <div class="col-12">
              <div id="communionHistory" class="alert alert-info py-2 mb-0 d-none"></div>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 pt-0" style="padding:0 28px 24px;">
          <button type="button" class="btn btn-light" data-bs-dismiss="modal"><i class="bi bi-x-circle"></i> Annuler</button>
          <button id="communionSubmit" type="submit" class="btn btn-primary"><i class="bi bi-check-circle"></i> Enregistrer</button>
        </div>
      </form>
      <datalist id="fidelesList"><?php foreach($fideles as $f): ?><option value="<?= e($f['matricule'].' — '.$f['full_name']) ?>" data-id="<?= (int)$f['id'] ?>" data-matricule="<?= e($f['matricule']) ?>" data-name="<?= e($f['full_name']) ?>"></option><?php endforeach; ?></datalist>
    </div>
  </div>
</div>

<!-- Historique entrée communion -->
<div class="premium-card">
    <div class="d-flex flex-wrap gap-2 justify-content-between align-items-end mb-3 module-list-header">
        <h3 class="mb-0"><i class="bi bi-clock-history"></i> Historique entrée communion</h3>
    </div>

    <!-- Filtres améliorés -->
    <div class="filter-card mb-3">
        <div class="compact-filter-form">
            <div class="filter-fields-row">
                <!-- Période (mois) -->
                <div class="filter-field">
                    <label class="filter-label"><i class="bi bi-calendar-range"></i> Période</label>
                    <div class="filter-input-group">
                        <details class="month-period-filter w-100" data-table="#communionTable" data-month-source="paidMonth">
                            <summary>Tous les mois</summary>
                            <div class="month-period-panel">
                                <button type="button" class="btn btn-sm btn-outline-primary month-filter-select-all" data-table="#communionTable">Sélectionner tout</button>
                                <div class="month-filter-list">
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#communionTable" value="1"> <span>Janvier</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#communionTable" value="2"> <span>Février</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#communionTable" value="3"> <span>Mars</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#communionTable" value="4"> <span>Avril</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#communionTable" value="5"> <span>Mai</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#communionTable" value="6"> <span>Juin</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#communionTable" value="7"> <span>Juillet</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#communionTable" value="8"> <span>Août</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#communionTable" value="9"> <span>Septembre</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#communionTable" value="10"> <span>Octobre</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#communionTable" value="11"> <span>Novembre</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#communionTable" value="12"> <span>Décembre</span></label>
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-secondary month-filter-clear" data-table="#communionTable">Désélectionner tout</button>
                            </div>
                        </details>
                    </div>
                </div>

                <!-- Intervalle de dates (Du — Au) groupé -->
                <div class="filter-field">
                    <label class="filter-label"><i class="bi bi-calendar-event"></i> Date</label>
                    <div class="filter-date-range">
                        <div class="filter-date-item">
                            <span class="filter-date-sep">Du</span>
                            <input type="date" id="communionDateFrom" class="form-control date-range-filter" data-table="#communionTable" data-date-column="payment">
                        </div>
                        <div class="filter-date-item">
                            <span class="filter-date-sep">Au</span>
                            <input type="date" id="communionDateTo" class="form-control date-range-filter" data-table="#communionTable" data-date-column="payment">
                        </div>
                    </div>
                </div>

                <!-- Recherche -->
                <div class="filter-field filter-field-search">
                    <label class="filter-label"><i class="bi bi-search"></i> Recherche</label>
                    <div class="filter-input-group"><i class="bi bi-search"></i><input class="form-control search-input table-filter" data-table="#communionTable" placeholder="Matricule / nom / libellé"></div>
                </div>
            </div>
            <div class="filter-actions-row">
                <div class="filter-actions-left">
                    <button type="button" class="btn btn-outline-secondary reset-table-filters" data-table="#communionTable" title="Effacer les critères et réafficher toutes les lignes"><i class="bi bi-arrow-counterclockwise"></i> Ré-afficher</button>
                    <button type="button" class="btn btn-outline-secondary print-filtered-table" data-table="#communionTable" data-title="Historique entrée communion" data-subtitle="FJKM MALAZA GILEADA"><i class="bi bi-printer"></i> Imprimer</button>
                    <button type="button" class="btn btn-outline-secondary print-filtered-table" data-table="#communionTable" data-title="Historique entrée communion" data-subtitle="FJKM MALAZA GILEADA"><i class="bi bi-file-pdf"></i> PDF</button>
                </div>
                <div class="filter-actions-right">
                    <button type="button" class="btn btn-filter-action" data-bs-toggle="modal" data-bs-target="#communionModal"><i class="bi bi-plus-lg"></i> Ajouter</button>
                </div>
            </div>
        </div>
    </div>

    <div class="premium-table-wrap">
    <table class="table data-table no-datatables align-middle" id="communionTable">
        <thead><tr><th>Date paiement</th><th>Matricule</th><th>Chrétien·ne</th><th>Mois payé</th><th>Année payée</th><th>Montant</th><th>Mode</th><th>Référence</th><th class="no-print">Actions</th></tr></thead>
        <tbody>
    <?php foreach($payments as $p): $canEdit = Auth::can('ADMIN') || (substr((string)($p['created_at'] ?? ''),0,10) === date('Y-m-d')); ?>
        <?php $lookup = $p['matricule'].' — '.$p['full_name']; $month = (int)($p['paid_month'] ?? (int)date('n', strtotime($p['payment_date']))); $year = (int)($p['paid_year'] ?? (int)date('Y', strtotime($p['payment_date']))); $values = ['fidel_lookup'=>$lookup,'fidel_id'=>$p['fidel_id'],'payment_date'=>$p['payment_date'],'paid_year'=>$year,'paid_month'=>$month,'year'=>$year,'amount'=>$p['amount'],'payment_method'=>$p['payment_method']]; ?>
        <tr data-payment="<?= e($p['payment_date']) ?>" data-paid-month="<?= (int)$month ?>" data-amount="<?= e($p['amount']) ?>">
            <td><?= date_mg($p['payment_date']) ?></td>
            <td><?= e($p['matricule']) ?></td>
            <td><?= e($p['full_name']) ?></td>
            <td><?= e($monthsFr[$month] ?? $month) ?></td>
            <td><?= e((string)$year) ?></td>
            <td><?= money_mga($p['amount']) ?></td>
            <td><?= e($p['payment_method']) ?></td>
            <td><?= e($p['reference']) ?></td>
            <td class="no-print">
                <div class="action-buttons">
                    <button type="button" class="btn btn-sm btn-light print-row" title="Imprimer"><i class="bi bi-printer"></i></button>
                    <?php if($canEdit): ?>
                    <button type="button" class="btn btn-sm btn-outline-primary edit-to-form" data-form="#communionForm" data-title="#communionModalTitleText" data-title-text="Modification entrée communion" data-submit="#communionSubmit" data-submit-text="Modifier" data-action="<?= url('communion/'.$p['id'].'/update') ?>" data-values='<?= e(json_encode($values, JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_UNICODE)) ?>' data-bs-toggle="modal" data-bs-target="#communionModal" title="Modifier"><i class="bi bi-pencil"></i></button>
                    <?php endif; ?>
                    <?php if(Auth::can('ADMIN')): ?>
                    <form method="post" action="<?= url('communion/'.$p['id'].'/delete') ?>" class="d-inline" onsubmit="return confirm('Supprimer cette entrée communion ?')"><?= csrf_field() ?><button class="btn btn-sm btn-outline-danger" title="Supprimer"><i class="bi bi-trash"></i></button></form>
                    <?php endif; ?>
                </div>
            </td>
        </tr>
    <?php endforeach; ?>
        </tbody>
        <tfoot><tr><th colspan="5" class="text-end">Montant total</th><th class="table-total-amount">0 Ar</th><th colspan="3" class="no-print"></th></tr></tfoot>
    </table>
    </div>
</div>
