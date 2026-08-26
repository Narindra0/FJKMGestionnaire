<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<ul class="activity-list">
<?php if (empty($activities)): ?>
    <li class="text-center text-muted py-3"><i class="bi bi-inbox"></i> Aucune activité récente</li>
<?php else: ?>
<?php foreach ($activities as $a): ?>
    <li>
        <strong><?= e($a['action']) ?></strong>
        <span>
            <i class="bi bi-person-circle"></i> <?= e($a['user_name'] ?? 'Système') ?>
            <i class="bi bi-dot"></i>
            <i class="bi bi-clock"></i> <?= e($a['created_at']) ?>
        </span>
    </li>
<?php endforeach; ?>
<?php endif; ?>
</ul>
