# GASP Affiliate Campaign - LeadDyno Integration Deployment Guide

## Overview
This guide walks you through deploying the custom affiliate application form with LeadDyno integration and Google Sheets approval workflow.

## Prerequisites

### 1. Domain Setup
- [ ] Domain: `drnashatlatib.com` configured and accessible
- [ ] SSL certificate installed (HTTPS required)
- [ ] DNS records configured

### 2. LeadDyno Account
- [ ] LeadDyno account created
- [ ] Affiliate program configured
- [ ] API credentials obtained
- [ ] Commission structure set up ($4-5 per registration)

### 3. Google Workspace
- [ ] Google Sheets access
- [ ] Google Cloud Project created
- [ ] Service account credentials generated

## Step-by-Step Deployment

### Phase 1: Google Sheets Setup

#### 1.1 Create Affiliate Management Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet: "GASP Affiliate Applications"
3. Create sheet named "Affiliate Applications"
4. Set up column headers:

```
A: Timestamp | B: Application ID | C: First Name | D: Last Name | E: Email | F: Phone | G: Primary Platform | H: Platform Handle | I: Follower Count | J: Audience Type | K: Engagement Rate | L: Affiliate Experience | M: Status | N: Affiliate ID | O: Approval Date | P: Notes | Q: Motivation | R: Promotion Plan | S: Audience Description | T: Additional Platforms
```

#### 1.2 Configure Google Apps Script
1. In Google Sheets, go to Extensions → Apps Script
2. Replace default code with `google-apps-script.js` from this repository
3. Update `WEBHOOK_URL` variable with your actual webhook endpoint
4. Deploy as web app:
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Copy the web app URL

#### 1.3 Set Up Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google Sheets API
4. Create service account:
   - Go to IAM & Admin → Service Accounts
   - Create service account
   - Download JSON credentials
   - Share your Google Sheet with the service account email

### Phase 2: Backend API Deployment

#### 2.1 Choose Hosting Platform
**Option A: Vercel (Recommended for simplicity)**
- Connect GitHub repository
- Set environment variables
- Auto-deploy on push

**Option B: DigitalOcean/Railway**
- Deploy Node.js app
- Set up environment variables
- Configure domain

**Option C: AWS/GCP**
- Deploy to EC2/Compute Engine
- Set up load balancer
- Configure SSL

#### 2.2 Environment Configuration
Create `.env` file with:

```bash
# Copy from env.example and fill in your values
LEADDYNO_API_KEY=your_actual_api_key
GOOGLE_SHEET_ID=your_sheet_id_from_url
GOOGLE_SHEETS_CREDENTIALS={"your":"service_account_json"}
```

#### 2.3 Deploy Backend
1. Install dependencies: `npm install`
2. Start server: `npm start`
3. Test endpoints:
   - Health check: `GET /api/health`
   - Form submission: `POST /api/sheets/submit`

### Phase 3: Frontend Integration

#### 3.1 Update Form Endpoints
In `affiliate-script.js`, update API endpoints:

```javascript
// Change from relative paths to your deployed API
const response = await fetch('https://your-api-domain.com/api/sheets/submit', {
  // ... rest of the code
});
```

#### 3.2 Deploy to Website
1. Upload files to `drnashatlatib.com/affiliate/`
2. Test form submission
3. Verify Google Sheets integration
4. Test LeadDyno webhook

### Phase 4: LeadDyno Configuration

#### 4.1 API Setup
1. In LeadDyno dashboard, go to Settings → API
2. Generate API key
3. Add to your environment variables

#### 4.2 Webhook Configuration
1. In LeadDyno, go to Settings → Webhooks
2. Add webhook URL: `https://your-api-domain.com/api/leaddyno/webhook`
3. Select events: lead.created, affiliate.created, commission.earned

#### 4.3 Affiliate Program Settings
1. Set commission structure: $4-5 per registration
2. Configure approval workflow
3. Set up email templates

## Testing & Validation

### 1. Form Submission Test
1. Fill out affiliate application form
2. Submit and verify:
   - Success message appears
   - Data appears in Google Sheets
   - LeadDyno receives webhook (if configured)

### 2. Approval Workflow Test
1. In Google Sheets, manually approve application
2. Verify:
   - Status changes to "approved"
   - Affiliate ID generated
   - Approval email sent
   - LeadDyno affiliate created

### 3. Integration Test
1. Create test affiliate in LeadDyno
2. Generate tracking link
3. Test registration flow
4. Verify commission tracking

## Monitoring & Maintenance

### 1. Error Monitoring
- Check API logs regularly
- Monitor Google Sheets for failed submissions
- Set up error alerts

### 2. Performance Monitoring
- Track form submission success rate
- Monitor API response times
- Check Google Sheets API quotas

### 3. Security Monitoring
- Review access logs
- Monitor for suspicious activity
- Keep API keys secure

## Troubleshooting

### Common Issues

#### 1. Form Submissions Not Reaching Google Sheets
- Check Google Apps Script deployment
- Verify service account permissions
- Check browser console for errors

#### 2. LeadDyno Integration Failing
- Verify API key is correct
- Check API rate limits
- Verify webhook URL is accessible

#### 3. Google Sheets Permission Errors
- Ensure service account has edit access
- Check Google Cloud project settings
- Verify API is enabled

### Debug Steps
1. Check browser developer console
2. Review API server logs
3. Test endpoints individually
4. Verify environment variables
5. Check Google Apps Script logs

## Security Considerations

### 1. API Security
- Use HTTPS for all endpoints
- Implement rate limiting
- Validate all input data
- Use environment variables for secrets

### 2. Data Protection
- Encrypt sensitive data in transit
- Limit access to Google Sheets
- Regular security audits
- GDPR compliance for EU users

### 3. Access Control
- Restrict API access to your domain
- Use strong API keys
- Monitor access logs
- Regular key rotation

## Scaling Considerations

### 1. Performance
- Implement caching for Google Sheets
- Use CDN for static assets
- Monitor API response times
- Optimize database queries

### 2. Reliability
- Set up monitoring and alerts
- Implement retry logic
- Use multiple API endpoints
- Regular backup procedures

## Support & Resources

### 1. Documentation
- [LeadDyno API Documentation](https://leaddyno.com/api-docs)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Apps Script Documentation](https://developers.google.com/apps-script)

### 2. Community
- LeadDyno support forum
- Google Cloud community
- Stack Overflow for technical issues

### 3. Contact
- Technical support: [your-email@domain.com]
- LeadDyno support: [leaddyno-support-email]
- Google Cloud support: [if applicable]

## Next Steps

After successful deployment:

1. **Monitor Performance**: Track form submissions and approval rates
2. **Optimize Workflow**: Refine approval process based on data
3. **Scale Up**: Add more automation and integrations
4. **Analytics**: Implement detailed reporting and insights
5. **A/B Testing**: Test different form variations for better conversion

---

**Need Help?** Contact the development team or refer to the troubleshooting section above.
