---
name: optimistic-updates
description: >
  Pattern d'Optimistic UI pour l'application Kuartz.
  Décrit comment appliquer des mises à jour visuelles instantanées côté client,
  synchroniser en arrière-plan avec les Server Actions, notifier via toast,
  et gérer les rollbacks en cas d'erreur.
  S'applique à TOUS les tableaux et formulaires inline de l'application.
globs:
  - "src/components/**/*.tsx"
  - "src/actions/**/*.ts"
---

# Optimistic Updates — Pattern & Règles

## 1. Philosophie fondamentale

> **L'utilisateur ne doit JAMAIS attendre une réponse serveur pour voir le résultat visuel de son action.**

### Problème actuel
Chaque modification (inline edit, changement de statut, assignation, etc.) utilise `startTransition` + appel Server Action synchrone. L'UI attend la fin de la requête avant de refléter le changement. Résultat : l'app paraît lente.

### Solution : Optimistic UI
1. **Appliquer le changement visuellement immédiatement** (state local)
2. **Envoyer la requête serveur en arrière-plan** (Server Action via startTransition)
3. **Notifier l'utilisateur par toast** une fois la sauvegarde confirmée
4. **Rollback automatique** si la requête échoue (restaurer l'ancienne valeur + toast d'erreur)

---

## 2. Architecture technique

### 2.1 React 19 `useOptimistic` (approche préférée pour les valeurs simples)

```tsx
import { useOptimistic } from "react";

// Dans le composant parent qui détient la liste
const [optimisticTasks, setOptimisticTask] = useOptimistic(
  tasks,
  (currentTasks, updatedTask: Partial<Task> & { id: string }) =>
    currentTasks.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t)
);
```

### 2.2 Pattern manuel (pour cas complexes ou multi-champs)

Pour les composants de type table inline-edit, le pattern manuel est plus approprié :

```tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

function EditableCell({ value, onSave }: { value: string; onSave: (v: string) => Promise<void> }) {
  const [localValue, setLocalValue] = useState(value);
  const [isPending, startTransition] = useTransition();

  const commit = (newValue: string) => {
    const previousValue = localValue;
    
    // 1. MISE À JOUR VISUELLE INSTANTANÉE
    setLocalValue(newValue);
    
    // 2. SAUVEGARDE EN ARRIÈRE-PLAN
    startTransition(async () => {
      try {
        await onSave(newValue);
        // 3. TOAST DE CONFIRMATION
        toast.success("Sauvegardé");
      } catch (error) {
        // 4. ROLLBACK + TOAST D'ERREUR
        setLocalValue(previousValue);
        toast.error("Erreur lors de la sauvegarde");
      }
    });
  };

  return (
    <span onClick={() => /* editing logic */}>
      {localValue}
    </span>
  );
}
```

---

## 3. Règles d'implémentation par type de composant

### 3.1 Cellules éditables en texte (EditableTextCell)

| Étape | Action |
|-------|--------|
| Click → mode édition | State local `editing`, `draft` |
| Blur/Enter | `setLocalValue(draft)` immédiatement |
| Arrière-plan | `startTransition(() => serverAction(newValue))` |
| Succès | `toast.success("Sauvegardé")` |
| Erreur | `setLocalValue(previousValue)` + `toast.error(msg)` |

### 3.2 Cellules Select/Popover (StatusCell, PriorityCell, RoleCell)

| Étape | Action |
|-------|--------|
| Sélection dans le menu | `setLocalValue(newSelection)` + fermer le popover |
| Arrière-plan | `startTransition(() => serverAction(newValue))` |
| Succès | `toast.success("Mis à jour")` |
| Erreur | `setLocalValue(previousValue)` + `toast.error(msg)` |

### 3.3 Cellules multi-select (AssigneeCell, UsersCell, TagsCell)

| Étape | Action |
|-------|--------|
| Toggle d'un élément | `setLocalList([...toggled])` immédiatement |
| Arrière-plan | `startTransition(() => serverAction(newIds))` |
| Succès | `toast.success("Assignation mise à jour")` |
| Erreur | `setLocalList(previousList)` + `toast.error(msg)` |

### 3.4 Date Picker (DateCell)

| Étape | Action |
|-------|--------|
| Sélection de la date | `setLocalDate(newDate)` immédiatement |
| Arrière-plan | `startTransition(() => serverAction(newDate))` |
| Succès | `toast.success("Échéance mise à jour")` |
| Erreur | `setLocalDate(previousDate)` + `toast.error(msg)` |

### 3.5 Upload d'images (ImageUpload, logos, avatars)

| Étape | Action |
|-------|--------|
| Sélection du fichier | Preview immédiate via `URL.createObjectURL` ou le base64 local |
| Arrière-plan | `startTransition(() => uploadAction(base64))` |
| Succès | `toast.success("Image mise à jour")` |
| Erreur | Restaurer l'ancienne image + `toast.error(msg)` |

### 3.6 Suppression

| Étape | Action |
|-------|--------|
| Confirmation | `confirm("...")` — obligatoire |
| Post-confirmation | Masquer la ligne/élément visuellement |
| Arrière-plan | `startTransition(() => deleteAction(id))` |
| Succès | `toast.success("Supprimé")` |
| Erreur | Restaurer la ligne + `toast.error(msg)` |

### 3.7 Duplication

| Étape | Action |
|-------|--------|
| Click dupliquer | Pas d'optimistic possible (on ne connaît pas le futur ID) |
| Arrière-plan | `startTransition(() => duplicateAction(id))` |
| Revalidation | Le serveur `revalidatePath()` ajoute la copie |
| Succès | `toast.success("Dupliqué")` |
| Erreur | `toast.error("Erreur lors de la duplication")` |

---

## 4. Toast : Conventions

### 4.1 Setup obligatoire

Le composant `<Toaster />` de `sonner` doit être monté dans le **root layout** (`src/app/layout.tsx`) :

```tsx
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
```

### 4.2 Messages de toast standards

| Action | Succès | Erreur |
|--------|--------|--------|
| Édition de texte | `"Sauvegardé"` | `"Erreur lors de la sauvegarde"` |
| Changement de statut | `"Statut mis à jour"` | `"Erreur lors de la mise à jour"` |
| Changement de priorité | `"Priorité mise à jour"` | `"Erreur lors de la mise à jour"` |
| Changement d'assignation | `"Assignation mise à jour"` | `"Erreur lors de la mise à jour"` |
| Changement de date | `"Échéance mise à jour"` | `"Erreur lors de la mise à jour"` |
| Upload image | `"Image mise à jour"` | `"Erreur lors de l'upload"` |
| Suppression | `"Supprimé"` | `"Erreur lors de la suppression"` |
| Duplication | `"Dupliqué"` | `"Erreur lors de la duplication"` |
| Création | `"Créé avec succès"` | `"Erreur lors de la création"` |

### 4.3 Ne PAS spammer de toasts

- Un toast par action utilisateur. Pas un toast par champ modifié si l'utilisateur modifie plusieurs champs en rafale.
- Pour les edits inline silencieux (ex : renommer un titre), le toast de succès est discret et court (1.5s).
- Pour les erreurs, le toast est plus visible et dure 4s minimum.

---

## 5. Pattern de code complet (template de référence)

### 5.1 Table avec Optimistic Updates

```tsx
"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";

export function ExampleTable({ items: serverItems }: { items: Item[] }) {
  // State local = source de vérité visuelle
  const [items, setItems] = useState(serverItems);
  const [isPending, startTransition] = useTransition();

  // Sync quand les données serveur changent (après revalidation)
  // Note : on NE fait PAS de useEffect pour resync systématiquement,
  // car ça écraserait les optimistic updates en cours. 
  // Le serverItems est le fallback initial.

  const handleUpdateField = (id: string, field: string, value: any) => {
    // Capture la valeur précédente pour rollback
    const previousItems = items;
    
    // 1. OPTIMISTIC : mise à jour locale instantanée
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));

    // 2. SERVER : envoyer en arrière-plan
    startTransition(async () => {
      try {
        await updateAction(id, { [field]: value });
        toast.success("Sauvegardé");
      } catch {
        // 3. ROLLBACK en cas d'erreur
        setItems(previousItems);
        toast.error("Erreur lors de la sauvegarde");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer ?")) return;
    
    const previousItems = items;
    
    // Optimistic : retirer de la liste
    setItems(prev => prev.filter(item => item.id !== id));

    startTransition(async () => {
      try {
        await deleteAction(id);
        toast.success("Supprimé");
      } catch {
        setItems(previousItems);
        toast.error("Erreur lors de la suppression");
      }
    });
  };

  return (
    <table>
      {items.map(item => (
        <tr key={item.id}>
          <td>
            <EditableTextCell
              value={item.name}
              onSave={(v) => handleUpdateField(item.id, "name", v)}
            />
          </td>
        </tr>
      ))}
    </table>
  );
}
```

### 5.2 Server Actions — Convention de retour

Pour supporter le pattern optimistic avec rollback, les server actions **DOIVENT** :

1. **Retourner `{ success: true }` en cas de succès** (pas `void`)
2. **Throw ou retourner `{ error: string }` en cas d'erreur**
3. **Appeler `revalidatePath()` pour que Next.js re-fetch les données côté serveur**

```ts
"use server";
import { revalidatePath } from "next/cache";

export async function updateItemAction(id: string, data: Partial<Item>) {
  const session = await verifySession();
  if (!session) return { error: "Non autorisé" };

  try {
    await db.update(items).set(data).where(eq(items.id, id));
    revalidatePath("/items");
    return { success: true };
  } catch (error) {
    return { error: "Erreur serveur" };
  }
}
```

---

## 6. Synchronisation des données (resync après revalidation)

### Problème
Quand Next.js revalide la page (via `revalidatePath`), le Server Component re-render avec les nouvelles données serveur. Mais le composant `"use client"` garde son propre state local (les optimistic updates).

### Solution : `key` prop ou comparaison de référence

**Approche recommandée : `useEffect` avec comparaison de longueur/hash**
```tsx
// Resync seulement quand la liste serveur change de taille
// (ajout, suppression, ou duplication)
useEffect(() => {
  setItems(serverItems);
}, [serverItems.length]);
```

**Approche alternative pour les refreshes complets :**
Passer une `key` au composant client qui force le reset :
```tsx
// Dans le Server Component parent :
<TasksTable key={tasks.length} tasks={tasks} />
```

### ⚠️ Ne JAMAIS faire
- `useEffect(() => { setItems(serverItems) }, [serverItems])` → écraserait les optimistic updates en cours
- Polling / WebSocket pour une app de cette échelle → over-engineering

---

## 7. Règle spéciale : Filtrage des admins dans ProjectsTable

### Contexte
Les utilisateurs `admin` ont implicitement accès à TOUS les projets. Ils ne sont pas liés via `project_to_user`.

### Règle dans UsersCell de ProjectsTable
- La liste déroulante des utilisateurs assignables à un projet **NE DOIT PAS afficher les admin**.
- Les admins ont accès à tous les projets par définition, les ajouter dans la liste `project_to_user` est redondant et source de confusion.
- Le filtre est : `allUsers.filter(u => u.role !== "admin")`

### Règle dans TasksTable (AssigneeCell)
- La liste déroulante des assignés à une tâche **DOIT inclure les admins** (un admin peut être assigné à une tâche spécifique).
- Le filtre est : `allUsers.filter(u => u.role === "admin" || projectUserMap[task.projectId]?.includes(u.id))`

### Synthèse du comportement admin

| Vue | Admins visibles dans la dropdown ? | Raison |
|-----|-------------------------------------|--------|
| ProjectsTable → UsersCell | ❌ NON | Accès implicite à tous les projets |
| TasksTable → AssigneeCell | ✅ OUI | Un admin peut être assigné à une tâche |
| UsersTable → ProjectsCell | ❌ NON (affiche "All") | Affiche un badge "All" si admin |

---

## 8. Checklist d'implémentation

Pour chaque tableau/formulaire inline à migrer vers l'optimistic :

- [ ] Le composant gère un **state local** pour les données affichées
- [ ] Chaque modification met à jour le **state local d'abord**
- [ ] La Server Action est appelée dans `startTransition` **après** le state local
- [ ] En cas d'erreur, le **rollback** restaure la valeur précédente
- [ ] Un **toast de succès** est affiché une fois la sauvegarde confirmée
- [ ] Un **toast d'erreur** est affiché en cas d'échec + rollback
- [ ] Le `<Toaster />` de sonner est monté dans le root layout
- [ ] Les Server Actions retournent `{ success }` ou `{ error }` (pas `void`)
- [ ] Les admins sont **exclus** de la liste utilisateurs **dans ProjectsTable** uniquement
- [ ] Les admins sont **inclus** dans les dropdown d'assignation de tâches

---

## 9. Tableaux concernés et état de migration

| Tableau | Fichier | Optimistic ? | Toast ? | Admin filter ? |
|---------|---------|:------------:|:-------:|:--------------:|
| TasksTable | `src/components/tasks/TasksTable.tsx` | 🔲 | 🔲 | ✅ Déjà fait |
| ProjectsTable | `src/components/projects/ProjectsTable.tsx` | 🔲 | 🔲 | 🔲 À faire |
| UsersTable | `src/components/users/UsersTable.tsx` | 🔲 | 🔲 | ✅ Déjà fait |
| DocumentsTable | `src/components/documents/DocumentsTable.tsx` | 🔲 | 🔲 | N/A |
| FilesTable | `src/components/files/FilesTable.tsx` | 🔲 | 🔲 | N/A |
| ActivityTable | `src/components/activity/ActivityTable.tsx` | 🔲 | 🔲 | N/A |

---

## 10. Anti-patterns à éviter

- ❌ **Ne PAS bloquer l'UI** en attendant la réponse serveur pour un changement visuel
- ❌ **Ne PAS utiliser `isPending` pour empêcher les interactions** (sauf pour les boutons de suppression/soumission de formulaire)
- ❌ **Ne PAS afficher un spinner** à la place du contenu pendant un update inline
- ❌ **Ne PAS resync systématiquement** les données serveur dans un `useEffect([serverData])` — ça écrase les optimistic updates
- ❌ **Ne PAS oublier le rollback** — chaque optimistic update DOIT capturer la valeur précédente
- ❌ **Ne PAS ajouter les admins** dans la dropdown utilisateurs du ProjectsTable
