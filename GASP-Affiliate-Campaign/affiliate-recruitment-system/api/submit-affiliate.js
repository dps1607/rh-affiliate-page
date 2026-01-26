const LEADDYNO_ACCOUNT_NAME = process.env.LEADDYNO_ACCOUNT_NAME;
const LEADDYNO_API_KEY = process.env.LEADDYNO_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const RESEND_TO_EMAIL = process.env.RESEND_TO_EMAIL;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

function parseBody(req) {
        if (!req.body) {
                    return null;
        }
        if (typeof req.body === "string") {
                    try {
                                    return JSON.parse(req.body);
                    } catch (error) {
                                    return null;
                    }
        }
        return req.body;
}

function formatValue(value) {
        if (value === undefined || value === null || value === "") {
                    return "n/a";
        }
        return String(value);
}

async function sendResendEmail(formData) {
        const recipientSource = RESEND_TO_EMAIL || NOTIFICATION_EMAIL || "";
        if (!RESEND_API_KEY || !RESEND_FROM_EMAIL || !recipientSource) {
                    return { skipped: true };
        }

    const recipients = recipientSource.split(",").map((item) => item.trim()).filter(Boolean);
        if (recipients.length === 0) {
                    return { skipped: true };
        }

    const body = [
                "⏳ NEW AFFILIATE APPLICATION - PENDING APPROVAL",
                "",
                "APPLICATION DETAILS:",
                "==================",
                `Name: ${formatValue(formData.firstName)} ${formatValue(formData.lastName)}`,
                `Email: ${formatValue(formData.email)}`,
                `Company: ${formatValue(formData.company)}`,
                `Phone: ${formatValue(formData.phone)}`,
                "",
                "PLATFORM INFO:",
                `Primary platform: ${formatValue(formData.primaryPlatform)}`,
                `Handle/URL: ${formatValue(formData.platformHandle)}`,
                `Follower count: ${formatValue(formData.followerCount)}`,
                `Audience type: ${formatValue(formData.audienceType)}`,
                `Engagement rate: ${formatValue(formData.engagementRate)}`,
                "",
                "TRACKING & EXPERIENCE:",
                `Tracking preference: ${formatValue(formData.trackingPreference)}`,
                `Experience: ${formatValue(formData.experience)}`,
                "",
                "AUDIENCE DESCRIPTION:",
                formatValue(formData.audienceDescription),
                "",
                "MOTIVATION:",
                formatValue(formData.motivation),
                "",
                "PROMOTION STRATEGY:",
                formatValue(formData.promotionStrategy),
                "",
                "==================",
                "⚠️ This application requires approval in Slack before the affiliate is created in LeadDyno.",
                "Check the #affiliates channel to approve or reject this application."
            ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                                Authorization: `Bearer ${RESEND_API_KEY}`,
                                "Content-Type": "application/json"
                },
                body: JSON.stringify({
                                from: RESEND_FROM_EMAIL,
                                to: recipients,
                                subject: "⏳ New Affiliate Application - Pending Approval",
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

async function sendSlackNotification(formData) {
        if (!SLACK_WEBHOOK_URL) {
                    return { skipped: true };
        }

    // Encode form data as base64 for storage in button value
    const encodedData = Buffer.from(JSON.stringify(formData)).toString('base64');

    const payload = {
                blocks: [
                    {
                                        type: "header",
                                        text: {
                                                                type: "plain_text",
                                                                text: "🆕 New Affiliate Application",
                                                                emoji: true
                                        }
                    },
                    {
                                        type: "section",
                                        fields: [
                                            {
                                                                        type: "mrkdwn",
                                                                        text: `*Name:*\n${formatValue(formData.firstName)} ${formatValue(formData.lastName)}`
                                            },
                                            {
                                                                        type: "mrkdwn",
                                                                        text: `*Email:*\n${formatValue(formData.email)}`
                                            },
                                            {
                                                                        type: "mrkdwn",
                                                                        text: `*Platform:*\n${formatValue(formData.primaryPlatform)}`
                                            },
                                            {
                                                                        type: "mrkdwn",
                                                                        text: `*Handle:*\n${formatValue(formData.platformHandle)}`
                                            },
                                            {
                                                                        type: "mrkdwn",
                                                                        text: `*Followers:*\n${formatValue(formData.followerCount)}`
                                            },
                                            {
                                                                        type: "mrkdwn",
                                                                        text: `*Engagement:*\n${formatValue(formData.engagementRate)}`
                                            },
                                            {
                                                                        type: "mrkdwn",
                                                                        text: `*Tracking:*\n${formatValue(formData.trackingPreference)}`
                                            },
                                            {
                                                                        type: "mrkdwn",
                                                                        text: `*Experience:*\n${formatValue(formData.experience)}`
                                            }
                                                            ]
                    },
                    {
                                        type: "section",
                                        text: {
                                                                type: "mrkdwn",
                                                                text: `*Audience:* ${formatValue(formData.audienceType)}\n*Description:* ${formatValue(formData.audienceDescription).substring(0, 200)}...`
                                        }
                    },
                    {
                                        type: "divider"
                    },
                    {
                                        type: "actions",
                                        elements: [
                                            {
                                                                        type: "button",
                                                                        text: {
                                                                                                        type: "plain_text",
                                                                                                        text: "✅ Approve",
                                                                                                        emoji: true
                                                                        },
                                                                        style: "primary",
                                                                        value: encodedData,
                                                                        action_id: "approve_affiliate"
                                            },
                                            {
                                                                        type: "button",
                                                                        text: {
                                                                                                        type: "plain_text",
                                                                                                        text: "❌ Reject",
                                                                                                        emoji: true
                                                                        },
                                                                        style: "danger",
                                                                        value: encodedData,
                                                                        action_id: "reject_affiliate"
                                            }
                                                            ]
                    }
                            ]
    };

    const response = await fetch(SLACK_WEBHOOK_URL, {
                method: "POST",
                headers: {
                                "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
    });

    if (!response.ok) {
                const message = await response.text();
                throw new Error(`Slack error: ${response.status} ${message}`);
    }

    return { delivered: true };
}

module.exports = async (req, res) => {
        if (req.method === "OPTIONS") {
                    res.status(204).end();
                    return;
        }

        if (req.method !== "POST") {
                    res.status(405).json({ success: false, error: "Method not allowed" });
                    return;
        }

        const formData = parseBody(req);
        if (!formData || !formData.email) {
                    res.status(400).json({ success: false, error: "Invalid payload" });
                    return;
        }

        // NOTE: NO LONGER creating LeadDyno affiliate here - only after approval
        let resendResult = null;
        let slackResult = null;
        let resendError = null;
        let slackError = null;

        try {
                    resendResult = await sendResendEmail(formData);
        } catch (error) {
                    resendError = error?.message || String(error);
                    console.error("Resend notification failed:", error);
        }

        try {
                    slackResult = await sendSlackNotification(formData);
        } catch (error) {
                    slackError = error?.message || String(error);
                    console.error("Slack notification failed:", error);
        }

        // If both notification channels failed, return 500
        const notificationsFailed =
                    resendError &&
                    slackError &&
                    !(resendResult && resendResult.skipped) &&
                    !(slackResult && slackResult.skipped);

        if (notificationsFailed) {
                    res.status(500).json({
                                    success: false,
                                    error: "Notification delivery failed",
                                    resend: resendResult,
                                    slack: slackResult,
                                    errors: {
                                                        resend: resendError,
                                                        slack: slackError
                                    }
                    });
                    return;
        }

        res.status(200).json({
                    success: true,
                    pending: true,
                    message: "Application submitted and pending approval",
                    resend: resendResult,
                    slack: slackResult,
                    errors: {
                                    resend: resendError,
                                    slack: slackError
                    }
        });
};
