#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🎨 Création d'un contrat RGB de test${NC}"

# Vérifier que stashd est en cours d'exécution
if ! pgrep -x "stashd" > /dev/null; then
    echo "Erreur: stashd n'est pas en cours d'exécution"
    exit 1
fi

# Initialiser le stash si pas déjà fait
if [ ! -f ~/.rgb/regtest/stash.json ]; then
    echo -e "${YELLOW}📝 Initialisation du stash${NC}"
    rgb-cli --network regtest stash init
fi

# Créer un schéma de contrat temporaire
cat > /tmp/mentoring_schema.rgb << EOF
schema_id: token4good-mentoring-v1
network: regtest
description: RGB schema for representing Proofs of Impact through mentoring

global_state:
  - name: issuer_id
    type: identity
    required: true

owned_rights:
  - name: proof_of_impact
    assignment_type: declarative
    seal_type: txout
    state_type: structured
    structure:
      - name: mentor_id
        type: string
      - name: mentee_id
        type: string
      - name: request_id
        type: string
      - name: timestamp
        type: u64
      - name: rating
        type: u8
      - name: comment
        type: string
EOF

# Créer le contrat
echo -e "${YELLOW}📄 Création du contrat${NC}"
CONTRACT_ID=$(rgb-cli --network regtest contract create \
    --schema /tmp/mentoring_schema.rgb \
    --title "Mentoring Proof" \
    --issued-supply 1)

echo -e "${YELLOW}💾 Sauvegarde du contrat${NC}"
rgb-cli --network regtest contract save $CONTRACT_ID

# Créer une preuve de test
echo -e "${YELLOW}🔍 Création d'une preuve de test${NC}"
UTXO_TXID=$(bitcoin-cli -regtest listunspent | jq -r '.[0].txid')
UTXO_VOUT=$(bitcoin-cli -regtest listunspent | jq -r '.[0].vout')

rgb-cli --network regtest contract update $CONTRACT_ID \
    --set "mentor_id=mentor_123" \
    --set "mentee_id=mentee_456" \
    --set "request_id=req_789" \
    --set "timestamp=$(date +%s)" \
    --set "rating=5" \
    --set "comment=Test proof on regtest" \
    --seal "${UTXO_TXID}:${UTXO_VOUT}"

echo -e "${GREEN}✅ Contrat créé avec succès !${NC}"
echo -e "Contract ID : ${CONTRACT_ID}"
echo -e "UTXO utilisé : ${UTXO_TXID}:${UTXO_VOUT}"

# Nettoyage
rm /tmp/mentoring_schema.rgb 