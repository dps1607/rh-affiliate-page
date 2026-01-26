const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GASP Affiliate API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    leadDynoStatus: process.env.LEADDYNO_API_KEY ? 'Configured' : 'Not Configured'
  });
});

// LeadDyno submission endpoint
app.post('/api/leaddyno/submit', async (req, res) => {
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
});

// Google Sheets submission endpoint
app.post('/api/sheets/submit', async (req, res) => {
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
});

// Test endpoint
app.get('/api/hello', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hello from Express.js API!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
});

// Simple endpoint
app.get('/api/simple', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Simple endpoint working!',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'GASP Affiliate API Server',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'POST /api/leaddyno/submit',
      'POST /api/sheets/submit',
      'GET /api/hello',
      'GET /api/simple'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GASP Affiliate API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
});
