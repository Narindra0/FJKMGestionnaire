<?php
/*
 | Commentaire technique
 | Ce fichier contient un contrôleur MVC : il expose l'état de santé de l'application (monitoring Uptime Robot).
 */
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;

/* Endpoint public /api/health : répond 200 si l'app et la BDD vont bien, 503 sinon. */
final class HealthController extends Controller
{
    public function index(): void
    {
        $db = 'down';
        $dbError = null;
        try {
            Database::connection()->query('SELECT 1');
            $db = 'up';
        } catch (\Throwable $e) {
            $dbError = $e->getMessage();
        }

        $healthy = $db === 'up';
        $this->json([
            'status' => $healthy ? 'ok' : 'degraded',
            'app' => 'FJKM Gestionnaire',
            'php' => PHP_VERSION,
            'time' => date('c'),
            'checks' => [
                'database' => $db,
            ],
            'error' => config_app('debug') ? $dbError : null,
        ], $healthy ? 200 : 503);
    }
}
