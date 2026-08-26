<?php
/*
 | Commentaire technique
 | Ce fichier déclare les routes de l'application et associe chaque URL au contrôleur correspondant.
 */
/*
 |--------------------------------------------------------------------------
 | Routes web principales
 |--------------------------------------------------------------------------
 | ADMIN : tout faire (enregistrement, modification, suppression, import/export).
 | USER : enregistrement et modification contrôlée, mais pas suppression.
 | VISITEUR : consultation dashboard, Chrétien et rapports.
 */
use App\Controllers\AuthController;
use App\Controllers\DashboardController;
use App\Controllers\FinanceController;
use App\Controllers\FidelController;
use App\Controllers\ObligationController;
use App\Controllers\CommunionController;
use App\Controllers\ReportController;
use App\Controllers\UserController;
use App\Controllers\ProjectController;
use App\Controllers\ImportController;
use App\Controllers\LogController;

$router->get('/', [DashboardController::class, 'index'], ['AuthMiddleware']);
$router->get('/login', [AuthController::class, 'showLogin']);
$router->post('/login', [AuthController::class, 'login'], ['CsrfMiddleware']);
$router->get('/forgot-password', [AuthController::class, 'forgot']);
$router->post('/logout', [AuthController::class, 'logout'], ['CsrfMiddleware']);
$router->get('/dashboard', [DashboardController::class, 'index'], ['AuthMiddleware']);

// Entrées et sorties séparées.
$router->get('/finances', [FinanceController::class, 'index'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER']);
$router->get('/entrees', [FinanceController::class, 'entriesPage'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER']);
$router->post('/entrees', [FinanceController::class, 'storeEntry'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER','CsrfMiddleware']);
$router->post('/entrees/{id}/update', [FinanceController::class, 'updateEntry'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER','CsrfMiddleware']);
$router->post('/entrees/{id}/delete', [FinanceController::class, 'deleteEntry'], ['AuthMiddleware','RoleMiddleware:ADMIN','CsrfMiddleware']);
$router->get('/sorties', [FinanceController::class, 'exitsPage'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER']);
$router->post('/sorties', [FinanceController::class, 'storeExit'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER','CsrfMiddleware']);
$router->post('/sorties/{id}/update', [FinanceController::class, 'updateExit'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER','CsrfMiddleware']);
$router->post('/sorties/{id}/delete', [FinanceController::class, 'deleteExit'], ['AuthMiddleware','RoleMiddleware:ADMIN','CsrfMiddleware']);

// Chrétien : anciennement Fidèles.
$router->get('/fideles', [FidelController::class, 'index'], ['AuthMiddleware']);
$router->get('/fideles/create', [FidelController::class, 'create'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER']);
$router->post('/fideles', [FidelController::class, 'store'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER','CsrfMiddleware']);
$router->post('/fideles/{id}/update', [FidelController::class, 'update'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER','CsrfMiddleware']);
$router->post('/fideles/{id}/delete', [FidelController::class, 'delete'], ['AuthMiddleware','RoleMiddleware:ADMIN','CsrfMiddleware']);
$router->get('/fideles/{id}', [FidelController::class, 'show'], ['AuthMiddleware']);
$router->get('/fideles/{id}/card', [FidelController::class, 'card'], ['AuthMiddleware']);

$router->get('/obligations', [ObligationController::class, 'index'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER']);
$router->post('/obligations', [ObligationController::class, 'store'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER','CsrfMiddleware']);
$router->post('/obligations/settings', [ObligationController::class, 'settings'], ['AuthMiddleware','RoleMiddleware:ADMIN','CsrfMiddleware']);
$router->post('/obligations/{id}/update', [ObligationController::class, 'update'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER','CsrfMiddleware']);
$router->post('/obligations/{id}/delete', [ObligationController::class, 'delete'], ['AuthMiddleware','RoleMiddleware:ADMIN','CsrfMiddleware']);

$router->get('/communion', [CommunionController::class, 'index'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER']);
$router->post('/communion/entries', [CommunionController::class, 'storeEntry'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER','CsrfMiddleware']);
$router->post('/communion/{id}/update', [CommunionController::class, 'updateEntry'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER','CsrfMiddleware']);
$router->post('/communion/{id}/delete', [CommunionController::class, 'deleteEntry'], ['AuthMiddleware','RoleMiddleware:ADMIN','CsrfMiddleware']);

$router->get('/projects', [ProjectController::class, 'index'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER']);
$router->post('/projects', [ProjectController::class, 'store'], ['AuthMiddleware','RoleMiddleware:ADMIN,USER','CsrfMiddleware']);
$router->post('/projects/{id}/update', [ProjectController::class, 'update'], ['AuthMiddleware','RoleMiddleware:ADMIN','CsrfMiddleware']);
$router->post('/projects/{id}/delete', [ProjectController::class, 'delete'], ['AuthMiddleware','RoleMiddleware:ADMIN','CsrfMiddleware']);

$router->get('/reports', [ReportController::class, 'index'], ['AuthMiddleware']);
$router->get('/reports/pdf', [ReportController::class, 'exportPdf'], ['AuthMiddleware']);
$router->get('/reports/excel', [ReportController::class, 'exportExcel'], ['AuthMiddleware']);

$router->get('/imports', [ImportController::class, 'index'], ['AuthMiddleware','RoleMiddleware:ADMIN']);
$router->get('/imports/template', [ImportController::class, 'template'], ['AuthMiddleware','RoleMiddleware:ADMIN']);
$router->get('/imports/template-csv', [ImportController::class, 'templateCsv'], ['AuthMiddleware','RoleMiddleware:ADMIN']);
$router->post('/imports', [ImportController::class, 'store'], ['AuthMiddleware','RoleMiddleware:ADMIN','CsrfMiddleware']);

$router->get('/logs', [LogController::class, 'index'], ['AuthMiddleware','RoleMiddleware:ADMIN']);
$router->get('/users', [UserController::class, 'index'], ['AuthMiddleware','RoleMiddleware:ADMIN']);
$router->post('/users', [UserController::class, 'store'], ['AuthMiddleware','RoleMiddleware:ADMIN','CsrfMiddleware']);
$router->post('/users/{id}/status', [UserController::class, 'updateStatus'], ['AuthMiddleware','RoleMiddleware:ADMIN','CsrfMiddleware']);
$router->post('/users/{id}/password', [UserController::class, 'changePassword'], ['AuthMiddleware','RoleMiddleware:ADMIN','CsrfMiddleware']);
$router->post('/users/{id}/role', [UserController::class, 'changeRole'], ['AuthMiddleware','RoleMiddleware:ADMIN','CsrfMiddleware']);
$router->post('/users/{id}/profile', [UserController::class, 'updateProfile'], ['AuthMiddleware','RoleMiddleware:ADMIN','CsrfMiddleware']);
$router->post('/users/{id}/delete', [UserController::class, 'delete'], ['AuthMiddleware','RoleMiddleware:ADMIN','CsrfMiddleware']);
