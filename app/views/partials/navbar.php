<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<header class="topbar">
    <div>
        <h1><?= e($title ?? 'Tableau de bord') ?></h1>
        <p><i class="bi bi-building"></i> <?= e(config_app('name')) ?></p>
    </div>
    <div class="topbar-actions">
        <button class="btn btn-sm btn-outline-primary" id="darkModeToggle" type="button" title="Basculer le mode sombre"><i class="bi bi-moon-stars"></i> <span class="d-none d-md-inline">Mode sombre</span></button>
    </div>
</header>
