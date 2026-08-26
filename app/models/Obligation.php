<?php
/*
 | Commentaire technique
 | Ce fichier contient un modèle : il centralise les requêtes SQL et les opérations liées à une table de la base de données.
 */
namespace App\Models;

use App\Core\Model;

final class Obligation extends Model
{
    protected string $table = 'obligations';

    public function list(): array
    {
        return $this->db->query("SELECT o.*, f.matricule, f.full_name,
                CONCAT(CASE o.period_month
                    WHEN 1 THEN 'Janvier' WHEN 2 THEN 'Février' WHEN 3 THEN 'Mars'
                    WHEN 4 THEN 'Avril' WHEN 5 THEN 'Mai' WHEN 6 THEN 'Juin'
                    WHEN 7 THEN 'Juillet' WHEN 8 THEN 'Août' WHEN 9 THEN 'Septembre'
                    WHEN 10 THEN 'Octobre' WHEN 11 THEN 'Novembre' WHEN 12 THEN 'Décembre'
                    ELSE 'Mois' END, ' ', o.period_year) AS period_name
            FROM obligations o
            JOIN fideles f ON f.id=o.fidel_id
            ORDER BY o.created_at DESC, o.id DESC")->fetchAll();
    }

    public function findOpenForFidel(int $fidelId, ?int $month = null, ?int $year = null): ?array
    {
        $where = "o.fidel_id = :fidel_id AND o.status IN ('unpaid','partial')";
        $params = ['fidel_id' => $fidelId];
        if ($month && $year) {
            $where .= " AND o.period_month = :month AND o.period_year = :year";
            $params['month'] = $month;
            $params['year'] = $year;
        }

        $stmt = $this->db->prepare("SELECT o.*, f.matricule, f.full_name,
                (o.amount_due - o.amount_paid) AS rest_amount
            FROM obligations o
            JOIN fideles f ON f.id=o.fidel_id
            WHERE {$where}
            ORDER BY o.id DESC
            LIMIT 1");
        $stmt->execute($params);
        return $stmt->fetch() ?: null;
    }

    public function findPaidForFidelPeriod(int $fidelId, int $month, int $year, ?int $excludeId = null): ?array
    {
        $sql = "SELECT * FROM obligations WHERE fidel_id=:fidel_id AND period_month=:month AND period_year=:year AND status='paid'";
        $params = ['fidel_id'=>$fidelId,'month'=>$month,'year'=>$year];
        if ($excludeId) { $sql .= " AND id <> :exclude_id"; $params['exclude_id'] = $excludeId; }
        $sql .= " LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch() ?: null;
    }

    public function findForFidelPeriod(int $fidelId, int $month, int $year): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM obligations WHERE fidel_id=:fidel_id AND period_month=:month AND period_year=:year ORDER BY id DESC LIMIT 1");
        $stmt->execute(['fidel_id'=>$fidelId,'month'=>$month,'year'=>$year]);
        return $stmt->fetch() ?: null;
    }

    public function findWithFidel(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT o.*, f.matricule, f.full_name,
                (o.amount_due - o.amount_paid) AS rest_amount
            FROM obligations o
            JOIN fideles f ON f.id=o.fidel_id
            WHERE o.id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function recordPayment(int $obligationId, int $fidelId, float $amount, string $paymentDate, ?int $createdBy, string $note = ''): void
    {
        $stmt = $this->db->prepare("INSERT INTO obligation_payments(obligation_id, fidel_id, amount, payment_date, note, created_by, created_at)
            VALUES(:obligation_id, :fidel_id, :amount, :payment_date, :note, :created_by, :created_at)");
        $stmt->execute([
            'obligation_id' => $obligationId,
            'fidel_id' => $fidelId,
            'amount' => $amount,
            'payment_date' => $paymentDate,
            'note' => $note,
            'created_by' => $createdBy,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }


    /**
     * Retourne les derniers paiements/adidy d'un chrétien pour affichage instantané
     * lorsque l'utilisateur tape le matricule.
     */
    public function historyForFidel(int $fidelId, int $limit = 24): array
    {
        $stmt = $this->db->prepare("SELECT o.*,
                CONCAT(CASE o.period_month
                    WHEN 1 THEN 'Janvier' WHEN 2 THEN 'Février' WHEN 3 THEN 'Mars'
                    WHEN 4 THEN 'Avril' WHEN 5 THEN 'Mai' WHEN 6 THEN 'Juin'
                    WHEN 7 THEN 'Juillet' WHEN 8 THEN 'Août' WHEN 9 THEN 'Septembre'
                    WHEN 10 THEN 'Octobre' WHEN 11 THEN 'Novembre' WHEN 12 THEN 'Décembre'
                    ELSE 'Mois' END, ' ', o.period_year) AS period_name,
                (o.amount_due - o.amount_paid) AS rest_amount,
                MAX(op.payment_date) AS last_payment_date
            FROM obligations o
            LEFT JOIN obligation_payments op ON op.obligation_id = o.id
            WHERE o.fidel_id = :fidel_id
            GROUP BY o.id
            ORDER BY o.period_year DESC, o.period_month DESC, o.id DESC
            LIMIT :limit");
        $stmt->bindValue('fidel_id', $fidelId, \PDO::PARAM_INT);
        $stmt->bindValue('limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Aligne l'historique des versements avec le total corrigé depuis le formulaire.
     * Sans cet alignement, le montant affiché dans l'obligation et l'entrée générale
     * pourraient diverger après une modification.
     */
    public function syncRecordedPayments(int $obligationId, int $fidelId, float $targetTotal, string $paymentDate, ?int $createdBy): void
    {
        $targetTotal = max(0, round($targetTotal, 2));
        $paymentDate = preg_match('/^\d{4}-\d{2}-\d{2}$/', $paymentDate) ? $paymentDate : date('Y-m-d');
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare("SELECT id, amount FROM obligation_payments WHERE obligation_id = :id ORDER BY payment_date DESC, id DESC");
            $stmt->execute(['id' => $obligationId]);
            $payments = $stmt->fetchAll();
            $current = 0.0;
            foreach ($payments as $payment) $current += (float)$payment['amount'];
            $difference = round($targetTotal - $current, 2);

            if ($difference > 0) {
                $this->recordPayment($obligationId, $fidelId, $difference, $paymentDate, $createdBy, 'Ajustement après modification');
            } elseif ($difference < 0) {
                $toRemove = abs($difference);
                foreach ($payments as $payment) {
                    if ($toRemove <= 0) break;
                    $amount = (float)$payment['amount'];
                    if ($amount <= $toRemove + 0.00001) {
                        $del = $this->db->prepare("DELETE FROM obligation_payments WHERE id = :id");
                        $del->execute(['id' => $payment['id']]);
                        $toRemove = round($toRemove - $amount, 2);
                    } else {
                        $upd = $this->db->prepare("UPDATE obligation_payments SET amount = :amount, note = :note WHERE id = :id");
                        $upd->execute([
                            'amount' => round($amount - $toRemove, 2),
                            'note' => 'Ajustement après modification',
                            'id' => $payment['id'],
                        ]);
                        $toRemove = 0.0;
                    }
                }
            }
            $this->db->commit();
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            throw $e;
        }
    }

    public function payments(int $obligationId): array
    {
        $stmt = $this->db->prepare("SELECT op.*, u.name AS created_by_name
            FROM obligation_payments op
            LEFT JOIN users u ON u.id=op.created_by
            WHERE op.obligation_id = :id
            ORDER BY op.payment_date DESC, op.id DESC");
        $stmt->execute(['id' => $obligationId]);
        return $stmt->fetchAll();
    }
}
