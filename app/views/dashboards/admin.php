<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<?php require BASE_PATH . '/app/views/dashboards/_cards.php'; ?>
<div class="row g-4 mt-1">
    <div class="col-lg-8"><div class="premium-card"><h3><i class="bi bi-graph-up"></i> Évolution mensuelle générale</h3><canvas id="lineChart" height="110"></canvas></div></div>
    <div class="col-lg-4"><div class="premium-card"><h3><i class="bi bi-pie-chart"></i> Répartition générale</h3><canvas id="pieChart" height="220"></canvas></div></div>
    <div class="col-lg-7"><div class="premium-card"><h3><i class="bi bi-bar-chart"></i> Entrées vs Sorties</h3><canvas id="barChart" height="130"></canvas></div></div>
    <div class="col-lg-5"><div class="premium-card"><h3><i class="bi bi-activity"></i> Activités récentes</h3><?php require BASE_PATH . '/app/views/dashboards/_activities.php'; ?></div></div>
</div>
