<?php
/*
 | Commentaire technique
 | Ce fichier contient un contrôleur MVC : il reçoit les requêtes, appelle les services ou modèles nécessaires, puis renvoie la vue ou la réponse adaptée.
 */
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Session;
use App\Core\Validator;
use App\Models\User;
use App\Models\AuditLog;
use App\Services\AuthService;

final class AuthController extends Controller
{
    public function showLogin(): void
    {
        $this->view('auth/login', ['title' => 'Connexion'], 'layouts/auth');
    }

    public function login(): void
    {
        $data = $_POST;
        $validator = (new Validator())->required($data, ['identifier', 'password']);
        if ($validator->fails()) {
            Session::flash('error', 'USER ou mot de passe invalide.');
            $this->redirect('login');
        }

        $config = config_app();
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userModel = new User();
        if ($userModel->tooManyAttempts($data['identifier'], $ip, $config['login_max_attempts'], $config['login_decay_minutes'])) {
            Session::flash('error', 'Trop de tentatives. Contactez l’administrateur.');
            $this->redirect('login');
        }

        $ok = (new AuthService())->attempt($data['identifier'], $data['password'], isset($data['remember']));
        if (!$ok) {
            Session::flash('error', 'Identifiants incorrects ou compte désactivé.');
            $this->redirect('login');
        }
        Session::flash('success', 'Connexion réussie.');
        $this->redirect('dashboard');
    }

    public function forgot(): void
    {
        $this->view('auth/forgot', ['title' => 'Mot de passe oublié'], 'layouts/auth');
    }

    public function logout(): void
    {
        $userId = \App\Core\Auth::id();
        (new AuditLog())->record($userId, 'LOGOUT', 'users', $userId, [
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        ]);
        \App\Core\Auth::logout();
        $this->redirect('login');
    }
}
