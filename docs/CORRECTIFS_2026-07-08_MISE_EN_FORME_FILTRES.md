# Correctifs du 08/07/2026 — Mise en forme des filtres et rapports

## Objectif
Uniformiser l'affichage des zones de filtre et d'impression afin d'obtenir une interface claire sur PC, tablette et téléphone.

## Éléments corrigés

- Tableau de bord : alignement compact de Ré-afficher, Rapport, Du, Au, Recherche historique, Filtrer, Voir rapport et Exporter PDF.
- Rapports : alignement compact de Ré-afficher, Rapport, Du, Au, Recherche historique, Filtrer, Voir rapport, Exporter PDF et Exporter Excel.
- Entrée : alignement des boutons Ré-afficher, recherche entre deux dates, recherche par matricule/nom/libellé et impression.
- Sortie : alignement des boutons Ré-afficher, recherche entre deux dates, recherche par matricule/nom/libellé et impression.
- Obligation : alignement identique au module Projet, avec filtre par période, dates, recherche et impression.
- Communion : alignement identique au module Projet, avec filtre par période, dates, recherche et impression.
- Christiane : alignement identique au module Projet, avec filtre par période, dates, recherche et impression.
- Sélection des mois : disposition en 4 colonnes sur PC/tablette, afin de limiter la hauteur occupée dans la page.

## Fichiers modifiés

- `app/views/dashboards/_cards.php`
- `app/views/reports/index.php`
- `app/views/finances/entries.php`
- `app/views/finances/exits.php`
- `app/views/obligations/index.php`
- `app/views/communion/index.php`
- `app/views/fideles/index.php`
- `public/assets/css/app.css`
- `public/service-worker.js`

## Vérifications réalisées

- Syntaxe PHP : tous les fichiers PHP sont valides.
- Syntaxe JavaScript : `app.js`, `dashboard.js` et `service-worker.js` sont valides.
- Test navigateur local : la page `/login` répond correctement et `/dashboard` redirige vers la connexion si l'utilisateur n'est pas connecté.

> Remarque : le test complet avec base de données MySQL/XAMPP doit être réalisé sur l'ordinateur d'installation, car le serveur MySQL n'est pas actif dans l'environnement de correction.
