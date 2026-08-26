<?php
/*
 | Commentaire technique
 | Ce fichier contient un contrôleur MVC : il reçoit les requêtes, appelle les services ou modèles nécessaires, puis renvoie la vue ou la réponse adaptée.
 */
namespace App\Controllers;

use App\Core\Controller;
use App\Models\Fidel;
use App\Models\FinanceEntry;
use App\Models\FinanceExit;
use App\Models\Obligation;
use App\Models\CommunionPayment;
use App\Services\FinanceService;

/* API JSON utilisée par JavaScript/jQuery pour les recherches instantanées. */
final class ApiController extends Controller
{
    public function dashboardStats(): void
    {
        $finance = new FinanceService();
        $this->json(['success' => true, 'totals' => $finance->totals(), 'communionTotals' => $finance->communionTotals(), 'series' => $finance->monthlySeries((int)date('Y'))]);
    }

    public function searchFideles(): void
    {
        $q = trim($_GET['q'] ?? '');
        $this->json(['success' => true, 'data' => (new Fidel())->search($q)]);
    }

    public function searchFinance(): void
    {
        $q = trim($_GET['q'] ?? '');
        $this->json(['success' => true, 'entries' => (new FinanceEntry())->search($q), 'exits' => (new FinanceExit())->search($q)]);
    }

    public function obligationRest(): void
    {
        $fidelModel = new Fidel();
        $fidel = null;
        $fidelId = (int)($_GET['fidel_id'] ?? 0);
        if ($fidelId > 0) $fidel = $fidelModel->find($fidelId);
        if (!$fidel) $fidel = $fidelModel->findByLookup((string)($_GET['q'] ?? ''));
        if (!$fidel) { $this->json(['success' => false, 'message' => 'Chrétien introuvable.']); return; }
        $month = !empty($_GET['period_month']) ? (int)$_GET['period_month'] : null;
        $year = !empty($_GET['period_year']) ? (int)$_GET['period_year'] : null;
        $model = new Obligation();
        $history = $model->historyForFidel((int)$fidel['id']);
        $obligation = $model->findOpenForFidel((int)$fidel['id'], $month, $year);
        if (!$obligation) {
            $this->json([
                'success' => true,
                'fidel' => $fidel,
                'has_open' => false,
                'history' => $history,
                'message' => 'Aucun reste ouvert pour ce chrétien sur la période choisie.'
            ]);
            return;
        }
        $rest = max(0, (float)$obligation['amount_due'] - (float)$obligation['amount_paid']);
        $this->json([
            'success' => true,
            'fidel' => $fidel,
            'has_open' => true,
            'obligation' => $obligation,
            'history' => $history,
            'rest' => $rest,
            'message' => 'Reste actuel : ' . money_mga($rest)
        ]);
    }

    public function communionHistory(): void
    {
        $fidelModel = new Fidel();
        $fidel = null;
        $fidelId = (int)($_GET['fidel_id'] ?? 0);
        if ($fidelId > 0) $fidel = $fidelModel->find($fidelId);
        if (!$fidel) $fidel = $fidelModel->findByLookup((string)($_GET['q'] ?? ''));
        if (!$fidel) { $this->json(['success' => false, 'message' => 'Chrétien introuvable.']); return; }
        $this->json(['success' => true, 'fidel' => $fidel, 'history' => (new CommunionPayment())->historyForFidel((int)$fidel['id'])]);
    }
}
