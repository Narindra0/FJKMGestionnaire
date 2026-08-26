<?php
/*
 | Commentaire technique
 | Ce fichier fait partie du noyau de l'application : il gère les mécanismes communs comme le routage, la session, la sécurité ou l'accès aux vues.
 */
namespace App\Core;

abstract class Controller
{
    protected function view(string $view, array $data = [], string $layout = 'layouts/main'): void
    {
        View::render($view, $data, $layout);
    }

    protected function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    protected function redirect(string $path): void
    {
        header('Location: ' . url($path));
        exit;
    }

    protected function requirePost(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            exit('Méthode non autorisée');
        }
    }

    /**
     * Vérifie si l'utilisateur peut modifier un enregistrement.
     * ADMIN peut tout modifier, USER uniquement les saisies du jour.
     */
    protected function canModify(?array $row, string $dateField = 'created_at'): bool
    {
        if (!$row) return false;
        if (\App\Core\Auth::can('ADMIN')) return true;
        return substr((string)($row[$dateField] ?? ''), 0, 10) === date('Y-m-d');
    }

    protected function validDate(string $value): ?string
    {
        return normalize_date($value);
    }

    protected function resolveFidel(): ?array
    {
        $model = new \App\Models\Fidel();
        $id = (int)($_POST['fidel_id'] ?? 0);
        if ($id > 0) return $model->find($id);
        return $model->findByLookup((string)($_POST['fidel_lookup'] ?? ''));
    }
}
