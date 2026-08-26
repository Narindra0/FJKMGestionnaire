<?php
/*
 | Commentaire technique
 | Ce fichier contient un modèle : il centralise les requêtes SQL et les opérations liées à une table de la base de données.
 */
namespace App\Models;

use App\Core\Model;

/* Sorties financières générales : dépenses de fonctionnement et autres décaissements. */
final class FinanceExit extends Model
{
    protected string $table = 'finance_exits';

    public function recent(int $limit = 100): array
    {
        $stmt = $this->db->prepare("SELECT fx.*, u.name AS created_by_name
            FROM finance_exits fx
            LEFT JOIN users u ON u.id=fx.created_by
            ORDER BY fx.operation_date DESC, fx.id DESC
            LIMIT :limit");
        $stmt->bindValue('limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function search(string $q): array
    {
        $stmt = $this->db->prepare("SELECT * FROM finance_exits
            WHERE label LIKE :q_label OR category LIKE :q_category OR beneficiary LIKE :q_beneficiary OR reference LIKE :q_reference
            ORDER BY operation_date DESC LIMIT 50");
        $like = '%' . $q . '%';
        $stmt->execute([
            'q_label' => $like,
            'q_category' => $like,
            'q_beneficiary' => $like,
            'q_reference' => $like,
        ]);
        return $stmt->fetchAll();
    }
}
