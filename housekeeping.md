# 🛠️ Security Housekeeping Runbook (24–48h Tasks)

## 1) Investigate Subnet Spike (Network & Perimeter)
1. Pull firewall/NetFlow logs for flagged subnet/time window.  
2. Identify top talkers (hosts with most outbound requests).  
3. Correlate with DNS queries (new or suspicious domains).  
4. On each noisy host:  
   - **Windows:** `Get-Process`, `Get-NetTCPConnection`, check Event Viewer.  
   - **Linux:** `ss -tpn`, `lsof -i`, `journalctl`.  
5. Compare with developer actions (`npm install`, `docker pull`).  
6. WHOIS/ASN check on destinations → flag TOR/VPN/hosting outliers.  
7. If suspicious: disconnect host, collect logs, reset credentials.  
8. Block suspicious ranges/domains; add alert rule.  
9. Document: host, process, destination, action taken.  

---

## 2) Review OAuth App Connections (SaaS & Third-Party)

### Google Workspace  
1. Admin Console → Security → API controls → *App access control*.  
2. Audit “OAuth log events” for last 7 days.  
3. Check scopes (e.g., Gmail/Drive read/write).  
4. Block or revoke tokens for unused or risky apps.  

### GitHub  
5. Org Settings → Installed Apps → review permissions.  
6. Personal account → Authorized OAuth Apps → revoke unused.  
7. Search Audit log for app installs/permission changes.  

---

## 3) Rotate Non-Prod API Tokens (Identity & CI/CD)
1. Inventory tokens (GitHub Actions secrets, `.env` files, cloud API keys).  
2. Rank high-risk (old, shared, non-scoped).  
3. Create replacements with least privilege, short lifespan if possible.  
4. Update consumers (repos, CI, apps) with new tokens.  
5. Test builds/deploys.  
6. Revoke old tokens.  
7. Restrict new tokens (by scope, referrer/IP, quotas).  
8. Record owner, scope, creation, expiry in a **Secrets Register**.  
9. Run secret scan (e.g., gitleaks) to confirm clean state.  

---

## ✅ Completion Checklist
- [ ] Subnet spike triaged → verdict documented.  
- [ ] OAuth apps reviewed → risky/redundant revoked.  
- [ ] Non-prod tokens rotated → old tokens revoked, CI validated.  
- [ ] Secrets Register updated with current state.