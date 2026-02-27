# 🚀 Déploiement Immédiat des Scripts de Nettoyage

**Date:** 2025-10-21  
**Serveur:** 147.79.101.32  
**Temps:** 2 minutes

---

## ⚡ Méthode Rapide (Recommandée)

### Option 1: Script Automatique

```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G
./scripts/deploy-cleanup-to-production.sh
```

Le script vous demandera le mot de passe du serveur : `Criteria0-Cadmium5-Attempt9-Exit2-Floss1`

---

## 📋 Méthode Manuelle (Alternative)

Si le script automatique ne fonctionne pas, voici les commandes manuelles :

### 1. Copier les Scripts

```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G

# Copier cleanup-disk.sh
scp scripts/cleanup-disk.sh root@147.79.101.32:/root/

# Copier check-disk-space.sh
scp scripts/check-disk-space.sh root@147.79.101.32:/root/

# Mot de passe: Criteria0-Cadmium5-Attempt9-Exit2-Floss1
```

### 2. Configurer sur le Serveur

```bash
# Se connecter au serveur
ssh root@147.79.101.32
# Mot de passe: Criteria0-Cadmium5-Attempt9-Exit2-Floss1

# Rendre les scripts exécutables
chmod +x /root/cleanup-disk.sh
chmod +x /root/check-disk-space.sh

# Vérifier
ls -lh /root/*.sh
```

### 3. Tester

```bash
# Sur le serveur (déjà connecté)

# Test 1: Monitoring
./check-disk-space.sh

# Test 2: Nettoyage (dry-run)
./cleanup-disk.sh
```

### 4. Automatiser (Optionnel)

```bash
# Sur le serveur

# Éditer le crontab
crontab -e

# Ajouter ces 2 lignes:
0 4 * * 0 /root/cleanup-disk.sh >> /var/log/disk-cleanup.log 2>&1
0 * * * * /root/check-disk-space.sh --alert-email admin@token-for-good.com

# Sauvegarder: Ctrl+X puis Y (si nano) ou :wq (si vim)

# Vérifier
crontab -l
```

---

## ✅ Validation

Pour confirmer que tout fonctionne :

```bash
# Sur le serveur
ssh root@147.79.101.32

# Vérifier que les scripts existent
ls -lh /root/cleanup-disk.sh /root/check-disk-space.sh

# Exécuter le monitoring
./check-disk-space.sh

# Voir le résultat du nettoyage
./cleanup-disk.sh
```

---

## 🎯 Résultat Attendu

### check-disk-space.sh affiche:
```
=== Token4Good Disk Space Monitor ===
Date: [date actuelle]

✅ OK: Espace disque à XX%
   XXG/XXG utilisés

Détails par partition:
...

Top 10 des plus gros répertoires...
```

### cleanup-disk.sh affiche:
```
=== Token4Good Disk Cleanup ===
Date: [date actuelle]

AVANT nettoyage:
Espace disque:
  Utilisé: XXG/XXG (XX%)

[1/8] Nettoyage des logs systemd...
[2/8] Nettoyage du cache APT...
...
[8/8] Mode normal

APRÈS nettoyage:
Espace disque:
  Utilisé: XXG/XXG (XX%)

✅ Nettoyage terminé!
```

---

## 🚨 En Cas de Problème

### Erreur SSH
```bash
# Vérifier la connexion
ssh root@147.79.101.32 "echo 'Connexion OK'"
```

### Scripts non exécutables
```bash
ssh root@147.79.101.32 "chmod +x /root/*.sh"
```

### Permission denied
```bash
# Vérifier les permissions
ssh root@147.79.101.32 "ls -l /root/*.sh"
```

---

## 📚 Documentation Complète

- **Guide complet:** [DISK_CLEANUP_GUIDE.md](DISK_CLEANUP_GUIDE.md)
- **Instructions détaillées:** [DEPLOY_CLEANUP_SCRIPTS.md](DEPLOY_CLEANUP_SCRIPTS.md)

---

## ⏱️ Temps Estimé

- **Copie des scripts:** 30 secondes
- **Configuration:** 1 minute
- **Tests:** 30 secondes
- **Cron (optionnel):** 1 minute

**Total:** 2-3 minutes

---

## 🎉 Après le Déploiement

Une fois déployé, vous pourrez :

✅ Vérifier l'espace disque à tout moment  
✅ Nettoyer automatiquement (cron) ou manuellement  
✅ Recevoir des alertes si l'espace devient critique  
✅ Consulter les logs de nettoyage  

**C'est parti !** 🚀

