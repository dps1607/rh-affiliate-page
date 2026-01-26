// Vercel serverless function - handles multiple routes
export default function handler(req, res) {
  const { method, url } = req;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Route handling
  if (url.includes('/api/health') && method === 'GET') {
    return handleHealth(req, res);
  }

  if (url.includes('/api/leaddyno/submit') && method === 'POST') {
    return handleLeadDynoSubmit(req, res);
  }

  if (url.includes('/api/sheets/submit') && method === 'POST') {
    return handleSheetsSubmit(req, res);
  }

  // Default response
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: ['/api/health', '/api/leaddyno/submit', '/api/sheets/submit']
  });
}

// Health check handler
function handleHealth(req, res) {
  res.status(200).json({
    success: true,
    message: 'GASP Affiliate API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    leadDynoStatus: process.env.LEADDYNO_API_KEY ? 'Configured' : 'Not Configured'
  });
}

// LeadDyno submission handler
async function handleLeadDynoSubmit(req, res) {
  try {
    const { email, firstName, lastName, phone, customFields } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, firstName, lastName'
      });
    }

    // For now, just return success (LeadDyno integration pending)
    res.status(200).json({
      success: true,
      message: 'Application submitted successfully (LeadDyno integration pending)',
      data: { email, firstName, lastName, phone, customFields }
    });

  } catch (error) {
    console.error('LeadDyno submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit application',
      details: error.message
    });
  }
}

// Google Sheets submission handler
async function handleSheetsSubmit(req, res) {
  try {
    const { timestamp, applicationId, firstName, lastName, email } = req.body;

    // Validate required fields
    if (!applicationId || !firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // For now, just return success (Google Sheets integration pending)
    res.status(200).json({
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
}
