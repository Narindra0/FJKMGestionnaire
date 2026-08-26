<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<?php use App\Core\Auth; ?>
<?php $monthsFr = $monthsFr ?? [1=>'Janvier',2=>'Février',3=>'Mars',4=>'Avril',5=>'Mai',6=>'Juin',7=>'Juillet',8=>'Août',9=>'Septembre',10=>'Octobre',11=>'Novembre',12=>'Décembre']; ?>

<!-- Modal Ajout/Modification Obligation -->
<div class="modal fade" id="obligationModal" tabindex="-1" aria-labelledby="obligationModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
      <div class="modal-header border-0 pb-0" style="padding:24px 28px 0;">
        <h5 class="modal-title fw-bold fs-5" id="obligationModalTitle">
          <i class="bi bi-journal-plus text-primary"></i>
          <span id="obligationModalTitleText">Nouvelle obligation</span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <form id="obligationForm" method="post" action="<?= url('obligations') ?>" data-create-action="<?= url('obligations') ?>" class="needs-validation" novalidate>
        <div class="modal-body" style="padding:20px 28px 16px;">
          <?= csrf_field() ?>
          <input type="hidden" name="fidel_id" id="obligationFidelId" data-required-hidden="true">
          <input type="hidden" name="existing_obligation_id" id="existingObligationId">
          <input type="hidden" name="amount_paid" id="obligationPaidHidden">

          <div class="row g-3">
            <div class="col-lg-6 col-md-6">
              <label class="obligation-label"><i class="bi bi-person-badge"></i> Matricule / nom Chrétien</label>
              <div class="obligation-input-group"><i class="bi bi-search"></i><input name="fidel_lookup" id="obligationFidelLookup" class="form-control fidel-lookup" list="fidelesList" data-hidden="#obligationFidelId" autocomplete="off" placeholder="Tapez matricule ou nom" required></div>
              <div class="invalid-feedback">Choisissez un·e Chrétien·ne valide.</div>
            </div>

            <div class="col-lg-3 col-md-6">
              <label class="obligation-label"><i class="bi bi-calendar-month"></i> Mois</label>
              <div class="obligation-input-group"><i class="bi bi-calendar3"></i><select name="period_month" id="obligationMonth" class="form-select" required><option value="">Mois</option><?php foreach($monthsFr as $m=>$month): ?><option value="<?= $m ?>" <?= (int)date('n')===$m?'selected':'' ?>><?= e($month) ?></option><?php endforeach; ?></select></div>
            </div>

            <div class="col-lg-3 col-md-6">
              <label class="obligation-label"><i class="bi bi-calendar-year"></i> Année</label>
              <div class="obligation-input-group"><i class="bi bi-calendar2"></i><input type="number" name="period_year" id="obligationYear" class="form-control" value="<?= e($currentYear ?? date('Y')) ?>" min="2000" max="2100" required></div>
            </div>

            <div class="col-lg-6 col-md-6">
              <label class="obligation-label"><i class="bi bi-tag"></i> Libellé</label>
              <div class="obligation-input-group"><i class="bi bi-card-text"></i><input name="label" id="obligationLabel" class="form-control" value="Obligation mensuelle" required></div>
              <div class="invalid-feedback">Veuillez remplir ce champ.</div>
            </div>

            <div class="col-lg-4 col-md-6">
              <label class="obligation-label"><i class="bi bi-cash"></i> Montant total à payer</label>
              <div class="obligation-input-group"><i class="bi bi-coin"></i><input name="amount_due" id="obligationDue" type="number" step="0.01" class="form-control readonly-ref" value="<?= e($defaultAmount) ?>" data-default-value="<?= e($defaultAmount) ?>" <?= Auth::can('ADMIN') ? '' : 'readonly' ?> required></div>
              <div class="invalid-feedback">Champ obligatoire.</div>
            </div>

            <div class="col-lg-4 col-md-6">
              <label class="obligation-label"><i class="bi bi-hourglass-split"></i> Reste actuel</label>
              <div class="obligation-input-group"><i class="bi bi-currency-exchange"></i><input id="obligationRest" class="form-control readonly-ref" value="0 Ar" readonly></div>
            </div>

            <div class="col-lg-4 col-md-6">
              <label class="obligation-label"><i class="bi bi-wallet2"></i> Montant payé maintenant</label>
              <div class="obligation-input-group"><i class="bi bi-cash-coin"></i><input name="payment_amount" id="obligationPayment" type="number" step="0.01" min="0" class="form-control" value="0" required></div>
              <div class="invalid-feedback">Champ obligatoire.</div>
            </div>

            <div class="col-12">
              <label class="obligation-label"><i class="bi bi-calendar-event"></i> Date paiement</label>
              <div class="obligation-input-group"><i class="bi bi-calendar-check"></i><input type="date" name="payment_date" value="<?= date('Y-m-d') ?>" class="form-control"></div>
            </div>

            <div class="col-12">
              <div id="obligationStatusHelp" class="alert alert-info py-2 mb-0 d-none"></div>
              <div id="obligationHistoryBox" class="small-history d-none mb-0"></div>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 pt-0" style="padding:0 28px 24px;">
          <button type="button" class="btn btn-light" data-bs-dismiss="modal"><i class="bi bi-x-circle"></i> Annuler</button>
          <button id="obligationSubmit" type="submit" class="btn btn-primary"><i class="bi bi-check-circle"></i> Enregistrer</button>
        </div>
      </form>
      <datalist id="fidelesList"><?php foreach($fideles as $f): ?><option value="<?= e($f['matricule'].' — '.$f['full_name']) ?>" data-id="<?= (int)$f['id'] ?>" data-matricule="<?= e($f['matricule']) ?>" data-name="<?= e($f['full_name']) ?>"></option><?php endforeach; ?></datalist>
    </div>
  </div>
</div>

<?php if (Auth::can('ADMIN')): ?>
<!-- Paramètre obligation : réservé à l'administrateur -->
<div class="premium-card mb-4">
    <div class="card-heading">
        <h3><i class="bi bi-gear"></i> Paramètre obligation <small class="text-muted">(adidy)</small></h3>
        <span><i class="bi bi-info-circle"></i> Montant par défaut</span>
    </div>
    <form method="post" action="<?= url('obligations/settings') ?>" class="row g-3 align-items-end needs-validation" novalidate>
        <?= csrf_field() ?>
        <div class="col-md-4 col-sm-6">
            <label class="obligation-label"><i class="bi bi-coin"></i> Montant automatique à payer</label>
            <div class="obligation-input-group"><i class="bi bi-cash-stack"></i><input type="number" step="0.01" name="obligation_default_amount" value="<?= e($defaultAmount) ?>" class="form-control" required></div>
        </div>
        <div class="col-md-3 col-sm-6 d-flex align-items-end">
            <button class="btn btn-outline-primary w-100"><i class="bi bi-check-lg"></i> Enregistrer</button>
        </div>
    </form>
</div>
<?php endif; ?>

<!-- Liste des obligations -->
<div class="premium-card">
    <div class="d-flex flex-wrap gap-2 justify-content-between align-items-end mb-3 module-list-header">
        <h3 class="mb-0"><i class="bi bi-list-check"></i> Liste obligations</h3>
    </div>

    <!-- Filtres améliorés avec hiérarchie et groupes -->
    <div class="filter-card mb-3">
        <div class="compact-filter-form">
            <div class="filter-fields-row">
                <!-- Période (mois) -->
                <div class="filter-field">
                    <label class="filter-label"><i class="bi bi-calendar-range"></i> Période</label>
                    <div class="filter-input-group">
                        <details class="month-period-filter w-100" data-table="#obligationsTable" data-month-source="periodMonth">
                            <summary>Tous les mois</summary>
                            <div class="month-period-panel">
                                <button type="button" class="btn btn-sm btn-outline-primary month-filter-select-all" data-table="#obligationsTable">Sélectionner tout</button>
                                <div class="month-filter-list">
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#obligationsTable" value="1"> <span>Janvier</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#obligationsTable" value="2"> <span>Février</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#obligationsTable" value="3"> <span>Mars</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#obligationsTable" value="4"> <span>Avril</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#obligationsTable" value="5"> <span>Mai</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#obligationsTable" value="6"> <span>Juin</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#obligationsTable" value="7"> <span>Juillet</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#obligationsTable" value="8"> <span>Août</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#obligationsTable" value="9"> <span>Septembre</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#obligationsTable" value="10"> <span>Octobre</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#obligationsTable" value="11"> <span>Novembre</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#obligationsTable" value="12"> <span>Décembre</span></label>
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-secondary month-filter-clear" data-table="#obligationsTable">Désélectionner tout</button>
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
                            <input type="date" id="obligationDateFrom" class="form-control date-range-filter" data-table="#obligationsTable">
                        </div>
                        <div class="filter-date-item">
                            <span class="filter-date-sep">Au</span>
                            <input type="date" id="obligationDateTo" class="form-control date-range-filter" data-table="#obligationsTable">
                        </div>
                    </div>
                </div>

                <!-- Recherche -->
                <div class="filter-field filter-field-search">
                    <label class="filter-label"><i class="bi bi-search"></i> Recherche</label>
                    <div class="filter-input-group"><i class="bi bi-search"></i><input class="form-control search-input table-filter" data-table="#obligationsTable" placeholder="Matricule / nom / libellé"></div>
                </div>
            </div>
            <div class="filter-actions-row">
                <div class="filter-actions-left">
                    <button type="button" class="btn btn-outline-secondary reset-table-filters" data-table="#obligationsTable" title="Effacer les critères et réafficher toutes les lignes"><i class="bi bi-arrow-counterclockwise"></i> Ré-afficher</button>
                    <button type="button" class="btn btn-outline-secondary print-filtered-table" data-table="#obligationsTable" data-title="Liste obligations" data-subtitle="FJKM MALAZA GILEADA"><i class="bi bi-printer"></i> Imprimer</button>
                    <button type="button" class="btn btn-outline-secondary print-filtered-table" data-table="#obligationsTable" data-title="Liste obligations" data-subtitle="FJKM MALAZA GILEADA"><i class="bi bi-file-pdf"></i> PDF</button>
                </div>
                <div class="filter-actions-right">
                    <button type="button" class="btn btn-filter-action" data-bs-toggle="modal" data-bs-target="#obligationModal"><i class="bi bi-plus-lg"></i> Ajouter</button>
                </div>
            </div>
        </div>
    </div>

    <div class="premium-table-wrap">
    <table class="table data-table no-datatables align-middle" id="obligationsTable">
        <thead><tr><th>Date</th><th>Matricule</th><th>Nom</th><th>Période</th><th>Libellé</th><th>Dû</th><th>Payé</th><th>Reste</th><th>Statut</th><th class="no-print">Actions</th></tr></thead>
        <tbody>
    <?php foreach($obligations as $o): $canEdit = Auth::can('ADMIN') || (substr((string)($o['created_at'] ?? ''),0,10) === date('Y-m-d')); ?>
        <?php $reste = (float)$o['amount_due']-(float)$o['amount_paid']; $lookup = $o['matricule'].' — '.$o['full_name']; $createdDate = substr((string)($o['created_at'] ?? ''),0,10); $values = ['fidel_lookup'=>$lookup,'fidel_id'=>$o['fidel_id'],'period_month'=>$o['period_month'],'period_year'=>$o['period_year'],'label'=>$o['label'],'amount_due'=>$o['amount_due'],'amount_paid'=>$o['amount_paid'],'payment_amount'=>0,'existing_obligation_id'=>$o['id']]; ?>
        <tr data-created="<?= e($createdDate) ?>" data-period-month="<?= (int)$o['period_month'] ?>" data-fidel-id="<?= (int)$o['fidel_id'] ?>" data-matricule="<?= e($o['matricule']) ?>" data-amount="<?= e($o['amount_paid']) ?>">
            <td><?= date_mg($createdDate) ?></td>
            <td><?= e($o['matricule']) ?></td>
            <td><?= e($o['full_name']) ?></td>
            <td><?= e($o['period_name']) ?></td>
            <td><?= e($o['label']) ?></td>
            <td><?= money_mga($o['amount_due']) ?></td>
            <td><?= money_mga($o['amount_paid']) ?></td>
            <td><?= money_mga($reste) ?></td>
            <td><?= status_badge($o['status']) ?></td>
            <td class="no-print">
                <div class="action-buttons">
                    <button type="button" class="btn btn-sm btn-light print-row" title="Imprimer"><i class="bi bi-printer"></i></button>
                    <?php if($canEdit): ?>
                    <button type="button" class="btn btn-sm btn-outline-primary edit-to-form" data-form="#obligationForm" data-title="#obligationModalTitleText" data-title-text="Modification obligation" data-submit="#obligationSubmit" data-submit-text="Modifier" data-action="<?= url('obligations/'.$o['id'].'/update') ?>" data-values='<?= e(json_encode($values, JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_UNICODE)) ?>' data-bs-toggle="modal" data-bs-target="#obligationModal" title="Modifier"><i class="bi bi-pencil"></i></button>
                    <?php endif; ?>
                    <?php if(Auth::can('ADMIN')): ?>
                    <form method="post" action="<?= url('obligations/'.$o['id'].'/delete') ?>" class="d-inline" onsubmit="return confirm('Supprimer cette obligation ?')"><?= csrf_field() ?><button class="btn btn-sm btn-outline-danger" title="Supprimer"><i class="bi bi-trash"></i></button></form>
                    <?php endif; ?>
                </div>
            </td>
        </tr>
    <?php endforeach; ?>
        </tbody>
        <tfoot><tr><th colspan="6" class="text-end">Montant total payé</th><th class="table-total-amount">0 Ar</th><th colspan="3" class="no-print"></th></tr></tfoot>
    </table>
    </div>
</div>
