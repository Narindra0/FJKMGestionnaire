<?php
/*
 | Commentaire technique
 | Ce fichier contient un contrôleur MVC : il reçoit les requêtes, appelle les services ou modèles nécessaires, puis renvoie la vue ou la réponse adaptée.
 | Le module Communion est volontairement renforcé pour éviter les erreurs de doublon ou de base incomplète pendant la présentation.
 */
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Core\Session;
use App\Core\Validator;
use App\Models\Fidel;
use App\Models\CommunionPayment;
use App\Models\AuditLog;
use App\Services\FinanceService;
use App\Services\ReferenceService;


/* Communion (mpandray) : entrées uniquement, une seule fois par chrétien et par mois payé. */
final class CommunionController extends Controller
{
    public function index(): void
    {
        $refs = new ReferenceService();
        $paymentsModel = new CommunionPayment();

        $this->view('communion/index', [
            'title' => 'Communion (mpandray)',
            'payments' => $paymentsModel->list(),
            'fideles' => (new Fidel())->all('full_name ASC'),
            'totals' => (new FinanceService())->communionTotals(),
            'lastEntryRef' => $refs->last('communion_payments'),
            'nextEntryRef' => $refs->next('communion_payments', 'COM-ENT'),
        ]);
    }

    public function storeEntry(): void
    {
        $fidel = $this->resolveFidel();
        if (!$fidel) {
            Session::flash('error', 'Chrétien introuvable. Tapez ou choisissez un matricule valide.');
            $this->redirect('communion');
        }

        $year = (int)($_POST['year'] ?? date('Y'));
        $months = $this->cleanMonths($_POST['months'] ?? []);
        $amount = money_to_float($_POST['amount'] ?? null) ?? 0;
        $paymentDate = $this->validDate($_POST['payment_date'] ?? '') ?: date('Y-m-d');

        if ($year < 2000 || $year > 2100 || empty($months)) {
            Session::flash('error', 'Veuillez choisir au moins un mois valide.');
            $this->redirect('communion');
        }
        if ($amount <= 0) {
            Session::flash('error', 'Montant obligatoire pour les mois sélectionnés.');
            $this->redirect('communion');
        }

        $method = trim($_POST['payment_method'] ?? 'Espèces') ?: 'Espèces';
        $baseRef = trim($_POST['reference'] ?? (new ReferenceService())->next('communion_payments', 'COM-ENT')) ?: 'COM-ENT';
        $model = new CommunionPayment();
        $lastYear = $model->maxPaidYearForFidel((int)$fidel['id']);
        if (!Auth::can('ADMIN') && $lastYear !== null && $year < $lastYear) {
            Session::flash('error', 'Date refusée : ce chrétien a déjà un paiement plus récent. Seul ADMIN peut enregistrer une année antérieure en cas de raison valable.');
            $this->redirect('communion');
        }

        $created = 0;
        $duplicates = [];
        $errors = [];

        foreach ($months as $m) {
            if ($model->existsForPeriod((int)$fidel['id'], $year, $m)) {
                $duplicates[] = month_name($m) . ' ' . $year;
                continue;
            }

            $saved = false;
            for ($try = 1; $try <= 3 && !$saved; $try++) {
                $ref = $model->uniqueReference($baseRef, $year, $m, (int)$fidel['id']);
                try {
                    $id = $model->create([
                        'fidel_id' => (int)$fidel['id'],
                        'period_type' => 'monthly',
                        'paid_year' => $year,
                        'paid_month' => $m,
                        'amount' => $amount,
                        'payment_date' => $paymentDate,
                        'payment_method' => $method,
                        'reference' => $ref,
                        'created_by' => Auth::id(),
                        'created_at' => date('Y-m-d H:i:s'),
                    ]);
                    (new AuditLog())->record(Auth::id(), 'CREATE_COMMUNION_ENTRY', 'communion_payments', $id, ['month' => $m, 'year' => $year, 'payment_date' => $paymentDate, 'reference' => $ref]);
                    $created++;
                    $saved = true;
                } catch (\PDOException $e) {
                    if ($this->looksLikeDuplicate($e)) {
                        if ($model->existsForPeriod((int)$fidel['id'], $year, $m)) {
                            $duplicates[] = month_name($m) . ' ' . $year;
                            $saved = true;
                        }
                        continue;
                    }
                    $errors[] = month_name($m) . ' ' . $year;
                    break;
                } catch (\Throwable $e) {
                    $errors[] = month_name($m) . ' ' . $year;
                    break;
                }
            }
        }

        if ($created === 0 && $errors) {
            Session::flash('error', 'Enregistrement communion refusé pour : ' . implode(', ', array_unique($errors)) . '. Vérifiez que la base fournie avec le projet est bien importée, puis réessayez.');
        } elseif ($created === 0) {
            $message = 'Aucun enregistrement ajouté.';
            if ($duplicates) $message .= ' Mois déjà payés : ' . implode(', ', array_unique($duplicates)) . '.';
            Session::flash('error', $message);
        } else {
            $message = $created . ' entrée(s) communion enregistrée(s).';
            if ($duplicates) $message .= ' Non ajoutés car déjà payés : ' . implode(', ', array_unique($duplicates)) . '.';
            if ($errors) $message .= ' À vérifier : ' . implode(', ', array_unique($errors)) . '.';
            Session::flash('success', $message);
        }
        $this->redirect('communion');
    }

    public function updateEntry(int $id): void
    {
        $model = new CommunionPayment();
        $row = $model->find($id);
        if (!$this->canModify($row)) {
            Session::flash('error', 'Modification refusée : USER peut modifier uniquement les saisies d’aujourd’hui.');
            $this->redirect('communion');
        }
        $v = (new Validator())->required($_POST, ['amount','payment_date','year'])->numeric($_POST, ['amount']);
        $months = $this->cleanMonths($_POST['months'] ?? []);
        $month = (int)($months[0] ?? 0);
        $year = (int)($_POST['year'] ?? 0);
        if ($v->fails() || $month < 1 || $month > 12 || $year < 2000 || $year > 2100) {
            Session::flash('error', 'Champ obligatoire vide. Choisissez une année et un mois.');
            $this->redirect('communion');
        }
        $lastYear = $model->maxPaidYearForFidel((int)($row['fidel_id'] ?? 0));
        if (!Auth::can('ADMIN') && $lastYear !== null && $year < $lastYear) {
            Session::flash('error', 'Date refusée : ce chrétien a déjà un paiement plus récent. Seul ADMIN peut modifier vers une année antérieure.');
            $this->redirect('communion');
        }
        if ($model->existsForPeriod((int)($row['fidel_id'] ?? 0), $year, $month, $id)) {
            Session::flash('error', 'Modification refusée : ce mois est déjà payé pour ce chrétien.');
            $this->redirect('communion');
        }

        try {
            $model->update($id, [
                'amount' => money_to_float($_POST['amount'] ?? null) ?? 0,
                'payment_date' => $this->validDate($_POST['payment_date'] ?? '') ?: date('Y-m-d'),
                'payment_method' => trim($_POST['payment_method'] ?? 'Espèces') ?: 'Espèces',
                'paid_year' => $year,
                'paid_month' => $month,
            ]);
            (new AuditLog())->record(Auth::id(), 'UPDATE_COMMUNION_ENTRY', 'communion_payments', $id, $_POST);
            Session::flash('success', 'Entrée communion modifiée.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Modification communion refusée. Vérifiez les champs puis réessayez.');
        }
        $this->redirect('communion');
    }

    public function deleteEntry(int $id): void
    {
        try {
            (new CommunionPayment())->delete($id);
            (new AuditLog())->record(Auth::id(), 'DELETE_COMMUNION_ENTRY', 'communion_payments', $id, []);
            Session::flash('success', 'Entrée communion supprimée.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Suppression refusée. Vérifiez les droits et la base de données.');
        }
        $this->redirect('communion');
    }

    private function cleanMonths(mixed $months): array
    {
        if (!is_array($months)) $months = [$months];
        $months = array_map('intval', $months);
        $months = array_filter($months, fn($m) => $m >= 1 && $m <= 12);
        $months = array_values(array_unique($months));
        sort($months);
        return $months;
    }

    private function looksLikeDuplicate(\PDOException $e): bool
    {
        return (string)$e->getCode() === '23000' || str_contains(strtolower($e->getMessage()), 'duplicate');
    }
}
