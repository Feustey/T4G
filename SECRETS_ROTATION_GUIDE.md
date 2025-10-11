# Token4Good - Secrets Rotation Guide

## 🔐 Overview

This guide covers the process of rotating sensitive credentials for Token4Good v2. Regular rotation of secrets is critical for maintaining security.

---

## 📋 Secrets Inventory

### Critical Secrets (Rotate Every 90 Days)

| Secret | Location | Rotation Impact |
|--------|----------|-----------------|
| `DATABASE_URL` | Vercel/Railway | Backend restart required |
| `JWT_SECRET` | Vercel/Railway | All users logged out |
| `NEXTAUTH_SECRET` | Vercel | All frontend sessions invalidated |
| `LND_MACAROON` | Backend server | Lightning operations fail |
| `DAZNO_API_KEY` | Vercel/Railway | Dazno integration broken |
| `ADMIN_WALLET` | Backend server | Cannot sign transactions |

### Moderate Secrets (Rotate Every 180 Days)

| Secret | Location | Rotation Impact |
|--------|----------|-----------------|
| `CLIENT_SECRET` (t4g) | Vercel | SSO login broken |
| `ALCHEMY_API_KEY` | Vercel/Backend | Legacy Polygon features fail |
| `POLYGONSCAN_API_KEY` | Backend | Blockchain explorer queries fail |
| `EMAIL_SERVER` | Backend | Email notifications fail |

---

## 🔄 Rotation Procedures

### 1. Database Credentials (`DATABASE_URL`)

**Supabase PostgreSQL:**

```bash
# 1. Generate new password in Supabase Dashboard
# Settings → Database → Reset Database Password

# 2. Update connection string
# Format: postgresql://postgres:<NEW_PASSWORD>@db.xxx.supabase.co:5432/postgres

# 3. Update in deployment platforms
# Vercel: Settings → Environment Variables → DATABASE_URL
# Railway: Variables → DATABASE_URL

# 4. Redeploy backend
railway up  # or trigger Vercel deployment

# 5. Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

**Rollback Plan:**
- Keep old password active for 24h
- Test new connection before removing old one
- Document old password in secure vault

---

### 2. JWT Secrets (`JWT_SECRET`, `NEXTAUTH_SECRET`)

**Impact:** All users must re-login

```bash
# 1. Generate new secrets
openssl rand -base64 64  # JWT_SECRET
openssl rand -base64 64  # NEXTAUTH_SECRET

# 2. Schedule maintenance window (announce 24h ahead)

# 3. Update secrets in all environments
# Vercel Environment Variables:
JWT_SECRET=<new_secret>
NEXTAUTH_SECRET=<new_secret>

# Railway/Backend:
JWT_SECRET=<new_secret>

# 4. Deploy simultaneously to prevent auth mismatch

# 5. Monitor authentication errors post-deployment
```

**Communication Template:**
```
Subject: Token4Good Maintenance - Re-login Required

We will be performing security maintenance on [DATE] at [TIME].
All users will need to re-login after the update.
Downtime: ~5 minutes
```

---

### 3. Lightning Network Macaroon (`LND_MACAROON`)

**Impact:** All Lightning operations fail until updated

```bash
# 1. Generate new macaroon on LND node
lncli --lnddir=/path/to/.lnd bakemacaroon \
  info:read \
  invoices:write \
  invoices:read \
  offchain:read \
  offchain:write

# 2. Copy new macaroon to backend server
scp lnd-node:/path/to/new.macaroon backend:/data/lnd/admin.macaroon

# 3. Update environment variable
export LND_MACAROON_PATH=/data/lnd/admin.macaroon

# 4. Restart backend service
systemctl restart token4good-backend  # or Railway/Docker

# 5. Test Lightning health
curl http://localhost:3000/api/lightning/node/info
```

---

### 4. Dazno API Key (`DAZNO_API_KEY`)

**Impact:** Auto-login and Lightning features from Dazno broken

```bash
# 1. Request new API key from Dazno team
# Contact: support@dazno.de

# 2. Test new key before rotation
curl -H "Authorization: Bearer <NEW_KEY>" https://dazno.de/api/health

# 3. Update in Vercel & Railway
DAZNO_API_KEY=<NEW_KEY>

# 4. Deploy changes

# 5. Revoke old key with Dazno
```

**Test Checklist:**
- [ ] Dazno SSO login works
- [ ] Lightning invoices from Dazno process correctly
- [ ] User token balance syncs

---

### 5. Admin Wallet (`ADMIN_WALLET`, `PRIVATE_KEY`)

**Impact:** Cannot sign blockchain transactions

⚠️ **HIGH RISK - Requires Multi-Sig Approval**

```bash
# 1. Generate new wallet
openssl ecparam -genkey -name secp256k1 -out private.pem
openssl ec -in private.pem -outform DER | tail -c +8 | head -c 32 | xxd -p -c 32

# 2. Fund new wallet with minimum required balance
# Bitcoin: 0.01 BTC (testnet/regtest)
# Polygon (legacy): 10 MATIC

# 3. Update admin address in smart contracts (if needed)

# 4. Store old key in cold storage for 1 year (recovery purposes)

# 5. Update environment variables
ADMIN_WALLET=<NEW_PRIVATE_KEY>
PRIVATE_KEY=<NEW_PRIVATE_KEY>

# 6. Multi-sig approve and deploy
```

---

## 🚨 Emergency Rotation (Compromised Secret)

If a secret is compromised:

### Immediate Actions (0-1 hour)

1. **Revoke compromised secret immediately**
   ```bash
   # Example: Revoke Dazno API key
   curl -X POST https://dazno.de/api/keys/revoke \
     -H "Authorization: Bearer <OLD_KEY>"
   ```

2. **Generate new secret**
3. **Deploy to production ASAP**
4. **Monitor logs for suspicious activity**

### Post-Incident (1-24 hours)

1. **Investigate breach source**
   - Check Git history for accidental commits
   - Review access logs
   - Scan for malware

2. **Document incident**
   - What was compromised?
   - How did it happen?
   - What was the impact?

3. **Update security procedures**

---

## 📊 Rotation Schedule

| Secret | Frequency | Next Rotation | Owner |
|--------|-----------|---------------|-------|
| Database Password | 90 days | 2025-12-30 | DevOps |
| JWT Secrets | 90 days | 2025-12-30 | Backend Lead |
| LND Macaroon | 180 days | 2026-03-30 | Bitcoin Ops |
| Dazno API Key | 180 days | 2026-03-30 | Integration Lead |
| Admin Wallet | 365 days | 2026-09-30 | Security Lead |

---

## 🔍 Verification After Rotation

### Automated Tests

```bash
# 1. Database connectivity
curl http://localhost:3000/health

# 2. JWT authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Lightning Network
curl http://localhost:3000/api/lightning/node/info

# 4. Dazno integration
curl -H "Authorization: Bearer <JWT>" \
  http://localhost:3000/api/auth/dazno/verify
```

### Manual Verification

- [ ] Login with t4g SSO
- [ ] Login with Dazno
- [ ] Create mentoring request
- [ ] Generate Lightning invoice
- [ ] Transfer RGB proof
- [ ] Receive email notification

---

## 📝 Secrets Storage

### Development

- **Local:** `.env` file (never commit!)
- **Team Sharing:** 1Password / Bitwarden vault

### Production

- **Vercel:** Environment Variables (encrypted at rest)
- **Railway:** Config Variables (encrypted)
- **Backend Server:** Kubernetes Secrets / Vault

### Backup

- **Critical Secrets:** Hardware security key (YubiKey)
- **Recovery Codes:** Printed and stored in safe
- **Old Secrets:** 1Password archive (1 year retention)

---

## 🛡️ Best Practices

1. **Never commit secrets to Git**
   ```bash
   # Check before commit
   git diff --cached | grep -i "secret\|password\|key"
   ```

2. **Use different secrets per environment**
   - Dev: `JWT_SECRET_DEV`
   - Staging: `JWT_SECRET_STAGING`
   - Production: `JWT_SECRET_PROD`

3. **Rotate on employee departure**
   - Immediate: API keys, admin passwords
   - Within 24h: Database credentials
   - Within 1 week: All other secrets

4. **Audit access regularly**
   ```bash
   # Who has access to production secrets?
   # Review Vercel/Railway team members monthly
   ```

5. **Use secret scanning tools**
   ```bash
   # Install git-secrets
   git secrets --install
   git secrets --register-aws
   ```

---

## 📞 Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Security Lead | TBD | security@token-for-good.com |
| DevOps Lead | TBD | devops@token-for-good.com |
| Dazno Support | TBD | support@dazno.de |
| Supabase Support | TBD | https://supabase.com/support |

---

## 🔗 Additional Resources

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [12-Factor App: Config](https://12factor.net/config)