# 🔐 Configuration GitHub Secrets - Guide Visuel

## ✅ Étape 1 Complétée
- ✅ Clés SSH générées
- ✅ Clé publique installée sur le serveur
- ✅ Connexion testée avec succès

---

## 🎯 Étape 2: Configurer GitHub Secrets (2 minutes)

### 📍 Navigation GitHub

1. **Aller sur votre repository GitHub:**
   ```
   https://github.com/VOTRE-ORG/token4good
   ```

2. **Cliquer sur `Settings`** (en haut à droite)

3. **Dans le menu de gauche:**
   - Cliquer sur `Secrets and variables`
   - Puis `Actions`

4. **Cliquer sur `New repository secret`**

---

## 🔐 Secrets à Créer (3 au total)

### Secret 1: HOSTINGER_HOST

```
Name: HOSTINGER_HOST
Value: 147.79.101.32
```

**Screenshot conceptuel:**
```
┌─────────────────────────────────────────┐
│ Name  ▼                                 │
│ ┌─────────────────────────────────────┐ │
│ │ HOSTINGER_HOST                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Secret ▼                                │
│ ┌─────────────────────────────────────┐ │
│ │ 147.79.101.32                       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Add secret]                            │
└─────────────────────────────────────────┘
```

---

### Secret 2: HOSTINGER_USER

```
Name: HOSTINGER_USER
Value: root
```

**Screenshot conceptuel:**
```
┌─────────────────────────────────────────┐
│ Name  ▼                                 │
│ ┌─────────────────────────────────────┐ │
│ │ HOSTINGER_USER                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Secret ▼                                │
│ ┌─────────────────────────────────────┐ │
│ │ root                                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Add secret]                            │
└─────────────────────────────────────────┘
```

---

### Secret 3: HOSTINGER_SSH_KEY (Important!)

```
Name: HOSTINGER_SSH_KEY
Value: [Copier TOUT le contenu ci-dessous]
```

**⚠️ IMPORTANT: Copier du fichier `ci-ssh-setup-instructions.txt` lignes 19-25:**

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACD8Eitz20g1P8+aGjCyfhBvwH1PBVdGevRmFUylzuAMmwAAAKBAcXjtQHF4
7QAAAAtzc2gtZWQyNTUxOQAAACD8Eitz20g1P8+aGjCyfhBvwH1PBVdGevRmFUylzuAMmw
AAAEAn3XdTUD7M1bV4YyczyxWB42EUJquyWgbDU7i3+C+AVvwSK3PbSDU/z5oaMLJ+EG/A
fU8FV0Z69GYVTKXO4AybAAAAGWdpdGh1Yi1hY3Rpb25zQHRva2VuNGdvb2QBAgME
-----END OPENSSH PRIVATE KEY-----
```

**Screenshot conceptuel:**
```
┌─────────────────────────────────────────┐
│ Name  ▼                                 │
│ ┌─────────────────────────────────────┐ │
│ │ HOSTINGER_SSH_KEY                   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Secret ▼                                │
│ ┌─────────────────────────────────────┐ │
│ │ -----BEGIN OPENSSH PRIVATE KEY----- │ │
│ │ b3BlbnNzaC1rZXktdjEAAAAA...        │ │
│ │ ...                                 │ │
│ │ -----END OPENSSH PRIVATE KEY-----   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Add secret]                            │
└─────────────────────────────────────────┘
```

**✅ Points de vérification:**
- ✅ Copier TOUT le contenu (incluant BEGIN et END)
- ✅ Ne pas ajouter d'espaces ou de lignes vides
- ✅ Vérifier qu'il n'y a pas de caractères manquants

---

## ✅ Vérification

Après avoir créé les 3 secrets, vous devriez voir:

```
Repository secrets
┌────────────────────────────────────────────────┐
│ HOSTINGER_HOST              Updated 1 min ago │
│ HOSTINGER_USER              Updated 1 min ago │
│ HOSTINGER_SSH_KEY           Updated 1 min ago │
└────────────────────────────────────────────────┘
```

---

## 🚀 Étape 3: Premier Déploiement

Une fois les secrets configurés:

```bash
# Vérifier le statut Git
git status

# Ajouter tous les fichiers CI/CD
git add .github/ scripts/ CI_CD*.md START_CI_CD.md .gitignore

# Commit
git commit -m "feat: CI/CD GitHub Actions configured 🚀

- Add deployment workflow (deploy-production.yml)
- Add test workflow (test.yml)
- Add SSH key generation script
- Add comprehensive documentation
- Configure .gitignore for SSH keys

The CI/CD pipeline is now ready:
- Auto-deploy on push to main
- Automatic tests on all branches
- Backup before deploy
- Auto-rollback on failure
"

# Push vers main (déclenche le premier déploiement!)
git push origin main
```

---

## 📊 Suivre le Déploiement

1. **Aller sur GitHub → Actions**
2. **Cliquer sur le workflow en cours** (`Deploy to Hostinger Production`)
3. **Voir les logs en temps réel:**
   - ✅ Build Backend (Rust)
   - ✅ Build Frontend (Next.js)
   - ✅ Deploy to Hostinger
   - ✅ Health Checks
   - ✅ Smoke Tests

**Durée estimée:** 7-11 minutes (premier déploiement)

---

## 🎉 Une fois le Déploiement Terminé

Vérifier que tout fonctionne:

```bash
# Health check
curl https://t4g.dazno.de/health

# Frontend
curl -I https://t4g.dazno.de/

# API
curl -I https://t4g.dazno.de/api/users
```

**Ou ouvrir dans le navigateur:**
- 🌐 https://t4g.dazno.de
- 🔧 https://t4g.dazno.de/api
- ❤️ https://t4g.dazno.de/health

---

## 🔒 Sécurité Post-Configuration

Une fois que tout fonctionne:

```bash
# Optionnel: Supprimer les fichiers de clés locaux
# (Les clés sont maintenant dans GitHub Secrets et sur le serveur)
rm -f ci-deploy-key ci-deploy-key.pub ci-ssh-setup-instructions.txt

# ⚠️ Mais gardez une backup sécurisée quelque part!
```

---

## ✅ Checklist Complète

- [ ] Secret `HOSTINGER_HOST` créé
- [ ] Secret `HOSTINGER_USER` créé
- [ ] Secret `HOSTINGER_SSH_KEY` créé (clé complète!)
- [ ] Vérifier que les 3 secrets sont visibles dans GitHub
- [ ] Commit des fichiers CI/CD
- [ ] Push vers `main`
- [ ] Vérifier le workflow dans Actions
- [ ] Attendre la fin du déploiement
- [ ] Tester l'URL de production
- [ ] 🎉 Célébrer!

---

## 🐛 Troubleshooting

### Les secrets ne s'affichent pas
- Vérifier que vous êtes dans le bon repository
- Vérifier que vous avez les droits admin

### Erreur "Permission denied (publickey)"
- Vérifier que la clé SSH est complète dans le secret
- Vérifier qu'il n'y a pas d'espaces ou de sauts de ligne supplémentaires

### Le workflow ne se lance pas
- Vérifier que les fichiers sont bien dans `.github/workflows/`
- Vérifier que le push a bien été fait sur `main`
- Aller dans Actions → Enable workflows si nécessaire

---

## 📚 Documentation Complète

- [START_CI_CD.md](START_CI_CD.md) - Guide de démarrage
- [CI_CD_QUICKSTART.md](CI_CD_QUICKSTART.md) - Configuration rapide
- [CI_CD_SETUP.md](CI_CD_SETUP.md) - Guide complet
- [.github/README.md](.github/README.md) - Documentation workflows

---

**Dernière mise à jour:** 18 octobre 2025  
**Status:** ✅ Prêt pour la configuration

