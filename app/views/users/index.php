<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<div class="premium-card mb-4" id="userFormCard">
    <div class="card-heading">
        <div>
            <h3 id="userFormTitle">Ajouter nouveau utilisateur</h3>
        </div>
    </div>
    <form id="userForm" method="post" action="<?= url('users') ?>" data-create-action="<?= url('users') ?>" class="row g-3 align-items-end needs-validation" novalidate>
        <?= csrf_field() ?>
        <div class="col-lg-2 col-md-4"><label class="form-label">Matricule / USER</label><input name="matricule" class="form-control" placeholder="USER-001"></div>
        <div class="col-lg-3 col-md-4"><label class="form-label">Nom</label><input name="name" class="form-control" required><div class="invalid-feedback">Champ obligatoire.</div></div>
        <div class="col-lg-3 col-md-4"><label class="form-label">Email</label><input name="email" type="email" class="form-control" required><div class="invalid-feedback">Email obligatoire.</div></div>
        <div class="col-lg-2 col-md-4"><label class="form-label">Rôle</label><select name="role_id" class="form-select" required><?php foreach($roles as $r): ?><option value="<?= e($r['id']) ?>"><?= e($r['name']) ?></option><?php endforeach; ?></select></div>
        <div class="col-lg-2 col-md-4"><label class="form-label">Statut</label><select name="status" class="form-select"><option value="active">Actif</option><option value="inactive">Inactif</option></select></div>
        <div class="col-lg-4 col-md-6"><label class="form-label">Mot de passe</label><div class="password-wrap compact-password"><input type="password" id="password-user-main" name="password" class="form-control pe-5" minlength="8" placeholder="Obligatoire à la création, optionnel à la modification"><button type="button" class="password-toggle icon-only small-toggle" data-target="#password-user-main" aria-label="Afficher ou masquer le mot de passe" title="Afficher / masquer"><span class="eye-icon" aria-hidden="true"></span></button></div><div class="invalid-feedback">Minimum 8 caractères.</div></div>
        <div class="col-lg-3 col-md-4 d-flex gap-2"><button id="userSubmit" data-default-text="Ajouter" class="btn btn-primary flex-fill">Ajouter</button><button type="button" class="btn btn-light d-none" data-reset-form="#userForm" data-title="#userFormTitle" data-title-text="Ajouter nouveau utilisateur">Annuler</button></div>
    </form>
</div>

<div class="premium-card">
    <h3>Utilisateurs</h3>
    <table class="table data-table no-datatables align-middle"><thead><tr><th>Matricule</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Dernière connexion</th><th>Actions</th></tr></thead><tbody>
    <?php foreach($users as $u): $values=['matricule'=>$u['matricule'] ?? '', 'name'=>$u['name'], 'email'=>$u['email'], 'role_id'=>$u['role_id'], 'status'=>$u['status'], 'password'=>'']; ?>
        <tr>
            <td><?= e($u['matricule'] ?? '') ?></td>
            <td><?= e($u['name']) ?></td>
            <td><?= e($u['email']) ?></td>
            <td><?= e($u['role_name']) ?></td>
            <td><?= status_badge($u['status']) ?></td>
            <td><?= e($u['last_login_at']) ?></td>
            <td><div class="action-buttons">
                <button type="button" class="btn btn-sm btn-outline-primary edit-to-form" data-form="#userForm" data-title="#userFormTitle" data-title-text="Modification utilisateur" data-submit="#userSubmit" data-submit-text="Modifier" data-scroll="#userFormCard" data-action="<?= url('users/'.$u['id'].'/profile') ?>" data-values='<?= e(json_encode($values, JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_UNICODE)) ?>'>Modifier</button>
                <?php if($u['status'] === 'active'): ?><form method="post" action="<?= url('users/'.$u['id'].'/status') ?>" class="d-inline"><?= csrf_field() ?><input type="hidden" name="status" value="inactive"><button class="btn btn-sm btn-outline-warning">Désactiver</button></form><?php else: ?><form method="post" action="<?= url('users/'.$u['id'].'/status') ?>" class="d-inline"><?= csrf_field() ?><input type="hidden" name="status" value="active"><button class="btn btn-sm btn-outline-success">Activer</button></form><?php endif; ?>
                <form method="post" action="<?= url('users/'.$u['id'].'/delete') ?>" class="d-inline" onsubmit="return confirm('Supprimer ce login ?')"><?= csrf_field() ?><button class="btn btn-sm btn-outline-danger">Supprimer</button></form>
            </div></td>
        </tr>
    <?php endforeach; ?>
    </tbody></table>
</div>
