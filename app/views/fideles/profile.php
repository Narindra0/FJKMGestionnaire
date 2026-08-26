<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
$photoUrl = $fidel['photo'] ? url('public/'.$fidel['photo']) : asset('img/avatar.svg');
$genderLabel = ($fidel['gender'] ?? '') === 'M' ? 'Masculin' : (($fidel['gender'] ?? '') === 'F' ? 'Féminin' : '-');
$obligationTotal = 0;
$communionTotal = 0;
?>
<div class="row g-4">
    <div class="col-lg-12">

        <div class="premium-card mb-4 member-mini-card" id="memberPrintInfo">
            <div class="d-flex gap-3 align-items-start flex-wrap">
                <img class="member-print-photo" src="<?= e($photoUrl) ?>" alt="Photo">
                <div class="flex-grow-1">
                    <h2 class="h5 text-primary mb-1">FJKM Malaza Gileada</h2>
                    <h3 class="mb-2">Mombamomba Chrétien</h3>
                    <table class="table table-sm table-bordered-soft mb-0">
                        <tbody>
                        <tr><th>Matricule</th><td><?= e($fidel['matricule']) ?></td><th>Nom complet</th><td><?= e($fidel['full_name']) ?></td></tr>
                        <tr><th>Genre</th><td><?= e($genderLabel) ?></td><th>Groupe</th><td><?= e($fidel['group_name'] ?? '-') ?></td></tr>
                        <tr><th>Téléphone</th><td><?= e($fidel['phone']) ?></td><th>Statut</th><td><?= e(($fidel['status'] ?? '') === 'active' ? 'Actif' : 'Inactif') ?></td></tr>
                        <tr><th>Date naissance</th><td><?= date_mg($fidel['birth_date']) ?></td><th>Date baptême</th><td><?= date_mg($fidel['baptized_at']) ?></td></tr>
                        <tr><th>Date communion</th><td><?= date_mg($fidel['communion_at']) ?></td><th></th><td></td></tr>
                        <tr><th>Adresse</th><td colspan="3"><?= e($fidel['address']) ?></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="d-flex flex-wrap gap-2 mt-3 no-print member-print-actions">
                <a class="btn btn-outline-secondary" href="<?= url('fideles') ?>">Retour</a>
                <button type="button" class="btn btn-outline-primary" data-print-member-profile="#memberPrintInfo">Imprimer la fiche</button>
                <a class="btn btn-primary" href="<?= url('fideles/'.$fidel['id'].'/card') ?>">Imprimer carte Chrétien</a>
                <button type="button" class="btn btn-outline-primary" data-print-member-histories>Imprimer historiques</button>
            </div>
        </div>

        <div class="premium-card mb-4">
            <div class="d-flex flex-wrap gap-2 justify-content-between align-items-end mb-3">
                <h3 class="mb-0">Historique obligation</h3>
                <div class="table-search-zone date-range-zone">
                    <button type="button" class="btn btn-outline-secondary btn-sm reset-table-filters" data-table="#memberObligationTable" title="Effacer les critères et réafficher toutes les lignes">Ré-afficher</button>
                    <label class="form-label mb-0">Du</label><input type="date" id="memberObligationFrom" class="form-control date-range-filter" data-table="#memberObligationTable">
                    <label class="form-label mb-0">Au</label><input type="date" id="memberObligationTo" class="form-control date-range-filter" data-table="#memberObligationTable">
                    <input class="form-control search-input table-filter" data-table="#memberObligationTable" placeholder="Matricule / période / libellé">
                    <button type="button" class="btn btn-outline-primary btn-sm print-filtered-table" data-table="#memberObligationTable" data-member="#memberPrintInfo" data-title="Historique obligation" data-subtitle="FJKM MALAZA GILEADA">Imprimer</button>
                </div>
            </div>
            <table class="table data-table no-datatables align-middle print-clean-table" id="memberObligationTable">
                <thead><tr><th>Date</th><th>Matricule</th><th>Nom</th><th>Période</th><th>Libellé</th><th>Dû</th><th>Payé</th><th>Reste</th><th>Statut</th></tr></thead>
                <tbody>
                <?php foreach($obligations as $o): $rest=max(0,(float)$o['amount_due']-(float)$o['amount_paid']); $obligationTotal += (float)$o['amount_paid']; $date = $o['last_payment_date'] ?: substr((string)($o['created_at'] ?? ''),0,10); ?>
                    <tr data-created="<?= e($date) ?>" data-amount="<?= e($o['amount_paid']) ?>"><td><?= date_mg($date) ?></td><td><?= e($fidel['matricule']) ?></td><td><?= e($fidel['full_name']) ?></td><td><?= e($o['period_name']) ?></td><td><?= e($o['label']) ?></td><td><?= money_mga($o['amount_due']) ?></td><td><?= money_mga($o['amount_paid']) ?></td><td><?= money_mga($rest) ?></td><td><?= status_badge($o['status']) ?></td></tr>
                <?php endforeach; ?>
                </tbody>
                <tfoot><tr><th colspan="6" class="text-end">Montant total payé</th><th class="table-total-amount"><?= money_mga($obligationTotal) ?></th><th colspan="2"></th></tr></tfoot>
            </table>
        </div>

        <div class="premium-card">
            <div class="d-flex flex-wrap gap-2 justify-content-between align-items-end mb-3">
                <h3 class="mb-0">Historique communion</h3>
                <div class="table-search-zone date-range-zone">
                    <button type="button" class="btn btn-outline-secondary btn-sm reset-table-filters" data-table="#memberCommunionTable" title="Effacer les critères et réafficher toutes les lignes">Ré-afficher</button>
                    <label class="form-label mb-0">Du</label><input type="date" id="memberCommunionFrom" class="form-control date-range-filter" data-table="#memberCommunionTable">
                    <label class="form-label mb-0">Au</label><input type="date" id="memberCommunionTo" class="form-control date-range-filter" data-table="#memberCommunionTable">
                    <input class="form-control search-input table-filter" data-table="#memberCommunionTable" placeholder="Matricule / mois / référence">
                    <button type="button" class="btn btn-outline-primary btn-sm print-filtered-table" data-table="#memberCommunionTable" data-member="#memberPrintInfo" data-title="Historique communion" data-subtitle="FJKM MALAZA GILEADA">Imprimer</button>
                </div>
            </div>
            <table class="table data-table no-datatables align-middle print-clean-table" id="memberCommunionTable">
                <thead><tr><th>Date paiement</th><th>Matricule</th><th>Chrétien·ne</th><th>Mois payé</th><th>Année payée</th><th>Montant</th><th>Mode</th><th>Référence</th></tr></thead>
                <tbody>
                <?php foreach(($communionHistory ?? []) as $c): $communionTotal += (float)$c['amount']; ?>
                    <tr data-created="<?= e($c['payment_date']) ?>" data-amount="<?= e($c['amount']) ?>"><td><?= date_mg($c['payment_date']) ?></td><td><?= e($fidel['matricule']) ?></td><td><?= e($fidel['full_name']) ?></td><td><?= e($c['month_name'] ?? $c['paid_month']) ?></td><td><?= e($c['paid_year']) ?></td><td><?= money_mga($c['amount']) ?></td><td><?= e($c['payment_method']) ?></td><td><?= e($c['reference']) ?></td></tr>
                <?php endforeach; ?>
                </tbody>
                <tfoot><tr><th colspan="5" class="text-end">Montant total payé</th><th class="table-total-amount"><?= money_mga($communionTotal) ?></th><th colspan="2"></th></tr></tfoot>
            </table>
        </div>
    </div>
</div>
