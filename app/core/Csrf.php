<?php
/*
 | Commentaire technique
 | Ce fichier fait partie du noyau de l'application : il gère les mécanismes communs comme le routage, la session, la sécurité ou l'accès aux vues.
 */
namespace App\Core;

final class Csrf
{
    public static function token(): string
    {
        $key = config_app('csrf_key');
        if (empty($_SESSION[$key])) {
            $_SESSION[$key] = bin2hex(random_bytes(32));
        }
        return $_SESSION[$key];
    }

    public static function validate(?string $token): bool
    {
        $key = config_app('csrf_key');
        return is_string($token) && hash_equals($_SESSION[$key] ?? '', $token);
    }
}
