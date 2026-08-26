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
use App\Models\Project;
use App\Models\AuditLog;
use App\Services\ReferenceService;

/* Projets : ADMIN paramètre les projets, ADMIN/USER enregistrent uniquement les montants reçus. */
final class ProjectController extends Controller
{
    public function index(): void
    {
        // Prépare toutes les données nécessaires à l'écran Projet : listes, références et projets payables.
        $refs = new ReferenceService();
        $model = new Project();
        $this->view('projects/index', [
            'title' => 'Projets (tetik\'asa)',
            'projects' => $model->recent(),
            'availableProjects' => $model->availableForPayment(),
            'projectPayments' => $model->payments(),
            'lastRef' => $refs->last('projects'),
            'nextRef' => $refs->next('projects', 'PROJ'),
        ]);
    }

    public function store(): void
    {
        if (($_POST['action_type'] ?? '') === 'project_parameter') {
            $this->storeParameter();
            return;
        }
        $this->payProject();
    }

    private function storeParameter(): void
    {
        // Sécurise le paramétrage : seul l'administrateur peut créer un projet de référence.
        if (!Auth::can('ADMIN')) {
            Session::flash('error', 'Création refusée : seul ADMIN peut paramétrer un projet.');
            $this->redirect('projects');
        }
        $v = (new Validator())->required($_POST, ['name','reference','budget','start_date']);
        if ($v->fails()) {
            Session::flash('error', 'Champ obligatoire vide. Référence, nom du projet, montant total à payer et date début sont obligatoires.');
            $this->redirect('projects');
        }
        // Les montants saisis avec points ou espaces sont normalisés avant enregistrement.
        $budget = max(0, money_to_float($_POST['budget'] ?? null) ?? 0);
        $startDate = $this->validDate($_POST['start_date'] ?? '') ?: date('Y-m-d');
        $endDate = $this->validDate($_POST['end_date'] ?? '') ?: null;
        if ($endDate && $endDate < $startDate) {
            Session::flash('error', 'Date fin invalide : elle ne doit pas être antérieure à la date début.');
            $this->redirect('projects');
        }
        if ($budget <= 0) {
            Session::flash('error', 'Montant total à payer invalide.');
            $this->redirect('projects');
        }
        try {
            $id = (new Project())->create([
                'reference' => trim($_POST['reference'] ?? ''),
                'name' => trim($_POST['name'] ?? ''),
                'description' => '',
                'budget' => $budget,
                'collected_amount' => 0,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'planned',
                'created_by' => Auth::id(),
                'created_at' => date('Y-m-d H:i:s')
            ]);
            (new AuditLog())->record(Auth::id(), 'CREATE_PROJECT_PARAMETER', 'projects', $id, $_POST);
            Session::flash('success', 'Projet paramétré. Il apparaît maintenant dans la liste de paiement.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Création refusée : référence projet déjà utilisée ou donnée invalide.');
        }
        $this->redirect('projects');
    }

    public function update(int $id): void
    {
        // Modification du paramètre projet avec recalcul du statut selon le montant déjà collecté.
        if (!Auth::can('ADMIN')) {
            Session::flash('error', 'Modification refusée : seul ADMIN peut modifier le paramètre projet.');
            $this->redirect('projects');
        }
        $model = new Project();
        $row = $model->find($id);
        if (!$row) {
            Session::flash('error', 'Projet introuvable.');
            $this->redirect('projects');
        }
        $v = (new Validator())->required($_POST, ['name','budget','start_date']);
        if ($v->fails()) {
            Session::flash('error', 'Nom du projet, montant total à payer et date début obligatoires.');
            $this->redirect('projects');
        }
        $budget = max(0, money_to_float($_POST['budget'] ?? null) ?? 0);
        $startDate = $this->validDate($_POST['start_date'] ?? '') ?: ($row['start_date'] ?: date('Y-m-d'));
        $endDate = $this->validDate($_POST['end_date'] ?? '') ?: null;
        if ($endDate && $endDate < $startDate) {
            Session::flash('error', 'Date fin invalide : elle ne doit pas être antérieure à la date début.');
            $this->redirect('projects');
        }
        $collected = min($budget, (float)($row['collected_amount'] ?? 0));
        $status = $model->computeStatus($budget, $collected);
        try {
            $model->update($id, [
                'name' => trim($_POST['name'] ?? ''),
                'description' => (string)($row['description'] ?? ''),
                'budget' => $budget,
                'collected_amount' => $collected,
                'start_date' => $startDate,
                'end_date' => $endDate ?: (($status === 'completed') ? ($row['end_date'] ?: date('Y-m-d')) : null),
                'status' => $status,
                'updated_at' => date('Y-m-d H:i:s')
            ]);
            (new AuditLog())->record(Auth::id(), 'UPDATE_PROJECT_PARAMETER', 'projects', $id, $_POST);
            Session::flash('success', 'Paramètre projet modifié. Reste recalculé automatiquement.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Modification refusée : vérifiez les informations du projet.');
        }
        $this->redirect('projects');
    }

    public function delete(int $id): void
    {
        if (!Auth::can('ADMIN')) {
            Session::flash('error', 'Suppression refusée.');
            $this->redirect('projects');
        }
        try {
            (new Project())->delete($id);
            (new AuditLog())->record(Auth::id(), 'DELETE_PROJECT', 'projects', $id, []);
            Session::flash('success', 'Projet supprimé.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Suppression refusée : ce projet possède déjà des paiements. Annulez-le ou gardez l’historique.');
        }
        $this->redirect('projects');
    }

    private function payProject(): void
    {
        // Enregistre un versement sur projet et bloque tout paiement supérieur au reste disponible.
        $id = (int)($_POST['project_id'] ?? 0);
        $amount = money_to_float($_POST['payment_amount'] ?? null) ?? 0;
        $paymentDate = $this->validDate($_POST['payment_date'] ?? '') ?: date('Y-m-d');
        $description = trim($_POST['description'] ?? '');
        $model = new Project();
        $project = $model->find($id);
        if (!$project || $amount <= 0) {
            Session::flash('error', 'Projet ou montant invalide. Sélectionnez un projet et saisissez le montant payé maintenant.');
            $this->redirect('projects');
        }
        $rest = max(0, (float)$project['budget'] - (float)($project['collected_amount'] ?? 0));
        if ($rest <= 0) {
            Session::flash('error', 'Ce projet est déjà terminé : montant total déjà atteint.');
            $this->redirect('projects');
        }
        if ($amount > $rest) {
            Session::flash('error', 'Montant refusé : il ne doit pas dépasser le reste actuel du projet.');
            $this->redirect('projects');
        }
        try {
            $model->addPayment($id, $amount, $paymentDate, $description, null, Auth::id(), null);
            (new AuditLog())->record(Auth::id(), 'PAY_PROJECT', 'projects', $id, ['amount' => $amount]);
            Session::flash('success', 'Projet enregistré avec calcul automatique du reste.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Paiement projet refusé : vérifiez la base de données et les champs saisis.');
        }
        $this->redirect('projects#projectsTable');
    }
}
