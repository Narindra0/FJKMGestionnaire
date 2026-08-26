<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<div class="member-card-print">
    <div class="member-card member-card-full">
        <div class="member-card-header">
            <img src="<?= asset('img/logo.svg') ?>">
            <div><strong>FJKM MALAZA GILEADA</strong><span>Carte membre Chrétien</span></div>
        </div>
        <div class="member-card-body">
            <img class="member-photo" src="<?= $fidel['photo'] ? url('public/'.$fidel['photo']) : asset('img/avatar.svg') ?>">
            <div class="member-info-table">
                <h2><?= e($fidel['full_name']) ?></h2>
                <table>
                    <tr><th>Matricule</th><td><?= e($fidel['matricule']) ?></td></tr>
                    <tr><th>Nom complet</th><td><?= e($fidel['full_name']) ?></td></tr>
                    <tr><th>Genre</th><td><?= e(($fidel['gender'] ?? '') === 'M' ? 'Masculin' : (($fidel['gender'] ?? '') === 'F' ? 'Féminin' : '-')) ?></td></tr>
                    <tr><th>Groupe</th><td><?= e($fidel['group_name'] ?? '-') ?></td></tr>
                    <tr><th>Téléphone</th><td><?= e($fidel['phone']) ?></td></tr>
                    <tr><th>Date naissance</th><td><?= date_mg($fidel['birth_date']) ?></td></tr>
                    <tr><th>Date baptême</th><td><?= date_mg($fidel['baptized_at']) ?></td></tr>
                    <tr><th>Date communion</th><td><?= date_mg($fidel['communion_at']) ?></td></tr>
                    <tr><th>Statut</th><td><?= e(($fidel['status'] ?? '') === 'active' ? 'Actif' : 'Inactif') ?></td></tr>
                    <tr><th>Adresse</th><td><?= e($fidel['address']) ?></td></tr>
                </table>
            </div>
            <img class="member-qr" src="<?= e($qr) ?>">
        </div>
    </div>
</div>
<div class="card-print-controls no-print">
    <a class="btn btn-outline-secondary" href="<?= url('fideles/'.$fidel['id']) ?>">Retour à la fiche Chrétien</a>
    <button type="button" class="btn btn-primary" id="printMemberCard">Imprimer la carte</button>
</div>
<script>
(function () {
    var printCard = function () { window.print(); };
    document.getElementById('printMemberCard')?.addEventListener('click', printCard);
})();
</script>
