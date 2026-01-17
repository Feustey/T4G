# 🚀 Déployer l'OAuth LinkedIn - Guide Rapide (10 minutes)

**Objectif :** Faire fonctionner le bouton "Login with LinkedIn" sur https://t4g.dazno.de/login

---

## ✅ Étape 1 : Créer l'Application LinkedIn (5 min)

### 1.1 Créer l'App

1. Allez sur https://www.linkedin.com/developers/apps
2. Cliquez sur **"Create app"**
3. Remplissez :
   - **App name:** `Token4Good`
   - **LinkedIn Page:** Sélectionnez votre page entreprise
   - **Privacy policy URL:** `https://t4g.dazno.de/privacy`
   - **App logo:** Téléchargez votre logo
4. Acceptez les conditions et cliquez **"Create app"**

### 1.2 Activer "Sign In with LinkedIn"

1. Dans votre application, allez dans l'onglet **"Products"**
2. Trouvez **"Sign In with LinkedIn using OpenID Connect"**
3. Cliquez sur **"Request access"** (ou "Select" si disponible)
4. L'activation est généralement instantanée

### 1.3 Configurer les Redirect URIs

1. Allez dans l'onglet **"Auth"**
2. Dans la section **"OAuth 2.0 settings"**
3. Sous **"Authorized redirect URLs for your app"**, ajoutez :
   ```
   https://t4g.dazno.de/auth/callback/linkedin
   ```
4. Pour le développement local, ajoutez aussi :
   ```
   http://localhost:4200/auth/callback/linkedin
   ```
5. Cliquez **"Update"**

### 1.4 Récupérer les Credentials

1. Restez dans l'onglet **"Auth"**
2. Copiez le **"Client ID"** (commence par "78...")
3. Copiez le **"Client Secret"** (cliquez sur "Show" si nécessaire)
4. ⚠️ **IMPORTANT :** Gardez ces informations en sécurité !

---

## ✅ Étape 2 : Configurer Vercel (3 min)

### Option A : Via le Dashboard Vercel (Recommandé)

1. Allez sur https://vercel.com
2. Sélectionnez votre projet **Token4Good**
3. Allez dans **Settings → Environment Variables**
4. Ajoutez les variables suivantes (cliquez "Add New" pour chaque) :

| Name | Value | Environment |
|------|-------|-------------|
| `LINKEDIN_CLIENT_ID` | `78...` (votre Client ID) | Production |
| `LINKEDIN_CLIENT_SECRET` | `xxx...` (votre Client Secret) | Production |
| `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` | `78...` (même que ci-dessus) | Production |
| `NEXT_PUBLIC_APP_URL` | `https://t4g.dazno.de` | Production |

5. Cliquez **"Save"** pour chaque variable

### Option B : Via le CLI Vercel

```bash
# Dans le terminal, à la racine du projet
vercel env add LINKEDIN_CLIENT_ID production
# Entrez votre Client ID quand demandé

vercel env add LINKEDIN_CLIENT_SECRET production
# Entrez votre Client Secret quand demandé

vercel env add NEXT_PUBLIC_LINKEDIN_CLIENT_ID production
# Entrez votre Client ID quand demandé

vercel env add NEXT_PUBLIC_APP_URL production
# Entrez: https://t4g.dazno.de
```

---

## ✅ Étape 3 : Déployer sur Vercel (2 min)

### Option A : Auto-deployment (si GitHub connecté)

```bash
# Commit et push les changements
git add .
git commit -m "feat: Implémentation OAuth LinkedIn complète"
git push origin main

# Vercel déploiera automatiquement
```

### Option B : Déploiement manuel

```bash
# À la racine du projet
vercel --prod

# Attendre la fin du déploiement
```

---

## ✅ Étape 4 : Tester (2 min)

### 4.1 Test Rapide

1. Ouvrez https://t4g.dazno.de/login
2. Cliquez sur **"Login with LinkedIn"**
3. Vous devriez être redirigé vers LinkedIn
4. Autorisez l'application
5. Vous devriez revenir sur Token4Good et être connecté
6. Vérifiez que vous êtes redirigé vers le dashboard

### 4.2 Vérifier les Logs (si problème)

```bash
# Logs Vercel
vercel logs --follow

# Ou dans le dashboard
# https://vercel.com/votre-projet/deployments → Sélectionner le dernier → Functions
```

---

## 🐛 Troubleshooting Rapide

### Erreur : "Configuration LinkedIn manquante"

**Cause :** Les variables d'environnement ne sont pas définies sur Vercel.

**Solution :**
1. Vérifiez que les variables sont bien ajoutées sur Vercel
2. Redéployez l'application
3. Videz le cache du browser (Ctrl+Shift+R)

### Erreur : "redirect_uri_mismatch"

**Cause :** L'URL de redirect n'est pas autorisée dans LinkedIn.

**Solution :**
1. Allez sur https://www.linkedin.com/developers/apps
2. Sélectionnez votre app
3. Onglet "Auth" → "Authorized redirect URLs"
4. Vérifiez que `https://t4g.dazno.de/auth/callback/linkedin` est bien ajoutée
5. **Attention :** Pas de slash final, et HTTPS obligatoire en production

### Erreur : "Échec échange token LinkedIn"

**Cause :** Le Client Secret est incorrect.

**Solution :**
1. Retournez sur LinkedIn Developers
2. Vérifiez le Client Secret (cliquez "Show")
3. Remettez-le à jour sur Vercel
4. Redéployez

### Le bouton ne fait rien

**Cause :** Erreur JavaScript ou variables mal configurées.

**Solution :**
1. Ouvrez la Console du navigateur (F12)
2. Regardez les erreurs affichées
3. Si "LINKEDIN_CLIENT_ID non configuré" :
   - Ajoutez `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` sur Vercel
   - Redéployez

---

## 📋 Checklist Finale

Avant de considérer que c'est terminé, vérifiez :

- [ ] Application LinkedIn créée et validée
- [ ] Produit "Sign In with LinkedIn using OpenID Connect" activé
- [ ] Redirect URI `https://t4g.dazno.de/auth/callback/linkedin` ajoutée
- [ ] `LINKEDIN_CLIENT_ID` ajouté sur Vercel (Production)
- [ ] `LINKEDIN_CLIENT_SECRET` ajouté sur Vercel (Production)
- [ ] `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` ajouté sur Vercel (Production)
- [ ] `NEXT_PUBLIC_APP_URL` = `https://t4g.dazno.de` sur Vercel
- [ ] Code déployé sur Vercel
- [ ] Test complet du flow réussi
- [ ] Utilisateur créé dans la base de données
- [ ] JWT token reçu et stocké
- [ ] Redirection vers dashboard fonctionne

---

## 🎉 Succès !

Si tous les tests passent, l'authentification LinkedIn est maintenant fonctionnelle sur **https://t4g.dazno.de/login** ! 🎊

### Prochaines Étapes (Optionnel)

- [ ] Configurer t4g OAuth (si utilisé)
- [ ] Personnaliser les messages d'erreur
- [ ] Ajouter des analytics pour tracker les connexions
- [ ] Tester sur mobile

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez **[OAUTH_LINKEDIN_CONFIGURATION.md](./OAUTH_LINKEDIN_CONFIGURATION.md)** pour plus de détails
2. Vérifiez les logs Vercel : `vercel logs --follow`
3. Consultez la console du browser (F12)
4. Vérifiez la documentation LinkedIn : https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2

---

**Temps estimé total :** 10 minutes  
**Difficulté :** ⭐⭐☆☆☆ (Facile)  
**Statut après completion :** ✅ Production Ready
