# GASP Affiliate Campaign - Airtable Base Structure
## Complete Technical Framework for Launch

## Base Overview
This Airtable base serves as the central hub for the GASP affiliate campaign, supporting both **Fixed Per Registration** and **Percentage of Sales** payment models with automated commission calculation, partner management, and payout processing.

## Core Tables

### 1. Partners
**Purpose:** Store affiliate partner information, program choice, and performance metrics

**Fields:**
- **Partner ID** (Auto Number) - Unique identifier
- **Status** (Single Select) - Pending, Active, Suspended, Terminated
- **Application Date** (Date) - When partner applied
- **Approval Date** (Date) - When partner was approved
- **Program Choice** (Single Select) - **CRITICAL FIELD**
  - Option 1: Fixed Per Registration
  - Option 2: Percentage of Sales
- **Contact Information**
  - First Name (Text)
  - Last Name (Text)
  - Email (Email)
  - Phone (Phone)
  - Company/Clinic (Text)
- **Platform Information**
  - Primary Platform (Single Select: Instagram, TikTok, YouTube, Pinterest, Blog/Website, Email List, Medical Clinic, Other)
  - Platform Handle/URL (URL)
  - Follower Count (Number)
  - Additional Platforms (Multiple Select)
- **Audience Information**
  - Audience Type (Single Select: Women trying to conceive, Pregnant women, Health & wellness enthusiasts, Medical professionals, General women's health, Mixed audience)
  - Estimated Engagement Rate (Single Select: 1-2%, 3-5%, 6-10%, 10%+)
  - Geographic Focus (Multiple Select: USA, International)
- **Performance Metrics**
  - Total Registrations (Rollup from Leads table)
  - Total Conversions (Rollup from Leads table)
  - Conversion Rate (Formula: Conversions/Registrations)
  - Total Commissions (Rollup from Commissions table)
  - Monthly Registration Count (Number) - For bonus calculations
  - Quality Tier (Single Select: $4, $4.50, $5.00, 10%, 11.25%, 12.5%)
  - Last Activity (Date)
- **Creative Approval**
  - Ad Copy Status (Single Select: Pending, Approved, Rejected)
  - Creative Assets (Multiple Attachments)
  - Approval Notes (Long Text)
- **Payment Information**
  - Payment Method (Single Select: PayPal, ACH, Wire Transfer)
  - Payment Details (Long Text)
  - Tax Information (Multiple Attachments)
  - Minimum Payout Threshold (Currency) - Default $50

**Views:**
- All Partners
- Active Partners
- Pending Approval
- Option 1 Partners (Fixed Per Registration)
- Option 2 Partners (Percentage of Sales)
- Performance Leaders
- Payment Due

### 2. Leads
**Purpose:** Track all registrations and their conversion status

**Fields:**
- **Lead ID** (Auto Number) - Unique identifier
- **Partner** (Link to Partners) - Which affiliate generated the registration
- **Registration Information**
  - Email (Email)
  - First Name (Text)
  - Last Name (Text)
  - Phone (Phone)
  - IP Address (Text)
  - User Agent (Long Text)
  - Referrer URL (URL)
  - Registration Date (Date)
- **Validation Status**
  - Email Verification (Single Select: Pending, Valid, Invalid)
  - IP Quality Score (Number: 0-100)
  - Bot Protection (Single Select: Pass, Fail)
  - Geolocation (Single Select: US, International)
  - Velocity Check (Single Select: Pass, Fail)
  - Deduplication (Single Select: New, Duplicate)
  - Overall Status (Single Select: Pending, Valid, Invalid, Review)
- **Quality Metrics**
  - Quality Tier (Single Select: $4, $4.50, $5.00, 10%, 11.25%, 12.5%)
  - Risk Score (Number: 0-100)
  - Validation Notes (Long Text)
- **Conversion Data**
  - Converted to Purchase (Checkbox)
  - Purchase Amount (Currency) - $997 program price
  - Commission Earned (Currency) - Calculated based on partner's program choice
  - Purchase Date (Date)
  - Days to Conversion (Number)

**Views:**
- All Registrations
- Pending Validation
- Valid Registrations
- Invalid Registrations
- Converted Registrations
- By Partner
- By Date Range

### 3. Commissions
**Purpose:** Track commission calculations for both payment models

**Fields:**
- **Commission ID** (Auto Number) - Unique identifier
- **Partner** (Link to Partners) - Affiliate partner
- **Lead** (Link to Leads) - Associated registration
- **Program Type** (Single Select) - Inherited from Partner
  - Option 1: Fixed Per Registration
  - Option 2: Percentage of Sales
- **Commission Calculation**
  - Base Amount (Currency) - Base commission rate
  - Bonus Amount (Currency) - Performance bonuses
  - Total Commission (Currency) - Total earned
  - Commission Rate (Single Select) - Based on monthly volume
  - Bonus Type (Multiple Select: Volume Bonus, Quality Bonus, Early Bird)
- **Monthly Volume Bonuses** (Auto-calculated)
  - **Option 1 Bonuses:**
    - 50-150 registrations/month: +$0.50 = $4.50 per reg
    - 150+ registrations/month: +$1.00 = $5.00 per reg
  - **Option 2 Bonuses:**
    - 50-150 registrations/month: +1.25% = 11.25% per sale
    - 150+ registrations/month: +2.5% = 12.5% per sale
- **Status**
  - Status (Single Select: Pending, Approved, Paid, Cancelled)
  - Approval Date (Date)
  - Payment Date (Date)
- **Performance Metrics**
  - Days to Conversion (Number)
  - Quality Score (Number)
  - Partner Performance Tier (Single Select)
- **Timestamps**
  - Created (Created Time)
  - Approved (Date)
  - Paid (Date)

**Views:**
- All Commissions
- Pending Approval
- Approved Commissions
- Paid Commissions
- Option 1 Commissions
- Option 2 Commissions
- By Partner
- By Date Range

### 4. Payouts
**Purpose:** Manage weekly payout processing for both payment models

**Fields:**
- **Payout ID** (Auto Number) - Unique identifier
- **Partner** (Link to Partners) - Affiliate partner
- **Program Type** (Single Select) - Inherited from Partner
- **Payout Period**
  - Start Date (Date)
  - End Date (Date)
  - Week Number (Number)
- **Financial Details**
  - Total Commissions (Currency) - Sum of approved commissions
  - Processing Fee (Currency) - Any fees deducted
  - Net Payout (Currency) - Amount partner receives
  - Minimum Threshold Met (Checkbox) - $50 minimum
- **Payment Processing**
  - Payment Method (Single Select: ACH, Wire, PayPal)
  - Routable Payment ID (Text)
  - Status (Single Select: Pending, Processing, Completed, Failed)
  - Processing Date (Date)
  - Completion Date (Date)
- **Documentation**
  - Payment Receipt (Attachment)
  - Tax Documentation (Multiple Attachments)
  - Notes (Long Text)

**Views:**
- All Payouts
- Pending Payouts
- Completed Payouts
- Failed Payouts
- By Week
- By Partner
- By Program Type

### 5. Communication Logs
**Purpose:** Track all automated communications with partners

**Fields:**
- **Communication ID** (Auto Number) - Unique identifier
- **Partner** (Link to Partners) - Affiliate partner
- **Communication Type** (Single Select)
  - Welcome Sequence
  - New Lead Notification
  - First Commission Celebration
  - Milestone Achievement
  - Payout Notification
  - Performance Boost
  - Training Reminder
  - Motivational Message
- **Event Trigger** (Single Select)
  - New Lead Generated
  - Commission Earned
  - Milestone Reached
  - Payout Processed
  - Performance Boost
  - Welcome Sequence
  - Training Reminder
  - Motivational Message
- **Content Details**
  - Subject Line (Text)
  - Message Body (Long Text)
  - Template Used (Single Select)
  - Priority Level (Single Select: Low, Normal, High)
- **Delivery Status**
  - Status (Single Select: Scheduled, Sent, Delivered, Failed)
  - Scheduled Date (Date)
  - Sent Date (Date)
  - Delivery Confirmation (Date)
  - Failure Reason (Long Text)
- **Engagement Metrics**
  - Opened (Checkbox)
  - Clicked (Checkbox)
  - Replied (Checkbox)
  - Unsubscribed (Checkbox)
- **Timestamps**
  - Created (Created Time)
  - Last Updated (Date)

**Views:**
- All Communications
- Scheduled Communications
- Sent Communications
- Failed Communications
- By Partner
- By Communication Type
- By Date Range

### 6. Scheduled Communications
**Purpose:** Manage automated communication scheduling and sequences

**Fields:**
- **Schedule ID** (Auto Number) - Unique identifier
- **Partner** (Link to Partners) - Affiliate partner
- **Communication Type** (Single Select)
  - Welcome Sequence
  - Training Reminder
  - Motivational Message
  - Performance Check-in
- **Schedule Details**
  - Trigger Event (Single Select)
  - Delay Days (Number) - Days after trigger event
  - Scheduled Date (Date)
  - Time Zone (Single Select)
- **Sequence Information**
  - Sequence Step (Number)
  - Total Steps (Number)
  - Previous Step Completed (Checkbox)
  - Next Step Scheduled (Date)
- **Content Template**
  - Template ID (Text)
  - Subject Line (Text)
  - Message Body (Long Text)
  - Personalization Fields (Multiple Select)
- **Status**
  - Status (Single Select: Scheduled, Sent, Cancelled, Failed)
  - Last Updated (Date)
  - Notes (Long Text)

**Views:**
- All Scheduled Communications
- Upcoming Communications
- Completed Communications
- Failed Communications
- By Partner
- By Communication Type
- By Date Range

### 7. Error Logs
**Purpose:** Track system errors and workflow failures

**Fields:**
- **Error ID** (Auto Number) - Unique identifier
- **Error Type** (Single Select)
  - Workflow Failure
  - API Error
  - Data Validation Error
  - Payment Processing Error
  - Communication Failure
  - System Error
- **Severity Level** (Single Select: Low, Medium, High, Critical)
- **Source**
  - Workflow Name (Text)
  - Module ID (Text)
  - API Endpoint (Text)
- **Error Details**
  - Error Message (Long Text)
  - Error Code (Text)
  - Stack Trace (Long Text)
  - User Context (Long Text)
- **Affected Records**
  - Partner ID (Link to Partners)
  - Lead ID (Link to Leads)
  - Commission ID (Link to Commissions)
- **Resolution**
  - Status (Single Select: Open, In Progress, Resolved, Closed)
  - Assigned To (Text)
  - Resolution Notes (Long Text)
  - Resolution Date (Date)
- **Timestamps**
  - Created (Created Time)
  - Last Updated (Date)
  - Resolved (Date)

**Views:**
- All Errors
- Open Errors
- Critical Errors
- By Error Type
- By Severity
- By Workflow
- By Date Range

### 8. Performance Metrics
**Purpose:** Track system-wide performance and analytics

**Fields:**
- **Metric ID** (Auto Number) - Unique identifier
- **Date** (Date) - Date of metrics
- **System Metrics**
  - Total Registrations (Number)
  - Valid Registrations (Number)
  - Invalid Registrations (Number)
  - Conversion Rate (Percent)
  - Fraud Rate (Percent)
  - Average Commission (Currency)
- **Partner Metrics**
  - Active Partners (Number)
  - New Partners (Number)
  - Option 1 Partners (Number)
  - Option 2 Partners (Number)
  - Top Performers (Multiple Select)
- **Financial Metrics**
  - Total Commissions (Currency)
  - Total Payouts (Currency)
  - Revenue Generated (Currency)
  - Average Commission by Program Type (Currency)
- **Quality Metrics**
  - Average Quality Score (Number)
  - Quality Tier Distribution (Long Text)
  - Geographic Compliance (Percent)
- **Program Performance**
  - Option 1 Conversion Rate (Percent)
  - Option 2 Conversion Rate (Percent)
  - Average Commission by Option (Currency)

**Views:**
- Daily Metrics
- Weekly Summary
- Monthly Trends
- Performance Dashboard
- Program Comparison

## Automation Rules

### 1. Commission Calculation Workflow
- **Trigger:** New registration or conversion
- **Action:** Calculate commission based on partner's program choice and monthly volume
- **Fields Updated:** Commission Amount, Bonus Amount, Total Commission

### 2. Monthly Volume Bonus Calculation
- **Trigger:** Monthly registration count update
- **Action:** Recalculate commission rates for volume bonuses
- **Fields Updated:** Commission Rate, Quality Tier

### 3. Payout Processing
- **Trigger:** Weekly payout schedule
- **Action:** Create payout records for eligible partners
- **Fields Updated:** Payout Status, Processing Date

### 4. Performance Updates
- **Trigger:** Commission status changes
- **Action:** Update partner performance metrics
- **Fields Updated:** Total Commissions, Conversion Rate, Quality Tier

### 5. Communication Automation
- **Trigger:** Various events (new leads, milestones, etc.)
- **Action:** Schedule and send automated communications
- **Fields Updated:** Communication Status, Delivery Confirmation

## Data Relationships

### Primary Links
- **Partners ↔ Leads:** One-to-many (one partner, many registrations)
- **Leads ↔ Commissions:** One-to-one (one registration, one commission)
- **Partners ↔ Commissions:** One-to-many (one partner, many commissions)
- **Partners ↔ Payouts:** One-to-many (one partner, many payouts)
- **Partners ↔ Communication Logs:** One-to-many (one partner, many communications)
- **Partners ↔ Scheduled Communications:** One-to-many (one partner, many scheduled communications)

### Rollup Fields
- **Partner Total Registrations:** Count of linked leads
- **Partner Total Commissions:** Sum of linked commissions
- **Partner Conversion Rate:** Calculated from registrations and conversions
- **Partner Quality Tier:** Based on monthly volume and program choice

## Commission Calculation Logic

### Option 1: Fixed Per Registration
- **Base Rate:** $4.00 per qualified registration
- **Volume Bonuses:**
  - 50-150 registrations/month: +$0.50 = $4.50 per reg
  - 150+ registrations/month: +$1.00 = $5.00 per reg
- **Payment:** Weekly, regardless of conversion

### Option 2: Percentage of Sales
- **Base Rate:** 10% of each sale ($997 program = $99.70)
- **Volume Bonuses:**
  - 50-150 registrations/month: +1.25% = 11.25% per sale ($112.16)
  - 150+ registrations/month: +2.5% = 12.5% per sale ($124.63)
- **Payment:** Weekly, only on conversions

## Interface Design

### 1. Partner Dashboard
- **Overview:** Key metrics and recent activity
- **Performance:** Registration and conversion tracking
- **Program Choice:** Current payment model and rates
- **Creative:** Asset approval status
- **Payments:** Commission and payout history

### 2. Admin Dashboard
- **System Overview:** Total metrics and trends
- **Partner Management:** Approval and monitoring
- **Program Performance:** Option 1 vs Option 2 metrics
- **Quality Control:** Fraud prevention metrics
- **Financial Tracking:** Commission and payout overview

### 3. Creative Approval Interface
- **Submission Queue:** Pending approvals
- **Review Tools:** Asset preview and feedback
- **Approval Workflow:** Streamlined decision process

### 4. Payment Management
- **Payout Schedule:** Weekly processing overview
- **Payment Tracking:** Status and history
- **Financial Reporting:** Revenue and commission analytics by program type

## Security & Access

### User Roles
- **Admin:** Full access to all tables and data
- **Manager:** Access to partner management and creative approval
- **Partner:** Limited access to own data and performance
- **Viewer:** Read-only access to public metrics

### Data Protection
- **PII Encryption:** Sensitive data encrypted
- **Access Logging:** All data access tracked
- **Audit Trail:** Complete change history maintained

## Integration Points

### Make (Integromat) Workflows
- **GASP Lead Validation & Fraud Prevention**
- **GASP Commission Tracking & Calculation**
- **GASP Weekly Payout Automation**
- **GASP Partner Onboarding Automation**
- **GASP Performance Analytics & Reporting**
- **GASP Communication Automation**

### External APIs
- **ThriveCart:** Registration and purchase data
- **ActiveCampaign:** Contact management and email automation
- **Routable:** Payment processing
- **NeverBounce:** Email validation
- **IPQS:** IP quality scoring

## Performance Optimization

### Indexing Strategy
- **Primary Keys:** All ID fields indexed
- **Search Fields:** Email, Partner ID, Status fields
- **Date Fields:** Created, Updated, Date fields
- **Relationship Fields:** Link fields for joins
- **Program Type Fields:** For commission calculations

### Data Archiving
- **Active Data:** Current month + 3 months
- **Archive Data:** Older data moved to archive tables
- **Performance:** Regular cleanup of old records

## Backup & Recovery

### Backup Strategy
- **Daily Backups:** Automated daily backups
- **Version History:** 30-day version history
- **Export Files:** Monthly data exports

### Recovery Procedures
- **Point-in-time Recovery:** Restore to specific date
- **Data Validation:** Post-recovery verification
- **Rollback Procedures:** Quick revert if needed

## Launch Checklist

### Pre-Launch Setup
- [ ] Create Airtable base with all tables
- [ ] Import Make workflow JSONs
- [ ] Configure API keys and webhooks
- [ ] Test commission calculations for both options
- [ ] Verify payout automation
- [ ] Test communication sequences

### Launch Day
- [ ] Activate all workflows
- [ ] Monitor system performance
- [ ] Verify data flow accuracy
- [ ] Test partner onboarding process

### Post-Launch Monitoring
- [ ] Daily performance reviews
- [ ] Weekly payout verification
- [ ] Monthly partner performance analysis
- [ ] Continuous fraud prevention monitoring

---

**This Airtable Base Structure is now complete and ready for implementation. It supports both affiliate program options with automated commission calculation, partner management, and comprehensive tracking for launch.**





