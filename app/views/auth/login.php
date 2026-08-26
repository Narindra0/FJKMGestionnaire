<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<main class="login-page-container">
    <div class="login-card row g-0 overflow-hidden">
        <section class="col-lg-6 login-hero" aria-label="Présentation de l'application">
            <img src="<?= asset('img/logo.svg') ?>" alt="Logo FJKM" class="login-logo">
            <h1>GESTION D'OBLIGATION AU SEIN D'EGLISE FJKM MALAZA GILEADA</h1>
        </section>
        <section class="col-lg-6 bg-white login-form-panel" aria-label="Connexion">
            <div class="login-form-content">
                <h2 class="fw-bold text-primary mb-1">Connexion</h2>
                <p class="login-intro">Accédez à votre espace de gestion.</p>
                <?php require BASE_PATH . '/app/views/partials/flash.php'; ?>
                <form method="post" action="<?= url('login') ?>" class="needs-validation" novalidate>
                    <?= csrf_field() ?>
                    <div class="mb-3">
                        <label class="form-label" for="loginIdentifier">USER</label>
                        <input type="text" name="identifier" id="loginIdentifier" class="form-control form-control-lg" placeholder="Matricule, anarana na mail" required autofocus>
                        <div class="invalid-feedback">Veuillez remplir ce champ.</div>
                    </div>
                    <div class="mb-2">
                        <label class="form-label" for="loginPassword">Mot de passe</label>
                        <div class="password-wrap login-password-wrap">
                            <input type="password" name="password" id="loginPassword" class="form-control form-control-lg" required>
                            <button type="button" class="password-toggle icon-only" data-target="#loginPassword" aria-label="Afficher le mot de passe" title="Afficher / masquer le mot de passe">
                                <span class="eye-icon" aria-hidden="true"></span>
                            </button>
                            <div class="invalid-feedback login-password-feedback">Champ obligatoire.</div>
                        </div>
                    </div>
                    <div class="login-options mb-4">
                        <label class="remember-option" for="rememberLogin"><input type="checkbox" name="remember" id="rememberLogin" class="form-check-input"> <span><i class="bi bi-lock"></i> Se souvenir</span></label>
                        <a href="<?= url('forgot-password') ?>" class="forgot-password-link"><i class="bi bi-question-circle"></i> Mot de passe oublié&nbsp;?</a>
                    </div>
                    <button class="btn btn-primary btn-lg w-100 login-submit"><i class="bi bi-box-arrow-in-right"></i> Se connecter</button>
                </form>
            </div>
        </section>
    </div>
</main>
