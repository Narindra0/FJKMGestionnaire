# Correctif final – Communion : grille des 12 mois

## Objectif

Uniformiser l'affichage des 12 mois dans le formulaire Communion afin d'éviter une présentation désordonnée ou trop étalée.

## Corrections appliquées

- Ajout d'une classe spécifique `communion-month-grid` sur la grille des mois.
- Maintien de l'affichage en 4 colonnes sur ordinateur et tablette.
- Réduction de la hauteur des cases pour ne pas forcer la page.
- Uniformisation des cases : même hauteur, même alignement, même espacement.
- Adaptation responsive : 2 colonnes sur téléphone, 1 colonne sur très petit écran.
- Mise à jour de la version du cache PWA afin de charger le nouveau style.

## Fichiers concernés

- `app/views/communion/index.php`
- `public/assets/css/app.css`
- `public/service-worker.js`
