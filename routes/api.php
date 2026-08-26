<?php
/*
 | Commentaire technique
 | Ce fichier déclare les routes de l'application et associe chaque URL au contrôleur correspondant.
 */
use App\Controllers\ApiController;

$router->get('/api/dashboard/stats', [ApiController::class, 'dashboardStats'], ['AuthMiddleware']);
$router->get('/api/fideles/search', [ApiController::class, 'searchFideles'], ['AuthMiddleware']);
$router->get('/api/finance/search', [ApiController::class, 'searchFinance'], ['AuthMiddleware']);
$router->get('/api/obligations/rest', [ApiController::class, 'obligationRest'], ['AuthMiddleware']);
$router->get('/api/communion/history', [ApiController::class, 'communionHistory'], ['AuthMiddleware']);
