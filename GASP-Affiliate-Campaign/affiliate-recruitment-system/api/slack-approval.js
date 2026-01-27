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

    if (!crypto.timingSafeEqual(Buffer.from(mySignature, 'utf8'), Buffer.from(slackSignature, 'utf8'))) {
                    return false;
    }

    return true;
}

// Create LeadDyno affiliate
async function createLeadDynoAffiliate(formData) {
            const response = await fetch("https://api.leaddyno.com/v1/affiliates", {
                            method: "POST",
                                headers: {
                                                        "Content-Type": "application/x-www-form-urlencoded"
                                },
                            body: `key=${LEADDYNO_API_KEY}&email=${encodeURIComponent(formData.email)}&first_name=${encodeURIComponent(formData.firstName)}&last_name=${encodeURIComponent(formData.lastName)}`
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

// Send welcome email
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
                    "We're excited to work with you!",
                    "",
                    "Best regards,",
                    "The Team"
                ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${RESEND_API_KEY}`
                    },
                    body: JSON.stringify({
                                        from: RESEND_FROM_EMAIL,
                                        to: [formData.email],
                                        subject: "🎉 Your affiliate application has been approved!",
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

// Send rejection email
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
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${RESEND_API_KEY}`
                    },
                    body: JSON.stringify({
                                        from: RESEND_FROM_EMAIL,
                                        to: [formData.email],
                                        subject: "Re: Your affiliate application",
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
                                    }
                }
            } catch (error) {
                            res.status(400).json({ success: false, error: "Failed to decode application data" });
                            return;
            }

            if (!payload || !payload.actions || !payload.actions[0]) {
                            res.status(400).json({ success: false, error: "Invalid Slack payload" });
                            return;
            }

            /*
            if (!verifySlackRequest(req)) {
                res.status(401).json({ success: false, error: "Invalid Slack signature" });
                return;
            }
            */

            // Slack sends interactive payload with specific structure
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

            // Process the approval/rejection synchronously
            try {
                            let updateText;

                if (actionId === "approve_affiliate") {
                                    const leadDynoResult = await createLeadDynoAffiliate(formData);
                                    const emailResult = await sendWelcomeEmail(formData);

                                updateText = `✅ *APPROVED* by <@${payload.user.id}>\n\n*Affiliate:* ${formData.firstName} ${formData.lastName} (${formData.email})\n*LeadDyno:* ${leadDynoResult.affiliate ? 'Created' : leadDynoResult.existing ? 'Already exists' : 'Failed'}\n*Welcome Email:* ${emailResult.skipped ? 'Skipped' : emailResult.messageId ? 'Sent' : 'Failed'}`;
                } else if (actionId === "reject_affiliate") {
                                    const emailResult = await sendRejectionEmail(formData);

                                updateText = `❌ *REJECTED* by <@${payload.user.id}>\n\n*Affiliate:* ${formData.firstName} ${formData.lastName} (${formData.email})\n*Rejection Email:* ${emailResult.skipped ? 'Skipped' : emailResult.messageId ? 'Sent' : 'Failed'}`;
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

                // Respond to Slack
                res.status(200).json({
                                    response_type: "in_channel",
                                    replace_original: true,
                                    text: updateText
                });

            } catch (error) {
                            console.error("Processing error:", error);

                // Try to send error message to Slack
                const errorText = `❌ Error: ${error.message}`;
                            if (payload.response_url) {
                                                try {
                                                                        await fetch(payload.response_url, {
                                                                                                    method: 'POST',
                                                                                                    headers: { 'Content-Type': 'application/json' },
                                                                                                    body: JSON.stringify({
                                                                                                                                    replace_original: false,
                                                                                                                                    text: errorText
                                                                                                            })
                                                                        });
                                                } catch (fetchError) {
                                                                        console.error("Failed to send error to Slack:", fetchError);
                                                }
                            }

                res.status(500).json({ success: false, error: error.message });
            }
};
