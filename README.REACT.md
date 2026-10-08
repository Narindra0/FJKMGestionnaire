# FJKM Gestionnaire - React Frontend

## 🚀 Démarrage rapide

### Prérequis
- PHP 8.2+
- MySQL / MariaDB
- Node.js 18+
- Composer (optionnel)

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd FJKMGestionnaire
```

2. **Configurer la base de données**
```bash
# Importer le schéma
mysql -u root -p < Database/fjkm_obligation.sql
```

3. **Installer les dépendances PHP**
```bash
composer install
```

4. **Installer les dépendances React**
```bash
cd public/react-app
npm install
```

### Démarrage en développement

**Option 1 : Backend PHP + Frontend React (recommandé)**

Terminal 1 - Backend PHP :
```bash
php -S localhost:8000 router.react.php
```

Terminal 2 - Frontend React :
```bash
cd public/react-app
npm run dev
```

Accès : http://localhost:3000

**Option 2 : Ancienne interface PHP uniquement**
```bash
php -S localhost:8000
```

Accès : http://localhost:8000

### Build pour production

```bash
cd public/react-app
npm run build
```

Le build sera généré dans `public/react/dist/`.

### Déploiement sur Render

1. Configurer les variables d'environnement dans `render.react.yaml`
2. Pousser le code sur GitHub
3. Créer un nouveau service sur Render avec `render.react.yaml`
4. Le build React sera automatique pendant le déploiement Docker

## 📁 Structure

```
FJKMGestionnaire/
├── app/                    # Backend PHP MVC
│   ├── controllers/       # Contrôleurs + API REST
│   ├── models/           # Modèles de base de données
│   └── views/            # Vues PHP (ancienne interface)
├── public/
│   ├── react-app/        # Application React
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.css
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── react/            # Build React (généré)
├── Database/              # Schéma SQL
├── routes/                # Routes PHP et API
└── render.react.yaml      # Configuration Render
```

## 🔌 API REST

L'API est accessible sur `/api/*` :

- Authentification : `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- Finances : `/api/entries`, `/api/exits`
- Chrétiens : `/api/fideles`
- Obligations : `/api/obligations`
- Communion : `/api/communion`
- Projets : `/api/projects`
- Administration : `/api/users`, `/api/logs`
- Dashboard : `/api/dashboard/stats`

Voir `REACT_MIGRATION_GUIDE.md` pour la documentation complète.

## 🎨 Composants React

L'application React utilise :
- **React 18** - Framework UI
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Styling utilitaire
- **Lucide React** - Icônes modernes
- **Sonner** - Notifications toast
- **Axios** - Client HTTP (via fetch natif)

## 🐛 Dépannage

### Erreur "php: command not found"
PHP n'est pas installé. Installez PHP 8.2+ ou utilisez Docker.

### Erreur de connexion API
Vérifiez que le serveur PHP tourne sur le port 8000.

### Erreur de build React
Supprimez `node_modules` et `package-lock.json`, puis relance `npm install`.

### Variables d'environnement
Configurez-les dans `.env` ou dans le dashboard Render.

## 📝 Licence

Ce projet est développé pour FJKM Malaza Gileada.

---

**Développement :** Narindra Ranjalahy
**Version :** 1.0.0 React Migration
