<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<?php use App\Core\Auth; ?>
<?php if (Auth::can('ADMIN','USER')): ?>
<!-- Modal Ajout/Modification Chrétien -->
<div class="modal fade" id="christianeModal" tabindex="-1" aria-labelledby="christianeModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
      <div class="modal-header border-0 pb-0" style="padding:24px 28px 0;">
        <h5 class="modal-title fw-bold fs-5" id="christianeModalTitle">
          <i class="bi bi-person-badge text-primary"></i>
          <span id="christianeModalTitleText">Nouveau Chrétien</span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <form id="christianeForm" method="post" action="<?= url('fideles') ?>" data-create-action="<?= url('fideles') ?>" enctype="multipart/form-data" class="needs-validation" novalidate>
        <div class="modal-body" style="padding:20px 28px 16px;">
          <?= csrf_field() ?>
          <div class="row g-3">
            <div class="col-lg-4 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-qr-code"></i> Matricule</label>
              <input name="matricule" class="form-control" value="<?= e($nextMatricule) ?>" data-default-value="<?= e($nextMatricule) ?>" required>
              <div class="invalid-feedback">Matricule obligatoire.</div>
            </div>
            <div class="col-lg-4 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-calendar-plus"></i> Date d'enregistrement</label>
              <input type="date" name="created_date" class="form-control" value="<?= date('Y-m-d') ?>" data-default-value="<?= date('Y-m-d') ?>" required>
              <div class="invalid-feedback">Date obligatoire.</div>
            </div>
            <div class="col-lg-4 col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-person-fill"></i> Nom complet</label>
              <input name="full_name" class="form-control" required>
              <div class="invalid-feedback">Veuillez remplir ce champ.</div>
            </div>
            <div class="col-lg-3 col-md-4">
              <label class="form-label fw-semibold"><i class="bi bi-gender-ambiguous"></i> Genre</label>
              <select name="gender" class="form-select">
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
            <div class="col-lg-3 col-md-4">
              <label class="form-label fw-semibold"><i class="bi bi-people"></i> Groupe</label>
              <input name="group_name" class="form-control" placeholder="Groupe">
            </div>
            <div class="col-lg-3 col-md-4">
              <label class="form-label fw-semibold"><i class="bi bi-telephone"></i> Téléphone</label>
              <input name="phone" class="form-control phone-input" maxlength="13" pattern="\d{3}\.\d{2}\.\d{3}\.\d{2}" placeholder="034.77.777.87">
              <div class="invalid-feedback">Format attendu : 034.77.777.87</div>
            </div>
            <div class="col-lg-3 col-md-4">
              <label class="form-label fw-semibold"><i class="bi bi-cake2"></i> Date naissance</label>
              <input type="date" name="birth_date" class="form-control">
            </div>
            <div class="col-lg-3 col-md-4">
              <label class="form-label fw-semibold"><i class="bi bi-droplet"></i> Date baptême</label>
              <input type="date" name="baptized_at" class="form-control">
            </div>
            <div class="col-lg-3 col-md-4">
              <label class="form-label fw-semibold"><i class="bi bi-cup-straw"></i> Date communion</label>
              <input type="date" name="communion_at" class="form-control">
            </div>
            <div class="col-lg-3 col-md-4">
              <label class="form-label fw-semibold"><i class="bi bi-flag"></i> Statut</label>
              <select name="status" class="form-select">
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold"><i class="bi bi-geo-alt"></i> Adresse</label>
              <input name="address" class="form-control">
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold"><i class="bi bi-camera"></i> Photo</label>
              <input type="file" name="photo" class="form-control" accept="image/*">
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 pt-0" style="padding:0 28px 24px;">
          <button type="button" class="btn btn-light" data-bs-dismiss="modal"><i class="bi bi-x-circle"></i> Annuler</button>
          <button id="christianeSubmit" type="submit" class="btn btn-primary"><i class="bi bi-check-circle"></i> Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</div>
<?php endif; ?>

<!-- Modal Premium Voir Chrétien -->
<div class="modal fade" id="christianeViewModal" tabindex="-1" aria-labelledby="christianeViewModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius:20px;">
      <div class="modal-header border-0 pb-0" style="padding:24px 28px 0;">
        <h5 class="modal-title fw-bold fs-5" id="christianeViewModalTitle">
          <i class="bi bi-person-vcard text-primary"></i>
          <span>Fiche Chrétien</span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <div class="modal-body" style="padding:20px 28px 16px;">
        <div id="christianeViewContent">
          <div class="text-center py-4 text-muted"><i class="bi bi-arrow-up-circle fs-1 d-block mb-2"></i> Cliquez sur l'œil 👁️ d'un membre pour voir sa fiche</div>
        </div>
      </div>
      <div class="modal-footer border-0 pt-0" style="padding:0 28px 24px;">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal"><i class="bi bi-x-circle"></i> Fermer</button>
      </div>
    </div>
  </div>
</div>

<div class="premium-card">
    <div class="d-flex flex-wrap gap-2 justify-content-between align-items-end mb-3 module-list-header">
        <h3 class="mb-0"><i class="bi bi-list-check"></i> Liste Chrétien</h3>
    </div>

    <!-- Filtres améliorés -->
    <div class="filter-card mb-3">
        <div class="compact-filter-form">
            <div class="filter-fields-row">
                <div class="filter-field">
                    <label class="filter-label"><i class="bi bi-calendar-range"></i> Période</label>
                    <div class="filter-input-group">
                        <details class="month-period-filter w-100" data-table="#christianeTable" data-month-source="createdMonth">
                            <summary>Tous les mois</summary>
                            <div class="month-period-panel">
                                <button type="button" class="btn btn-sm btn-outline-primary month-filter-select-all" data-table="#christianeTable">Sélectionner tout</button>
                                <div class="month-filter-list">
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#christianeTable" value="1"> <span>Janvier</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#christianeTable" value="2"> <span>Février</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#christianeTable" value="3"> <span>Mars</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#christianeTable" value="4"> <span>Avril</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#christianeTable" value="5"> <span>Mai</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#christianeTable" value="6"> <span>Juin</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#christianeTable" value="7"> <span>Juillet</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#christianeTable" value="8"> <span>Août</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#christianeTable" value="9"> <span>Septembre</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#christianeTable" value="10"> <span>Octobre</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#christianeTable" value="11"> <span>Novembre</span></label>
                                    <label class="form-check"><input class="form-check-input month-filter-checkbox" type="checkbox" data-table="#christianeTable" value="12"> <span>Décembre</span></label>
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-secondary month-filter-clear" data-table="#christianeTable">Désélectionner tout</button>
                            </div>
                        </details>
                    </div>
                </div>
                <div class="filter-field">
                    <label class="filter-label"><i class="bi bi-calendar-event"></i> Date</label>
                    <div class="filter-date-range">
                        <div class="filter-date-item">
                            <span class="filter-date-sep">Du</span>
                            <input type="date" id="christianeDateFrom" class="form-control date-range-filter" data-table="#christianeTable" data-date-column="created">
                        </div>
                        <div class="filter-date-item">
                            <span class="filter-date-sep">Au</span>
                            <input type="date" id="christianeDateTo" class="form-control date-range-filter" data-table="#christianeTable" data-date-column="created">
                        </div>
                    </div>
                </div>
                <div class="filter-field filter-field-search">
                    <label class="filter-label"><i class="bi bi-search"></i> Recherche</label>
                    <div class="filter-input-group"><i class="bi bi-search"></i><input class="form-control search-input table-filter" data-table="#christianeTable" placeholder="Matricule / nom / téléphone / groupe"></div>
                </div>
            </div>
            <div class="filter-actions-row">
                <div class="filter-actions-left">
                    <button type="button" class="btn btn-outline-secondary reset-table-filters" data-table="#christianeTable" title="Effacer les critères et réafficher toutes les lignes"><i class="bi bi-arrow-counterclockwise"></i> Ré-afficher</button>
                    <button type="button" class="btn btn-outline-secondary print-filtered-table" data-table="#christianeTable" data-title="Liste Chrétien" data-subtitle="FJKM MALAZA GILEADA"><i class="bi bi-printer"></i> Imprimer</button>
                    <button type="button" class="btn btn-outline-secondary print-filtered-table" data-table="#christianeTable" data-title="Liste Chrétien" data-subtitle="FJKM MALAZA GILEADA"><i class="bi bi-file-pdf"></i> PDF</button>
                </div>
                <div class="filter-actions-right">
                    <?php if (Auth::can('ADMIN','USER')): ?>
                    <button type="button" class="btn btn-filter-action" data-bs-toggle="modal" data-bs-target="#christianeModal"><i class="bi bi-plus-lg"></i> Ajouter</button>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <div class="premium-table-wrap">
    <table class="table data-table no-datatables align-middle" id="christianeTable">
        <thead><tr><th>Date enr.</th><th>Matricule</th><th>Nom</th><th>Groupe</th><th>Téléphone</th><th>Baptisé</th><th>Communion</th><th>Statut</th><th class="no-print">Actions</th></tr></thead>
        <tbody id="fidelesBody">
    <?php foreach($fideles as $f): $canEdit = Auth::can('ADMIN') || (substr((string)($f['created_at'] ?? ''),0,10) === date('Y-m-d')); ?>
        <?php $createdDate = substr((string)($f['created_at'] ?? ''),0,10); $values = ['matricule'=>$f['matricule'],'created_date'=>$createdDate,'full_name'=>$f['full_name'],'gender'=>$f['gender'],'group_name'=>$f['group_name'] ?? '','phone'=>$f['phone'],'birth_date'=>$f['birth_date'],'baptized_at'=>$f['baptized_at'],'communion_at'=>$f['communion_at'],'status'=>$f['status'],'address'=>$f['address']]; ?>
        <tr data-created="<?= e($createdDate) ?>" data-created-month="<?= (int)date('n', strtotime($createdDate)) ?>"><td><?= date_mg($createdDate) ?></td><td><?= e($f['matricule']) ?></td><td><?= e($f['full_name']) ?></td><td><?= e($f['group_name'] ?? '') ?></td><td><?= e($f['phone']) ?></td><td><?= date_mg($f['baptized_at']) ?></td><td><?= date_mg($f['communion_at']) ?></td><td><?= status_badge($f['status']) ?></td><td class="no-print"><div class="action-buttons"><button type="button" class="btn btn-sm btn-outline-primary view-member" title="Voir" data-bs-toggle="modal" data-bs-target="#christianeViewModal" data-values='<?= e(json_encode($values, JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_UNICODE)) ?>' data-photo="<?= e($f['photo'] ? url('public/'.$f['photo']) : '') ?>""><i class="bi bi-eye"></i></button><?php if($canEdit && Auth::can('ADMIN','USER')): ?> <button type="button" class="btn btn-sm btn-outline-secondary edit-to-form" data-form="#christianeForm" data-title="#christianeModalTitleText" data-title-text="Modification Chrétien" data-submit="#christianeSubmit" data-submit-text="Modifier" data-action="<?= url('fideles/'.$f['id'].'/update') ?>" data-values='<?= e(json_encode($values, JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_UNICODE)) ?>' data-bs-toggle="modal" data-bs-target="#christianeModal" title="Modifier"><i class="bi bi-pencil"></i></button><?php endif; ?><?php if(Auth::can('ADMIN')): ?> <form method="post" action="<?= url('fideles/'.$f['id'].'/delete') ?>" class="d-inline" onsubmit="return confirm('Supprimer ce Chrétien ?')"><?= csrf_field() ?><button class="btn btn-sm btn-outline-danger" title="Supprimer"><i class="bi bi-trash"></i></button></form><?php endif; ?></div></td></tr>
    <?php endforeach; ?>
        </tbody>
        <tfoot><tr><th colspan="7" class="text-end">Nombre Chrétien</th><th class="table-total-count"><?= e(count($fideles)) ?></th><th class="no-print"></th></tr></tfoot>
    </table>
    </div>
</div>
