<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="<?= e(csrf_token()) ?>">
    <title><?= e($title ?? config_app('name')) ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <!-- CSS principal versionné : force le navigateur/PWA à charger la mise en forme responsive finale. -->
    <link rel="stylesheet" href="<?= asset('css/app.css') ?>">
</head>
<body class="auth-page">
    <?= $content ?>
    <script>window.FJKM_BASE_URL = '<?= url('') ?>';</script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- JavaScript principal versionné : applique les libellés responsive et les contrôles d'interface. -->
    <script src="<?= asset('js/app.js') ?>"></script>
</body>
</html>
