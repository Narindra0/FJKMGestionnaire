<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<div class="premium-card mb-4">
    <div class="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center mb-3">
        <div>
            <h3 class="mb-1">Importer Excel</h3>
            <p class="text-muted mb-0">Utiliser un fichier .xlsx ou .csv avec les en-têtes sur la première ligne.</p>
        </div>
        <div class="d-flex flex-column flex-sm-row gap-2">
            <a class="btn btn-outline-primary" href="<?= url('imports/template') ?>">Modèle Fidèles XLSX</a>
            <a class="btn btn-outline-secondary" href="<?= url('imports/template-csv') ?>">Modèle Fidèles CSV</a>
        </div>
    </div>
    <form method="post" action="<?= url('imports') ?>" enctype="multipart/form-data" class="row g-3 needs-validation" novalidate>
        <?= csrf_field() ?>
        <div class="col-lg-4 col-md-6">
            <label class="form-label">Table destination</label>
            <select name="table_name" class="form-select" required>
                <option value="">Choisir...</option>
                <?php foreach($tables as $key=>$label): ?>
                    <option value="<?= e($key) ?>"><?= e($label) ?> — <?= e($key) ?></option>
                <?php endforeach; ?>
            </select>
            <div class="invalid-feedback">Champ obligatoire.</div>
        </div>
        <div class="col-lg-5 col-md-6">
            <label class="form-label">Fichier Excel</label>
            <input type="file" name="excel" class="form-control" accept=".xlsx,.xls,.csv" required>
            <div class="form-text">Le format .xlsx est recommandé. Le format .xls ancien nécessite PhpSpreadsheet.</div>
            <div class="invalid-feedback">Veuillez choisir un fichier.</div>
        </div>
        <div class="col-lg-3 d-flex align-items-end">
            <button class="btn btn-primary w-100">Importer Excel</button>
        </div>
    </form>
</div>

<div class="premium-card">
    <h3>Condition importante</h3>
    <p>La première ligne doit contenir les noms de colonnes. L’import accepte les vrais champs SQL, mais aussi certains libellés simples comme <strong>Nom complet</strong>, <strong>Téléphone</strong>, <strong>Adresse</strong>, <strong>Groupe</strong>, <strong>Date baptême</strong>.</p>
    <div class="table-responsive">
        <table class="table table-sm align-middle mb-0">
            <thead>
                <tr>
                    <th>Import Fidèles conseillé</th>
                    <th>Exemple de valeur</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>matricule</td><td>FJKM-2026-00003</td></tr>
                <tr><td>full_name</td><td>Andry Rakoto</td></tr>
                <tr><td>gender</td><td>M ou F</td></tr>
                <tr><td>birth_date</td><td>1998-04-12</td></tr>
                <tr><td>phone</td><td>034 00 000 03</td></tr>
                <tr><td>group_name</td><td>Groupe A</td></tr>
                <tr><td>address</td><td>Antananarivo</td></tr>
                <tr><td>baptized_at</td><td>2016-06-12</td></tr>
                <tr><td>communion_at</td><td>2018-04-20</td></tr>
                <tr><td>status</td><td>active</td></tr>
            </tbody>
        </table>
    </div>
</div>
