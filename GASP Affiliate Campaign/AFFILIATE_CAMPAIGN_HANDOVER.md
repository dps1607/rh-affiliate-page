# AFFILIATE CAMPAIGN HANDOVER DOCUMENT
## Dr. Nashat Latib - Get & Stay Pregnant Naturally Masterclass

---

## 🎯 CAMPAIGN OVERVIEW

**Primary Goal:** Recruit and manage affiliates to drive registrations for Dr. Nashat Latib's FREE fertility masterclass, which feeds into her paid "Fertility Formula Online Course."

**Campaign Type:** Lead Generation (CPL - Cost Per Lead)
**Timeline:** Launch ASAP (first masterclass: August 19, 2025)
**Budget Model:** Pay-per-registration, no upfront costs

---

## 🏗️ SYSTEM ARCHITECTURE

### Core Components
1. **Affiliate Application Landing Page** (`affiliate-recruitment-system/affiliate-application.html`)
2. **Affiliate Management System** (Tapfiliate)
3. **Payment Processing** (Routable)
4. **Fraud Prevention & Quality Control**
5. **Partner Operations Dashboard** (Airtable Interfaces)

### Tech Stack
- **Existing:** WordPress, Kajabi, ThriveCart, ActiveCampaign
- **New:** Tapfiliate (affiliate tracking), Routable (payouts), Airtable (ops dashboard)
- **Middleware:** Make (Integromat) for automation

---

## 💰 COMMISSION STRUCTURE

### Option 1: Fixed Per Registration
- **Base:** $4.00 per qualified registration
- **50-150 registrations/month:** +$0.50 bonus = $4.50 per reg
- **150+ registrations/month:** +$1.00 bonus = $5.00 per reg
- **Payout:** Whether or not they purchase (attendance not required)

### Option 2: Percentage of Sales
- **Base:** 10% of each sale ($997 program = $99.70)
- **50-150 registrations/month:** +1.25% bonus = $112.16 per sale
- **150+ registrations/month:** +2.5% bonus = $124.63 per sale

**Payout Schedule:** Weekly via secure affiliate portal
**Minimum Payout:** $50
**First Payout:** After the first masterclass (August 19, 2025)

---

## 🎯 TARGET AFFILIATES

### Primary Categories
1. **Health & Wellness Influencers**
   - Fertility, pregnancy, hormone balance, holistic care
   - Instagram, YouTube, TikTok focus
   - High engagement with women 25-45

2. **Fertility Clinics (IVF/IUI)**
   - Complementary natural optimization alongside protocols
   - Improves IVF/IUI success rates through detox work
   - Medical professional alignment

3. **TikTok Creators**
   - Short-form content with authority and warmth
   - High-value message in seconds of screen time
   - Quality over quantity approach

4. **YouTube Educators**
   - Deep dives in women's wellness
   - Trusted advice and proven programs
   - Long-form content expertise

### Excluded Categories
- **Fertility Coaches** (competitors)
- Miracle cure messaging
- Fear-based or shame-based content
- Unrelated niches outside women's wellness

---

## 🚫 COMPLIANCE & RESTRICTIONS

### Allowed
- **Paid Media:** Meta, Instagram, TikTok, YouTube, Google
- **Pre-approval Required:** 48-hour SLA for ad copy review
- **Geography:** USA-only traffic
- **Medical Professionals:** Explicitly welcome clinics and practitioners

### Disallowed
- Incentivized sign-ups or sweepstakes
- Bot or bulk SMS traffic
- Coupon/discount directories
- Misleading medical claims
- Co-registration programs

### Requirements
- **FTC Disclosure:** Required on all promotions
- **Fraud Prevention:** Turnstile/hCaptcha, IPQS, velocity caps
- **Deduplication:** 30-day window, email + IP validation

---

## 🔒 FRAUD PREVENTION SYSTEM

### Technical Measures
- **Email Verification:** NeverBounce integration
- **Bot Protection:** Cloudflare Turnstile or hCaptcha
- **IP Quality Score:** IPQS risk assessment
- **Geolocation:** US-only IP filtering
- **Velocity Caps:** Registration limits per affiliate/IP/time
- **Deduplication:** By email, IP, timestamp
- **S2S Postbacks:** HMAC signature validation

### Quality Tiers
- **$4 Tier:** 7-day purchase rate ≥ 12.6% (house = 18%)
- **$3 Tier:** 7-day purchase rate 9-12.5%
- **Review/Pause:** 7-day purchase rate < 9%

---

## 📱 AFFILIATE APPLICATION PAGE

### Current Status
- **File:** `affiliate-recruitment-system/affiliate-application.html`
- **Backup:** `affiliate-recruitment-system/affiliate-application.backup.html`
- **Styling:** `affiliate-recruitment-system/affiliate-styles.css`
- **Functionality:** `affiliate-recruitment-system/affiliate-script.js`

### Key Features
- **Header Logo:** DrNashatLatib_RGB_StackedLockup_Blue.jpg (3x size)
- **Masterclass Preview:** Framed "browser" card with LIVE PREVIEW badge
- **Content:** 100% from `affiliate_landing_page_rewrite.docx`
- **Brand Colors:** Navy (#142A40), Pink (#DDB6AF), Gray (#8C8589)
- **Typography:** Baskerville (headings), Gill Sans (body)

### Content Sections
1. Hero with compelling value proposition
2. Masterclass preview (framed, linked to live page)
3. Why opportunity stands out
4. What affiliates promote
5. Perfect partner profiles
6. Benefits of partnership
7. Testimonials
8. Payout models
9. Selection criteria
10. Application process
11. Compliance highlights
12. About Dr. Latib
13. Application form

---

## 🚀 IMPLEMENTATION TIMELINE

### Phase 1: Immediate Launch (24-48 hours)
- [ ] Deploy affiliate application page to drnashatlatib.com
- [ ] Set up Tapfiliate account and basic tracking
- [ ] Configure Routable for payouts
- [ ] Create Airtable base for partner ops
- [ ] Set up Make automation workflows

### Phase 2: Week 1
- [ ] Launch affiliate recruitment outreach
- [ ] Process first applications
- [ ] Onboard approved affiliates
- [ ] Deploy affiliate toolkit and assets

### Phase 3: Week 2
- [ ] Monitor performance and fraud
- [ ] Optimize conversion tracking
- [ ] Scale successful outreach channels
- [ ] Prepare for first masterclass (August 19)

---

## 📊 SUCCESS METRICS

### Primary KPIs
- **Affiliate Applications:** Target 50+ qualified applications
- **Approval Rate:** 60-70% of applications
- **Registrations per Affiliate:** 20+ in first 7 days
- **Overall Conversion:** 18% purchase rate (house benchmark)

### Quality Indicators
- **Fraud Rate:** < 5% of registrations
- **Geographic Compliance:** 100% US traffic
- **Content Alignment:** 90%+ approved ad copy
- **Partner Satisfaction:** 4.5+ rating

---

## 🛠️ TECHNICAL SETUP REQUIREMENTS

### Tapfiliate Configuration
- **Account Setup:** Professional plan
- **Tracking:** S2S postbacks, UTM parameters
- **Fraud Prevention:** Integration with IPQS, NeverBounce
- **Reporting:** Real-time performance dashboard

### Make (Integromat) Workflows
- **Lead Validation:** Email verification, IP checks
- **ActiveCampaign Sync:** Contact creation and tagging
- **Fraud Detection:** Velocity monitoring, deduplication
- **S2S Postbacks:** Secure conversion tracking

### Airtable Interfaces
- **Partner Profiles:** Contact info, performance metrics
- **Creative Approvals:** Ad copy review workflow
- **Lead Review:** Fraud detection and quality control
- **Payout Management:** Commission calculation and tracking

---

## 📁 FILE STRUCTURE

```
GASP Affiliate Campaign/
├── affiliate-recruitment-system/
│   ├── affiliate-application.html (MAIN PAGE)
│   ├── affiliate-application.backup.html
│   ├── affiliate-styles.css
│   ├── affiliate-script.js
│   ├── outreach-templates.md
│   └── marketing-materials.md
├── brand/
│   ├── DrNashatLatib_RGB_StackedLockup_Blue.jpg
│   ├── DrNashatLatib_RGB_Arch Copper.jpg
│   └── masterclass-hero-static.jpg
├── integrations/
│   └── tracking-architecture.md
├── ops-dashboard/
│   └── README.md
└── AFFILIATE_CAMPAIGN_HANDOVER.md (THIS FILE)
```

---

## 🔑 KEY DECISIONS MADE

### Strategic Choices
1. **Tapfiliate over Refersion:** Better partner experience, reduced ops overhead
2. **Routable for Payouts:** Handles international payments, good fraud protection
3. **Make over Zapier:** More powerful automation, better cost structure
4. **Airtable Interfaces:** Flexible ops dashboard without custom development

### Design Decisions
1. **Navy to Pink Hover:** Brand-consistent button styling
2. **Framed Preview:** Clear visual separation of masterclass content
3. **3x Logo Size:** Prominent brand presence
4. **Blush Backgrounds:** Reduced blue, more sophisticated aesthetic

### Content Strategy
1. **100% Copywriter Content:** No modifications to provided copy
2. **Selective Partnership:** Case-by-case approval, no minimum audience size
3. **Medical Professional Focus:** Explicit welcome for clinics and practitioners
4. **Ethical Messaging:** No miracle claims, evidence-based approach

---

## 📞 CONTACT & SUPPORT

### Key Stakeholders
- **Dr. Nashat Latib:** Program owner and medical authority
- **Copywriter:** Content provider for affiliate materials
- **Technical Team:** Implementation and maintenance
- **Affiliate Manager:** Partner relations and support

### Communication Channels
- **Affiliate Support:** affiliates@drnashatlatib.com
- **Technical Issues:** [Technical contact]
- **Creative Approvals:** 48-hour SLA via affiliate portal
- **Emergency Contact:** [Emergency contact]

---

## 🚨 CRITICAL SUCCESS FACTORS

### Must-Have for Launch
1. **Fraud Prevention:** IPQS, NeverBounce, velocity caps operational
2. **Tracking System:** Tapfiliate tracking links and S2S postbacks
3. **Payment Processing:** Routable account and payout workflows
4. **Quality Control:** Airtable dashboard for lead review

### Risk Mitigation
1. **Fraud Protection:** Multiple layers of validation
2. **Brand Safety:** Pre-approval for all paid media
3. **Compliance:** FTC disclosure enforcement
4. **Performance Monitoring:** Real-time fraud and quality metrics

---

## 📋 NEXT STEPS CHECKLIST

### Immediate (Next 24 hours)
- [ ] Review and approve this handover document
- [ ] Confirm technical team availability
- [ ] Set up Tapfiliate account
- [ ] Configure Routable payment processing

### Week 1
- [ ] Deploy affiliate application page
- [ ] Set up Make automation workflows
- [ ] Create Airtable ops dashboard
- [ ] Begin affiliate recruitment outreach

### Week 2
- [ ] Process first affiliate applications
- [ ] Onboard approved partners
- [ ] Deploy affiliate toolkit
- [ ] Monitor performance metrics

---

## 💡 SUCCESS TIPS

1. **Start Small:** Focus on 10-15 high-quality affiliates initially
2. **Quality Over Quantity:** Better to have fewer engaged partners than many inactive ones
3. **Monitor Closely:** Watch fraud metrics and quality indicators daily
4. **Iterate Quickly:** Adjust commission structure and outreach based on early results
5. **Brand Protection:** Maintain strict approval process for all creative content

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Prepared By:** [Your Name]  
**Next Review:** [Date]  

---

*This handover document contains all critical information needed to successfully launch and manage Dr. Nashat Latib's affiliate campaign. Please review thoroughly and confirm understanding before proceeding with implementation.*
