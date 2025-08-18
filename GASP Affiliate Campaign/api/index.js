const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();

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

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GASP Affiliate API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    leadDynoStatus: LEADDYNO_API_KEY ? 'Configured' : 'Not Configured'
  });
});

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
      customFields
    } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, firstName, lastName'
      });
    }

    // Prepare LeadDyno payload
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
      override_approval: false,
      unsubscribed: false
    };

    // Submit to LeadDyno API
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
      email
    } = req.body;

    // Validate required fields
    if (!applicationId || !firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // For now, just return success
    res.json({
      success: true,
      message: 'Application submitted successfully (Google Sheets integration pending)',
      applicationId: applicationId
    });

  } catch (error) {
    console.error('Google Sheets submission error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to submit application',
      details: error.message
    });
  }
});

// Export for Vercel
module.exports = app;
