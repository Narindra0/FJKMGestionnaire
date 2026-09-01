<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<?php use App\Core\Auth; $user = Auth::user(); $role = Auth::role(); ?>
<aside class="sidebar" id="mainSidebar">
    <div class="sidebar-header">
        <div class="brand">
            <img src="<?= asset('img/logo.svg') ?>" alt="Logo FJKM Malaza Gileada">
            <div class="brand-text">
                <strong>FJKM</strong>
                <small>Malaza Gileada</small>
            </div>
        </div>
        <button class="sidebar-toggle" id="sidebarToggle" type="button" aria-label="Réduire / agrandir le menu" title="Réduire le menu">
            <i class="bi bi-chevron-left"></i>
        </button>
        <button class="mobile-menu-toggle" id="mobileMenuToggle" type="button" aria-label="Ouvrir le menu" title="Menu">
            <i class="bi bi-list"></i>
        </button>
    </div>

    <nav class="sidebar-nav">
        <div class="nav-section">
            <span class="nav-section-title">Général</span>
            <a href="<?= url('dashboard') ?>" class="nav-link"><i class="bi bi-speedometer2"></i> <span class="nav-text">Tableau de bord</span></a>
        </div>

        <?php if (Auth::can('ADMIN','USER')): ?>
        <div class="nav-section">
            <span class="nav-section-title">Finances</span>
            <a href="<?= url('entrees') ?>" class="nav-link"><i class="bi bi-arrow-down-circle"></i> <span class="nav-text">Entrées <small>(vola miditra)</small></span></a>
            <a href="<?= url('sorties') ?>" class="nav-link"><i class="bi bi-arrow-up-circle"></i> <span class="nav-text">Sorties <small>(vola mivoaka)</small></span></a>
            <a href="<?= url('obligations') ?>" class="nav-link"><i class="bi bi-file-text"></i> <span class="nav-text">Obligations <small>(adidy)</small></span></a>
            <a href="<?= url('communion') ?>" class="nav-link"><i class="bi bi-people"></i> <span class="nav-text">Communion <small>(mpandray)</small></span></a>
        </div>

        <div class="nav-section">
            <span class="nav-section-title">Projets</span>
            <a href="<?= url('projects') ?>" class="nav-link"><i class="bi bi-building"></i> <span class="nav-text">Projets <small>(tetik'asa)</small></span></a>
        </div>
        <?php endif; ?>

        <div class="nav-section">
            <span class="nav-section-title">Membres</span>
            <a href="<?= url('fideles') ?>" class="nav-link"><i class="bi bi-person-badge"></i> <span class="nav-text">Chrétien <small>(mpiangona)</small></span></a>
        </div>

        <div class="nav-section">
            <span class="nav-section-title">Analyses</span>
            <a href="<?= url('reports') ?>" class="nav-link"><i class="bi bi-graph-up"></i> <span class="nav-text">Rapports</span></a>
        </div>

        <?php if (Auth::can('ADMIN')): ?>
        <div class="nav-section">
            <span class="nav-section-title">Administration</span>
            <a href="<?= url('imports') ?>" class="nav-link"><i class="bi bi-upload"></i> <span class="nav-text">Importer Excel</span></a>
            <a href="<?= url('logs') ?>" class="nav-link"><i class="bi bi-journal-text"></i> <span class="nav-text">Journal d'activité</span></a>
            <a href="<?= url('users') ?>" class="nav-link"><i class="bi bi-people-fill"></i> <span class="nav-text">Utilisateurs</span></a>
        </div>
        <?php endif; ?>
    </nav>

    <div class="sidebar-footer">
        <div class="sidebar-user">
            <div class="user-avatar">
                <i class="bi bi-person-circle"></i>
            </div>
            <div class="user-info">
                <span class="user-name"><?= e($user['name'] ?? 'Utilisateur') ?></span>
                <span class="user-role"><?= e($user['role_name'] ?? '') ?></span>
            </div>
            <button type="button" class="user-logout" title="Déconnexion" data-bs-toggle="modal" data-bs-target="#logoutModal">
                <i class="bi bi-box-arrow-right"></i>
            </button>
        </div>
    </div>
</aside>

<!-- Overlay mobile -->
<div class="sidebar-overlay" id="sidebarOverlay"></div>

<!-- Modal de confirmation de déconnexion -->
<div class="modal fade" id="logoutModal" tabindex="-1" aria-labelledby="logoutModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title fw-bold" id="logoutModalLabel">
                    <i class="bi bi-box-arrow-right text-danger me-2"></i>Déconnexion
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
            </div>
            <div class="modal-body text-center py-4">
                <div class="mb-3">
                    <i class="bi bi-question-circle text-warning" style="font-size:3rem;"></i>
                </div>
                <p class="mb-1 fw-semibold fs-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>
                <p class="text-muted small mb-0">Vous devrez vous reconnecter pour accéder à l'application.</p>
            </div>
            <div class="modal-footer border-0 pt-0 justify-content-center gap-2">
                <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">
                    <i class="bi bi-x-circle me-1"></i>Annuler
                </button>
                <form method="post" action="<?= url('logout') ?>" class="d-inline">
                    <?= csrf_field() ?>
                    <button type="submit" class="btn btn-danger px-4">
                        <i class="bi bi-box-arrow-right me-1"></i>Se déconnecter
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
