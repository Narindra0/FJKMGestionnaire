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

    public function listPaginated(int $page = 1, int $limit = 20, string $search = '', ?string $startDate = null, ?string $endDate = null): array
    {
        $offset = ($page - 1) * $limit;
        $sql = "SELECT fx.*, u.name AS created_by_name
            FROM finance_exits fx
            LEFT JOIN users u ON u.id=fx.created_by
            WHERE 1=1";
        $params = [];

        if ($search !== '') {
            $sql .= " AND (fx.label LIKE :search OR fx.category LIKE :search OR fx.beneficiary LIKE :search OR fx.reference LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }

        if ($startDate !== null) {
            $sql .= " AND fx.operation_date >= :start_date";
            $params['start_date'] = $startDate;
        }

        if ($endDate !== null) {
            $sql .= " AND fx.operation_date <= :end_date";
            $params['end_date'] = $endDate;
        }

        $sql .= " ORDER BY fx.operation_date DESC, fx.id DESC LIMIT :limit OFFSET :offset";
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
        $sql = "SELECT COUNT(*) FROM finance_exits WHERE 1=1";
        $params = [];

        if ($search !== '') {
            $sql .= " AND (label LIKE :search OR category LIKE :search OR beneficiary LIKE :search OR reference LIKE :search)";
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
