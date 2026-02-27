# 📋 Résumé : Correction Erreur 502 sur app.token-for-good.com

**Date :** 24 octobre 2025  
**Status :** ✅ Scripts créés - Prêt à appliquer  
**Action requise :** Exécuter le script sur le serveur

---

## 🎯 Problème Identifié

### Situation Actuelle

```
https://app.token-for-good.com/       → ❌ 502 Bad Gateway
https://app.token-for-good.com/health → ✅ 200 OK (backend fonctionne)
https://api.token-for-good.com/       → ✅ OK (MCP préservé)
```

### Diagnostic

D'après les documents analysés (`FRONTEND_PRODUCTION_STATUS.md`) :

1. ✅ Backend Rust fonctionne (port 3001)
2. ✅ Frontend fonctionne **localement** (localhost:3000)
3. ❌ Frontend **ne fonctionne pas via Nginx** (502 Bad Gateway)

**Cause probable :** Configuration Nginx incompatible avec Next.js standalone ou service frontend arrêté.

---

## ✅ Solution Créée

J'ai créé **3 fichiers** pour vous aider à corriger le problème :

### 1. Script Automatique de Correction
📁 **`scripts/fix-t4g-502.sh`**

Ce script fait tout automatiquement :
- Diagnostique le problème
- Redémarre le frontend si nécessaire
- Sauvegarde la configuration Nginx actuelle
- Applique une nouvelle configuration optimisée
- Teste le résultat

**Utilisation :**
```bash
scp scripts/fix-t4g-502.sh root@147.79.101.32:/tmp/
ssh root@147.79.101.32 'bash /tmp/fix-t4g-502.sh'
```

### 2. Script de Diagnostic
📁 **`scripts/diagnose-t4g-502.sh`**

Pour diagnostiquer uniquement (sans modifier) :
```bash
scp scripts/diagnose-t4g-502.sh root@147.79.101.32:/tmp/
ssh root@147.79.101.32 'bash /tmp/diagnose-t4g-502.sh'
```

### 3. Documentation Complète
📁 **`FIX_502_INSTRUCTIONS.md`** - Guide détaillé avec méthode manuelle  
📁 **`QUICKFIX_502.md`** - Version rapide (2 minutes)

---

## 🚀 Prochaines Étapes

### Option A : Correction Automatique (Recommandé - 2 min)

```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G

# 1. Copier le script
scp scripts/fix-t4g-502.sh root@147.79.101.32:/tmp/

# 2. Exécuter
ssh root@147.79.101.32 'bash /tmp/fix-t4g-502.sh'

# 3. Vérifier dans votre navigateur
open https://app.token-for-good.com/
```

### Option B : Correction Manuelle (5 min)

Suivez le guide : [`FIX_502_INSTRUCTIONS.md`](./FIX_502_INSTRUCTIONS.md)

---

## 🔧 Ce que fait le script

1. **Diagnostic complet**
   - Vérifie les services (frontend, backend, nginx)
   - Teste les ports (3000, 3001, 8000)
   - Analyse les logs

2. **Redémarrage intelligent**
   - Redémarre le frontend si nécessaire
   - Attend que le service soit prêt
   - Vérifie qu'il répond localement

3. **Configuration Nginx optimisée**
   - Backup de l'ancienne config
   - Nouvelle config compatible Next.js standalone
   - Préserve la cohabitation avec MCP (api.token-for-good.com)

4. **Validation**
   - Teste la configuration avant de l'appliquer
   - Recharge Nginx sans interruption
   - Vérifie que le site fonctionne

5. **Rollback automatique**
   - Si la config échoue, restaure l'ancienne
   - Aucun risque de casser le serveur

---

## 📊 Résultat Attendu

Après l'exécution du script :

```bash
✅ Frontend local:  200/307
✅ Frontend public: 200/307
✅ Backend health:  200
✅ MCP préservé:    OK
```

Le site sera accessible :
- **https://app.token-for-good.com/** → Page d'accueil ✅
- **https://app.token-for-good.com/health** → Backend API ✅
- **https://api.token-for-good.com/** → MCP préservé ✅

---

## 🔍 Points Clés de la Configuration Nginx

La nouvelle configuration inclut :

### Routing Séparé
```nginx
server_name app.token-for-good.com;  # Seulement T4G (ne touche pas MCP)
```

### Proxy Frontend Optimisé
```nginx
location / {
    proxy_pass http://127.0.0.1:3000;  # localhost → 127.0.0.1
    proxy_http_version 1.1;
    
    # Headers WebSocket pour Next.js
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    
    # Timeouts généreux
    proxy_connect_timeout 60s;
    proxy_read_timeout 60s;
    
    # Buffering désactivé
    proxy_buffering off;
}
```

### Backend API Préservé
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3001/api/;
    # ... (configuration existante)
}
```

---

## 🛡️ Sécurité

- ✅ Backup automatique avant modification
- ✅ Test de configuration avant application
- ✅ Rollback si erreur
- ✅ Préservation de la config MCP
- ✅ Aucune interruption de service

---

## 📞 Support

### Si le script échoue

1. **Voir les logs du script** (il affiche tout en temps réel)
2. **Consulter la documentation** : `FIX_502_INSTRUCTIONS.md`
3. **Diagnostic manuel** : `scripts/diagnose-t4g-502.sh`

### Commandes utiles

```bash
# Sur le serveur
systemctl status token4good-frontend
journalctl -u token4good-frontend -n 50
tail -f /var/log/nginx/t4g-error.log
```

---

## ✨ Conclusion

Tous les outils sont prêts pour corriger l'erreur 502 :

| Fichier | Description | Usage |
|---------|-------------|-------|
| `fix-t4g-502.sh` | Script de correction automatique | **Recommandé** |
| `diagnose-t4g-502.sh` | Diagnostic uniquement | Debug |
| `FIX_502_INSTRUCTIONS.md` | Guide complet | Référence |
| `QUICKFIX_502.md` | Version rapide | Quick start |

---

**Action immédiate :**

```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G
cat QUICKFIX_502.md
```

**Deadline :** 28 octobre 2025 (Go-Live)  
**Temps estimé :** 2-5 minutes  
**Risque :** Très faible (backup + rollback automatique)

---

**Créé le :** 24 octobre 2025  
**Status :** ✅ Prêt à déployer

