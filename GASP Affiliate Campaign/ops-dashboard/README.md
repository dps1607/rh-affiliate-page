# Partner Ops Dashboard

This dashboard centralizes affiliate management, lead validation, payouts, approvals, and performance—low‑ops, high‑clarity.

Recommended stack
- Data: Airtable base (Affiliates, Leads, Payouts, Creatives, Programs, Fraud Flags)
- UI: Airtable Interfaces (no‑code dashboard + queues)
- Automation: Make/Zapier (webhooks from middleware → Airtable; weekly reports; payout CSV)
- Payments: Routable weekly batch (CSV export)
- Source systems: Tapfiliate (conversions), ActiveCampaign (contacts), Middleware (validation)

Key views (Interfaces)
- Home: KPIs (valid regs, effective CPL, 7‑day purchase rate, top partners, fraud alerts)
- Lead Review Queue: only `lead_status = review` with risk 0.80–0.90
- Affiliate Profile: partner details, compliance status, W‑9, conversions, RPR trend, tier
- Creatives Approval: paid‑ads pre‑approval requests and status
- Payouts: approved totals by affiliate, export CSV for Routable
- Alerts: spikes, velocity flags, high bounce, low RPR

Included assets
- `airtable-schema.csv` – tables and fields
- `interface-spec.md` – interface layout & filters
- `automation-spec.md` – Make/Zapier scenarios
- `email-templates/affiliate-weekly-report.md` – weekly recap template
- `routable-export-template.csv` – columns for payouts

KPI definitions
- Valid registrations: post‑validation S2S conversions
- RPR (7‑day): revenue from cohort / registrations
- Effective CPL: payout / valid registrations
- Purchase rate: paid buyers / registrations (7‑day)

Ops cadence
- Daily: review queue + alerts
- Weekly: finalize approvals, export Routable CSV, send weekly reports
- Monthly: tier reviews and creative updates

