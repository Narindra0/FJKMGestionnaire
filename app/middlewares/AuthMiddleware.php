<?php
/*
 | Commentaire technique
 | Ce fichier contient un middleware : il vérifie une condition avant de laisser la requête continuer vers le contrôleur.
 */
namespace App\Middlewares;

use App\Core\Auth;
use App\Core\Session;

final class AuthMiddleware
{
    public function handle(array $args = []): void
    {
        if (!Auth::check()) {
            Session::flash('error', 'Veuillez vous connecter pour continuer.');
            header('Location: ' . url('login'));
            exit;
        }
    }
}
