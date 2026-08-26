<?php
/*
 | Commentaire technique
 | Ce fichier contient un modèle : il centralise les requêtes SQL et les opérations liées à une table de la base de données.
 */
namespace App\Models;

use App\Core\Model;

/* Entrées financières générales : les recettes hors détail spécifique communion. */
final class FinanceEntry extends Model
{
    protected string $table = 'finance_entries';

    public function recent(int $limit = 100): array
    {
        $stmt = $this->db->prepare("SELECT fe.*, u.name AS created_by_name
            FROM finance_entries fe
            LEFT JOIN users u ON u.id=fe.created_by
            ORDER BY fe.operation_date DESC, fe.id DESC
            LIMIT :limit");
        $stmt->bindValue('limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function search(string $q): array
    {
        $stmt = $this->db->prepare("SELECT * FROM finance_entries
            WHERE label LIKE :q_label OR category LIKE :q_category OR payment_method LIKE :q_payment OR reference LIKE :q_reference
            ORDER BY operation_date DESC LIMIT 50");
        $like = '%' . $q . '%';
        $stmt->execute([
            'q_label' => $like,
            'q_category' => $like,
            'q_payment' => $like,
            'q_reference' => $like,
        ]);
        return $stmt->fetchAll();
    }
}
