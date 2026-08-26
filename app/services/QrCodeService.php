<?php
/*
 | Commentaire technique
 | Ce fichier contient un service métier : il regroupe des traitements réutilisables afin de garder les contrôleurs plus simples et plus lisibles.
 */
namespace App\Services;

final class QrCodeService
{
    public function memberPayload(array $fidel): string
    {
        return json_encode([
            'matricule' => $fidel['matricule'] ?? '',
            'nom' => $fidel['full_name'] ?? '',
            'eglise' => 'FJKM MALAZA GILEADA',
        ], JSON_UNESCAPED_UNICODE);
    }

    public function svgDataUri(string $payload): string
    {
        if (class_exists('Endroid\\QrCode\\Builder\\Builder')) {
            $result = \Endroid\QrCode\Builder\Builder::create()->data($payload)->size(220)->margin(10)->build();
            return $result->getDataUri();
        }
        $hash = hash('sha256', $payload);
        $size = 21; $cell = 8; $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="168" height="168" viewBox="0 0 168 168"><rect width="168" height="168" fill="#fff"/>';
        for ($y=0; $y<$size; $y++) {
            for ($x=0; $x<$size; $x++) {
                $i = ($x+$y*$size) % strlen($hash);
                $on = hexdec($hash[$i]) % 2 === 0 || ($x < 7 && $y < 7) || ($x > 13 && $y < 7) || ($x < 7 && $y > 13);
                if ($on) $svg .= '<rect x="'.($x*$cell).'" y="'.($y*$cell).'" width="'.$cell.'" height="'.$cell.'" fill="#0d47a1"/>';
            }
        }
        $svg .= '</svg>';
        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }
}
