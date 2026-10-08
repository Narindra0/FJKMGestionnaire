<?php
/*
 | Commentaire technique
 | Ce fichier contient un contrôleur MVC : rapports du dashboard React, exportés en CSV et PDF via ExportService.
 */
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;
use App\Services\ExportService;
use App\Services\FinanceService;

/* API rapports : données consolidées + export CSV/PDF pour la page React Rapports. */
final class ReportApiController extends Controller
{
    public function index(): void
    {
        [$from, $to, $type, $q] = $this->filters();
        $finance = new FinanceService();
        $this->json([
            'success' => true,
            'period' => ['from' => $from, 'to' => $to],
            'type' => $type,
            'totals' => $finance->displayTotals($type, $from, $to, $q),
            'rows' => $this->rowsForType($type, $from, $to, $q),
        ]);
    }

    public function export(): void
    {
        [$from, $to, $type, $q] = $this->filters();
        $format = strtolower((string)($_GET['format'] ?? 'csv'));

        if ($format === 'pdf') {
            $finance = new FinanceService();
            $totals = $finance->displayTotals($type, $from, $to, $q);
            $html = '<h1>FJKM MALAZA GILEADA</h1><h2>GESTION D\'OBLIGATION AU SEIN D\'EGLISE FJKM MALAZA GILEADA</h2>'
                . '<p>Période : ' . e($from) . ' au ' . e($to) . '</p><h3>Rapport ' . e($type) . '</h3>'
                . '<table><thead><tr><th>Total entrée</th><th>Total sortie</th><th>Solde / reste</th></tr></thead><tbody><tr>'
                . '<td>' . money_mga($totals['entries']) . '</td><td>' . money_mga($totals['exits']) . '</td><td>' . money_mga($totals['balance']) . '</td>'
                . '</tr></tbody></table><h3>Détails</h3>' . $this->genericRowsHtml($this->rowsForType($type, $from, $to, $q));
            (new ExportService())->printablePdf('rapport-' . $type, $html);
            return;
        }

        (new ExportService())->csv('rapport-' . $type . '.csv',
            $this->rowsForType($type, $from, $to, $q),
            ['type' => 'Type', 'date' => 'Date', 'label' => 'Libellé', 'category' => 'Catégorie', 'amount' => 'Montant']);
    }

    private function filters(): array
    {
        $from = (string)($_GET['from'] ?? date('Y-m-01'));
        $to = (string)($_GET['to'] ?? date('Y-m-t'));
        $type = (string)($_GET['type'] ?? 'general');
        $q = trim((string)($_GET['q'] ?? ''));
        return [$from, $to, $type, $q];
    }

    private function rowsForType(string $type, string $from, string $to, string $q = ''): array
    {
        $rows = [];
        if ($type === 'general' || $type === 'entree') foreach ($this->entries($from, $to) as $r) $rows[] = ['type' => 'ENTREE', 'date' => $r['operation_date'], 'label' => $r['reference'] . ' - ' . $r['label'], 'category' => $r['category'] . ' / ' . $r['payment_method'], 'amount' => $r['amount']];
        if ($type === 'general' || $type === 'obligation') foreach ($this->obligations($from, $to) as $r) $rows[] = ['type' => 'OBLIGATION', 'date' => substr((string)$r['created_at'], 0, 10), 'label' => $r['matricule'] . ' - ' . $r['full_name'], 'category' => $r['period_name'] . ' / ' . $r['status'], 'amount' => $r['amount_paid']];
        if ($type === 'general' || $type === 'communion') foreach ($this->communionEntries($from, $to) as $r) $rows[] = ['type' => 'COMMUNION', 'date' => $r['payment_date'], 'label' => $r['matricule'] . ' - ' . $r['full_name'], 'category' => month_name((int)$r['paid_month']) . ' ' . $r['paid_year'], 'amount' => $r['amount']];
        if ($type === 'general') foreach ($this->projectPayments($from, $to) as $r) $rows[] = ['type' => 'PROJET', 'date' => $r['payment_date'], 'label' => $r['reference'] . ' - ' . $r['name'], 'category' => $r['status'], 'amount' => $r['amount']];
        if ($type === 'general' || $type === 'sortie') foreach ($this->exits($from, $to) as $r) $rows[] = ['type' => 'SORTIE', 'date' => $r['operation_date'], 'label' => $r['reference'] . ' - ' . $r['label'], 'category' => $r['category'] . ' / ' . $r['beneficiary'], 'amount' => $r['amount']];
        if ($type === 'projet') foreach ($this->projects($from, $to) as $r) $rows[] = ['type' => 'PROJET', 'date' => $r['start_date'] ?: substr((string)$r['created_at'], 0, 10), 'label' => $r['reference'] . ' - ' . $r['name'], 'category' => $r['status'], 'amount' => ($r['collected_amount'] ?? 0)];
        if ($type === 'christiane') foreach ($this->fideles($from, $to) as $r) $rows[] = ['type' => 'CHRISTIANE', 'date' => substr((string)$r['created_at'], 0, 10), 'label' => $r['matricule'] . ' - ' . $r['full_name'], 'category' => $r['status'], 'amount' => 0];
        return $this->filterRows($rows, $q);
    }

    private function filterRows(array $rows, string $q): array
    {
        $q = trim(mb_strtolower($q));
        if ($q === '') return $rows;
        return array_values(array_filter($rows, function (array $row) use ($q): bool {
            foreach ($row as $value) {
                if (is_scalar($value) && str_contains(mb_strtolower((string)$value), $q)) return true;
            }
            return false;
        }));
    }

    private function entries(string $from, string $to): array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM finance_entries WHERE operation_date BETWEEN :from AND :to ORDER BY operation_date DESC, id DESC');
        $stmt->execute(compact('from', 'to'));
        return $stmt->fetchAll();
    }

    private function exits(string $from, string $to): array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM finance_exits WHERE operation_date BETWEEN :from AND :to ORDER BY operation_date DESC, id DESC');
        $stmt->execute(compact('from', 'to'));
        return $stmt->fetchAll();
    }

    private function obligations(string $from, string $to): array
    {
        // Filtre sur la période de l'obligation (mois/année) via year*12+month pour une plage correcte.
        $fromSeq = (int)date('Y', strtotime($from)) * 12 + (int)date('m', strtotime($from));
        $toSeq = (int)date('Y', strtotime($to)) * 12 + (int)date('m', strtotime($to));
        $stmt = Database::connection()->prepare("SELECT o.*, f.full_name, f.matricule,
                CONCAT(CASE o.period_month WHEN 1 THEN 'Janvier' WHEN 2 THEN 'Février' WHEN 3 THEN 'Mars' WHEN 4 THEN 'Avril' WHEN 5 THEN 'Mai' WHEN 6 THEN 'Juin' WHEN 7 THEN 'Juillet' WHEN 8 THEN 'Août' WHEN 9 THEN 'Septembre' WHEN 10 THEN 'Octobre' WHEN 11 THEN 'Novembre' WHEN 12 THEN 'Décembre' ELSE 'Mois' END, ' ', o.period_year) AS period_name
            FROM obligations o JOIN fideles f ON f.id=o.fidel_id
            WHERE (o.period_year * 12 + o.period_month) BETWEEN :from_seq AND :to_seq
            ORDER BY o.period_year DESC, o.period_month DESC, o.id DESC");
        $stmt->execute(['from_seq' => $fromSeq, 'to_seq' => $toSeq]);
        return $stmt->fetchAll();
    }

    private function communionEntries(string $from, string $to): array
    {
        $stmt = Database::connection()->prepare('SELECT cp.*, f.full_name, f.matricule FROM communion_payments cp JOIN fideles f ON f.id=cp.fidel_id WHERE cp.payment_date BETWEEN :from AND :to ORDER BY cp.payment_date DESC, cp.id DESC');
        $stmt->execute(compact('from', 'to'));
        return $stmt->fetchAll();
    }

    private function projectPayments(string $from, string $to): array
    {
        $stmt = Database::connection()->prepare('SELECT pp.*, p.reference, p.name, p.budget, p.collected_amount, p.start_date, p.end_date, p.status, p.description AS project_description FROM project_payments pp JOIN projects p ON p.id=pp.project_id WHERE pp.payment_date BETWEEN :from AND :to ORDER BY pp.payment_date DESC, pp.id DESC');
        $stmt->execute(compact('from', 'to'));
        return $stmt->fetchAll();
    }

    private function projects(string $from, string $to): array
    {
        $stmt = Database::connection()->prepare("SELECT *, GREATEST(budget-COALESCE(collected_amount,0),0) AS rest_amount FROM projects WHERE (start_date BETWEEN :from AND :to) OR (DATE(created_at) BETWEEN :from2 AND :to2) ORDER BY id DESC");
        $stmt->execute(['from' => $from, 'to' => $to, 'from2' => $from, 'to2' => $to]);
        return $stmt->fetchAll();
    }

    private function fideles(string $from, string $to): array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM fideles WHERE DATE(created_at) BETWEEN :from AND :to ORDER BY full_name ASC');
        $stmt->execute(compact('from', 'to'));
        return $stmt->fetchAll();
    }

    private function genericRowsHtml(array $rows): string
    {
        $total = 0;
        $html = '<table><thead><tr><th>Type</th><th>Date</th><th>Libellé</th><th>Catégorie</th><th>Montant</th></tr></thead><tbody>';
        foreach ($rows as $r) {
            $total += (float)$r['amount'];
            $html .= '<tr><td>' . e($r['type']) . '</td><td>' . e($r['date']) . '</td><td>' . e($r['label']) . '</td><td>' . e($r['category']) . '</td><td>' . money_mga($r['amount']) . '</td></tr>';
        }
        return $html . '</tbody><tfoot><tr><th colspan="4">Montant total</th><th>' . money_mga($total) . '</th></tr></tfoot></table>';
    }
}
