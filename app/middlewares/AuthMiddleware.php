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
            $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';
            // Pour l'API REST (React), repondre en JSON 401 : une redirection HTML
            // provoque cote client une erreur de parsing "Unexpected token '<'".
            if (str_contains($path, '/api/')) {
                http_response_code(401);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode(['success' => false, 'message' => 'Non authentifie.', 'code' => 401]);
                exit;
            }
            Session::flash('error', 'Veuillez vous connecter pour continuer.');
            header('Location: ' . url('login'));
            exit;
        }
    }
}
