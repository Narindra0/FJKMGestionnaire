<?php
/*
 | Commentaire technique
 | Ce fichier contient un middleware : il vérifie une condition avant de laisser la requête continuer vers le contrôleur.
 */
namespace App\Middlewares;

use App\Core\Auth;
use App\Core\Session;

final class RoleMiddleware
{
    public function handle(array $roles = []): void
    {
        if (!Auth::check() || !in_array(Auth::role(), $roles, true)) {
            Session::flash('error', 'Accès refusé : droits insuffisants.');
            header('Location: ' . url('dashboard'));
            exit;
        }
    }
}
