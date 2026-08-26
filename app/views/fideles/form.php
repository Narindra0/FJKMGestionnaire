<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<div class="premium-card">
    <h3>Fiche Chrétien</h3>
    <form method="post" action="<?= url('fideles') ?>" enctype="multipart/form-data" class="row g-3 align-items-end needs-validation" novalidate>
        <?= csrf_field() ?>
        <div class="col-md-4"><label class="form-label">Matricule</label><input name="matricule" class="form-control readonly-ref" value="<?= e($fidel['matricule'] ?? '') ?>" readonly required><div class="invalid-feedback">Champ obligatoire.</div></div>
        <div class="col-md-8"><label class="form-label">Nom complet</label><input name="full_name" class="form-control" required><div class="invalid-feedback">Veuillez remplir ce champ.</div></div>
        <div class="col-md-4"><label class="form-label">Genre</label><select name="gender" class="form-select"><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
        <div class="col-md-4"><label class="form-label">Date naissance</label><input type="date" name="birth_date" class="form-control"></div>
        <div class="col-md-4"><label class="form-label">Téléphone</label><input name="phone" class="form-control"></div>
        <div class="col-md-4"><label class="form-label">Groupe</label><input name="group_name" class="form-control"></div>
        <div class="col-md-6"><label class="form-label">Date baptême</label><input type="date" name="baptized_at" class="form-control"></div>
        <div class="col-md-6"><label class="form-label">Date communion</label><input type="date" name="communion_at" class="form-control"></div>
        <div class="col-md-6"><label class="form-label">Adresse</label><input name="address" class="form-control"></div>
        <div class="col-md-3"><label class="form-label">Statut</label><select name="status" class="form-select"><option value="active">Actif</option><option value="inactive">Inactif</option></select></div>
        <div class="col-md-3"><label class="form-label">Photo</label><input type="file" name="photo" class="form-control" accept="image/*"></div>
        <div><button class="btn btn-primary">Enregistrer</button><a href="<?= url('fideles') ?>" class="btn btn-light">Annuler</a></div>
    </form>
</div>
