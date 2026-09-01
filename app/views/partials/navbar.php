<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<header class="topbar">
    <div class="topbar-left">
        <button class="mobile-menu-toggle" id="mobileMenuToggle" type="button" aria-label="Ouvrir le menu" title="Menu">
            <i class="bi bi-list"></i>
        </button>
        <div>
            <h1><?= e($title ?? 'Tableau de bord') ?></h1>
            <p><i class="bi bi-building"></i> <?= e(config_app('short_name') ?? config_app('name')) ?></p>
        </div>
    </div>
    <div class="topbar-actions">
        <button class="topbar-icon-btn" id="darkModeToggle" type="button" title="Basculer le mode sombre" aria-label="Basculer le mode sombre">
            <i class="bi bi-moon-stars"></i>
        </button>
        <div class="topbar-user">
            <div class="topbar-user-avatar">
                <i class="bi bi-person-circle"></i>
            </div>
            <div class="topbar-user-info d-none d-md-block">
                <span class="topbar-user-name"><?= e($user['name'] ?? 'Utilisateur') ?></span>
                <span class="topbar-user-role"><?= e($user['role_name'] ?? '') ?></span>
            </div>
        </div>
    </div>
</header>
