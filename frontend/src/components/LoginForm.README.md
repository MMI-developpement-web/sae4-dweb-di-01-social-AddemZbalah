# LoginForm Component

Composant de connexion créé à partir du design Figma avec React et Tailwind CSS.

## 📋 Statut des Serveurs MCP

- ✅ **Figma MCP** - Accessible et utilisé
- ⚠️ **Context7 MCP** - Non configuré (clé API requise)

## 🎨 Design

Le composant a été généré à partir de ce design Figma :
https://www.figma.com/design/5E6QMFrFYSkNPWkKrTkef3/ZBALAH-Addem?node-id=63-49

## 📦 Fichiers créés

1. **`LoginForm.tsx`** - Le composant principal
2. **`App-LoginExample.tsx`** - Exemple d'utilisation

## 🚀 Utilisation

```tsx
import LoginForm from './components/LoginForm';

function App() {
  const handleLogin = (email: string, password: string) => {
    // Votre logique d'authentification
    console.log('Login:', { email, password });
  };

  const handleForgotPassword = () => {
    // Logique de réinitialisation de mot de passe
  };

  const handleCreateAccount = () => {
    // Logique de création de compte
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 p-4">
      <LoginForm
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
}
```

## 🎯 Fonctionnalités

- ✅ Design fidèle au Figma
- ✅ TypeScript avec typage fort
- ✅ Gestion d'état avec useState
- ✅ Formulaire HTML5 avec validation
- ✅ Accessibility (ARIA labels, focus states)
- ✅ Hover et focus states
- ✅ Responsive design
- ✅ Transitions fluides
- ✅ Callbacks configurables

## 🔧 Props

```typescript
interface LoginFormProps {
  className?: string;                                    // Classes CSS additionnelles
  onSubmit?: (email: string, password: string) => void; // Callback de connexion
  onForgotPassword?: () => void;                        // Callback mot de passe oublié
  onCreateAccount?: () => void;                         // Callback création de compte
}
```

## ⚙️ Configuration Context7

Pour utiliser les meilleures pratiques Context7, configurez la clé API dans `mcp.json` :

```json
{
  "mcp": {
    "servers": {
      "context7": {
        "type": "http",
        "url": "https://mcp.context7.com/mcp",
        "headers": {
          "CONTEXT7_API_KEY": "votre_clé_api_ici"
        }
      }
    }
  }
}
```

## 📝 Meilleures pratiques appliquées

### React
- ✅ Hooks (useState)
- ✅ Composants fonctionnels
- ✅ TypeScript pour la sécurité de type
- ✅ Props interfaces bien définies
- ✅ Event handlers optimisés
- ✅ Form validation native HTML5

### Tailwind CSS
- ✅ Classes utilitaires
- ✅ Couleurs personnalisées du design
- ✅ States (hover, focus)
- ✅ Responsive avec max-width
- ✅ Transitions fluides
- ✅ Focus rings pour l'accessibilité

### Accessibilité
- ✅ Labels ARIA
- ✅ Éléments sémantiques (form, button, input)
- ✅ Focus visible
- ✅ Type d'input approprié (email, password)
- ✅ Attribut required pour validation

## ⚠️ Note importante

Les images du Figma (ligne de séparation) sont hébergées sur les serveurs Figma et **expirent après 7 jours**. Si vous voyez que l'image ne charge plus, vous devez :

1. Remplacer l'URL dans le composant, ou
2. Télécharger l'image et l'héberger localement, ou
3. Utiliser une bordure CSS à la place :

```tsx
// Remplacer l'image par une ligne CSS
<div className="w-[94px] h-px bg-[#f3daff]"></div>
```

## 🎨 Personnalisation

### Changer les couleurs

Modifiez les classes Tailwind dans le composant :

```tsx
// Couleur de fond
bg-[rgba(242,217,243,0.26)] → bg-blue-100

// Couleur de texte
text-[#f3daff] → text-blue-500

// Couleur des boutons
bg-[#f3daff] → bg-blue-600
```

### Ajouter une validation

```tsx
const [errors, setErrors] = useState({ email: '', password: '' });

const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  // Validation personnalisée
  if (!email.includes('@')) {
    setErrors({ ...errors, email: 'Email invalide' });
    return;
  }
  
  if (password.length < 8) {
    setErrors({ ...errors, password: 'Mot de passe trop court' });
    return;
  }
  
  onSubmit?.(email, password);
};
```

## 📱 Responsive

Le composant est responsive avec une largeur max de 359px. Pour l'adapter à différentes tailles d'écran :

```tsx
<div className="w-full max-w-[359px] md:max-w-md lg:max-w-lg">
```
