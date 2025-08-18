/**
 * Backend API for GASP Affiliate Campaign
 * Handles form submissions and integrates with LeadDyno and Google Sheets
 * Updated for LeadDyno Essentials plan with full API access
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { google } = require('googleapis');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['https://drnashatlatib.com', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to form submission endpoints
app.use('/api/leaddyno/submit', limiter);
app.use('/api/sheets/submit', limiter);

// LeadDyno configuration
const LEADDYNO_API_KEY = process.env.LEADDYNO_API_KEY;
const LEADDYNO_BASE_URL = 'https://api.leaddyno.com/v1';

// Google Sheets configuration
const GOOGLE_SHEETS_CREDENTIALS = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: GOOGLE_SHEETS_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * Submit affiliate application to LeadDyno
 */
app.post('/api/leaddyno/submit', async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      phone,
      customFields,
      tags,
      source
    } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, firstName, lastName'
      });
    }

    // Prepare LeadDyno payload using actual API structure
    const leadDynoPayload = {
      email,
      first_name: firstName,
      last_name: lastName,
      custom_fields: {
        phone: phone || '',
        platform: customFields?.platform || '',
        platform_handle: customFields?.platformHandle || '',
        follower_count: customFields?.followerCount || '',
        audience_type: customFields?.audienceType || '',
        engagement_rate: customFields?.engagementRate || '',
        affiliate_experience: customFields?.affiliateExperience || '',
        application_id: customFields?.applicationId || '',
        status: 'pending_approval'
      },
      affiliate_code: `APP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      override_approval: false, // Require manual approval
      unsubscribed: false
    };

    // Submit to LeadDyno API using the correct endpoint
    const leadDynoResponse = await axios.post(
      `${LEADDYNO_BASE_URL}/affiliates`,
      leadDynoPayload,
      {
        headers: {
          'Authorization': `Bearer ${LEADDYNO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          key: LEADDYNO_API_KEY
        }
      }
    );

    console.log('LeadDyno submission successful:', leadDynoResponse.data);

    res.json({
      success: true,
      message: 'Application submitted to LeadDyno successfully',
      leadDynoId: leadDynoResponse.data.id,
      affiliateCode: leadDynoResponse.data.affiliate_code
    });

  } catch (error) {
    console.error('LeadDyno submission error:', error.response?.data || error.message);
    
    // Don't fail the entire submission if LeadDyno fails
    res.json({
      success: false,
      error: 'Failed to submit to LeadDyno, but application was recorded',
      details: error.response?.data || error.message
    });
  }
});

/**
 * Submit affiliate application to Google Sheets
 */
app.post('/api/sheets/submit', async (req, res) => {
  try {
    const {
      timestamp,
      applicationId,
      firstName,
      lastName,
      email,
      phone,
      primaryPlatform,
      platformHandle,
      followerCount,
      audienceType,
      engagementRate,
      affiliateExperience,
      motivation,
      promotionPlan,
      audienceDescription,
      additionalPlatforms
    } = req.body;

    // Validate required fields
    if (!applicationId || !firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Prepare row data for Google Sheets
    const rowData = [
      timestamp || new Date().toISOString(),
      applicationId,
      firstName,
      lastName,
      email,
      phone || '',
      primaryPlatform,
      platformHandle || '',
      followerCount || '',
      audienceType,
      engagementRate,
      affiliateExperience,
      'pending', // status
      '', // affiliateId (filled in during approval)
      '', // approvalDate (filled in during approval)
      '', // notes (filled in during approval)
      motivation || '',
      promotionPlan || '',
      audienceDescription || '',
      JSON.stringify(additionalPlatforms || [])
    ];

    // Add row to Google Sheets
    const sheetsResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Affiliate Applications!A:T',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [rowData]
      }
    });

    console.log('Google Sheets submission successful:', sheetsResponse.data);

    res.json({
      success: true,
      message: 'Application submitted to Google Sheets successfully',
      sheetsId: sheetsResponse.data.updates?.updatedRange
    });

  } catch (error) {
    console.error('Google Sheets submission error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to submit to Google Sheets',
      details: error.message
    });
  }
});

/**
 * Create affiliate in LeadDyno after approval (Updated for actual API)
 */
app.post('/api/leaddyno/affiliate/create', async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      affiliateId,
      commissionRate,
      customFields,
      tags
    } = req.body;

    // Validate required fields
    if (!email || !affiliateId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, affiliateId'
      });
    }

    // Prepare affiliate creation payload using actual API structure
    const affiliatePayload = {
      email,
      first_name: firstName || '',
      last_name: lastName || '',
      affiliate_code: affiliateId,
      custom_fields: {
        ...customFields,
        platform: customFields?.platform || '',
        platform_handle: customFields?.platformHandle || '',
        follower_count: customFields?.followerCount || '',
        audience_type: customFields?.audienceType || '',
        approved_at: new Date().toISOString(),
        commission_rate: commissionRate || '10%'
      },
      override_approval: true, // Skip approval since we're manually approving
      unsubscribed: false
    };

    // Create affiliate in LeadDyno using the correct endpoint
    const affiliateResponse = await axios.post(
      `${LEADDYNO_BASE_URL}/affiliates`,
      affiliatePayload,
      {
        headers: {
          'Authorization': `Bearer ${LEADDYNO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          key: LEADDYNO_API_KEY
        }
      }
    );

    console.log('Affiliate creation successful:', affiliateResponse.data);

    res.json({
      success: true,
      message: 'Affiliate created in LeadDyno successfully',
      affiliateId: affiliateResponse.data.affiliate_code,
      leadDynoId: affiliateResponse.data.id,
      affiliateUrl: affiliateResponse.data.affiliate_url,
      dashboardUrl: affiliateResponse.data.affiliate_dashboard_url
    });

  } catch (error) {
    console.error('Affiliate creation error:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to create affiliate in LeadDyno',
      details: error.response?.data || error.message
    });
  }
});

/**
 * Get affiliate information from LeadDyno
 */
app.get('/api/leaddyno/affiliate/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const response = await axios.get(
      `${LEADDYNO_BASE_URL}/affiliates`,
      {
        headers: {
          'Authorization': `Bearer ${LEADDYNO_API_KEY}`,
        },
        params: {
          key: LEADDYNO_API_KEY,
          email: email
        }
      }
    );

    res.json({
      success: true,
      affiliate: response.data
    });

  } catch (error) {
    console.error('Error fetching affiliate:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch affiliate information',
      details: error.response?.data || error.message
    });
  }
});

/**
 * Update affiliate status in LeadDyno
 */
app.put('/api/leaddyno/affiliate/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const response = await axios.put(
      `${LEADDYNO_BASE_URL}/affiliates/${id}`,
      {
        custom_fields: {
          status: status,
          notes: notes,
          updated_at: new Date().toISOString()
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${LEADDYNO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          key: LEADDYNO_API_KEY
        }
      }
    );

    res.json({
      success: true,
      message: 'Affiliate status updated successfully',
      affiliate: response.data
    });

  } catch (error) {
    console.error('Error updating affiliate status:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to update affiliate status',
      details: error.response?.data || error.message
    });
  }
});

/**
 * Webhook endpoint for LeadDyno events
 */
app.post('/api/leaddyno/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;

    console.log('LeadDyno webhook received:', { event, data });

    // Handle different webhook events
    switch (event) {
      case 'affiliate.created':
        console.log('New affiliate created:', data);
        // Update Google Sheets with LeadDyno affiliate ID
        await updateGoogleSheetsWithLeadDynoId(data);
        break;
      
      case 'commission.earned':
        console.log('Commission earned:', data);
        // Update commission tracking in Google Sheets
        await updateCommissionTracking(data);
        break;
      
      default:
        console.log('Unhandled webhook event:', event);
    }

    res.json({ success: true, message: 'Webhook processed' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Update Google Sheets with LeadDyno affiliate ID
 */
async function updateGoogleSheetsWithLeadDynoId(affiliateData) {
  try {
    // Find the row in Google Sheets by email
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Affiliate Applications!A:T'
    });

    const rows = response.data.values;
    const emailColumnIndex = 4; // Column E (0-indexed)
    
    for (let i = 1; i < rows.length; i++) { // Skip header row
      if (rows[i][emailColumnIndex] === affiliateData.email) {
        // Update the affiliate ID column (N)
        await sheets.spreadsheets.values.update({
          spreadsheetId: GOOGLE_SHEET_ID,
          range: `Affiliate Applications!N${i + 1}`,
          valueInputOption: 'RAW',
          resource: {
            values: [[affiliateData.affiliate_code]]
          }
        });
        break;
      }
    }
  } catch (error) {
    console.error('Error updating Google Sheets:', error);
  }
}

/**
 * Update commission tracking in Google Sheets
 */
async function updateCommissionTracking(commissionData) {
  // Implementation for tracking commissions
  console.log('Commission tracking update:', commissionData);
}

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GASP Affiliate API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    leadDynoStatus: LEADDYNO_API_KEY ? 'Configured' : 'Not Configured',
    googleSheetsStatus: GOOGLE_SHEET_ID ? 'Configured' : 'Not Configured'
  });
});

/**
 * Error handling middleware
 */
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

/**
 * 404 handler
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`GASP Affiliate API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`LeadDyno API: ${LEADDYNO_API_KEY ? 'Configured' : 'Not Configured'}`);
  console.log(`Google Sheets: ${GOOGLE_SHEET_ID ? 'Configured' : 'Not Configured'}`);
});

module.exports = app;
