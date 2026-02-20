# ⚠️ Erreur 500 Backend Railway - Solutions

**Date** : 20 janvier 2026  
**Problème** : Erreur 500 lors du login sur le backend Railway  
**Impact** : Tous les boutons de login affectés

## 🔍 Diagnostic

### Symptômes
- ✅ Health check OK : https://apirust-production.up.railway.app/health
- ❌ Login endpoints retournent 500
- ✅ Base de données accessible
- ⚠️ Problème potentiel : Backend Railway ou limite de BD atteinte

### Tests Effectués
```bash
# Health check - OK
curl https://apirust-production.up.railway.app/health
# Retourne: {"status":"ok", ...}

# Login - Erreur 500
curl -X POST https://apirust-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","provider":"t4g",...}'
# Retourne: HTTP 500
```

## 🛠️ Solutions Disponibles

### Solution 1 : Utiliser le Backend Local (Recommandé)

Le backend local est plus fiable pour le développement.

#### Vérifier si le Build Docker est Terminé
```bash
docker-compose -f docker-compose.dev.yml ps
```

**Si le backend est prêt** :
```bash
# Vérifier qu'il répond
curl http://localhost:3000/health

# Si OK, configurer le frontend
sed -i.bak 's|https://apirust-production.up.railway.app|http://localhost:3000|g' .env.local

# Redémarrer le frontend
pkill -f "next dev"
cd apps/dapp && npm run dev -- -p 4200
```

**Si le backend n'est pas encore construit** :
```bash
# Lancer le build (prend 10-20 min la première fois)
docker-compose -f docker-compose.dev.yml up -d --build

# Suivre les logs
docker-compose -f docker-compose.dev.yml logs -f backend
```

### Solution 2 : Mock Auth pour Tests Frontend

En attendant que le backend fonctionne, créer un mock temporaire.

#### Créer un Mock Service
```typescript
// apps/dapp/services/mockAuth.ts
export const mockLogin = async (email: string, password: string) => {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Extraire le rôle du mot de passe
  const role = password; // admin, alumni, student
  
  return {
    token: `mock_token_${Date.now()}`,
    user: {
      id: `mock_${role}_${Date.now()}`,
      email,
      firstname: role.charAt(0).toUpperCase() + role.slice(1),
      lastname: 'Test',
      role: role === 'admin' ? 'admin' : role === 'alumni' ? 'alumni' : 'mentee',
      lightning_address: `${email}@lightning.mock.com`,
      is_onboarded: false,
    },
  };
};
```

#### Modifier AuthContext.tsx
```typescript
// Importer le mock en haut du fichier
import { mockLogin } from '../services/mockAuth';

// Dans la fonction login, au début du switch
case 'custom':
  // TEMPORAIRE : Utiliser le mock pendant que Railway est en panne
  const mockResponse = await mockLogin(credentials.email, credentials.password);
  setUser(mockResponse.user);
  apiClient.setToken(mockResponse.token);
  return; // Sortir avant l'appel API réel
```

### Solution 3 : Attendre et Réessayer

Le backend Railway peut avoir un problème temporaire.

```bash
# Réessayer dans 5-10 minutes
curl https://apirust-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Possibles causes côté Railway** :
- Redémarrage automatique
- Limite de requêtes atteinte
- Mise à jour de la base de données
- Problème réseau temporaire

## 📊 Comparaison des Solutions

| Solution | Avantages | Inconvénients | Temps Setup |
|----------|-----------|---------------|-------------|
| **Backend Local** | ✅ Contrôle total<br>✅ Fiable<br>✅ Offline | ⏰ Build initial long | 10-20 min |
| **Mock Auth** | ✅ Immédiat<br>✅ Tests frontend | ❌ Pas de vraie auth<br>❌ Temporaire | 5 min |
| **Attendre Railway** | ✅ Aucun changement | ⏰ Temps inconnu<br>❌ Pas de contrôle | ?? |

## 🚀 Recommandation

### Pour Continuer Immédiatement
**Utiliser le Mock Auth** (Solution 2) :
- Setup rapide (5 minutes)
- Permet de continuer le développement frontend
- Facile à retirer plus tard

### Pour du Développement Long Terme
**Backend Local** (Solution 1) :
- Plus fiable
- Contrôle complet
- Pas de dépendance externe

## 💡 Instructions Détaillées - Mock Auth

### 1. Créer le Fichier Mock

```bash
cat > apps/dapp/services/mockAuth.ts << 'EOF'
/**
 * Mock Authentication Service
 * TEMPORAIRE : À utiliser pendant que Railway a des problèmes
 */

interface MockUser {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: 'admin' | 'alumni' | 'mentee';
  lightning_address: string;
  is_onboarded: boolean;
}

interface MockLoginResponse {
  token: string;
  user: MockUser;
}

export const mockLogin = async (
  email: string,
  password: string
): Promise<MockLoginResponse> => {
  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Extraire le rôle du mot de passe (admin, alumni, student)
  const role = password.toLowerCase();
  
  // Mapper student -> mentee pour correspondre au backend
  const userRole = 
    role === 'admin' ? 'admin' : 
    role === 'alumni' ? 'alumni' : 
    'mentee';

  const [firstname, lastname] = email.split('@')[0].split('.');
  
  return {
    token: `mock_jwt_${Date.now()}_${role}`,
    user: {
      id: `mock_${role}_${Date.now()}`,
      email,
      firstname: (firstname || role).charAt(0).toUpperCase() + (firstname || role).slice(1),
      lastname: (lastname || 'User').charAt(0).toUpperCase() + (lastname || 'User').slice(1),
      role: userRole,
      lightning_address: `${email.split('@')[0]}@lightning.mock.com`,
      is_onboarded: false,
    },
  };
};

// Log pour indiquer qu'on utilise le mock
console.warn('⚠️ Using MOCK authentication - Railway backend unavailable');
EOF
```

### 2. Modifier AuthContext.tsx

```typescript
// Ajouter l'import en haut
import { mockLogin } from '../services/mockAuth';

// Dans la fonction login(), au début du case 'custom':
case 'credentials':
case 'custom':
  if (!credentials?.email || !credentials?.password) {
    throw new Error('Email et mot de passe requis');
  }
  
  // TEMPORAIRE : Mock auth pendant que Railway est down
  console.warn('🔧 Using MOCK login - Railway backend unavailable');
  const mockResponse = await mockLogin(credentials.email, credentials.password);
  setUser(mockResponse.user);
  apiClient.setToken(mockResponse.token);
  setError(null);
  return; // Sortir avant l'appel API réel
  
  // Le code original reste en commentaire pour restauration facile
  /*
  const testRole = credentials.password;
  ...
  */
```

### 3. Redémarrer le Frontend

```bash
pkill -f "next dev"
cd apps/dapp && npm run dev -- -p 4200
```

### 4. Tester

```
http://localhost:4200/login?debug
```

Cliquer sur n'importe quel bouton de test - ça devrait fonctionner !

## 🔄 Restauration

Quand Railway fonctionnera à nouveau :

### Retirer le Mock
```bash
# Supprimer le fichier mock
rm apps/dapp/services/mockAuth.ts

# Restaurer AuthContext.tsx
# Supprimer l'import et le code mock
# Décommenter le code original
```

### Ou Passer au Backend Local
```bash
# Configurer pour local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local

# Démarrer le backend
docker-compose -f docker-compose.dev.yml up -d

# Redémarrer frontend
pkill -f "next dev"
cd apps/dapp && npm run dev -- -p 4200
```

## 📝 Notes

- Le mock ne crée pas de vrai JWT
- Le mock ne touche pas à la base de données
- Parfait pour tester les interfaces utilisateur
- À retirer avant la production !

---

**Choisissez la solution qui convient le mieux à votre situation actuelle !**
