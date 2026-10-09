# Spécification — Landing Page « FJKM Gestionnaire »

> **Statut** : Spécification prête pour implémentation
> **Version** : 1.0
> **Date** : 2026-10-08
> **Périmètre** : Document de spécification uniquement — **aucun fichier de code existant n'est modifié** par ce document.
> **Public cible** : développeur/designer chargé(e) de construire la page d'accueil publique.

---

## 1. Contexte & objectifs

### 1.1 Contexte

`FJKM Gestionnaire` est une application web MVC PHP 8.2 + SPA React (Vite, Tailwind CSS, lucide-react, sonner) dédiée à la gestion des obligations financières, entrées/sorties, fidèles, paiements communion, projets et rapports de la paroisse **FJKM Malaza Gileada** (Antananarivo).

Aujourd'hui, l'utilisateur atterrit directement sur l'écran de connexion. La landing page a pour but de **présenter l'outil avant l'authentification** : expliquer la valeur, rassurer sur la sécurité et guider vers la connexion.

### 1.2 Objectifs

| # | Objectif | Indicateur |
|---|---|---|
| O1 | Expliquer en < 10 s ce qu'est l'application et à qui elle s'adresse | Taux de rebond hero < 60 % |
| O2 | Convertir vers l'écran de connexion (`/login`) | Clics CTA « Se connecter » |
| O3 | Apporter une valeur quotidienne via le **Verset / Message du jour** | Temps de lecture, retour quotidien |
| O4 | Inspirer confiance (sécurité, ordre, rigueur — valeurs FJKM) | Consultations FAQ / mentions légales |
| O5 | Rester conforme aux pages légales existantes (`/confidentialite`, `/mentions-legales`) | Liens présents dans le footer |

### 1.3 Hors périmètre

- Aucune donnée sensible (montants, noms de fidèles) ne doit apparaître sur la landing.
- Pas d'authentification, pas de formulaire de contact en v1 (uniquement des liens).
- Pas de modification du design system existant : la landing **réutilise** les tokens et classes déjà en place.

---

## 2. Charte graphique

Tous les tokens sont déjà définis dans `C:\Dev\FJKMGestionnaire\public\react-app\src\index.css` (`:root`) et `tailwind.config.js`. La landing doit **s'y conformer sans les redéfinir**.

### 2.1 Palette de couleurs

| Token | Hex | Usage sur la landing |
|---|---|---|
| `--navy` | `#102a43` | Fond des sections sombres (hero alternatif, CTA final, footer), boutons primaires, titres |
| `--ink` | `#18324a` | Texte courant sur fond clair |
| `--paper` | `#fffdf9` | Fond des cartes / surfaces élevées |
| `--ivory` | `#f7f4ee` | Fond général de la page |
| `--line` | `#e8e1d7` | Bordures, séparateurs, contours de cartes |
| `--gold` | `#c58b3a` | Accent premium : eyebrows, filets, icônes highlight, verset |
| `--green` | `#287d68` | Statuts positifs, indicateur « sécurité / confiance » |
| `--coral` | `#c95c55` | Accent chaud, usage parcimonieux (max 1 section) |
| `--blue` | `#4c7198` | Liens, accents secondaires |
| `--purple` | `#7d6a98` | Accent rare (ex. module Rapports) |
| `--muted` | `#7a7f80` | Texte secondaire, légendes |

**Règles** :
- Contraste texte/cible ≥ **4.5:1** (WCAG AA) — vérifier notamment `--gold` sur `--ivory` (utiliser `--gold` en gras ou sur fond navy uniquement pour les petits textes).
- max **2 accents** par section.
- Dégradé autorisé uniquement sur le hero sombre : `radial-gradient(circle at 25% 40%, #1b4a63 0, #102a43 50%, #0d2237 100%)` (reprise du `.login-visual`).


### 2.2 Typographies

Chargement existant (Google Fonts, ne pas dupliquer) :

```
DM Sans (500, 600, 700) · Inter (400, 500, 600, 700) · IBM Plex Mono (400, 500)
```

| Rôle | Police | Réglages |
|---|---|---|
| Titres (h1, h2) | **DM Sans** 600 | `letter-spacing: -0.04em` à `-0.06em` |
| Eyebrow / surtitre | DM Sans 700 | `9px`, `uppercase`, `letter-spacing: .16em`, couleur `#a18b66` (`.eyebrow`) ou `#d9b985` (`.eyebrow.light`) |
| Texte courant | **Inter** 400 | 13–15 px, `line-height: 1.7` |
| Boutons / labels | Inter 600–700 | 11–12 px |
| Chiffres, matricules, refs de verset | **IBM Plex Mono** 400–500 | 11–12 px (classe `.mono`) |

**Échelle typographique proposée** (desktop → mobile via `clamp()`) :

| Élément | Taille | Police |
|---|---|---|
| H1 hero | `clamp(34px, 5vw, 50px)` / `line-height: 1.05` | DM Sans 600 |
| H2 de section | `clamp(26px, 3vw, 34px)` | DM Sans 600 |
| H3 carte | 17–19 px | DM Sans 600 |
| Corps | 14–15 px | Inter 400 |
| Légende / meta | 10–12 px | Inter 400, `--muted` |

### 2.3 Espacements, rayons, ombres, bordures

- **Grille** : conteneur `width: min(1180px, calc(100% - 40px)); margin-inline: auto`.
- **Espacement vertical de section** : `80px` desktop / `48px` mobile (échelle 8 px : 8/16/24/32/48/64/80).
- **Rayons** : boutons `8px`, cartes `10–12px`, grand bloc hero `14px`, pastilles `50%`.
- **Bordures** : `1px solid var(--line)` sur fond `--paper`.
- **Ombres** (reprise existante) :
  - bouton primaire : `0 5px 15px rgba(16,42,67,.12)`
  - carte élevée / modale : `0 24px 70px rgba(16,42,67,.2)`
  - cartes standard : aucune ombre, bordure fine (esthétique « papier »).

### 2.4 Icônes & images

- **Icônes** : `lucide-react` uniquement (déjà en usage : `BookOpen`, `ShieldCheck`, `WalletCards`, `Users`, `FileBarChart`, `HeartHandshake`, `FolderKanban`, `TrendingUp`, `ChevronRight`, `Sparkles`…). Taille 16–20 px dans les listes, 24–28 px dans les cartes.
- **Images** :
  - Logo : `src/assets/logo.png` (import React), variante claire/sombre via le composant `Logo tone="light"` existant.
  - Photo église : `public/assets/img/eglise-malaza.jpeg` (hero ou section communauté, avec voile navy `opacity: .35` pour lisibilité).
  - Décors : orbes circulaires discrets (reprendre `.login-orbit` : `border: 1px solid rgba(216,177,108,.16)`).

### 2.5 Points de rupture (alignés sur le CSS existant)

| Breakpoint | Adaptations |
|---|---|
| > 1200 px | Layout complet, grilles 3–4 colonnes |
| ≤ 1200 px | Grilles fonctionnalités → 2 colonnes |
| ≤ 850 px | Hero monocolonne, image masquée/repliée, menu burger |
| ≤ 600 px | Padding `24px 14px`, grilles 1 colonne, CTA pleine largeur |

### 2.6 Composants réutilisables (classes existantes)

`.eyebrow` / `.eyebrow.light` · `.button` + `.button-primary` / `.button-secondary` / `.button-large` · `.brand`, `.brand-mark` · `.login-quote` (base visuelle du verset du jour) · `.metric-card` + `.metric-gold/coral/navy/green/blue/purple` · `.notice-card` · `.legal-*` · `.mono`.

**Interdits** : introduire une nouvelle police, une couleur hors palette, ou un mode sombre (non supporté par l'application actuelle).


---

## 3. Structure de la page & contenu

Ordre des sections (hiérarchie de lecture en « F » inversée) :

```
[Header sticky] → [Hero] → [Verset du jour] → [Fonctionnalités] → [Sécurité]
→ [Chiffres clés] → [Parcours 3 étapes] → [FAQ] → [CTA final] → [Footer]
```

### 3.0 Header (sticky)

- **Logo** (composant `Logo` existant) + nom « FJKM Gestionnaire » + sous-titre « FJKM Malaza Gileada ».
- **Nav ancres** : `Fonctionnalités` · `Sécurité` · `Verset du jour` · `FAQ` (scroll `#anchors`, offset 70 px = hauteur header).
- **CTA** : bouton `.button-primary` « Se connecter » → `/login`.
- Fond `--paper` + `border-bottom: 1px solid var(--line)` ; devient opaque avec ombre légère après 40 px de scroll.
- **≤ 850 px** : nav repliée dans un menu burger (pattern `sheet`/drawer shadcn ou simple `<details>`).

### 3.1 Hero

- **Eyebrow** : `REGISTRE COMMUNAUTAIRE · FJKM MALAZA GILEADA`
- **H1** : « Une gestion claire pour une communauté engagée. »
  (identique au `.login-visual` pour la cohérence de marque)
- **Sous-titre** : « Suivez les obligations, les contributions, les fidèles et les projets de votre paroisse dans un même espace de confiance. »
- **CTA primaires** :
  1. « Se connecter » → `/login` (`.button-primary`)
  2. « Découvrir les fonctionnalités » → `#fonctionnalites` (`.button-secondary`)
- **Visuel droit** : composition type maquette dashboard (cartes `.metric-card` colorées avec mock data générique, **jamais** de vraies données) OU photo `eglise-malaza.jpeg` avec voile navy.
- **Décor** : 2 orbes `.login-orbit` + dégradé radial navy (cf. §2.1).
- Hauteur cible : `min-height: 640px` desktop, auto sur mobile.

### 3.2 Verset / Message du jour → **voir §4 (spécification détaillée)**

### 3.3 Fonctionnalités (`#fonctionnalites`)

- **Eyebrow** : `MODULES` · **H2** : « Tout le registre de la paroisse, un seul outil. »
- Grille 3×2 (2 colonnes ≤ 1200 px, 1 colonne ≤ 600 px) de cartes `.metric-card` / cartes papier :

| Icône | Titre | Texte proposé |
|---|---|---|
| `HandCoins` | Obligations (adidy) | « Suivez les adidy mois par mois, avec relances et soldes calculés automatiquement. » |
| `ArrowDownToLine` / `ArrowUpFromLine` | Entrées & sorties | « Enregistrez chaque mouvement de caisse et visualisez la trésorerie en temps réel. » |
| `Users` | Fidèles | « Un annuaire complet : matricule, groupe, baptême, communion, coordonnées. » |
| `HeartHandshake` | Communion | « Paiements de communion par période (mensuel ou annuel) avec tableaux de bord dédiés. » |
| `FolderKanban` | Projets | « Créez les projets de l'église, suivez budgets, dépenses et avancement. » |
| `FileBarChart` | Rapports & exports | « Rapports filtrables, exports PDF et Excel pour les responsables. » |

Chaque carte : icône dans pastille `border-radius: 8px` fond teinté (reprendre `.metric-icon`), titre DM Sans 600, texte Inter 13 px `--muted`.

### 3.4 Sécurité & confiance

- **Eyebrow** : `SÉCURITÉ` · **H2** : « Des données réservées aux utilisateurs autorisés. »
- Fond `--navy`, texte clair, `.eyebrow.light`.
- Liste 4 points (icône `ShieldCheck` + court paragraphe) :
  1. « Mots de passe hachés et sessions sécurisées »
  2. « Rôles distincts : ADMIN, USER, VISITEUR »
  3. « Journalisation (audit log) de toutes les actions »
  4. « Protection CSRF, XSS et injection SQL »
- Lien secondaire : « Lire la politique de confidentialité » → `/confidentialite`.

### 3.5 Chiffres clés

- Bande type `.summary-strip` / `.metric-card` : **4 cases maximum**.
- **Règle de vérité** : soit valeurs **réelles** fournies par une endpoint publique dédiée, soit cases **masquées** — **interdiction de publier des chiffres inventés**.
- Exemples de métriques : `Fidèles suivis` · `Opérations enregistrées` · `Projets suivis` · `Utilisateurs actifs`.
- Format : nombre DM Sans 600 + label Inter 10 px `--muted`.

### 3.6 Parcours « Comment ça marche » (3 étapes)

- **H2** : « Prêt en trois étapes. »
- 3 colonnes numérotées (pastille or `--gold`, chiffre DM Sans) :
  1. **Connexion** — « Chaque membre reçoit ses accès depuis l'administration. »
  2. **Saisie** — « Enregistrez obligations, entrées, sorties et communion au fil de l'eau. »
  3. **Suivi** — « Consultez tableaux de bord, rapports et exports quand vous en avez besoin. »
- Connecteur visuel : filet pointillé `border-top: 1px dashed #d9b47c` (repris du `brand-mark`).

### 3.7 FAQ (`#faq`)

- **H2** : « Questions fréquentes »
- Composant accordéon (`.accordion` shadcn existe dans le projet) — 5 questions :
  1. « Qui peut accéder à l'application ? » → réponse sur les rôles (ADMIN/USER/VISITEUR).
  2. « Que se passe-t-il si j'oublie mon mot de passe ? » → « Contactez un administrateur : la réinitialisation est gérée uniquement par l'ADMIN. »
  3. « Les données sont-elles sécurisées ? » → renvoi §3.4 et `/confidentialite`.
  4. « Puis-je exporter les rapports ? » → PDF imprimable et export Excel/CSV.
  5. « L'application fonctionne-t-elle sur mobile ? » → interface responsive + PWA.

### 3.8 CTA final

- Bande `--navy` pleine largeur, centrée :
  - **H2** : « Rejoignez l'espace de gestion de votre communauté. »
  - Bouton `.button-secondary` clair « Se connecter » → `/login`.
  - Sous-texte : « Accès réservé aux membres habilités de FJKM Malaza Gileada. »

### 3.9 Footer

- Fond `--navy` (ou `--paper` sombre), 3 colonnes :
  1. Logo + « FJKM Malaza Gileada · Antananarivo »
  2. Liens : `Confidentialité` → `/confidentialite` · `Mentions légales` → `/mentions-legales`
  3. Crédit : « Développement : Narindra Ranjalahy » + année.
- Filet séparateur `1px solid rgba(255,255,255,.12)`, textes 10 px, `letter-spacing: .14em` (repris `.login-visual-footer`).


---

## 4. Composant « Verset / Message du jour »

Composant phare de la landing : un **verset de la Baiboly Malagasy** (Bible malgache) renouvelé **chaque jour**, présenté comme un moment de respiration spirituelle au milieu de la page vitrine.

### 4.1 Objectifs

| # | Objectif |
|---|---|
| V1 | Offrir de la **valeur quotidienne** : le visiteur a une raison de revenir demain |
| V2 | Ancrer l'identité **FJKM** (foi + ordre + gestion) : la tech au service de la communauté |
| V3 | Rester **fiable et sobre** : jamais de « pop-up » de verset, placement intégré au flux |
| V4 | Garantir la **fiabilité du texte** : seul le texte officiel de la Baiboly Malagasy est utilisé |

### 4.2 Maquette

```
┌────────────────────────────────────────────────────────────────────┐
│  ✦ MESSAGE DU JOUR                                    08/10/2026  │  ← eyebrow .eyebrow + date .mono
│                                                                    │
│   « Ny Tompo no renako… »                                          │  ← citation DM Sans, --gold, clamp(20–28px)
│                                                                    │
│   — Salamo 23:1                                    [copier] [⟳]   │  ← référence .mono + actions
│   Baiboly Malagasy · Jour 281 / 366                               │  ← méta (optionnelle)
│                                                                    │
│   Parole d'encouragement pour ce jour : puisez la paix            │  ← phrase d'accroche optionnelle (FR)
│   dans la fidélité de Dieu au milieu de vos tâches.               │
└────────────────────────────────────────────────────────────────────┘
```

- **Emplacement** : entre le Hero (§3.1) et Fonctionnalités (§3.3), en pleine largeur.
- **Fond** : `--navy` avec dégradé radial (variante sombre) **ou** carte `--paper` bordée `--line` sur fond `--ivory` (variante claire). **Variante retenue par défaut : sombre** (contraste maximal avec le hero clair et rythme visuel).
- **Structure HTML conceptuelle** (réutilise les classes existantes) :

```html
<section class="verse-of-the-day" aria-labelledby="verse-title">
  <span class="eyebrow light" id="verse-title">Message du jour</span>
  <time class="mono" datetime="2026-10-08">08/10/2026</time>
  <blockquote class="verse-text">
    <p>« … »</p>
    <cite>— Salamo 23:1</cite>
  </blockquote>
  <div class="verse-meta">Baiboly Malagasy · Jour 281 / 366</div>
  <div class="verse-actions">
    <button aria-label="Copier le verset">…</button>
    <button aria-label="Voir le verset du lendemain (aperçu)" hidden>…</button>
  </div>
</section>
```

- **Icône** : `BookOpen` (reprise du `.login-quote` de la page de connexion).
- **Transitions** : `opacity` + `translateY(6px)` à l'apparition (`IntersectionObserver`), désactivées sous `prefers-reduced-motion`.

### 4.3 Spécification fonctionnelle

| Fonction | Comportement |
|---|---|
| Affichage | 1 verset par jour calendaire, identique pour tous les visiteurs |
| Renouvellement | automatique à 00:00 (fuseau `Indian/Antananarivo`, UTC+3) |
| Bouton « Copier » | copie `texte — référence (Baiboly Malagasy)` dans le presse-papier, toast `sonner` « Verset copié » |
| Bouton « Aperçu suivant » | **masqué par défaut** ; visible uniquement en dev (`import.meta.env.DEV`) pour tester le renouvellement — jamais en production |
| Date affichée | format `JJ/MM/AAAA` + attribut `datetime="AAAA-MM-JJ"` |
| SEO | `<blockquote>` + `<cite>` (sémantique) ; ne **pas** inclure le verset dans les meta-description (voir §5) |
| Langue | le verset est en **malagasy** ; toute la chrome UI autour (eyebrow, boutons, accroche) reste en **français** (langue de l'app) |



### 4.4 Modèle de données (corpus)

Fichier unique : `public/react-app/src/data/versets.json` (chargé en `import` statique → inclus dans le bundle, aucune requête réseau au chargement).

```jsonc
{
  "version": "1.0",
  "translation": "Baiboly Malagasy",
  "license": "Voir §4.7 — droit d'auteur à confirmer",
  "verses": [
    {
      "id": 1,                        // index 0-based, stable, jamais réutilisé
      "ref": "Jaona 14:27",           // référence en malagasy (noms de livres : nomenclature MG1865)
      "book": "Jaona",                // livre normalisé (pour thèmes/filtres)
      "chapter": 14,
      "verse": 27,
      "text": "…",                    // texte EXACT de la Baiboly Malagasy, UTF-8
      "theme": "paix",                // thème (voir §4.5)
      "accroche": "…"                 // OPTIONAL — phrase d'accroche en français (10–18 mots)
    }
  ]
}
```

**Contraintes** :
- `text` : 10–45 mots malagasy, une phrase autant que possible ; guillemets `« »` ajoutés **au rendu**, pas dans le JSON.
- `ref` : format `<Livre> <chapitre>:<vers>` avec la **nomenclature MG1865** (ex. `Filipiana 4:13`, `Salamo 23:1`, `Matio 6:34`). Plages possibles : `1 Korintiana 13:4-7`. Noms vérifiés : `Matio` · `Marka` · `Luka` · `Jaona` · `Asa` · `Romana` · `1 Korintiana` · `Filipiana` · `Salamo` · `Ohabolana` · `Joba`.
- UTF-8 strict, sans BOM ; caractères malagasy (à, è, ô, « ny », « tsy »…) intacts.
- `id` immuable : servi comme clé de cache et clé d'analytics.

### 4.5 Corpus : construction du journalier

| Critère | Règle |
|---|---|
| Volume cible | **366 entrées** (1/jour, bissextile compris) — minimum acceptable : 90 (renouvellement ≥ 3 mois sans répétition) |
| Sélection | Versets **courts, universels, encourageants** : foi, paix, ordre, générosité, sagesse, travail, communauté |
| Exclusions | passages de jugement/damnation, controverses théologiques, versets longs ou vocabulaire obscur |
| Équilibre | ≤ 30 % d'un même livre ; mélanger AT/NT ; ~8 thèmes |
| Accroches FR | optionnelles ; si absente → uniquement citation + référence |
| Validation | relecture par un responsable FJKM ; double vérification référence ↔ texte (aucun décalage de numéro) |

**Thèmes (`theme`)** : `foi` · `paix` · `esperance` · `sagesse` · `amour` · `provision` · `service` · `ordre`.

### 4.6 Logique de renouvellement quotidien

#### 4.6.1 Principe : déterministe, sans état, sans base de données

Le verset du jour est une **fonction pure de la date** :

```
versetDuJour(date) = verses[ indexOf(date) ]
```

Aucune table SQL, aucun cron, aucune API obligatoire. Le même visiteur voit le même verset partout ; au lendemain, il change automatiquement.

#### 4.6.2 Algorithme de calcul

```ts
// Fuseau imposé : Indian/Antananarivo (UTC+3) — l'église est à Antananarivo.
const MS_PER_DAY = 86_400_000;

/** Jours depuis l'époque (1970-01-01), dans le fuseau FJKM. */
function dayNumber(now: Date = new Date()): number {
  // UTC+3 fixe : pas de DST à Madagascar depuis 2011 → pas de cas limites.
  const local = new Date(now.getTime() + 3 * 3_600_000);
  return Math.floor(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) / MS_PER_DAY
  );
}

/** PGCD (Euclide) — pour gérer les tailles de corpus non premières. */
function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

/**
 * Pas multiplicatif déterministe pour un corpus de taille `total` :
 * plus petit entier ≥ 2 premier avec `total`, en écartant les valeurs
 * triviales (0, 1 et -1 mod total) qui recréeraient un cycle linéaire.
 */
function pickStep(total: number): number {
  for (let a = 2; a < total; a++) {
    if (gcd(a, total) === 1 && a !== 1 && a !== total - 1) return a;
  }
  return Math.max(total - 2, 1); // corpus de taille 2 ou 3 : cas dégénéré inévitable
}

/** Index déterministe : couvre TOUS les versets avant répétition. */
function verseIndex(day: number, total: number): number {
  return (((day % total) * pickStep(total)) % total + total) % total;
}

export function getVerseOfTheDay(verses: Verse[], now?: Date) {
  const day = dayNumber(now);
  const total = verses.length;
  return {
    ...verses[verseIndex(day, total)],
    dayNumber: day,
    // Jour de l'année réel (1–366), pour l'affichage « Jour 281 / 366 » :
    dayOfYear: dayNumberToDayOfYear(day), // cf. note ci-dessous
  };
}
```

**Justification** :
- `day % total` (ou `(day × 367) % total` avec un corpus de 366 — car `367 ≡ 1 (mod 366)`, **attention à ce piège**) donne un ordre strictement linéaire : le visiteur revoit les versets dans l'ordre du fichier, cycle « positionnel » prévisible.
- La règle `gcd(STEP, total) = 1` est la condition **exacte** pour que `day → (day × STEP) mod total` soit une **bijection** sur le corpus : tous les versets sont atteints, la période vaut exactement `total` jours, aucun verset n'est jamais sauté.
- L'interdiction `STEP ∉ {1, total-1}` écarte les seuls pas qui reproduisent un ordre linéaire (croissant/décroissant) : le reste apparaît « mélangé » au visiteur (sauts quotidiens de `STEP` positions avec repli modulo).
- `pickStep` est déterministe (itération croissante) → **identique sur tous les clients et en PHP** (`gcd`/boucle traduits tels quels), donc même verset partout, sans coordination.
- Alternative plus lisible : permutation pré-calculée (`shuffledOrder`) générée une fois au build avec seed fixe — mêmes garanties, inspectable dans le JSON ; à préférer si l'on veut contrôler manuellement l'ordre.

**Note `dayOfYear`** : `day % 366` n'est **pas** le jour de l'année (décalage d'époque + années bissextiles). Calculer côté local : `Math.floor((localDate - Date.UTC(y,0,1)) / MS_PER_DAY) + 1`, borné à 366 ; afficher « Jour 281 / 366 » (le dénominateur reste 366 toute l'année, indicatif).


#### 4.6.3 Moment du basculement

| Aspect | Décision |
|---|---|
| Seuil | `00:00:00` heure `Indian/Antananarivo` (soit `21:00 UTC` la veille) |
| Mécanisme | recalcul à **chaque rendu** de la page (fonction pure → aucun timer requis) |
| Page restée ouverte | listener `visibilitychange → visible` : si `dayNumber()` a changé, mise à jour du DOM avec transition `opacity` 200 ms |
| Rendu côté serveur (optionnel) | `date_default_timezone_set('Indian/Antananarivo')` + même formule → algorithme **identique** PHP/TS, aucun écart possible |
| Tests | bouton dev « aperçu lendemain » : `getVerseOfTheDay(verses, demain)` |

#### 4.6.4 Chargement & performance

1. **Option A (recommandée)** : `import verses from './data/versets.json'` → bundle statique.
   - ~15–30 KB brut pour 366 versets, **~8 KB gzip** ; zéro requête ; fonctionne offline (PWA déjà en place).
2. **Option B (corpus > 200 KB)** : `GET /api/verse-of-the-day` public (sans auth) :
   - réponse `{ id, ref, text, accroche, date, dayNumber }`
   - en-têtes `Cache-Control: public, max-age=3600, s-maxage=86400`
   - **fallback immédiat** sur le JSON embarqué si échec.
3. **États** : Option A → contenu présent au 1er rendu, aucun flash ; Option B → skeleton 2 lignes (classe `.skeleton` existante).

#### 4.6.5 Résilience (cas dégradés)

| Scénario | Comportement |
|---|---|
| Corpus vide / JSON invalide | masquer toute la section (jamais de « undefined ») + `console.warn` |
| Corpus < 90 entrées | afficher quand même (formule correcte) ; signaler en revue |
| JS désactivé | Option A : le HTML rendu contient le verset → OK. Option B : rendre un verset de secours côté serveur |
| Copy presse-papier indisponible | fallback : sélection manuelle du texte + toast d'info `sonner` |
| Horloge visiteur fausse | sans gravité : la date ne sert qu'à choisir l'index ; une date fausse donne un autre verset valide, jamais une erreur |

#### 4.6.6 API optionnelle (Option B)

```
GET /api/verse-of-the-day            → 200 application/json (public, pas d'auth)
GET /api/verse-of-the-day?date=AAAA-MM-JJ  → aperçu (dev seulement ; refusé si > aujourd'hui en prod)
```

Réponse :

```json
{
  "id": 281,
  "ref": "Jaona 14:27",
  "text": "…",
  "accroche": "…",
  "translation": "Baiboly Malagasy",
  "date": "2026-10-08",
  "dayNumber": 20737,
  "dayOfYear": 281
}
```

Erreurs : `404` si le corpus est vide ; `400` si `date` mal formée. Aucune donnée personnelle, aucun coût de calcul → neutre pour le budget sécurité existant.



### 4.7 Sources du texte & licence (point d'attention obligatoire)

| Source | Commentaire |
|---|---|
| **MG1865** (« Malagasy Bible », bible.com/v.96) | Traduction historique de 1865, nomenclature des livres vérifiée sur cette version (`Jaona`, `1 Korintiana`, `Filipiana`, `Salamo`…). Édition de référence historique — **statut de domaine public à confirmer juridiquement** pour Madagascar. |
| **MBP** (Baiboly Protestanta Malagasy, © Malagasy Bible Society, 1965/2019) | Édition moderne ; © explicite affiché sur bible.com → **accord écrit obligatoire** avant reproduction d'un corpus. |
| **MRV** (La Bible en Malgache, © La Société Biblique Malgache, 2011) | © explicite affiché sur bible.com → **accord écrit obligatoire**. |
| **API Bible.com / BibleGateway** | Leur licence limite souvent la reproduction (ex. 50 caractères/verset pour les API gratuites). Ne jamais copier 366 versets via une API gratuite sans vérifier le contrat. |

**Décision requise avant implémentation** :
1. Choisir **une seule édition** (recommandé : MG1865 si domaine public confirmé, sinon MBP avec accord de la Malagasy Bible Society).
2. Obtenir l'accord écrit ou basculer sur une édition explicitement libre.
3. Consigner la licence dans `versets.json → license` **et** dans le footer de la landing (mention courte : « Textes : [édition] — [éditeur], utilisé avec autorisation »).

> ⚠️ Tant que cette validation n'est pas faite, **ne pas publier** la section en production. En attendant : n'afficher qu'un verset isolé préalablement validé par l'église (comme le fait déjà la page de connexion avec *1 Korintiana 14:40*), plutôt qu'un corpus de 366.

### 4.8 Exemples de seed (à valider avant usage réel)

Références types pour initialiser le corpus (le **texte exact doit être repris de l'édition validée en §4.7**, ne pas le saisir de mémoire) :

| id | ref | thème |
|---|---|---|
| 1 | `Salamo 23:1` | provision |
| 2 | `Jaona 3:16` | foi |
| 3 | `Matio 6:34` | esperance |
| 4 | `Filipiana 4:13` | foi |
| 5 | `1 Korintiana 14:40` | ordre *(déjà affiché sur la page login — garder cohérent)* |
| 6 | `Ohabolana 3:5-6` | paix |
| 7 | `Matio 6:21` | amour |
| 8 | `Luka 22:42` | service |
| 9 | `Ohabolana 14:23` | travail |
| 10 | `Filipiana 4:6-7` | paix |

### 4.9 Accessibilité & SEO du composant

- **Sémantique** : `<blockquote>` + `<cite>` (jamais un simple `<div>`) ; `<time datetime="YYYY-MM-DD">` pour la date.
- **Hiérarchie** : le titre du composant est un `<h2>` (« Message du jour »), la citation un `<p>`.
- **Contraste** : citation `--gold` `#c58b3a` sur `--navy` `#102a43` → ratio ≈ 5.6:1 ✅ ; en variante claire, utiliser `--ink` pour le corps et `--gold` seulement sur l'icône.
- **Copie** : bouton avec `aria-label="Copier le verset du jour"` + `aria-live="polite"` sur le toast.
- **Animation** : respecter `prefers-reduced-motion: reduce` (aucune animation de fond non essentielle).
- **SEO** : ne **pas** mettre le texte du verset en `meta description` (contenu changeant → mauvaise expérience en SERP). Sujet de `og:title` : « FJKM Gestionnaire — Message du jour » acceptable si partage social souhaité.
- **Analytics (optionnel)** : événement `verse_view {id}` une fois par session ; `verse_copy {id}` au clic. Aucune donnée personnelle.

### 4.10 Critères d'acceptation du composant

- [ ] Le verset change automatiquement à minuit heure d'Antananarivo, sans intervention ni redéploiement.
- [ ] Deux visiteurs différents voient le **même** verset le même jour (déterminisme vérifié : même `id`).
- [ ] Le cycle couvre **tous** les versets du corpus avant répétition (`gcd(STEP, total) === 1`).
- [ ] Aucune requête réseau bloquante au chargement (Option A) ; < 100 ms de rendu.
- [ ] Section entièrement masquée si le corpus est absent/invalide.
- [ ] Texte 100 % malagasy, guillemets `« »`, référence en `.mono`, attribution `Baiboly Malagasy`.
- [ ] Bouton copier fonctionnel + toast ; fallback clavier atteignable (tab + entrée).
- [ ] Contraste AA validé sur les deux variantes (clair/sombre).
- [ ] Licence du texte confirmée et créditée (§4.7).
- [ ] Responsive : 1 colonne ≤ 600 px, citation `clamp()` sans troncature ni overflow.
- [ ] `prefers-reduced-motion` respecté.

---

## 5. SEO, métadonnées & partage social

| Balise | Valeur proposée |
|---|---|
| `<title>` | `FJKM Gestionnaire — Gestion des obligations et fidèles de FJKM Malaza Gileada` |
| `meta description` | « Application de gestion : obligations, entrées/sorties, fidèles, communion et projets de FJKM Malaza Gileada. Espace sécurisé. » (≤ 155 caractères, **statique**, sans verset) |
| `og:title` / `og:description` | identiques au title/description |
| `og:image` | `public/assets/img/logo.png` (dimension ≥ 1200×630 à préparer si partage social souhaité) |
| `og:type` | `website` · `hreflang` : `fr` (UI en français) |
| `canonical` | URL racine de la landing |
| `robots` | `index, follow` (la landing est publique ; `/login` reste `noindex`) |
| Structuré (optionnel) | JSON-LD `SoftwareApplication` : nom, description, `applicationCategory: BusinessApplication`, éditeur « FJKM Malaza Gileada » |

- **Vitesse** : objectif LCP < 2,5 s (photo église en `loading="lazy"` sauf si LCP du hero, `fetchpriority="high"` sur le logo/H1, pas de font blocking — le preload Google Fonts existant suffit).
- **Aucune donnée perso** dans le HTML rendu (règle O3/§1.3).

## 6. Accessibilité globale (WCAG 2.1 AA)

- Ordre de tabulation : header → hero CTA → verset → cartes → FAQ → CTA final → footer.
- Focus visible : `outline: 2px solid var(--gold); outline-offset: 2px` sur tous les interactifs (à ajouter en CSS landing, sans toucher au CSS applicatif).
- Toutes les images décoratives : `alt=""` ; photo église : alt descriptif.
- Menu burger : `aria-expanded`, `aria-controls`, fermeture par `Échap`.
- Accordéon FAQ : boutons `<button>` avec `aria-expanded` (comportement shadcn `accordion` déjà présent).
- Cibles tactiles ≥ 44×44 px sur mobile.
- `prefers-reduced-motion` : désactiver animations hero/verset.
- Tests clavier + VoiceOver/NVDA sur : navigation, ouverture FAQ, copie du verset.

## 7. Plan d'implémentation (fichiers à créer — aucun fichier existant modifié)

> Conforme à la contrainte « ne pas toucher au code » : ce document ne modifie rien ; l'implémentation future se fera en **ajouts** purs.

| # | Fichier à créer (proposal) | Rôle |
|---|---|---|
| 1 | `public/react-app/src/pages/Landing.tsx` | Page complète (sections §3) |
| 2 | `public/react-app/src/components/VersetDuJour.tsx` | Composant §4 (import JSON + `getVerseOfTheDay`) |
| 3 | `public/react-app/src/lib/verseOfDay.ts` | Fonctions pures `dayNumber` / `verseIndex` / `getVerseOfTheDay` (testables) |
| 4 | `public/react-app/src/data/versets.json` | Corpus §4.4 (seed §4.8, validé §4.7) |
| 5 | `public/react-app/src/lib/verseOfDay.test.ts` | Tests : déterminisme, bissextile, minuit Antananarivo, couverture complète du corpus |
| 6 | `public/react-app/src/index.css` *(variante : nouveau fichier `landing.css` importé par `Landing.tsx`)* | Styles landing — **recommandé : fichier séparé `landing.css`** pour ne pas toucher à `index.css` |
| 7 | (Option B) `app/controllers/VerseApiController.php` + route `routes/api.php` **en annexe** | Endpoint public §4.6.6 |

**Route** : `/` sert la landing ; `/login` reste l'écran de connexion existant. Lors de l'intégration, choisir l'approche minimale qui n'altère pas le comportement actuel (ex. redirection `/` → landing uniquement si aucune session, sinon comportement inchangé) — décision à trancher avec le propriétaire du dépôt **avant** toute modification de routeur.

**Ordre de travail** :
1. Valider licence du texte (§4.7) → 2. Constituer le corpus (§4.5) → 3. `verseOfDay.ts` + tests (§4.6) → 4. Composant verset → 5. Sections landing → 6. Responsive/a11y (§6) → 7. SEO (§5) → 8. Recette (§8).

## 8. Checklist de recette finale

**Charte & contenu**
- [ ] Palette strictement limitée aux tokens §2.1 ; contrastes AA mesurés.
- [ ] Typo : DM Sans / Inter / IBM Plex Mono uniquement (aucun ajout).
- [ ] Toutes les sections §3 présentes, dans l'ordre, avec les textes validés.
- [ ] Aucune donnée réelle (fidèles, montants) dans le HTML.
- [ ] Liens `/confidentialite` et `/mentions-legales` fonctionnels.
- [ ] Chiffres clés : réels ou section masquée (jamais inventés).

**Verset du jour**
- [ ] 10 critères de §4.10 cochés.
- [ ] Corpus validé par un responsable FJKM (références ↔ textes, nomenclature MG1865).
- [ ] Licence confirmée et créditée.

**Technique**
- [ ] Lighthouse ≥ 90 (Performance, A11y, Best Practices, SEO).
- [ ] Responsive testé à 360 / 768 / 1200 / 1440 px.
- [ ] Tests unitaires `verseOfDay` verts (y = bissextile, passage d'année, fuseau).
- [ ] `npm run build` sans erreur ; aucun fichier hors listé §7 modifié (`git status` propre).

---

*Fin de la spécification. Toute évolution doit être répercutée dans ce fichier (bump de version en en-tête).*
