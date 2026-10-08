<?php
/*
 | Commentaire technique
 | Ce fichier fait partie du noyau de l'application : il gère les mécanismes communs comme le routage, la session, la sécurité ou l'accès aux vues.
 */
namespace App\Core;

final class ErrorHandler
{
    public static function register(): void
    {
        set_exception_handler(function (\Throwable $e) {
            Logger::error($e->getMessage(), ['file' => $e->getFile(), 'line' => $e->getLine()]);
            if (headers_sent()) {
                return;
            }
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            $debug = (bool)(config_app('debug') ?? false);
            echo json_encode([
                'success' => false,
                'message' => $debug ? $e->getMessage() : 'Erreur serveur interne.',
                'code' => 500,
                'file' => $debug ? $e->getFile() : null,
                'line' => $debug ? $e->getLine() : null,
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        });
    }
}
