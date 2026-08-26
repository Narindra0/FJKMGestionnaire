<?php
/*
 | Commentaire technique
 | Ce fichier contient un contrôleur MVC : il reçoit les requêtes, appelle les services ou modèles nécessaires, puis renvoie la vue ou la réponse adaptée.
 */
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Session;
use App\Models\AuditLog;
use App\Models\User;

/* Journal d'activité : ADMIN uniquement. */
final class LogController extends Controller
{
    public function index(): void
    {
        $filters = [
            'from' => $_GET['from'] ?? '',
            'to' => $_GET['to'] ?? '',
            'user_id' => $_GET['user_id'] ?? '',
            'action' => $_GET['action'] ?? '',
            'entity' => $_GET['entity'] ?? '',
            'search' => $_GET['search'] ?? '',
        ];
        $page = max(1, (int)($_GET['page'] ?? 1));

        $model = new AuditLog();
        $result = $model->getFiltered($filters, $page, 30);

        $this->view('logs/index', [
            'title' => 'Journal d\'activité',
            'logs' => $result['items'],
            'total' => $result['total'],
            'page' => $result['page'],
            'perPage' => $result['perPage'],
            'totalPages' => $result['totalPages'],
            'filters' => $filters,
            'actions' => $model->distinctActions(),
            'entities' => $model->distinctEntities(),
            'users' => (new User())->all('name ASC'),
        ]);
    }
}
