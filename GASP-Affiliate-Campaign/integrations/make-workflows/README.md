# Make (Integromat) Workflow Architecture
# GASP Affiliate Campaign - Technical Implementation

## Overview
This document outlines the complete Make workflow architecture for the affiliate campaign system, including lead validation, fraud prevention, commission tracking, and payout automation.

## Core Workflows

### 1. Lead Validation & Fraud Prevention
**Trigger:** New lead from Tapfiliate
**Purpose:** Validate lead quality and prevent fraud
**Steps:**
1. **Email Verification** (NeverBounce API)
2. **Bot Protection** (Cloudflare Turnstile validation)
3. **IP Quality Scoring** (IPQS API)
4. **Geolocation Validation** (US-only)
5. **Velocity Cap Checking**
6. **Deduplication Logic**

**Output:** Quality tier assignment ($4, $3, or Review)

### 2. ActiveCampaign Sync
**Trigger:** Validated lead from fraud prevention
**Purpose:** Sync lead data and trigger onboarding sequences
**Steps:**
1. **Lead Creation** in ActiveCampaign
2. **Tag Assignment** (Affiliate Source, Quality Tier)
3. **Sequence Trigger** (Affiliate Onboarding)
4. **Custom Field Mapping**

### 3. Commission Tracking
**Trigger:** Lead conversion to purchase
**Purpose:** Calculate and track commissions
**Steps:**
1. **Purchase Event** from ThriveCart
2. **Commission Calculation** (Base + Bonuses)
3. **Airtable Update** (Partner Performance)
4. **Payout Queue** Management

### 4. Payout Automation
**Trigger:** Weekly payout schedule
**Purpose:** Process affiliate payments via Routable
**Steps:**
1. **Commission Aggregation** (Weekly totals)
2. **Minimum Threshold** Check ($50)
3. **Routable API** Payment Creation
4. **Payment Status** Tracking
5. **Airtable Update** (Payout History)

### 5. S2S Postback Handler
**Trigger:** Server-to-server events from Tapfiliate
**Purpose:** Handle real-time tracking updates
**Steps:**
1. **HMAC Signature** Validation
2. **Event Processing** (Click, Registration, Purchase)
3. **Real-time Updates** to Airtable
4. **Performance Metrics** Calculation

## Data Flow Architecture

```
Tapfiliate → Make → ActiveCampaign
    ↓           ↓         ↓
  Tracking  Validation  Onboarding
    ↓           ↓         ↓
  S2S Events  Fraud Check  Lead Management
    ↓           ↓         ↓
  Make → Airtable → Routable
    ↓           ↓         ↓
  Analytics  Partner Mgmt  Payouts
```

## Fraud Prevention Logic

### Quality Tiers
- **$4 Tier:** ≥ 12.6% 7-day purchase rate
- **$3 Tier:** 9-12.5% 7-day purchase rate  
- **Review Tier:** < 9% 7-day purchase rate

### Validation Rules
- **Email:** Must pass NeverBounce verification
- **IP:** Must pass IPQS quality check (score > 50)
- **Location:** US-only traffic
- **Velocity:** Max 5 registrations per IP per hour
- **Deduplication:** 30-day window, email + IP validation

## API Integration Points

### Tapfiliate
- **Webhook Endpoint:** `/webhooks/tapfiliate`
- **S2S Postback:** `/postback/tapfiliate`
- **API Key:** Environment variable

### ActiveCampaign
- **API Endpoint:** `https://{account}.api-us1.com`
- **API Key:** Environment variable
- **Webhook:** `/webhooks/activecampaign`

### Routable
- **API Endpoint:** `https://api.routable.com`
- **API Key:** Environment variable
- **Webhook:** `/webhooks/routable`

### Airtable
- **Base ID:** Environment variable
- **API Key:** Environment variable
- **Tables:** Partners, Leads, Commissions, Payouts

## Error Handling & Monitoring

### Retry Logic
- **API Failures:** 3 retries with exponential backoff
- **Webhook Failures:** Queue for reprocessing
- **Data Validation:** Log errors for manual review

### Monitoring
- **Success Rates:** Track workflow completion rates
- **Error Logging:** Centralized error tracking
- **Performance Metrics:** Response time monitoring
- **Alert System:** Slack/email notifications for failures

## Security Measures

### Authentication
- **API Keys:** Stored as environment variables
- **HMAC Validation:** For Tapfiliate S2S postbacks
- **IP Whitelisting:** For webhook endpoints

### Data Protection
- **PII Encryption:** Sensitive data encrypted at rest
- **Access Logging:** All API calls logged
- **Rate Limiting:** Prevent abuse of endpoints

## Testing Strategy

### Development
- **Sample Data:** Use mock data for testing
- **Webhook Testing:** Use ngrok for local development
- **Error Simulation:** Test all failure scenarios

### Production
- **Staged Rollout:** Test with small affiliate group
- **Monitoring:** Real-time performance tracking
- **Rollback Plan:** Quick revert if issues arise

## Deployment Checklist

### Pre-Launch
- [ ] All workflows tested with sample data
- [ ] Error handling verified
- [ ] Monitoring and alerts configured
- [ ] Documentation complete
- [ ] Rollback procedures documented

### Launch Day
- [ ] Enable production workflows
- [ ] Monitor error rates
- [ ] Verify data flow
- [ ] Test affiliate onboarding
- [ ] Validate commission tracking

### Post-Launch
- [ ] Monitor performance metrics
- [ ] Gather affiliate feedback
- [ ] Optimize workflows based on data
- [ ] Scale infrastructure as needed

