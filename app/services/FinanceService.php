<?php
/*
 | Commentaire technique
 | Ce fichier contient un service métier : il regroupe des traitements réutilisables afin de garder les contrôleurs plus simples et plus lisibles.
 */
namespace App\Services;

use App\Core\Database;

/*
 |--------------------------------------------------------------------------
 | Service financier
 |--------------------------------------------------------------------------
 | Calcule les totaux, les soldes, les séries mensuelles et les activités.
 | Correction demandée : l'entrée communion est désormais intégrée dans la
 | recette générale. Les sorties communion sont saisies dans Sorties avec la
 | catégorie Communion, donc elles sont déjà incluses dans les sorties générales.
 */
final class FinanceService
{
    public function totals(?string $from = null, ?string $to = null): array
    {
        $db = Database::connection();
        [$whereOp, $paramsOp] = $this->dateWhere($from, $to, 'operation_date');
        [$wherePay, $paramsPay] = $this->dateWhere($from, $to, 'payment_date');

        // Requêtes séparées : PDO gère mieux les paramètres nommés identiques
        // quand ils sont dans des requêtes indépendantes plutôt que dans des sous-requêtes.
        $in = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM finance_entries WHERE {$whereOp}");
        $in->execute($paramsOp);

        $communionIn = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM communion_payments WHERE {$wherePay}");
        $communionIn->execute($paramsPay);

        $obligationIn = $db->prepare("SELECT COALESCE(SUM(op.amount),0)
            FROM obligation_payments op
            INNER JOIN obligations o ON o.id = op.obligation_id
            WHERE op.payment_date >= COALESCE(:from_obl, '0000-01-01') AND op.payment_date <= COALESCE(:to_obl, '9999-12-31')");
        $obligationIn->execute(['from_obl' => $from, 'to_obl' => $to]);

        $projectIn = $db->prepare("SELECT COALESCE(SUM(pp.amount),0)
            FROM project_payments pp
            INNER JOIN projects p ON p.id = pp.project_id
            WHERE pp.payment_date >= COALESCE(:from_proj, '0000-01-01') AND pp.payment_date <= COALESCE(:to_proj, '9999-12-31')");
        $projectIn->execute(['from_proj' => $from, 'to_proj' => $to]);

        $out = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM finance_exits WHERE {$whereOp}");
        $out->execute($paramsOp);

        $entries = (float)$in->fetchColumn() + (float)$communionIn->fetchColumn() + (float)$obligationIn->fetchColumn() + (float)$projectIn->fetchColumn();
        $exits = (float)$out->fetchColumn();
        return ['entries' => $entries, 'exits' => $exits, 'balance' => $entries - $exits];
    }

    public function entriesForDashboard(string $type, ?string $from = null, ?string $to = null, string $q = ''): float
    {
        $type = strtolower($type ?: 'general');
        $q = trim($q);

        return match ($type) {
            'entree' => $this->sumFinanceEntries($from, $to, $q),
            'obligation' => $this->sumObligations($from, $to, $q),
            'communion' => $this->sumCommunion($from, $to, $q),
            'projet' => $this->sumProjects($from, $to, $q),
            'general' => $q !== ''
                ? $this->sumFinanceEntries($from, $to, $q)
                    + $this->sumObligations($from, $to, $q)
                    + $this->sumCommunion($from, $to, $q)
                    + $this->sumProjects($from, $to, $q)
                : $this->totals($from, $to)['entries'],
            default => $this->totals($from, $to)['entries'],
        };
    }

    public function displayTotals(string $type, ?string $from = null, ?string $to = null, string $q = ''): array
    {
        $totals = $this->totals($from, $to);
        $totals['entries'] = $this->entriesForDashboard($type, $from, $to, $q);
        // Le reste général reste volontairement le solde global de la période.
        // Seule la carte "Entrée générale" change selon le filtre demandé.
        return $totals;
    }

    private function sumFinanceEntries(?string $from, ?string $to, string $q = ''): float
    {
        $db = Database::connection();
        [$where, $params] = $this->dateWhere($from, $to, 'operation_date');
        if ($q !== '') {
            $where .= ' AND (reference LIKE :q_ref OR label LIKE :q_label OR category LIKE :q_cat OR payment_method LIKE :q_method)';
            $like = '%' . $q . '%';
            $params += ['q_ref'=>$like,'q_label'=>$like,'q_cat'=>$like,'q_method'=>$like];
        }
        $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM finance_entries WHERE {$where}");
        $stmt->execute($params);
        return (float)$stmt->fetchColumn();
    }

    private function sumObligations(?string $from, ?string $to, string $q = ''): float
    {
        $db = Database::connection();
        [$where, $params] = $this->dateWhere($from, $to, 'op.payment_date');
        if ($q !== '') {
            $where .= ' AND (f.matricule LIKE :q_matricule OR f.full_name LIKE :q_name OR o.label LIKE :q_label OR o.status LIKE :q_status OR CAST(o.period_month AS CHAR) LIKE :q_month OR CAST(o.period_year AS CHAR) LIKE :q_year)';
            $like = '%' . $q . '%';
            $params += ['q_matricule'=>$like,'q_name'=>$like,'q_label'=>$like,'q_status'=>$like,'q_month'=>$like,'q_year'=>$like];
        }
        $stmt = $db->prepare("SELECT COALESCE(SUM(op.amount),0) FROM obligation_payments op JOIN obligations o ON o.id=op.obligation_id JOIN fideles f ON f.id=o.fidel_id WHERE {$where}");
        $stmt->execute($params);
        return (float)$stmt->fetchColumn();
    }

    private function sumCommunion(?string $from, ?string $to, string $q = ''): float
    {
        $db = Database::connection();
        [$where, $params] = $this->dateWhere($from, $to, 'cp.payment_date');
        if ($q !== '') {
            $where .= ' AND (f.matricule LIKE :q_matricule OR f.full_name LIKE :q_name OR cp.reference LIKE :q_ref OR cp.payment_method LIKE :q_method OR CAST(cp.paid_month AS CHAR) LIKE :q_month OR CAST(cp.paid_year AS CHAR) LIKE :q_year)';
            $like = '%' . $q . '%';
            $params += ['q_matricule'=>$like,'q_name'=>$like,'q_ref'=>$like,'q_method'=>$like,'q_month'=>$like,'q_year'=>$like];
        }
        $stmt = $db->prepare("SELECT COALESCE(SUM(cp.amount),0) FROM communion_payments cp JOIN fideles f ON f.id=cp.fidel_id WHERE {$where}");
        $stmt->execute($params);
        return (float)$stmt->fetchColumn();
    }

    private function sumProjects(?string $from, ?string $to, string $q = ''): float
    {
        $db = Database::connection();
        [$where, $params] = $this->dateWhere($from, $to, 'pp.payment_date');
        if ($q !== '') {
            $where .= ' AND (p.reference LIKE :q_ref OR p.name LIKE :q_name OR p.description LIKE :q_desc OR p.status LIKE :q_status OR pp.description LIKE :q_paydesc)';
            $like = '%' . $q . '%';
            $params += ['q_ref'=>$like,'q_name'=>$like,'q_desc'=>$like,'q_status'=>$like,'q_paydesc'=>$like];
        }
        $stmt = $db->prepare("SELECT COALESCE(SUM(pp.amount),0) FROM project_payments pp JOIN projects p ON p.id=pp.project_id WHERE {$where}");
        $stmt->execute($params);
        return (float)$stmt->fetchColumn();
    }

    public function communionTotals(?string $from = null, ?string $to = null): array
    {
        $db = Database::connection();
        [$whereEntry, $paramsEntry] = $this->dateWhere($from, $to, 'payment_date');
        [$whereExit, $paramsExit] = $this->dateWhere($from, $to, 'operation_date');

        $in = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM communion_payments WHERE {$whereEntry}");
        $in->execute($paramsEntry);
        $out = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM finance_exits WHERE {$whereExit} AND category LIKE '%Communion%'");
        $out->execute($paramsExit);

        $entries = (float)$in->fetchColumn();
        $exits = (float)$out->fetchColumn();
        return ['entries' => $entries, 'exits' => $exits, 'balance' => $entries - $exits];
    }

    public function monthlySeries(int $year): array
    {
        $series = ['labels' => [], 'entries' => [], 'exits' => [], 'balance' => [], 'finance_entries' => [], 'obligation_entries' => [], 'communion_entries' => [], 'project_entries' => [], 'christiane_count' => [], 'communion_exits' => [], 'communion_balance' => []];
        foreach (range(1, 12) as $m) {
            $from = sprintf('%04d-%02d-01', $year, $m);
            $to = date('Y-m-t', strtotime($from));
            $totals = $this->totals($from, $to);
            $communion = $this->communionTotals($from, $to);

            $series['labels'][] = date('M', strtotime($from));
            $series['entries'][] = $totals['entries'];
            $series['exits'][] = $totals['exits'];
            $series['balance'][] = $totals['balance'];
            $series['finance_entries'][] = $this->sumTable('finance_entries', 'operation_date', $from, $to);
            $series['obligation_entries'][] = $this->sumTable('obligation_payments', 'payment_date', $from, $to);
            $series['communion_entries'][] = $communion['entries'];
            $series['project_entries'][] = $this->sumTable('project_payments', 'payment_date', $from, $to);
            $series['christiane_count'][] = $this->countTable('fideles', 'created_at', $from, $to);
            $series['communion_exits'][] = $communion['exits'];
            $series['communion_balance'][] = $communion['balance'];
        }
        return $series;
    }

    public function recentActivities(): array
    {
        return Database::connection()
            ->query("SELECT a.*, u.name AS user_name FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.id DESC LIMIT 8")
            ->fetchAll();
    }


    private function sumTable(string $table, string $column, string $from, string $to): float
    {
        $allowed = ['finance_entries','finance_exits','obligation_payments','communion_payments','project_payments'];
        if (!in_array($table, $allowed, true)) return 0.0;
        $db = Database::connection();
        $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM {$table} WHERE DATE({$column}) BETWEEN :from AND :to");
        $stmt->execute(['from' => $from, 'to' => $to]);
        return (float)$stmt->fetchColumn();
    }

    private function countTable(string $table, string $column, string $from, string $to): int
    {
        if ($table !== 'fideles') return 0;
        $db = Database::connection();
        $stmt = $db->prepare("SELECT COUNT(*) FROM {$table} WHERE DATE({$column}) BETWEEN :from AND :to");
        $stmt->execute(['from' => $from, 'to' => $to]);
        return (int)$stmt->fetchColumn();
    }

    private function dateWhere(?string $from, ?string $to, string $column): array
    {
        $where = '1=1';
        $params = [];
        if ($from) { $where .= " AND {$column} >= :from"; $params['from'] = $from; }
        if ($to) { $where .= " AND {$column} <= :to"; $params['to'] = $to; }
        return [$where, $params];
    }
}
