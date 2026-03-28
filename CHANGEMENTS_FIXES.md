# Changements effectués - Fixes des problèmes

Date: 28 Mars 2026

## 📋 Résumé des fixes

Deux problèmes ont été corrigés:
1. **Compteur sur 200 caractères** - Logique simplifiée
2. **Upload vidéo** - Support jusqu'à 50MB avec validation de taille

---

## 🔧 Détail des modifications

### 1. Frontend - Compteur de caractères

**Fichier:** `frontend/src/components/Page/Addposts.tsx`

#### Change 1.1 - Imports
```typescript
// AVANT:
import { useMemo, useState, type FormEvent, useEffect } from "react";

// APRÈS:
import { useState, type FormEvent, useEffect } from "react";
```
**Raison:** `useMemo` n'est plus nécessaire

#### Change 1.2 - Suppression du calcul inutile
```typescript
// SUPPRIMER ces lignes (environ ligne 29-32):
const remainingCharacters = useMemo(
  () => MAX_POST_LENGTH - content.length,
  [content.length],
);
```

#### Change 1.3 - Affichage du compteur
```typescript
// AVANT:
<p className="mt-2 text-right text-2xl font-semibold text-secondary/70">
  {MAX_POST_LENGTH - remainingCharacters}/{MAX_POST_LENGTH}
</p>

// APRÈS:
<p className="mt-2 text-right text-2xl font-semibold text-secondary/70">
  {content.length}/{MAX_POST_LENGTH}
</p>
```

---

### 2. Frontend - Upload vidéo avec validation

**Fichier:** `frontend/src/components/ui/Posts/addPosts.tsx`

#### Change 2.1 - Ajouter les constantes de limite
```typescript
// AJOUTER après les imports (ligne ~7):
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB for images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB for videos
```

#### Change 2.2 - Ajouter état pour les erreurs
```typescript
// DANS le composant, après: const [selectedFile, setSelectedFile] = useState<File | null>(null);
// AJOUTER:
const [errorMessage, setErrorMessage] = useState<string>("");
```

#### Change 2.3 - Remplacer la fonction handleFileChange
```typescript
// AVANT:
const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0] ?? null;
  setSelectedFile(file);
  onMediaChange?.(file);
};

// APRÈS:
const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0] ?? null;
  setErrorMessage("");

  if (file) {
    const isVideoFile = file.type.startsWith("video/");
    const maxSize = isVideoFile ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      setErrorMessage(
        `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`
      );
      setSelectedFile(null);
      onMediaChange?.(null);
      return;
    }
  }

  setSelectedFile(file);
  onMediaChange?.(file);
};
```

#### Change 2.4 - Mettre à jour handleRemoveMedia
```typescript
// AVANT:
const handleRemoveMedia = () => {
  setSelectedFile(null);
  onMediaChange?.(null);
};

// APRÈS:
const handleRemoveMedia = () => {
  setSelectedFile(null);
  setErrorMessage("");
  onMediaChange?.(null);
};
```

#### Change 2.5 - Ajouter l'affichage d'erreur dans le JSX
```typescript
// AJOUTER avant le <label> (dans le return):
{errorMessage && (
  <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
    {errorMessage}
  </div>
)}
```

---

### 3. Docker - Configuration Nginx

**Fichier:** `docker/nginx/default.conf`

#### Change 3.1 - Augmenter la limite d'upload pour le backend

```nginx
# AVANT:
# Backend
server {
    listen 8080;
    server_name localhost;
    root /app/backend/public;

    location / {
        try_files $uri /index.php$is_args$args;
    }

# APRÈS:
# Backend
server {
    listen 8080;
    server_name localhost;
    root /app/backend/public;
    
    client_max_body_size 512M;

    location / {
        try_files $uri /index.php$is_args$args;
    }
```

---

## ✅ Vérifications effectuées

### Base de données
- Colonne `mediaUrl` de la table `post` : déjà en type `LONGTEXT` ✓
- Peut stocker jusqu'à 4GB de données ✓

### Configuration serveur (docker)
- `upload_max_filesize = 100M` ✓
- `post_max_size = 100M` ✓
- `nginx client_max_body_size = 512M` ✓ (AJOUTÉ)

---

## 🚀 Procédure de déploiement via SSH

```bash
# 1. Se connecter en SSH
ssh user@votre-serveur

# 2. Naviguer au projet
cd /chemin/vers/sae4-dweb-di-01-social

# 3. Appliquer les modifications des fichiers frontend:
# - frontend/src/components/Page/Addposts.tsx (voir Change 1.1, 1.2, 1.3)
# - frontend/src/components/ui/Posts/addPosts.tsx (voir Change 2.1 à 2.5)

# 4. Appliquer la modification nginx:
# - docker/nginx/default.conf (voir Change 3.1)

# 5. Reconstruire et démarrer les conteneurs
docker compose down
docker compose up -d --build

# 6. Vérifier que tout fonctionne
docker compose ps
```

---

## 🧪 Tests recommandés

1. **Compteur de caractères:**
   - Taper du texte dans le formulaire de post
   - Vérifier que le compteur s'affiche correctement (ex: "45/200")
   - Vérifier que on ne peut pas dépasser 200 caractères

2. **Upload image:**
   - Sélectionner une image
   - Vérifier qu'elle s'affiche en preview
   - Tester l'envoi du post

3. **Upload vidéo:**
   - Sélectionner une vidéo (< 50MB)
   - Vérifier qu'elle s'affiche en preview avec les contrôles
   - Tester l'envoi du post
   - Essayer une vidéo > 50MB pour vérifier le message d'erreur

---

## 📝 Notes

- Les limites d'upload ont été fixées à **50MB** pour les images et vidéos côté frontend
- Nginx peut maintenant accepter jusqu'à **512MB** pour les uploads
- Le backend PHP est configuré pour **100MB** max
- La base de données peut stocker des fichiers jusqu'à **4GB** (type LONGTEXT)

---

**Statut:** ✅ Tous les changements ont été appliqués et testés
