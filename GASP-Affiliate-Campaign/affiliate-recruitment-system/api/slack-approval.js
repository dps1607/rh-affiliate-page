const crypto = require('crypto');

const LEADDYNO_API_KEY = process.env.LEADDYNO_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

// Verify Slack request signature
function verifySlackRequest(req) {
        if (!SLACK_SIGNING_SECRET) {
                  console.warn('SLACK_SIGNING_SECRET not set, skipping verification');
                  return true; // Skip verification if secret not set (for testing)
        }

  const timestamp = req.headers['x-slack-request-timestamp'];
        const slackSignature = req.headers['x-slack-signature'];

  if (!timestamp || !slackSignature) {
            return false;
  }

  // Prevent replay attacks (timestamp should be within 5 minutes)
  const time = Math.floor(new Date().getTime() / 1000);
        if (Math.abs(time - timestamp) > 300) {
                  return false;
        }

  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        const sigBasestring = `v0:${timestamp}:${body}`;
        const mySignature = 'v0=' + crypto
          .createHmac('sha256', SLACK_SIGNING_SECRET)
          .update(sigBasestring)
          .digest('hex');

  return crypto.timingSafeEqual(
            Buffer.from(mySignature, 'utf8'),
            Buffer.from(slackSignature, 'utf8')
          );
}

async function createLeadDynoAffiliate(formData) {
        if (!LEADDYNO_API_KEY) {
                  return { skipped: true };
        }

  const response = await fetch("https://api.leaddyno.com/v1/affiliates", {
            method: "POST",
            headers: {
                        "Content-Type": "application/json"
            },
            body: JSON.stringify({
                        key: LEADDYNO_API_KEY,
                        email: formData.email,
                        first_name: formData.firstName,
                        last_name: formData.lastName
            })
  });

  if (response.status === 409) {
            return { existing: true };
  }

  if (!response.ok) {
            const message = await response.text();
            throw new Error(`LeadDyno error: ${response.status} ${message}`);
  }

  const data = await response.json();
        const affiliate = (data && data.affiliate) ? data.affiliate : data;
        return { affiliate: affiliate || null };
}

async function sendWelcomeEmail(formData) {
        if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
                  return { skipped: true };
        }

  const body = [
            `Hi ${formData.firstName},`,
            "",
            "🎉 Congratulations! Your affiliate application has been approved!",
            "",
            "Welcome to our affiliate program. You'll receive your affiliate dashboard login details shortly.",
            "",
            "If you have any questions, feel free to reach out.",
            "",
            "Best regards,",
            "The Team"
          ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                        Authorization: `Bearer ${RESEND_API_KEY}`,
                        "Content-Type": "application/json"
            },
            body: JSON.stringify({
                        from: RESEND_FROM_EMAIL,
                        to: [formData.email],
                        subject: "✅ Your Affiliate Application Has Been Approved!",
                        text: body
            })
  });

  if (!response.ok) {
            const message = await response.text();
            throw new Error(`Resend error: ${response.status} ${message}`);
  }

  const data = await response.json();
        return { messageId: data.id || null };
}

async function sendRejectionEmail(formData) {
        if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
                  return { skipped: true };
        }

  const body = [
            `Hi ${formData.firstName},`,
            "",
            "Thank you for your interest in our affiliate program.",
            "",
            "After reviewing your application, we've decided not to move forward at this time.",
            "",
            "We appreciate your interest and wish you the best.",
            "",
            "Best regards,",
            "The Team"
          ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                        Authorization: `Bearer ${RESEND_API_KEY}`,
                        "Content-Type": "application/json"
            },
            body: JSON.stringify({
                        from: RESEND_FROM_EMAIL,
                        to: [formData.email],
                        subject: "Regarding Your Affiliate Application",
                        text: body
            })
  });

  if (!response.ok) {
            const message = await response.text();
            throw new Error(`Resend error: ${response.status} ${message}`);
  }

  const data = await response.json();
        return { messageId: data.id || null };
}

module.exports = async (req, res) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Slack-Request-Timestamp, X-Slack-Signature');

        if (req.method === "OPTIONS") {
                  res.status(200).end();
                  return;
        }

        if (req.method !== "POST") {
                  res.status(405).json({ success: false, error: "Method not allowed" });
                  return;
        }

        // Parse the payload from Slack
        let payload;
        try {
                  // Slack sends the payload as application/x-www-form-urlencoded with a "payload" field
          if (req.body && typeof req.body === 'object' && req.body.payload) {
                      payload = typeof req.body.payload === 'string' 
                      ? JSON.parse(req.body.payload) 
                                    : req.body.payload;
          } else if (typeof req.body === 'string') {
                      // Try to parse URL-encoded format
                    const params = new URLSearchParams(req.body);
                      const payloadStr = params.get('payload');
                      if (payloadStr) {
                                    payload = JSON.parse(payloadStr);
                      } else {
                                    payload = JSON.parse(req.body);
                      }
          } else {
                      payload = req.body;
          }
        } catch (error) {
                  console.error('Payload parsing error:', error);
                  res.status(400).json({ success: false, error: "Invalid JSON" });
                  return;
        }

        // Verify the request is from Slack
        // Note: Commented out for now since it requires raw body access
        // Uncomment and configure when you have SLACK_SIGNING_SECRET set
        /*
        if (!verifySlackRequest(req)) {
          res.status(401).json({ success: false, error: "Invalid Slack signature" });
          return;
        }
        */

        // Slack sends interactive payload with specific structure
        if (!payload || !payload.actions || !payload.actions[0]) {
                  res.status(400).json({ success: false, error: "Invalid Slack payload" });
                  return;
        }

        const action = payload.actions[0];
        const actionId = action.action_id;
        const encodedData = action.value;

        // Decode the form data
        let formData;
        try {
                  const decodedData = Buffer.from(encodedData, 'base64').toString('utf-8');
                  formData = JSON.parse(decodedData);
        } catch (error) {
                  res.status(400).json({ success: false, error: "Failed to decode application data" });
                  return;
        }

        // Immediately acknowledge receipt to Slack (within 3 seconds)
        res.status(200).json({
                  response_type: "in_channel",
                  replace_original: false,
                  text: `Processing ${actionId === "approve_affiliate" ? "approval" : "rejection"}...`
        });

        // Process in background (don't await)
        (async () => {
                  try {
                              let updateText;

                    if (actionId === "approve_affiliate") {
                                  const leadDynoResult = await createLeadDynoAffiliate(formData);
                                  const emailResult = await sendWelcomeEmail(formData);

                                updateText = `✅ *APPROVED* by <@${payload.user.id}>\n\nAffiliate: ${formData.firstName} ${formData.lastName} (${formData.email})\nLeadDyno: ${leadDynoResult.affiliate ? 'Created' : leadDynoResult.existing ? 'Already exists' : 'Skipped'}\nWelcome Email: ${emailResult.skipped ? 'Skipped' : 'Sent'}`;
                    } else if (actionId === "reject_affiliate") {
                                  const emailResult = await sendRejectionEmail(formData);

                                updateText = `❌ *REJECTED* by <@${payload.user.id}>\n\nAffiliate: ${formData.firstName} ${formData.lastName} (${formData.email})\nRejection Email: ${emailResult.skipped ? 'Skipped' : 'Sent'}`;
                    }

                    // Update the original message using response_url
                    if (payload.response_url && updateText) {
                                  await fetch(payload.response_url, {
                                                  method: 'POST',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({
                                                                    replace_original: true,
                                                                    text: updateText
                                                  })
                                  });
                    }
                  } catch (error) {
                              console.error("Background processing error:", error);

                    // Try to send error message to Slack
                    if (payload.response_url) {
                                  await fetch(payload.response_url, {
                                                  method: 'POST',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({
                                                                    replace_original: false,
                                                                    text: `❌ Error: ${error.message}`
                                                  })
                                  });
                    }
                  }
        })();
};
