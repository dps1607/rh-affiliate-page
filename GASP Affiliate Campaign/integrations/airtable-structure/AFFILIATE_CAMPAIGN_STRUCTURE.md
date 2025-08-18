# Airtable Structure for GASP Affiliate Campaign

## Base: "GASP Affiliate Campaign"

### Table 1: Affiliates
**Purpose**: Track affiliate partners and their performance

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| Affiliate ID | Single line text | Unique identifier | AFF001 |
| Name | Single line text | Full name | John Smith |
| Email | Email | Contact email | john@example.com |
| Phone | Phone number | Contact phone | +1-555-0123 |
| Commission Type | Single select | CPL, Revenue Share, or Both | CPL |
| CPL Rate | Number | Dollars per lead | 3 |
| Revenue Share % | Number | Percentage of sales | 10 |
| Status | Single select | Active, Paused, Suspended | Active |
| Join Date | Date | When they joined | 2024-01-15 |
| Total Leads | Number | Total registrations | 45 |
| Total Sales | Number | Total course purchases | 8 |
| Total Revenue | Currency | Total sales value | $2,400 |
| Total Commissions | Currency | Total earned | $135 |
| Last Activity | Date | Last lead/sale | 2024-01-20 |
| Notes | Long text | Internal notes | High performer |

### Table 2: Leads
**Purpose**: Track all masterclass registrations and course purchases

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| Email | Email | Lead email | sarah@example.com |
| First Name | Single line text | First name | Sarah |
| Last Name | Single line text | Last name | Johnson |
| Affiliate ID | Single line text | Referring affiliate | AFF001 |
| UTM Source | Single line text | Traffic source | facebook |
| UTM Medium | Single line text | Traffic medium | social |
| UTM Campaign | Single line text | Campaign name | masterclass_launch |
| Product Type | Single select | Masterclass or Course | Masterclass |
| Amount | Currency | Sale amount (0 for masterclass) | $0 |
| Registration Date | Date | When registered | 2024-01-20 |
| Status | Single select | Registered, Attended, Purchased | Registered |
| Masterclass Date | Date | Scheduled masterclass | 2024-02-15 |
| Attended | Checkbox | Did they attend? | ☐ |
| Course Purchased | Checkbox | Did they buy course? | ☐ |
| Purchase Date | Date | When course purchased | 2024-02-20 |
| Commission Earned | Currency | Commission for affiliate | $3 |
| Notes | Long text | Internal notes | Engaged lead |

### Table 3: Commissions
**Purpose**: Track all commission calculations and payouts

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| Affiliate ID | Single line text | Affiliate identifier | AFF001 |
| Lead Email | Email | Associated lead | sarah@example.com |
| Commission Type | Single select | CPL or Revenue Share | CPL |
| Base Amount | Currency | Base commission | $3 |
| Bonus Amount | Currency | Performance bonus | $1 |
| Total Commission | Currency | Total earned | $4 |
| Status | Single select | Pending, Approved, Paid | Pending |
| Payout Period | Single select | Weekly period | Week 1 |
| Payout Date | Date | When paid | 2024-01-28 |
| Notes | Long text | Commission notes | High quality lead |

### Table 4: Payouts
**Purpose**: Track weekly payout batches

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| Payout Period | Single line text | Week identifier | Week 1 |
| Start Date | Date | Period start | 2024-01-15 |
| End Date | Date | Period end | 2024-01-21 |
| Total Commissions | Currency | Total for period | $450 |
| Affiliate Count | Number | Number of affiliates | 12 |
| Status | Single select | Pending, Processing, Paid | Pending |
| Routable Batch ID | Single line text | Routable reference | BATCH_001 |
| Payment Date | Date | When paid | 2024-01-28 |
| Notes | Long text | Payout notes | All payments successful |

### Table 5: Campaign Settings
**Purpose**: Centralized configuration

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| Setting Name | Single line text | Setting identifier | CPL_Rate |
| Value | Single line text | Setting value | 3 |
| Description | Long text | What this controls | Base CPL commission |
| Last Updated | Date | When changed | 2024-01-15 |
| Updated By | Single line text | Who changed it | Admin |

---

## Key Relationships

### Affiliates → Leads
- One affiliate can have many leads
- Link via `Affiliate ID` field

### Leads → Commissions
- One lead can generate one commission
- Link via `Lead Email` field

### Affiliates → Commissions
- One affiliate can have many commissions
- Link via `Affiliate ID` field

### Commissions → Payouts
- Multiple commissions grouped into payouts
- Link via `Payout Period` field

---

## Views

### Affiliates Table
1. **All Affiliates**: Complete list
2. **Active Affiliates**: Status = Active
3. **Top Performers**: Sorted by Total Commissions
4. **New Affiliates**: Sorted by Join Date

### Leads Table
1. **All Leads**: Complete list
2. **This Week**: Registration Date = This week
3. **By Affiliate**: Grouped by Affiliate ID
4. **High Value**: Product Type = Course
5. **Pending Follow-up**: Status = Registered

### Commissions Table
1. **All Commissions**: Complete list
2. **Pending**: Status = Pending
3. **This Period**: Payout Period = Current
4. **By Affiliate**: Grouped by Affiliate ID

### Payouts Table
1. **All Payouts**: Complete list
2. **Pending**: Status = Pending
3. **This Month**: Payout Date = This month
4. **By Status**: Grouped by Status

---

## Automation Rules

### 1. Auto-calculate Commissions
- When Lead Status changes to "Purchased"
- Calculate commission based on Affiliate settings
- Create Commission record

### 2. Weekly Payout Aggregation
- Every Monday at 9 AM
- Sum all pending commissions
- Create Payout record for previous week

### 3. Performance Alerts
- When Affiliate Total Leads > 100
- Send notification to admin
- Consider performance bonus

---

## Import/Export

### Weekly Routable Export
**Source**: Commissions table
**Filter**: Status = Pending, Payout Period = Current
**Fields**: Affiliate ID, Total Commission, Email, Notes
**Format**: CSV
**Schedule**: Every Tuesday at 8 AM

### ActiveCampaign Sync
**Source**: Leads table
**Filter**: Status = Registered, Attended = ☐
**Fields**: Email, First Name, Last Name, Affiliate ID
**Purpose**: Email sequence triggers

---

## Security & Access

### Admin Access
- Full access to all tables
- Can modify campaign settings
- Can approve/deny commissions

### Affiliate Access (Future)
- View-only access to their data
- Limited to their Affiliate ID
- Can see their performance metrics

---

## Setup Instructions

### 1. Create Base
- Go to airtable.com
- Create new base: "GASP Affiliate Campaign"
- Import this structure

### 2. Configure Fields
- Set up all custom fields
- Configure field types and options
- Set up validation rules

### 3. Create Views
- Set up all recommended views
- Configure grouping and sorting
- Set up filters for common queries

### 4. Test Integration
- Create test records
- Verify Make workflow integration
- Test commission calculations

---

## Maintenance

### Daily
- Monitor new leads
- Check for errors in Make workflows
- Review affiliate performance

### Weekly
- Process payouts
- Update performance metrics
- Clean up old records

### Monthly
- Review commission rates
- Analyze performance trends
- Optimize automation rules




