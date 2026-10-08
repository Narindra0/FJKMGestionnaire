<?php
/*
 | Commentaire technique
 | Ce fichier contient un contrôleur MVC : il reçoit les requêtes, appelle les services ou modèles nécessaires, puis renvoie la vue ou la réponse adaptée.
 | API REST complète pour le frontend React.
 */
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Core\Session;
use App\Core\Validator;
use App\Models\Fidel;
use App\Models\FinanceEntry;
use App\Models\FinanceExit;
use App\Models\Obligation;
use App\Models\CommunionPayment;
use App\Models\Project;
use App\Models\User;
use App\Models\AuditLog;
use App\Models\Setting;
use App\Services\FinanceService;
use App\Services\ReferenceService;

/* API JSON complète pour le frontend React. */
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

    // === Authentification ===

    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $validator = (new Validator())->required($data, ['identifier', 'password']);
        if ($validator->fails()) {
            $this->json(['success' => false, 'message' => 'Identifiants manquants.'], 400);
            return;
        }

        $config = config_app();
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userModel = new User();
        if ($userModel->tooManyAttempts($data['identifier'], $ip, $config['login_max_attempts'], $config['login_decay_minutes'])) {
            $this->json(['success' => false, 'message' => 'Trop de tentatives. Contactez l’administrateur.'], 429);
            return;
        }

        $ok = (new \App\Services\AuthService())->attempt($data['identifier'], $data['password'], false);
        if (!$ok) {
            $this->json(['success' => false, 'message' => 'Identifiants incorrects ou compte désactivé.'], 401);
            return;
        }

        $user = Auth::user();
        $this->json([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'matricule' => $user['matricule'],
                'role' => $user['role_name'] ?? null
            ]
        ]);
    }

    public function me(): void
    {
        if (!Auth::check()) {
            $this->json(['success' => false, 'message' => 'Non authentifié.'], 401);
            return;
        }
        $user = Auth::user();
        $this->json([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'matricule' => $user['matricule'],
                'role' => $user['role_name'] ?? null
            ]
        ]);
    }

    public function logout(): void
    {
        $userId = Auth::id();
        (new AuditLog())->record($userId, 'LOGOUT', 'users', $userId, [
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        ]);
        Auth::logout();
        $this->json(['success' => true, 'message' => 'Déconnexion réussie.']);
    }

    // === Fideles (Chrétiens) ===

    public function fidelesList(): void
    {
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 20)));
        $search = trim($_GET['search'] ?? '');
        $status = trim($_GET['status'] ?? '');

        $model = new Fidel();
        $fideles = $model->listPaginated($page, $limit, $search, $status);
        $total = $model->count($search, $status);

        $this->json([
            'success' => true,
            'data' => $fideles,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    public function fidelShow(int $id): void
    {
        $fidel = (new Fidel())->find($id);
        if (!$fidel) {
            $this->json(['success' => false, 'message' => 'Chrétien introuvable.'], 404);
            return;
        }
        $this->json(['success' => true, 'data' => $fidel]);
    }

    public function fidelStore(): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $validator = (new Validator())->required($data, ['full_name', 'matricule']);
        if ($validator->fails()) {
            $this->json(['success' => false, 'message' => 'Champs obligatoires manquants.'], 400);
            return;
        }

        try {
            $id = (new Fidel())->create([
                'matricule' => trim($data['matricule']),
                'full_name' => trim($data['full_name']),
                'gender' => $data['gender'] ?? null,
                'birth_date' => normalize_date($data['birth_date'] ?? '') ?: null,
                'phone' => trim($data['phone'] ?? ''),
                'group_name' => trim($data['group_name'] ?? ''),
                'address' => trim($data['address'] ?? ''),
                'baptized_at' => normalize_date($data['baptized_at'] ?? '') ?: null,
                'communion_at' => normalize_date($data['communion_at'] ?? '') ?: null,
                'status' => $data['status'] ?? 'active',
                'created_by' => Auth::id(),
                'created_at' => date('Y-m-d H:i:s'),
            ]);
            (new AuditLog())->record(Auth::id(), 'CREATE_FIDEL', 'fideles', $id, $data);
            $this->json(['success' => true, 'message' => 'Chrétien créé.', 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de la création.'], 500);
        }
    }

    public function fidelUpdate(int $id): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $model = new Fidel();
        $fidel = $model->find($id);
        if (!$fidel) {
            $this->json(['success' => false, 'message' => 'Chrétien introuvable.'], 404);
            return;
        }

        try {
            $model->update($id, [
                'full_name' => trim($data['full_name'] ?? $fidel['full_name']),
                'gender' => $data['gender'] ?? $fidel['gender'],
                'birth_date' => normalize_date($data['birth_date'] ?? '') ?: $fidel['birth_date'],
                'phone' => trim($data['phone'] ?? $fidel['phone']),
                'group_name' => trim($data['group_name'] ?? $fidel['group_name']),
                'address' => trim($data['address'] ?? $fidel['address']),
                'baptized_at' => normalize_date($data['baptized_at'] ?? '') ?: $fidel['baptized_at'],
                'communion_at' => normalize_date($data['communion_at'] ?? '') ?: $fidel['communion_at'],
                'status' => $data['status'] ?? $fidel['status'],
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
            (new AuditLog())->record(Auth::id(), 'UPDATE_FIDEL', 'fideles', $id, $data);
            $this->json(['success' => true, 'message' => 'Chrétien modifié.']);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de la modification.'], 500);
        }
    }

    public function fidelDelete(int $id): void
    {
        $model = new Fidel();
        if (!$model->find($id)) {
            $this->json(['success' => false, 'message' => 'Chrétien introuvable.'], 404);
            return;
        }
        try {
            $model->delete($id);
            (new AuditLog())->record(Auth::id(), 'DELETE_FIDEL', 'fideles', $id, []);
            $this->json(['success' => true, 'message' => 'Chrétien supprimé.']);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de la suppression.'], 500);
        }
    }

    // === Entrées financières ===

    public function entriesList(): void
    {
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 20)));
        $search = trim($_GET['search'] ?? '');
        $startDate = normalize_date($_GET['start_date'] ?? '') ?: null;
        $endDate = normalize_date($_GET['end_date'] ?? '') ?: null;

        $model = new FinanceEntry();
        $entries = $model->listPaginated($page, $limit, $search, $startDate, $endDate);
        $total = $model->count($search, $startDate, $endDate);

        $this->json([
            'success' => true,
            'data' => $entries,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    public function entryStore(): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $validator = (new Validator())->required($data, ['label', 'amount', 'operation_date', 'reference'])->numeric($data, ['amount']);
        if ($validator->fails()) {
            $this->json(['success' => false, 'message' => 'Champs obligatoires manquants ou invalides.'], 400);
            return;
        }

        try {
            $id = (new FinanceEntry())->create([
                'label' => trim($data['label']),
                'category' => trim($data['category'] ?? 'Obligation'),
                'amount' => money_to_float($data['amount'] ?? null) ?? 0,
                'payment_method' => trim($data['payment_method'] ?? 'Espèces'),
                'reference' => trim($data['reference']),
                'operation_date' => normalize_date($data['operation_date'] ?? '') ?: date('Y-m-d'),
                'description' => trim($data['description'] ?? ''),
                'created_by' => Auth::id(),
                'created_at' => date('Y-m-d H:i:s'),
            ]);
            (new AuditLog())->record(Auth::id(), 'CREATE_ENTRY', 'finance_entries', $id, $data);
            $this->json(['success' => true, 'message' => 'Entrée enregistrée.', 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de l\'enregistrement.'], 500);
        }
    }

    public function entryUpdate(int $id): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $model = new FinanceEntry();
        $row = $model->find($id);
        if (!$row) {
            $this->json(['success' => false, 'message' => 'Entrée introuvable.'], 404);
            return;
        }

        try {
            $model->update($id, [
                'label' => trim($data['label'] ?? $row['label']),
                'category' => trim($data['category'] ?? $row['category']),
                'amount' => money_to_float($data['amount'] ?? $row['amount']) ?? 0,
                'payment_method' => trim($data['payment_method'] ?? $row['payment_method']),
                'operation_date' => normalize_date($data['operation_date'] ?? '') ?: $row['operation_date'],
                'description' => trim($data['description'] ?? $row['description']),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
            (new AuditLog())->record(Auth::id(), 'UPDATE_ENTRY', 'finance_entries', $id, $data);
            $this->json(['success' => true, 'message' => 'Entrée modifiée.']);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de la modification.'], 500);
        }
    }

    public function entryDelete(int $id): void
    {
        $model = new FinanceEntry();
        if (!$model->find($id)) {
            $this->json(['success' => false, 'message' => 'Entrée introuvable.'], 404);
            return;
        }
        try {
            $model->delete($id);
            (new AuditLog())->record(Auth::id(), 'DELETE_ENTRY', 'finance_entries', $id, []);
            $this->json(['success' => true, 'message' => 'Entrée supprimée.']);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de la suppression.'], 500);
        }
    }

    // === Sorties financières ===

    public function exitsList(): void
    {
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 20)));
        $search = trim($_GET['search'] ?? '');
        $startDate = normalize_date($_GET['start_date'] ?? '') ?: null;
        $endDate = normalize_date($_GET['end_date'] ?? '') ?: null;

        $model = new FinanceExit();
        $exits = $model->listPaginated($page, $limit, $search, $startDate, $endDate);
        $total = $model->count($search, $startDate, $endDate);

        $this->json([
            'success' => true,
            'data' => $exits,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    public function exitStore(): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $validator = (new Validator())->required($data, ['label', 'amount', 'operation_date', 'reference'])->numeric($data, ['amount']);
        if ($validator->fails()) {
            $this->json(['success' => false, 'message' => 'Champs obligatoires manquants ou invalides.'], 400);
            return;
        }

        $amount = money_to_float($data['amount'] ?? null) ?? 0;
        $balance = (new FinanceService())->totals()['balance'];
        if ($amount > $balance) {
            $this->json(['success' => false, 'message' => 'Solde insuffisant.'], 400);
            return;
        }

        try {
            $id = (new FinanceExit())->create([
                'label' => trim($data['label']),
                'category' => trim($data['category'] ?? 'Dépense'),
                'amount' => $amount,
                'beneficiary' => trim($data['beneficiary'] ?? ''),
                'reference' => trim($data['reference']),
                'operation_date' => normalize_date($data['operation_date'] ?? '') ?: date('Y-m-d'),
                'description' => trim($data['description'] ?? ''),
                'created_by' => Auth::id(),
                'created_at' => date('Y-m-d H:i:s'),
            ]);
            (new AuditLog())->record(Auth::id(), 'CREATE_EXIT', 'finance_exits', $id, $data);
            $this->json(['success' => true, 'message' => 'Sortie enregistrée.', 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de l\'enregistrement.'], 500);
        }
    }

    public function exitUpdate(int $id): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $model = new FinanceExit();
        $row = $model->find($id);
        if (!$row) {
            $this->json(['success' => false, 'message' => 'Sortie introuvable.'], 404);
            return;
        }

        $amount = money_to_float($data['amount'] ?? $row['amount']) ?? 0;
        $balance = (new FinanceService())->totals()['balance'] + (float)($row['amount'] ?? 0);
        if ($amount > $balance) {
            $this->json(['success' => false, 'message' => 'Solde insuffisant.'], 400);
            return;
        }

        try {
            $model->update($id, [
                'label' => trim($data['label'] ?? $row['label']),
                'category' => trim($data['category'] ?? $row['category']),
                'amount' => $amount,
                'beneficiary' => trim($data['beneficiary'] ?? $row['beneficiary']),
                'operation_date' => normalize_date($data['operation_date'] ?? '') ?: $row['operation_date'],
                'description' => trim($data['description'] ?? $row['description']),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
            (new AuditLog())->record(Auth::id(), 'UPDATE_EXIT', 'finance_exits', $id, $data);
            $this->json(['success' => true, 'message' => 'Sortie modifiée.']);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de la modification.'], 500);
        }
    }

    public function exitDelete(int $id): void
    {
        $model = new FinanceExit();
        if (!$model->find($id)) {
            $this->json(['success' => false, 'message' => 'Sortie introuvable.'], 404);
            return;
        }
        try {
            $model->delete($id);
            (new AuditLog())->record(Auth::id(), 'DELETE_EXIT', 'finance_exits', $id, []);
            $this->json(['success' => true, 'message' => 'Sortie supprimée.']);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de la suppression.'], 500);
        }
    }

    // === Obligations ===

    public function obligationsList(): void
    {
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 20)));
        $search = trim($_GET['search'] ?? '');
        $status = trim($_GET['status'] ?? '');
        $month = (int)($_GET['month'] ?? 0);
        $year = (int)($_GET['year'] ?? 0);

        $model = new Obligation();
        $obligations = $model->listPaginated($page, $limit, $search, $status, $month, $year);
        $total = $model->count($search, $status, $month, $year);

        $this->json([
            'success' => true,
            'data' => $obligations,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    public function obligationStore(): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $validator = (new Validator())->required($data, ['fidel_id', 'period_month', 'period_year', 'amount_paid'])->numeric($data, ['amount_paid', 'amount_due']);
        if ($validator->fails()) {
            $this->json(['success' => false, 'message' => 'Champs obligatoires manquants ou invalides.'], 400);
            return;
        }

        $fidel = (new Fidel())->find((int)$data['fidel_id']);
        if (!$fidel) {
            $this->json(['success' => false, 'message' => 'Chrétien introuvable.'], 404);
            return;
        }

        $defaultDue = (float)(new Setting())->get('obligation_default_amount', 0);
        $due = Auth::can('ADMIN') ? (money_to_float($data['amount_due'] ?? null) ?? $defaultDue) : $defaultDue;
        $paid = money_to_float($data['amount_paid'] ?? null) ?? 0;
        $status = $paid >= $due ? 'paid' : ($paid > 0 ? 'partial' : 'unpaid');

        try {
            $id = (new Obligation())->create([
                'fidel_id' => (int)$data['fidel_id'],
                'period_month' => (int)$data['period_month'],
                'period_year' => (int)$data['period_year'],
                'label' => trim($data['label'] ?? 'Obligation'),
                'amount_due' => $due,
                'amount_paid' => $paid,
                'status' => $status,
                'created_by' => Auth::id(),
                'created_at' => date('Y-m-d H:i:s'),
            ]);
            (new AuditLog())->record(Auth::id(), 'CREATE_OBLIGATION', 'obligations', $id, $data);
            $this->json(['success' => true, 'message' => 'Obligation enregistrée.', 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de l\'enregistrement.'], 500);
        }
    }

    public function obligationUpdate(int $id): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $model = new Obligation();
        $row = $model->find($id);
        if (!$row) {
            $this->json(['success' => false, 'message' => 'Obligation introuvable.'], 404);
            return;
        }

        try {
            $model->update($id, [
                'label' => trim($data['label'] ?? $row['label']),
                'amount_due' => money_to_float($data['amount_due'] ?? $row['amount_due']) ?? 0,
                'amount_paid' => money_to_float($data['amount_paid'] ?? $row['amount_paid']) ?? 0,
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
            (new AuditLog())->record(Auth::id(), 'UPDATE_OBLIGATION', 'obligations', $id, $data);
            $this->json(['success' => true, 'message' => 'Obligation modifiée.']);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de la modification.'], 500);
        }
    }

    public function obligationDelete(int $id): void
    {
        $model = new Obligation();
        if (!$model->find($id)) {
            $this->json(['success' => false, 'message' => 'Obligation introuvable.'], 404);
            return;
        }
        try {
            $model->delete($id);
            (new AuditLog())->record(Auth::id(), 'DELETE_OBLIGATION', 'obligations', $id, []);
            $this->json(['success' => true, 'message' => 'Obligation supprimée.']);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de la suppression.'], 500);
        }
    }

    // === Communion ===

    public function communionList(): void
    {
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 20)));
        $year = (int)($_GET['year'] ?? date('Y'));
        $month = (int)($_GET['month'] ?? 0);

        $model = new CommunionPayment();
        $payments = $model->listPaginated($page, $limit, $year, $month);
        $total = $model->count($year, $month);

        $this->json([
            'success' => true,
            'data' => $payments,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    public function communionStore(): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $validator = (new Validator())->required($data, ['fidel_id', 'year', 'months', 'amount'])->numeric($data, ['amount']);
        if ($validator->fails()) {
            $this->json(['success' => false, 'message' => 'Champs obligatoires manquants ou invalides.'], 400);
            return;
        }

        $fidel = (new Fidel())->find((int)$data['fidel_id']);
        if (!$fidel) {
            $this->json(['success' => false, 'message' => 'Chrétien introuvable.'], 404);
            return;
        }

        $year = (int)$data['year'];
        $months = is_array($data['months']) ? $data['months'] : [$data['months']];
        $amount = money_to_float($data['amount'] ?? null) ?? 0;
        $paymentDate = normalize_date($data['payment_date'] ?? '') ?: date('Y-m-d');
        $method = trim($data['payment_method'] ?? 'Espèces');
        $baseRef = trim($data['reference'] ?? (new ReferenceService())->next('communion_payments', 'COM-ENT'));

        $model = new CommunionPayment();
        $created = 0;
        $duplicates = [];

        foreach ($months as $m) {
            if ($model->existsForPeriod((int)$fidel['id'], $year, (int)$m)) {
                $duplicates[] = month_name((int)$m) . ' ' . $year;
                continue;
            }

            $ref = $model->uniqueReference($baseRef, $year, (int)$m, (int)$fidel['id']);
            try {
                $id = $model->create([
                    'fidel_id' => (int)$fidel['id'],
                    'period_type' => 'monthly',
                    'paid_year' => $year,
                    'paid_month' => (int)$m,
                    'amount' => $amount,
                    'payment_date' => $paymentDate,
                    'payment_method' => $method,
                    'reference' => $ref,
                    'created_by' => Auth::id(),
                    'created_at' => date('Y-m-d H:i:s'),
                ]);
                (new AuditLog())->record(Auth::id(), 'CREATE_COMMUNION_ENTRY', 'communion_payments', $id, ['month' => $m, 'year' => $year]);
                $created++;
            } catch (\Throwable $e) {
                // Ignore duplicates
            }
        }

        $message = $created . ' paiement(s) enregistré(s).';
        if ($duplicates) $message .= ' Déjà payés : ' . implode(', ', $duplicates) . '.';

        $this->json(['success' => true, 'message' => $message, 'data' => ['created' => $created]]);
    }

    public function communionUpdate(int $id): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $model = new CommunionPayment();
        $row = $model->find($id);
        if (!$row) {
            $this->json(['success' => false, 'message' => 'Paiement introuvable.'], 404);
            return;
        }

        try {
            $model->update($id, [
                'amount' => money_to_float($data['amount'] ?? $row['amount']) ?? 0,
                'payment_date' => normalize_date($data['payment_date'] ?? '') ?: $row['payment_date'],
                'payment_method' => trim($data['payment_method'] ?? $row['payment_method']),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
            (new AuditLog())->record(Auth::id(), 'UPDATE_COMMUNION_ENTRY', 'communion_payments', $id, $data);
            $this->json(['success' => true, 'message' => 'Paiement modifié.']);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de la modification.'], 500);
        }
    }

    public function communionDelete(int $id): void
    {
        $model = new CommunionPayment();
        if (!$model->find($id)) {
            $this->json(['success' => false, 'message' => 'Paiement introuvable.'], 404);
            return;
        }
        try {
            $model->delete($id);
            (new AuditLog())->record(Auth::id(), 'DELETE_COMMUNION_ENTRY', 'communion_payments', $id, []);
            $this->json(['success' => true, 'message' => 'Paiement supprimé.']);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de la suppression.'], 500);
        }
    }

    // === Projets ===

    public function projectsList(): void
    {
        $model = new Project();
        $projects = $model->recent();
        $this->json(['success' => true, 'data' => $projects]);
    }

    public function projectStore(): void
    {
        if (!Auth::can('ADMIN')) {
            $this->json(['success' => false, 'message' => 'Accès refusé.'], 403);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $validator = (new Validator())->required($data, ['name', 'reference', 'budget', 'start_date'])->numeric($data, ['budget']);
        if ($validator->fails()) {
            $this->json(['success' => false, 'message' => 'Champs obligatoires manquants ou invalides.'], 400);
            return;
        }

        $budget = max(0, money_to_float($data['budget'] ?? null) ?? 0);
        $startDate = normalize_date($data['start_date'] ?? '') ?: date('Y-m-d');
        $endDate = normalize_date($data['end_date'] ?? '') ?: null;

        try {
            $id = (new Project())->create([
                'reference' => trim($data['reference']),
                'name' => trim($data['name']),
                'description' => trim($data['description'] ?? ''),
                'budget' => $budget,
                'collected_amount' => 0,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'planned',
                'created_by' => Auth::id(),
                'created_at' => date('Y-m-d H:i:s'),
            ]);
            (new AuditLog())->record(Auth::id(), 'CREATE_PROJECT', 'projects', $id, $data);
            $this->json(['success' => true, 'message' => 'Projet créé.', 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de la création.'], 500);
        }
    }

    public function projectUpdate(int $id): void
    {
        if (!Auth::can('ADMIN')) {
            $this->json(['success' => false, 'message' => 'Accès refusé.'], 403);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $model = new Project();
        $row = $model->find($id);
        if (!$row) {
            $this->json(['success' => false, 'message' => 'Projet introuvable.'], 404);
            return;
        }

        try {
            $model->update($id, [
                'name' => trim($data['name'] ?? $row['name']),
                'description' => trim($data['description'] ?? $row['description']),
                'budget' => money_to_float($data['budget'] ?? $row['budget']) ?? 0,
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
            (new AuditLog())->record(Auth::id(), 'UPDATE_PROJECT', 'projects', $id, $data);
            $this->json(['success' => true, 'message' => 'Projet modifié.']);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de la modification.'], 500);
        }
    }

    public function projectDelete(int $id): void
    {
        if (!Auth::can('ADMIN')) {
            $this->json(['success' => false, 'message' => 'Accès refusé.'], 403);
            return;
        }

        $model = new Project();
        if (!$model->find($id)) {
            $this->json(['success' => false, 'message' => 'Projet introuvable.'], 404);
            return;
        }
        try {
            $model->delete($id);
            (new AuditLog())->record(Auth::id(), 'DELETE_PROJECT', 'projects', $id, []);
            $this->json(['success' => true, 'message' => 'Projet supprimé.']);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de la suppression.'], 500);
        }
    }

    public function projectPayment(int $id): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $model = new Project();
        $project = $model->find($id);
        if (!$project) {
            $this->json(['success' => false, 'message' => 'Projet introuvable.'], 404);
            return;
        }

        $amount = money_to_float($data['amount'] ?? null) ?? 0;
        $paymentDate = normalize_date($data['payment_date'] ?? '') ?: date('Y-m-d');
        $rest = max(0, (float)$project['budget'] - (float)$project['collected_amount']);

        if ($amount > $rest) {
            $this->json(['success' => false, 'message' => 'Montant supérieur au reste disponible.'], 400);
            return;
        }

        try {
            $model->addPayment($id, $amount, $paymentDate, trim($data['description'] ?? ''), null, Auth::id(), null);
            (new AuditLog())->record(Auth::id(), 'PAY_PROJECT', 'projects', $id, ['amount' => $amount]);
            $this->json(['success' => true, 'message' => 'Paiement enregistré.']);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de l\'enregistrement.'], 500);
        }
    }

    // === Utilisateurs ===

    public function usersList(): void
    {
        if (!Auth::can('ADMIN')) {
            $this->json(['success' => false, 'message' => 'Accès refusé.'], 403);
            return;
        }

        $model = new User();
        $users = array_map(static function (array $u): array {
            unset($u['password'], $u['role_id']);
            $u['role'] = $u['role_name'] ?? null;
            return $u;
        }, $model->allWithRoles());
        $this->json(['success' => true, 'data' => $users]);
    }

    public function userUpdate(int $id): void
    {
        if (!Auth::can('ADMIN')) {
            $this->json(['success' => false, 'message' => 'Accès refusé.'], 403);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $model = new User();
        $row = $model->find($id);
        if (!$row) {
            $this->json(['success' => false, 'message' => 'Utilisateur introuvable.'], 404);
            return;
        }

        try {
            $updateData = [
                'name' => trim($data['name'] ?? $row['name']),
                'email' => trim($data['email'] ?? $row['email']),
                'status' => $data['status'] ?? $row['status'],
                'updated_at' => date('Y-m-d H:i:s'),
            ];

            if (!empty($data['password'])) {
                $updateData['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
            }

            $model->update($id, $updateData);
            (new AuditLog())->record(Auth::id(), 'UPDATE_USER', 'users', $id, $data);
            $this->json(['success' => true, 'message' => 'Utilisateur modifié.']);
        } catch (\Throwable $e) {
            $this->json(['success' => false, 'message' => 'Erreur lors de la modification.'], 500);
        }
    }

    // === Logs ===

    public function logsList(): void
    {
        if (!Auth::can('ADMIN')) {
            $this->json(['success' => false, 'message' => 'Accès refusé.'], 403);
            return;
        }

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 20)));
        $search = trim($_GET['search'] ?? '');

        $model = new AuditLog();
        $logs = $model->listPaginated($page, $limit, $search);
        $total = $model->count($search);

        $this->json([
            'success' => true,
            'data' => $logs,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    // === Références ===

    public function nextReference(): void
    {
        $table = trim($_GET['table'] ?? '');
        $prefix = trim($_GET['prefix'] ?? '');
        if (!$table || !$prefix) {
            $this->json(['success' => false, 'message' => 'Paramètres manquants.'], 400);
            return;
        }

        $ref = (new ReferenceService())->next($table, $prefix);
        $this->json(['success' => true, 'data' => ['reference' => $ref]]);
    }
}
