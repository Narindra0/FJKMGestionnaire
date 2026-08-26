<?php
/*
 | Commentaire technique
 | Ce fichier contient un contrôleur MVC : il reçoit les requêtes, appelle les services ou modèles nécessaires, puis renvoie la vue ou la réponse adaptée.
 */
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Core\Session;
use App\Core\Validator;
use App\Models\FinanceEntry;
use App\Models\FinanceExit;
use App\Models\AuditLog;
use App\Services\ReferenceService;
use App\Services\FinanceService;

/* Gestion séparée des entrées et des sorties générales. */
final class FinanceController extends Controller
{
    public function index(): void
    {
        $this->entriesPage();
    }

    public function entriesPage(): void
    {
        $refs = new ReferenceService();
        $this->view('finances/entries', [
            'title' => 'Entrées (vola miditra)',
            'entries' => (new FinanceEntry())->recent(),
            'lastEntryRef' => $refs->last('finance_entries'),
            'nextEntryRef' => $refs->next('finance_entries', 'ENT'),
        ]);
    }

    public function exitsPage(): void
    {
        $refs = new ReferenceService();
        $this->view('finances/exits', [
            'title' => 'Sorties (vola mivoaka)',
            'exits' => (new FinanceExit())->recent(),
            'lastExitRef' => $refs->last('finance_exits'),
            'nextExitRef' => $refs->next('finance_exits', 'SOR'),
        ]);
    }

    public function storeEntry(): void
    {
        $v = (new Validator())->required($_POST, ['label','amount','operation_date','reference'])->numeric($_POST, ['amount']);
        if ($v->fails()) {
            Session::flash('error', 'Champ obligatoire vide ou entrée invalide. Veuillez remplir ce champ.');
            $this->redirect('entrees');
        }
        try {
            $id = (new FinanceEntry())->create($this->entryPayload() + [
                'created_by' => Auth::id(),
                'created_at' => date('Y-m-d H:i:s'),
            ]);
            (new AuditLog())->record(Auth::id(), 'CREATE_ENTRY', 'finance_entries', $id, $_POST);
            Session::flash('success', 'Entrée financière enregistrée.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Enregistrement refusé : vérifiez les champs obligatoires et la référence automatique.');
        }
        $this->redirect('entrees');
    }

    public function updateEntry(int $id): void
    {
        $model = new FinanceEntry();
        $row = $model->find($id);
        if (!$this->canModify($row, 'operation_date')) {
            Session::flash('error', 'Modification refusée : USER peut modifier uniquement les saisies d’aujourd’hui. ADMIN peut tout modifier.');
            $this->redirect('entrees');
        }
        // Une correction comptable reste autorisée même si elle fait apparaître un déficit.
        // Le tableau de bord recalcule ensuite les totaux réels à partir des opérations restantes.
        try {
            $model->update($id, $this->entryPayload(false) + ['updated_at' => date('Y-m-d H:i:s')]);
            (new AuditLog())->record(Auth::id(), 'UPDATE_ENTRY', 'finance_entries', $id, $_POST);
            Session::flash('success', 'Entrée modifiée.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Modification refusée : vérifiez les champs saisis.');
        }
        $this->redirect('entrees');
    }

    public function deleteEntry(int $id): void
    {
        $model = new FinanceEntry();
        $row = $model->find($id);
        if (!$row) {
            Session::flash('error', 'Entrée introuvable.');
            $this->redirect('entrees');
        }
        // Ne jamais conserver un total figé : la suppression est autorisée et les totaux
        // sont calculés de nouveau à partir des opérations encore enregistrées.
        $model->delete($id);
        (new AuditLog())->record(Auth::id(), 'DELETE_ENTRY', 'finance_entries', $id, []);
        Session::flash('success', 'Entrée supprimée. Entrée générale et reste général sont recalculés automatiquement.');
        $this->redirect('entrees');
    }

    public function storeExit(): void
    {
        $v = (new Validator())->required($_POST, ['label','amount','operation_date','reference'])->numeric($_POST, ['amount']);
        if ($v->fails()) {
            Session::flash('error', 'Champ obligatoire vide ou sortie invalide. Veuillez remplir ce champ.');
            $this->redirect('sorties');
        }
        $amount = money_to_float($_POST['amount'] ?? null) ?? 0;
        $balance = (new FinanceService())->totals()['balance'];
        if ($amount > $balance) {
            Session::flash('error', 'Sortie refusée : le montant de sortie ne peut pas dépasser le solde disponible. Entrée générale disponible : ' . money_mga($balance) . '.');
            $this->redirect('sorties');
        }
        try {
            $id = (new FinanceExit())->create($this->exitPayload() + [
                'created_by' => Auth::id(),
                'created_at' => date('Y-m-d H:i:s'),
            ]);
            (new AuditLog())->record(Auth::id(), 'CREATE_EXIT', 'finance_exits', $id, $_POST);
            Session::flash('success', 'Sortie financière enregistrée.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Enregistrement refusé : vérifiez les champs obligatoires et la référence automatique.');
        }
        $this->redirect('sorties');
    }

    public function updateExit(int $id): void
    {
        $model = new FinanceExit();
        $row = $model->find($id);
        if (!$this->canModify($row, 'operation_date')) {
            Session::flash('error', 'Modification refusée : USER peut modifier uniquement les saisies d’aujourd’hui. ADMIN peut tout modifier.');
            $this->redirect('sorties');
        }
        $amount = money_to_float($_POST['amount'] ?? null) ?? 0;
        $balance = (new FinanceService())->totals()['balance'] + (float)($row['amount'] ?? 0);
        if ($amount > $balance) {
            Session::flash('error', 'Modification refusée : le montant de sortie ne peut pas dépasser le solde disponible. Solde autorisé : ' . money_mga($balance) . '.');
            $this->redirect('sorties');
        }
        try {
            $model->update($id, $this->exitPayload(false) + ['updated_at' => date('Y-m-d H:i:s')]);
            (new AuditLog())->record(Auth::id(), 'UPDATE_EXIT', 'finance_exits', $id, $_POST);
            Session::flash('success', 'Sortie modifiée.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Modification refusée : vérifiez les champs saisis.');
        }
        $this->redirect('sorties');
    }

    public function deleteExit(int $id): void
    {
        $model = new FinanceExit();
        $row = $model->find($id);
        if (!$row) {
            Session::flash('error', 'Sortie introuvable.');
            $this->redirect('sorties');
        }
        $model->delete($id);
        (new AuditLog())->record(Auth::id(), 'DELETE_EXIT', 'finance_exits', $id, []);
        // La sortie générale baisse et le reste général augmente automatiquement.
        Session::flash('success', 'Sortie supprimée. Sortie générale et reste général sont recalculés automatiquement.');
        $this->redirect('sorties');
    }

    private function entryPayload(bool $withRef = true): array
    {
        $data = [
            'label' => trim($_POST['label'] ?? ''),
            'category' => trim($_POST['category'] ?? 'Obligation'),
            'amount' => money_to_float($_POST['amount'] ?? null) ?? 0,
            'payment_method' => trim($_POST['payment_method'] ?? 'Espèces'),
            'operation_date' => normalize_date($_POST['operation_date'] ?? '') ?: date('Y-m-d'),
            'description' => trim($_POST['description'] ?? ''),
        ];
        if ($withRef) $data['reference'] = trim($_POST['reference'] ?? '');
        return $data;
    }

    private function exitPayload(bool $withRef = true): array
    {
        $data = [
            'label' => trim($_POST['label'] ?? ''),
            'category' => trim($_POST['category'] ?? 'Dépense'),
            'amount' => money_to_float($_POST['amount'] ?? null) ?? 0,
            'beneficiary' => trim($_POST['beneficiary'] ?? ''),
            'operation_date' => normalize_date($_POST['operation_date'] ?? '') ?: date('Y-m-d'),
            'description' => trim($_POST['description'] ?? ''),
        ];
        if ($withRef) $data['reference'] = trim($_POST['reference'] ?? '');
        return $data;
    }


}
