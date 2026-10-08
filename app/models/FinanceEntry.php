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

    public function listPaginated(int $page = 1, int $limit = 20, string $search = '', ?string $startDate = null, ?string $endDate = null): array
    {
        $offset = ($page - 1) * $limit;
        $sql = "SELECT fe.*, u.name AS created_by_name
            FROM finance_entries fe
            LEFT JOIN users u ON u.id=fe.created_by
            WHERE 1=1";
        $params = [];

        if ($search !== '') {
            $sql .= " AND (fe.label LIKE :search OR fe.category LIKE :search OR fe.reference LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }

        if ($startDate !== null) {
            $sql .= " AND fe.operation_date >= :start_date";
            $params['start_date'] = $startDate;
        }

        if ($endDate !== null) {
            $sql .= " AND fe.operation_date <= :end_date";
            $params['end_date'] = $endDate;
        }

        $sql .= " ORDER BY fe.operation_date DESC, fe.id DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function count(string $search = '', ?string $startDate = null, ?string $endDate = null): int
    {
        $sql = "SELECT COUNT(*) FROM finance_entries WHERE 1=1";
        $params = [];

        if ($search !== '') {
            $sql .= " AND (label LIKE :search OR category LIKE :search OR reference LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }

        if ($startDate !== null) {
            $sql .= " AND operation_date >= :start_date";
            $params['start_date'] = $startDate;
        }

        if ($endDate !== null) {
            $sql .= " AND operation_date <= :end_date";
            $params['end_date'] = $endDate;
        }

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        return (int)$stmt->fetchColumn();
    }
}
