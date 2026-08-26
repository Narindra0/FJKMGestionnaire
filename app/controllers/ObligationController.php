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
use App\Models\Fidel;
use App\Models\Obligation;
use App\Models\AuditLog;
use App\Models\Setting;

/* Obligations (adidy) : mois + année séparés, paiement partiel et blocage du mois déjà payé complètement. */
final class ObligationController extends Controller
{
    public function index(): void
    {
        $defaultAmount = (float)(new Setting())->get('obligation_default_amount', 0);
        $this->view('obligations/index', [
            'title' => 'Obligations (adidy)',
            'obligations' => (new Obligation())->list(),
            'fideles' => (new Fidel())->all('full_name ASC'),
            'defaultAmount' => $defaultAmount,
            'currentYear' => (int)date('Y'),
            'monthsFr' => month_names(),
        ]);
    }

    public function settings(): void
    {
        $amount = max(0, money_to_float($_POST['obligation_default_amount'] ?? null) ?? 0);
        (new Setting())->set('obligation_default_amount', $amount);
        (new AuditLog())->record(Auth::id(), 'UPDATE_OBLIGATION_SETTING', 'settings', null, ['obligation_default_amount' => $amount]);
        Session::flash('success', 'Paramètre montant obligation mis à jour.');
        $this->redirect('obligations');
    }

    public function store(): void
    {
        $fidel = $this->resolveFidel();
        if (!$fidel) {
            Session::flash('error', 'Chrétien introuvable. Tapez ou choisissez un matricule valide.');
            $this->redirect('obligations');
        }

        $month = (int)($_POST['period_month'] ?? 0);
        $year = (int)($_POST['period_year'] ?? 0);
        if ($month < 1 || $month > 12 || $year < 2000 || $year > 2100) {
            Session::flash('error', 'Mois et année obligatoires.');
            $this->redirect('obligations');
        }

        $payment = money_to_float($_POST['payment_amount'] ?? $_POST['amount_paid'] ?? null) ?? 0;
        $defaultDue = (float)(new Setting())->get('obligation_default_amount', 0);
        $due = Auth::can('ADMIN') ? (money_to_float($_POST['amount_due'] ?? null) ?? $defaultDue) : $defaultDue;
        if ($due <= 0) $due = $defaultDue;
        $paymentDate = normalize_date($_POST['payment_date'] ?? '') ?: date('Y-m-d');
        $label = trim($_POST['label'] ?? 'Obligation');
        $existingId = (int)($_POST['existing_obligation_id'] ?? 0);
        $model = new Obligation();

        if ($payment < 0 || $due <= 0) {
            Session::flash('error', 'Montant invalide.');
            $this->redirect('obligations');
        }

        $paidAlready = $model->findPaidForFidelPeriod((int)$fidel['id'], $month, $year);
        if ($paidAlready && $existingId !== (int)$paidAlready['id']) {
            Session::flash('error', 'Paiement refusé : ce chrétien a déjà payé totalement cette période.');
            $this->redirect('obligations');
        }

        $existing = $existingId > 0 ? $model->findWithFidel($existingId) : null;
        if (!$existing) $existing = $model->findOpenForFidel((int)$fidel['id'], $month, $year);
        if (!$existing) $existing = $model->findForFidelPeriod((int)$fidel['id'], $month, $year);

        if ($existing) {
            $currentDue = (float)$existing['amount_due'];
            $currentPaid = (float)$existing['amount_paid'];
            $newDue = max($currentDue, $due);
            $rest = max(0, $newDue - $currentPaid);
            if ($payment > $rest) {
                Session::flash('error', 'Montant payé maintenant refusé : il ne doit pas dépasser le reste à payer.');
                $this->redirect('obligations');
            }
            $newPaid = $currentPaid + $payment;
            $status = $newPaid >= $newDue ? 'paid' : ($newPaid > 0 ? 'partial' : 'unpaid');
            $model->update((int)$existing['id'], [
                'label' => $label ?: $existing['label'],
                'period_month' => $month,
                'period_year' => $year,
                'amount_due' => $newDue,
                'amount_paid' => $newPaid,
                'status' => $status,
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
            if ($payment > 0) $model->recordPayment((int)$existing['id'], (int)$fidel['id'], $payment, $paymentDate, Auth::id(), 'Paiement complémentaire');
            (new AuditLog())->record(Auth::id(), 'UPDATE_OBLIGATION_PAYMENT', 'obligations', (int)$existing['id'], $_POST);
            Session::flash('success', 'Paiement ajouté. Reste mis à jour automatiquement.');
            $this->redirect('obligations#obligationsTable');
        }

        $v = (new Validator())->required($_POST, ['label'])->numeric($_POST, ['payment_amount']);
        if ($v->fails()) {
            Session::flash('error', 'Champ obligatoire vide ou montant invalide.');
            $this->redirect('obligations');
        }
        if ($payment > $due) {
            Session::flash('error', 'Montant payé maintenant refusé : il ne doit pas dépasser le montant total à payer.');
            $this->redirect('obligations');
        }

        $paid = $payment;
        $status = $paid >= $due ? 'paid' : ($paid > 0 ? 'partial' : 'unpaid');
        $id = $model->create([
            'fidel_id' => (int)$fidel['id'],
            'period_id' => null,
            'period_month' => $month,
            'period_year' => $year,
            'label' => $label,
            'amount_due' => $due,
            'amount_paid' => $paid,
            'status' => $status,
            'due_date' => null,
            'created_by' => Auth::id(),
            'created_at' => date('Y-m-d H:i:s'),
        ]);
        if ($paid > 0) $model->recordPayment($id, (int)$fidel['id'], $paid, $paymentDate, Auth::id(), 'Premier paiement');
        (new AuditLog())->record(Auth::id(), 'CREATE_OBLIGATION', 'obligations', $id, $_POST);
        Session::flash('success', 'Obligation enregistrée avec calcul automatique du reste.');
        $this->redirect('obligations#obligationsTable');
    }

    public function update(int $id): void
    {
        $model = new Obligation();
        $row = $model->find($id);
        if (!$this->canModify($row)) {
            Session::flash('error', 'Modification refusée : USER peut modifier uniquement les saisies d’aujourd’hui.');
            $this->redirect('obligations');
        }
        $month = (int)($_POST['period_month'] ?? 0);
        $year = (int)($_POST['period_year'] ?? 0);
        if ($month < 1 || $month > 12 || $year < 2000 || $year > 2100) {
            Session::flash('error', 'Mois et année obligatoires.');
            $this->redirect('obligations');
        }
        if ($model->findPaidForFidelPeriod((int)$row['fidel_id'], $month, $year, $id)) {
            Session::flash('error', 'Modification refusée : cette période est déjà payée totalement.');
            $this->redirect('obligations');
        }
        $defaultDue = (float)(new Setting())->get('obligation_default_amount', 0);
        $due = Auth::can('ADMIN') ? max(0, money_to_float($_POST['amount_due'] ?? null) ?? 0) : $defaultDue;
        if ($due <= 0) $due = $defaultDue;
        $paid = max(0, money_to_float($_POST['amount_paid'] ?? null) ?? 0);
        if ($paid > $due) {
            Session::flash('error', 'Montant payé refusé : il ne doit pas dépasser le montant total à payer.');
            $this->redirect('obligations');
        }
        $status = $paid >= $due ? 'paid' : ($paid > 0 ? 'partial' : 'unpaid');
        try {
            $model->update($id, [
                'label' => trim($_POST['label'] ?? 'Obligation'),
                'period_month' => $month,
                'period_year' => $year,
                'amount_due' => $due,
                'amount_paid' => $paid,
                'status' => $status,
                'due_date' => null,
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
            $model->syncRecordedPayments($id, (int)$row['fidel_id'], $paid, normalize_date($_POST['payment_date'] ?? '') ?: date('Y-m-d'), Auth::id());
            (new AuditLog())->record(Auth::id(), 'UPDATE_OBLIGATION', 'obligations', $id, $_POST);
            Session::flash('success', 'Obligation modifiée. Les totaux financiers ont été synchronisés.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Modification refusée : impossible de synchroniser le paiement avec le total général.');
        }
        $this->redirect('obligations#obligationsTable');
    }

    public function delete(int $id): void
    {
        $model = new Obligation();
        $row = $model->find($id);
        if (!$row) {
            Session::flash('error', 'Obligation introuvable.');
            $this->redirect('obligations');
        }
        // Supprime explicitement les paiements : fonctionne aussi si une ancienne base
        // n'applique pas encore la contrainte ON DELETE CASCADE.
        $db = \App\Core\Database::connection();
        $db->beginTransaction();
        try {
            $stmt = $db->prepare('DELETE FROM obligation_payments WHERE obligation_id = :id');
            $stmt->execute(['id' => $id]);
            $model->delete($id);
            $db->commit();
            (new AuditLog())->record(Auth::id(), 'DELETE_OBLIGATION', 'obligations', $id, []);
            Session::flash('success', 'Obligation supprimée. Les montants de l’entrée générale et du reste général sont recalculés.');
        } catch (\Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            Session::flash('error', 'Suppression refusée : impossible de retirer les paiements liés.');
        }
        $this->redirect('obligations');
    }


}
