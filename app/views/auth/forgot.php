<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<div class="container min-vh-100 d-flex align-items-center justify-content-center">
    <div class="card shadow-lg border-0 p-5 forgot-card">
        <img src="<?= asset('img/logo.svg') ?>" alt="Logo FJKM" style="width:72px" class="mb-3">
        <h1 class="h3 fw-bold text-primary">Mot de passe oublié</h1>
        <div class="alert alert-info">Veuillez contacter l’ADMIN FJKM Malaza Gileada pour réactiver le login ou changer le mot de passe.</div>
        <a class="btn btn-primary" href="<?= url('login') ?>">Retour à la connexion</a>
    </div>
</div>
