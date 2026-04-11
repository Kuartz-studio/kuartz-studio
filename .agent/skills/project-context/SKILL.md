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
├── passwordHash (text) // Nullable (clients n'ont pas de mot de passe)
├── role (text: 'admin' | 'employee' | 'customer')
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
- **FileAttachment** : liens externes vers des fichiers (title, url, format via dropdown, lié à Task ou Project — PAS d'upload fichier, uniquement des liens Drive/Figma/etc.)
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
- ❌ AUCUNE interface de création de compte public (`/register`). Les comptes sont pré-référencés.
- Les clients (customer) n'ont PAS besoin de mot de passe (digicode). L'accès se fait par une session magique / passless authentifiée sur leur email.
- Les admins/salariés utilisent un code PIN (digicode, 6 chiffres) qui doit être haché publiquement.
- Sessions signées avec HMAC-SHA256 via `crypto.subtle` ou `crypto` (node built-in)
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

### UI et Typographie
- **Font principale** : Geist (`font-sans`)
- **Font monospace** : Geist Mono (`font-mono`) pour les éléments spécifiques/techniques.

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

### Git & Workflow
- ❌ Tu n'as STRICTEMENT JAMAIS le droit de faire un `git push`. Jamais. Aucune exception.
- ❌ Le `git commit` est autorisé UNIQUEMENT avec l'accord explicite de l'utilisateur.
- ❌ L'autorisation fournie par l'utilisateur ne vaut que pour UN SEUL `git commit` (1 action = 1 crédit). Tu dois impérativement redemander l'autorisation avant chaque nouveau commit local.

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
