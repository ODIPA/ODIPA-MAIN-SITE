# ODIPA API — Azure Environment Variables Setup

All form submissions are processed by Azure Functions running in your own Azure account.
No third party (Formspree, Mailchimp, etc.) ever receives or stores submission data.

## Set These in Azure Portal

Go to: **Azure Static Web Apps → Your App → Configuration → Application Settings**

| Variable | Value | Notes |
|---|---|---|
| `SMTP_HOST` | `smtp.office365.com` | Or `smtp.gmail.com`, `smtp.fastmail.com`, etc. |
| `SMTP_PORT` | `587` | 587 = STARTTLS (recommended). 465 = SSL. |
| `SMTP_USER` | `noreply@odipa.org` | The ODIPA address that sends the emails |
| `SMTP_PASS` | your-app-password | Generate an **app password** — NOT your login password |
| `SMTP_FROM` | `ODIPA <noreply@odipa.org>` | Display name shown in inbox |
| `ALLOWED_ORIGIN` | `https://odipa.org` | Prevents cross-origin form abuse |
| `GITHUB_TOKEN` | `ghp_xxxxxxxxxxxx` | PAT with `Issues: Read and Write` on `odipa/odipa-privacy-tools` — generates GitHub Issues automatically when tools are submitted, powering the live Tool Review Status widget |

## Provider-Specific Notes

### Microsoft 365 (recommended for ODIPA)
- Host: `smtp.office365.com`, Port: `587`
- Enable SMTP AUTH for the sending account in M365 Admin Center
- Use an app password if MFA is enabled

### Google Workspace
- Host: `smtp.gmail.com`, Port: `587`
- Enable 2FA, then generate an App Password under Google Account → Security

### Fastmail / Proton (most private options)
- Fastmail: `smtp.fastmail.com`, Port: `587`
- Proton: requires Proton Mail Bridge (desktop app) for SMTP access

## How It Works

```
User submits form
       ↓
  Browser POSTs to /api/contact (or /api/sponsor, etc.)
       ↓
  Azure Function (in YOUR Azure account)
  - Validates and sanitizes all fields
  - Builds HTML email
  - Sends via YOUR SMTP credentials
       ↓
  Email lands in YOUR inbox (board@odipa.org, dev@odipa.org, etc.)
       ↓
  Azure Function responds 200 OK to browser
```

**No data is written to disk, database, or any external service at any point.**

## Receiving Addresses Per Form

| Form | Delivered to |
|---|---|
| Contact Us | Routed by topic (info@, education@, press@, etc.) |
| Become a Sponsor | partnerships@odipa.org |
| Submit a Privacy Tool | dev@odipa.org |
| Board Application | board@odipa.org |

## Go-Live Checklist

Complete these steps in order before launching odipa.org.

### Phase 1 — Azure Environment (required to go live)

- [ ] Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` in Azure Portal → Static Web Apps → Configuration
- [ ] Set `ALLOWED_ORIGIN` to `https://odipa.org`
- [ ] Generate SMTP app password (do NOT use your login password)
- [ ] Enable SMTP AUTH on the sending mailbox in M365 Admin Center (if using Microsoft 365)
- [ ] Set `GITHUB_TOKEN` with Issues read/write scope on `odipa/odipa-privacy-tools`
- [ ] Confirm all receiving addresses exist: `info@`, `education@`, `volunteer@`, `partnerships@`, `certification@`, `press@`, `research@`, `dev@`, `privacy@`, `donate@`, `board@`, `noreply@`, `events@`, `international@`, `sponsor@`, `transparency@`

### Phase 2 — Newsletter (required before first donation goes live)

- [ ] Create Brevo account and contact list
- [ ] Set `NEWSLETTER_PROVIDER=brevo`, `BREVO_API_KEY`, `BREVO_LIST_ID`
- [ ] Configure Give Lively consent checkbox (see Zapier/Brevo Setup Guide)
- [ ] Test full donation → consent → Brevo contact creation flow end-to-end

### Phase 3 — Smoke Tests (run before every deployment)

```bash
cd api
func start &             # start functions locally
node tests/smoke.js      # run all 6 endpoint tests
```

All 6 endpoints should return `✓` for OPTIONS preflight and validation checks.
`200 or 500` on valid payloads is expected locally (500 = SMTP not configured in dev).
In production all valid payloads must return `200`.

### Phase 4 — DNS & SSL

- [ ] Point `odipa.org` and `www.odipa.org` to Azure Static Web Apps custom domain
- [ ] Verify SSL certificate issued and HTTPS enforced
- [ ] Confirm `Strict-Transport-Security` header present in browser dev tools

### Phase 5 — Pre-launch Verification

- [ ] Submit a test message through each of the 6 forms on the live site
- [ ] Confirm emails arrive at correct inboxes
- [ ] Confirm GitHub Issue created on tool submission
- [ ] Confirm newsletter signup syncs to Brevo
- [ ] Check browser console — zero errors on all pages

---

## Future: Migrate to Separate API Service

**Current architecture:** Azure Functions embedded in the same Static Web App deployment.

**Target architecture:** Standalone API service (separate Azure App Service or Container App) with its own resource group, credentials, and Azure Key Vault.

**When to migrate — trigger any one of these:**
- Avallis LLC needs to call the same API endpoints
- You add authentication (member portal, assessor login, Trust Registry)
- You store any data (certifications issued, assessment records, member data)
- You handle payments

**What the migration involves:**
1. Extract `api/` into a new repo (`odipa-api`)
2. Deploy to Azure App Service (Node/Express) or Azure Container Apps
3. Move all secrets from SWA environment variables to Azure Key Vault
4. Add API key validation middleware — all requests must include `X-API-Key` header
5. Add per-endpoint rate limiting (e.g., 10 submissions per IP per hour)
6. Add IP allowlisting for Avallis if sharing the layer
7. Update `ALLOWED_ORIGIN` to validate against a list of permitted origins
8. Update `staticwebapp.config.json` to proxy `/api/*` to the new service URL
9. Run smoke tests against new endpoint URLs
10. Decommission Azure Functions from SWA

**Security improvements gained at migration:**
- Full isolation boundary — site compromise cannot reach API credentials
- Secrets in Key Vault — never co-located with the frontend deployment
- Independent patch/update cycle
- Custom rate limiting and request signing per endpoint
- Dedicated monitoring and anomaly detection


## Local Testing

```bash
cd api
SMTP_HOST=smtp.office365.com \
SMTP_PORT=587 \
SMTP_USER=noreply@odipa.org \
SMTP_PASS=your-app-password \
SMTP_FROM="ODIPA <noreply@odipa.org>" \
ALLOWED_ORIGIN=http://localhost:3000 \
func start
```

Requires [Azure Functions Core Tools](https://docs.microsoft.com/azure/azure-functions/functions-run-local).

## Newsletter Signup (Optional ESP Integration)

The newsletter endpoint at `/api/newsletter` always sends an internal notification email.
To also sync subscribers to an email service provider, set these variables:

| Variable | Value | Notes |
|---|---|---|
| `NEWSLETTER_PROVIDER` | `brevo` or `mailchimp` | Leave unset to use email-only mode |
| `BREVO_API_KEY` | Your Brevo API key | From Brevo → Account → SMTP & API |
| `BREVO_LIST_ID` | e.g. `3` | Your Brevo contact list ID (integer) |
| `MAILCHIMP_API_KEY` | e.g. `abc123-us21` | From Mailchimp → Account → API keys |
| `MAILCHIMP_LIST_ID` | e.g. `a1b2c3d4e5` | Your Mailchimp audience ID |
| `MAILCHIMP_DC` | e.g. `us21` | The datacenter prefix in your API key |

### Recommended: Brevo (free tier = 100K contacts, 300 emails/day)
1. Create account at brevo.com
2. Create a contact list and note its ID
3. Generate an API key under Account → SMTP & API → API Keys
4. Set `NEWSLETTER_PROVIDER=brevo`, `BREVO_API_KEY`, `BREVO_LIST_ID`

### Alternative: Mailchimp
1. Create an audience and note the Audience ID
2. Generate an API key under Account → Extras → API Keys
3. Note your datacenter (last part of API key, e.g. `us21`)
4. Set `NEWSLETTER_PROVIDER=mailchimp`, `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID`, `MAILCHIMP_DC`
