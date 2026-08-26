<?php
/*
 | Commentaire technique
 | Ce fichier contient un contrôleur MVC : il reçoit les requêtes, appelle les services ou modèles nécessaires, puis renvoie la vue ou la réponse adaptée.
 */
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Session;
use App\Services\ExcelImportService;

/* Import Excel : insertion massive avec structure contrôlée. */
final class ImportController extends Controller
{
    public function index(): void
    {
        $service = new ExcelImportService();
        $this->view('imports/index', ['title' => 'Importation Excel', 'tables' => $service->labels()]);
    }

    public function store(): void
    {
        if (empty($_FILES['excel']['tmp_name']) || !is_uploaded_file($_FILES['excel']['tmp_name'])) {
            Session::flash('error', 'Veuillez choisir un fichier Excel.');
            $this->redirect('imports');
        }

        try {
            $count = (new ExcelImportService())->import($_POST['table_name'] ?? '', $_FILES['excel']['tmp_name'], $_FILES['excel']['name'] ?? null);
            Session::flash('success', $count . ' ligne(s) importée(s) avec succès.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Import refusé : ' . $e->getMessage());
        }
        $this->redirect('imports');
    }

    public function template(): void
    {
        $this->downloadTemplate('modele_import_fideles.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function templateCsv(): void
    {
        $this->downloadTemplate('modele_import_fideles.csv', 'text/csv; charset=UTF-8');
    }

    private function downloadTemplate(string $filename, string $contentType): void
    {
        $file = BASE_PATH . '/public/templates/' . $filename;
        if (!is_file($file)) {
            http_response_code(404);
            echo 'Modèle introuvable.';
            return;
        }

        header('Content-Type: ' . $contentType);
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . filesize($file));
        readfile($file);
        exit;
    }

}
