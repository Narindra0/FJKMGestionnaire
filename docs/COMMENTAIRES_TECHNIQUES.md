# Commentaires techniques — corrections finales FJKM

## Rôles
- `ADMIN` : consultation, rapports et gestion des accès. Il ne saisit pas les opérations financières.
- `USER` : saisie des données : finances, fidèles, obligations, communion, projets et import Excel.
- `VISITEUR` : dashboard, recherche fidèle et rapports seulement.

## Références automatiques
Le service `ReferenceService` lit la dernière référence d’une table autorisée puis génère la suivante. Les champs de référence affichés dans les formulaires sont en lecture seule pour éviter les doublons et les modifications manuelles.

## Communion
La communion est séparée des finances générales :
- entrées dans `communion_payments` ;
- sorties dans `communion_exits` ;
- période `monthly` ou `annual` ;
- dashboard et rapports séparés : entrée, sortie, reste.

## Import Excel
Le service `ExcelImportService` refuse les imports si les noms de colonnes ne correspondent pas à la table choisie. Cette règle est stricte pour éviter une base incohérente.

## Notifications
Les formulaires utilisent `required`, `invalid-feedback` et un contrôle JavaScript dans `public/assets/js/app.js`. Si un champ obligatoire est vide, l’utilisateur reçoit un message clair.

## Design
Le fichier `public/assets/css/app.css` centralise le style : responsive, cartes, boutons, tableaux, champs, page login, mode sombre et zone communion.
