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
            http_response_code(500);
            if ($e instanceof \PDOException) {
                echo '<div style="font-family:Arial;margin:40px auto;max-width:720px;padding:24px;border:1px solid #f3c7c7;border-radius:16px;background:#fff5f5;color:#7f1d1d">'
                    . '<h2>Erreur base de données</h2>'
                    . '<p>Une opération a été refusée. Vérifiez les champs saisis ou importez la base de données complète fournie avec le projet.</p>'
                    . '<p><a href="javascript:history.back()">Retour</a></p>'
                    . '</div>';
                return;
            }
            View::render('errors/500', ['title' => 'Erreur serveur']);
        });
    }
}
