# Affiliate CPL Tracking Architecture (Pro Stack)

Goal: Pay affiliates $3–$4 per valid registration for the “Get & Stay Pregnant Naturally” masterclass while protecting quality, blocking fraud, and minimizing ops.

## Components
- Links: `https://startreimagined.com/gasp/live?aff=AFF_ID&utm_source=affiliate&utm_medium={platform}`
- Landing/Form: Unbounce (or WP/Kajabi) registration form
- Bot Gate: Cloudflare Turnstile (or hCaptcha)
- Middleware: AWS Lambda + API Gateway (Node.js) – validation + orchestration
- Email Verification: NeverBounce
- Fraud Scoring: IPQualityScore (IPQS)
- CRM: ActiveCampaign (contact fields + tags)
- Affiliate Platform: Tapfiliate (CPL, S2S postback)
- Payouts: Routable (weekly batch)
- Optional Ops: Airtable (affiliate registry + lead ledger)

## Lead Flow
1. Visitor hits Unbounce page with `aff` + UTM params.
2. Form submit → Unbounce Webhook → AWS API Gateway (Lambda). Payload contains: first/last/email/phone, aff, utm_*, IP, UA, Turnstile token.
3. Lambda validates:
   - Turnstile token valid
   - NeverBounce email = valid
   - IPQS risk < 0.80 auto-approve, 0.80–0.90 review, > 0.90 block
   - Geo = US, ASN is residential/consumer; block DC/cloud
   - Velocity: per affiliate/IP (KV in DynamoDB)
   - Dedupe: no contact with same email in AC/Kajabi/ThriveCart within 365 days; within 30 days globally per email
4. If valid:
   - Upsert contact in ActiveCampaign with custom fields + tags
   - Create “lead ledger” row (Airtable optional)
   - Fire Tapfiliate S2S conversion (CPL) with affiliate_id + external_id (hash of email)
   - Respond 200 to Unbounce
5. If review: tag `lead:held` and write ledger for manual review; respond 202
6. If blocked: respond 204/422; don’t fire conversion

## Payout Policy
- Weekly (e.g., Tuesdays) via Routable
- Pay per valid registration after the first masterclass in cycle; attendance not required
- Start with 0% reserve; add 5% rolling 7‑day reserve if needed
- Minimum payout: $50

## Performance Policy (based on 18% purchase rate)
- $4 tier: affiliate 7‑day purchase rate ≥ 12.6% (≥ 70% of house)
- $3 tier: 9.0%–12.5%
- Review/Pause: < 9.0%
- Metrics for diagnostics: deliverability >95%, bounce <2%, unsub <1.5%, attendance lift ≥20%

## Data Model (ActiveCampaign Custom Fields)
- `affiliate_id` (text)
- `utm_source`, `utm_medium`, `utm_campaign` (text)
- `ip`, `ua` (text)
- `risk_score` (number)
- `lead_valid` (boolean)
- `lead_status` (enum: valid|review|blocked)
- `register_ts` (datetime)

## DynamoDB Tables
- `lead_velocity` – keys: `{affiliate_id#hour}`, counters: `count`, `ips[]`
- `ip_limits` – keys: `{ip#day}` counters
- `email_dedupe` – keys: `{email_sha#yyyymm}` – TTL 365d

## Secrets / Config (Lambda env)
- `AC_API_KEY`, `AC_BASE_URL`
- `TAPFILIATE_API_KEY`, `TAP_PROGRAM_ID`
- `NEVERBOUNCE_API_KEY`
- `IPQS_API_KEY`
- `TURNSTILE_SECRET_KEY`
- `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID` (optional)

## Tapfiliate S2S
- Endpoint: `POST https://api.tapfiliate.com/1.6/conversions/`
- Body: `{ "program": T, "referral_code": "AFF_ID", "external_id": "email_sha", "amount": 0, "currency": "USD", "commission_type": "sale" }`
- Use HMAC auth header with API key

## Deployment
- Lambda Node.js 18, deploy via SAM or Serverless Framework
- API Gateway HTTP API, rate‑limited (e.g., 300 rpm)
- IAM least‑privilege to DynamoDB tables
- CloudWatch alarms for 5XX, latency, spike alerts

## Unbounce Webhook Mapping (example)
- `first_name`, `last_name`, `email`, `phone`
- `aff`, `utm_source`, `utm_medium`, `utm_campaign` (hidden fields)
- `cf_turnstile_token` (Turnstile)

## Routable Export
- Weekly CSV with columns: `affiliate_id, email_sha, registration_ts, amount, currency, memo`

## Paid Media Safety (Meta/TikTok/Google)
- No personal attributes or medical claims; education‑first language
- Pre‑approved copybank + creatives; SLA 48h for review

## Timeline
- Day 1–2: Tapfiliate program, Lambda boilerplate, AC fields/tags
- Day 3–4: Validation wiring (NeverBounce, IPQS, Turnstile), DynamoDB limits, S2S
- Day 5: Routable export + SOP, QA & go‑live

