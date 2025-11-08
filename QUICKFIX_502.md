# ⚡ Quick Fix - Erreur 502 sur t4g.dazno.de

**3 commandes pour corriger le problème**

---

## 🚀 Solution Rapide (2 minutes)

```bash
# 1. Copier le script sur le serveur
scp scripts/fix-t4g-502.sh root@147.79.101.32:/tmp/

# 2. Se connecter et exécuter
ssh root@147.79.101.32 'bash /tmp/fix-t4g-502.sh'

# 3. Tester
curl -I https://t4g.dazno.de/
```

---

## 📋 Alternative : Commandes Manuelles

Si vous préférez exécuter directement sur le serveur :

```bash
# Se connecter
ssh root@147.79.101.32

# Copier-coller ce bloc
systemctl restart token4good-frontend && \
sleep 5 && \
nginx -t && \
systemctl reload nginx && \
echo "✅ Correction appliquée" && \
curl -I https://t4g.dazno.de/
```

---

## ✅ Vérification

Le site devrait maintenant retourner :
- **Code 200** ou **307** (au lieu de 502)
- Page d'accueil visible dans le navigateur

Ouvrez : **https://t4g.dazno.de/**

---

## 🔍 Si ça ne fonctionne toujours pas

Consultez le guide complet : [`FIX_502_INSTRUCTIONS.md`](./FIX_502_INSTRUCTIONS.md)

