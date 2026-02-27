# Système de Fallback Offline pour Token4Good

## 📋 Vue d'ensemble

Le système de fallback permet à l'application de continuer à fonctionner même lorsque l'API backend (`api.token-for-good.com`) est indisponible. Il utilise un cache local (LocalStorage) et des données de fallback pour offrir une expérience utilisateur dégradée mais fonctionnelle.

## 🏗️ Architecture

### 1. **Cache LocalStorage** (Niveau 1)
- Sauvegarde automatique des réponses API réussies
- Expiration configurable (par défaut 24h)
- Utilisé en cas d'échec réseau

### 2. **Données de Fallback** (Niveau 2)
- Valeurs par défaut statiques
- Utilisées si le cache est vide ou expiré
- Définies dans `services/fallbackData.ts`

### 3. **Retry avec Exponential Backoff**
- 3 tentatives par défaut
- Délais : 1s, 2s, 4s
- Timeout de 10s par tentative

## 📁 Fichiers modifiés/créés

### Nouveaux fichiers
```
apps/dapp/
├── services/
│   └── fallbackData.ts          # Données de fallback statiques
├── contexts/
│   └── NetworkContext.tsx       # Gestion état réseau global
├── components/
│   └── OfflineBanner.tsx        # Composant UI pour mode offline
└── hooks/
    └── useApiWithFallback.ts    # Hook personnalisé avec fallback
```

### Fichiers modifiés
```
apps/dapp/
├── services/
│   ├── apiClient.ts             # Ajout cache + retry
│   ├── config.ts                # Amélioration apiFetcher
│   └── postgresApiClient.ts     # Ajout cache + retry
├── pages/
│   ├── _app.tsx                 # Intégration NetworkProvider
│   └── dashboard.tsx            # Utilisation du nouveau système
├── components/
│   └── index.tsx                # Export OfflineBanner
└── hooks/
    └── index.tsx                # Export useApiWithFallback
```

## 🚀 Utilisation

### Méthode 1 : Hook personnalisé (Recommandé)

```typescript
import { useApiWithFallback } from '../hooks';
import { FALLBACK_METRICS } from '../services/fallbackData';

function MyComponent() {
  const { 
    data, 
    error, 
    isLoading, 
    isUsingCache, 
    hasNetworkIssue 
  } = useApiWithFallback('/api/metrics', {
    fallbackData: FALLBACK_METRICS,
    retries: 3,
    timeout: 10000
  });

  return (
    <div>
      {hasNetworkIssue && <OfflineBanner isUsingCache={isUsingCache} />}
      {/* Votre UI */}
    </div>
  );
}
```

### Méthode 2 : SWR manuel avec fallback

```typescript
import useSWR from 'swr';
import { apiFetcher } from '../services/config';
import { FALLBACK_METRICS } from '../services/fallbackData';

function MyComponent() {
  const { data = FALLBACK_METRICS, error } = useSWR(
    '/api/metrics',
    apiFetcher,
    {
      fallbackData: FALLBACK_METRICS,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    }
  );
}
```

### Méthode 3 : ApiClient direct (avec cache automatique)

```typescript
import { apiClient } from '../services/apiClient';

async function fetchData() {
  try {
    const user = await apiClient.getCurrentUser();
    // Les données sont automatiquement mises en cache
  } catch (error) {
    // En cas d'erreur réseau, le cache est automatiquement utilisé
    console.error(error);
  }
}
```

## 🎯 Contexte Réseau

Le `NetworkContext` fournit des informations sur l'état du réseau :

```typescript
import { useNetwork } from '../contexts/NetworkContext';

function MyComponent() {
  const { isOnline, apiAvailable, checkAPI } = useNetwork();

  return (
    <div>
      {!isOnline && <p>Vous êtes hors ligne</p>}
      {isOnline && !apiAvailable && <p>API indisponible</p>}
      <button onClick={checkAPI}>Vérifier l'API</button>
    </div>
  );
}
```

## 📊 Composant OfflineBanner

Banner d'avertissement prêt à l'emploi :

```typescript
import { OfflineBanner } from '../components';

function MyPage() {
  const { hasNetworkIssue, isUsingCache } = useApiWithFallback(...);

  return (
    <div>
      {hasNetworkIssue && (
        <OfflineBanner 
          isUsingCache={isUsingCache}
          onRetry={() => window.location.reload()}
        />
      )}
      {/* Contenu de la page */}
    </div>
  );
}
```

## ⚙️ Configuration

### Modifier la durée du cache

Dans `apiClient.ts` ou `postgresApiClient.ts` :

```typescript
class APIClient {
  private cacheExpiry = 48 * 60 * 60 * 1000; // 48 heures au lieu de 24
}
```

### Modifier le nombre de retries

Dans `config.ts`, fonction `apiFetcher` :

```typescript
export const apiFetcher = async <T = unknown>(
  path: string,
  options: {
    retries?: number;      // Par défaut 3
    timeout?: number;      // Par défaut 10000ms
    useCacheFallback?: boolean;  // Par défaut true
  } = {}
): Promise<T> => {
  // ...
}
```

### Ajouter de nouvelles données de fallback

Dans `services/fallbackData.ts` :

```typescript
export const FALLBACK_MY_DATA = {
  field1: 'default',
  field2: 0,
  // ...
};
```

## 🧪 Tests

### Tester le mode offline

1. **Désactiver le backend** :
   ```bash
   # Arrêter le serveur backend
   ```

2. **Tester dans le navigateur** :
   - Ouvrir DevTools → Network → "Offline"
   - L'application devrait continuer à fonctionner avec les données en cache

3. **Vérifier les logs** :
   ```
   ⚠️ Toutes les tentatives ont échoué pour /api/metrics, utilisation du cache
   ✅ Utilisation du cache pour GET_/api/metrics
   ```

### Tester l'expiration du cache

```javascript
// Dans la console du navigateur
localStorage.clear(); // Vider le cache
window.location.reload(); // Recharger la page
// → Devrait afficher les données de fallback par défaut
```

## 📝 Bonnes pratiques

### ✅ À faire

- Toujours définir une `fallbackData` pour les appels API critiques
- Utiliser le composant `OfflineBanner` pour informer l'utilisateur
- Logger les utilisations du cache pour le monitoring
- Tester régulièrement le mode offline

### ❌ À éviter

- Ne pas supposer que l'API est toujours disponible
- Ne pas bloquer l'UI complètement en cas d'erreur réseau
- Ne pas cacher les données en cache sans informer l'utilisateur
- Ne pas mettre de données sensibles dans le cache (tokens, mots de passe)

## 🔍 Debugging

### Vérifier l'état du cache

```javascript
// Dans la console du navigateur
Object.keys(localStorage)
  .filter(key => key.startsWith('api_cache_'))
  .forEach(key => {
    const data = JSON.parse(localStorage.getItem(key));
    console.log(key, data);
  });
```

### Effacer le cache

```javascript
// Effacer tout le cache API
Object.keys(localStorage)
  .filter(key => 
    key.startsWith('api_cache_') || 
    key.startsWith('fetcher_cache_') || 
    key.startsWith('postgres_cache_')
  )
  .forEach(key => localStorage.removeItem(key));
```

## 🎨 Personnalisation UI

Le composant `OfflineBanner` peut être personnalisé :

```typescript
<OfflineBanner 
  isUsingCache={true}
  onRetry={async () => {
    await checkAPI();
    mutate(); // Revalider les données SWR
  }}
  onRefresh={() => {
    // Logique personnalisée
  }}
/>
```

## 📈 Monitoring

Le système log automatiquement :

- ✅ Succès des appels API
- ⚠️ Utilisations du cache
- 🔴 Erreurs réseau
- ⏳ Tentatives de retry

Exemple de logs :

```
✅ API disponible: true
⏳ Retry 1/3 pour /api/metrics...
⚠️ Toutes les tentatives ont échoué pour /api/metrics, utilisation du cache
🔴 API indisponible: Error: Failed to fetch
```

## 🚀 Déploiement

Aucune configuration supplémentaire nécessaire. Le système fonctionne automatiquement en :

- **Développement** : `http://localhost:3000`
- **Production** : `https://api.token-for-good.com`

Variables d'environnement à configurer :

```env
NEXT_PUBLIC_API_URL=https://api.token-for-good.com
```

## 📚 Ressources

- [SWR Documentation](https://swr.vercel.app/)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)
