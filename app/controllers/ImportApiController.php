<?php
/*
 | Commentaire technique
 | Ce fichier contient un contrôleur MVC : import Excel/CSV et modèles, exposés en JSON pour la page React Importation.
 */
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Models\AuditLog;
use App\Services\ExcelImportService;

/* API import : POST /api/imports (multipart), GET /api/imports (tables), GET /api/imports/template. */
final class ImportApiController extends Controller
{
    public function tables(): void
    {
        if (!Auth::can('ADMIN')) {
            $this->json(['success' => false, 'message' => 'Accès refusé.'], 403);
            return;
        }
        $this->json(['success' => true, 'data' => (new ExcelImportService())->labels()]);
    }

    public function store(): void
    {
        if (!Auth::can('ADMIN')) {
            $this->json(['success' => false, 'message' => 'Accès refusé.'], 403);
            return;
        }

        if (empty($_FILES['excel']['tmp_name']) || !is_uploaded_file($_FILES['excel']['tmp_name'])) {
            $this->json(['success' => false, 'message' => 'Veuillez choisir un fichier Excel ou CSV.'], 422);
            return;
        }

        try {
            $count = (new ExcelImportService())->import(
                (string)($_POST['table_name'] ?? ''),
                $_FILES['excel']['tmp_name'],
                $_FILES['excel']['name'] ?? null
            );
            (new AuditLog())->record(Auth::id(), 'IMPORT', 'system', null, [
                'table' => (string)($_POST['table_name'] ?? ''),
                'file' => (string)($_FILES['excel']['name'] ?? ''),
                'count' => $count,
            ]);
            $this->json(['success' => true, 'imported' => $count, 'message' => $count . ' ligne(s) importée(s) avec succès.']);
        } catch (\Throwable $e) {
            $this->json([
                'success' => false,
                'message' => config_app('debug') ? 'Import refusé : ' . $e->getMessage() : 'Import refusé : fichier ou colonnes invalides.'
            ], 422);
        }
    }

    public function template(): void
    {
        $format = strtolower((string)($_GET['format'] ?? 'xlsx'));
        [$filename, $contentType] = $format === 'csv'
            ? ['modele_import_fideles.csv', 'text/csv; charset=UTF-8']
            : ['modele_import_fideles.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

        $file = BASE_PATH . '/public/templates/' . $filename;
        if (!is_file($file)) {
            $this->json(['success' => false, 'message' => 'Modèle introuvable.'], 404);
            return;
        }

        header('Content-Type: ' . $contentType);
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . filesize($file));
        readfile($file);
        exit;
    }
}
