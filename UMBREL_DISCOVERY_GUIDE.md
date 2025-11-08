# Guide de Découverte Umbrel - Résultats du Diagnostic

## 🔍 Résumé du Diagnostic

**Date:** 23 octobre 2025  
**Réseau:** 192.168.0.0/24  
**IP locale:** 192.168.0.28  
**Passerelle:** 192.168.0.1  

## 📊 État Actuel

### ❌ Umbrel Non Trouvé
- `umbrel.local` ne répond pas au ping
- Aucun service HTTP/HTTPS détecté sur le réseau
- Les appareils du cache ARP ne sont pas accessibles

### 📱 Appareils Détectés dans le Cache ARP
Les appareils suivants ont été vus récemment sur le réseau mais ne répondent pas actuellement :

| IP | MAC Address | Statut |
|----|-------------|---------|
| 192.168.0.1 | 40:65:a3:4:74:3c | Routeur (passerelle) |
| 192.168.0.2 | 40:65:a3:88:a3:4c | Appareil inconnu |
| 192.168.0.10 | 94:c6:91:55:de:18 | Appareil inconnu |
| 192.168.0.16 | 2:f:b5:f3:f3:de | Appareil inconnu |
| 192.168.0.18 | b0:c0:90:c9:b:47 | Appareil inconnu |
| **192.168.0.20** | **2c:cf:67:25:7:ed** | **🎯 Candidat Umbrel** |
| 192.168.0.28 | ba:a9:14:70:52:47 | Votre machine |
| 192.168.0.33 | 8e:79:bd:4:e3:2f | Appareil inconnu |
| 192.168.0.230 | 0:1b:a9:7f:fc:3c | Appareil inconnu |

## 🎯 IP Suspecte: 192.168.0.20

**Pourquoi cette IP est suspecte :**
- Elle correspond à l'IP résolue par `umbrel.local`
- Elle apparaît dans le cache ARP avec une adresse MAC valide
- C'est une IP courante pour les nœuds Umbrel

## 🔧 Actions Recommandées

### 1. Vérifications Immédiates
```bash
# Test direct de l'IP suspecte
ping 192.168.0.20
curl http://192.168.0.20
curl https://192.168.0.20

# Test des ports Umbrel
nc -z -v 192.168.0.20 80
nc -z -v 192.168.0.20 443
nc -z -v 192.168.0.20 3000
```

### 2. Vérifications Physiques
- ✅ Vérifiez que votre nœud Umbrel est allumé
- ✅ Vérifiez qu'il est connecté via Ethernet (pas WiFi)
- ✅ Vérifiez que le câble Ethernet est bien branché
- ✅ Vérifiez les LEDs sur le nœud Umbrel

### 3. Redémarrage
```bash
# Si vous avez accès SSH au nœud Umbrel
ssh umbrel@192.168.0.20
sudo reboot

# Ou redémarrage physique
# Débranchez l'alimentation, attendez 10 secondes, rebranchez
```

### 4. Vérification du Routeur
- Ouvrez votre navigateur sur `http://192.168.0.1` ou `http://192.168.0.254`
- Connectez-vous à l'interface d'administration
- Cherchez la section "Appareils connectés" ou "DHCP Client List"
- Vérifiez si Umbrel apparaît dans la liste

### 5. Scan Réseau Alternatif
```bash
# Installer des outils supplémentaires
brew install arp-scan

# Scan avec arp-scan
sudo arp-scan --local

# Scan avec netdiscover
brew install netdiscover
sudo netdiscover -r 192.168.0.0/24
```

## 🚨 Problèmes Possibles

### 1. Umbrel Éteint
- Le nœud n'est pas allumé
- Problème d'alimentation
- **Solution:** Vérifiez l'alimentation et redémarrez

### 2. Problème de Connexion Réseau
- Câble Ethernet défectueux
- Port Ethernet défectueux
- **Solution:** Testez avec un autre câble/port

### 3. Umbrel en Mode Recovery
- Le nœud est en mode de récupération
- **Solution:** Suivez la procédure de récupération Umbrel

### 4. Problème de Configuration Réseau
- IP statique mal configurée
- Conflit d'IP
- **Solution:** Vérifiez la configuration réseau

### 5. Firewall/Isolation Réseau
- Le routeur isole les appareils
- Firewall bloque les connexions
- **Solution:** Vérifiez les paramètres du routeur

## 📱 Applications Mobiles Recommandées

### Pour Scanner le Réseau
- **Fing** (iOS/Android) - Scanner réseau gratuit
- **Network Analyzer** (iOS/Android) - Outils réseau avancés
- **WiFi Analyzer** (Android) - Analyse WiFi

### Pour Gérer Umbrel
- **Umbrel** (iOS/Android) - Application officielle
- **Zeus** (iOS/Android) - Gestionnaire Lightning

## 🔄 Prochaines Étapes

1. **Immédiat:** Vérifiez l'état physique du nœud Umbrel
2. **Court terme:** Testez l'IP 192.168.0.20 après redémarrage
3. **Moyen terme:** Utilisez une app mobile pour scanner le réseau
4. **Long terme:** Configurez un monitoring réseau pour Umbrel

## 📞 Support

Si le problème persiste :
- Consultez la documentation officielle Umbrel
- Rejoignez la communauté Umbrel sur Discord/Telegram
- Vérifiez les logs système du nœud (si accessible)

---

**Note:** Ce diagnostic a été effectué le 23 octobre 2025. Les informations peuvent changer si la configuration réseau est modifiée.