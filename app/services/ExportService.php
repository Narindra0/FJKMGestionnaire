<?php
/*
 | Commentaire technique
 | Ce fichier contient un service métier : il regroupe des traitements réutilisables afin de garder les contrôleurs plus simples et plus lisibles.
 */
namespace App\Services;

final class ExportService
{
    public function csv(string $filename, array $rows, array $headers): void
    {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        echo "\xEF\xBB\xBF";
        $out = fopen('php://output', 'w');
        fputcsv($out, $headers, ';');
        foreach ($rows as $row) {
            fputcsv($out, array_map(fn($h) => $row[$h] ?? '', array_keys($headers)), ';');
        }
        fclose($out);
        exit;
    }

    public function printablePdf(string $title, string $html): void
    {
        if (class_exists('Dompdf\\Dompdf')) {
            $dompdf = new \Dompdf\Dompdf(['isRemoteEnabled' => true]);
            $dompdf->loadHtml('<meta charset="utf-8"><style>body{font-family:DejaVu Sans,sans-serif;font-size:12px;color:#111}h1,h2,h3,p{text-align:center;margin:4px 0}table{width:100%;border-collapse:collapse;margin-top:10px}thead{display:table-header-group}tfoot{display:table-footer-group}th,td{border:1px solid #555;padding:6px;vertical-align:top}th{background:#eaf2ff;font-weight:bold}</style>' . $html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();
            $dompdf->stream($title . '.pdf');
            exit;
        }

        header('Content-Type: text/html; charset=utf-8');
        echo '<!doctype html><html><head><meta charset="utf-8"><title>' . htmlspecialchars($title) . '</title>';
        echo '<style>body{font-family:Arial;padding:30px}h1,h2,h3,p{text-align:center;margin:4px 0}table{width:100%;border-collapse:collapse;margin-top:10px}thead{display:table-header-group}tfoot{display:table-footer-group}th,td{border:1px solid #555;padding:8px}th{background:#eaf2ff}@media print{button{display:none}}</style></head><body>';
        echo '<button onclick="window.print()">Imprimer / Enregistrer en PDF</button>';
        echo $html . '<script>setTimeout(()=>window.print(),600)</script></body></html>';
        exit;
    }
}
