<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<?php if ($msg = \App\Core\Session::flash('success')): ?>
    <div class="alert alert-success shadow-sm flash-message"><i class="bi bi-check-circle-fill me-2"></i><?= e($msg) ?></div>
<?php endif; ?>
<?php if ($msg = \App\Core\Session::flash('error')): ?>
    <div class="alert alert-danger shadow-sm flash-message"><i class="bi bi-exclamation-triangle-fill me-2"></i><?= e($msg) ?></div>
<?php endif; ?>
