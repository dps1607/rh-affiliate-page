# LeadDyno Integration for GASP Affiliate Campaign

## Overview
This integration connects the custom affiliate application form with LeadDyno's affiliate management system, enabling automated lead capture and manual approval workflows.

## Architecture

### 1. Form Submission Flow
```
Affiliate Application Form → LeadDyno API → Google Sheets → Manual Approval → LeadDyno Affiliate Creation
```

### 2. Key Components
- **Custom Opt-in Page**: `drnashatlatib.com/affiliate`
- **LeadDyno API**: Lead capture and affiliate management
- **Google Sheets**: Manual approval workflow and affiliate ID management
- **Webhook Endpoints**: Real-time updates and automation

## LeadDyno API Integration

### API Endpoints
- **Lead Creation**: `/api/leaddyno/submit`
- **Affiliate Creation**: `/api/leaddyno/affiliate/create`
- **Webhook Handler**: `/api/leaddyno/webhook`

### Lead Data Structure
```json
{
  "email": "affiliate@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "customFields": {
    "platform": "instagram",
    "platformHandle": "@johndoe",
    "followerCount": "50000",
    "audienceType": "fertility",
    "engagementRate": "3-5",
    "affiliateExperience": "intermediate",
    "applicationId": "APP-12345-ABC",
    "status": "pending_approval"
  },
  "tags": ["affiliate-application", "pending-approval"],
  "source": "affiliate-application-form"
}
```

### Affiliate Creation Data
```json
{
  "email": "affiliate@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "affiliateId": "AFF-001",
  "commissionRate": 0.10,
  "customFields": {
    "platform": "instagram",
    "platformHandle": "@johndoe",
    "followerCount": "50000",
    "audienceType": "fertility"
  },
  "tags": ["approved", "instagram", "fertility"]
}
```

## Google Sheets Integration

### Sheet Structure
| Column | Description | Example |
|--------|-------------|---------|
| A | Timestamp | 2025-01-15 10:30:00 |
| B | Application ID | APP-12345-ABC |
| C | First Name | John |
| D | Last Name | Doe |
| E | Email | john@example.com |
| F | Phone | +1234567890 |
| G | Primary Platform | instagram |
| H | Platform Handle | @johndoe |
| I | Follower Count | 50000 |
| J | Audience Type | fertility |
| K | Engagement Rate | 3-5 |
| L | Affiliate Experience | intermediate |
| M | Status | pending/approved/rejected |
| N | Affiliate ID | AFF-001 |
| O | Approval Date | 2025-01-16 |
| P | Notes | Great audience fit |

### Approval Workflow
1. **Application Submitted** → Status: "pending"
2. **Manual Review** → Evaluate fit and quality
3. **Approval Decision** → Status: "approved" or "rejected"
4. **Affiliate ID Assignment** → Generate unique ID (AFF-001, AFF-002, etc.)
5. **LeadDyno Integration** → Create affiliate account
6. **Welcome Sequence** → Send onboarding materials

## Implementation Steps

### 1. LeadDyno Setup
- [ ] Create LeadDyno account
- [ ] Configure affiliate program settings
- [ ] Set up commission structure ($4-5 per registration)
- [ ] Configure webhook endpoints
- [ ] Test API credentials

### 2. Google Sheets Setup
- [ ] Create affiliate management sheet
- [ ] Set up column headers and formatting
- [ ] Configure Google Apps Script for API access
- [ ] Test data submission

### 3. Backend API Development
- [ ] Create `/api/leaddyno/submit` endpoint
- [ ] Create `/api/sheets/submit` endpoint
- [ ] Implement error handling and validation
- [ ] Add security measures (rate limiting, validation)

### 4. Frontend Integration
- [ ] Update form submission handler
- [ ] Add loading states and success messages
- [ ] Implement error handling
- [ ] Add Google Analytics tracking

### 5. Testing & Deployment
- [ ] Test form submission flow
- [ ] Verify LeadDyno integration
- [ ] Test Google Sheets submission
- [ ] Deploy to production

## Security Considerations

### API Security
- Rate limiting on form submissions
- Input validation and sanitization
- CORS configuration
- API key management

### Data Protection
- PII encryption in transit and at rest
- Access logging for all API calls
- GDPR compliance for EU applicants

## Monitoring & Analytics

### Key Metrics
- Application submission rate
- Approval rate by platform/audience type
- Time to approval
- LeadDyno sync success rate

### Error Tracking
- Form submission failures
- API integration errors
- Data validation issues

## Troubleshooting

### Common Issues
1. **LeadDyno API failures**: Check API credentials and rate limits
2. **Google Sheets errors**: Verify Apps Script permissions
3. **Form validation issues**: Check required field validation
4. **CORS errors**: Verify domain configuration

### Debug Tools
- Browser developer console
- Network tab for API calls
- LeadDyno dashboard logs
- Google Apps Script logs

## Future Enhancements

### Automation Opportunities
- Automated initial screening based on criteria
- Email sequence automation for different applicant types
- Performance tracking and reporting
- A/B testing for application form optimization

### Integration Expansion
- CRM integration (ActiveCampaign, HubSpot)
- Social media verification APIs
- Background check services
- Payment processing integration
