# Guide de Migration vers React - FJKM Gestionnaire

## 📋 Résumé de la migration

### Stack Technique
- **Backend** : PHP 8.2 MVC (inchangé) avec API REST complète
- **Frontend** : React 18 + Vite + Tailwind CSS + Lucide React
- **Base de données** : MySQL (inchangée)
- **Déploiement** : Render.com + TiDB Cloud (gratuit)

### ✅ Tâches terminées

1. ✅ API REST PHP complète (40+ endpoints)
2. ✅ Projet React initialisé dans `public/react-app/`
3. ✅ Authentification React avec login/logout
4. ✅ Dashboard avec métriques et activités
5. ✅ Module Entrées financières (CRUD complet)
6. ✅ Module Sorties financières (CRUD complet)
7. ✅ Module Chrétiens (CRUD complet, avatars)
8. ✅ Module Obligations (paiements partiels, filtres)
9. ✅ Module Communion (paiements multiples, séquentialité)
10. ✅ Module Projets (budget/collecte, versements)
11. ✅ Module Rapports (génération, filtres, exports)
12. ✅ Module Administration (utilisateurs, logs)

## 📁 Structure des fichiers

### Backend PHP (modifié)
```
app/controllers/ApiController.php  - API REST complète (926 lignes)
routes/api.php                     - 40+ routes API
app/models/*.php                   - Méthodes de pagination ajoutées
```

### Frontend React (nouveau)
```
public/react-app/
├── package.json                 - Dépendances React
├── vite.config.ts              - Configuration Vite + proxy API
├── tsconfig.json                - Configuration TypeScript
├── tailwind.config.js           - Configuration Tailwind
├── postcss.config.js            - Configuration PostCSS
├── index.html                   - Point d'entrée HTML
└── src/
    ├── App.tsx                  - Application React complète (2400+ lignes)
    ├── main.tsx                 - Point d'entrée React
    └── index.css                - Styles CSS complets (1400+ lignes)
```

## 🚀 Instructions de déploiement

### 1. Prérequis
- PHP 8.2+ installé
- MySQL / MariaDB
- Node.js 18+ et npm
- Composer (optionnel pour exports PDF/Excel)

### 2. Configuration de la base de données
```bash
# Importer le schéma SQL
mysql -u root -p < Database/fjkm_obligation.sql
```

### 3. Installation des dépendances PHP
```bash
composer install
```

### 4. Installation des dépendances React
```bash
cd public/react-app
npm install
```

### 5. Démarrage en développement

**Serveur PHP (backend) :**
```bash
php -S localhost:8000
```

**Serveur React (frontend) :**
```bash
cd public/react-app
npm run dev
```

L'application React sera accessible sur `http://localhost:3000` avec proxy vers l'API PHP sur `localhost:8000`.

### 6. Build pour production

```bash
cd public/react-app
npm run build
```

Le build sera généré dans `public/dist/react/`.

## 🔌 Configuration API

L'API REST est accessible sur les endpoints suivants :

### Authentification
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur connecté
- `POST /api/auth/logout` - Déconnexion

### Finances
- `GET /api/entries` - Liste entrées (pagination + filtres)
- `POST /api/entries` - Créer entrée
- `PUT /api/entries/{id}` - Modifier entrée
- `DELETE /api/entries/{id}` - Supprimer entrée
- `GET /api/exits` - Liste sorties (pagination + filtres)
- `POST /api/exits` - Créer sortie
- `PUT /api/exits/{id}` - Modifier sortie
- `DELETE /api/exits/{id}` - Supprimer sortie

### Chrétiens
- `GET /api/fideles` - Liste chrétiens (pagination + filtres)
- `POST /api/fideles` - Créer chrétien
- `PUT /api/fideles/{id}` - Modifier chrétien
- `DELETE /api/fideles/{id}` - Supprimer chrétien

### Obligations
- `GET /api/obligations` - Liste obligations (pagination + filtres)
- `POST /api/obligations` - Créer obligation
- `PUT /api/obligations/{id}` - Modifier obligation
- `DELETE /api/obligations/{id}` - Supprimer obligation

### Communion
- `GET /api/communion` - Liste paiements communion
- `POST /api/communion` - Créer paiement(s)
- `PUT /api/communion/{id}` - Modifier paiement
- `DELETE /api/communion/{id}` - Supprimer paiement

### Projets
- `GET /api/projects` - Liste projets
- `POST /api/projects` - Créer projet
- `PUT /api/projects/{id}` - Modifier projet
- `DELETE /api/projects/{id}` - Supprimer projet
- `POST /api/projects/{id}/payments` - Ajouter versement

### Administration
- `GET /api/users` - Liste utilisateurs
- `PUT /api/users/{id}` - Modifier utilisateur
- `GET /api/logs` - Liste logs (pagination + filtres)

### Dashboard
- `GET /api/dashboard/stats` - Statistiques dashboard

## 🎨 Design et Composants

### Palette de couleurs
- Gold : `#c58b3a` (entrées, métriques positives)
- Coral : `#e8a070` (sorties, alertes)
- Navy : `#1e3a5f` (primary, fond sombre)
- Green : `#287d68` (communion, succès)
- Blue : `#3b82f6` (utilisateurs, information)
- Purple : `#8b5cf6` (statuts, badges)

### Composants UI
- **Sidebar** : Navigation avec sections regroupées
- **Topbar** : Barre supérieure avec breadcrumbs et actions
- **Modals** : Dialogs pour les formulaires de création/modification
- **Tables** : Tableaux avec pagination, filtres, actions
- **Cards** : Cartes métriques, projets, utilisateurs
- **Forms** : Formulaires avec validation et grid layout

## 🔐 Sécurité

- Toutes les routes API sont protégées par `AuthMiddleware`
- Les rôles sont respectés dans le frontend (ADMIN, USER, VISITEUR)
- Validation des entrées côté serveur et client
- Protection CSRF sur les formulaires PHP
- Sessions sécurisées

## 📦 Déploiement sur Render

### Architecture
1. **Backend PHP** : Service Docker sur Render
2. **Frontend React** : Build statique servi par PHP
3. **Base de données** : TiDB Cloud (MySQL compatible)

### Configuration Render
Le fichier `render.yaml` existe déjà. Pour le frontend React :

1. Modifier le Dockerfile pour inclure le build React
2. Configurer les variables d'environnement
3. Déployer sur Render

### Variables d'environnement nécessaires
```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-app.onrender.com
DB_HOST=...
DB_PORT=4000
DB_DATABASE=fjkm_obligation
DB_USERNAME=...
DB_PASSWORD=...
```

## 🧪 Tests à effectuer

### 1. Authentification
- [ ] Connexion avec matricule/nom/email
- [ ] Validation mot de passe (min 8 caractères)
- [ ] Déconnexion
- [ ] Session persistante

### 2. Dashboard
- [ ] Affichage des métriques financières
- [ ] Activités récentes
- [ ] Graphiques (à implémenter avec Chart.js)

### 3. Finances (Entrées/Sorties)
- [ ] Création d'entrée/sortie
- [ ] Modification (restrictions USER)
- [ ] Suppression
- [ ] Validation solde pour les sorties
- [ ] Pagination et recherche

### 4. Chrétiens
- [ ] Création chrétien
- [ ] Modification
- [ ] Suppression
- [ ] Recherche par matricule/nom/groupe
- [ ] Affichage statut

### 5. Obligations
- [ ] Enregistrement paiement
- [ ] Paiements partiels
- [ ] Filtres par statut/mois/année
- [ ] Calcul automatique du reste

### 6. Communion
- [ ] Paiement pour plusieurs mois
- [ ] Génération référence unique
- [ ] Filtres par année/mois
- [ ] Blocage années antérieures (USER)

### 7. Projets
- [ ] Création projet
- [ ] Versements
- [ ] Calcul reste automatique
- [ ] Suivi progression

### 8. Rapports
- [ ] Génération par type
- [ ] Filtres dates
- [ ] Export CSV
- [   ] Impression

### 9. Administration
- [ ] Liste utilisateurs
- [ ] Liste logs d'audit
- [ ] Filtres et pagination

## 🎯 Améliorations futures

1. **Graphiques Chart.js** : Intégrer Chart.js dans le Dashboard
2. **QR Code** : Ajouter génération QR Code pour les chrétiens
3. **Imports Excel** : Implémenter l'import Excel côté React
4. **Exports PDF** : Intégrer dompdf côté PHP pour les exports
5. **Notifications** : Système de notifications en temps réel
6. **Offline** : PWA complète avec service worker
7. **Tests E2E** : Tests automatisés avec Playwright/Cypress

## 📝 Notes importantes

- Le backend PHP reste fonctionnel et peut servir l'ancienne interface en parallèle
- La nouvelle interface React est une alternative moderne
- Les données sont partagées entre les deux interfaces via la même base de données
- Pour revenir à l'ancienne interface, commenter le proxy Vite et servir le frontend React sur un chemin différent

## 🆘 Support

En cas de problème :
1. Vérifier que PHP et MySQL sont démarrés
2. Vérifier les variables d'environnement
3. Consulter les logs PHP et React
4. Tester les endpoints API avec curl ou Postman

---

**Développé par :** Narindra Ranjalahy
**Date :** Octobre 2026
**Version :** 1.0.0 - React Migration
