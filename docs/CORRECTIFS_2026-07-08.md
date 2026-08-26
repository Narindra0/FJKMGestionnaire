# Correctifs du 08/07/2026 — Module Projet

## Objectif
Finaliser le module **Projet** afin qu'il reste lisible et utilisable sur ordinateur, tablette/iPad et téléphone.

## Modifications appliquées

- Réorganisation responsive de la vue `app/views/projects/index.php`.
- Ajout de commentaires en français dans la vue Projet, le contrôleur Projet, le JavaScript et la feuille CSS.
- Harmonisation des champs, boutons, filtres, dates, recherche et actions.
- Ajout d'un conteneur responsive autour du tableau des projets.
- Affichage mobile du tableau sous forme de cartes afin d'éviter les débordements horizontaux.
- Maintien des filtres par période, dates, recherche, bouton Ré-afficher et impression.
- Mise à jour du cache-busting CSS/JS dans le layout principal.

## Fichiers principalement modifiés

- `app/views/projects/index.php`
- `app/controllers/ProjectController.php`
- `public/assets/css/app.css`
- `public/assets/js/app.js`
- `app/views/layouts/main.php`

## Vérification recommandée

Tester le module Projet sur :

1. PC ou ordinateur portable ;
2. tablette/iPad ;
3. téléphone ;
4. création de projet par ADMIN ;
5. paiement partiel d'un projet ;
6. filtre par mois, date et recherche ;
7. bouton Ré-afficher ;
8. impression d'une ligne et impression du tableau filtré.
