# 🎯 Guide Rapide - Correction Assets & Images

**Temps estimé :** 3 minutes  
**Difficulté :** Facile (configuration UI)

---

## ✅ Solution Simple - Dashboard Vercel

### Étapes

1. **Aller sur Vercel Dashboard**
   ```
   https://vercel.com/feusteys-projects/t4-g
   ```

2. **Settings → General**
   - Cliquer sur "Settings" dans le menu
   - Aller dans "General"

3. **Root Directory**
   - Trouver la section "Root Directory"
   - Changer de `./` vers `apps/dapp`
   - Cliquer "Save"

4. **Redéployer**
   - Aller dans "Deployments"
   - Cliquer sur le dernier déploiement
   - Cliquer "Redeploy"

### Pourquoi ça marche ?
Vercel cherche automatiquement le dossier `public/` à la racine du projet Next.js. En définissant `apps/dapp` comme Root Directory, Vercel trouvera `apps/dapp/public/` correctement.

---

## 🔄 Solution Alternative - Build avec Framework null

Si la solution ci-dessus ne fonctionne pas, j'ai préparé une configuration alternative dans le code.

### Commit Ready to Push
```bash
git add apps/dapp/build.sh vercel.json
git commit -m "feat: Build script personnalisé pour assets"
git push origin main
```

**Fichiers modifiés :**
- ✅ `apps/dapp/build.sh` - Script de build
- ✅ `vercel.json` - Configuration avec `framework: null`

---

## 🧪 Tests à Effectuer

Après redéploiement :

```bash
# 1. Favicon
curl -I https://t4g.dazno.de/favicon.ico
# Attendu : HTTP/2 200

# 2. Image
curl -I https://t4g.dazno.de/assets/images/png/spinner.png
# Attendu : HTTP/2 200

# 3. Page d'accueil
curl https://t4g.dazno.de
# Attendu : Page complète avec images chargées
```

---

## 📊 Status Actuel

### ✅ Fonctionnel
- Page d'accueil : HTTP 200
- JavaScript : Chargé
- Routing : OK  
- Backend API : OK

### ❌ Non Fonctionnel
- Images : HTTP 404
- Favicon : HTTP 404
- Assets statiques : HTTP 404

---

## 🎯 Quelle Solution Choisir ?

| Solution | Difficulté | Temps | Recommandé |
|----------|------------|-------|------------|
| **Dashboard Vercel** | ⭐ Facile | 3 min | ✅ OUI |
| **Build Script** | ⭐⭐ Moyen | 5 min | Si échec #1 |

---

## 💡 Note Importante

**La page fonctionne actuellement** mais sans images. Si les images ne sont pas critiques immédiatement, vous pouvez :

1. ✅ Configurer le Root Directory tranquillement
2. ✅ Tester sur un déploiement de preview d'abord
3. ✅ Redéployer en production quand prêt

**L'application est utilisable** - c'est juste un problème d'UX avec les images manquantes.

---

## 📞 Support

Si aucune solution ne fonctionne :
1. Vérifier les logs Vercel : https://vercel.com/feusteys-projects/t4-g/deployments
2. Chercher "public" ou "assets" dans les logs
3. Me contacter avec les logs

---

**Prochaine action recommandée : Configurer Root Directory sur Vercel** 🚀
