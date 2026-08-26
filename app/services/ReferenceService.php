<?php
/*
 | Commentaire technique
 | Ce fichier contient un service métier : il regroupe des traitements réutilisables afin de garder les contrôleurs plus simples et plus lisibles.
 */
namespace App\Services;

use App\Core\Database;

/*
 |--------------------------------------------------------------------------
 | Service de référence automatique
 |--------------------------------------------------------------------------
 | Objectif : afficher la dernière référence utilisée et générer la suivante
 | automatiquement pour éviter les doublons et les références modifiées à la main.
 */
final class ReferenceService
{
    /** Tables autorisées : sécurité stricte, aucune table libre depuis l'URL. */
    private array $allowedTables = [
        'finance_entries', 'finance_exits', 'communion_payments', 'communion_exits', 'projects'
    ];

    public function last(string $table): ?string
    {
        $this->guard($table);
        $stmt = Database::connection()->query("SELECT reference FROM {$table} WHERE reference IS NOT NULL AND reference <> '' ORDER BY id DESC LIMIT 1");
        $ref = $stmt->fetchColumn();
        return $ref !== false ? (string)$ref : null;
    }

    public function next(string $table, string $prefix = 'REF'): string
    {
        $this->guard($table);
        $last = $this->last($table);

        // Si une ancienne référence contient des chiffres, on incrémente la partie numérique finale.
        if ($last && preg_match('/(\d+)$/', $last, $m)) {
            $nextNumber = ((int)$m[1]) + 1;
            $width = max(strlen($m[1]), 3);
            return $prefix . '-' . str_pad((string)$nextNumber, $width, '0', STR_PAD_LEFT);
        }

        // Première référence propre si aucune référence n'existe encore.
        return $prefix . '-001';
    }

    private function guard(string $table): void
    {
        if (!in_array($table, $this->allowedTables, true)) {
            throw new \InvalidArgumentException('Table non autorisée pour la référence automatique.');
        }
    }
}
