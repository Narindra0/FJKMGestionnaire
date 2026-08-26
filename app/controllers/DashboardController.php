<?php
/*
 | Commentaire technique
 | Ce fichier contient un contrôleur MVC : il reçoit les requêtes, appelle les services ou modèles nécessaires, puis renvoie la vue ou la réponse adaptée.
 */
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Core\Database;
use App\Services\FinanceService;

/* Dashboard commun pour ADMIN, USER et VISITEUR. */
final class DashboardController extends Controller
{
    public function index(): void
    {
        $finance = new FinanceService();
        $from = $_GET['from'] ?? date('Y-m-01');
        $to = $_GET['to'] ?? date('Y-m-t');
        $type = $_GET['type'] ?? 'general';
        $q = $_GET['q'] ?? '';
        $year = (int)date('Y', strtotime($from ?: date('Y-m-d')));
        $db = Database::connection();
        $data = [
            'title' => 'Tableau de bord',
            'totals' => $finance->displayTotals($type, $from, $to, $q),
            'communionTotals' => $finance->communionTotals(),
            'monthTotals' => $finance->totals(date('Y-m-01'), date('Y-m-t')),
            'dashboardFrom' => $from,
            'dashboardTo' => $to,
            'dashboardType' => $type,
            'dashboardQ' => $q,
            'series' => $finance->monthlySeries($year),
            'fidelesCount' => (int)$db->query('SELECT COUNT(*) FROM fideles')->fetchColumn(),
            'projectsCount' => (int)$db->query('SELECT COUNT(*) FROM projects')->fetchColumn(),
            'paidCount' => (int)$db->query("SELECT COUNT(*) FROM obligations WHERE status='paid'")->fetchColumn(),
            'unpaidCount' => (int)$db->query("SELECT COUNT(*) FROM obligations WHERE status IN('unpaid','partial')")->fetchColumn(),
            'activities' => $finance->recentActivities(),
        ];

        // Même dashboard pour tous les rôles afin que les chiffres et les graphiques restent cohérents.
        $this->view('dashboards/admin', $data);
    }
}
