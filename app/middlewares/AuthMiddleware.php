<?php
/*
 | Commentaire technique
 | Ce fichier contient un middleware : il vérifie une condition avant de laisser la requête continuer vers le contrôleur.
 */
namespace App\Middlewares;

use App\Core\Auth;

final class AuthMiddleware
{
    public function handle(array $args = []): void
    {
        // Le PHP ne sert plus que l'API REST : réponse JSON 401 standard, jamais de redirection HTML.
        if (!Auth::check()) {
            http_response_code(401);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => false, 'message' => 'Non authentifié.', 'code' => 401], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}
