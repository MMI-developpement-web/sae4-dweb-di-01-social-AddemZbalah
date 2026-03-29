# User Stories Implementation Guide

Ce guide explique comment intégrer les nouveaux composants et fonctionnalités implémentés.

## US 2.3 – Compte en lecture seule

### Composant
- **Fichier**: `frontend/src/components/ui/Profile/SettingsPanel.tsx`
- **Import**: `import { SettingsPanel } from '@/components/ui/Profile/SettingsPanel'`

### Utilisation dans la page Profile
```tsx
import { SettingsPanel } from '@/components/ui/Profile/SettingsPanel'

export default function ProfileSettings() {
  return (
    <div className="space-y-6">
      <SettingsPanel />
    </div>
  )
}
```

### API Endpoints
- `GET /api/users/settings` - Récupérer les paramètres
- `PUT /api/users/settings` - Mettre à jour les paramètres
- `PUT /api/users/profile` - Mettre à jour le profil (inclus isReadOnly et isPrivate)

### Logique Backend
- Lors de la création d'une réponse (reply), le système vérifie si l'auteur du post a `isReadOnly = true`
- Si oui, la réponse est rejetée avec un message d'erreur 403

---

## US 3.5 – Hashtags et Mentions

### Utilités
- **Fichier**: `frontend/src/lib/contentParser.tsx`
- **Import**: `import { parseContent, renderHighlightedContent, extractMetadata } from '@/lib/contentParser'`

### Utilisation dans un Post
```tsx
import { parseContent, renderHighlightedContent } from '@/lib/contentParser'

const postContent = "Salut @john ! Voici mon #projet"
const parsed = parseContent(postContent)

// Afficher le contenu avec les hashtags/mentions en surbrillance
<div>
  {renderHighlightedContent(parsed)}
</div>
```

### Fonctionnalités
- `parseContent()` - Parse le texte et extraie les mentions et hashtags
- `renderHighlightedContent()` - Affiche les éléments avec couleur et liens
- `extractMetadata()` - Extrait uniquement les mentions et hashtags

### Liens Générés
- Mentions (@username) → `/profile/{username}`
- Hashtags (#tag) → `/search?q=%23tag`

---

## US 3.6 – Épingler un tweet

### Composant
- **Fichier**: `frontend/src/components/ui/Posts/PinButton.tsx`
- **Import**: `import { PinButton } from '@/components/ui/Posts/PinButton'`

### Utilisation
```tsx
import { PinButton } from '@/components/ui/Posts/PinButton'

<PinButton 
  postId={post.id}
  isPinned={post.isPinned || false}
  isAuthor={currentUser.id === post.author.id}
  onPinChange={(isPinned) => {
    // Rafraîchir ou mettre à jour l'état
  }}
/>
```

### Afficher le post épinglé en haut du profil
```tsx
import { PinnedPostBadge } from '@/components/ui/Posts/PostBadges'

// Dans la liste des posts du profil
{posts.filter(p => p.isPinned).map(post => (
  <div key={post.id}>
    <PinnedPostBadge />
    {/* Afficher le post */}
  </div>
))}

// Puis afficher les posts non épinglés
{posts.filter(p => !p.isPinned).map(post => (
  // Afficher les posts normalement
))}
```

### API Endpoints
- `POST /api/posts/{id}/pin` - Épingler un post
- `DELETE /api/posts/{id}/pin` - Désépingler un post

---

## Retweet

### Composant
- **Fichier**: `frontend/src/components/ui/Posts/RetweetButton.tsx`
- **Import**: `import { RetweetButton } from '@/components/ui/Posts/RetweetButton'`

### Utilisation
```tsx
import { RetweetButton } from '@/components/ui/Posts/RetweetButton'

<RetweetButton 
  postId={post.id}
  isRetweeted={isCurrentUserRetweeted}
  isAuthor={currentUser.id === post.author.id}
  onRetweetChange={(isRetweeted) => {
    // Mettre à jour l'état
  }}
/>
```

### Afficher un post retweeté
```tsx
import { RetweetBadge, RetweetComment } from '@/components/ui/Posts/PostBadges'

// Si le post est un retweet (post.retweetOf existe)
{post.retweetOf && (
  <>
    <RetweetBadge 
      retweeterName={post.author.name}
      retweeterHandle={post.author.mail}
      showComment={post.content.length > 0}
    />
    {post.content && <RetweetComment comment={post.content} />}
    {/* Afficher le post original */}
  </>
)}
```

### API Endpoints
- `POST /api/posts/{id}/retweet` - Retweet un post
- `DELETE /api/posts/{id}/retweet` - Annuler un retweet

### Règle Importante
- Un retweet est une copie du post original
- Les modifications du post original n'affectent pas le retweet

---

## US 4.3 – Recherche dans le fil d'actualité

### Composant
- **Fichier**: `frontend/src/components/ui/Searchbar/SearchBarWithFilters.tsx`
- **Import**: `import { SearchBarWithFilters } from '@/components/ui/Searchbar/SearchBarWithFilters'`

### Utilisation dans FilActu
```tsx
import { SearchBarWithFilters } from '@/components/ui/Searchbar/SearchBarWithFilters'

const [searchResults, setSearchResults] = useState([])

<SearchBarWithFilters 
  onResultsUpdate={(results) => {
    setSearchResults(results.posts || [])
  }}
/>

// Afficher les résultats ou le fil normal
{searchResults.length > 0 ? (
  <div>
    {searchResults.map(post => <PostComponent post={post} />)}
  </div>
) : (
  <div>
    {/* Posts normaux du fil */}
  </div>
)}
```

### Filtres Disponibles
- **Type**: tweets, utilisateurs (@), hashtags (#)
- **Date limite**: À partir du / Jusqu'au

### API Endpoint
- `GET /api/search/posts?q=query&type=tweet&date_from=2020-01-01&date_to=2025-12-31&page=1&per_page=20`

---

## Migration de la Base de Données

Une migration a été créée pour ajouter les champs:

```bash
# Backend
backend/migrations/Version20260329100000.php
```

Champs ajoutés:
- `user.is_read_only` (TINYINT DEFAULT 0)
- `user.is_private` (TINYINT DEFAULT 0)
- `post.is_pinned` (TINYINT DEFAULT 0)
- `post.retweet_of_id` (INT, nullable, onDelete CASCADE)

---

## Types TypeScript

Les types ont été mis à jour dans `frontend/src/lib/api.ts`:

```tsx
interface User {
  // ... autres champs
  isReadOnly?: boolean;
  isPrivate?: boolean;
}

interface Post {
  // ... autres champs
  isPinned?: boolean;
  retweetOf?: number;
}
```

---

## Points Important

1. **Lecture seule + Réponses**: Impossible de répondre aux posts d'un utilisateur en lecture seule (error 403)
2. **Un seul post épinglé**: Seul un post peut être épinglé par utilisateur à la fois
3. **Pas de retweet soi-même**: Impossible de retweet son propre post
4. **Cas d'un retweet**: Affiche le retweet avec une badge "retweeted par", suivi du post original

---

## Structure des Dossiers

```
frontend/src/
├── components/
│   └── ui/
│       ├── Profile/
│       │   └── SettingsPanel.tsx (NEW)
│       ├── Posts/
│       │   ├── PinButton.tsx (NEW)
│       │   ├── RetweetButton.tsx (NEW)
│       │   └── PostBadges.tsx (NEW)
│       └── Searchbar/
│           ├── searchbar.tsx (existing)
│           └── SearchBarWithFilters.tsx (NEW)
└── lib/
    ├── api.ts (updated)
    └── contentParser.tsx (NEW)
```

---

## API Functions Ajoutées

Dans `frontend/src/lib/api.ts`:

```tsx
// Settings
export async function getUserSettings(): Promise<any>
export async function updateUserSettings(settings): Promise<any>

// Pin
export async function pinPost(postId): Promise<boolean>
export async function unpinPost(postId): Promise<boolean>

// Retweet
export async function retweetPost(postId, comment?): Promise<any>
export async function unretweetPost(retweetId): Promise<boolean>

// Search
export async function searchPosts(query, options?): Promise<any>
```
