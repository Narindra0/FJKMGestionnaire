<?php
/*
 | Commentaire technique
 | Ce fichier est une vue : il prépare l'affichage HTML présenté à l'utilisateur à partir des données fournies par le contrôleur.
 */
?>
<div class="container-fluid px-0">
    <!-- En-tête -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
            <h4 class="fw-bold mb-1"><i class="bi bi-journal-text me-2 text-primary"></i>Journal d'activité</h4>
            <p class="text-muted small mb-0">Historique complet des actions réalisées dans l'application</p>
        </div>
        <div class="d-flex gap-2">
            <span class="badge bg-primary rounded-pill px-3 py-2 fs-6">
                <i class="bi bi-list-check me-1"></i><?= number_format($total, 0, ',', ' ') ?> entrées
            </span>
        </div>
    </div>

    <!-- Filtres -->
    <div class="premium-card mb-4">
        <div class="card-heading">
            <div>
                <h5><i class="bi bi-funnel me-2"></i>Filtres</h5>
            </div>
            <a href="<?= url('logs') ?>" class="btn btn-sm btn-outline-secondary">
                <i class="bi bi-arrow-counterclockwise me-1"></i>Réinitialiser
            </a>
        </div>
        <form method="GET" action="<?= url('logs') ?>" class="row g-3 p-3">
            <div class="col-md-2">
                <label class="form-label small fw-semibold">Du</label>
                <input type="date" name="from" class="form-control form-control-sm" value="<?= e($filters['from']) ?>">
            </div>
            <div class="col-md-2">
                <label class="form-label small fw-semibold">Au</label>
                <input type="date" name="to" class="form-control form-control-sm" value="<?= e($filters['to']) ?>">
            </div>
            <div class="col-md-2">
                <label class="form-label small fw-semibold">Utilisateur</label>
                <select name="user_id" class="form-select form-select-sm">
                    <option value="">Tous</option>
                    <?php foreach ($users as $u): ?>
                    <option value="<?= $u['id'] ?>" <?= ((string)($filters['user_id'] ?? '') === (string)$u['id']) ? 'selected' : '' ?>>
                        <?= e($u['name']) ?>
                    </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label small fw-semibold">Action</label>
                <select name="action" class="form-select form-select-sm">
                    <option value="">Toutes</option>
                    <?php foreach ($actions as $a): ?>
                    <option value="<?= e($a) ?>" <?= ($filters['action'] ?? '') === $a ? 'selected' : '' ?>>
                        <?= e(\App\Models\AuditLog::actionLabel($a)) ?>
                    </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label small fw-semibold">Recherche</label>
                <input type="text" name="search" class="form-control form-control-sm"
                       placeholder="Mot-clé dans les données..." value="<?= e($filters['search'] ?? '') ?>">
            </div>
            <div class="col-12 d-flex justify-content-end gap-2 mt-3">
                <button type="submit" class="btn btn-primary btn-sm px-4">
                    <i class="bi bi-search me-1"></i>Filtrer
                </button>
            </div>
        </form>
    </div>

    <!-- Tableau des logs -->
    <div class="premium-card">
        <?php if (empty($logs)): ?>
        <div class="text-center py-5">
            <i class="bi bi-journal-text" style="font-size:3rem;color:#dee2e6;"></i>
            <p class="text-muted mt-3 mb-0">Aucune activité trouvée pour ces filtres.</p>
        </div>
        <?php else: ?>
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th class="text-muted small fw-semibold" width="60">ID</th>
                        <th class="text-muted small fw-semibold">Action</th>
                        <th class="text-muted small fw-semibold">Utilisateur</th>
                        <th class="text-muted small fw-semibold">Entité</th>
                        <th class="text-muted small fw-semibold">IP</th>
                        <th class="text-muted small fw-semibold">Date</th>
                        <th class="text-muted small fw-semibold text-end">Détail</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($logs as $log): ?>
                    <?php $payload = json_decode($log['payload'] ?? '{}', true) ?: []; ?>
                    <tr>
                        <td class="text-muted small">#<?= $log['id'] ?></td>
                        <td>
                            <span class="badge" style="background:rgba(13,110,253,0.08);color:#1a5bbf;font-weight:500;">
                                <i class="<?= \App\Models\AuditLog::actionIcon($log['action']) ?> me-1"></i>
                                <?= e(\App\Models\AuditLog::actionLabel($log['action'])) ?>
                            </span>
                        </td>
                        <td>
                            <div class="d-flex align-items-center gap-2">
                                <i class="bi bi-person-circle text-secondary"></i>
                                <span><?= e($log['user_name'] ?? 'Système') ?></span>
                            </div>
                        </td>
                        <td>
                            <span class="badge bg-light text-dark border">
                                <?= e($log['entity']) ?>
                                <?php if ($log['entity_id']): ?>#<?= $log['entity_id'] ?><?php endif; ?>
                            </span>
                        </td>
                        <td class="small text-muted font-monospace"><?= e($log['ip_address'] ?? '-') ?></td>
                        <td class="small text-nowrap">
                            <i class="bi bi-clock me-1 text-muted"></i>
                            <?= date('d/m/Y H:i', strtotime($log['created_at'])) ?>
                        </td>
                        <td class="text-end">
                            <button type="button" class="btn btn-sm btn-outline-info"
                                    data-bs-toggle="modal" data-bs-target="#detailModal<?= $log['id'] ?>"
                                    title="Voir le détail">
                                <i class="bi bi-eye"></i>
                            </button>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <?php if ($totalPages > 1): ?>
        <div class="d-flex justify-content-between align-items-center p-3 border-top">
            <small class="text-muted">
                Page <?= $page ?> sur <?= $totalPages ?>
                (<?= number_format($total, 0, ',', ' ') ?> entrées)
            </small>
            <nav>
                <ul class="pagination pagination-sm mb-0">
                    <?php if ($page > 1): ?>
                    <li class="page-item">
                        <a class="page-link" href="<?= url('logs?' . http_build_query(array_merge($filters, ['page' => $page - 1]))) ?>">
                            <i class="bi bi-chevron-left"></i>
                        </a>
                    </li>
                    <?php endif; ?>

                    <?php
                    $start = max(1, $page - 2);
                    $end = min($totalPages, $page + 2);
                    for ($i = $start; $i <= $end; $i++):
                    ?>
                    <li class="page-item <?= $i === $page ? 'active' : '' ?>">
                        <a class="page-link" href="<?= url('logs?' . http_build_query(array_merge($filters, ['page' => $i]))) ?>"><?= $i ?></a>
                    </li>
                    <?php endfor; ?>

                    <?php if ($page < $totalPages): ?>
                    <li class="page-item">
                        <a class="page-link" href="<?= url('logs?' . http_build_query(array_merge($filters, ['page' => $page + 1]))) ?>">
                            <i class="bi bi-chevron-right"></i>
                        </a>
                    </li>
                    <?php endif; ?>
                </ul>
            </nav>
        </div>
        <?php endif; ?>
        <?php endif; ?>
    </div>
</div>

<!-- Modales de détail pour chaque log -->
<?php foreach ($logs as $log): ?>
<?php $payload = json_decode($log['payload'] ?? '{}', true) ?: []; ?>
<div class="modal fade" id="detailModal<?= $log['id'] ?>" tabindex="-1"
     aria-labelledby="detailModalLabel<?= $log['id'] ?>" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
            <div class="modal-header border-0">
                <h5 class="modal-title fw-bold" id="detailModalLabel<?= $log['id'] ?>">
                    <i class="<?= \App\Models\AuditLog::actionIcon($log['action']) ?> me-2"></i>
                    <?= e(\App\Models\AuditLog::actionLabel($log['action'])) ?>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
            </div>
            <div class="modal-body pt-0">
                <div class="row g-3 mb-3">
                    <div class="col-md-6">
                        <div class="bg-light rounded p-3 h-100">
                            <small class="text-muted fw-semibold d-block mb-1"><i class="bi bi-person me-1"></i>Utilisateur</small>
                            <span class="fw-medium"><?= e($log['user_name'] ?? 'Système') ?></span>
                            <?php if (!empty($log['user_email'])): ?>
                            <br><small class="text-muted"><?= e($log['user_email']) ?></small>
                            <?php endif; ?>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="bg-light rounded p-3 h-100">
                            <small class="text-muted fw-semibold d-block mb-1"><i class="bi bi-clock me-1"></i>Date & heure</small>
                            <span class="fw-medium"><?= date('d/m/Y à H:i:s', strtotime($log['created_at'])) ?></span>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="bg-light rounded p-3">
                            <small class="text-muted fw-semibold d-block mb-1"><i class="bi bi-database me-1"></i>Entité</small>
                            <span class="fw-medium"><?= e($log['entity']) ?></span>
                            <?php if ($log['entity_id']): ?>
                            <span class="badge bg-secondary ms-1">#<?= $log['entity_id'] ?></span>
                            <?php endif; ?>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="bg-light rounded p-3">
                            <small class="text-muted fw-semibold d-block mb-1"><i class="bi bi-globe me-1"></i>Adresse IP</small>
                            <span class="fw-medium font-monospace"><?= e($log['ip_address'] ?? 'Non enregistrée') ?></span>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="bg-light rounded p-3">
                            <small class="text-muted fw-semibold d-block mb-1"><i class="bi bi-browser-chrome me-1"></i>Navigateur</small>
                            <span class="small"><?= e(mb_strimwidth($log['user_agent'] ?? 'Inconnu', 0, 80, '...')) ?></span>
                        </div>
                    </div>
                </div>

                <?php if (!empty($payload)): ?>
                <div class="mt-3">
                    <h6 class="fw-bold mb-2"><i class="bi bi-json me-1"></i>Données transmises</h6>
                    <div class="bg-dark text-light rounded p-3" style="max-height:300px;overflow-y:auto;">
                        <pre class="mb-0 small" style="white-space:pre-wrap;word-break:break-word;"><?= e(json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) ?></pre>
                    </div>
                </div>
                <?php endif; ?>
            </div>
            <div class="modal-footer border-0">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="bi bi-x-circle me-1"></i>Fermer
                </button>
            </div>
        </div>
    </div>
</div>
<?php endforeach; ?>
