Voici les spécifications pour **Token4Good v2 – version RGB-native avec backend Rust** :

---

### **Spécifications Fonctionnelles**

#### 1. Objectif Principal

Créer un système de certification d’impact tokenisé utilisant **RGB** sur Bitcoin pour :

* Émettre des **preuves cryptographiques d’impact** (non-fongibles)
* Transférer ces droits via **Lightning Network**
* Offrir un tableau de bord public/privé pour suivre les preuves, sans exposer les données sensibles

#### 2. Utilisateurs

* **Contributeurs** : ceux qui financent ou exécutent une action à impact
* **Organisations** : celles qui émettent des preuves validées
* **Vérificateurs** : (facultatif) entités indépendantes qui valident les actions

#### 3. Fonctionnalités Clés

* **Émission d’un "Proof of Impact"** via RGB (contrat côté client)
* **Archivage et divulgation partielle** (confidentialité RGB)
* **Transfert des preuves** via Lightning Network
* **Dashboard utilisateur** : voir ses preuves, en divulguer certaines, transférer
* **Dashboard organisation** : créer une nouvelle preuve, attacher des métadonnées, la diffuser
* **Support mobile-first** (front-end inchangé en React/Next.js)

---

### **Spécifications Techniques**

#### Backend – Rust

**Architecture :**

* **Service principal Rust** avec Axum ou Actix-Web
* **NoSQL (Optionnel)** : pour les métadonnées non sensibles (MongoDB ou Redis)
* **RGB Integration** : via [rgb-node](https://github.com/RGB-Tools/rgb-node) + client-side validation
* **LN Integration** : via [LND](https://github.com/lightningnetwork/lnd) ou \[CLN] + Rust bindings
* **CLI Tool** : pour émettre, transférer, vérifier une preuve RGB localement

**Modules Rust à développer :**

1. **Proof Generator** : encode les métadonnées dans une transition RGB
2. **Proof Publisher** : gère la divulgation contrôlée (utilise RGB wallets)
3. **Lightning Bridge** : synchronise les transferts de droits avec les paiements
4. **API REST JSON** : pour le front-end (secured, minimal state)
5. **Task Scheduler** : vérifie les états RGB + notifications push

**Sécurité :**

* Clés privées uniquement stockées côté client
* Signature locale de chaque transaction
* Zéro trust sur le backend (stateless, auditable)

---

### **Étapes de Migration**

1. **Freeze du backend Node.js actuel**
2. **Création des modules Rust standalone : RGB + Lightning**
3. **Exposition des endpoints REST**
4. **Bridge avec front-end React**
5. **Test RGB / Lightning / Front intégrés**
6. **Déploiement et monitoring**

---

## Spécifications techniques détaillées : RGB Contract & Backend Rust

### 1. RGB Contract Structure (Contractum / Schema)

**Nom du schéma :** `token4good.schema`
**But :** définir une structure pour représenter un "Proof of Impact" (PoI) comme un asset RGB.

```yaml
# token4good.schema
schema_id: token4good-v1
description: RGB schema for representing Proofs of Impact

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
      - name: category
        type: string
      - name: description
        type: string
      - name: timestamp
        type: u64
      - name: verifier_id
        type: identity
      - name: impact_score
        type: u8

transitions:
  - name: transfer
    inputs: [proof_of_impact]
    assignments: [proof_of_impact]
```

### 2. Arborescence Rust Backend (Axum)

```bash
token4good-backend/
├── Cargo.toml
├── src/
│   ├── main.rs
│   ├── routes/
│   │   ├── api.rs
│   │   ├── proofs.rs
│   │   └── transfer.rs
│   ├── services/
│   │   ├── rgb.rs          # interaction avec rgb-node
│   │   ├── lightning.rs    # paiement LN
│   │   └── metadata.rs     # stockage meta (Mongo/Redis)
│   ├── models/
│   │   ├── proof.rs
│   │   └── user.rs
│   └── utils/
│       ├── error.rs
│       └── config.rs
```

### 3. Modules Clés en Rust

#### `rgb.rs` (proof emitter)

```rust
pub fn create_proof(
    issuer_id: Identity,
    category: &str,
    description: &str,
    verifier_id: Identity,
    impact_score: u8,
    seal_outpoint: OutPoint
) -> Result<Contract, RGBError> {
    // Encode metadata
    // Build transition
    // Call rgb-node to broadcast
}
```

#### `lightning.rs` (sync)

```rust
pub fn pay_for_proof(recipient_invoice: &str) -> Result<PaymentHash, LNError> {
    // Call LND or CLN API
}
```

#### `transfer.rs` (API)

```rust
#[post("/transfer")]
async fn transfer_proof(payload: TransferRequest) -> Result<Json<TransferResponse>> {
    // Validate user
    // Pay via LN
    // Trigger RGB transfer
}
```


