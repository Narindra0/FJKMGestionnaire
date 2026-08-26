<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<?php $reportTypes = ['general'=>'Général','entree'=>'Entrée','sortie'=>'Sortie','obligation'=>'Obligation','communion'=>'Communion','projet'=>'Projet','christiane'=>'Chrétien']; ?>
<div class="premium-card mb-4 no-print">
    <form class="row g-2 align-items-end compact-report-form" method="get" action="<?= url('reports') ?>">
        <div class="col-auto"><a class="btn btn-outline-secondary dashboard-reset-btn" href="<?= url('reports') ?>" title="Effacer les critères et réafficher le rapport">Ré-afficher</a></div>
        <div class="col-md-2"><label class="form-label">Rapport</label><select name="type" class="form-select"><?php foreach($reportTypes as $key=>$label): ?><option value="<?= e($key) ?>" <?= $type===$key?'selected':'' ?>><?= e($label) ?></option><?php endforeach; ?></select></div>
        <div class="col-md-2"><label class="form-label">Du</label><input type="date" name="from" value="<?= e($from) ?>" class="form-control"></div>
        <div class="col-md-2"><label class="form-label">Au</label><input type="date" name="to" value="<?= e($to) ?>" class="form-control"></div>
        <div class="col-md-3"><label class="form-label">Recherche historique</label><input class="form-control table-filter" data-table="#reportTable" name="q" value="<?= e($q ?? '') ?>" placeholder="Rechercher..."></div>
        <div class="col-md-3 d-flex flex-wrap gap-2 report-action-group"><button class="btn btn-primary">Filtrer</button><button type="submit" class="btn btn-outline-primary">Voir rapport</button><a class="btn btn-outline-danger" href="<?= url('reports/pdf?type='.$type.'&from='.$from.'&to='.$to.'&q='.urlencode($q ?? '')) ?>">Exporter PDF</a><a class="btn btn-outline-success" href="<?= url('reports/excel?type='.$type.'&from='.$from.'&to='.$to.'&q='.urlencode($q ?? '')) ?>">Exporter Excel</a></div>
    </form>
</div>

<div class="section-title">Synthèse générale</div>
<div class="row g-3 mb-4">
    <div class="col-md-4"><div class="stat-card"><span>Total entrée</span><strong><?= money_mga($totals['entries']) ?></strong><em>Entrées + obligation + communion + projets</em></div></div>
    <div class="col-md-4"><div class="stat-card danger"><span>Total sortie</span><strong><?= money_mga($totals['exits']) ?></strong></div></div>
    <div class="col-md-4"><div class="stat-card success"><span>Solde / reste</span><strong><?= money_mga($totals['balance']) ?></strong></div></div>
</div>

<div class="premium-card">
    <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <h3 class="mb-0">Rapport <?= e($reportTypes[$type] ?? $type) ?></h3>
        <button type="button" class="btn btn-outline-primary btn-sm print-filtered-table no-print" data-table="#reportTable" data-title="Rapport <?= e($reportTypes[$type] ?? $type) ?>" data-subtitle="FJKM MALAZA GILEADA">Imprimer la liste</button>
    </div>
    <?php $reportTotal = 0; $chCount = 0; ?>

    <?php if ($type==='entree' || $type==='sortie'): ?>
        <table class="table data-table no-datatables align-middle print-clean-table" id="reportTable"><thead><tr><th>Date</th><th>Référence</th><th>Libellé</th><th>Catégorie</th><th>Mode</th><th>Montant</th></tr></thead><tbody>
        <?php $rows = $type==='entree' ? $entries : $exits; foreach($rows as $r): $reportTotal += (float)$r['amount']; ?><tr data-created="<?= e($r['operation_date']) ?>" data-amount="<?= e($r['amount']) ?>"><td><?= date_mg($r['operation_date']) ?></td><td><?= e($r['reference']) ?></td><td><?= e($r['label']) ?></td><td><?= e($r['category']) ?></td><td><?= e($type==='entree' ? $r['payment_method'] : $r['beneficiary']) ?></td><td><?= money_mga($r['amount']) ?></td></tr><?php endforeach; ?>
        </tbody><tfoot><tr><th colspan="5" class="text-end">Montant total</th><th class="table-total-amount"><?= money_mga($reportTotal) ?></th></tr></tfoot></table>

    <?php elseif ($type==='obligation'): ?>
        <table class="table data-table no-datatables align-middle print-clean-table" id="reportTable"><thead><tr><th>Date</th><th>Matricule</th><th>Nom</th><th>Période</th><th>Libellé</th><th>Dû</th><th>Payé</th><th>Reste</th><th>Statut</th></tr></thead><tbody>
        <?php foreach($obligations as $r): $rest=max(0,(float)$r['amount_due']-(float)$r['amount_paid']); $reportTotal += (float)$r['amount_paid']; ?><tr data-created="<?= e(substr((string)$r['created_at'],0,10)) ?>" data-amount="<?= e($r['amount_paid']) ?>"><td><?= date_mg(substr((string)$r['created_at'],0,10)) ?></td><td><?= e($r['matricule']) ?></td><td><?= e($r['full_name']) ?></td><td><?= e($r['period_name']) ?></td><td><?= e($r['label']) ?></td><td><?= money_mga($r['amount_due']) ?></td><td><?= money_mga($r['amount_paid']) ?></td><td><?= money_mga($rest) ?></td><td><?= status_badge($r['status']) ?></td></tr><?php endforeach; ?>
        </tbody><tfoot><tr><th colspan="6" class="text-end">Montant total</th><th class="table-total-amount"><?= money_mga($reportTotal) ?></th><th colspan="2"></th></tr></tfoot></table>

    <?php elseif ($type==='communion'): ?>
        <table class="table data-table no-datatables align-middle print-clean-table" id="reportTable"><thead><tr><th>Date paiement</th><th>Matricule</th><th>Chrétien</th><th>Mois payé</th><th>Année payée</th><th>Montant</th><th>Mode</th><th>Référence</th></tr></thead><tbody>
        <?php foreach($communionEntries as $r): $reportTotal += (float)$r['amount']; ?><tr data-created="<?= e($r['payment_date']) ?>" data-amount="<?= e($r['amount']) ?>"><td><?= date_mg($r['payment_date']) ?></td><td><?= e($r['matricule']) ?></td><td><?= e($r['full_name']) ?></td><td><?= e([1=>'Janvier',2=>'Février',3=>'Mars',4=>'Avril',5=>'Mai',6=>'Juin',7=>'Juillet',8=>'Août',9=>'Septembre',10=>'Octobre',11=>'Novembre',12=>'Décembre'][(int)$r['paid_month']] ?? $r['paid_month']) ?></td><td><?= e($r['paid_year']) ?></td><td><?= money_mga($r['amount']) ?></td><td><?= e($r['payment_method']) ?></td><td><?= e($r['reference']) ?></td></tr><?php endforeach; ?>
        </tbody><tfoot><tr><th colspan="5" class="text-end">Montant total</th><th class="table-total-amount"><?= money_mga($reportTotal) ?></th><th colspan="2"></th></tr></tfoot></table>

    <?php elseif ($type==='projet'): ?>
        <?php $projectBudgetTotal=0; $projectPaidTotal=0; $projectRestTotal=0; ?>
        <table class="table data-table no-datatables align-middle print-clean-table" id="reportTable"><thead><tr><th>Référence</th><th>Projet</th><th>Montant total à payer</th><th>Total payé</th><th>Reste</th><th>Début</th><th>Fin</th><th>Statut</th><th>Description</th></tr></thead><tbody>
        <?php foreach($projects as $r): $rest=max(0,(float)$r['budget']-(float)($r['collected_amount'] ?? 0)); $projectBudgetTotal += (float)$r['budget']; $projectPaidTotal += (float)($r['collected_amount'] ?? 0); $projectRestTotal += $rest; $reportTotal += (float)($r['collected_amount'] ?? 0); ?><tr data-created="<?= e($r['start_date'] ?: substr((string)$r['created_at'],0,10)) ?>" data-amount="<?= e($r['collected_amount'] ?? 0) ?>" data-budget="<?= e($r['budget']) ?>" data-paid="<?= e($r['collected_amount'] ?? 0) ?>" data-rest="<?= e($rest) ?>"><td><?= e($r['reference']) ?></td><td><?= e($r['name']) ?></td><td><?= money_mga($r['budget']) ?></td><td><?= money_mga($r['collected_amount'] ?? 0) ?></td><td><?= money_mga($rest) ?></td><td><?= date_mg($r['start_date']) ?></td><td><?= date_mg($r['end_date']) ?></td><td><?= status_badge($r['status']) ?></td><td><?= e($r['description']) ?></td></tr><?php endforeach; ?>
        </tbody><tfoot><tr><th colspan="2" class="text-end">Totaux</th><th class="table-total-budget"><?= money_mga($projectBudgetTotal) ?></th><th class="table-total-paid"><?= money_mga($projectPaidTotal) ?></th><th class="table-total-rest"><?= money_mga($projectRestTotal) ?></th><th colspan="4"></th></tr></tfoot></table>

    <?php elseif ($type==='christiane'): ?>
        <table class="table data-table no-datatables align-middle print-clean-table" id="reportTable"><thead><tr><th>Date enr.</th><th>Matricule</th><th>Nom</th><th>Groupe</th><th>Téléphone</th><th>Baptisé</th><th>Communion</th><th>Statut</th></tr></thead><tbody>
        <?php foreach($fideles as $r): $chCount++; ?><tr data-created="<?= e(substr((string)$r['created_at'],0,10)) ?>" data-amount="0"><td><?= date_mg(substr((string)$r['created_at'],0,10)) ?></td><td><?= e($r['matricule']) ?></td><td><?= e($r['full_name']) ?></td><td><?= e($r['group_name'] ?? '') ?></td><td><?= e($r['phone']) ?></td><td><?= date_mg($r['baptized_at']) ?></td><td><?= date_mg($r['communion_at']) ?></td><td><?= status_badge($r['status']) ?></td></tr><?php endforeach; ?>
        </tbody><tfoot><tr><th colspan="7" class="text-end">Nombre Chrétien</th><th><?= e($chCount) ?></th></tr></tfoot></table>

    <?php else: ?>
        <table class="table data-table no-datatables align-middle print-clean-table" id="reportTable"><thead><tr><th>Type</th><th>Date</th><th>Libellé / Nom</th><th>Catégorie / Statut</th><th>Montant</th></tr></thead><tbody>
        <?php foreach($entries as $r): $reportTotal += (float)$r['amount']; ?><tr data-created="<?= e($r['operation_date']) ?>" data-amount="<?= e($r['amount']) ?>"><td><span class="badge text-bg-success">Entrée</span></td><td><?= date_mg($r['operation_date']) ?></td><td><?= e($r['reference'].' - '.$r['label']) ?></td><td><?= e($r['category'].' / '.$r['payment_method']) ?></td><td><?= money_mga($r['amount']) ?></td></tr><?php endforeach; ?>
        <?php foreach($obligations as $r): $reportTotal += (float)$r['amount_paid']; ?><tr data-created="<?= e(substr((string)$r['created_at'],0,10)) ?>" data-amount="<?= e($r['amount_paid']) ?>"><td><span class="badge text-bg-primary">Obligation</span></td><td><?= date_mg(substr((string)$r['created_at'],0,10)) ?></td><td><?= e($r['matricule'].' - '.$r['full_name']) ?></td><td><?= e($r['period_name'].' / '.$r['status']) ?></td><td><?= money_mga($r['amount_paid']) ?></td></tr><?php endforeach; ?>
        <?php foreach($communionEntries as $r): $reportTotal += (float)$r['amount']; ?><tr data-created="<?= e($r['payment_date']) ?>" data-amount="<?= e($r['amount']) ?>"><td><span class="badge text-bg-primary">Communion</span></td><td><?= date_mg($r['payment_date']) ?></td><td><?= e($r['matricule'].' - '.$r['full_name']) ?></td><td><?= e($r['reference']) ?></td><td><?= money_mga($r['amount']) ?></td></tr><?php endforeach; ?>
        <?php foreach($projectPayments as $r): $reportTotal += (float)$r['amount']; ?><tr data-created="<?= e($r['payment_date']) ?>" data-amount="<?= e($r['amount']) ?>"><td><span class="badge text-bg-warning">Projet</span></td><td><?= date_mg($r['payment_date']) ?></td><td><?= e($r['reference'].' - '.$r['name']) ?></td><td><?= e($r['status']) ?></td><td><?= money_mga($r['amount']) ?></td></tr><?php endforeach; ?>
        <?php foreach($exits as $r): $reportTotal += (float)$r['amount']; ?><tr data-created="<?= e($r['operation_date']) ?>" data-amount="<?= e($r['amount']) ?>"><td><span class="badge text-bg-danger">Sortie</span></td><td><?= date_mg($r['operation_date']) ?></td><td><?= e($r['reference'].' - '.$r['label']) ?></td><td><?= e($r['category'].' / '.$r['beneficiary']) ?></td><td><?= money_mga($r['amount']) ?></td></tr><?php endforeach; ?>
        </tbody><tfoot><tr><th colspan="4" class="text-end">Montant total</th><th class="table-total-amount"><?= money_mga($reportTotal) ?></th></tr></tfoot></table>
    <?php endif; ?>
</div>
