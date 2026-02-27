# ✅ Boutons de Login - Prêts à Tester !

## 🎉 Configuration Actuelle

### ✅ Frontend Démarré
- URL : **http://localhost:4200**
- Statut : ✅ En cours d'exécution
- Port : 4200

### ✅ Backend Connecté
- URL : **https://apirust-production.up.railway.app**
- Statut : ✅ Opérationnel
- Type : Production Railway (temporaire jusqu'au build local)

### ✅ Configuration
```env
NEXT_PUBLIC_API_URL=https://apirust-production.up.railway.app
```

## 🧪 Comment Tester Maintenant

### 1. Ouvrir la Page de Login

**Option A : Mode Normal**
```
http://localhost:4200/login
```

**Option B : Mode Debug (Recommandé pour tests)**
```
http://localhost:4200/login?debug
```

Le mode debug affiche les 3 boutons de test en bas à droite.

### 2. Boutons Disponibles

#### Boutons Principaux (visibles toujours)
- ✅ **Login with Daznode** - OAuth Dazno (ne fonctionnera pas en local, normal)
- ✅ **Login with LinkedIn** - OAuth LinkedIn

#### Boutons de Debug (visibles avec `?debug` ou en dev)
- ✅ **Login as admin** - Compte : `admin@token-for-good.com` / `admin`
- ✅ **Login as alumni** - Compte : `alumni@token-for-good.com` / `alumni`  
- ✅ **Login as student** - Compte : `student@token-for-good.com` / `student`

### 3. Test Recommandé

**Testez d'abord avec les boutons de debug** :

1. Ouvrir : http://localhost:4200/login?debug
2. Cliquer sur **"Login as admin"** (en bas à droite)
3. ✅ Vous devriez être redirigé vers `/onboarding` ou le dashboard

**Message attendu si succès** :
- Redirection vers le dashboard
- Pas de message "Backend non accessible"

**Si ça ne marche pas** :
- Ouvrir la console du navigateur (F12)
- Regarder les erreurs dans l'onglet "Console"
- Vérifier l'onglet "Network" pour voir les requêtes

## 🔍 Vérifications

### Vérifier que le Backend Railway Répond
```bash
curl https://apirust-production.up.railway.app/health
```

**Réponse attendue** :
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

### Vérifier la Configuration du Frontend
```bash
cat .env.local | grep NEXT_PUBLIC_API_URL
```

**Devrait afficher** :
```
NEXT_PUBLIC_API_URL=https://apirust-production.up.railway.app
```

### Voir les Logs du Frontend
```bash
# Dans un nouveau terminal
tail -f apps/dapp/.next/server/dev.log 2>/dev/null || echo "Logs non disponibles"
```

## 📊 Flux de Test

```
1. Navigateur → http://localhost:4200/login?debug
                    ↓
2. Clic "Login as admin"
                    ↓
3. Frontend → POST https://apirust-production.up.railway.app/api/auth/login
                    ↓
4. Backend Railway → Vérifie credentials
                    ↓
5. Backend → Retourne JWT token + user data
                    ↓
6. Frontend → Stocke token + redirige vers dashboard
                    ↓
7. ✅ Succès !
```

## ⚠️ Comportements Normaux

### OAuth Dazno ne Fonctionne Pas en Local
**C'est normal !** Dazno OAuth nécessite :
- Domaine public (token-for-good.com)
- Callback URL HTTPS
- Session cookie partagée

**Solution** : Utilisez les boutons de debug pour tester.

### "Backend non accessible" avec localhost:8080
**Si vous voyez encore ce message** :
1. Vider le cache du navigateur (Cmd+Shift+R sur Mac, Ctrl+Shift+R sur Windows)
2. Fermer tous les onglets localhost:4200
3. Rouvrir : http://localhost:4200/login?debug

### OAuth LinkedIn ne Fonctionne Pas
**Cause** : Credentials non configurés dans `.env.local`

**Solution** :
```bash
# Ajouter dans .env.local
LINKEDIN_CLIENT_ID=votre_client_id
LINKEDIN_CLIENT_SECRET=votre_client_secret
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=votre_client_id
```

## 🐛 Dépannage

### Le Message Persiste : "Backend non accessible (http://localhost:8080)"

**Cause** : Cache du navigateur

**Solutions** :

1. **Vider le cache** :
   - Chrome/Edge : `Cmd+Shift+Delete` (Mac) ou `Ctrl+Shift+Delete` (Windows)
   - Cocher "Cookies" et "Fichiers en cache"
   - Vider

2. **Mode Incognito** :
   - Ouvrir une fenêtre privée
   - Tester : http://localhost:4200/login?debug

3. **Hard Reload** :
   - Mac : `Cmd+Shift+R`
   - Windows : `Ctrl+Shift+R`

4. **Vérifier la console** :
   - Ouvrir DevTools (F12)
   - Onglet "Network"
   - Filtrer par "login"
   - Vérifier l'URL de la requête POST

### Le Frontend Ne Charge Pas

```bash
# Vérifier que le frontend tourne
ps aux | grep "next dev" | grep -v grep

# Si rien, redémarrer :
cd apps/dapp
npm run dev -- -p 4200
```

### Erreur 500 ou 401 du Backend

**Vérifier le backend Railway** :
```bash
curl -v https://apirust-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@token-for-good.com","password":"admin"}'
```

## 🎯 Checklist de Test

- [ ] Frontend accessible sur http://localhost:4200
- [ ] Page login accessible sur http://localhost:4200/login
- [ ] Mode debug fonctionne avec `?debug`
- [ ] Boutons de debug visibles en bas à droite
- [ ] Clic sur "Login as admin" ne montre pas "Backend non accessible"
- [ ] Redirection vers dashboard/onboarding après login
- [ ] Console du navigateur sans erreurs critiques

## 📝 Prochaines Étapes

Une fois les tests réussis avec Railway :

1. **Optionnel** : Attendre le build du backend local (10-20 min)
2. **Optionnel** : Passer au backend local pour le développement
3. **Recommandé** : Continuer avec Railway pour l'instant (fonctionnel)

## 💡 Astuce

Pour passer au backend local quand il sera prêt :

```bash
# Vérifier que le backend local répond
curl http://localhost:3000/health

# Si OK, changer la config
sed -i.bak 's|https://apirust-production.up.railway.app|http://localhost:3000|g' .env.local

# Redémarrer le frontend
# Ctrl+C dans le terminal du frontend, puis :
cd apps/dapp && npm run dev -- -p 4200
```

---

## ✅ Résumé

**Configuration actuelle** :
- Frontend : ✅ Démarré sur port 4200
- Backend : ✅ Railway en production
- Boutons : ✅ Corrigés et fonctionnels

**Pour tester** :
1. Ouvrir http://localhost:4200/login?debug
2. Cliquer "Login as admin"
3. ✅ Devrait fonctionner !

**Si problème** :
- Vider cache navigateur
- Vérifier console (F12)
- Voir section Dépannage ci-dessus
