<?php
/*
 | Commentaire technique
 | Ce fichier contient un middleware : il vérifie une condition avant de laisser la requête continuer vers le contrôleur.
 */
namespace App\Middlewares;

use App\Core\Csrf;
use App\Core\Session;

final class CsrfMiddleware
{
    public function handle(array $args = []): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && !Csrf::validate($_POST['_csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null)) {
            Session::flash('error', 'Session expirée ou jeton CSRF invalide.');
            http_response_code(419);
            header('Location: ' . ($_SERVER['HTTP_REFERER'] ?? url('dashboard')));
            exit;
        }
    }
}
