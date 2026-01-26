/**
 * Google Apps Script for GASP Affiliate Campaign
 * Handles affiliate application submissions and approval workflow
 * Enhanced for LeadDyno API integration
 */

// Configuration
const SHEET_NAME = 'Affiliate Applications';
const API_BASE_URL = 'https://your-api-domain.com'; // Update with your actual API domain

/**
 * Main function to handle POST requests from the affiliate form
 */
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!validateApplicationData(data)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Add the application to Google Sheets
    const result = addApplicationToSheet(data);
    
    // Submit to LeadDyno API via our backend
    const leadDynoResult = submitToLeadDynoAPI(data);
    
    // Send email notification
    sendNotificationEmail(data);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      applicationId: data.applicationId,
      message: 'Application submitted successfully',
      leadDynoStatus: leadDynoResult.success ? 'Submitted' : 'Failed'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error processing application:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Internal server error'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Validate required application data
 */
function validateApplicationData(data) {
  const required = [
    'firstName', 'lastName', 'email', 'primaryPlatform', 
    'audienceType', 'engagementRate', 'affiliateExperience'
  ];
  
  return required.every(field => data[field] && data[field].trim() !== '');
}

/**
 * Add application to Google Sheets
 */
function addApplicationToSheet(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    throw new Error('Affiliate Applications sheet not found');
  }
  
  // Prepare row data
  const rowData = [
    data.timestamp || new Date().toISOString(),
    data.applicationId,
    data.firstName,
    data.lastName,
    data.email,
    data.phone || '',
    data.primaryPlatform,
    data.platformHandle || '',
    data.followerCount || '',
    data.audienceType,
    data.engagementRate,
    data.affiliateExperience,
    'pending', // status
    '', // affiliateId (filled in during approval)
    '', // approvalDate (filled in during approval)
    '', // notes (filled in during approval)
    data.motivation || '',
    data.promotionPlan || '',
    data.audienceDescription || '',
    JSON.stringify(data.additionalPlatforms || [])
  ];
  
  // Add the row
  sheet.appendRow(rowData);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, rowData.length);
  
  return true;
}

/**
 * Submit to LeadDyno API via our backend
 */
function submitToLeadDynoAPI(data) {
  try {
    const payload = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      customFields: {
        platform: data.primaryPlatform,
        platformHandle: data.platformHandle,
        followerCount: data.followerCount,
        audienceType: data.audienceType,
        engagementRate: data.engagementRate,
        affiliateExperience: data.affiliateExperience,
        applicationId: data.applicationId,
        status: 'pending_approval'
      }
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(`${API_BASE_URL}/api/leaddyno/submit`, options);
    const result = JSON.parse(response.getContentText());
    
    return result;
    
  } catch (error) {
    console.error('Error submitting to LeadDyno API:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Function to approve an affiliate application
 * This is called manually from the sheet or via a menu item
 */
function approveAffiliate(rowIndex) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const row = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Generate affiliate ID
  const affiliateId = generateAffiliateId();
  
  // Update status and affiliate ID
  sheet.getRange(rowIndex, 14).setValue(affiliateId); // Affiliate ID column
  sheet.getRange(rowIndex, 13).setValue('approved'); // Status column
  sheet.getRange(rowIndex, 15).setValue(new Date().toISOString()); // Approval date
  
  // Create affiliate in LeadDyno via API
  const leadDynoResult = createLeadDynoAffiliate(row, affiliateId);
  
  // Send approval notification
  sendApprovalNotification(row[3], row[4], row[2], affiliateId, leadDynoResult);
  
  return affiliateId;
}

/**
 * Create affiliate in LeadDyno via API
 */
function createLeadDynoAffiliate(rowData, affiliateId) {
  try {
    const payload = {
      email: rowData[4], // Email column
      firstName: rowData[2], // First Name column
      lastName: rowData[3], // Last Name column
      affiliateId: affiliateId,
      customFields: {
        platform: rowData[6], // Primary Platform column
        platformHandle: rowData[7], // Platform Handle column
        followerCount: rowData[8], // Follower Count column
        audienceType: rowData[9], // Audience Type column
        engagementRate: rowData[10], // Engagement Rate column
        affiliateExperience: rowData[11] // Affiliate Experience column
      }
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(`${API_BASE_URL}/api/leaddyno/affiliate/create`, options);
    const result = JSON.parse(response.getContentText());
    
    return result;
    
  } catch (error) {
    console.error('Error creating LeadDyno affiliate:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Function to reject an affiliate application
 */
function rejectAffiliate(rowIndex, reason) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  // Update status
  sheet.getRange(rowIndex, 13).setValue('rejected'); // Status column
  sheet.getRange(rowIndex, 15).setValue(new Date().toISOString()); // Date column
  sheet.getRange(rowIndex, 16).setValue(reason); // Notes column
  
  // Send rejection notification
  const row = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  sendRejectionNotification(row[3], row[4], row[2], reason);
  
  return true;
}

/**
 * Generate unique affiliate ID
 */
function generateAffiliateId() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const affiliateIds = sheet.getRange(2, 14, sheet.getLastRow() - 1, 1).getValues();
  
  let nextNumber = 1;
  affiliateIds.forEach(row => {
    if (row[0] && row[0].toString().startsWith('AFF-')) {
      const num = parseInt(row[0].toString().replace('AFF-', ''));
      if (num >= nextNumber) {
        nextNumber = num + 1;
      }
    }
  });
  
  return `AFF-${nextNumber.toString().padStart(3, '0')}`;
}

/**
 * Send approval notification email
 */
function sendApprovalNotification(firstName, lastName, email, affiliateId, leadDynoResult) {
  const subject = '🎉 Your Affiliate Application Has Been Approved!';
  
  let body = `
    Dear ${firstName} ${lastName},
    
    Congratulations! Your application to join Dr. Nashat Latib's affiliate program has been approved.
    
    Your Affiliate ID: ${affiliateId}
  `;
  
  // Add LeadDyno information if available
  if (leadDynoResult.success) {
    body += `
    
    LeadDyno Integration:
    - Affiliate Code: ${leadDynoResult.affiliateId}
    - Dashboard: ${leadDynoResult.dashboardUrl || 'Available in LeadDyno'}
    - Tracking Link: ${leadDynoResult.affiliateUrl || 'Will be provided'}
    `;
  }
  
  body += `
    
    Next Steps:
    1. You'll receive access to your affiliate dashboard within 24 hours
    2. Check your email for promotional materials and tracking links
    3. Start promoting the Get & Stay Pregnant Naturally Masterclass
    
    If you have any questions, please contact us at affiliates@drnashatlatib.com
    
    Best regards,
    The Dr. Nashat Latib Team
  `;
  
  try {
    MailApp.sendEmail(email, subject, body);
  } catch (error) {
    console.error('Error sending approval email:', error);
  }
}

/**
 * Send rejection notification email
 */
function sendRejectionNotification(firstName, lastName, email, reason) {
  const subject = 'Update on Your Affiliate Application';
  const body = `
    Dear ${firstName} ${lastName},
    
    Thank you for your interest in joining Dr. Nashat Latib's affiliate program.
    
    After careful review, we regret to inform you that we are unable to approve your application at this time.
    
    Reason: ${reason}
    
    We encourage you to:
    - Continue building your audience and engagement
    - Reapply in 3-6 months if your circumstances change
    - Consider other partnership opportunities with us
    
    If you have any questions, please contact us at affiliates@drnashatlatib.com
    
    Best regards,
    The Dr. Nashat Latib Team
  `;
  
  try {
    MailApp.sendEmail(email, subject, body);
  } catch (error) {
    console.error('Error sending rejection email:', error);
  }
}

/**
 * Send notification email when application submitted
 */
function sendNotificationEmail(data) {
  const subject = 'New Affiliate Application Submitted';
  const body = `
    New affiliate application received:
    
    Name: ${data.firstName} ${data.lastName}
    Email: ${data.email}
    Platform: ${data.primaryPlatform}
    Followers: ${data.followerCount}
    Application ID: ${data.applicationId}
    
    Review in Google Sheets: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}
  `;
  
  try {
    MailApp.sendEmail('your-email@domain.com', subject, body); // Update with your email
  } catch (error) {
    console.error('Email notification failed:', error);
  }
}

/**
 * Create custom menu for manual operations
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Affiliate Management')
    .addItem('Approve Selected Application', 'approveSelectedApplication')
    .addItem('Reject Selected Application', 'rejectSelectedApplication')
    .addSeparator()
    .addItem('Generate Monthly Report', 'generateMonthlyReport')
    .addItem('Sync with LeadDyno', 'syncWithLeadDyno')
    .addToUi();
}

/**
 * Approve selected application (helper function)
 */
function approveSelectedApplication() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    'Approve Affiliate Application',
    'Enter the row number of the application to approve:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result.getSelectedButton() === ui.Button.OK) {
    const rowIndex = parseInt(result.getResponseText());
    if (rowIndex && rowIndex > 1) {
      try {
        const affiliateId = approveAffiliate(rowIndex);
        ui.alert('Success', `Affiliate approved with ID: ${affiliateId}`, ui.ButtonSet.OK);
      } catch (error) {
        ui.alert('Error', `Failed to approve affiliate: ${error.message}`, ui.ButtonSet.OK);
      }
    } else {
      ui.alert('Error', 'Please enter a valid row number (greater than 1)', ui.ButtonSet.OK);
    }
  }
}

/**
 * Reject selected application (helper function)
 */
function rejectSelectedApplication() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    'Reject Affiliate Application',
    'Enter the row number of the application to reject:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result.getSelectedButton() === ui.Button.OK) {
    const rowIndex = parseInt(result.getResponseText());
    if (rowIndex && rowIndex > 1) {
      const reasonResult = ui.prompt(
        'Rejection Reason',
        'Please provide a reason for rejection:',
        ui.ButtonSet.OK_CANCEL
      );
      
      if (reasonResult.getSelectedButton() === ui.Button.OK) {
        try {
          rejectAffiliate(rowIndex, reasonResult.getResponseText());
          ui.alert('Success', 'Affiliate application rejected', ui.ButtonSet.OK);
        } catch (error) {
          ui.alert('Error', `Failed to reject affiliate: ${error.message}`, ui.ButtonSet.OK);
        }
      }
    } else {
      ui.alert('Error', 'Please enter a valid row number (greater than 1)', ui.ButtonSet.OK);
    }
  }
}

/**
 * Sync approved affiliates with LeadDyno
 */
function syncWithLeadDyno() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  let syncedCount = 0;
  let errorCount = 0;
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[12]; // Status column
    const affiliateId = row[13]; // Affiliate ID column
    const email = row[4]; // Email column
    
    if (status === 'approved' && affiliateId && !row[20]) { // Check if not already synced
      try {
        const result = createLeadDynoAffiliate(row, affiliateId);
        if (result.success) {
          // Mark as synced
          sheet.getRange(i + 1, 21).setValue('Synced with LeadDyno');
          syncedCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
        console.error(`Error syncing row ${i + 1}:`, error);
      }
    }
  }
  
  ui.alert('Sync Complete', `Synced: ${syncedCount}, Errors: ${errorCount}`, ui.ButtonSet.OK);
}

/**
 * Generate monthly report
 */
function generateMonthlyReport() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  // Skip header row
  const applications = data.slice(1);
  
  // Filter for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyApplications = applications.filter(row => {
    const date = new Date(row[0]);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  // Calculate statistics
  const total = monthlyApplications.length;
  const approved = monthlyApplications.filter(row => row[12] === 'approved').length;
  const rejected = monthlyApplications.filter(row => row[12] === 'rejected').length;
  const pending = monthlyApplications.filter(row => row[12] === 'pending').length;
  
  const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0;
  
  // Create report
  const report = `
    Monthly Affiliate Application Report
    ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
    
    Total Applications: ${total}
    Approved: ${approved}
    Rejected: ${rejected}
    Pending: ${pending}
    Approval Rate: ${approvalRate}%
    
    Platform Breakdown:
    ${getPlatformBreakdown(monthlyApplications)}
  `;
  
  // Display report
  const ui = SpreadsheetApp.getUi();
  ui.alert('Monthly Report', report, ui.ButtonSet.OK);
}

/**
 * Get platform breakdown for reporting
 */
function getPlatformBreakdown(applications) {
  const platforms = {};
  
  applications.forEach(row => {
    const platform = row[6]; // Primary platform column
    if (platform) {
      platforms[platform] = (platforms[platform] || 0) + 1;
    }
  });
  
  return Object.entries(platforms)
    .map(([platform, count]) => `${platform}: ${count}`)
    .join('\n');
}
