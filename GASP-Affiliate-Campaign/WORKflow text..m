Great—Tapfiliate route it is. Here’s the clean, 24‑hour workflow and design structure. This is the exact order your team will follow.

Design structure (partner-facing)
- Page: Affiliate application (on brand), sections:
  - Hero + promise (Get & Stay Pregnant Masterclass), pay-per-registrant
  - Why partner (science-backed, DFY assets, ethical messaging)
  - Selectivity (who fits / not a fit), USA-only
  - Commission (CPL $3 base, $4 tier), paid ads pre-approval (48h)
  - Apply form (manual approval)
- Assets kit: link generator + copybank + paid-ads policy + brand assets
- Partner portal: Tapfiliate (self-serve links, live conversions)

24-hour workflow (owners + steps)

0) You (15 min)
- Approve tiers: $3 base, $4 if 7‑day purchase rate ≥ 12.6% (house = 18%).
- Confirm payout day: Tuesdays; minimum payout $50.
- Confirm “attendance not required” and USA-only.

1) Tapfiliate setup (Integrations, 60–90 min)
- Create Program: “GASP Masterclass – CPL”.
- Attribution: last‑click; cookie 30 days; Conversions via S2S only.
- Manual affiliate approvals: ON.
- Conversion (CPL): commission $3 or $4 (we’ll use the $3 default; Middleware can tag tier for reporting).
- Invite/approve first partners (portal access).
- Decide link format (keep simple): we will continue using your standard link with `?aff=ALIAS`; Tapfiliate will receive conversions S2S using that ALIAS as `referral_code`.

2) Form + Middleware (Make) (Integrations, 2–3 h)
- Registration form (Unbounce or current):
  - Hidden fields: `aff`, `utm_source`, `utm_medium`, `utm_campaign`
  - Add Cloudflare Turnstile (free)
  - Webhook → Make scenario URL
- Make scenario (today; Lambda later):
  - Verify Turnstile
  - NeverBounce = valid (reject else)
  - US-only (Geo-IP); block data-center ASNs (Cloudflare header ok)
  - Dedupe: reject if email exists in AC/Kajabi/ThriveCart within 365d; limit 1 qualified reg/email per 30d
  - Upsert ActiveCampaign contact:
    - Fields: `affiliate_id`, `utm_source`, `utm_medium`, `utm_campaign`, `ip`, `ua`, `lead_valid`, `risk_score(0/1)`, `register_ts`
    - Tags: `lead:affiliate`, `source:[affiliate_id]`, `lead:valid` (or `lead:held`)
  - Tapfiliate S2S (valid only):
    - POST /conversions with `{ program, referral_code: aff, external_id: sha256(email), amount: 0, currency: USD }`
  - Write Airtable “Leads” (optional; simple ledger)
  - HTTP 200/202/204 back to form

3) ActiveCampaign (Integrations, 45–60 min)
- Create custom fields and tags above.
- Automations:
  - “Affiliate Welcome” (trigger: tag `affiliate:approved` on affiliate contact) → send portal link, tracking format, assets, paid-ads policy.
  - “Weekly Recap” (trigger: weekly) → optional today; we can feed per‑affiliate counts later from Tapfiliate export.

4) Payouts via Routable (Ops, 30–45 min)
- Weekly: Filter Tapfiliate conversions by date + status “approved”.
- Export CSV → Routable. Pay Net‑7 after first masterclass in cycle.
- Minimum payout $50; no reserve initially (add 5% if noise appears).

5) Policies (comms ready to paste)
- Paid per valid US registration (attendance not required). Manual affiliate approvals. USA-only traffic.
- Disallowed: incentivized/co-reg/sweepstakes, coupon/discount directories, bulk SMS, misleading medical claims.
- Paid ads allowed with pre‑approved copy/creatives (48h SLA).

What I need (now)
- Tapfiliate admin, AC API key + base URL, Unbounce webhook access, Cloudflare Turnstile site/secret, NeverBounce API key, Routable payouts access.

What I’ll deliver to your team today
- Tapfiliate program config doc (ready-to-apply settings)
- Make scenario blueprint (step-by-step, field maps, sample payloads)
- AC fields+tags checklist, two automations (Welcome + optional Weekly)
- Affiliate Welcome email (with portal + link format + assets)
- Paid-ads pre-approval policy + copybank (short/long captions)
- Routable payout CSV template and 1-page SOP

Go/no-go test (30 min)
- Test with `?aff=TESTAFF`: valid path creates AC contact + Tapfiliate conversion; duplicates reject; non-US rejects; Turnstile fail rejects.
- Generate Tapfiliate export; dry-run Routable import.

This keeps it simple (Tapfiliate + AC + Make + Routable), highly affiliate-friendly (portal), and launchable in 24 hours.