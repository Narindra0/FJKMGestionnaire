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
use App\Models\User;
use App\Models\AuditLog;

/* Administration des comptes : activation/désactivation, modification, rôle, mot de passe et suppression. */
final class UserController extends Controller
{
    public function index(): void
    {
        $model = new User();
        $this->view('users/index', ['title' => 'Gestion des accès', 'users' => $model->allWithRoles(), 'roles' => $model->roles()]);
    }

    public function store(): void
    {
        $v = (new Validator())->required($_POST, ['name','email','password','role_id']);
        if ($v->fails() || strlen((string)($_POST['password'] ?? '')) < 8) {
            Session::flash('error', 'Création refusée : nom, email, rôle et mot de passe minimum 8 caractères sont obligatoires.');
            $this->redirect('users');
        }
        try {
            $id = (new User())->createUser($_POST);
            (new AuditLog())->record(Auth::id(), 'CREATE_USER', 'users', $id, $_POST);
            Session::flash('success', 'Nouvel utilisateur ajouté.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Création refusée : email ou matricule déjà utilisé. Corrigez le champ puis réessayez.');
        }
        $this->redirect('users');
    }

    public function updateStatus(int $id): void
    {
        $status = ($_POST['status'] ?? '') === 'inactive' ? 'inactive' : 'active';
        try {
            (new User())->updateStatus($id, $status);
            (new AuditLog())->record(Auth::id(), 'UPDATE_USER_STATUS', 'users', $id, ['status' => $status]);
            Session::flash('success', 'Statut du login mis à jour.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Modification refusée : impossible de changer le statut de ce login.');
        }
        $this->redirect('users');
    }

    public function updateProfile(int $id): void
    {
        $v = (new Validator())->required($_POST, ['name','email','role_id']);
        if ($v->fails()) {
            Session::flash('error', 'Modification refusée : nom, email et rôle obligatoires.');
            $this->redirect('users');
        }
        if (!empty($_POST['password']) && strlen((string)$_POST['password']) < 8) {
            Session::flash('error', 'Mot de passe refusé : minimum 8 caractères.');
            $this->redirect('users');
        }
        try {
            (new User())->updateProfile($id, $_POST);
            (new AuditLog())->record(Auth::id(), 'UPDATE_USER_PROFILE', 'users', $id, $_POST);
            Session::flash('success', 'Login modifié.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Modification refusée : email ou matricule déjà utilisé par un autre login.');
        }
        $this->redirect('users');
    }

    public function changePassword(int $id): void
    {
        $v = (new Validator())->required($_POST, ['password']);
        if ($v->fails() || strlen((string)$_POST['password']) < 8) {
            Session::flash('error', 'Mot de passe refusé : minimum 8 caractères.');
            $this->redirect('users');
        }
        try {
            (new User())->changePassword($id, $_POST['password']);
            (new AuditLog())->record(Auth::id(), 'CHANGE_USER_PASSWORD', 'users', $id, []);
            Session::flash('success', 'Mot de passe modifié.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Modification refusée : impossible de changer le mot de passe.');
        }
        $this->redirect('users');
    }

    public function changeRole(int $id): void
    {
        $roleId = (int)($_POST['role_id'] ?? 0);
        if ($roleId <= 0) {
            Session::flash('error', 'Rôle invalide.');
            $this->redirect('users');
        }
        try {
            (new User())->updateRole($id, $roleId);
            (new AuditLog())->record(Auth::id(), 'CHANGE_USER_ROLE', 'users', $id, ['role_id' => $roleId]);
            Session::flash('success', 'Rôle utilisateur modifié.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Modification refusée : rôle impossible à appliquer.');
        }
        $this->redirect('users');
    }

    public function delete(int $id): void
    {
        if ($id === Auth::id()) {
            Session::flash('error', 'Vous ne pouvez pas supprimer votre propre login.');
            $this->redirect('users');
        }
        try {
            (new User())->delete($id);
            (new AuditLog())->record(Auth::id(), 'DELETE_USER', 'users', $id, []);
            Session::flash('success', 'Login supprimé.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Suppression refusée : ce login est lié à des opérations enregistrées. Désactivez-le plutôt.');
        }
        $this->redirect('users');
    }
}
