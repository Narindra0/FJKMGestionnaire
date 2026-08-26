<?php
/*
 | Commentaire technique
 | Ce fichier contient un modèle : il centralise les requêtes SQL et les opérations liées à une table de la base de données.
 */
namespace App\Models;

use App\Core\Model;

/* Projets de l'église : paramètres ADMIN + enregistrements de paiements progressifs. */
final class Project extends Model
{
    protected string $table = 'projects';

    public function recent(): array
    {
        return $this->db->query("SELECT p.*, u.name AS created_by_name,
                GREATEST(p.budget - COALESCE(p.collected_amount,0),0) AS rest_amount
            FROM projects p
            LEFT JOIN users u ON u.id=p.created_by
            ORDER BY p.id DESC")->fetchAll();
    }

    public function availableForPayment(): array
    {
        return $this->db->query("SELECT p.*, GREATEST(p.budget - COALESCE(p.collected_amount,0),0) AS rest_amount
            FROM projects p
            WHERE p.status <> 'cancelled' AND COALESCE(p.collected_amount,0) < p.budget
            ORDER BY p.name ASC")->fetchAll();
    }

    public function addPayment(int $id, float $amount, ?string $paymentDate = null, ?string $description = null, ?string $endDate = null, ?int $createdBy = null, ?string $startDate = null): bool
    {
        $project = $this->find($id);
        if (!$project) return false;

        $budget = (float)$project['budget'];
        $current = (float)($project['collected_amount'] ?? 0);
        $newCollected = min($budget, $current + max(0, $amount));
        $status = $this->computeStatus($budget, $newCollected);
        $date = $paymentDate ?: date('Y-m-d');
        $finalEndDate = $endDate ?: (($status === 'completed' && empty($project['end_date'])) ? $date : ($project['end_date'] ?? null));
        $finalStartDate = $startDate ?: ($project['start_date'] ?: date('Y-m-d'));
        $newDescription = trim((string)($description ?? ''));
        if ($newDescription === '') $newDescription = (string)($project['description'] ?? '');

        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare("UPDATE projects
                SET collected_amount = :collected_amount,
                    status = :status,
                    description = :description,
                    start_date = :start_date,
                    end_date = :end_date,
                    updated_at = NOW()
                WHERE id = :id");
            $stmt->execute([
                'collected_amount' => $newCollected,
                'status' => $status,
                'description' => $newDescription,
                'start_date' => $finalStartDate,
                'end_date' => $finalEndDate,
                'id' => $id,
            ]);

            $insert = $this->db->prepare("INSERT INTO project_payments(project_id, amount, payment_date, description, created_by, created_at)
                VALUES(:project_id, :amount, :payment_date, :description, :created_by, NOW())");
            $insert->execute([
                'project_id' => $id,
                'amount' => $amount,
                'payment_date' => $date,
                'description' => $newDescription,
                'created_by' => $createdBy,
            ]);
            $this->db->commit();
            return true;
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            throw $e;
        }
    }

    public function payments(?string $from = null, ?string $to = null): array
    {
        $where = '1=1';
        $params = [];
        if ($from) { $where .= ' AND pp.payment_date >= :from'; $params['from'] = $from; }
        if ($to) { $where .= ' AND pp.payment_date <= :to'; $params['to'] = $to; }
        $stmt = $this->db->prepare("SELECT pp.*, p.reference, p.name, p.budget, p.collected_amount, p.start_date, p.end_date, p.status,
                GREATEST(p.budget - COALESCE(p.collected_amount,0),0) AS rest_amount
            FROM project_payments pp
            JOIN projects p ON p.id = pp.project_id
            WHERE {$where}
            ORDER BY pp.payment_date DESC, pp.id DESC");
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function computeStatus(float $budget, float $collected): string
    {
        if ($budget <= 0) return 'planned';
        if ($collected <= 0) return 'planned';
        if ($collected >= $budget) return 'completed';
        if (($collected / $budget) >= 0.80) return 'almost_completed';
        return 'ongoing';
    }

    public function updateComputedStatus(int $id): void
    {
        $p = $this->find($id);
        if (!$p) return;
        $this->update($id, ['status' => $this->computeStatus((float)$p['budget'], (float)($p['collected_amount'] ?? 0)), 'updated_at' => date('Y-m-d H:i:s')]);
    }
}
