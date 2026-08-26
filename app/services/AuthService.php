<?php
/*
 | Commentaire technique
 | Ce fichier contient un service métier : il regroupe des traitements réutilisables afin de garder les contrôleurs plus simples et plus lisibles.
 */
namespace App\Services;

use App\Models\User;
use App\Models\AuditLog;
use App\Core\Auth;

final class AuthService
{
    public function attempt(string $identifier, string $password, bool $remember = false): bool
    {
        $identifier = trim($identifier);
        $userModel = new User();
        $user = $userModel->findByIdentifier($identifier);
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

        if (!$user || !password_verify($password, $user['password'])) {
            $userModel->recordLoginAttempt($identifier, $ip, false);
            (new AuditLog())->record(null, 'LOGIN_FAILED', 'users', null, ['user' => $identifier, 'ip' => $ip]);
            return false;
        }

        if (($user['status'] ?? '') !== 'active') return false;

        Auth::login($user);
        $userModel->recordLoginAttempt($identifier, $ip, true);
        $userModel->touchLastLogin((int)$user['id']);
        (new AuditLog())->record((int)$user['id'], 'LOGIN_SUCCESS', 'users', (int)$user['id'], ['ip' => $ip]);

        if ($remember) {
            $token = bin2hex(random_bytes(32));
            $userModel->storeRememberToken((int)$user['id'], hash('sha256', $token));
            setcookie(config_app('remember_cookie'), $token, time() + 86400 * 30, '/', '', false, true);
        }
        return true;
    }
}
