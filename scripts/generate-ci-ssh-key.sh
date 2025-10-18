#!/bin/bash
###############################################################################
# Token4Good v2 - Génération de clés SSH pour CI/CD
# Usage: ./scripts/generate-ci-ssh-key.sh
###############################################################################

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔐 Génération de clés SSH pour GitHub Actions CI/CD${NC}"
echo "=================================================="
echo ""

# Configuration
KEY_NAME="ci-deploy-key"
KEY_COMMENT="github-actions@token4good"
SERVER_IP="147.79.101.32"
SERVER_USER="root"

# Vérifier si la clé existe déjà
if [ -f "./$KEY_NAME" ]; then
    echo -e "${YELLOW}⚠️  La clé $KEY_NAME existe déjà!${NC}"
    read -p "Voulez-vous la régénérer? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Opération annulée."
        exit 0
    fi
    rm -f ./$KEY_NAME ./$KEY_NAME.pub
fi

# Générer la clé SSH
echo -e "${BLUE}📝 Génération de la clé SSH...${NC}"
ssh-keygen -t ed25519 -C "$KEY_COMMENT" -f ./$KEY_NAME -N ""

echo ""
echo -e "${GREEN}✅ Clé SSH générée avec succès!${NC}"
echo ""

# Afficher les clés
echo "=========================================="
echo "📋 ÉTAPE 1: Configuration GitHub Secrets"
echo "=========================================="
echo ""
echo "Allez dans votre repository GitHub:"
echo "Settings → Secrets and variables → Actions → New repository secret"
echo ""
echo -e "${YELLOW}Créez les secrets suivants:${NC}"
echo ""

echo "Secret 1: HOSTINGER_HOST"
echo "Value: $SERVER_IP"
echo ""

echo "Secret 2: HOSTINGER_USER"
echo "Value: $SERVER_USER"
echo ""

echo "Secret 3: HOSTINGER_SSH_KEY"
echo "Value (copier tout le contenu ci-dessous):"
echo "-------------------------------------------"
cat ./$KEY_NAME
echo "-------------------------------------------"
echo ""

echo "=========================================="
echo "📋 ÉTAPE 2: Installation sur le serveur"
echo "=========================================="
echo ""
echo "Clé publique à installer sur $SERVER_IP:"
echo "-------------------------------------------"
cat ./$KEY_NAME.pub
echo "-------------------------------------------"
echo ""

echo -e "${YELLOW}Méthode 1: Installation automatique${NC}"
echo "Exécutez cette commande:"
echo ""
echo "ssh-copy-id -i ./$KEY_NAME.pub $SERVER_USER@$SERVER_IP"
echo ""

echo -e "${YELLOW}Méthode 2: Installation manuelle${NC}"
echo "Exécutez ces commandes:"
echo ""
echo "ssh $SERVER_USER@$SERVER_IP"
echo "mkdir -p ~/.ssh"
echo "chmod 700 ~/.ssh"
echo "echo '$(cat ./$KEY_NAME.pub)' >> ~/.ssh/authorized_keys"
echo "chmod 600 ~/.ssh/authorized_keys"
echo "exit"
echo ""

echo "=========================================="
echo "🧪 ÉTAPE 3: Test de connexion"
echo "=========================================="
echo ""
echo "Pour tester la connexion SSH avec la nouvelle clé:"
echo ""
echo "ssh -i ./$KEY_NAME $SERVER_USER@$SERVER_IP"
echo ""

# Proposer l'installation automatique
echo "=========================================="
echo ""
read -p "Voulez-vous installer automatiquement la clé sur le serveur? (y/n) " -n 1 -r
echo
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}📤 Installation de la clé sur le serveur...${NC}"
    
    if command -v ssh-copy-id &> /dev/null; then
        ssh-copy-id -i ./$KEY_NAME.pub $SERVER_USER@$SERVER_IP
        echo -e "${GREEN}✅ Clé installée avec succès!${NC}"
        
        echo ""
        echo -e "${BLUE}🧪 Test de connexion...${NC}"
        if ssh -i ./$KEY_NAME -o BatchMode=yes -o ConnectTimeout=5 $SERVER_USER@$SERVER_IP "echo 'Connection OK'" 2>/dev/null; then
            echo -e "${GREEN}✅ Test de connexion réussi!${NC}"
        else
            echo -e "${RED}❌ Test de connexion échoué${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  ssh-copy-id non disponible, installation manuelle requise${NC}"
        echo ""
        echo "Exécutez:"
        echo "ssh $SERVER_USER@$SERVER_IP 'mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo \"$(cat ./$KEY_NAME.pub)\" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'"
    fi
fi

echo ""
echo "=========================================="
echo "📚 ÉTAPE 4: Sécurité"
echo "=========================================="
echo ""
echo -e "${RED}⚠️  IMPORTANT - Sécurité:${NC}"
echo ""
echo "1. ❌ Ne JAMAIS commiter les fichiers:"
echo "   - $KEY_NAME (clé privée)"
echo "   - $KEY_NAME.pub (clé publique)"
echo ""
echo "2. ✅ Ces fichiers sont déjà dans .gitignore"
echo ""
echo "3. 🔒 La clé privée doit rester UNIQUEMENT dans:"
echo "   - GitHub Secrets (HOSTINGER_SSH_KEY)"
echo "   - Votre machine locale (backup sécurisé)"
echo ""
echo "4. 🔄 Rotation recommandée: tous les 90 jours"
echo ""

# Sauvegarder les instructions dans un fichier
INSTRUCTIONS_FILE="ci-ssh-setup-instructions.txt"
cat > $INSTRUCTIONS_FILE << EOF
Token4Good - Instructions CI/CD SSH Setup
==========================================
Date: $(date)

GitHub Secrets à créer:
-----------------------

1. HOSTINGER_HOST
   Value: $SERVER_IP

2. HOSTINGER_USER
   Value: $SERVER_USER

3. HOSTINGER_SSH_KEY
   Value: (contenu du fichier ci-dessous)
   
$KEY_NAME content:
-------------------------------------------
$(cat ./$KEY_NAME)
-------------------------------------------

Clé publique (pour le serveur):
-------------------------------------------
$(cat ./$KEY_NAME.pub)
-------------------------------------------

Commandes d'installation sur le serveur:
-----------------------------------------
ssh $SERVER_USER@$SERVER_IP
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo '$(cat ./$KEY_NAME.pub)' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit

Test de connexion:
------------------
ssh -i ./$KEY_NAME $SERVER_USER@$SERVER_IP

⚠️  SÉCURITÉ:
------------
- Ne JAMAIS commiter les clés dans Git
- Supprimer ce fichier après configuration
- Stocker la clé privée dans un endroit sécurisé
EOF

echo -e "${GREEN}✅ Instructions sauvegardées dans: $INSTRUCTIONS_FILE${NC}"
echo ""
echo "=========================================="
echo "🎉 Configuration terminée!"
echo "=========================================="
echo ""
echo "Prochaines étapes:"
echo "1. ✅ Ajouter les secrets dans GitHub"
echo "2. ✅ Vérifier que la clé est installée sur le serveur"
echo "3. ✅ Tester un déploiement avec: git push origin main"
echo "4. 🔒 Supprimer les fichiers de clés locaux après configuration"
echo ""
echo -e "${YELLOW}Pour supprimer les clés locales après configuration:${NC}"
echo "rm -f ./$KEY_NAME ./$KEY_NAME.pub ./$INSTRUCTIONS_FILE"
echo ""

