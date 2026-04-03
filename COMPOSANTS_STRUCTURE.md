# 📁 Structure des Composants Réorganisés

## Overview
Les composants ont été organisés en dossiers logiques pour une meilleure maintenance:

```
src/components/ui/
├── Profile/
│   ├── ProfileEdit.tsx      (Édition du profil utilisateur)
│   └── BlockButton.tsx       (Bouton bloquer/débloquer utilisateur)
│
├── Posts/
│   ├── PostEdit.tsx          (Édition d'un post)
│   ├── PostWrapper.tsx       (Wrapper avec PostEdit + ReplyForm)
│   ├── ReplyForm.tsx         (Formulaire pour répondre à un post)
│   ├── addPosts.tsx          (Composant pour ajouter média)
│   └── [autres composants de posts...]
│
└── Admin/
    ├── PostCensor.tsx        (Bouton pour censurer/décensurer)
    └── PostModeration.tsx    (Interface de modération complète)
```

## Composants Intégrés

### 1. **Profil (Profil.tsx)**
- ✅ `ProfileEdit` - Modal pour éditer le profil
- ✅ `BlockButton` - Bouton bloquer/débloquer sur les profils d'autres utilisateurs
- ✅ `PostWrapper` - Affichage des posts avec édition

### 2. **Fil (Fil.tsx)**
- ✅ `PostWrapper` - Affichage des posts avec édition et réponses

### 3. **Dashboard (Dashboard.tsx)**
- ✅ `PostModeration` - Interface complète de modération des posts

## Features Implémentées

### US 2.2 – Modification du Profil ✅
- Édition: bio, photo de profil, bannière, site web, localisation
- Modal simple avec confirmation

### US 3.3 – Ajouter Image/Vidéo à un Tweet ✅
- Support `mediaUrl` dans les posts
- Affichage d'images/vidéos dans PostWrapper

### US 3.4 – Modification d'un Tweet ✅
- PostEdit pour modifier contenu et média
- ReplyForm pour répondre aux posts
- Support complet des modifications

### US 6.2 – Bloquer un Utilisateur ✅
- BlockButton sur les profils d'autres utilisateurs
- Auto-unfollow lors du blocage

### Admin Censure ✅
- PostCensor pour censurer/décensurer
- PostModeration pour interface admin complète

## Utilisation

Les composants sont automatiquement intégrés et prêts à l'emploi dans les pages correspondantes.

Pour ajouter des fonctionnalités supplémentaires, suivez la même structure organisationnelle.
