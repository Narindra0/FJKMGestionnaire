<?php
/* 
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<?php $user = \App\Core\Auth::user(); ?>
<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="<?= e(csrf_token()) ?>">
    <title><?= e($title ?? config_app('name')) ?></title>
    <link rel="manifest" href="<?= url('manifest.json') ?>">
    <meta name="theme-color" content="#0d47a1">

    <!-- Preconnect : anticiper les connexions CDN -->
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <!-- CSS critique : charge immédiatement -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <link rel="stylesheet" href="<?= asset('css/app.css') ?>">
    <link rel="stylesheet" href="<?= asset('css/layout.css') ?>">
    <link rel="stylesheet" href="<?= asset('css/components.css') ?>">
    <link rel="stylesheet" href="<?= asset('css/dark.css') ?>">
    <link rel="stylesheet" href="<?= asset('css/utilities.css') ?>">

    <!-- CSS non critique : charge après le rendu -->
    <link rel="preload" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <link rel="preload" href="https://cdn.datatables.net/2.0.8/css/dataTables.bootstrap5.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
        <link rel="stylesheet" href="https://cdn.datatables.net/2.0.8/css/dataTables.bootstrap5.css">
    </noscript>
</head>
<body>
<div class="app-shell" id="appShell">
    <?php require BASE_PATH . '/app/views/partials/sidebar.php'; ?>
    <main class="main-content" id="mainContent">
        <?php require BASE_PATH . '/app/views/partials/navbar.php'; ?>
        <section class="page-content">
            <?php require BASE_PATH . '/app/views/partials/flash.php'; ?>
            <?= $content ?>
        </section>
    </main>
</div>

<!-- Variables globales JS -->
<script>window.FJKM_BASE_URL = '<?= url('') ?>'; window.FJKM_DEBUG = <?= config_app('debug') ? 'true' : 'false' ?>;</script>

<!-- jQuery : blocking car requis par Bootstrap/Datatables -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js" crossorigin="anonymous"></script>

<!-- Bootstrap : defer -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer crossorigin="anonymous"></script>

<!-- Chart.js : defer (utilisé uniquement sur dashboard) -->
<script src="https://cdn.jsdelivr.net/npm/chart.js" defer crossorigin="anonymous"></script>

<!-- DataTables : defer -->
<script src="https://cdn.datatables.net/2.0.8/js/dataTables.js" defer crossorigin="anonymous"></script>
<script src="https://cdn.datatables.net/2.0.8/js/dataTables.bootstrap5.js" defer crossorigin="anonymous"></script>

<!-- SweetAlert2 : defer -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" defer crossorigin="anonymous"></script>

<!-- JavaScript principal -->
<script src="<?= asset('js/app.js') ?>" defer></script>

<!-- Service Worker (PWA) : chargé après le rendu complet -->
<script>if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('<?= url('service-worker.js') ?>').catch(function(){});});}</script>

<?php if (!empty($series)): ?>
<script>window.FJKM_SERIES = <?= json_encode($series, JSON_UNESCAPED_UNICODE) ?>; window.FJKM_DASHBOARD_TYPE = '<?= e($dashboardType ?? 'general') ?>';</script>
<script src="<?= asset('js/dashboard.js') ?>" defer></script>
<?php endif; ?>
</body>
</html>
