<?php
/*
 | Commentaire technique
 | Ce fichier fait partie du noyau de l'application : il gère les mécanismes communs comme le routage, la session, la sécurité ou l'accès aux vues.
 */
namespace App\Core;

use App\Models\User;

final class Auth
{
    public static function check(): bool
    {
        return (bool) Session::get('user_id');
    }

    public static function id(): ?int
    {
        return Session::get('user_id') ? (int) Session::get('user_id') : null;
    }

    public static function user(): ?array
    {
        if (!self::check()) return null;
        return (new User())->findWithRole(self::id());
    }

    public static function role(): ?string
    {
        return self::user()['role_name'] ?? null;
    }

    public static function login(array $user): void
    {
        session_regenerate_id(true);
        Session::set('user_id', (int)$user['id']);
        Session::set('role', $user['role_name'] ?? $user['role'] ?? null);
    }

    public static function logout(): void
    {
        Session::destroy();
    }

    public static function can(string ...$roles): bool
    {
        return in_array(self::role(), $roles, true);
    }
}
