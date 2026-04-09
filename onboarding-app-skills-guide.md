# Les 7 skills IA pour ton app Next.js 15 d'onboarding client

**Voici le guide complet et actionnable** : pour chacune des 7 fonctionnalités clés, j'ai identifié les meilleures skills/rules publiquement disponibles, classées par qualité et fraîcheur. La skill #7 (contexte projet) est écrite de zéro, prête à copier-coller. Chaque recommandation inclut le lien direct, le format, la commande d'installation, et pourquoi c'est le meilleur choix.

L'écosystème des AI coding skills a explosé en 2025-2026. Le format dominant est désormais le **SKILL.md** (Anthropic Agent Skills). **Antigravity supporte ce format** — tu peux utiliser directement les SKILL.md recommandés ci-dessous.

---

## ⚡ ÉTAPE 0 — À FAIRE EN TOUT PREMIER : installer les skills

**Avant même de bootstrap Next.js**, tu dois mettre en place la structure des skills. Cette étape prend 15 minutes et détermine la qualité de tout ce qui suit.

### Structure de dossier obligatoire

À la racine de ton projet (même vide pour l'instant), crée cette arborescence :

```
mon-projet/
└── .agent/
    └── skills/
        ├── drizzle-orm/
        │   ├── SKILL.md
        │   └── examples/
        │       ├── schema-example.ts
        │       └── query-example.ts
        ├── shadcn-ui/
        │   ├── SKILL.md
        │   └── examples/
        │       └── form-pattern.tsx
        ├── tailwind-v4/
        │   └── SKILL.md
        ├── nextjs-app-router/
        │   ├── SKILL.md
        │   └── examples/
        │       └── route-structure.md
        ├── motion-react/
        │   ├── SKILL.md
        │   └── examples/
        │       └── animation-patterns.tsx
        ├── forms-zod/
        │   ├── SKILL.md
        │   └── examples/
        │       └── form-with-server-action.tsx
        └── project-context/
            └── SKILL.md
```

**Règle simple** : un dossier par feature, nommé en kebab-case explicite. Dans chaque dossier, **un `SKILL.md` obligatoire** + un sous-dossier `examples/` optionnel avec des fichiers de code de référence (TypeScript, TSX, MD, etc.) qu'Antigravity pourra lire pour s'inspirer des patterns.

**Pourquoi `.agent/skills/` ?** C'est la convention émergente pour les agents IA (similaire à `.cursor/rules/` pour Cursor ou `.claude/skills/` pour Claude Code). Le préfixe `.` cache le dossier dans les vues fichiers standard et indique clairement que c'est de la métadonnée pour l'IA, pas du code source. Antigravity scanne automatiquement ce type de dossier.

### Procédure d'installation, dans l'ordre

1. **Crée le dossier `.agent/skills/`** à la racine du projet (même si le projet n'existe pas encore — crée juste le dossier projet vide d'abord)
2. **Pour chaque skill ci-dessous (sections 1 à 7)** :
   - Crée le sous-dossier correspondant (ex: `.agent/skills/drizzle-orm/`)
   - Télécharge le `SKILL.md` depuis la source recommandée OU copie-colle le contenu
   - Si la skill source contient des fichiers d'exemple, crée le sous-dossier `examples/` et copie-les dedans
3. **Pour la skill #7 (project-context)** : copie-colle directement le bloc fourni en bas de ce document dans `.agent/skills/project-context/SKILL.md`
4. **Crée un fichier `AGENTS.md` à la racine** qui pointe vers `.agent/skills/` :

```markdown
# Agent Instructions

This project uses skill files located in `.agent/skills/`.
Before any code change, read the relevant SKILL.md files in that directory.

Key skills to consult:
- `.agent/skills/project-context/SKILL.md` — ALWAYS read first
- `.agent/skills/nextjs-app-router/SKILL.md` — for any route/layout work
- `.agent/skills/drizzle-orm/SKILL.md` — for any DB schema or query
- `.agent/skills/shadcn-ui/SKILL.md` — for any UI component
- `.agent/skills/tailwind-v4/SKILL.md` — for any styling
- `.agent/skills/motion-react/SKILL.md` — for any animation
- `.agent/skills/forms-zod/SKILL.md` — for any form
```

5. **Une fois les 7 skills en place**, tu peux lancer l'étape 1 du plan d'action principal (bootstrap Next.js).

**⏸️ VALIDE CETTE ÉTAPE AVANT DE COMMENCER À CODER** : ouvre Antigravity, ouvre ton dossier projet, et vérifie que les 7 dossiers sont là avec leurs `SKILL.md`. Demande à l'agent "lis les skills disponibles et résume-les" pour confirmer qu'il les détecte bien.

### Les 4 MCP complémentaires (à configurer en parallèle)

À configurer dans les settings de ton IDE Antigravity, **pas en remplacement des skills** mais en complément :

- **shadcn MCP** (`ui.shadcn.com/docs/mcp`) — accès live au registre de composants
- **Context7 MCP** — docs à jour pour n'importe quelle lib (motion.dev, drizzle, etc.)
- **Drizzle Docs MCP** (`drizzle.mastra.cloud/api/mcp/drizzle-docs-mcp/sse`) — 97 pages de docs Drizzle en temps réel
- **next-devtools MCP** (`npx add-mcp next-devtools-mcp@latest`) — diagnostics runtime, routes, erreurs

---

## 1. DATABASE — Drizzle ORM + Turso (libSQL)

→ Dossier cible : `.agent/skills/drizzle-orm/`

### 🥇 Recommandation principale : `martinffx/claude-code-atelier → drizzle-orm`

| | |
|---|---|
| **URL** | https://playbooks.com/skills/martinffx/claude-code-atelier/drizzle-orm |
| **GitHub** | https://github.com/martinffx/claude-code-atelier |
| **Format** | SKILL.md (9.6 KB) + 5 fichiers de référence |
| **Mis à jour** | ~1 mois (vu sur playbooks.com) |

**Pourquoi c'est le meilleur pour toi** : c'est l'un des rares skills Drizzle qui couvre **à la fois PostgreSQL ET SQLite/libSQL**. Le fichier `references/sqlite.md` documente les patterns `sqliteTable` avec les types `text`, `integer` — exactement ce dont tu as besoin pour Turso. Inclut les patterns entity/repository, le relational query API (`db.query`), les transactions, les upserts, et l'inférence de types (`$inferSelect`, `$inferInsert`). Le format multi-fichiers (sqlite.md, entity-pattern.md, repository-pattern.md) permet une progressive disclosure qui ne pollue pas le contexte.

**Installation manuelle dans `.agent/skills/drizzle-orm/`** :
1. Clone ou télécharge depuis le GitHub
2. Copie le fichier `SKILL.md` principal dans `.agent/skills/drizzle-orm/SKILL.md`
3. Crée `.agent/skills/drizzle-orm/examples/` et copie-y les fichiers de référence (sqlite.md, entity-pattern.md, etc.)

### 🥈 Alternative solide : `honra-io/drizzle-best-practices`

| | |
|---|---|
| **URL** | https://github.com/honra-io/drizzle-best-practices |
| **Format** | SKILL.md + AGENTS.md + CLAUDE.md + ~30 fichiers de référence |

Le skill Drizzle **le plus exhaustif** disponible. 8 catégories prioritaires, chaque pattern avec "Why It Matters → Incorrect → Correct → References". Couvre Relations v2 (`defineRelations`), indexes, contraintes, performances, types avancés. **Limitation** : centré PostgreSQL. Pas de fichier `engine-sqlite.md`. Tu devras le combiner avec le #1 pour les patterns SQLite.

### 🥉 Complément MCP : Drizzle Docs MCP Server

| | |
|---|---|
| **URL** | https://github.com/Michael-Obele/drizzle-docs |
| **Endpoint SSE** | `https://drizzle.mastra.cloud/api/mcp/drizzle-docs-mcp/sse` |
| **Format** | MCP Server |

Accès live aux **97 pages** de documentation Drizzle avec recherche fuzzy. Inclut la page `connect-turso.mdx` — la seule source qui documente la config `dialect: 'turso'` dans `drizzle.config.ts`. Pas un skill statique mais un outil complémentaire essentiel. Ajoute-le dans tes settings MCP.

**Outil opérationnel** : `defrex/drizzle-mcp` (https://github.com/defrex/drizzle-mcp) — MCP qui exécute réellement les migrations, les requêtes SQL, et introspects ton schéma. Complémentaire aux rules statiques.

---

## 2. UI — shadcn/ui + Tailwind CSS v4

→ Dossiers cibles : `.agent/skills/shadcn-ui/` et `.agent/skills/tailwind-v4/`

### 🥇 Pour shadcn/ui : le skill OFFICIEL

| | |
|---|---|
| **URL** | https://skills.sh/shadcn/ui/shadcn |
| **GitHub** | https://github.com/shadcn/ui (110.5K ⭐) |
| **Format** | SKILL.md + sous-rules liées |
| **Installs/semaine** | **40 300** |
| **Première apparition** | Mars 2026 |

C'est **le skill officiel publié par l'équipe shadcn/ui elle-même**. Il gère le cycle de vie complet des composants : recherche dans les registres, installation via CLI, preview avec `--dry-run` et `--diff`, fusion des mises à jour upstream. Il enforce les patterns de composition (FieldGroup/Field pour les forms, Card structure, Dialog/Sheet/Drawer, Tabs), l'accessibilité (ARIA, sr-only), et la gestion des icônes. Détecte automatiquement ta `tailwindVersion` pour adapter la syntaxe (v3 vs v4). **Support multi-registre** (@shadcn, @magicui, @tailark, presets communautaires). C'est le standard, point final.

**Installation manuelle dans `.agent/skills/shadcn-ui/`** :
1. Récupère le contenu du SKILL.md depuis https://github.com/shadcn/ui (cherche dans le repo pour le fichier skill officiel)
2. Place-le dans `.agent/skills/shadcn-ui/SKILL.md`
3. Optionnel : crée `examples/form-pattern.tsx` avec un exemple de formulaire shadcn typique

**En complément** : active le **shadcn MCP officiel** (`ui.shadcn.com/docs/mcp`) dans les settings de ton IDE. Il fournit l'accès live au registre de composants. Utilisé avec la skill, c'est le combo parfait.

### 🥇 Pour Tailwind v4 : le gist danhollick (semi-officiel)

| | |
|---|---|
| **URL** | https://gist.github.com/danhollick/d902cf60e37950de36cf8e7c43fa0943 |
| **Format** | `.mdc` (à convertir en SKILL.md) |
| **Stars** | **128 ⭐**, 18 forks |
| **Dernière activité** | 19 février 2026 |

**Le fichier de référence Tailwind v4 de facto.** Dan Hollick travaille avec Tailwind Labs. Adam Wathan (créateur de Tailwind) l'a tweeté directement — **97 200 vues, 1 200 likes**. Il couvre exhaustivement : la config CSS-first (`@import "tailwindcss"`, `@theme` directive), tous les nouveaux namespaces (`--color-*`, `--font-*`, `--spacing-*`), les breaking changes (shadow-sm→shadow-xs, utilitaires d'opacité supprimés), les nouvelles features (container queries, transforms 3D, gradients, inset-shadow), les nouveaux variants (starting, not-*, inert, nth-*), `@utility`, `@variant`, `@plugin`. **Indispensable.**

**Installation manuelle dans `.agent/skills/tailwind-v4/`** :
1. Copie le contenu du gist
2. Crée `.agent/skills/tailwind-v4/SKILL.md` avec un frontmatter YAML simple :
   ```
   ---
   name: tailwind-v4
   description: Tailwind CSS v4 conventions, syntax, and breaking changes
   ---
   ```
3. Colle le contenu du gist en dessous

### 🥈 Complément intégration : `jezweb/claude-skills → tailwind-v4-shadcn`

| | |
|---|---|
| **URL** | https://skills.sh/jezweb/claude-skills/tailwind-v4-shadcn |
| **Mis à jour** | 20 janvier 2026 |

Skill testé en production pour l'intégration Tailwind v4 + shadcn/ui. Documente une "Four-Step Architecture" obligatoire (CSS variables → @theme inline → base styles → auto dark mode) et **prévient 8 erreurs courantes** avec solutions exactes. Couvre l'espace couleur OKLCH, le ThemeProvider pour le dark mode, et la migration v3→v4. Utile si tu rencontres des bugs d'intégration. À ajouter en `examples/` du dossier tailwind-v4 ou en complément du shadcn-ui.

---

## 3. FILE STRUCTURE — Next.js 15 App Router

→ Dossier cible : `.agent/skills/nextjs-app-router/`

### 🥇 Recommandation principale : `vercel-labs/next-skills → next-best-practices`

| | |
|---|---|
| **URL** | https://skills.sh/vercel-labs/next-skills/next-best-practices |
| **GitHub** | https://github.com/vercel-labs/next-skills (676 ⭐) |
| **Format** | SKILL.md + 14+ fichiers de référence modulaires |
| **Installs/semaine** | **52 500** |
| **Next.js 15** | ✅ Explicitement mentionné (module "Async Patterns" pour les APIs async de Next.js 15+) |

Le skill **officiel de Vercel**. 14 modules de référence couvrant : File Conventions (structure projet, fichiers spéciaux page.tsx/layout.tsx/loading.tsx/error.tsx/not-found.tsx, route groups, parallel routes, intercepting routes), RSC Boundaries (Server vs Client Components), Data Patterns, Async Patterns (APIs async de Next.js 15+), Directives ('use client', 'use server', 'use cache'), Functions (navigation hooks, server functions), Runtime Selection, Error Handling, Route Handlers, Metadata/SEO, Image/Font optimization. C'est une **background skill** qui s'auto-applique pour prévenir les erreurs. C'est le choix évident.

**Installation manuelle dans `.agent/skills/nextjs-app-router/`** :
1. Clone https://github.com/vercel-labs/next-skills
2. Copie le contenu du dossier `next-best-practices/` directement dans `.agent/skills/nextjs-app-router/`
3. Tu auras le `SKILL.md` principal et tous les fichiers de référence dans `examples/` ou des sous-dossiers

### 🥈 Complément performance : `vercel-labs/agent-skills → react-best-practices`

| | |
|---|---|
| **URL** | https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices |
| **GitHub** | vercel-labs/agent-skills (24 700 ⭐) |
| **Installs** | **185 000** cumulés |

10+ années d'optimisation React/Next.js de l'équipe Vercel Engineering condensées en **69 règles** classées par impact (critical → incremental). Élimination des waterfalls (Promise.all), réduction du bundle, optimisation de la sérialisation RSC, data fetching server-side. Chaque règle a un exemple incorrect vs correct avec métriques d'impact. **Ne couvre PAS** la structure de fichiers — utilise-le en complément du #1.

---

## 4. MOTION — Animations avec Motion (ex-Framer Motion)

→ Dossier cible : `.agent/skills/motion-react/`

### 🥇 Recommandation principale (gratuit) : `jezweb/claude-skills → motion`

| | |
|---|---|
| **URL** | https://skills.sh/jezweb/claude-skills/motion |
| **GitHub** | https://github.com/jezweb/claude-skills |
| **Format** | SKILL.md (très complet, multi-sections + templates + scripts) |
| **Installs/semaine** | 333 (dont **186 sur Antigravity** !) |
| **Première apparition** | 19 janvier 2026 |
| **Version** | 3.1.0 |
| **Import** | ✅ Utilise `motion/react` partout (le nouveau nom) |

**Le meilleur skill Motion gratuit, et de loin.** Couvre : installation, concepts core (AnimatePresence, layout animations, scroll), guides d'intégration (Vite, **Next.js App Router**, Tailwind CSS), optimisation performance (LazyMotion, accélération hardware, virtualisation, FLIP), accessibilité (`MotionConfig reducedMotion`), **15 problèmes connus avec solutions**, 5 templates production-ready, 4 guides de référence, 2 scripts d'automatisation. Utilise exclusivement les imports `motion/react` (post-rebranding). Inclut un guide "When to Use / When NOT to Use" et une section Next.js App Router dédiée avec les patterns `"use client"`. Impressionnant pour un skill gratuit.

**Installation manuelle dans `.agent/skills/motion-react/`** :
1. Clone https://github.com/jezweb/claude-skills
2. Copie le contenu du dossier `motion/` directement dans `.agent/skills/motion-react/`
3. Tu auras `SKILL.md`, les templates, et les scripts d'automatisation

### 🥈 Alternative premium : Motion+ AI Kit (officiel, payant)

| | |
|---|---|
| **URL** | https://motion.dev/docs/ai-kit |
| **Format** | Skills + MCP Server |
| **Prix** | Membership Motion+ (paiement unique) |

Le kit officiel de l'équipe Motion. Inclut `/motion` (deep API knowledge), `/motion-audit` (audit performance qui classe les animations S-tier à F-tier), `/css-spring` (génère des `linear()` CSS), et un **MCP connecté à 330+ exemples premium**. Si le budget le permet, c'est imbattable. Mais le skill jezweb est excellent et gratuit.

---

## 5. AUTH — Custom auth zero-dépendance

→ Intégré dans la skill `.agent/skills/project-context/SKILL.md`

### ⚠️ Constat honnête : aucun skill dédié n'existe

Après recherche exhaustive sur cursor.directory, skills.sh, playbooks.com, awesome-cursorrules, et le web en général : **aucun skill/rule publiquement disponible ne couvre l'auth custom zero-dépendance avec Web Crypto HMAC-SHA256 + middleware Next.js + cookies**. Tous les skills auth existants promeuvent NextAuth, Clerk, Better Auth, ou Supabase Auth. C'est une approche de niche.

### 🥇 Meilleure base : `vercel-labs/next-skills → next-best-practices`

Déjà recommandé en #3 (File Structure), ce skill couvre correctement les APIs middleware de Next.js 15, l'API `cookies()` async, et les patterns de route protection. C'est ta fondation.

### 🥈 Complément sécurité : Next.js Security Audit (cursor.directory)

| | |
|---|---|
| **URL** | https://cursor.directory/nextjs-security-audit-guide |
| **Format** | .cursorrules / plugin Cursor |

Ruleset d'audit sécurité complet : defense in depth, session management, middleware auth, rate limiting, CSRF, validation d'input. Philosophie "Security First" + "Minimal Attack Surface". Traite l'auth de manière abstraite (`verifyAuth()`) — compatible avec une implémentation zero-dep.

### 🥉 Matériel de référence pour construire ta propre skill

Puisqu'aucun skill dédié n'existe, voici les meilleures sources pour en écrire un (ou le donner comme contexte) :

- **Next.js Official Auth Docs** (https://nextjs.org/docs/app/guides/authentication) — montre le pattern stateless session avec HMAC-SHA256 via `jose`. Le `jose` est ~5KB et Edge-compatible. Ses patterns `encrypt()`/`decrypt()` sont transposables en Web Crypto pur
- **Authgear Security Blog** (https://www.authgear.com/post/nextjs-security-best-practices) — **le seul article qui couvre explicitement CVE-2025-29927** avec versions affectées et mitigations. Defense in depth : "middleware is not a security boundary"
- **WorkOS Auth Guide 2026** (https://workos.com/blog/nextjs-app-router-authentication-guide-2026) — couvre CVE-2025-29927, Data Access Layer pattern, cycle de vie des requêtes (Middleware → Route Handler → Server Components → DAL)
- **Lukas Murdock Web HMAC** (https://lukasmurdock.com/web-hmac/) — implémentation pure Web Crypto API de HMAC-SHA256 avec `crypto.subtle.importKey` + `crypto.subtle.sign`

**Ma recommandation** : intègre les patterns auth dans ta **skill #7 (Project Context)** ci-dessous, qui inclut une section auth custom détaillée.

---

## 6. FORMS & VALIDATION — Zod + Server Actions + react-hook-form

→ Dossier cible : `.agent/skills/forms-zod/`

### 🥇 Recommandation principale : `gpolanco/skills-as-context → forms`

| | |
|---|---|
| **URL** | https://playbooks.com/skills/gpolanco/skills-as-context/forms |
| **Format** | SKILL.md (11.1 KB) |
| **Licence** | Apache-2.0 |

Le skill le plus complet pour l'architecture forms end-to-end. Couvre : **Zod schemas comme source de vérité unique**, `zodResolver` avec react-hook-form, contrat typé `ApiResponse<T>` pour les Server Actions, utilitaire `applyActionErrors` qui mappe les erreurs serveur vers les champs RHF via `setError`, composants réutilisables (FormWrapper, FormField), accessibilité (aria-invalid/aria-describedby), et champs conditionnels. Pattern opinionné et production-ready. **Limitation** : utilise le pattern `onSubmit` handler plutôt que `useActionState`, et ne couvre pas `useOptimistic`.

**Installation manuelle dans `.agent/skills/forms-zod/`** :
1. Va sur https://playbooks.com/skills/gpolanco/skills-as-context/forms et récupère le SKILL.md
2. Place-le dans `.agent/skills/forms-zod/SKILL.md`
3. Crée `.agent/skills/forms-zod/examples/form-with-server-action.tsx` avec un exemple complet

### 🥈 Référence encyclopédique : `ovachiever/droid-tings → react-hook-form-zod`

| | |
|---|---|
| **URL** | https://playbooks.com/skills/ovachiever/droid-tings/react-hook-form-zod |
| **Format** | SKILL.md (37.5 KB !) + 21 fichiers |
| **Mis à jour** | 20 novembre 2025 |

**37.5 KB de patterns RHF + Zod** — le skill le plus détaillé de l'écosystème. Couvre absolument tout : types de schemas Zod (primitives, objects, arrays, refinements, transforms, async validation), tous les hooks RHF (`useForm`, `useFieldArray`, `useWatch`, `Controller` vs `register`), validation modes, multi-step form wizards, accessibilité (focus management, live regions), troubleshooting détaillé. **21 fichiers** de templates, scripts, et références. Idéal comme référence exhaustive quand l'IA a besoin de patterns spécifiques. À placer en `examples/` du dossier forms-zod ou comme skill séparée si tu veux pousser plus loin.

**Lacune identifiée** : **aucun skill existant ne couvre `useOptimistic`** dans un contexte forms. C'est un gap réel dans l'écosystème. Tu devras ajouter ces patterns manuellement ou dans ta skill projet.

---

## 7. PROJECT-CONTEXT — Skill custom pour ton app d'onboarding

→ Dossier cible : `.agent/skills/project-context/SKILL.md`

Voici la skill complète, prête à copier-coller :

```markdown
---
name: onboarding-app-context
description: >
  Contexte projet complet pour l'application Next.js 15 d'onboarding client.
  Stack, schéma DB, architecture, conventions, anti-patterns, et mindset d'évolution incrémentale.
  S'applique à TOUS les fichiers du projet.
globs:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.sql"
  - "**/*.css"
---

# Onboarding App — Contexte Projet

## Stack technique

- **Framework** : Next.js 15 (App Router uniquement, PAS de Pages Router)
- **Langage** : TypeScript strict (`strict: true`, `noUncheckedIndexedAccess: true`)
- **Styling** : Tailwind CSS v4 (config CSS-first, `@theme` directive, PAS de tailwind.config.js)
- **Composants UI** : shadcn/ui (registre par défaut, installation via `npx shadcn@latest add`)
- **ORM** : Drizzle ORM avec dialecte SQLite/libSQL
- **Base de données** : Turso (libSQL hébergé, un seul DB pour l'app entière)
- **Animations** : Motion (package `motion`, imports depuis `motion/react`)
- **Auth** : Custom (zero dépendance), HMAC-SHA256 via Web Crypto API, sessions dans cookies HttpOnly
- **Déploiement** : Vercel (Edge Runtime pour le middleware, Node.js Runtime par défaut pour le reste)

## Schéma de base de données actuel

Le schéma utilise `sqliteTable` de `drizzle-orm/sqlite-core`. Toutes les tables sont dans `src/db/schema/`.

### Tables existantes

```
Project
├── id (text, PK, cuid2)
├── name (text, NOT NULL)
├── slug (text, NOT NULL, UNIQUE)
├── description (text)
├── createdAt (integer, timestamp)
└── updatedAt (integer, timestamp)

User
├── id (text, PK, cuid2)
├── email (text, NOT NULL, UNIQUE)
├── name (text, NOT NULL)
├── passwordHash (text, NOT NULL)
├── role (text: 'admin' | 'client')
├── createdAt (integer, timestamp)
└── updatedAt (integer, timestamp)

Task
├── id (text, PK, cuid2)
├── projectId (text, FK → Project.id)
├── issueNumber (integer, auto-increment par projet)
├── title (text, NOT NULL)
├── description (text)
├── status (text: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done')
├── priority (integer: 0=none, 1=low, 2=medium, 3=high, 4=urgent)
├── targetDate (integer, timestamp, nullable)
├── createdAt (integer, timestamp)
└── updatedAt (integer, timestamp)

Tag
├── id (text, PK, cuid2)
├── projectId (text, FK → Project.id)
├── name (text, NOT NULL)
├── color (text, NOT NULL)
└── UNIQUE(projectId, name)

TaskAssignee (M2M)
├── taskId (text, FK → Task.id)
├── userId (text, FK → User.id)
└── PK(taskId, userId)

TaskTag (M2M)
├── taskId (text, FK → Task.id)
├── tagId (text, FK → Tag.id)
└── PK(taskId, tagId)

ProjectToUser (M2M)
├── projectId (text, FK → Project.id)
├── userId (text, FK → User.id)
├── role (text: 'owner' | 'member' | 'viewer')
└── PK(projectId, userId)
```

### Évolutions planifiées du schéma

Le schéma va évoluer. Nouvelles tables à ajouter progressivement :

- **Document** : markdown docs par projet (title, content en markdown, projectId, authorId, slug, order)
- **Comment** : commentaires sur les tasks (content, taskId, authorId, createdAt)
- **FileAttachment** : pièces jointes (fileName, fileUrl, fileSize, mimeType, lié à Task ou Document ou Comment)
- **Activity** : log d'activité (type, entityType, entityId, userId, metadata JSON, createdAt)
- **Notification** : notifications utilisateur (type, message, userId, read, linkTo)

Pour chaque nouvelle table :
1. Créer le fichier schema dans `src/db/schema/`
2. Exporter depuis `src/db/schema/index.ts`
3. Générer la migration : `npx drizzle-kit generate`
4. Appliquer : `npx drizzle-kit migrate` (ou `push` en dev)
5. Ajouter les relations dans le fichier schema
6. Créer les types inférés (`$inferSelect`, `$inferInsert`)

## Architecture et structure de fichiers

```
src/
├── app/
│   ├── (admin)/              # Route group admin (layout avec sidebar)
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── projects/
│   │       ├── page.tsx
│   │       └── [projectId]/
│   │           ├── page.tsx
│   │           ├── tasks/
│   │           └── settings/
│   ├── (client)/             # Route group client (layout simplifié)
│   │   ├── layout.tsx
│   │   └── portal/
│   │       └── [projectSlug]/
│   ├── (auth)/               # Route group auth (login, register)
│   │   ├── layout.tsx
│   │   ├── login/
│   │   └── register/
│   ├── api/                  # Route handlers si nécessaire
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css           # Tailwind v4 imports + @theme
├── components/
│   ├── ui/                   # Composants shadcn/ui (NE PAS MODIFIER)
│   ├── forms/                # Composants de formulaires réutilisables
│   ├── layout/               # Header, Sidebar, Footer
│   └── [feature]/            # Composants par feature (tasks/, projects/, etc.)
├── db/
│   ├── index.ts              # Client Drizzle + connexion Turso
│   ├── schema/               # Un fichier par table ou groupe logique
│   │   ├── index.ts          # Re-export tout
│   │   ├── projects.ts
│   │   ├── users.ts
│   │   ├── tasks.ts
│   │   └── tags.ts
│   ├── queries/              # Fonctions de requête réutilisables
│   └── seed.ts               # Script de seed
├── lib/
│   ├── auth/                 # Logique auth (session, crypto, middleware helpers)
│   │   ├── session.ts        # createSession, verifySession, deleteSession
│   │   └── middleware.ts     # Logique de protection des routes
│   ├── utils.ts              # cn() et utilitaires généraux
│   └── validators/           # Schemas Zod partagés
├── hooks/                    # Custom React hooks
├── types/                    # Types TypeScript globaux
└── actions/                  # Server Actions (un fichier par domaine)
    ├── tasks.ts
    ├── projects.ts
    └── auth.ts
```

## Règles architecturales strictes

### Server Components par défaut
- TOUT composant est un Server Component sauf indication contraire
- Ajouter `"use client"` UNIQUEMENT quand nécessaire (interactivité, hooks React, event handlers)
- Les animations Motion nécessitent `"use client"` — créer un wrapper client minimal
- Les formulaires avec react-hook-form nécessitent `"use client"`

### Simplicité > Features
- Pas de micro-optimisation prématurée
- Pas d'abstraction tant qu'un pattern n'est pas utilisé 3+ fois
- Un fichier fait UNE chose. Si un fichier dépasse 200 lignes, le découper
- Préférer les fonctions simples aux classes
- Préférer les Server Actions aux API routes quand possible

### Base de données
- UN SEUL Turso DB pour toute l'app (pas de DB par client/projet)
- Les données sont scoped par `projectId` dans les queries, pas par des DBs séparées
- Drizzle en mode `drizzle-orm/libsql` avec le driver `@libsql/client`
- Timestamps stockés comme `integer` (Unix epoch en secondes)
- IDs générés avec `cuid2` côté application
- Indexes sur toutes les foreign keys et les colonnes fréquemment filtrées

### Auth custom
- ZERO bibliothèque d'auth (pas de NextAuth, Clerk, Lucia, Better Auth, Auth.js)
- Sessions signées avec HMAC-SHA256 via `crypto.subtle` (Web Crypto API)
- Session stockée dans un cookie HttpOnly, Secure, SameSite=Lax
- Le middleware est la PREMIÈRE ligne de défense, PAS la seule
- TOUJOURS re-vérifier la session dans les Server Components et Server Actions (defense in depth)
- Conscience de CVE-2025-29927 : ne jamais faire confiance uniquement au middleware

## Conventions de code

### Nommage des fichiers
- Composants : `PascalCase.tsx` (ex: `TaskCard.tsx`, `ProjectSidebar.tsx`)
- Utilitaires/lib : `camelCase.ts` (ex: `formatDate.ts`, `session.ts`)
- Schemas Drizzle : `camelCase.ts` (ex: `tasks.ts`, `projects.ts`)
- Server Actions : `camelCase.ts` dans `src/actions/` (ex: `tasks.ts`)
- Routes Next.js : `kebab-case` pour les dossiers (convention Next.js)

### Nommage du code
- Composants React : `PascalCase` (ex: `export function TaskCard()`)
- Fonctions/variables : `camelCase`
- Types/Interfaces : `PascalCase` (ex: `type TaskWithAssignees = ...`)
- Constantes : `UPPER_SNAKE_CASE` pour les vraies constantes, `camelCase` sinon
- Schemas Zod : `camelCaseSchema` (ex: `createTaskSchema`, `loginSchema`)
- Server Actions : `verbNounAction` (ex: `createTaskAction`, `updateProjectAction`)
- Tables Drizzle : `camelCase` pluriel (ex: `tasks`, `projectToUser`)

### Patterns de formulaire
- Schema Zod = source de vérité unique (partagé client + serveur)
- react-hook-form + `zodResolver` côté client
- Même schema Zod validé côté serveur dans la Server Action
- Erreurs serveur mappées vers les champs du formulaire
- `useActionState` pour les formulaires simples, RHF pour les formulaires complexes

### Patterns d'animation
- Imports depuis `motion/react` (PAS `framer-motion`)
- Wrapper client minimal pour les animations dans des Server Components
- `AnimatePresence` pour les transitions d'entrée/sortie
- `useReducedMotion` / `MotionConfig reducedMotion="user"` pour l'accessibilité
- Animations subtiles et rapides (< 300ms) — pas de flashy

## Ce qu'il ne faut JAMAIS faire

### Architecture
- ❌ PAS de repo par client — c'est UNE app multi-projet avec un seul codebase
- ❌ PAS de database par client — un seul Turso DB, données scoped par projectId
- ❌ PAS de Prisma — on utilise Drizzle exclusivement
- ❌ PAS de fichier SQLite sur Vercel (pas de file system persistant en serverless)
- ❌ PAS de Pages Router — App Router uniquement
- ❌ PAS de getServerSideProps/getStaticProps — c'est l'ancien paradigme

### Dépendances
- ❌ PAS de NextAuth / Auth.js / Clerk / Lucia / Better Auth — auth custom
- ❌ PAS de bibliothèque d'état global (Redux, Zustand) sauf besoin prouvé
- ❌ PAS de `axios` — utiliser `fetch` natif
- ❌ PAS de `moment.js` ou `dayjs` — utiliser `Intl.DateTimeFormat` ou `date-fns` si nécessaire
- ❌ PAS de `framer-motion` comme nom de package — c'est `motion` maintenant
- ❌ PAS de dépendance sans justification claire

### Code
- ❌ PAS de `"use client"` par défaut — Server Component d'abord
- ❌ PAS de `any` en TypeScript — typer explicitement ou utiliser `unknown`
- ❌ PAS de logique métier dans les composants — extraire dans `lib/` ou `actions/`
- ❌ PAS de requêtes DB directes dans les composants — passer par `db/queries/`
- ❌ PAS de secrets/clés dans le code côté client
- ❌ PAS de console.log en production — utiliser un logger structuré si nécessaire

## Mindset d'évolution incrémentale

Ce projet se construit **pas à pas**. Chaque feature est un incrément séparé :

1. **Incrément = 1 feature** : ne jamais mélanger plusieurs features dans un même changement
2. **Schema d'abord** : toujours commencer par le schema Drizzle, puis la migration, puis les queries, puis l'UI
3. **Vertical slice** : chaque feature traverse toutes les couches (DB → queries → actions → UI)
4. **Tester le slice** : s'assurer qu'un incrément fonctionne avant de passer au suivant
5. **Refactorer après** : si 3 composants se ressemblent, extraire une abstraction. Pas avant.

L'ordre de construction prévu :
1. ✅ Auth (login/register/session)
2. ✅ CRUD Projects
3. ✅ CRUD Tasks (avec issueNumber, status, priority)
4. ✅ Tags + TaskTag M2M
5. ✅ Assignees + TaskAssignee M2M
6. 🔲 Portail client (vue simplifiée)
7. 🔲 Documents markdown par projet
8. 🔲 Commentaires sur les tasks
9. 🔲 File attachments
10. 🔲 Activity log
11. 🔲 Notifications
```

---

## Récapitulatif : tes 7 skills en un coup d'œil

| # | Catégorie | Skill recommandée | Dossier cible |
|---|-----------|-------------------|---------------|
| 1 | **Database** | martinffx/claude-code-atelier → drizzle-orm | `.agent/skills/drizzle-orm/` |
| 2a | **UI (shadcn)** | shadcn/ui officiel | `.agent/skills/shadcn-ui/` |
| 2b | **UI (Tailwind v4)** | danhollick/tailwind-css-v4.mdc | `.agent/skills/tailwind-v4/` |
| 3 | **File Structure** | vercel-labs/next-skills → next-best-practices | `.agent/skills/nextjs-app-router/` |
| 4 | **Motion** | jezweb/claude-skills → motion | `.agent/skills/motion-react/` |
| 5 | **Auth** | Aucun dédié → intégré dans skill #7 | (dans project-context) |
| 6 | **Forms** | gpolanco/skills-as-context → forms | `.agent/skills/forms-zod/` |
| 7 | **Projet** | Custom (ci-dessus) | `.agent/skills/project-context/` |

**Les 4 MCP à activer en parallèle** : shadcn MCP (officiel), Drizzle Docs MCP (mastra.cloud), Context7 MCP, next-devtools MCP. Ces outils donnent à l'IA un accès live aux docs — les skills statiques donnent les règles et conventions.

## L'essentiel à retenir

L'écosystème des AI coding skills est encore jeune mais a radicalement mûri début 2026. **Les skills officielles de Vercel et shadcn sont désormais le gold standard** — elles remplacent avantageusement les vieux `.cursorrules` communautaires. Pour les niches comme l'auth custom zero-dep, aucun skill n'existe encore : c'est pour ça que la skill projet (#7) est la plus importante de ta collection. Elle capture ce qu'aucune skill publique ne peut couvrir — le contexte spécifique de **ton** application, avec ses choix architecturaux, ses contraintes, et sa roadmap d'évolution. Crée la structure `.agent/skills/`, installe les 6 skills externes dans leurs dossiers respectifs, colle la skill #7, active les 4 MCP, et tu es prêt à vibe-coder.
