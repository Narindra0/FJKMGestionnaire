<?php
/*
 | Commentaire technique
 | Ce fichier déclare les routes de l'application et associe chaque URL au contrôleur correspondant.
 | API REST complète pour le frontend React.
 */
use App\Controllers\ApiController;
use App\Controllers\HealthController;
use App\Controllers\ReportApiController;
use App\Controllers\ImportApiController;
use App\Controllers\PublicFluxController;

// === Routes publiques (authentification) ===
$router->post('/api/auth/login', [ApiController::class, 'login']);

// === Monitoring (Uptime Robot) ===
$router->get('/api/health', [HealthController::class, 'index']);

// === Espace public de consultation (lecture seule, sans mot de passe) ===
// Données agrégées uniquement : totaux, séries mensuelles, catégories,
// derniers mouvements sans champ nominatif. Aucune mutation possible :
// seules des routes GET existent.
$router->get('/api/public/flux', [PublicFluxController::class, 'overview']);

// === Routes protégées (nécessitent AuthMiddleware) ===

// Dashboard
$router->get('/api/dashboard/stats', [ApiController::class, 'dashboardStats'], ['AuthMiddleware']);

// Authentification
$router->get('/api/auth/me', [ApiController::class, 'me'], ['AuthMiddleware']);
$router->post('/api/auth/logout', [ApiController::class, 'logout'], ['AuthMiddleware']);

// Chrétiens (Fideles)
$router->get('/api/fideles', [ApiController::class, 'fidelesList'], ['AuthMiddleware']);
$router->get('/api/fideles/search', [ApiController::class, 'searchFideles'], ['AuthMiddleware']);
$router->get('/api/fideles/{id}', [ApiController::class, 'fidelShow'], ['AuthMiddleware']);
$router->post('/api/fideles', [ApiController::class, 'fidelStore'], ['AuthMiddleware']);
$router->put('/api/fideles/{id}', [ApiController::class, 'fidelUpdate'], ['AuthMiddleware']);
$router->delete('/api/fideles/{id}', [ApiController::class, 'fidelDelete'], ['AuthMiddleware']);

// Entrées financières
$router->get('/api/entries', [ApiController::class, 'entriesList'], ['AuthMiddleware']);
$router->get('/api/finance/search', [ApiController::class, 'searchFinance'], ['AuthMiddleware']);
$router->post('/api/entries', [ApiController::class, 'entryStore'], ['AuthMiddleware']);
$router->put('/api/entries/{id}', [ApiController::class, 'entryUpdate'], ['AuthMiddleware']);
$router->delete('/api/entries/{id}', [ApiController::class, 'entryDelete'], ['AuthMiddleware']);

// Sorties financières
$router->get('/api/exits', [ApiController::class, 'exitsList'], ['AuthMiddleware']);
$router->post('/api/exits', [ApiController::class, 'exitStore'], ['AuthMiddleware']);
$router->put('/api/exits/{id}', [ApiController::class, 'exitUpdate'], ['AuthMiddleware']);
$router->delete('/api/exits/{id}', [ApiController::class, 'exitDelete'], ['AuthMiddleware']);

// Obligations
$router->get('/api/obligations', [ApiController::class, 'obligationsList'], ['AuthMiddleware']);
$router->get('/api/obligations/rest', [ApiController::class, 'obligationRest'], ['AuthMiddleware']);
$router->post('/api/obligations', [ApiController::class, 'obligationStore'], ['AuthMiddleware']);
$router->put('/api/obligations/{id}', [ApiController::class, 'obligationUpdate'], ['AuthMiddleware']);
$router->delete('/api/obligations/{id}', [ApiController::class, 'obligationDelete'], ['AuthMiddleware']);

// Communion
$router->get('/api/communion', [ApiController::class, 'communionList'], ['AuthMiddleware']);
$router->get('/api/communion/history', [ApiController::class, 'communionHistory'], ['AuthMiddleware']);
$router->post('/api/communion', [ApiController::class, 'communionStore'], ['AuthMiddleware']);
$router->put('/api/communion/{id}', [ApiController::class, 'communionUpdate'], ['AuthMiddleware']);
$router->delete('/api/communion/{id}', [ApiController::class, 'communionDelete'], ['AuthMiddleware']);

// Projets
$router->get('/api/projects', [ApiController::class, 'projectsList'], ['AuthMiddleware']);
$router->post('/api/projects', [ApiController::class, 'projectStore'], ['AuthMiddleware']);
$router->put('/api/projects/{id}', [ApiController::class, 'projectUpdate'], ['AuthMiddleware']);
$router->delete('/api/projects/{id}', [ApiController::class, 'projectDelete'], ['AuthMiddleware']);
$router->post('/api/projects/{id}/payments', [ApiController::class, 'projectPayment'], ['AuthMiddleware']);

// Utilisateurs (ADMIN only)
$router->get('/api/users', [ApiController::class, 'usersList'], ['AuthMiddleware']);
$router->put('/api/users/{id}', [ApiController::class, 'userUpdate'], ['AuthMiddleware']);

// Logs (ADMIN only)
$router->get('/api/logs', [ApiController::class, 'logsList'], ['AuthMiddleware']);

// Références
$router->get('/api/references/next', [ApiController::class, 'nextReference'], ['AuthMiddleware']);

// Rapports (données + export CSV/PDF)
$router->get('/api/reports', [ReportApiController::class, 'index'], ['AuthMiddleware']);
$router->get('/api/reports/export', [ReportApiController::class, 'export'], ['AuthMiddleware']);

// Importation Excel/CSV (ADMIN)
$router->get('/api/imports', [ImportApiController::class, 'tables'], ['AuthMiddleware']);
$router->post('/api/imports', [ImportApiController::class, 'store'], ['AuthMiddleware']);
$router->get('/api/imports/template', [ImportApiController::class, 'template'], ['AuthMiddleware']);
