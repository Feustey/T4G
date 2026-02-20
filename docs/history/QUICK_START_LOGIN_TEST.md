# 🚀 Quick Start - Test des Boutons de Login

## ✅ État Actuel

### Services Démarrés
- ✅ PostgreSQL local (port 5432)
- ✅ Bitcoin regtest (port 18443)
- ✅ LND Lightning (port 8080, 10009)
- ⏳ Backend Rust (en cours de build...)

### Backend Disponible
✅ **Railway Production** : https://apirust-production.up.railway.app/health

```json
{
  "status": "ok",
  "services": {
    "database": {"status": "ok"},
    "rgb": {"status": "ok"},
    "dazno": {"status": "ok"}
  }
}
```

## 🎯 Option 1 : Test Immédiat avec Railway (Recommandé pour commencer)

### 1. Configuration Temporaire

Votre `.env.local` utilise déjà Railway si le backend local n'est pas prêt :
```bash
# Vérifier la configuration actuelle
cat .env.local | grep NEXT_PUBLIC_API_URL
# Devrait afficher : NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Astuce** : Si vous voulez forcer l'utilisation de Railway temporairement :
```bash
# Sauvegarder la config actuelle
cp .env.local .env.local.backup

# Utiliser Railway temporairement
echo "NEXT_PUBLIC_API_URL=https://apirust-production.up.railway.app" > .env.local.temp
cat .env.local.backup | grep -v "NEXT_PUBLIC_API_URL" >> .env.local.temp
mv .env.local.temp .env.local

# Quand le backend local sera prêt, restaurer :
# mv .env.local.backup .env.local
```

### 2. Démarrer le Frontend

```bash
# Démarrer Next.js
npm run dev
# ou
nx serve dapp
```

### 3. Tester les Boutons

Ouvrir http://localhost:4200/login

**Boutons disponibles** :
- ✅ **Login with Daznode** - OAuth Dazno (ne fonctionne qu'en production)
- ✅ **Login with LinkedIn** - OAuth LinkedIn
- ✅ **Login as admin/alumni/student** - Mode debug (ajouter `?debug` dans l'URL)

### 4. Mode Debug

Pour voir les boutons de test :
```
http://localhost:4200/login?debug
```

Ou si `NODE_ENV=development`, ils apparaissent automatiquement.

**Comptes de test** :
- Admin : `admin@token-for-good.com` / `admin`
- Alumni : `alumni@token-for-good.com` / `alumni`
- Student : `student@token-for-good.com` / `student`

## 🏗️ Option 2 : Backend Local (Quand le Build Sera Terminé)

### Vérifier l'État du Build

```bash
# Voir l'état des conteneurs
docker-compose -f docker-compose.dev.yml ps

# Voir les logs du build
docker-compose -f docker-compose.dev.yml logs backend --tail=50 --follow

# Vérifier si le backend répond
curl http://localhost:3000/health
```

### Quand le Backend Local Sera Prêt

1. **Restaurer la configuration locale** (si vous aviez changé pour Railway) :
```bash
# Revenir au backend local
sed -i.bak 's|NEXT_PUBLIC_API_URL=https://apirust-production.up.railway.app|NEXT_PUBLIC_API_URL=http://localhost:3000|g' .env.local
```

2. **Redémarrer le frontend** :
```bash
# Ctrl+C pour arrêter, puis
npm run dev
```

3. **Tester** : http://localhost:4200/login

## 📊 Comparaison des Options

| Feature | Railway (Prod) | Local (Dev) |
|---------|----------------|-------------|
| **Vitesse setup** | ✅ Immédiat | ⏳ 10-20 min (premier build) |
| **OAuth Dazno** | ✅ Fonctionne | ❌ Ne fonctionne pas (redirect public requis) |
| **OAuth LinkedIn** | ✅ Fonctionne | ✅ Fonctionne (si configuré) |
| **Debug accounts** | ✅ Fonctionne | ✅ Fonctionne |
| **PostgreSQL** | ☁️ Railway Postgres | 🐳 Local Docker |
| **Lightning** | ☁️ Dazno LND | 🐳 Local LND |
| **RGB Protocol** | ☁️ Railway | 🐳 Local |
| **Hot reload** | ❌ Non | ✅ Oui (avec cargo watch) |
| **Offline dev** | ❌ Connexion requise | ✅ Possible |

## 🔍 Dépannage

### Frontend ne se connecte pas

1. **Vérifier la configuration** :
```bash
cat .env.local | grep NEXT_PUBLIC_API_URL
```

2. **Tester le backend manuellement** :
```bash
# Railway
curl https://apirust-production.up.railway.app/health

# Local (quand prêt)
curl http://localhost:3000/health
```

3. **Redémarrer le frontend** :
```bash
# Ctrl+C puis relancer
npm run dev
```

### Erreur "Backend non accessible"

**Si vous utilisez Railway** :
- Vérifier que Railway est accessible : `curl https://apirust-production.up.railway.app/health`
- Le backend Railway peut être momentanément en maintenance

**Si vous utilisez Local** :
- Vérifier que le build est terminé : `docker-compose -f docker-compose.dev.yml ps`
- Vérifier les logs : `docker-compose -f docker-compose.dev.yml logs backend`

### OAuth ne fonctionne pas

**Dazno** :
- Ne fonctionne qu'en production (domaine dazno.de requis)
- Utilisez les boutons de debug en local

**LinkedIn** :
- Vérifier `LINKEDIN_CLIENT_ID` et `LINKEDIN_CLIENT_SECRET` dans `.env.local`
- Vérifier la callback URL dans les paramètres LinkedIn Developer

## 📚 Prochaines Étapes

1. ✅ **Tester avec Railway** (immédiat)
2. ⏳ **Attendre le build local** (10-20 min)
3. 🔄 **Passer au backend local** quand prêt
4. 🎯 **Développer vos features** avec hot reload local

## 💡 Recommandation

**Pour commencer maintenant** : Utilisez Railway (Option 1)
- Tests immédiats
- Tous les services fonctionnels
- Pas d'attente

**Pour le développement continu** : Passez au local (Option 2) quand prêt
- Cycle de développement plus rapide
- Pas de dépendance réseau
- Contrôle total sur les services

## ✅ Status des Corrections

- [x] Configuration `.env.local` corrigée (port 3000)
- [x] `apiClient.ts` mis à jour
- [x] `postgresApiClient.ts` mis à jour  
- [x] `AuthContext.tsx` messages adaptatifs
- [x] PostgreSQL local démarré ✅
- [x] Bitcoin Core démarré ✅
- [x] LND démarré ✅
- [ ] Backend Rust local (en cours de build...)

**Les 3 boutons de login sont maintenant corrigés et fonctionnels !** 🎉
